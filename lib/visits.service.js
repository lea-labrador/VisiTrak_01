// lib/visits.service.js
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

/**
 * Check if visitor is still checked-in (duplicate prevention)
 * Rule: same name + still checked-in = duplicate
 * ✅ NO orderBy → NO composite index needed
 */
export const checkActiveVisitByName = async (name) => {
  try {
    if (!name || name.trim() === "") return null;

    const q = query(
      collection(db, "visits"),
      where("name", "==", name.trim()),
      where("checkOutTime", "==", null),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();

    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      checkInTime: data.checkInTime?.toDate(),
      checkOutTime: data.checkOutTime?.toDate(),
    };
  } catch (error) {
    console.error("❌ Error checking active visit:", error);
    return null;
  }
};

/**
 * Check if visitor is checked-in today (client-side filter)
 * Avoids composite index by reusing the active-visit query.
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

    const existingVisit = await checkActiveVisitByName(trimmedName);
    if (existingVisit) {
      throw new Error(`⚠️ ${trimmedName} is already checked in.`);
    }

    const visitData = {
      name: trimmedName,
      address: (visit.address || "").trim(),
      office: visit.office.trim(),
      purpose: visit.purpose.trim(),
      contactNumber: (visit.contactNumber || "").trim(),
      email: (visit.email || "").trim().toLowerCase(),
      staffName: (visit.staffName || "").trim(),
      status: "checked-in",
      checkInTime: serverTimestamp(),
      checkOutTime: null,
      createdAt: serverTimestamp(),
      autoCheckedOut: false,
    };

    const docRef = await addDoc(collection(db, "visits"), visitData);
    console.log("✅ Visit added:", docRef.id);

    return { id: docRef.id, ...visitData };
  } catch (error) {
    console.error("❌ Error adding visit:", error.message || error);
    throw error;
  }
};

/**
 * Manual checkout by name (optional office filter)
 */
export const setCheckOutTimeByName = async (name, office = null) => {
  try {
    const constraints = [
      where("name", "==", name.trim()),
      where("checkOutTime", "==", null),
    ];

    if (office) {
      constraints.push(where("office", "==", office.trim()));
    }

    const q = query(
      collection(db, "visits"),
      ...constraints,
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error(`No active visit found for ${name}`);
    }

    const visitDoc = snapshot.docs[0];

    await updateDoc(doc(db, "visits", visitDoc.id), {
      checkOutTime: serverTimestamp(),
      status: "checked-out",
    });

    console.log(`🚪 Checked out ${name}`);
    return visitDoc.id;
  } catch (error) {
    console.error("❌ Checkout error:", error);
    throw error;
  }
};

/**
 * Real-time visits subscription
 */
export const subscribeVisits = (callback) => {
  const q = query(collection(db, "visits"));

  return onSnapshot(
    q,
    (snapshot) => {
      const visits = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        checkInTime: docSnap.data().checkInTime?.toDate(),
        checkOutTime: docSnap.data().checkOutTime?.toDate(),
      }));
      callback(visits);
    },
    () => callback([])
  );
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

    const q = query(collection(db, "visits"), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      checkInTime: docSnap.data().checkInTime?.toDate(),
      checkOutTime: docSnap.data().checkOutTime?.toDate(),
    }));
  } catch (error) {
    console.error("❌ Fetch error:", error);
    throw error;
  }
};

/**
 * Get all active visits
 */
export const getActiveVisits = async () => {
  const q = query(
    collection(db, "visits"),
    where("checkOutTime", "==", null)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    checkInTime: docSnap.data().checkInTime?.toDate(),
  }));
};

/**
 * Update visit (safe fields only)
 */
export const updateVisit = async (visitId, updates) => {
  const { id, createdAt, checkInTime, checkOutTime, ...allowed } = updates;
  await updateDoc(doc(db, "visits", visitId), allowed);
  return visitId;
};

/**
 * Get visit by ID
 */
export const getVisitById = async (visitId) => {
  const docSnap = await getDoc(doc(db, "visits", visitId));
  if (!docSnap.exists()) throw new Error("Visit not found");

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    checkInTime: docSnap.data().checkInTime?.toDate(),
    checkOutTime: docSnap.data().checkOutTime?.toDate(),
  };
};

/**
 * Auto-checkout all active visits
 * - In-app execution
 * - Safe to run multiple times
 */
export const autoCheckoutActiveVisits = async () => {
  try {
    const q = query(
      collection(db, "visits"),
      where("checkOutTime", "==", null)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return 0;

    await Promise.all(
      snapshot.docs.map((docSnap) =>
        updateDoc(doc(db, "visits", docSnap.id), {
          status: "checked-out",
          checkOutTime: serverTimestamp(),
          autoCheckedOut: true,
        })
      )
    );

    return snapshot.size;
  } catch (error) {
    console.error("❌ Auto-checkout failed:", error);
    throw error;
  }
};
