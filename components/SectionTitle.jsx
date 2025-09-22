// components/SectionTitle.jsx
import React from "react";
import { View, Text } from "react-native";

export default function SectionTitle({ icon, text }) {
  return (
    <View className="flex-row items-center mb-3">
      {icon}
      <Text className="text-white font-bold text-lg ml-2">{text}</Text>
    </View>
  );
}
