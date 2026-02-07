import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { View, Text, Modal, Pressable, useWindowDimensions, Alert } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import SectionTitle from "./SectionTitle";
import SelectField from "./SelectField";
import InputField from "./InputField";
import { fetchOffices } from "../lib/info.services";

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

  // Refs
  const staffFieldRef = useRef(null);
  const officeFieldRef = useRef(null);
  const purposeFieldRef = useRef(null);

  const { width } = useWindowDimensions();
  const scale = Math.min(Math.max(width / 400, 0.8), 1.8);
  const isPhone = width < 600;

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

  // Fetch offices on component mount
  useEffect(() => {
    const loadOffices = async () => {
      try {
        setIsLoading(true);
        const fetchedOffices = await fetchOffices();
        
        // Filter out super admin offices (role === "super")
        const visitorOffices = fetchedOffices.filter(office => 
          office.role !== "super" && office.name && office.name.trim() !== ""
        );
        
        setOffices(visitorOffices);
        
        // Extract all unique office names (excluding super admin)
        const officeNames = visitorOffices
          .map(o => o.name)
          .filter(name => name && name.trim() !== "");
        
        setAllOffices([...officeNames, "Other"]);
        setFilteredOffices([...officeNames, "Other"]);
        
        // Extract all unique purposes from visitor offices only
        const purposeSet = new Set();
        visitorOffices.forEach(office => {
          if (office.purposes && Array.isArray(office.purposes)) {
            office.purposes.forEach(p => {
              if (p.name && p.name.trim() !== "") {
                purposeSet.add(p.name);
              }
            });
          }
        });
        
        const purposesArray = Array.from(purposeSet);
        setAllPurposes(purposesArray);
        setFilteredPurposes([...purposesArray, "Other"]);
        
        // Extract all staff from visitor offices only
        const allStaffList = [];
        visitorOffices.forEach(office => {
          if (office.staffToVisit && Array.isArray(office.staffToVisit)) {
            office.staffToVisit.forEach(staff => {
              if (staff.name && staff.name.trim() !== "") {
                allStaffList.push({
                  name: staff.name,
                  office: office.name,
                  purpose: staff.purpose || null
                });
              }
            });
          }
        });
        
        setAllStaff(allStaffList);
        setFilteredStaffOptions(allStaffList.map(s => s.name));
        
        console.log(`✅ Loaded ${visitorOffices.length} visitor offices (excluding super admin)`);
        console.log(`✅ ${purposesArray.length} purposes available`);
        console.log(`✅ ${allStaffList.length} staff members available`);
        
      } catch (error) {
        console.error("❌ Error fetching offices:", error);
        // Fallback data (excluding super admin)
        const fallbackOffices = ["REGISTRAR", "CLINIC", "CASHIER", "CCIS/CTAS OFFICE", "Other"];
        const fallbackPurposes = ["COR/TOR", "MEDICAL", "PAYMENT", "INQUIRY", "SUBMISSION OF REQUIREMENTS", "Other"];
        
        setAllOffices(fallbackOffices);
        setFilteredOffices(fallbackOffices);
        setAllPurposes(fallbackPurposes.filter(p => p !== "Other"));
        setFilteredPurposes(fallbackPurposes);
        
        Alert.alert("Info", "Could not load office data. Using default options.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOffices();
  }, []);

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
      const selectedStaff = allStaff.find(s => s.name === staffName);
      if (selectedStaff) {
        setOffice(selectedStaff.office);
        
        // Get purposes for this office
        const officeToPurposeMap = getOfficeToPurposeMap();
        const purposesForOffice = officeToPurposeMap[selectedStaff.office] || allPurposes;
        setFilteredPurposes([...purposesForOffice, "Other"]);
        
        // Only show the office of the selected staff
        setFilteredOffices([selectedStaff.office]);
        
        // Filter staff options to only staff from this office
        const staffFromOffice = allStaff
          .filter(s => s.office === selectedStaff.office)
          .map(s => s.name);
        setFilteredStaffOptions(staffFromOffice);
        
        setTimeout(() => purposeFieldRef.current?.focus?.(), 300);
      }
    }
  }, [staffName, firstFilled, allStaff]);

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
        const staffForPurpose = allStaff
          .filter(s => officesForPurpose.includes(s.office))
          .map(s => s.name);
        setFilteredStaffOptions(staffForPurpose);
        
      } else {
        // If no offices found for this purpose, show all visitor offices
        setFilteredOffices(allOffices);
        setFilteredStaffOptions(allStaff.map(s => s.name));
      }
      
      // Reset office if it's not in the filtered list
      if (office && officesForPurpose && !officesForPurpose.includes(office) && office !== "Other") {
        setOffice("");
      }
    }
  }, [purpose, firstFilled, office]);

  // Handle when office is selected first
  useEffect(() => {
    if (firstFilled === "office" && office && office !== "Other") {
      const officeToPurposeMap = getOfficeToPurposeMap();
      const purposesForOffice = officeToPurposeMap[office] || allPurposes;
      
      // Show purposes for this office
      setFilteredPurposes([...purposesForOffice, "Other"]);
      
      // Filter staff to only those from this office
      const staffForOffice = allStaff
        .filter(s => s.office === office)
        .map(s => s.name);
      setFilteredStaffOptions(staffForOffice);
      
      // Reset purpose if it's not in the filtered list
      if (purpose && !purposesForOffice.includes(purpose) && purpose !== "Other") {
        setPurpose("");
      }
      
      setTimeout(() => purposeFieldRef.current?.focus?.(), 300);
    }
  }, [office, firstFilled, purpose]);

  // Reset to default when nothing is selected
  useEffect(() => {
    if (!staffName && !purpose && !office) {
      setFirstFilled(null);
      setFilteredOffices(allOffices);
      setFilteredPurposes([...allPurposes, "Other"]);
      setFilteredStaffOptions(allStaff.map(s => s.name));
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

  const handleReset = () => {
    setPurpose("");
    setOffice("");
    setCustomPurpose("");
    setCustomOffice("");
    setStaffName("");
    setErrors(prev => ({ ...prev, purpose: false, office: false }));
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

  const handleStaffChange = (value) => {
    setStaffName(value);
    if (!firstFilled && value) setFirstFilled("staff");
  };

  const isOfficeDisabled = firstFilled === "staff" && !!staffName;

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

  // Show message if no offices are found
  if (!isLoading && offices.length === 0) {
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
          <Ionicons name="alert-circle-outline" size={sizes.alertIconSize} color="#ff6b6b" />
          <Text style={{ 
            color: "#fff", 
            fontSize: sizes.messageTextSize, 
            marginTop: sizes.messageMarginTop,
            textAlign: "center"
          }}>
            No visitor offices available. Please contact the administrator.
          </Text>
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
          options={filteredStaffOptions}
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
            options={filteredOffices}
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
            onChangeText={setCustomOffice}
            uppercase
            scale={scale}
            ref={customOfficeRef}
            onSubmitEditing={() => purposeFieldRef.current?.focus?.()}
            returnKeyType="next"
            fontSize={sizes.fieldTextSize}
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
            options={filteredPurposes}
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
            onChangeText={setCustomPurpose}
            uppercase
            scale={scale}
            ref={customPurposeRef}
            onSubmitEditing={onCustomPurposeSubmit}
            returnKeyType="next"
            fontSize={sizes.fieldTextSize}
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

export default VisitInfoSection;