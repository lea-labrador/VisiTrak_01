import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function Header({ title }) {
  const { width } = useWindowDimensions();

  // 📱 Responsive scale
  const isLarge = width > 700;
  const scale = isLarge ? 1.4 : width > 600 ? 1.2 : 1;

  return (
    <View className="flex-row items-center" style={{
      marginBottom: 8 * scale,
      paddingTop: 5 * scale,
    }}>
      <Link href="/" asChild>
        <Pressable
          className="bg-white/20 rounded-lg justify-center items-center border-2 border-blue-200 shadow-md"
          style={{
            width: 44 * scale,
            height: 44 * scale,
            padding: 8 * scale,
            marginLeft: 10 * scale,
          }}
        >
          <Ionicons name="chevron-back" size={24 * scale} color="white" />
        </Pressable>
      </Link>
      <Text
        className="flex-1 font-semibold text-white text-center"
        style={{
          fontSize: 28 * scale,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {title}
      </Text>
      <View style={{ width: 44 * scale }} />
    </View>
  );
}
