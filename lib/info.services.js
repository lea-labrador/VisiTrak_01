// lib/info.services.js
import { db } from "./firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

// 🔹 Reference to the collections
const officesCollection = collection(db, "offices");
const activityLogsCollection = collection(db, "activityLogs");

const OFFICES_CACHE_KEY = "@visitrak/visitor_offices_cache_v1";
const FIRESTORE_QUERY_TIMEOUT_MS = 8000;

const isPermissionDeniedError = (error) =>
  error?.code === "permission-denied" ||
  error?.code === "firestore/permission-denied" ||
  /Missing or insufficient permissions/i.test(error?.message || "");

const isTimeoutError = (error) =>
  /timed out|timeout/i.test(String(error?.message || ""));

const isClientOffline = () =>
  typeof navigator !== "undefined" &&
  typeof navigator.onLine === "boolean" &&
  navigator.onLine === false;

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

const serializeOfficesForCache = (offices) =>
  offices.map((office) => ({
    ...office,
    createdAt: toIsoDateOrNull(office.createdAt),
    updatedAt: toIsoDateOrNull(office.updatedAt),
  }));

const hydrateCachedOffices = (offices) =>
  offices.map((office) => ({
    ...office,
    createdAt: toDateOrNull(office.createdAt) || new Date(),
    updatedAt: toDateOrNull(office.updatedAt),
  }));

const loadCachedVisitorOffices = async () => {
  try {
    const raw = await AsyncStorage.getItem(OFFICES_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return hydrateCachedOffices(parsed);
  } catch {
    return [];
  }
};

const saveCachedVisitorOffices = async (offices) => {
  try {
    await AsyncStorage.setItem(
      OFFICES_CACHE_KEY,
      JSON.stringify(serializeOfficesForCache(offices))
    );
  } catch {
    // Cache write failure should not block runtime flow.
  }
};

const clearCachedVisitorOffices = async () => {
  try {
    await AsyncStorage.removeItem(OFFICES_CACHE_KEY);
  } catch {
    // Ignore cache cleanup failures.
  }
};

const sortOfficesByName = (offices = []) =>
  [...offices].sort((a, b) =>
    (a?.name || "").localeCompare(b?.name || "", undefined, {
      sensitivity: "base",
    })
  );

const normalizeOfficeForCache = (office) => ({
  ...office,
  purposes: Array.isArray(office?.purposes) ? office.purposes : [],
  staffToVisit: Array.isArray(office?.staffToVisit) ? office.staffToVisit : [],
  createdAt: toDateOrNull(office?.createdAt) || new Date(),
  updatedAt: toDateOrNull(office?.updatedAt),
});

const upsertCachedOffice = async (office) => {
  if (!office?.id) return;

  const cachedOffices = await loadCachedVisitorOffices();
  const nextById = new Map(cachedOffices.map((item) => [item.id, item]));
  nextById.set(office.id, normalizeOfficeForCache(office));

  await saveCachedVisitorOffices(sortOfficesByName(Array.from(nextById.values())));
};

const removeCachedOfficeById = async (officeId) => {
  if (!officeId) return;

  const cachedOffices = await loadCachedVisitorOffices();
  const next = cachedOffices.filter((item) => item.id !== officeId);

  if (next.length === 0) {
    await clearCachedVisitorOffices();
    return;
  }

  await saveCachedVisitorOffices(sortOfficesByName(next));
};

const getDocsWithTimeout = async (queryRef, timeoutMs = FIRESTORE_QUERY_TIMEOUT_MS) => {
  let timeoutId;
  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Firestore query timed out"));
      }, timeoutMs);
    });

    return await Promise.race([getDocs(queryRef), timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const fetchOfficesFromCollection = async (
  collectionRef,
  timeoutMs = FIRESTORE_QUERY_TIMEOUT_MS
) => {
  const q = query(collectionRef, orderBy("name", "asc"));
  const snapshot = await getDocsWithTimeout(q, timeoutMs);
  return snapshot.docs.map(normalizeOfficeData);
};

const fetchOfficesFromServer = async (timeoutMs = FIRESTORE_QUERY_TIMEOUT_MS) => {
  const offices = await fetchOfficesFromCollection(officesCollection, timeoutMs);

  if (offices.length === 0) {
    await clearCachedVisitorOffices();
    console.log("No offices found in Firestore.");
    return {
      items: [],
      source: "online",
      reason: "empty",
      onlineAvailable: true,
    };
  }

  await saveCachedVisitorOffices(offices);
  console.log(`Fetched ${offices.length} offices for VisitInfoSection`);
  return {
    items: offices,
    source: "online",
    reason: "ok",
    onlineAvailable: true,
  };
};

/**
 * Create an activity log
 */
const createActivityLog = async (logData) => {
  try {
    const logWithTimestamp = {
      ...logData,
      timestamp: serverTimestamp(),
    };
    
    await addDoc(activityLogsCollection, logWithTimestamp);
    console.log("✅ Activity log created:", logData.title, "for office:", logData.office);
    return true;
  } catch (error) {
    console.error("❌ Error creating activity log:", error);
    // Don't throw - we don't want office operations to fail because of logging
    return false;
  }
};

/**
 * Get current user from localStorage (for activity logs)
 */
const getCurrentUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      console.log("🔍 Current user for activity log:", user);
      return {
        email: user.email || "unknown@email.com",
        name: user.name || "Unknown User",
        role: user.role || "unknown",
        office: user.office || "System"
      };
    }
    return {
      email: "system@admin.com",
      name: "System Administrator",
      role: "system",
      office: "System"
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return {
      email: "system@admin.com",
      name: "System Administrator",
      role: "system",
      office: "System"
    };
  }
};

