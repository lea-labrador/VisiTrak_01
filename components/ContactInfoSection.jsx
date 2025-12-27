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
  contactNumberRef,       // ref for contact number
  onContactSubmit,        // Enter handler to move to next
  emailRef,               // ref for email input
  onEmailSubmit           // Enter handler (usually submit form)
}) {
  const { width } = useWindowDimensions();
  const [contactWarning, setContactWarning] = useState("");
  const [emailWarning, setEmailWarning] = useState("");

  const isLarge = width > 800;
  const isTablet = width > 600 && width <= 800;
  const scale = isLarge ? 1.4 : isTablet ? 1.2 : 1;

  const handleContactChange = (text) => {
    const hasNonDigit = /[^0-9]/.test(text);
    let filteredText = text.replace(/[^0-9]/g, "");

    if (filteredText.length === 0) {
      setContactNumber("");
      setContactWarning("");
      return;
    }

    if (!filteredText.startsWith("09")) {
      if (filteredText.startsWith("0")) filteredText = "09" + filteredText.substring(1);
      else filteredText = "09" + filteredText;
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
    <View style={{ marginTop: 32 * scale, paddingHorizontal: 24 * scale }}>
      <SectionTitle
        icon={<MaterialIcons name="contact-phone" size={18 * scale} color="#fff" />}
        text="Contact Information"
        scale={scale}
      />

      <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 2, borderColor: "#6366f1", borderRadius: 16 * scale, padding: 24 * scale, marginTop: 4 * scale }}>
        
        {contactWarning ? <Text style={{ color: "orange", marginBottom: 8 * scale, fontSize: 12 * scale }}>{contactWarning}</Text> : null}

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
            ref={contactNumberRef}        // attach ref
            onSubmitEditing={onContactSubmit} // move to next field
            returnKeyType="next"
          />
        </View>

        {emailWarning ? <Text style={{ color: "orange", marginTop: 16 * scale, marginBottom: 8 * scale, fontSize: 12 * scale }}>{emailWarning}</Text> : null}

        <InputField
          icon={<Entypo name="email" size={16 * scale} color="#0a3aca" />}
          placeholder="Email (optional)"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          scale={scale}
          hasError={!!emailWarning}
          ref={emailRef}               // attach ref
          onSubmitEditing={onEmailSubmit} // usually submit form
          returnKeyType="done"
        />
      </View>
    </View>
  );
}
