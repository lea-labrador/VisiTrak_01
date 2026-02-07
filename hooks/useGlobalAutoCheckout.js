import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { autoCheckoutActiveVisits } from "../lib/visits.service";

const AUTO_CHECKOUT_KEY = "AUTO_CHECKOUT_LAST_RUN";

export const useGlobalAutoCheckout = () => {
  useEffect(() => {
    const runAutoCheckout = async () => {
      const now = new Date();

      // ⏰ After 7:30 PM
      const isPast730 =
        now.getHours() > 7 ||
        (now.getHours() === 7 && now.getMinutes() >= 30);

      if (!isPast730) return;

      const today = now.toDateString();
      const lastRun = await AsyncStorage.getItem(AUTO_CHECKOUT_KEY);

      // 🔒 Run only once per day
      if (lastRun === today) return;

      const count = await autoCheckoutActiveVisits();
      await AsyncStorage.setItem(AUTO_CHECKOUT_KEY, today);

      if (count > 0) {
        console.log(`🚪 Auto-checked out ${count} visit(s)`);
      }
    };

    // Run on app start
    runAutoCheckout();

    // Keep checking while app is open
    const interval = setInterval(runAutoCheckout, 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