/**
 * 🔹 CRITICAL: Fetch all offices from Firestore - USED BY VisitInfoSection
 * This function is called by the form to get offices, purposes, and staff
 */
const normalizeOfficeData = (docSnap) => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    name: data.name || "Unnamed Office",
    email: data.email || "",
    role: data.role || "office",
    purposes: Array.isArray(data.purposes)
      ? data.purposes.map((purpose, index) => ({
          id: purpose.id || `purpose_${docSnap.id}_${index}`,
          name: purpose.name || `Purpose ${index + 1}`,
          description: purpose.description || "",
          ...purpose,
        }))
      : [],
    staffToVisit: Array.isArray(data.staffToVisit)
      ? data.staffToVisit.map((staff, index) => ({
          id: staff.id || `staff_${docSnap.id}_${index}`,
          name: staff.name || `Staff ${index + 1}`,
          purpose: staff.purpose || null,
          position: staff.position || "",
          email: staff.email || "",
          ...staff,
        }))
      : [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || null,
    ...data,
  };
};

export const subscribeToOffices = (onData, onError) => {
  const q = query(officesCollection, orderBy("name", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        void clearCachedVisitorOffices();
        if (typeof onData === "function") {
          onData([]);
        }
        return;
      }

      const offices = snapshot.docs.map(normalizeOfficeData);
      void saveCachedVisitorOffices(offices);

      if (typeof onData === "function") {
        onData(offices);
      }
    },
    (error) => {
      if (!isPermissionDeniedError(error)) {
        console.error("Error in offices subscription:", error);
      }
      if (typeof onError === "function") {
        onError(error);
      }
    }
  );
};

