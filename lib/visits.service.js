// lib/visits.service.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

const visitsCollection = collection(db, "visits");

const VISITS_CACHE_KEY = "@visitrak/visits_cache_v1";
const PENDING_VISIT_CHECKINS_KEY = "@visitrak/pending_visit_checkins_v1";
const PENDING_VISIT_CHECKOUTS_KEY = "@visitrak/pending_visit_checkouts_v1";
const PENDING_FEEDBACKS_KEY = "@visitrak/pending_feedbacks_v1";
const FIRESTORE_TIMEOUT_MS = 8000;
const FIRESTORE_PROBE_TIMEOUT_MS = 3000;

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

const canReachFirestoreServer = async (
  timeoutMs = FIRESTORE_PROBE_TIMEOUT_MS
) => {
  if (isClientOffline()) return false;

  try {
    const probeQuery = query(visitsCollection, limit(1));
    const snapshot = await withTimeout(() => getDocs(probeQuery), timeoutMs);
    return snapshot?.metadata?.fromCache !== true;
  } catch {
    return false;
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

const serializeVisit = (visit) => ({
  ...visit,
  createdAt: toIsoDateOrNull(visit.createdAt),
  checkInTime: toIsoDateOrNull(visit.checkInTime),
  checkOutTime: toIsoDateOrNull(visit.checkOutTime),
});

const hydrateVisit = (visit) => ({
  ...visit,
  createdAt: toDateOrNull(visit.createdAt),
  checkInTime: toDateOrNull(visit.checkInTime),
  checkOutTime: toDateOrNull(visit.checkOutTime),
});

const loadCachedVisits = async () => {
  const cached = await readJson(VISITS_CACHE_KEY, []);
  if (!Array.isArray(cached)) return [];
  return cached.map(hydrateVisit);
};

const saveCachedVisits = async (visits) => {
  await writeJson(VISITS_CACHE_KEY, visits.map(serializeVisit));
};

const loadPendingCheckins = async () => {
  const pending = await readJson(PENDING_VISIT_CHECKINS_KEY, []);
  return Array.isArray(pending) ? pending : [];
};

const savePendingCheckins = async (pending) => {
  await writeJson(PENDING_VISIT_CHECKINS_KEY, pending);
};

const loadPendingCheckouts = async () => {
  const pending = await readJson(PENDING_VISIT_CHECKOUTS_KEY, []);
  return Array.isArray(pending) ? pending : [];
};

const savePendingCheckouts = async (pending) => {
  await writeJson(PENDING_VISIT_CHECKOUTS_KEY, pending);
};

const replacePendingCheckoutLocalVisitId = async (oldLocalId, newVisitId) => {
  if (!oldLocalId || !newVisitId) return;

  const pending = await loadPendingCheckouts();
  let changed = false;

  const next = pending.map((item) => {
    if (String(item?.localVisitId || "") !== String(oldLocalId)) {
      return item;
    }

    changed = true;
    return {
      ...item,
      localVisitId: newVisitId,
    };
  });

  if (changed) {
    await savePendingCheckouts(next);
  }
};

const replacePendingFeedbackVisitId = async (oldLocalId, newVisitId) => {
  if (!oldLocalId || !newVisitId) return;

  const pending = await readJson(PENDING_FEEDBACKS_KEY, []);
  if (!Array.isArray(pending) || pending.length === 0) return;

  let changed = false;
  const next = pending.map((item) => {
    const currentVisitId = String(item?.feedbackData?.visitId || "").trim();
    if (currentVisitId !== String(oldLocalId)) {
      return item;
    }

    changed = true;
    return {
      ...item,
      feedbackData: {
        ...(item.feedbackData || {}),
        visitId: String(newVisitId),
      },
    };
  });

  if (changed) {
    await writeJson(PENDING_FEEDBACKS_KEY, next);
  }
};

const normalizeName = (name) => String(name || "").trim().toUpperCase();

const sameOffice = (a, b) =>
  String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

const isActiveVisit = (visit) => !visit?.checkOutTime;
const getNameParts = (name) =>
  normalizeName(name)
    .split(/\s+/)
    .filter(Boolean);

const hasPossibleSameVisitorName = (candidateName, targetName) => {
  const candidateParts = getNameParts(candidateName);
  const targetParts = getNameParts(targetName);

  if (candidateParts.length < 2 || targetParts.length < 2) return false;
  if (candidateParts.join(" ") === targetParts.join(" ")) return false;

  const candidateFirst = candidateParts[0];
  const targetFirst = targetParts[0];
  const candidateLast = candidateParts[candidateParts.length - 1];
  const targetLast = targetParts[targetParts.length - 1];

  return candidateFirst === targetFirst && candidateLast === targetLast;
};

const getVisitSortTime = (visit) => {
  const value = visit?.checkInTime || visit?.createdAt;
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value || 0);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const isVisitCoveredByPendingCheckout = (visit, pendingCheckouts) => {
  if (!visit || !Array.isArray(pendingCheckouts) || pendingCheckouts.length === 0) {
    return false;
  }

  return pendingCheckouts.some((item) => {
    if (!item) return false;

    const pendingLocalId = String(item.localVisitId || "").trim();
    if (pendingLocalId) {
      return pendingLocalId === String(visit.id);
    }

    if (normalizeName(item.name) !== normalizeName(visit.name)) {
      return false;
    }

    // If pending checkout has no office, treat it as checkout by name.
    if (!item.office) return true;
    return sameOffice(item.office, visit.office);
  });
};

const isSamePendingCheckoutEntry = (a, b) => {
  const aId = String(a?.localVisitId || "").trim();
  const bId = String(b?.localVisitId || "").trim();

  if (aId && bId) {
    return aId === bId;
  }

  if (normalizeName(a?.name) !== normalizeName(b?.name)) {
    return false;
  }

  if (!a?.office || !b?.office) {
    return true;
  }

  return sameOffice(a.office, b.office);
};

const upsertPendingCheckoutEntry = (pending, entry) => {
  const index = pending.findIndex((item) => isSamePendingCheckoutEntry(item, entry));
  if (index >= 0) {
    pending[index] = { ...pending[index], ...entry };
    return pending;
  }

  pending.push(entry);
  return pending;
};

const normalizeVisitDoc = (docSnap) => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || null,
    checkInTime: data.checkInTime?.toDate?.() || null,
    checkOutTime: data.checkOutTime?.toDate?.() || null,
  };
};

