// feedbacks.service.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

const feedbacksCollection = collection(db, "feedbacks");

const FEEDBACKS_CACHE_KEY = "@visitrak/feedbacks_cache_v1";
const PENDING_FEEDBACKS_KEY = "@visitrak/pending_feedbacks_v1";
const FIRESTORE_TIMEOUT_MS = 8000;

const isClientOffline = () =>
  typeof navigator !== "undefined" &&
  typeof navigator.onLine === "boolean" &&
  navigator.onLine === false;

const isConnectivityError = (error) => {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();

  return (
    code.includes("unavailable") ||
    code.includes("network") ||
    code.includes("deadline") ||
    message.includes("network") ||
    message.includes("offline") ||
    message.includes("timed out") ||
    message.includes("timeout")
  );
};

const withTimeout = async (promiseFactory, timeoutMs = FIRESTORE_TIMEOUT_MS) => {
  let timeoutId;

  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Firestore request timed out"));
      }, timeoutMs);
    });

    return await Promise.race([promiseFactory(), timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const toIsoDateOrNull = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
};

const toDateOrNull = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const readJson = async (key, fallbackValue) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallbackValue;
    const parsed = JSON.parse(raw);
    return parsed ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const writeJson = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore cache write failures.
  }
};

const serializeFeedback = (feedback) => ({
  ...feedback,
  createdAt: toIsoDateOrNull(feedback.createdAt),
});

const hydrateFeedback = (feedback) => ({
  ...feedback,
  createdAt: toDateOrNull(feedback.createdAt),
});

const loadCachedFeedbacks = async () => {
  const cached = await readJson(FEEDBACKS_CACHE_KEY, []);
  if (!Array.isArray(cached)) return [];
  return cached.map(hydrateFeedback);
};

const saveCachedFeedbacks = async (feedbacks) => {
  await writeJson(FEEDBACKS_CACHE_KEY, feedbacks.map(serializeFeedback));
};

const loadPendingFeedbacks = async () => {
  const pending = await readJson(PENDING_FEEDBACKS_KEY, []);
  return Array.isArray(pending) ? pending : [];
};

const savePendingFeedbacks = async (pending) => {
  await writeJson(PENDING_FEEDBACKS_KEY, pending);
};

const upsertCachedFeedback = async (feedback) => {
  const cached = await loadCachedFeedbacks();
  const index = cached.findIndex((item) => item.id === feedback.id);

  if (index >= 0) {
    cached[index] = { ...cached[index], ...feedback };
  } else {
    cached.unshift(feedback);
  }

  await saveCachedFeedbacks(cached);
};

const removeCachedFeedbackById = async (feedbackId) => {
  const cached = await loadCachedFeedbacks();
  const next = cached.filter((feedback) => feedback.id !== feedbackId);
  await saveCachedFeedbacks(next);
};

const normalizeFeedbackDoc = (docSnap) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || null,
  };
};

