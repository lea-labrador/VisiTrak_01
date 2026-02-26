import { useEffect } from "react";
import { syncPendingVisitActions } from "../lib/visits.service";
import { syncPendingFeedbacks } from "../lib/feedbacks.service";

const SYNC_INTERVAL_MS = 60 * 1000;

export const useOfflineSync = () => {
  useEffect(() => {
    let isMounted = true;

    const runSync = async () => {
      try {
        await syncPendingVisitActions();
        await syncPendingFeedbacks();
      } catch (error) {
        if (isMounted) {
          console.log("Offline sync skipped:", error?.message || error);
        }
      }
    };

    runSync();
    const intervalId = setInterval(runSync, SYNC_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);
};
