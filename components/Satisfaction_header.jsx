import React from "react";
import { Alert, View, Text, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Header({ title }) {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // 📱 Responsive scale
  const isLarge = width > 700;
  const scale = isLarge ? 1.4 : width > 600 ? 1.2 : 1;
  const confirmBackToHome = () => {
    Alert.alert(
      "Leave this page?",
      "Are you sure you want to go back to the home screen?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Go Back",
          onPress: () => router.replace("/"),
        },
      ]
    );
  };

  return (
    <View className="flex-row items-center" style={{
      marginBottom: 8 * scale,
      paddingTop: 5 * scale,
    }}>
      <Pressable
        onPress={confirmBackToHome}
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