const upsertCachedVisit = async (visit) => {
  const cached = await loadCachedVisits();
  const index = cached.findIndex((item) => item.id === visit.id);

  if (index >= 0) {
    cached[index] = { ...cached[index], ...visit };
  } else {
    cached.unshift(visit);
  }

  await saveCachedVisits(cached);
};

const removeCachedVisitById = async (visitId) => {
  const cached = await loadCachedVisits();
  const next = cached.filter((visit) => visit.id !== visitId);
  await saveCachedVisits(next);
};

const updateCachedVisitById = async (visitId, updater) => {
  const cached = await loadCachedVisits();
  const next = cached.map((visit) =>
    visit.id === visitId ? updater(visit) : visit
  );
  await saveCachedVisits(next);
};

const getActiveVisitFromCache = async (name, office = null) => {
  const targetName = normalizeName(name);
  const cached = await loadCachedVisits();
  const pendingCheckouts = await loadPendingCheckouts();

  const active = cached.find((visit) => {
    if (!isActiveVisit(visit)) return false;
    if (isVisitCoveredByPendingCheckout(visit, pendingCheckouts)) return false;
    if (normalizeName(visit.name) !== targetName) return false;
    if (!office) return true;
    return sameOffice(visit.office, office);
  });

  return active || null;
};

const buildVisitPayload = (visit) => ({
  name: visit.name,
  address: visit.address,
  office: visit.office,
  purpose: visit.purpose,
  contactNumber: visit.contactNumber,
  email: visit.email,
  staffName: visit.staffName,
  rating: Number(visit.rating || 0),
  comment: String(visit.comment || ""),
  status: "checked-in",
  autoCheckedOut: false,
  checkInSource: "online",
});

const getNewLocalId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const filterVisitsByOptions = (visits, filters = {}) => {
  if (!filters.office) return visits;
  return visits.filter((visit) => sameOffice(visit.office, filters.office));
};

