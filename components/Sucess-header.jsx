import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Header({ title }) {
  const router = useRouter();

  return (
    <View className="relative flex-row items-center justify-center py-6 px-4">
      {/* Title */}
      <Text className="text-white text-3xl font-bold text-center">{title}</Text>

      {/* Forward Button (top-right) */}
      <Pressable
        onPress={() => router.push("/satisfaction")}
        className="absolute right-4 w-11 bg-white/20 rounded-lg p-2 justify-center items-center border-2 border-gray-500 shadow-md active:bg-white/30"
      >
        <Ionicons name="chevron-forward" size={24} color="white" />
      </Pressable>
    </View>
  );
}
