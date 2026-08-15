import React from "react";
import { View, Text, ImageBackground, Image, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Pressable from "../components/SystemPressable";

export default function ThankYouScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  // 📏 Scale factor based on screen width
  const isLarge = width > 800; // tablets or large screens
  const isTablet = width > 600 && width <= 800;
  const scale = isLarge ? 1.4 : isTablet ? 1.2 : 1;

  return (
    <ImageBackground
      source={require("../assets/images/TY2.png")}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 * scale }}
      resizeMode="cover"
    >
      {/* Illustration */}
      <Image
        source={require("../assets/images/TY1.png")}
        style={{ width: 256 * scale, height: 256 * scale, marginBottom: 5 * scale }}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={{ color: "white", fontSize: 24 * scale, fontWeight: "bold", marginBottom: 8 * scale }}>
        THANK YOU!
      </Text>
      <Text style={{ color: "#D1D5DB", fontSize: 16 * scale, marginBottom: 32 * scale }}>
        VISIT COMPLETE
      </Text>

      {/* Message */}
      <Text style={{ color: "white", textAlign: "center", fontSize: 14 * scale, marginBottom: 32 * scale }}>
        We hope to see you again soon!
      </Text>

      {/* Button */}
      <Pressable
        style={{
          backgroundColor: "#8540d8ff",
          paddingVertical: 12 * scale,
          paddingHorizontal: 32 * scale,
          borderRadius: 12 * scale,
          minWidth: width * 0.5,
          maxWidth: width * 0.8,
          alignItems: "center",
        }}
        onPress={() => navigation.navigate("index")}
      >
        <Text style={{ color: "white", fontWeight: "600", fontSize: 16 * scale }}>HOME</Text>
      </Pressable>
    </ImageBackground>
  );
}
