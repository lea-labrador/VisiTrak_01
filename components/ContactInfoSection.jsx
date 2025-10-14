import React from "react";
import { View } from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import SectionTitle from "./SectionTitle";
import InputField from "./InputField";

export default function ContactInfoSection({
  contactNumber,
  setContactNumber,
  email,
  setEmail,
}) {
  return (
    <View className="mt-8 px-9">
      <SectionTitle
        icon={<MaterialIcons name="contact-phone" size={18} color="#fff" />}
        text="Contact Information"
      />
      <View className="bg-white/10 border-2 border-indigo-400 rounded-xl p-6">
        <InputField
          icon={<Entypo name="phone" size={16} color="#0a3aca" />}
          placeholder="Contact Number"
          value={contactNumber}
          onChangeText={setContactNumber}
          uppercase
        />
        <InputField
          icon={<Entypo name="email" size={16} color="#0a3aca" />}
          placeholder="Email (optional)"
          value={email}
          onChangeText={setEmail}
        />
      </View>
    </View>
  );
}
