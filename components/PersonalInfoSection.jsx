import React, { useState } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SectionTitle from "./SectionTitle";
import InputField from "./InputField";
import BoholAddressSelector from "./BoholAddressSelector";

export default function PersonalInfoSection({
  fullName,
  setFullName,
  homeAddress,
  setHomeAddress,
  errors,
  setErrors, // 🔹 recommended to pass from parent
  onNameLayout,
  onAddressLayout,
  onAddressPartsChange
}) {
  const { width } = useWindowDimensions();
  const [nameWarning, setNameWarning] = useState("");

  // Responsive scaling
  const isLarge = width > 800;
  const isTablet = width > 600 && width <= 800;
  const scale = isLarge ? 1.4 : isTablet ? 1.2 : 1;

  const handleNameChange = (text) => {
    // Allow only letters and spaces
    const filteredText = text.replace(/[^a-zA-Z\s]/g, "");

    // Determine warnings: invalid chars OR spaces-only
    let warning = "";
    if (text !== filteredText) {
      warning = "Only letters and spaces are allowed";
    }

    // If user entered characters but they are all spaces, warn and do not set the name
    if (filteredText.length > 0 && filteredText.trim().length === 0) {
      warning = "Name cannot be only spaces";
      setNameWarning(warning);

      // clear stored full name (avoid saving spaces)
      setFullName("");

      // Clear error safely
      if (errors?.fullName && setErrors) {
        setErrors((prev) => ({ ...prev, fullName: false }));
      }

      return;
    }

    setNameWarning(warning);
    setFullName(filteredText);

    // Clear error safely
    if (errors?.fullName && setErrors) {
      setErrors((prev) => ({ ...prev, fullName: false }));
    }
  };

  return (
    <View
      style={{
        marginTop: 36 * scale,
        paddingHorizontal: 24 * scale,
      }}
    >
      {/* Title */}
      <SectionTitle
        icon={<Ionicons name="person" size={20 * scale} color="#b6b6b6" />}
        text="Personal Information"
        scale={scale}
      />

      {/* Main Container */}
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderWidth: 2,
          borderColor: "#6366f1",
          borderRadius: 16 * scale,
          padding: 24 * scale,
          marginTop: 4 * scale,
        }}
      >
        {/* Warning */}
        {nameWarning ? (
          <Text
            style={{
              color: "orange",
              marginBottom: 8 * scale,
              fontSize: 12 * scale,
            }}
          >
            {nameWarning}
          </Text>
        ) : null}

        {/* Full Name */}
        <View onLayout={onNameLayout}>
          <InputField
            icon={
              <Ionicons
                name="person-outline"
                size={20 * scale}
                color="#0a3aca"
              />
            }
            placeholder="Full Name"
            value={fullName}
            onChangeText={handleNameChange}
            uppercase
            scale={scale}
            hasError={errors?.fullName || !!nameWarning}
          />
        </View>

        {/* Bohol Address Selector */}
        <View onLayout={onAddressLayout}>
          <BoholAddressSelector
            homeAddress={homeAddress}
            setHomeAddress={setHomeAddress}
            errors={errors}
            setErrors={setErrors}
            onAddressPartsChange={onAddressPartsChange}
          />
        </View>
      </View>
    </View>
  );
}
