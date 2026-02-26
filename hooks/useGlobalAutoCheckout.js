import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { autoCheckoutActiveVisits } from "../lib/visits.service";

const AUTO_CHECKOUT_KEY = "AUTO_CHECKOUT_LAST_RUN_V2";
const MANILA_UTC_OFFSET_MINUTES = 8 * 60;

const getManilaClock = (date = new Date()) => {
  const shifted = new Date(
    date.getTime() + MANILA_UTC_OFFSET_MINUTES * 60 * 1000
  );

  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");

  return {
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    dateKey: `${year}-${month}-${day}`,
  };
};

export const useGlobalAutoCheckout = () => {
  useEffect(() => {
    let isMounted = true;

    const runAutoCheckout = async () => {
      try {
        const manilaNow = getManilaClock();

        const isPast730 =
          manilaNow.hour > 19 ||
          (manilaNow.hour === 19 && manilaNow.minute >= 30);

        if (!isPast730) return;

        const lastRun = await AsyncStorage.getItem(AUTO_CHECKOUT_KEY);
        if (lastRun === manilaNow.dateKey) return;

        const count = await autoCheckoutActiveVisits();

        if (!isMounted) return;
        await AsyncStorage.setItem(AUTO_CHECKOUT_KEY, manilaNow.dateKey);

        if (count > 0) {
          console.log(`Auto-checked out ${count} visit(s)`);
        }
      } catch (error) {
        if (isMounted) {
          console.log("Auto-checkout skipped:", error?.message || error);
        }
      }
    };

    runAutoCheckout();
    const interval = setInterval(runAutoCheckout, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
};