export const fetchOfficesWithMeta = async () => {
  const cachedOffices = await loadCachedVisitorOffices();

  if (isClientOffline()) {
    if (cachedOffices.length > 0) {
      return {
        items: cachedOffices,
        source: "cache",
        reason: "offline-cache",
        onlineAvailable: false,
      };
    }

    return {
      items: [],
      source: "cache",
      reason: "offline-no-cache",
      onlineAvailable: false,
    };
  }

  const hasUnknownOnlineState =
    typeof navigator === "undefined" ||
    typeof navigator.onLine !== "boolean";

  if (cachedOffices.length > 0 && hasUnknownOnlineState) {
    try {
      return await fetchOfficesFromServer();
    } catch (error) {
      const isTimeout = isTimeoutError(error);
      if (!isPermissionDeniedError(error) && !isTimeout) {
        console.error("Error fetching offices (unknown network state):", error);
      }
      return {
        items: cachedOffices,
        source: "cache",
        reason: isPermissionDeniedError(error)
          ? "permission-denied-cache"
          : isTimeout
            ? "unknown-online-timeout-cache"
          : "unknown-online-cache",
        onlineAvailable: false,
        permissionDenied: isPermissionDeniedError(error),
        errorMessage: error?.message || "Unknown error",
      };
    }
  }

  try {
    return await fetchOfficesFromServer();
  } catch (error) {
    if (!isPermissionDeniedError(error)) {
      console.error("Error fetching offices:", error);
    }
    if (cachedOffices.length > 0) {
      return {
        items: cachedOffices,
        source: "cache",
        reason: isPermissionDeniedError(error)
          ? "permission-denied-cache"
          : "error-cache",
        onlineAvailable: false,
        permissionDenied: isPermissionDeniedError(error),
        errorMessage: error?.message || "Unknown error",
      };
    }

    return {
      items: [],
      source: "error",
      reason: isPermissionDeniedError(error)
        ? "permission-denied-no-cache"
        : "error-no-cache",
      onlineAvailable: false,
      permissionDenied: isPermissionDeniedError(error),
      errorMessage: error?.message || "Unknown error",
    };
  }
};

export const fetchOffices = async () => {
  const result = await fetchOfficesWithMeta();
  return result.items;
};

/**
 * Get a specific office by ID
 */
