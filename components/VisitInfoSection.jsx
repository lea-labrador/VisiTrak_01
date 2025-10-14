import React, { useState, useEffect } from "react";
import { View } from "react-native";
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
}) {
  // Local states for “Other” text fields
  const [customPurpose, setCustomPurpose] = useState("");
  const [customOffice, setCustomOffice] = useState("");

  // 🔄 Automatically set office based on selected purpose
  useEffect(() => {
    if (purpose === "COR/TOR") setOffice("Registrar");
    else if (purpose === "Medical") setOffice("Clinic");
    else if (purpose === "Payment") setOffice("Cashier");
    else if (purpose === "Other") setOffice(""); // reset for “Other”
  }, [purpose]);

  return (
    <View className="mt-8 px-9">
      <SectionTitle
        icon={<Ionicons name="location-outline" size={20} color="#b6b6b6" />}
        text="Visit Information"
      />
      <View className="bg-white/10 border-2 border-indigo-400 rounded-xl p-6">
        
        {/* Purpose Select */}
        <SelectField
          icon={<Ionicons name="newspaper-outline" size={20} color="#0a3aca" />}
          selectedValue={purpose}
          onValueChange={(value) => {
            setPurpose(value);
            if (value !== "Other") setCustomPurpose("");
          }}
          placeholder="Purpose of Visit"
          options={purposes}
        />

        {/* “Other” Purpose Text Field */}
        {purpose === "Other" && (
          <InputField
            icon={<Ionicons name="create-outline" size={20} color="#0a3aca" />}
            placeholder="Please specify your purpose"
            value={customPurpose}
            onChangeText={setCustomPurpose}
            uppercase
          />
        )}

        {/* Office Select */}
        <SelectField
          icon={<FontAwesome name="building-o" size={20} color="#0a3aca" />}
          selectedValue={office}
          onValueChange={(value) => {
            setOffice(value);
            if (value !== "Other") setCustomOffice("");
          }}
          placeholder="Office to Visit"
          options={offices}
        />

        {/* “Other” Office Text Field */}
        {office === "Other" && (
          <InputField
            icon={<Ionicons name="business-outline" size={20} color="#0a3aca" />}
            placeholder="Please specify the office"
            value={customOffice}
            onChangeText={setCustomOffice}
            uppercase
          />
        )}
      </View>
    </View>
  );
}
