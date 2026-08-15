import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import { View, Text, Modal, useWindowDimensions, Alert } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import Pressable from "./SystemPressable";
import SectionTitle from "./SectionTitle";
import SelectField from "./SelectField";
import InputField from "./InputField";
import { fetchOfficesWithMeta, subscribeToOffices } from "../lib/info.services";

const normalizeStaffLabel = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeStaffKey = (value) => normalizeStaffLabel(value).toLowerCase();

const dedupeStaffNames = (names = []) => {
  const nameMap = new Map();
  names.forEach((name) => {
    const label = normalizeStaffLabel(name);
    if (!label) return;
    const key = normalizeStaffKey(label);
    if (!nameMap.has(key)) {
      nameMap.set(key, label);
    }
  });
  return Array.from(nameMap.values());
};

const VisitInfoSection = forwardRef(({
  purpose,
  setPurpose,
  office,
  setOffice,
  customOffice,
  setCustomOffice,
  customPurpose,
  setCustomPurpose,
  staffName,
  setStaffName,
  errors,
  setErrors,
  onPurposeLayout,
  onOfficeLayout,
  customOfficeRef,
  onCustomOfficeSubmit,
  customPurposeRef,
  onCustomPurposeSubmit,
}, ref) => {
  
  const [firstFilled, setFirstFilled] = useState(null);
  const [offices, setOffices] = useState([]);
  const [allPurposes, setAllPurposes] = useState([]);
  const [allOffices, setAllOffices] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [filteredPurposes, setFilteredPurposes] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [filteredStaffOptions, setFilteredStaffOptions] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allowRealtime, setAllowRealtime] = useState(true);

  // Refs
  const staffFieldRef = useRef(null);
  const officeFieldRef = useRef(null);
  const purposeFieldRef = useRef(null);

  const { width } = useWindowDimensions();
  const scale = Math.min(Math.max(width / 400, 0.8), 1.8);
  const isPhone = width < 600;
  const isPermissionDenied = (error) =>
    error?.code === "permission-denied" ||
    error?.code === "firestore/permission-denied" ||
    /Missing or insufficient permissions/i.test(error?.message || "");

  // Font and icon scale multipliers (can be adjusted dynamically)
  const fontScale = 1.0; // Adjust this to change all font sizes (0.8 = smaller, 1.2 = larger)
  const iconScale = 1.0; // Adjust this to change all icon sizes (0.8 = smaller, 1.2 = larger)

  // Responsive size values
  const sizes = {
    sectionMarginTop: 32 * scale,
    paddingHorizontal: 24 * scale,
    iconSize: 24 * scale * iconScale,
    containerBorderWidth: 2,
    containerBorderRadius: 16 * scale,
    containerPadding: 24 * scale,
    containerMarginTop: 4 * scale,
    loadingTextSize: 16 * scale * fontScale,
    alertIconSize: 40 * scale * iconScale,
    messageTextSize: 16 * scale * fontScale,
    messageMarginTop: 16 * scale,
    resetButtonMarginTop: 16 * scale,
    resetButtonPaddingH: 16 * scale,
    resetButtonPaddingV: 8 * scale,
    resetButtonBorderRadius: 8,
    resetButtonTextSize: 14 * scale * fontScale,
    modalPadding: 20 * scale,
    modalWidth: isPhone ? "90%" : "80%",
    modalBorderRadius: 14,
    modalIconSize: 42 * scale * iconScale,
    modalTextSize: 16 * scale * fontScale,
    modalTextMarginV: 10,
    modalButtonMarginTop: 20,
    modalButtonPaddingH: 20 * scale,
    modalButtonPaddingV: 8 * scale,
    modalButtonBorderRadius: 8,
    modalButtonMarginR: 16,
    modalButtonTextSize: 14 * scale * fontScale,
    fieldTextSize: 16 * scale * fontScale,
    iconMarginRight: 4 * scale,
    iconMarginLeft: 6 * scale
  }; 

  useImperativeHandle(ref, () => ({
    focus: () => {
      officeFieldRef.current?.focus?.();
    }
  }));

  const applyVisitorOfficeData = useCallback((visitorOffices) => {
    setOffices(visitorOffices);

    const officeNames = Array.from(
      new Set(
        visitorOffices
          .map((o) => o.name?.trim())
          .filter((name) => name && name !== "")
      )
    );

    const officeOptions = officeNames.length > 0 ? [...officeNames, "Other"] : ["Other"];
    setAllOffices(officeOptions);
    setFilteredOffices(officeOptions);

    const purposeSet = new Set();
    visitorOffices.forEach((entry) => {
      if (Array.isArray(entry.purposes)) {
        entry.purposes.forEach((p) => {
          if (p?.name && p.name.trim() !== "") {
            purposeSet.add(p.name);
          }
        });
      }
    });

    const purposesArray = Array.from(purposeSet);
    setAllPurposes(purposesArray);
    setFilteredPurposes([...purposesArray, "Other"]);

    let allStaffList = [];
    const staffNameKeys = new Set();
    visitorOffices.forEach((entry) => {
      if (Array.isArray(entry.staffToVisit)) {
        entry.staffToVisit.forEach((staff) => {
          const normalizedKey = normalizeStaffKey(staff?.name);
          if (!normalizedKey || staffNameKeys.has(normalizedKey)) {
            return;
          }
          staffNameKeys.add(normalizedKey);
          if (staff?.name && staff.name.trim() !== "") {
            allStaffList.push({
              name: normalizeStaffLabel(staff.name),
              office: entry.name,
              purpose: staff.purpose || null,
            });
          }
        });
      }
    });

    setAllStaff(allStaffList);
    setFilteredStaffOptions(dedupeStaffNames(allStaffList.map((s) => s.name)));

    console.log(
      `Loaded ${visitorOffices.length} visitor offices (excluding super admin)`
    );
    console.log(`${purposesArray.length} purposes available`);
    console.log(`${allStaffList.length} staff members available`);
  }, []);

  const filterVisitorOffices = useCallback(
    (officeItems = []) =>
      officeItems.filter(
        (entry) =>
          entry.role !== "super" &&
          entry.name &&
          entry.name.trim() !== ""
      ),
    []
  );

  // Fetch offices on component mount
  useEffect(() => {
    const loadOffices = async () => {
      try {
        setIsLoading(true);
        const officeResult = await fetchOfficesWithMeta();
        console.log(
          `VisitInfo offices source=${officeResult?.source || "unknown"} reason=${officeResult?.reason || "unknown"} count=${officeResult?.items?.length || 0}`
        );
        const visitorOffices = filterVisitorOffices(officeResult.items);
        applyVisitorOfficeData(visitorOffices);
        if (officeResult?.permissionDenied) {
          setAllowRealtime(false);
        }
      } catch (error) {
        if (!isPermissionDenied(error)) {
          console.error("Error fetching offices:", error);
        } else {
          setAllowRealtime(false);
        }
        applyVisitorOfficeData([]);
        if (!isPermissionDenied(error)) {
          Alert.alert(
            "Info",
            "Could not load office and instructor data."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadOffices();
  }, [applyVisitorOfficeData, filterVisitorOffices]);

  // Keep office/purpose/staff dropdowns updated in real-time.
  useEffect(() => {
    if (!allowRealtime) {
      return undefined;
    }

    const unsubscribe = subscribeToOffices(
      (liveOffices) => {
        const visitorOffices = filterVisitorOffices(liveOffices);
        applyVisitorOfficeData(visitorOffices);
        setIsLoading(false);
      },
      (error) => {
        if (isPermissionDenied(error)) {
          setAllowRealtime(false);
          return;
        }
        console.error("Error subscribing to offices:", error);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [allowRealtime, applyVisitorOfficeData, filterVisitorOffices]);

  // Build purpose-to-office mapping (only for visitor offices)
  const getPurposeToOfficeMap = () => {
    const purposeMap = {};
    
    offices.forEach(office => {
      if (office.name && office.purposes && Array.isArray(office.purposes)) {
        office.purposes.forEach(p => {
          if (p.name) {
            if (!purposeMap[p.name]) {
              purposeMap[p.name] = [];
            }
            if (!purposeMap[p.name].includes(office.name)) {
              purposeMap[p.name].push(office.name);
            }
          }
        });
      }
    });
    
    return purposeMap;
  };

  // Build office-to-purpose mapping (only for visitor offices)
  const getOfficeToPurposeMap = () => {
    const officeMap = {};
    
    offices.forEach(office => {
      if (office.name && office.purposes && Array.isArray(office.purposes)) {
        const purposeNames = office.purposes
          .map(p => p.name)
          .filter(name => name && name.trim() !== "");
        
        if (purposeNames.length > 0) {
          officeMap[office.name] = purposeNames;
        } else {
          // If office has no purposes, show all purposes
          officeMap[office.name] = allPurposes;
        }
      } else {
        // If office data is malformed, show all purposes
        officeMap[office.name] = allPurposes;
      }
    });
    
    return officeMap;
  };

  // Handle when staff is selected first
  useEffect(() => {
    if (firstFilled === "staff" && staffName) {
      // Find the staff member
      const selectedStaff = allStaff.find(
        (s) => normalizeStaffKey(s.name) === normalizeStaffKey(staffName)
      );
      if (selectedStaff) {
        setOffice(selectedStaff.office);
        
        // Get purposes for this office
        const officeToPurposeMap = getOfficeToPurposeMap();
        const purposesForOffice = officeToPurposeMap[selectedStaff.office] || allPurposes;
        setFilteredPurposes([...purposesForOffice, "Other"]);
        
        // Only show the office of the selected staff
        setFilteredOffices([selectedStaff.office]);
        
        // Filter staff options to only staff from this office
        const staffFromOffice = dedupeStaffNames(
          allStaff
            .filter((s) => s.office === selectedStaff.office)
            .map((s) => s.name)
        );
        setFilteredStaffOptions(staffFromOffice);
        
        setTimeout(() => purposeFieldRef.current?.focus?.(), 300);
      }
    }
  }, [
    staffName,
    firstFilled,
    allStaff,
    offices,
    allPurposes,
  ]);

  // Handle when purpose is selected first
  useEffect(() => {
    if (firstFilled === "purpose" && purpose && purpose !== "Other") {
      const purposeToOfficeMap = getPurposeToOfficeMap();
      const officesForPurpose = purposeToOfficeMap[purpose];
      
      if (officesForPurpose && officesForPurpose.length > 0) {
        // Show only offices that offer this purpose
        setFilteredOffices([...officesForPurpose, "Other"]);
        
        // If only one office offers this purpose, auto-select it
        if (officesForPurpose.length === 1 && !office) {
          setOffice(officesForPurpose[0]);
          if (onCustomOfficeSubmit) {
            setTimeout(() => onCustomOfficeSubmit(), 300);
          }
        }
        
        // Filter staff to only those from offices that offer this purpose
        const staffForPurpose = dedupeStaffNames(
          allStaff
            .filter((s) => officesForPurpose.includes(s.office))
            .map((s) => s.name)
        );
        setFilteredStaffOptions(staffForPurpose);
        
      } else {
        // If no offices found for this purpose, show all visitor offices
        setFilteredOffices(allOffices);
        setFilteredStaffOptions(dedupeStaffNames(allStaff.map((s) => s.name)));
      }
      
      // Reset office if it's not in the filtered list
      if (office && officesForPurpose && !officesForPurpose.includes(office) && office !== "Other") {
        setOffice("");
      }
    }
  }, [
    purpose,
    firstFilled,
    office,
    offices,
    allStaff,
    allOffices,
    onCustomOfficeSubmit,
  ]);

  // Handle when office is selected first
  useEffect(() => {
    if (firstFilled === "office" && office && office !== "Other") {
      const officeToPurposeMap = getOfficeToPurposeMap();
      const purposesForOffice = officeToPurposeMap[office] || allPurposes;
      
      // Show purposes for this office
      setFilteredPurposes([...purposesForOffice, "Other"]);
      
      // Filter staff to only those from this office
      const staffForOffice = dedupeStaffNames(
        allStaff.filter((s) => s.office === office).map((s) => s.name)
      );
      setFilteredStaffOptions(staffForOffice);
      
      // Reset purpose if it's not in the filtered list
      if (purpose && !purposesForOffice.includes(purpose) && purpose !== "Other") {
        setPurpose("");
      }
      
      setTimeout(() => purposeFieldRef.current?.focus?.(), 300);
    }
  }, [office, firstFilled, purpose, offices, allStaff, allPurposes]);

  // Reset to default when nothing is selected
  useEffect(() => {
    if (!staffName && !purpose && !office) {
      setFirstFilled(null);
      setFilteredOffices(allOffices);
      setFilteredPurposes([...allPurposes, "Other"]);
      setFilteredStaffOptions(dedupeStaffNames(allStaff.map((s) => s.name)));
    }
  }, [staffName, purpose, office, allOffices, allPurposes, allStaff]);

  // Detect which field was filled first
  useEffect(() => {
    if (!firstFilled) {
      if (staffName) setFirstFilled("staff");
      else if (purpose) setFirstFilled("purpose");
      else if (office) setFirstFilled("office");
    }
  }, [staffName, purpose, office]);

  useEffect(() => {
    if (errors?.customOffice && office === "Other") {
      setTimeout(() => customOfficeRef?.current?.focus?.(), 200);
      return;
    }

    if (errors?.customPurpose && purpose === "Other") {
      setTimeout(() => customPurposeRef?.current?.focus?.(), 200);
    }
  }, [
    errors?.customOffice,
    errors?.customPurpose,
    office,
    purpose,
    customOfficeRef,
    customPurposeRef,
  ]);

  const handleReset = () => {
    setPurpose("");
    setOffice("");
    setCustomPurpose("");
    setCustomOffice("");
    setStaffName("");
    setErrors((prev) => ({
      ...prev,
      purpose: false,
      office: false,
      customOffice: false,
      customPurpose: false,
    }));
    setShowResetConfirm(false);
    setFirstFilled(null);
  };

  const handleOfficeChange = (value) => {
    setOffice(value);
    if (errors?.office) setErrors(prev => ({ ...prev, office: false }));
    
    if (!firstFilled) setFirstFilled("office");
    
    if (value === "Other") {
      setTimeout(() => customOfficeRef?.current?.focus?.(), 300);
    } else {
      setTimeout(() => purposeFieldRef.current?.focus?.(), 300);
    }
  };

  const handlePurposeChange = (value) => {
    setPurpose(value);
    if (errors?.purpose) setErrors(prev => ({ ...prev, purpose: false }));
    
    if (!firstFilled) setFirstFilled("purpose");
    
    if (value === "Other") {
      setTimeout(() => customPurposeRef?.current?.focus?.(), 300);
    } else if (value && onCustomPurposeSubmit) {
      setTimeout(() => onCustomPurposeSubmit(), 300);
    }
  };

  const handleCustomOfficeChange = (value) => {
    setCustomOffice(value);
    if (errors?.customOffice) {
      setErrors((prev) => ({ ...prev, customOffice: false }));
    }
  };

  const handleCustomPurposeChange = (value) => {
    setCustomPurpose(value);
    if (errors?.customPurpose) {
      setErrors((prev) => ({ ...prev, customPurpose: false }));
    }
  };

  const handleStaffChange = (value) => {
    setStaffName(value);
    if (!firstFilled && value) setFirstFilled("staff");
  };

  const sanitizeOptions = (options = []) =>
    Array.from(
      new Set(
        options
          .map((item) => String(item || "").trim())
          .filter((item) => item.length > 0)
      )
    );

  const sanitizeStaffOptions = (options = []) => dedupeStaffNames(options);

  const officeOptions = (() => {
    const primary = sanitizeOptions(filteredOffices);
    if (primary.length > 0) return primary;

    const fallback = sanitizeOptions(allOffices);
    if (fallback.length > 0) return fallback;

    return ["Other"];
  })();

  const purposeOptions = (() => {
    const filtered = sanitizeOptions(filteredPurposes.filter((item) => item !== "Other"));
    if (filtered.length > 0) return [...filtered, "Other"];

    const fallback = sanitizeOptions(allPurposes);
    if (fallback.length > 0) return [...fallback, "Other"];

    return ["Other"];
  })();

  const staffOptions = (() => {
    const primary = sanitizeStaffOptions(filteredStaffOptions);
    if (primary.length > 0) return primary;
    return sanitizeStaffOptions(allStaff.map((staff) => staff.name));
  })();

  const hasValidSelectedStaff = Boolean(
    staffName &&
      allStaff.some(
        (staff) => normalizeStaffKey(staff.name) === normalizeStaffKey(staffName)
      )
  );
  const isOfficeDisabled = firstFilled === "staff" && hasValidSelectedStaff;

  // Show loading indicator
  if (isLoading) {
    return (
      <View style={{ marginTop: sizes.sectionMarginTop, paddingHorizontal: sizes.paddingHorizontal }}>
        <SectionTitle
          icon={<Ionicons name="location-outline" size={sizes.iconSize} color="#b6b6b6" />}
          text="Visit Information"
        />
        <View style={{ 
          backgroundColor: "rgba(255,255,255,0.1)", 
          borderWidth: sizes.containerBorderWidth, 
          borderColor: "#6366f1", 
          borderRadius: sizes.containerBorderRadius, 
          padding: sizes.containerPadding, 
          marginTop: sizes.containerMarginTop, 
          alignItems: "center"
        }}>
          <Text style={{ color: "#fff", fontSize: sizes.loadingTextSize }}>Loading offices and staff...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginTop: sizes.sectionMarginTop, paddingHorizontal: sizes.paddingHorizontal }}>
      <SectionTitle
        icon={<Ionicons name="location-outline" size={sizes.iconSize} color="#b6b6b6" />}
        text="Visit Information"
      />

      <View style={{ 
        backgroundColor: "rgba(255,255,255,0.1)", 
        borderWidth: sizes.containerBorderWidth, 
        borderColor: "#6366f1", 
        borderRadius: sizes.containerBorderRadius, 
        padding: sizes.containerPadding, 
        marginTop: sizes.containerMarginTop 
      }}>
        {/* STAFF */}
        <SelectField
          ref={staffFieldRef}
          icon={<Ionicons name="person-circle-outline" size={sizes.iconSize} color="#0a3aca" style={{ marginRight: sizes.iconMarginRight, marginLeft: sizes.iconMarginLeft }} />}
          selectedValue={staffName}
          onValueChange={handleStaffChange}
          placeholder="Staff / Instructor to Visit (optional)"
          options={staffOptions}
          scale={scale}
          fontSize={sizes.fieldTextSize}
        />

        {/* OFFICE */}
        <View onLayout={onOfficeLayout}>
          <SelectField
            ref={officeFieldRef}
            icon={<FontAwesome name="building-o" size={sizes.iconSize} color="#0a3aca" style={{ marginRight: sizes.iconMarginRight, marginLeft: sizes.iconMarginLeft }} />}
            selectedValue={office}
            onValueChange={handleOfficeChange}
            placeholder="Office to Visit"
            options={officeOptions}
            scale={scale}
            hasError={errors.office}
            disabled={isOfficeDisabled}
            fontSize={sizes.fieldTextSize}
          />
        </View>

        {/* CUSTOM OFFICE */}
        {office === "Other" && (
          <InputField
            icon={<Ionicons name="business-outline" size={sizes.iconSize} color="#0a3aca"  />}
            placeholder="Please specify the office"
            value={customOffice}
            onChangeText={handleCustomOfficeChange}
            uppercase
            autoCapitalize="characters"
            scale={scale}
            ref={customOfficeRef}
            onSubmitEditing={() => purposeFieldRef.current?.focus?.()}
            returnKeyType="next"
            fontSize={sizes.fieldTextSize}
            hasError={errors?.customOffice}
          />
        )}

        {/* PURPOSE */}
        <View onLayout={onPurposeLayout}>
          <SelectField
            ref={purposeFieldRef}
            icon={<Ionicons name="newspaper-outline" size={sizes.iconSize} color="#0a3aca" style={{ marginRight: sizes.iconMarginRight, marginLeft: sizes.iconMarginLeft }} />}
            selectedValue={purpose}
            onValueChange={handlePurposeChange}
            placeholder="Purpose of Visit"
            options={purposeOptions}
            scale={scale}
            hasError={errors.purpose}
            fontSize={sizes.fieldTextSize}
          />
        </View>

        {/* CUSTOM PURPOSE */}
        {purpose === "Other" && (
          <InputField
            icon={<Ionicons name="create-outline" size={sizes.iconSize} color="#0a3aca" />}
            placeholder="Please specify your purpose"
            value={customPurpose}
            onChangeText={handleCustomPurposeChange}
            uppercase
            autoCapitalize="characters"
            scale={scale}
            ref={customPurposeRef}
            onSubmitEditing={onCustomPurposeSubmit}
            returnKeyType="next"
            fontSize={sizes.fieldTextSize}
            hasError={errors?.customPurpose}
          />
        )}

        {/* RESET BUTTON */}
        <Pressable
          onPress={() => setShowResetConfirm(true)}
          style={{ 
            marginTop: sizes.resetButtonMarginTop, 
            alignSelf: "flex-end", 
            paddingHorizontal: sizes.resetButtonPaddingH, 
            paddingVertical: sizes.resetButtonPaddingV, 
            borderRadius: sizes.resetButtonBorderRadius, 
            borderWidth: 1, 
            borderColor: "#ff5555" 
          }}
        >
          <Text style={{ color: "#ff7777", fontWeight: "bold", fontSize: sizes.resetButtonTextSize }}>Reset</Text>
        </Pressable>
      </View>

      {/* RESET MODAL */}
      <Modal visible={showResetConfirm} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ 
            backgroundColor: "#ffffffdd", 
            padding: sizes.modalPadding, 
            width: sizes.modalWidth, 
            borderRadius: sizes.modalBorderRadius, 
            alignItems: "center" 
          }}>
            <Ionicons name="alert-circle-outline" size={sizes.modalIconSize} color="#d70000" />
            <Text style={{ 
              fontSize: sizes.modalTextSize, 
              marginVertical: sizes.modalTextMarginV, 
              fontWeight: "600" 
            }}>
              Are you sure you want to reset?
            </Text>
            <View style={{ flexDirection: "row", marginTop: sizes.modalButtonMarginTop }}>
              <Pressable 
                onPress={() => setShowResetConfirm(false)} 
                style={{ 
                  paddingHorizontal: sizes.modalButtonPaddingH, 
                  paddingVertical: sizes.modalButtonPaddingV, 
                  borderRadius: sizes.modalButtonBorderRadius, 
                  backgroundColor: "#999", 
                  marginRight: sizes.modalButtonMarginR 
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: sizes.modalButtonTextSize }}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={handleReset} 
                style={{ 
                  paddingHorizontal: sizes.modalButtonPaddingH, 
                  paddingVertical: sizes.modalButtonPaddingV, 
                  borderRadius: sizes.modalButtonBorderRadius, 
                  backgroundColor: "#d70000" 
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: sizes.modalButtonTextSize }}>Yes, Reset</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

VisitInfoSection.displayName = "VisitInfoSection";

export default VisitInfoSection;

