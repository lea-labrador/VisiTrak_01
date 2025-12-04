import React from "react";
import { View, Text, useWindowDimensions } from "react-native";

export default function SectionTitle({ icon, text, hasError = false }) {
  const { width } = useWindowDimensions();

  const isLarge = width > 800;
  const scale = isLarge ? 1.4 : width > 600 ? 1.2 : 1;

  return (
    <View
      className="flex-row items-center mb-3"
      style={{ marginBottom: 12 * scale }}
    >
      <View style={{ transform: [{ scale }] }}>{icon}</View>

      <Text
        style={{
          fontSize: 18 * scale,
          marginLeft: 8 * scale,
          color: hasError ? "red" : "#fff", // 🔴 dynamic color
          fontWeight: "bold",
        }}
      >
        {text}
      </Text>
    </View>
  );
}
