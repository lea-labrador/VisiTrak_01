import React, { useState, useEffect } from "react";
import { View, Text, Modal, Pressable, useWindowDimensions } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import SectionTitle from "./SectionTitle";
import SelectField from "./SelectField";
import InputField from "./InputField";

export default function VisitInfoSection({
  purpose,
  setPurpose,
  office,
  setOffice,
  purposes,
  offices,
  errors,
  setErrors,
  onPurposeLayout,
  onOfficeLayout,
}) {
  const [customPurpose, setCustomPurpose] = useState("");
  const [customOffice, setCustomOffice] = useState("");
  const [staffName, setStaffName] = useState("");
  const [firstFilled, setFirstFilled] = useState(null);
  const [filteredPurposes, setFilteredPurposes] = useState(purposes);
  const [filteredOffices, setFilteredOffices] = useState(offices);
  const [filteredStaffOptions, setFilteredStaffOptions] = useState([]);

  // Modal for Reset
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { width } = useWindowDimensions();
  const isLarge = width > 800;
  const isTablet = width > 600 && width <= 800;
  const scale = isLarge ? 1.4 : isTablet ? 1.2 : 1;

  // Mapping Data
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

  const officeToPurposeMap = {
    "REGISTRAR": ["COR/TOR", "Other"],
    "CLINIC": ["Medical Checkup", "Medical Certificate", "Dental Checkup", "Other"],
    "CASHIER": ["PAYMENT", "Other"],
    "CCIS/CTAS OFFICE": ["INQUIRY", "SUBMISSION OF REQUIREMENTS", "Other"],
  };

  const allStaffOptions = Object.entries(officeStaffData)
    .flatMap(([office, staffList]) => staffList.map(s => ({ ...s, office })));

  // Track first filled
  useEffect(() => {
    if (!firstFilled) {
      if (staffName) setFirstFilled("staff");
      else if (purpose) setFirstFilled("purpose");
      else if (office) setFirstFilled("office");
    }
  }, [staffName, purpose, office]);

  useEffect(() => {
    if (!staffName && !purpose && !office) {
      setFirstFilled(null);
    }
  }, [staffName, purpose, office]);

  // SMART FILTERING LOGIC (unchanged)
  useEffect(() => {
    if (firstFilled === "staff" && staffName) {
      const selectedStaff = allStaffOptions.find(s => s.name === staffName);
      if (selectedStaff) {
        if (office !== selectedStaff.office) {
          setOffice(selectedStaff.office);
        }
        if (officeToPurposeMap[selectedStaff.office]) {
          setFilteredPurposes(officeToPurposeMap[selectedStaff.office]);
        }
        setFilteredOffices([selectedStaff.office]);
      }
      setFilteredStaffOptions(allStaffOptions);
    } else if (firstFilled === "purpose" && purpose && purpose !== "Other") {
      if (purposeToOfficeMap[purpose]) {
        setFilteredOffices(purposeToOfficeMap[purpose]);

        if (purposeToOfficeMap[purpose].length === 1) {
          setOffice(purposeToOfficeMap[purpose][0]);
        }
      }
      setFilteredPurposes(purposes);
    } else if (firstFilled === "office" && office && office !== "Other") {
      if (officeToPurposeMap[office]) {
        setFilteredPurposes(officeToPurposeMap[office]);
      }
      if (officeStaffData[office]) {
        setFilteredStaffOptions(officeStaffData[office]);
      }
      setFilteredOffices(offices);
    } else {
      setFilteredPurposes(purposes);
      setFilteredOffices(offices);
      setFilteredStaffOptions(allStaffOptions);
    }
  }, [staffName, purpose, office, firstFilled]);

  // 🔥 RESET FUNCTION
  const handleReset = () => {
    setPurpose("");
    setOffice("");
    setCustomPurpose("");
    setCustomOffice("");
    setStaffName("");
    setErrors({ purpose: false, office: false });
    setFirstFilled(null);
    setShowResetConfirm(false);
  };

  const isOfficeDisabled = firstFilled === "staff" && !!staffName;

  return (
    <View style={{ marginTop: 32 * scale, paddingHorizontal: 24 * scale }}>
      <SectionTitle
        icon={<Ionicons name="location-outline" size={20 * scale} color="#b6b6b6" />}
        text="Visit Information"
      />

      <View
        className="bg-white/10 border-2 border-indigo-400 rounded-xl"
        style={{ padding: 24 * scale, marginTop: 4 * scale }}
      >

        {/* STAFF */}
        <SelectField
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
            icon={<FontAwesome name="building-o" size={20 * scale} color="#0a3aca" />}
            selectedValue={office}
            onValueChange={setOffice}
            placeholder="Office to Visit"
            options={filteredOffices}
            scale={scale}
            hasError={errors.office}
            disabled={isOfficeDisabled}
          />
        </View>

        {office === "Other" && (
          <InputField
            icon={<Ionicons name="business-outline" size={20 * scale} color="#0a3aca" />}
            placeholder="Please specify the office"
            value={customOffice}
            onChangeText={setCustomOffice}
            uppercase
            scale={scale}
          />
        )}

        {/* PURPOSE */}
        <View onLayout={onPurposeLayout}>
          <SelectField
            icon={<Ionicons name="newspaper-outline" size={20 * scale} color="#0a3aca" />}
            selectedValue={purpose}
            onValueChange={setPurpose}
            placeholder="Purpose of Visit"
            options={filteredPurposes}
            scale={scale}
            hasError={errors.purpose}
          />
        </View>

        {purpose === "Other" && (
          <InputField
            icon={<Ionicons name="create-outline" size={20 * scale} color="#0a3aca" />}
            placeholder="Please specify your purpose"
            value={customPurpose}
            onChangeText={setCustomPurpose}
            uppercase
            scale={scale}
          />
        )}

        {/* 🔥 RESET BUTTON */}
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

      {/* 🔥 RESET MODAL */}
      <Modal visible={showResetConfirm} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffffdd",
              padding: 20 * scale,
              width: "80%",
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Ionicons name="alert-circle-outline" size={42 * scale} color="#d70000" />
            <Text style={{ fontSize: 16 * scale, marginVertical: 10, fontWeight: "600" }}>
              Are you sure you want to reset?
            </Text>

            <View style={{ flexDirection: "row", gap: 16, marginTop: 20 }}>
              <Pressable
                onPress={() => setShowResetConfirm(false)}
                style={{
                  paddingHorizontal: 20 * scale,
                  paddingVertical: 8 * scale,
                  borderRadius: 8,
                  backgroundColor: "#999",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleReset}
                style={{
                  paddingHorizontal: 20 * scale,
                  paddingVertical: 8 * scale,
                  borderRadius: 8,
                  backgroundColor: "#d70000",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Yes, Reset</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
