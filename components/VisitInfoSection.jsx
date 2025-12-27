import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { View, Text, Modal, Pressable, useWindowDimensions } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import SectionTitle from "./SectionTitle";
import SelectField from "./SelectField";
import InputField from "./InputField";

const VisitInfoSection = forwardRef(({
  purpose,
  setPurpose,
  office,
  setOffice,
  customOffice,        
  setCustomOffice,     
  customPurpose,       
  setCustomPurpose,
  purposes,
  offices,
  errors,
  setErrors,
  onPurposeLayout,
  onOfficeLayout,
  customOfficeRef,
  onCustomOfficeSubmit,
  customPurposeRef,
  onCustomPurposeSubmit,
}, ref) => {
  
  const [staffName, setStaffName] = useState("");
  const [firstFilled, setFirstFilled] = useState(null);
  const [filteredPurposes, setFilteredPurposes] = useState(purposes);
  const [filteredOffices, setFilteredOffices] = useState(offices);
  const [filteredStaffOptions, setFilteredStaffOptions] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Refs for internal fields
  const staffFieldRef = useRef(null);
  const officeFieldRef = useRef(null);
  const purposeFieldRef = useRef(null);

  const { width } = useWindowDimensions();
  const isLarge = width > 800;
  const isTablet = width > 600 && width <= 800;
  const scale = isLarge ? 1.4 : isTablet ? 1.2 : 1;

  // Expose focus method to parent component
  useImperativeHandle(ref, () => ({
    focus: () => {
      // Focus on the first required field (office)
      officeFieldRef.current?.focus?.();
    }
  }));

  // Staff data mapping
  const officeStaffData = {
    "REGISTRAR": [
      { name: "Ms. Uy", purpose: "COR/TOR" },
      { name: "Ms. Dela Cruz", purpose: "COR/TOR" }
    ],
    "CLINIC": [
      { name: "Dr. Santos", purpose: "MEDICAL" },
      { name: "Dr. Villanueva", purpose: "MEDICAL" }
    ],
    "CASHIER": [
      { name: "Mr. Tan", purpose: "PAYMENT" }
    ],
    "CCIS/CTAS OFFICE": [
      { name: "Ms. Sasha Isabela Uy"},
      { name: "Mrs. Cathlene Leah Gabo"},
      { name: "Mr. Raymond Cempron"},
      { name: "Mr. Emiliano Maravilla"},
      { name: "Mrs. Dhoree Maravilla"}
    ],
  };

  const purposeToOfficeMap = {
    "COR/TOR": ["REGISTRAR"],
    "MEDICAL": ["CLINIC"],
    "Medical Checkup": ["CLINIC"],
    "Medical Certificate": ["CLINIC"],
    "Dental Checkup": ["CLINIC"],
    "PAYMENT": ["CASHIER"],
    "INQUIRY": ["CCIS/CTAS OFFICE"],
    "SUBMISSION OF REQUIREMENTS": ["CCIS/CTAS OFFICE"],
  };

  const officeToPurposeMap = {
    "REGISTRAR": ["COR/TOR", "Other"],
    "CLINIC": ["Medical Checkup", "Medical Certificate", "Dental Checkup", "Other"],
    "CASHIER": ["PAYMENT", "Other"],
    "CCIS/CTAS OFFICE": ["INQUIRY", "SUBMISSION OF REQUIREMENTS", "Other"],
  };

  const allStaffOptions = Object.entries(officeStaffData)
    .flatMap(([office, staffList]) => staffList.map(s => ({ ...s, office })));

  // Track which field was filled first
  useEffect(() => {
    if (!firstFilled) {
      if (staffName) setFirstFilled("staff");
      else if (purpose) setFirstFilled("purpose");
      else if (office) setFirstFilled("office");
    }
  }, [staffName, purpose, office]);

  useEffect(() => {
    if (!staffName && !purpose && !office) setFirstFilled(null);
  }, [staffName, purpose, office]);

  // Smart filtering logic
  useEffect(() => {
    if (firstFilled === "staff" && staffName) {
      const selectedStaff = allStaffOptions.find(s => s.name === staffName);
      if (selectedStaff) {
        setOffice(selectedStaff.office);
        setFilteredPurposes(officeToPurposeMap[selectedStaff.office] || purposes);
        setFilteredOffices([selectedStaff.office]);
        // Auto-focus purpose after office is auto-filled
        setTimeout(() => purposeFieldRef.current?.focus?.(), 300);
      }
      setFilteredStaffOptions(allStaffOptions);
    } else if (firstFilled === "purpose" && purpose && purpose !== "Other") {
      if (purposeToOfficeMap[purpose]) {
        setFilteredOffices(purposeToOfficeMap[purpose]);
        if (purposeToOfficeMap[purpose].length === 1) {
          setOffice(purposeToOfficeMap[purpose][0]);
          // Office auto-filled, can proceed to next section
          if (onCustomOfficeSubmit) {
            setTimeout(() => onCustomOfficeSubmit(), 300);
          }
        }
      }
      setFilteredPurposes(purposes);
    } else if (firstFilled === "office" && office && office !== "Other") {
      setFilteredPurposes(officeToPurposeMap[office] || purposes);
      if (officeStaffData[office]) setFilteredStaffOptions(officeStaffData[office]);
      setFilteredOffices(offices);
      // Auto-focus purpose after office is selected
      setTimeout(() => purposeFieldRef.current?.focus?.(), 300);
    } else {
      setFilteredPurposes(purposes);
      setFilteredOffices(offices);
      setFilteredStaffOptions(allStaffOptions);
    }
  }, [staffName, purpose, office, firstFilled]);

  const handleReset = () => {
    setPurpose("");
    setOffice("");
    setCustomPurpose("");
    setCustomOffice("");
    setStaffName("");
    setErrors({ purpose: false, office: false });
    setShowResetConfirm(false);
    setFirstFilled(null);
  };

  // Handle when office is selected
  const handleOfficeChange = (value) => {
    setOffice(value);
    if (errors?.office) {
      setErrors((prev) => ({ ...prev, office: false }));
    }
    
    // If "Other" is selected, focus custom office input
    if (value === "Other") {
      setTimeout(() => customOfficeRef?.current?.focus?.(), 300);
    } else if (value) {
      // Otherwise focus purpose field
      setTimeout(() => purposeFieldRef.current?.focus?.(), 300);
    }
  };

  // Handle when purpose is selected
  const handlePurposeChange = (value) => {
    setPurpose(value);
    if (errors?.purpose) {
      setErrors((prev) => ({ ...prev, purpose: false }));
    }
    
    // If "Other" is selected, focus custom purpose input
    if (value === "Other") {
      setTimeout(() => customPurposeRef?.current?.focus?.(), 300);
    } else if (value && onCustomPurposeSubmit) {
      // Otherwise proceed to next section
      setTimeout(() => onCustomPurposeSubmit(), 300);
    }
  };

  const isOfficeDisabled = firstFilled === "staff" && !!staffName;

  return (
    <View style={{ marginTop: 32 * scale, paddingHorizontal: 24 * scale }}>
      <SectionTitle
        icon={<Ionicons name="location-outline" size={20 * scale} color="#b6b6b6" />}
        text="Visit Information"
      />

      <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 2, borderColor: "#6366f1", borderRadius: 16 * scale, padding: 24 * scale, marginTop: 4 * scale }}>

        {/* STAFF */}
        <SelectField
          ref={staffFieldRef}
          icon={<Ionicons name="person-circle-outline" size={20 * scale} color="#0a3aca" />}
          selectedValue={staffName}
          onValueChange={setStaffName}
          placeholder="Staff / Instructor Name (optional)"
          options={filteredStaffOptions.map(s => s.name)}
          scale={scale}
        />

        {/* OFFICE */}
        <View onLayout={onOfficeLayout}>
          <SelectField
            ref={officeFieldRef}
            icon={<FontAwesome name="building-o" size={20 * scale} color="#0a3aca" />}
            selectedValue={office}
            onValueChange={handleOfficeChange}
            placeholder="Office to Visit"
            options={filteredOffices}
            scale={scale}
            hasError={errors.office}
            disabled={isOfficeDisabled}
          />
        </View>

        {/* CUSTOM OFFICE */}
        {office === "Other" && (
          <InputField
            icon={<Ionicons name="business-outline" size={20 * scale} color="#0a3aca" />}
            placeholder="Please specify the office"
            value={customOffice}
            onChangeText={setCustomOffice}
            uppercase
            scale={scale}
            ref={customOfficeRef}
            onSubmitEditing={() => {
              // After custom office, focus purpose field
              purposeFieldRef.current?.focus?.();
            }}
            returnKeyType="next"
          />
        )}

        {/* PURPOSE */}
        <View onLayout={onPurposeLayout}>
          <SelectField
            ref={purposeFieldRef}
            icon={<Ionicons name="newspaper-outline" size={20 * scale} color="#0a3aca" />}
            selectedValue={purpose}
            onValueChange={handlePurposeChange}
            placeholder="Purpose of Visit"
            options={filteredPurposes}
            scale={scale}
            hasError={errors.purpose}
          />
        </View>

        {/* CUSTOM PURPOSE */}
        {purpose === "Other" && (
          <InputField
            icon={<Ionicons name="create-outline" size={20 * scale} color="#0a3aca" />}
            placeholder="Please specify your purpose"
            value={customPurpose}
            onChangeText={setCustomPurpose}
            uppercase
            scale={scale}
            ref={customPurposeRef}
            onSubmitEditing={onCustomPurposeSubmit}
            returnKeyType="next"
          />
        )}

        {/* RESET BUTTON */}
        <Pressable
          onPress={() => setShowResetConfirm(true)}
          style={{
            marginTop: 16 * scale,
            alignSelf: "flex-end",
            paddingHorizontal: 16 * scale,
            paddingVertical: 8 * scale,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#ff5555",
          }}
        >
          <Text style={{ color: "#ff7777", fontWeight: "bold" }}>Reset</Text>
        </Pressable>
      </View>

      {/* RESET MODAL */}
      <Modal visible={showResetConfirm} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#ffffffdd", padding: 20 * scale, width: "80%", borderRadius: 14, alignItems: "center" }}>
            <Ionicons name="alert-circle-outline" size={42 * scale} color="#d70000" />
            <Text style={{ fontSize: 16 * scale, marginVertical: 10, fontWeight: "600" }}>
              Are you sure you want to reset?
            </Text>

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <Pressable
                onPress={() => setShowResetConfirm(false)}
                style={{ paddingHorizontal: 20 * scale, paddingVertical: 8 * scale, borderRadius: 8, backgroundColor: "#999", marginRight: 16 }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleReset}
                style={{ paddingHorizontal: 20 * scale, paddingVertical: 8 * scale, borderRadius: 8, backgroundColor: "#d70000" }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Yes, Reset</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default VisitInfoSection;