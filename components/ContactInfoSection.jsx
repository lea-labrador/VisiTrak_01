import React, { useState } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import SectionTitle from "./SectionTitle";
import InputField from "./InputField";

export default function ContactInfoSection({
  contactNumber,
  setContactNumber,
  email,
  setEmail,
  errors,
  onContactLayout,
  contactNumberRef,
  onContactSubmit,
  emailRef,
  onEmailSubmit
}) {
  const { width } = useWindowDimensions();
  const [contactWarning, setContactWarning] = useState("");
  const [emailWarning, setEmailWarning] = useState("");

  // -----------------------
  // Responsive / Elderly-friendly scaling
  // -----------------------
  const scale = Math.min(Math.max(width / 400, 0.8), 1.8);
  const isPhone = width < 600;

  const sizes = {
    marginTop: 36 * scale,
    paddingHorizontal: 24 * scale,
    containerPadding: 24 * scale,
    borderRadius: 18 * scale,
    sectionIconSize: 22 * scale,
    inputIconSize: 20 * scale,
    inputFontSize: 20 * scale,
    warningFontSize: 12 * scale,
    warningMargin: 8 * scale,
    fieldSpacing: 18 * scale
  };

  // -----------------------
  // Handlers
  // -----------------------
  const handleContactChange = (text) => {
    const hasNonDigit = /[^0-9]/.test(text);
    let filteredText = text.replace(/[^0-9]/g, "");

    if (filteredText.length === 0) {
      setContactNumber("");
      setContactWarning("");
      return;
    }

    if (!filteredText.startsWith("09")) {
      filteredText = filteredText.startsWith("0") ? "09" + filteredText.substring(1) : "09" + filteredText;
    }

    if (filteredText.length > 11) filteredText = filteredText.slice(0, 11);

    if (hasNonDigit) setContactWarning("Only numbers are allowed");
    else if (filteredText.length > 0 && filteredText.length !== 11) setContactWarning("Contact number must be 11 digits");
    else setContactWarning("");

    setContactNumber(filteredText);

    if (errors?.contactNumber) {
      setTimeout(() => { if (errors?.contactNumber) errors.contactNumber = false; }, 0);
    }
  };

  const handleEmailChange = (text) => {
    if (text.includes("@") && !text.toLowerCase().endsWith("@gmail.com")) {
      const atIndex = text.indexOf("@");
      const beforeAt = text.slice(0, atIndex + 1);
      if (beforeAt.length > 1 && !text.toLowerCase().endsWith("gmail.com")) text = beforeAt + "gmail.com";
    }

    setEmail(text);

    if (text.trim() !== "") {
      if (!text.toLowerCase().endsWith("@gmail.com")) setEmailWarning("Email must end with @gmail.com");
      else setEmailWarning("");
    } else setEmailWarning("");
  };

  return (
    <View style={{ marginTop: sizes.marginTop, paddingHorizontal: sizes.paddingHorizontal }}>
      <SectionTitle
        icon={<MaterialIcons name="contact-phone" size={sizes.sectionIconSize} color="#fff" />}
        text="Contact Information"
        scale={scale}
      />

      <View style={{
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 2,
        borderColor: "#6366f1",
        borderRadius: sizes.borderRadius,
        padding: sizes.containerPadding,
        marginTop: 4 * scale
      }}>
        {/* Contact Warning */}
        {contactWarning ? (
          <Text style={{
            color: "orange",
            marginBottom: sizes.warningMargin,
            fontSize: sizes.warningFontSize,
            fontWeight: "500"
          }}>
            {contactWarning}
          </Text>
        ) : null}

        {/* Contact Number */}
        <View onLayout={onContactLayout} style={{ marginBottom: sizes.fieldSpacing }}>
          <InputField
            icon={<Entypo name="phone" size={sizes.inputIconSize} color="#0a3aca" />}
            placeholder="Contact Number"
            value={contactNumber || "09"}
            onChangeText={handleContactChange}
            keyboardType="phone-pad"
            uppercase
            scale={scale}
            hasError={errors?.contactNumber}
            ref={contactNumberRef}
            onSubmitEditing={onContactSubmit}
            returnKeyType="next"
          />
        </View>

        {/* Email Warning */}
        {emailWarning ? (
          <Text style={{
            color: "orange",
            marginBottom: sizes.warningMargin,
            fontSize: sizes.warningFontSize,
            fontWeight: "500"
          }}>
            {emailWarning}
          </Text>
        ) : null}

        {/* Email */}
        <InputField
          icon={<Entypo name="email" size={sizes.inputIconSize} color="#0a3aca" />}
          placeholder="Email (optional)"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          scale={scale}
          hasError={!!emailWarning}
          ref={emailRef}
          onSubmitEditing={onEmailSubmit}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}