export const getOfficeById = async (id) => {
  try {
    const officeRef = doc(db, "offices", id);
    const officeSnap = await getDoc(officeRef);
    
    if (officeSnap.exists()) {
      const data = officeSnap.data();
      return { 
        id: officeSnap.id, 
        name: data.name || "Unnamed Office",
        email: data.email || "",
        role: data.role || "office",
        purposes: Array.isArray(data.purposes) ? data.purposes : [],
        staffToVisit: Array.isArray(data.staffToVisit) ? data.staffToVisit : [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || null,
        ...data
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting office by ID:", error);
    throw error;
  }
};

/**
 * Get office by email (for profile lookup)
 */
export const getOfficeByEmail = async (email) => {
  try {
    const q = query(officesCollection, where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      name: data.name || "Unnamed Office",
      email: data.email || "",
      role: data.role || "office",
      purposes: Array.isArray(data.purposes) ? data.purposes : [],
      staffToVisit: Array.isArray(data.staffToVisit) ? data.staffToVisit : [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || null,
      ...data
    };
  } catch (error) {
    console.error("Error getting office by email:", error);
    throw error;
  }
};

/**
 * Validate office data structure
 */
const validateOfficeData = (office) => {
  const validatedOffice = { ...office };
  
  // Validate purposes array
  if (!validatedOffice.purposes || !Array.isArray(validatedOffice.purposes)) {
    validatedOffice.purposes = [];
  } else {
    validatedOffice.purposes = validatedOffice.purposes.map((purpose, index) => ({
      id: purpose.id || `purpose_${Date.now()}_${index}`,
      name: purpose.name || `Purpose ${index + 1}`,
      description: purpose.description || "",
      ...purpose
    }));
  }
  
  // Validate staffToVisit array
  if (!validatedOffice.staffToVisit || !Array.isArray(validatedOffice.staffToVisit)) {
    validatedOffice.staffToVisit = [];
  } else {
    validatedOffice.staffToVisit = validatedOffice.staffToVisit.map((staff, index) => ({
      id: staff.id || `staff_${Date.now()}_${index}`,
      name: staff.name || `Staff ${index + 1}`,
      purpose: staff.purpose || null,
      position: staff.position || "",
      email: staff.email || "",
      ...staff
    }));
  }
  
  return validatedOffice;
};

/**
 * Add a new office to Firestore WITH ACTIVITY LOG
 */
export const addOffice = async (office) => {
  try {
    // Check if email already exists
    const existingOffice = await getOfficeByEmail(office.email);
    if (existingOffice) {
      throw new Error(`Office with email ${office.email} already exists`);
    }

    // Validate and format office data
    const validatedOffice = validateOfficeData(office);

    const officeDocData = {
      name: validatedOffice.name,
      email: validatedOffice.email,
      role: validatedOffice.role,
      purposes: validatedOffice.purposes,
      staffToVisit: validatedOffice.staffToVisit,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(officesCollection, officeDocData);
    
    // Create activity log
    const currentUser = getCurrentUser();
    await createActivityLog({
      title: "Office Created",
      description: `New office "${office.name}" was created with ${office.purposes?.length || 0} purposes and ${office.staffToVisit?.length || 0} staff members`,
      office: office.name,
      type: "office_created",
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      officeEmail: office.email,
      officeRole: office.role,
      purposesCount: office.purposes?.length || 0,
      staffCount: office.staffToVisit?.length || 0,
      action: "create"
    });

    await upsertCachedOffice({
      id: docRef.id,
      name: validatedOffice.name,
      email: validatedOffice.email,
      role: validatedOffice.role,
      purposes: validatedOffice.purposes,
      staffToVisit: validatedOffice.staffToVisit,
      createdAt: new Date(),
      updatedAt: null,
    });
    
    console.log(`✅ Office "${office.name}" added successfully with activity log`);
    
    return { 
      id: docRef.id, 
      ...officeDocData,
      createdAt: new Date() // Fallback for immediate display
    };
  } catch (error) {
    console.error("Error adding office:", error);
    throw error;
  }
};

/**
 * Update an existing office WITH ACTIVITY LOG
 */
export const updateOffice = async (office) => {
  try {
    const officeRef = doc(db, "offices", office.id);
    
    // First, get current office data
    const currentOfficeSnap = await getDoc(officeRef);
    if (!currentOfficeSnap.exists()) {
      throw new Error(`Office with ID ${office.id} not found`);
    }
    
    const currentData = currentOfficeSnap.data();
    
    // Validate and format update data
    const validatedOffice = validateOfficeData(office);
    
    const updateData = {
      name: validatedOffice.name,
      email: validatedOffice.email,
      role: validatedOffice.role,
      purposes: validatedOffice.purposes,
      staffToVisit: validatedOffice.staffToVisit,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(officeRef, updateData);
    
    // Create activity log
    const currentUser = getCurrentUser();
    
    let description = `Office "${office.name}" was updated`;
    let changes = [];
    
    // Track what changed
    if (office.name !== currentData.name) {
      changes.push(`name changed from "${currentData.name}" to "${office.name}"`);
    }
    if (office.email !== currentData.email) {
      changes.push(`email changed from "${currentData.email}" to "${office.email}"`);
    }
    if (office.role !== currentData.role) {
      changes.push(`role changed from "${currentData.role}" to "${office.role}"`);
    }
    
    // Track array changes
    const currentPurposesCount = currentData.purposes?.length || 0;
    const newPurposesCount = office.purposes?.length || 0;
    if (currentPurposesCount !== newPurposesCount) {
      changes.push(`purposes changed from ${currentPurposesCount} to ${newPurposesCount}`);
    }
    
    const currentStaffCount = currentData.staffToVisit?.length || 0;
    const newStaffCount = office.staffToVisit?.length || 0;
    if (currentStaffCount !== newStaffCount) {
      changes.push(`staff list changed from ${currentStaffCount} to ${newStaffCount}`);
    }
    
    if (changes.length > 0) {
      description += ` (${changes.join(', ')})`;
    }
    
    await createActivityLog({
      title: "Office Updated",
      description: description,
      office: office.name,
      type: "office_updated",
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      previousName: currentData.name,
      newName: office.name,
      purposesCount: newPurposesCount,
      staffCount: newStaffCount,
      action: "update"
    });

    await upsertCachedOffice({
      id: office.id,
      name: validatedOffice.name,
      email: validatedOffice.email,
      role: validatedOffice.role,
      purposes: validatedOffice.purposes,
      staffToVisit: validatedOffice.staffToVisit,
      createdAt: currentData.createdAt?.toDate?.() || new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Office "${office.name}" updated successfully with activity log`);
    
    return { 
      id: office.id, 
      ...updateData,
      purposes: validatedOffice.purposes,
      staffToVisit: validatedOffice.staffToVisit
    };
  } catch (error) {
    console.error("Error updating office:", error);
    throw error;
  }
};

/**
 * Delete an office by ID WITH ACTIVITY LOG
 */
export const deleteOffice = async (id) => {
  try {
    const officeRef = doc(db, "offices", id);
    const officeDoc = await getDoc(officeRef);
    
    if (!officeDoc.exists()) {
      throw new Error(`Office with ID ${id} not found`);
    }
    
    const officeData = officeDoc.data();
    
    // Create activity log BEFORE deleting
    const currentUser = getCurrentUser();
    await createActivityLog({
      title: "Office Deleted",
      description: `Office "${officeData.name}" was deleted from the system. Removed ${officeData.purposes?.length || 0} purposes and ${officeData.staffToVisit?.length || 0} staff records`,
      office: officeData.name,
      type: "office_deleted",
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      deletedOfficeName: officeData.name,
      deletedOfficeEmail: officeData.email,
      deletedPurposesCount: officeData.purposes?.length || 0,
      deletedStaffCount: officeData.staffToVisit?.length || 0,
      action: "delete"
    });
    
    // Now delete the office
    await deleteDoc(officeRef);
    await removeCachedOfficeById(id);
    console.log(`✅ Office "${officeData.name}" deleted successfully with activity log`);
    return { 
      success: true, 
      id, 
      deletedOffice: officeData.name,
      deletedPurposesCount: officeData.purposes?.length || 0,
      deletedStaffCount: officeData.staffToVisit?.length || 0
    };
  } catch (error) {
    console.error("Error deleting office:", error);
    throw error;
  }
};

/**
 * Check if email already exists (for validation)
 */
export const checkEmailExists = async (email, excludeId = null) => {
  try {
    const q = query(officesCollection, where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return false;
    }
    
    // If excludeId is provided, check if it's the same office
    if (excludeId) {
      const offices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return offices.some(office => office.id !== excludeId);
    }
    
    return true;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};

/**
 * Create a login activity log
 */
export const createLoginActivityLog = async (userData) => {
  try {
    const logData = {
      title: "User Login",
      description: `${userData.name} logged into the system`,
      office: userData.office || userData.name,
      type: "login",
      userEmail: userData.email,
      userName: userData.name,
      userRole: userData.role,
      timestamp: serverTimestamp(),
      action: "login"
    };
    
    await addDoc(activityLogsCollection, logData);
    console.log("✅ Login activity log created for:", userData.name);
    return true;
  } catch (error) {
    console.error("❌ Error creating login activity log:", error);
    return false;
  }
};

/**
 * Get offices with specific purpose (for filtering/searching)
 */
export const getOfficesByPurpose = async (purposeName) => {
  try {
    const allOffices = await fetchOffices();
    
    // Filter offices that have the specified purpose
    const filteredOffices = allOffices.filter(office => 
      office.purposes && 
      office.purposes.some(purpose => 
        purpose.name.toLowerCase().includes(purposeName.toLowerCase())
      )
    );
    
    console.log(`✅ Found ${filteredOffices.length} offices with purpose containing "${purposeName}"`);
    return filteredOffices;
  } catch (error) {
    console.error("Error getting offices by purpose:", error);
    throw error;
  }
};

/**
 * Get offices with specific staff (for filtering/searching)
 */
export const getOfficesByStaff = async (staffName) => {
  try {
    const allOffices = await fetchOffices();
    
    // Filter offices that have the specified staff
    const filteredOffices = allOffices.filter(office => 
      office.staffToVisit && 
      office.staffToVisit.some(staff => 
        staff.name.toLowerCase().includes(staffName.toLowerCase())
      )
    );
    
    console.log(`✅ Found ${filteredOffices.length} offices with staff containing "${staffName}"`);
    return filteredOffices;
  } catch (error) {
    console.error("Error getting offices by staff:", error);
    throw error;
  }
};

/**
 * Add a new purpose to an existing office
 */
export const addPurposeToOffice = async (officeId, purpose) => {
  try {
    const office = await getOfficeById(officeId);
    if (!office) {
      throw new Error(`Office with ID ${officeId} not found`);
    }
    
    const newPurpose = {
      id: `purpose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: purpose.name || "New Purpose",
      description: purpose.description || "",
      ...purpose
    }; 
    
    const updatedPurposes = [...(office.purposes || []), newPurpose];
    
    const updateData = {
      purposes: updatedPurposes,
      updatedAt: serverTimestamp()
    };
    
    const officeRef = doc(db, "offices", officeId);
    await updateDoc(officeRef, updateData);

    await upsertCachedOffice({
      ...office,
      purposes: updatedPurposes,
      updatedAt: new Date(),
    });
    
    // Create activity log
    const currentUser = getCurrentUser();
    await createActivityLog({
      title: "Purpose Added",
      description: `Purpose "${purpose.name}" was added to office "${office.name}"`,
      office: office.name,
      type: "purpose_added",
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      purposeName: purpose.name,
      action: "update"
    });
    
    console.log(`✅ Purpose "${purpose.name}" added to office "${office.name}"`);
    return { success: true, purpose: newPurpose };
  } catch (error) {
    console.error("Error adding purpose to office:", error);
    throw error;
  }
};

/**
 * Add a new staff member to an existing office
 */
export const addStaffToOffice = async (officeId, staff) => {
  try {
    const office = await getOfficeById(officeId);
    if (!office) {
      throw new Error(`Office with ID ${officeId} not found`);
    }
    
    const newStaff = {
      id: `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: staff.name || "New Staff",
      purpose: staff.purpose || null,
      position: staff.position || "",
      email: staff.email || "",
      ...staff
    };
    
    const updatedStaff = [...(office.staffToVisit || []), newStaff];
    
    const updateData = {
      staffToVisit: updatedStaff,
      updatedAt: serverTimestamp()
    };
    
    const officeRef = doc(db, "offices", officeId);
    await updateDoc(officeRef, updateData);

    await upsertCachedOffice({
      ...office,
      staffToVisit: updatedStaff,
      updatedAt: new Date(),
    });
    
    // Create activity log
    const currentUser = getCurrentUser();
    await createActivityLog({
      title: "Staff Added",
      description: `Staff "${staff.name}" was added to office "${office.name}"`,
      office: office.name,
      type: "staff_added",
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      staffName: staff.name,
      action: "update"
    });
    
    console.log(`✅ Staff "${staff.name}" added to office "${office.name}"`);
    return { success: true, staff: newStaff };
  } catch (error) {
    console.error("Error adding staff to office:", error);
    throw error;
  }
};

/**
 * Remove a purpose from an office
 */
export const removePurposeFromOffice = async (officeId, purposeId) => {
  try {
    const office = await getOfficeById(officeId);
    if (!office) {
      throw new Error(`Office with ID ${officeId} not found`);
    }
    
    const purposeToRemove = office.purposes.find(p => p.id === purposeId);
    if (!purposeToRemove) {
      throw new Error(`Purpose with ID ${purposeId} not found`);
    }
    
    const updatedPurposes = office.purposes.filter(p => p.id !== purposeId);
    
    const updateData = {
      purposes: updatedPurposes,
      updatedAt: serverTimestamp()
    };
    
    const officeRef = doc(db, "offices", officeId);
    await updateDoc(officeRef, updateData);

    await upsertCachedOffice({
      ...office,
      purposes: updatedPurposes,
      updatedAt: new Date(),
    });
    
    // Create activity log
    const currentUser = getCurrentUser();
    await createActivityLog({
      title: "Purpose Removed",
      description: `Purpose "${purposeToRemove.name}" was removed from office "${office.name}"`,
      office: office.name,
      type: "purpose_removed",
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      purposeName: purposeToRemove.name,
      action: "update"
    });
    
    console.log(`✅ Purpose "${purposeToRemove.name}" removed from office "${office.name}"`);
    return { success: true, purpose: purposeToRemove };
  } catch (error) {
    console.error("Error removing purpose from office:", error);
    throw error;
  }
};

/**
 * Remove a staff member from an office
 */
export const removeStaffFromOffice = async (officeId, staffId) => {
  try {
    const office = await getOfficeById(officeId);
    if (!office) {
      throw new Error(`Office with ID ${officeId} not found`);
    }
    
    const staffToRemove = office.staffToVisit.find(s => s.id === staffId);
    if (!staffToRemove) {
      throw new Error(`Staff with ID ${staffId} not found`);
    }
    
    const updatedStaff = office.staffToVisit.filter(s => s.id !== staffId);
    
    const updateData = {
      staffToVisit: updatedStaff,
      updatedAt: serverTimestamp()
    };
    
    const officeRef = doc(db, "offices", officeId);
    await updateDoc(officeRef, updateData);

    await upsertCachedOffice({
      ...office,
      staffToVisit: updatedStaff,
      updatedAt: new Date(),
    });
    
    // Create activity log
    const currentUser = getCurrentUser();
    await createActivityLog({
      title: "Staff Removed",
      description: `Staff "${staffToRemove.name}" was removed from office "${office.name}"`,
      office: office.name,
      type: "staff_removed",
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      staffName: staffToRemove.name,
      action: "update"
    });
    
    console.log(`✅ Staff "${staffToRemove.name}" removed from office "${office.name}"`);
    return { success: true, staff: staffToRemove };
  } catch (error) {
    console.error("Error removing staff from office:", error);
    throw error;
  }
};

/**
 * 🔹 NEW: Get simplified offices list (just names) for dropdowns
 */
export const getOfficeNames = async () => {
  try {
    const offices = await fetchOffices();
    return offices.map(office => office.name).filter(name => name && name.trim() !== "");
  } catch (error) {
    console.error("Error getting office names:", error);
    return [];
  }
};

/**
 * 🔹 NEW: Get all purposes from all offices
 */
export const getAllPurposes = async () => {
  try {
    const offices = await fetchOffices();
    const purposeSet = new Set();
    
    offices.forEach(office => {
      if (office.purposes && Array.isArray(office.purposes)) {
        office.purposes.forEach(p => {
          if (p.name && p.name.trim() !== "") {
            purposeSet.add(p.name);
          }
        });
      }
    });
    
    return Array.from(purposeSet);
  } catch (error) {
    console.error("Error getting all purposes:", error);
    return [];
  }
};

/**
 * 🔹 NEW: Get all staff from all offices
 */
export const getAllStaff = async () => {
  try {
    const offices = await fetchOffices();
    const allStaff = [];
    
    offices.forEach(office => {
      if (office.staffToVisit && Array.isArray(office.staffToVisit)) {
        office.staffToVisit.forEach(staff => {
          if (staff.name && staff.name.trim() !== "") {
            allStaff.push({
              name: staff.name,
              office: office.name,
              purpose: staff.purpose || null
            });
          }
        });
      }
    });
    
    return allStaff;
  } catch (error) {
    console.error("Error getting all staff:", error);
    return [];
  }
};

// Export for backward compatibility
export const updateOfficeWithLog = async (office) => {
  return updateOffice(office);
};

export const deleteOfficeWithLog = async (id) => {
  return deleteOffice(id);
};

export const addOfficeWithLog = async (office) => {
  return addOffice(office);
};

