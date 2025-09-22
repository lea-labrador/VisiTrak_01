// components/Header.jsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function Header({ title }) {
  return (
    <View className="flex-row items-center mb-2">
      <Link href="/" asChild>
        <Pressable className="w-11 bg-white/20 rounded-lg p-2 justify-center items-center border-2 border-gray-500 shadow-md">
          <Ionicons name="chevron-back" size={24} color="white" />
        </Pressable>
      </Link>
      <Text className="flex-1 text-3xl font-semibold text-white text-center">
        {title}
      </Text>
      <View className="w-10" />
    </View>
  );
}
