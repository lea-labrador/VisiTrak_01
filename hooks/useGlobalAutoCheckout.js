import { useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { autoCheckoutActiveVisits } from "../lib/visits.service";

const AUTO_CHECKOUT_KEY = "AUTO_CHECKOUT_LAST_RUN_V2";
const AUTO_CHECKOUT_RETRY_MS = 5 * 60 * 1000;
const MANILA_UTC_OFFSET_MINUTES = 8 * 60;

const getManilaClock = (date = new Date()) => {
  const shifted = new Date(
    date.getTime() + MANILA_UTC_OFFSET_MINUTES * 60 * 1000
  );

  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");

  return {
    year,
    month: Number(month),
    day: Number(day),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    dateKey: `${year}-${month}-${day}`,
  };
};

export const useGlobalAutoCheckout = () => {
  useEffect(() => {
    let isMounted = true;
    let isRunning = false;
    let timeoutId = null;

    const clearScheduledRun = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const getNextRunDelayMs = () => {
      const now = new Date();
      const manilaNow = getManilaClock(now);
      const offsetMs = MANILA_UTC_OFFSET_MINUTES * 60 * 1000;

      const isPast730 =
        manilaNow.hour > 19 ||
        (manilaNow.hour === 19 && manilaNow.minute >= 30);

      const targetDay = isPast730 ? manilaNow.day + 1 : manilaNow.day;
      const targetUtcMs =
        Date.UTC(manilaNow.year, manilaNow.month - 1, targetDay, 19, 30) -
        offsetMs;

      return Math.max(0, targetUtcMs - now.getTime());
    };

    const runAutoCheckout = async () => {
      if (isRunning) return false;
      isRunning = true;

      try {
        const manilaNow = getManilaClock();

        const isPast730 =
          manilaNow.hour > 19 ||
          (manilaNow.hour === 19 && manilaNow.minute >= 30);

        if (!isPast730) return false;

        const lastRun = await AsyncStorage.getItem(AUTO_CHECKOUT_KEY);
        if (lastRun === manilaNow.dateKey) return false;

        const { count, shouldMarkComplete } = await autoCheckoutActiveVisits();

        if (!isMounted) return false;
        if (shouldMarkComplete) {
          await AsyncStorage.setItem(AUTO_CHECKOUT_KEY, manilaNow.dateKey);
        }

        if (count > 0) {
          console.log(`Auto-checked out ${count} visit(s)`);
        }

        return !shouldMarkComplete;
      } catch (error) {
        if (isMounted) {
          console.log("Auto-checkout skipped:", error?.message || error);
        }
        return true;
      } finally {
        isRunning = false;
      }
    };

    const scheduleNextRun = (delayOverrideMs = null) => {
      clearScheduledRun();
      const delayMs = delayOverrideMs ?? getNextRunDelayMs();
      timeoutId = setTimeout(async () => {
        const shouldRetrySoon = await runAutoCheckout();
        if (isMounted) {
          scheduleNextRun(shouldRetrySoon ? AUTO_CHECKOUT_RETRY_MS : null);
        }
      }, delayMs);
    };

    const handleAppActive = async () => {
      const shouldRetrySoon = await runAutoCheckout();
      if (!isMounted) return;
      scheduleNextRun(shouldRetrySoon ? AUTO_CHECKOUT_RETRY_MS : null);
    };

    void handleAppActive();

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") {
          void handleAppActive();
        } else {
          clearScheduledRun();
        }
      }
    );

    return () => {
      isMounted = false;
      clearScheduledRun();
      appStateSubscription.remove();
    };
  }, []);
};
