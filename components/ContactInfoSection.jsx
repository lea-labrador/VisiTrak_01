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
  errors, // new prop
  onContactLayout,
}) {
  const { width } = useWindowDimensions();
  const [contactWarning, setContactWarning] = useState("");
  const [emailWarning, setEmailWarning] = useState("");

  const isLarge = width > 800;
  const isTablet = width > 600 && width <= 800;
  const scale = isLarge ? 1.4 : isTablet ? 1.2 : 1;

  const handleContactChange = (text) => {
    // Record whether user typed any non-digit characters
    const hasNonDigit = /[^0-9]/.test(text);

    // Remove non-digit characters
    let filteredText = text.replace(/[^0-9]/g, "");

    if (filteredText.length === 0) {
      setContactNumber("");
      setContactWarning("");
      return;
    }

    // If it doesn't start with '09'
    if (!filteredText.startsWith("09")) {
      if (filteredText.startsWith("0")) {
        // If it starts with '0' but not '09', replace '0' with '09'
        filteredText = "09" + filteredText.substring(1);
      } else {
        // If it doesn't start with '0' or '09', prepend '09'
        filteredText = "09" + filteredText;
      }
    }

    // Limit to 11 digits
    if (filteredText.length > 11) {
      filteredText = filteredText.slice(0, 11);
    }

    // Warnings: prefer non-numeric warning first, then length warning
    if (hasNonDigit) {
      setContactWarning("Only numbers are allowed");
    } else if (filteredText.length > 0 && filteredText.length !== 11) {
      setContactWarning("Contact number must be 11 digits");
    } else {
      setContactWarning("");
    }

    setContactNumber(filteredText);

    // Remove red focus when user starts typing
    if (errors?.contactNumber) {
      // keep the errors object update consistent with parent usage
      setTimeout(() => {
        if (errors?.contactNumber) errors.contactNumber = false;
      }, 0);
    }
  };

  const handleEmailChange = (text) => {
    // Auto-complete when user types "@"
    if (text.includes("@") && !text.toLowerCase().endsWith("@gmail.com")) {
      const atIndex = text.indexOf("@");
      const beforeAt = text.slice(0, atIndex + 1); // Include the "@"
      
      // Only auto-complete if there's text before "@" and it doesn't already end with "gmail.com"
      if (beforeAt.length > 1 && !text.toLowerCase().endsWith("gmail.com")) {
        text = beforeAt + "gmail.com";
      }
    }

    setEmail(text);

    // Validate email only if it's not empty
    if (text.trim() !== "") {
      if (!text.toLowerCase().endsWith("@gmail.com")) {
        setEmailWarning("Email must end with @gmail.com");
      } else {
        setEmailWarning("");
      }
    } else {
      setEmailWarning(""); // Clear warning if email is empty
    }
  };

  return (
    <View style={{ marginTop: 32 * scale, paddingHorizontal: 24 * scale }}>
      <SectionTitle
        icon={<MaterialIcons name="contact-phone" size={18 * scale} color="#fff" />}
        text="Contact Information"
        scale={scale}
      />

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
        {/* Contact Number Warning */}
        {contactWarning ? (
          <Text style={{ color: "orange", marginBottom: 8 * scale, fontSize: 12 * scale }}>
            {contactWarning}
          </Text>
        ) : null}

        {/* Contact Number */}
        <View onLayout={onContactLayout}>
          <InputField
            icon={<Entypo name="phone" size={16 * scale} color="#0a3aca" />}
            placeholder="Contact Number"
            value={contactNumber || "09"}
            onChangeText={handleContactChange}
            keyboardType="phone-pad"
            uppercase
            scale={scale}
            hasError={errors?.contactNumber}
          />
        </View>

        {/* Email Warning */}
        {emailWarning ? (
          <Text style={{ color: "orange", marginTop: 16 * scale, marginBottom: 8 * scale, fontSize: 12 * scale }}>
            {emailWarning}
          </Text>
        ) : null}

        {/* Email */}
        <InputField
          icon={<Entypo name="email" size={16 * scale} color="#0a3aca" />}
          placeholder="Email (optional)"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          scale={scale}
          hasError={!!emailWarning} // Show error state when there's a warning
        />
      </View>
    </View>
  );
}