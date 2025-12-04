import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Header({ title }) {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // 📏 Scale factor based on device width
  const isLarge = width > 800;
  const isTablet = width > 600 && width <= 800;
  const scale = isLarge ? 1.4 : isTablet ? 1.2 : 1;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16 * scale,
        paddingHorizontal: 16 * scale,
        position: "relative",
      }}
    >
      {/* Title */}
      <Text
        style={{
          color: "white",
          fontSize: 24 * scale,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      {/* Forward Button (top-right) */}
      <Pressable
        onPress={() => router.push("/")}
        style={{
          position: "absolute",
          right: 16 * scale,
          width: 44 * scale,
          height: 44 * scale,
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: 12 * scale,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: "#6B7280",
        }}
      >
        <Ionicons name="chevron-forward" size={24 * scale} color="white" />
      </Pressable>
    </View>
  );
}
