import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SectionTitle from "./SectionTitle";
import InputField from "./InputField";

export default function PersonalInfoSection({ fullName, setFullName, homeAddress, setHomeAddress }) {
  return (
    <View className="mt-24 px-9">
      <SectionTitle
        icon={<Ionicons name="person" size={20} color="#b6b6b6" />}
        text="Personal Information"
      />
      <View className="bg-white/10 border-2 border-indigo-400 rounded-xl p-6">
        <InputField
          icon={<Ionicons name="person-outline" size={20} color="#0a3aca" />}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          uppercase
        />
        <InputField
          icon={<Ionicons name="home-outline" size={20} color="#0a3aca" />}
          placeholder="Home Address"
          value={homeAddress}
          onChangeText={setHomeAddress}
          uppercase
        />
      </View>
    </View>
  );
}
