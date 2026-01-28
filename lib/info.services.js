// lib/info.services.js
import { db } from "./firebase";
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
} from "firebase/firestore";

// 🔹 Reference to the collections
const officesCollection = collection(db, "offices");
const activityLogsCollection = collection(db, "activityLogs");

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
export const fetchOffices = async () => {
  try {
    // Get all offices, ordered by name
    const q = query(officesCollection, orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    
    const offices = snapshot.docs.map((doc) => { 
      const data = doc.data();
      
      // Format the office data for the VisitInfoSection
      return {
        id: doc.id, 
        name: data.name || "Unnamed Office",
        email: data.email || "",
        role: data.role || "office",
        
        // Ensure purposes array exists and has proper structure
        purposes: Array.isArray(data.purposes) 
          ? data.purposes.map((purpose, index) => ({
              id: purpose.id || `purpose_${doc.id}_${index}`,
              name: purpose.name || `Purpose ${index + 1}`,
              description: purpose.description || "",
              ...purpose
            }))
          : [],
        
        // Ensure staffToVisit array exists and has proper structure
        staffToVisit: Array.isArray(data.staffToVisit) 
          ? data.staffToVisit.map((staff, index) => ({
              id: staff.id || `staff_${doc.id}_${index}`,
              name: staff.name || `Staff ${index + 1}`,
              purpose: staff.purpose || null,
              position: staff.position || "",
              email: staff.email || "",
              ...staff
            }))
          : [],
        
        // Timestamps
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || null,
        
        // Include all other fields
        ...data
      };
    });
    
    console.log(`✅ Fetched ${offices.length} offices for VisitInfoSection`);
    
    // Log summary for debugging
    offices.forEach(office => {
      console.log(`   📍 ${office.name}: ${office.purposes.length} purposes, ${office.staffToVisit.length} staff`);
    });
    
    return offices;
  } catch (error) {
    console.error("❌ Error fetching offices:", error);
    
    // Return fallback offices for development/testing
    const fallbackOffices = [
      {
        id: "1",
        name: "REGISTRAR",
        email: "registrar@example.com",
        role: "office",
        purposes: [
          { id: "p1", name: "COR/TOR" },
          { id: "p2", name: "INQUIRY" }
        ],
        staffToVisit: [
          { id: "s1", name: "Ms. Uy", purpose: "COR/TOR" },
          { id: "s2", name: "Ms. Dela Cruz", purpose: "COR/TOR" }
        ]
      },
      {
        id: "2",
        name: "CLINIC",
        email: "clinic@example.com",
        role: "office",
        purposes: [
          { id: "p3", name: "MEDICAL" },
          { id: "p4", name: "Medical Checkup" },
          { id: "p5", name: "Medical Certificate" },
          { id: "p6", name: "Dental Checkup" }
        ],
        staffToVisit: [
          { id: "s3", name: "Dr. Santos", purpose: "MEDICAL" },
          { id: "s4", name: "Dr. Villanueva", purpose: "MEDICAL" }
        ]
      },
      {
        id: "3",
        name: "CASHIER",
        email: "cashier@example.com",
        role: "office",
        purposes: [
          { id: "p7", name: "PAYMENT" }
        ],
        staffToVisit: [
          { id: "s5", name: "Mr. Tan", purpose: "PAYMENT" }
        ]
      },
      {
        id: "4",
        name: "CCIS/CTAS OFFICE",
        email: "ccis@example.com",
        role: "office",
        purposes: [
          { id: "p8", name: "INQUIRY" },
          { id: "p9", name: "SUBMISSION OF REQUIREMENTS" }
        ],
        staffToVisit: [
          { id: "s6", name: "Ms. Sasha Isabela Uy" },
          { id: "s7", name: "Mrs. Cathlene Leah Gabo" },
          { id: "s8", name: "Mr. Raymond Cempron" },
          { id: "s9", name: "Mr. Emiliano Maravilla" },
          { id: "s10", name: "Mrs. Dhoree Maravilla" }
        ]
      }
    ];
    
    console.log("⚠️ Using fallback office data due to fetch error");
    return fallbackOffices;
  }
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
    
    const defaultPassword = office.role === "super" ? "superadmin2025" : "officeadmin2025";

    // Validate and format office data
    const validatedOffice = validateOfficeData(office);
    
    const officeWithPassword = {
      name: validatedOffice.name,
      email: validatedOffice.email,
      role: validatedOffice.role,
      password: defaultPassword,
      purposes: validatedOffice.purposes,
      staffToVisit: validatedOffice.staffToVisit,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(officesCollection, officeWithPassword);
    
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
    
    console.log(`✅ Office "${office.name}" added successfully with activity log`);
    
    return { 
      id: docRef.id, 
      ...officeWithPassword,
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

    // Only update password if provided
    if (office.password) {
      updateData.password = office.password;
    }

    await updateDoc(officeRef, updateData);
    
    // Create activity log
    const currentUser = getCurrentUser();
    
    let description = `Office "${office.name}" was updated`;
    let changes = [];
    
    // Track what changed
    if (office.password && office.password !== currentData.password) {
      changes.push("password changed");
    }
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