const makeLocalId = () =>
  `local_feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const isLocalVisitId = (visitId) =>
  String(visitId || "").trim().startsWith("local_");

const removeUndefinedDeep = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedDeep(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, childValue]) => {
      const cleanedValue = removeUndefinedDeep(childValue);
      if (cleanedValue !== undefined) {
        acc[key] = cleanedValue;
      }
      return acc;
    }, {});
  }

  return value;
};

const sanitizeFeedback = (feedback) => {
  if (!feedback.visitId || !feedback.name || !feedback.answers) {
    throw new Error("Missing required fields: visitId, name, or answers.");
  }

  if (
    typeof feedback.answers !== "object" ||
    Object.keys(feedback.answers).length === 0
  ) {
    throw new Error("Answers must be a non-empty object");
  }

  const answers = {};
  Object.entries(feedback.answers).forEach(([key, value]) => {
    answers[String(key)] = Number(value);
  });

  const values = Object.values(answers);
  const averageRating =
    values.length > 0
      ? values.reduce((sum, value) => sum + Number(value), 0) / values.length
      : 0;

  const rawComment =
    feedback.comment !== undefined && feedback.comment !== null
      ? feedback.comment
      : feedback.suggestion;

  const surveyDetails = removeUndefinedDeep(feedback.surveyDetails || {});
  const mergedSuggestion =
    feedback.suggestion ?? surveyDetails.suggestion ?? rawComment ?? "";
  const mergedCommendation =
    feedback.commendation ?? surveyDetails.commendation ?? "";

  return {
    visitId: String(feedback.visitId),
    name: String(feedback.name),
    answers,
    averageRating,
    rating: averageRating,
    suggestion: String(mergedSuggestion),
    commendation: String(mergedCommendation),
    comment: String(rawComment || mergedSuggestion || ""),
    surveyDetails,
  };
};

const applyFeedbackToVisit = async (visitId, feedbackData) => {
  const resolvedVisitId = String(visitId || "").trim();
  if (!resolvedVisitId || isLocalVisitId(resolvedVisitId)) {
    return false;
  }

  await withTimeout(() =>
    updateDoc(doc(db, "visits", resolvedVisitId), {
      rating: Number(feedbackData.rating || 0),
      comment: String(feedbackData.comment || ""),
      feedbackUpdatedAt: serverTimestamp(),
    })
  );

  return true;
};

export const syncPendingFeedbacks = async () => {
  if (isClientOffline()) return 0;

  const pending = await loadPendingFeedbacks();
  if (pending.length === 0) return 0;

  const remaining = [];
  let syncedCount = 0;

  for (let index = 0; index < pending.length; index += 1) {
    const item = pending[index];

    try {
      const feedbackData = item.feedbackData || {};
      const visitId = String(feedbackData.visitId || "").trim();

      // Wait until local visit IDs are mapped to real Firestore IDs.
      if (isLocalVisitId(visitId)) {
        remaining.push(item);
        continue;
      }

      const payload = {
        ...feedbackData,
        createdAt: serverTimestamp(),
      };

      await applyFeedbackToVisit(visitId, feedbackData);
      const docRef = await withTimeout(() => addDoc(feedbacksCollection, payload));

      await removeCachedFeedbackById(item.localId);
      await upsertCachedFeedback({
        id: docRef.id,
        ...feedbackData,
        createdAt: new Date(),
        pendingSync: false,
      });

      syncedCount += 1;
    } catch (error) {
      if (isConnectivityError(error)) {
        remaining.push(item, ...pending.slice(index + 1));
        break;
      }

      remaining.push(item);
    }
  }

  await savePendingFeedbacks(remaining);
  return syncedCount;
};

/**
 * Add feedback linked to a visit
 */
export const addFeedback = async (feedback) => {
  try {
    const feedbackData = sanitizeFeedback(feedback);
    const visitId = String(feedbackData.visitId || "").trim();
    const canWriteOnline = !isLocalVisitId(visitId) && !isClientOffline();

    if (canWriteOnline) {
      try {
        const docRef = await withTimeout(() =>
          addDoc(feedbacksCollection, {
            ...feedbackData,
            createdAt: serverTimestamp(),
          })
        );
        await applyFeedbackToVisit(visitId, feedbackData);

        const onlineFeedback = {
          id: docRef.id,
          ...feedbackData,
          createdAt: new Date(),
          pendingSync: false,
        };

        await upsertCachedFeedback(onlineFeedback);
        return onlineFeedback;
      } catch (error) {
        if (!isConnectivityError(error)) {
          throw error;
        }
      }
    }

    const localFeedback = {
      id: makeLocalId(),
      ...feedbackData,
      createdAt: new Date(),
      pendingSync: true,
    };

    await upsertCachedFeedback(localFeedback);

    const pending = await loadPendingFeedbacks();
    pending.push({
      localId: localFeedback.id,
      feedbackData,
      queuedAt: new Date().toISOString(),
    });
    await savePendingFeedbacks(pending);

    return localFeedback;
  } catch (error) {
    console.error("Error adding feedback:", error);
    throw error;
  }
};

/**
 * Fetch all feedbacks, optionally filtered by visitId
 */
export const fetchFeedbacks = async (visitId = null) => {
  try {
    if (!isClientOffline()) {
      const q = visitId
        ? query(
            feedbacksCollection,
            where("visitId", "==", String(visitId)),
            orderBy("createdAt", "desc")
          )
        : query(feedbacksCollection, orderBy("createdAt", "desc"));

      const snapshot = await withTimeout(() => getDocs(q));
      const feedbacks = snapshot.docs.map(normalizeFeedbackDoc);

      if (!visitId) {
        await saveCachedFeedbacks(feedbacks);
      } else {
        const cached = await loadCachedFeedbacks();
        const merged = [...feedbacks, ...cached.filter((item) => item.visitId !== String(visitId))];
        await saveCachedFeedbacks(merged);
      }

      return feedbacks;
    }
  } catch (error) {
    if (!isConnectivityError(error)) {
      console.error("Error fetching feedbacks:", error);
    }
  }

  const cached = await loadCachedFeedbacks();
  if (!visitId) return cached;
  return cached.filter((feedback) => String(feedback.visitId) === String(visitId));
};

/**
 * Subscribe to real-time feedbacks
 */
export const subscribeFeedbacks = (callback, visitId = null) => {
  let isActive = true;

  loadCachedFeedbacks().then((cached) => {
    if (!isActive) return;
    const filtered = visitId
      ? cached.filter((feedback) => String(feedback.visitId) === String(visitId))
      : cached;
    if (filtered.length > 0) callback(filtered);
  });

  const q = visitId
    ? query(
        feedbacksCollection,
        where("visitId", "==", String(visitId)),
        orderBy("createdAt", "desc")
      )
    : query(feedbacksCollection, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const feedbacks = snapshot.docs.map(normalizeFeedbackDoc);

      if (!visitId) {
        await saveCachedFeedbacks(feedbacks);
      } else {
        const cached = await loadCachedFeedbacks();
        const merged = [...feedbacks, ...cached.filter((item) => item.visitId !== String(visitId))];
        await saveCachedFeedbacks(merged);
      }

      callback(feedbacks);
    },
    async () => {
      const cached = await loadCachedFeedbacks();
      const filtered = visitId
        ? cached.filter((feedback) => String(feedback.visitId) === String(visitId))
        : cached;
      callback(filtered);
    }
  );

  return () => {
    isActive = false;
    unsubscribe();
  };
};

/**
 * Calculate average rating across multiple feedbacks
 */
export const calculateAverageRating = (feedbacks) => {
  if (!feedbacks.length) return 0;
  const total = feedbacks.reduce((sum, feedback) => sum + (feedback.averageRating || 0), 0);
  return total / feedbacks.length;
};