const queryActiveVisitByName = async (name, office = null) => {
  const constraints = [
    where("name", "==", name),
    where("checkOutTime", "==", null),
    limit(1),
  ];

  if (office) {
    constraints.splice(2, 0, where("office", "==", office));
  }

  const q = query(visitsCollection, ...constraints);
  const snapshot = await withTimeout(() => getDocs(q));

  // Avoid treating stale cached results as authoritative.
  if (snapshot?.metadata?.fromCache === true) return null;
  if (snapshot.empty) return null;
  return normalizeVisitDoc(snapshot.docs[0]);
};

const queryAllActiveVisits = async () => {
  const q = query(visitsCollection, where("checkOutTime", "==", null));
  const snapshot = await withTimeout(() => getDocs(q));

  // Avoid treating stale cached results as authoritative.
  if (snapshot?.metadata?.fromCache === true) return null;
  return snapshot.docs.map(normalizeVisitDoc);
};

const syncPendingVisitCheckins = async () => {
  if (!(await canReachFirestoreServer())) return 0;

  const pending = await loadPendingCheckins();
  if (pending.length === 0) return 0;

  const remaining = [];
  let syncedCount = 0;

  for (let index = 0; index < pending.length; index += 1) {
    const item = pending[index];

    try {
      const duplicate = await queryActiveVisitByName(item.visitData.name);
      if (duplicate) {
        await replacePendingCheckoutLocalVisitId(item.localId, duplicate.id);
        await replacePendingFeedbackVisitId(item.localId, duplicate.id);
        await removeCachedVisitById(item.localId);
        await upsertCachedVisit({
          ...duplicate,
          pendingSync: false,
        });
        syncedCount += 1;
        continue;
      }

      const payload = {
        ...item.visitData,
        checkInSource: "offline",
        status: "checked-in",
        autoCheckedOut: false,
        checkInTime: serverTimestamp(),
        checkOutTime: null,
        createdAt: serverTimestamp(),
      };

      const docRef = await withTimeout(() => addDoc(visitsCollection, payload));
      await replacePendingCheckoutLocalVisitId(item.localId, docRef.id);
      await replacePendingFeedbackVisitId(item.localId, docRef.id);

      await removeCachedVisitById(item.localId);
      await upsertCachedVisit({
        id: docRef.id,
        ...item.visitData,
        checkInSource: "offline",
        status: "checked-in",
        autoCheckedOut: false,
        checkInTime: new Date(),
        checkOutTime: null,
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

  await savePendingCheckins(remaining);
  return syncedCount;
};

const syncPendingVisitCheckouts = async () => {
  if (!(await canReachFirestoreServer())) return 0;

  const pending = await loadPendingCheckouts();
  if (pending.length === 0) return 0;

  const pendingCheckins = await loadPendingCheckins();
  const remaining = [];
  let syncedCount = 0;

  for (let index = 0; index < pending.length; index += 1) {
    const item = pending[index];

    try {
      let activeVisit = null;
      const localVisitId = String(item.localVisitId || "").trim();
      const hasExplicitVisitId = localVisitId.length > 0;

      if (!hasExplicitVisitId) {
        // Legacy pending checkout entries without visit ID are unsafe to resolve
        // by name because they can close a different active visit.
        syncedCount += 1;
        continue;
      }

      if (hasExplicitVisitId && !localVisitId.startsWith("local_")) {
        const visitDoc = await withTimeout(() =>
          getDoc(doc(db, "visits", localVisitId))
        );

        if (visitDoc.exists()) {
          const visitData = normalizeVisitDoc(visitDoc);
          if (!visitData.checkOutTime) {
            activeVisit = visitData;
          } else {
            syncedCount += 1;
            continue;
          }
        }
      }

      if (!activeVisit) {
        const hasUnsyncedCheckin = pendingCheckins.some((checkin) => {
          if (String(checkin.localId || "").trim() === localVisitId) {
            return true;
          }

          return (
            normalizeName(checkin.visitData?.name) === normalizeName(item.name) &&
            (!item.office || sameOffice(checkin.visitData?.office, item.office))
          );
        });

        if (hasUnsyncedCheckin) {
          remaining.push(item);
          continue;
        }

        syncedCount += 1;
        continue;
      }

      await withTimeout(() =>
        updateDoc(doc(db, "visits", activeVisit.id), {
          checkOutTime: serverTimestamp(),
          status: "checked-out",
          autoCheckedOut: Boolean(item.autoCheckedOut),
        })
      );

      await updateCachedVisitById(activeVisit.id, (visit) => ({
        ...visit,
        checkOutTime: new Date(),
        status: "checked-out",
        autoCheckedOut: Boolean(item.autoCheckedOut),
        pendingSync: false,
      }));

      if (item.localVisitId && String(item.localVisitId).startsWith("local_")) {
        await removeCachedVisitById(item.localVisitId);
      }

      syncedCount += 1;
    } catch (error) {
      if (isConnectivityError(error)) {
        remaining.push(item, ...pending.slice(index + 1));
        break;
      }

      remaining.push(item);
    }
  }

  await savePendingCheckouts(remaining);
  return syncedCount;
};

export const syncPendingVisitActions = async () => {
  const syncedCheckins = await syncPendingVisitCheckins();
  const syncedCheckouts = await syncPendingVisitCheckouts();

  return {
    syncedCheckins,
    syncedCheckouts,
    syncedTotal: syncedCheckins + syncedCheckouts,
  };
};

/**
 * Check if visitor is still checked-in (duplicate prevention)
 */
export const checkActiveVisitByName = async (name) => {
  try {
    if (!name || name.trim() === "") return null;

    const trimmedName = name.trim();
    const pendingCheckouts = await loadPendingCheckouts();

    if (!isClientOffline()) {
      try {
        const onlineVisit = await queryActiveVisitByName(trimmedName);
        if (
          onlineVisit &&
          !isVisitCoveredByPendingCheckout(onlineVisit, pendingCheckouts)
        ) {
          await upsertCachedVisit(onlineVisit);
          return onlineVisit;
        }
      } catch (error) {
        if (!isConnectivityError(error)) {
          console.error("Error checking active visit online:", error);
        }
      }
    }

    const cachedVisit = await getActiveVisitFromCache(trimmedName);
    return cachedVisit || null;
  } catch (error) {
    console.error("Error checking active visit:", error);
    return null;
  }
};

/**
 * Check if visitor is checked-in today (client-side filter)
 */
export const checkActiveVisitByNameToday = async (name) => {
  const activeVisit = await checkActiveVisitByName(name);
  if (!activeVisit) return null;

  const checkInTime = activeVisit.checkInTime || activeVisit.createdAt;
  if (!checkInTime) return activeVisit;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfNextDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  return checkInTime >= startOfDay && checkInTime < startOfNextDay
    ? activeVisit
    : null;
};

/**
 * Add a visitor log (with duplicate prevention)
 */
export const addVisit = async (visit) => {
  try {
    if (!visit.name || !visit.office || !visit.purpose) {
      throw new Error("Missing required fields.");
    }

    const trimmedName = visit.name.trim();

    await syncPendingVisitActions();

    const existingVisit = await checkActiveVisitByNameToday(trimmedName);
    if (existingVisit) {
      throw new Error(`⚠️ ${trimmedName} is already checked in.`);
    }

    const visitData = buildVisitPayload({
      name: trimmedName,
      address: (visit.address || "").trim(),
      office: visit.office.trim(),
      purpose: visit.purpose.trim(),
      contactNumber: (visit.contactNumber || "").trim(),
      email: (visit.email || "").trim().toLowerCase(),
      staffName: (visit.staffName || "").trim(),
      rating: visit.rating,
      comment: visit.comment,
    });

    if (await canReachFirestoreServer()) {
      try {
        const docRef = await withTimeout(() =>
          addDoc(visitsCollection, {
            ...visitData,
            checkInTime: serverTimestamp(),
            checkOutTime: null,
            createdAt: serverTimestamp(),
          })
        );

        const onlineVisit = {
          id: docRef.id,
          ...visitData,
          checkInTime: new Date(),
          checkOutTime: null,
          createdAt: new Date(),
          pendingSync: false,
        };

        await upsertCachedVisit(onlineVisit);
        return onlineVisit;
      } catch (error) {
        if (!isConnectivityError(error)) {
          throw error;
        }
      }
    }

    const offlineVisitData = {
      ...visitData,
      checkInSource: "offline",
    };

    const localVisit = {
      id: getNewLocalId("local_visit"),
      ...offlineVisitData,
      checkInTime: new Date(),
      checkOutTime: null,
      createdAt: new Date(),
      pendingSync: true,
    };

    await upsertCachedVisit(localVisit);

    const pendingCheckins = await loadPendingCheckins();
    pendingCheckins.push({
      localId: localVisit.id,
      visitData: offlineVisitData,
      queuedAt: new Date().toISOString(),
    });
    await savePendingCheckins(pendingCheckins);

    return localVisit;
  } catch (error) {
    console.error("Error adding visit:", error?.message || error);
    throw error;
  }
};

/**
 * Manual checkout by name (optional office filter)
 */
export const setCheckOutTimeByName = async (name, office = null) => {
  try {
    const trimmedName = String(name || "").trim();
    if (!trimmedName) {
      throw new Error("Name is required");
    }

    await syncPendingVisitActions();

    if (!isClientOffline()) {
      try {
        const activeVisit = await queryActiveVisitByName(trimmedName, office);

        if (activeVisit) {
          await withTimeout(() =>
            updateDoc(doc(db, "visits", activeVisit.id), {
              checkOutTime: serverTimestamp(),
              status: "checked-out",
            })
          );

          await updateCachedVisitById(activeVisit.id, (visitData) => ({
            ...visitData,
            checkOutTime: new Date(),
            status: "checked-out",
            pendingSync: false,
          }));

          return activeVisit.id;
        }
      } catch (error) {
        if (!isConnectivityError(error)) {
          throw error;
        }
      }
    }

    const cachedActiveVisit = await getActiveVisitFromCache(trimmedName, office);
    if (!cachedActiveVisit) {
      throw new Error(`No active visit found for ${trimmedName}`);
    }

    const checkoutTime = new Date();
    await updateCachedVisitById(cachedActiveVisit.id, (visitData) => ({
      ...visitData,
      checkOutTime: checkoutTime,
      status: "checked-out",
      pendingSync: true,
    }));

    const pendingCheckouts = await loadPendingCheckouts();
    upsertPendingCheckoutEntry(pendingCheckouts, {
      name: trimmedName,
      office: office ? office.trim() : null,
      localVisitId: cachedActiveVisit.id,
      queuedAt: checkoutTime.toISOString(),
      autoCheckedOut: false,
    });
    await savePendingCheckouts(pendingCheckouts);

    return cachedActiveVisit.id;
  } catch (error) {
    console.error("Checkout error:", error);
    throw error;
  }
};

/**
 * Real-time visits subscription
 */
export const subscribeVisits = (callback) => {
  let isActive = true;

  loadCachedVisits().then((cachedVisits) => {
    if (isActive && cachedVisits.length > 0) {
      callback(cachedVisits);
    }
  });

  const q = query(visitsCollection);

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const visits = snapshot.docs.map(normalizeVisitDoc);
      await saveCachedVisits(visits);
      callback(visits);
    },
    async () => {
      const cachedVisits = await loadCachedVisits();
      callback(cachedVisits);
    }
  );

  return () => {
    isActive = false;
    unsubscribe();
  };
};

/**
 * Fetch visits with optional filters
 */
export const fetchVisits = async (filters = {}) => {
  try {
    const constraints = [];

    if (filters.office) {
      constraints.push(where("office", "==", filters.office.trim()));
    }

    const q = query(visitsCollection, ...constraints);
    const snapshot = await withTimeout(() => getDocs(q));

    const visits = snapshot.docs.map(normalizeVisitDoc);

    if (!filters.office) {
      await saveCachedVisits(visits);
    }

    return visits;
  } catch (error) {
    if (!isConnectivityError(error)) {
      console.error("Fetch visits error:", error);
    }

    const cachedVisits = await loadCachedVisits();
    return filterVisitsByOptions(cachedVisits, filters);
  }
};

/**
 * Get all active visits
 */
export const getActiveVisits = async () => {
  const visits = await fetchVisits();
  return visits.filter((visit) => !visit.checkOutTime);
};
/**
 * Find the most recent visitor whose name looks similar, such as
 * "LEA LABRADOR" and "LEA SHEILA LABRADOR".
 */
export const findPossibleVisitorByName = async (name) => {
  const targetName = String(name || "").trim();
  if (targetName.length < 3) return null;

  const visits = await fetchVisits();
  const matches = visits
    .filter((visit) => hasPossibleSameVisitorName(visit?.name, targetName))
    .sort((a, b) => getVisitSortTime(b) - getVisitSortTime(a));

  return matches[0] || null;
};

/**
 * Update visit (safe fields only)
 */
export const updateVisit = async (visitId, updates) => {
  const { id, createdAt, checkInTime, checkOutTime, ...allowed } = updates;

  if (!isClientOffline()) {
    try {
      await withTimeout(() => updateDoc(doc(db, "visits", visitId), allowed));
      await updateCachedVisitById(visitId, (visitData) => ({
        ...visitData,
        ...allowed,
        pendingSync: false,
      }));
      return visitId;
    } catch (error) {
      if (!isConnectivityError(error)) {
        throw error;
      }
    }
  }

  await updateCachedVisitById(visitId, (visitData) => ({
    ...visitData,
    ...allowed,
    pendingSync: true,
  }));

  return visitId;
};

/**
 * Get visit by ID
 */
export const getVisitById = async (visitId) => {
  try {
    const docSnap = await withTimeout(() => getDoc(doc(db, "visits", visitId)));

    if (!docSnap.exists()) {
      throw new Error("Visit not found");
    }

    const visit = normalizeVisitDoc(docSnap);
    await upsertCachedVisit(visit);
    return visit;
  } catch (error) {
    const cachedVisits = await loadCachedVisits();
    const cachedVisit = cachedVisits.find((visit) => visit.id === visitId);
    if (cachedVisit) return cachedVisit;
    throw error;
  }
};

/**
 * Auto-checkout all active visits
 */
export const autoCheckoutActiveVisits = async () => {
  try {
    let activeVisits = [];
    let usedRemoteSource = false;

    if (await canReachFirestoreServer()) {
      try {
        const onlineActiveVisits = await queryAllActiveVisits();
        if (Array.isArray(onlineActiveVisits)) {
          activeVisits = onlineActiveVisits;
          usedRemoteSource = true;
        }
      } catch (error) {
        if (!isConnectivityError(error)) {
          throw error;
        }
      }
    }

    if (!usedRemoteSource) {
      const cachedVisits = await loadCachedVisits();
      activeVisits = cachedVisits.filter(
        (visit) => visit?.id && isActiveVisit(visit)
      );
    }

    const pendingCheckouts = await loadPendingCheckouts();
    const cachedVisits = await loadCachedVisits();
    const now = new Date();
    let count = 0;
    const visitsById = new Map(cachedVisits.map((visit) => [visit.id, visit]));

    for (let index = 0; index < activeVisits.length; index += 1) {
      const visit = activeVisits[index];
      if (!visit?.id || !isActiveVisit(visit)) continue;
      if (isVisitCoveredByPendingCheckout(visit, pendingCheckouts)) continue;

      count += 1;

      upsertPendingCheckoutEntry(pendingCheckouts, {
        name: String(visit.name || "").trim(),
        office: visit.office ? String(visit.office).trim() : null,
        localVisitId: visit.id,
        queuedAt: now.toISOString(),
        autoCheckedOut: true,
      });

      visitsById.set(visit.id, {
        ...(visitsById.get(visit.id) || {}),
        ...visit,
        status: "checked-out",
        checkOutTime: now,
        autoCheckedOut: true,
        pendingSync: true,
      });
    }

    if (count > 0) {
      await saveCachedVisits(Array.from(visitsById.values()));
      await savePendingCheckouts(pendingCheckouts);
    }

    return {
      count,
      shouldMarkComplete: usedRemoteSource || activeVisits.length > 0,
    };
  } catch (error) {
    console.error("Auto-checkout failed:", error);
    return {
      count: 0,
      shouldMarkComplete: false,
    };
  }
};
