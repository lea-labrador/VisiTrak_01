import React, { useState, useRef } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SectionTitle from "./SectionTitle";
import InputField from "./InputField";
import BoholAddressSelector from "./BoholAddressSelector";
import { checkActiveVisitByNameToday } from "../lib/visits.service";

export default function PersonalInfoSection({
  fullName,
  setFullName,
  homeAddress,
  setHomeAddress,
  errors,
  setErrors,
  onNameLayout,
  onAddressLayout,
  onAddressPartsChange,
  fullNameRef,
  homeAddressRef,
  onFullNameSubmit,
  onHomeAddressSubmit,
}) {
  const { width } = useWindowDimensions();
  const [nameWarning, setNameWarning] = useState("");
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const debounceRef = useRef(null);
  const [isOutsideBohol, setIsOutsideBohol] = useState(false);

  // -------------------------
  // Dynamic Scale Factor
  // -------------------------
  const baseWidth = 400; // your design base width
  const scale = Math.min(Math.max(width / baseWidth, 0.8), 1.8); // clamp to 0.8 - 1.8
  const isPhone = width < 600;

  // -------------------------
  // Sizes Object (All Dynamic)
  // -------------------------
  const sizes = {
    marginTop: 36 * scale,
    paddingHorizontal: 24 * scale,
    containerPadding: 24 * scale,
    borderRadius: 16 * scale,
    sectionTitleIcon: 20 * scale,
    warningFont: 12 * scale,
    warningMarginBottom: 8 * scale,
    activityFont: 12 * scale,
    activityMarginLeft: 8 * scale,
    inputIconSize: 20 * scale,
    inputFontSize: 14 * scale,
    toggleTextSize: 13 * scale,
    toggleMarginBottom: 10 * scale,
  };

  // -------------------------
  // Name Change Handler
  // -------------------------
  const handleNameChange = (text) => {
    const filteredText = text.replace(/[^a-zA-Z\s]/g, "");
    let warning = "";

    if (text !== filteredText) warning = "Only letters and spaces are allowed";

    if (filteredText.length > 0 && filteredText.trim().length === 0) {
      warning = "Name cannot be only spaces";
      setNameWarning(warning);
      setFullName("");
      return;
    }

    setNameWarning(warning);
    setFullName(filteredText);

    if (errors?.fullName && setErrors) {
      setErrors((prev) => ({ ...prev, fullName: false }));
    }

    // 🔥 Debounced Duplicate Check
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (filteredText.trim().length < 2) return;
      try {
        setCheckingDuplicate(true);
        const exists = await checkActiveVisitByNameToday(filteredText.trim());
        if (exists) {
          setNameWarning("⚠️ This visitor is already checked in today");
          if (setErrors) {
            setErrors((prev) => ({ ...prev, fullName: true }));
          }
        } else {
          setNameWarning("");
        }
      } catch (err) {
        console.log("Duplicate check error:", err);
      } finally {
        setCheckingDuplicate(false);
      }
    }, 500);
  };

  const handleOutsideBoholToggle = () => {
    setIsOutsideBohol((prev) => !prev);
    setHomeAddress("");
    if (setErrors) {
      setErrors((prev) => ({ ...prev, homeAddress: false }));
    }
  };

  const handleOutsideAddressChange = (text) => {
    setHomeAddress(text.toUpperCase());
    if (errors?.homeAddress && setErrors) {
      setErrors((prev) => ({ ...prev, homeAddress: false }));
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <View style={{ marginTop: sizes.marginTop, paddingHorizontal: sizes.paddingHorizontal }}>
      {/* Section Title */}
      <SectionTitle
        icon={<Ionicons name="person" size={sizes.sectionTitleIcon} color="#b6b6b6" />}
        text="Personal Information"
        scale={scale}
      />

      {/* Container */}
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderWidth: 2,
          borderColor: "#6366f1",
          borderRadius: sizes.borderRadius,
          padding: sizes.containerPadding,
          marginTop: 4 * scale,
        }}
      >
        {/* Warning */}
        {nameWarning ? (
          <Text
            style={{
              color: nameWarning.includes("already") ? "#ff4d4f" : "orange",
              marginBottom: sizes.warningMarginBottom,
              fontSize: sizes.warningFont,
              fontWeight: "500",
            }}
          >
            {nameWarning}
          </Text>
        ) : null}

        {/* Loading Indicator */}
        {checkingDuplicate && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: sizes.warningMarginBottom,
            }}
          >
            <ActivityIndicator size="small" color="#6366f1" />
            <Text
              style={{
                marginLeft: sizes.activityMarginLeft,
                fontSize: sizes.activityFont,
                color: "#b6b6b6",
              }}
            >
              Checking visitor...
            </Text>
          </View>
        )} 

        {/* Full Name */}
        <View onLayout={onNameLayout}>
          <InputField
            ref={fullNameRef}
            icon={
              <Ionicons name="person-outline" size={sizes.inputIconSize} color="#0a3aca" />
            }
            placeholder="Full Name (e.g., LEA SHEILA LABRADOR)"
            value={fullName}
            onChangeText={handleNameChange}
            uppercase
            autoCapitalize="characters"
            onSubmitEditing={onFullNameSubmit}
            returnKeyType="next"
            scale={scale}
            hasError={errors?.fullName || !!nameWarning}
          />
        </View>

        {/* Outside Bohol Toggle */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: "#e5e7eb",
              fontSize: sizes.toggleTextSize,
              fontWeight: "600",
            }}
          >
            OUTSIDE BOHOL?
          </Text>
          <Switch
            value={isOutsideBohol}
            onValueChange={handleOutsideBoholToggle}
            trackColor={{ false: "#6b7280", true: "#818cf8" }}
            thumbColor={isOutsideBohol ? "#4f46e5" : "#f9fafb"}
            ios_backgroundColor="#6b7280"
            style={{
              transform: [{ scaleX: isPhone ? 0.95 : 1 }, { scaleY: isPhone ? 0.95 : 1 }],
            }}
          />
        </View>

        {/* Address */}
        <View onLayout={onAddressLayout}>
          {isOutsideBohol ? (
            <InputField
              ref={homeAddressRef}
              icon={
                <Ionicons
                  name="location-outline"
                  size={sizes.inputIconSize}
                  color="#0a3aca"
                />
              }
              placeholder="Complete Address (OUTSIDE BOHOL)"
              value={homeAddress}
              onChangeText={handleOutsideAddressChange}
              uppercase
              autoCapitalize="characters"
              onSubmitEditing={onHomeAddressSubmit}
              returnKeyType="next"
              scale={scale}
              hasError={errors?.homeAddress}
            />
          ) : (
            <BoholAddressSelector
              ref={homeAddressRef}
              homeAddress={homeAddress}
              setHomeAddress={setHomeAddress}
              errors={errors}
              setErrors={setErrors}
              onAddressPartsChange={onAddressPartsChange}
              onSubmitEditing={onHomeAddressSubmit}
            />
          )}
        </View>
      </View>
    </View>
  );
}
