import React from "react";
import { View, Text, Image, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";

import successIcon from "../assets/images/success_icon.png";
import qrSample from "../assets/images/qr-sample.png";

export default function SuccessCard({ name, address, checkIn, visiting }) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // 📱 Dynamically scale based on screen width
  const isLargeScreen = width > 800; // e.g., tablets or landscape
  const scale = isLargeScreen ? 1.4 : width > 600 ? 1.2 : 1; // smooth scaling tiers

  return (
    <View
      className="relative bg-white/10 backdrop-blur-md border border-indigo-300 rounded-2xl shadow-lg self-center mt-24"
      style={{
        width: Math.min(width * 0.9, 500 * scale),
        padding: 20 * scale,
      }}
    >
      {/* ✅ Centered Success Icon Overlay */}
      <View
        className="absolute"
        style={{
          top: -95 * scale,
          left: "50%",
          transform: [{ translateX: -(92 * scale) / 2 }],
        }}
      >
        <Image
          source={successIcon}
          style={{
            width: 144 * scale,
            height: 144 * scale,
          }}
          resizeMode="contain"
        />
      </View>

      {/* ✅ Success Text */}
      <Text
        className="text-center text-green-400 font-semibold mt-12"
        style={{ fontSize: 20 * scale }}
      >
        Successfully Checked In
      </Text>

      <View
        className="bg-green-400 opacity-70 self-center"
        style={{ height: 1, width: "90%", marginVertical: 12 * scale }}
      />

      {/* ✅ QR + User Info Section */}
      <View className="flex-row items-center justify-center mt-2">
        {/* Visitor Info */}
        <View className="mt-4">
          <Text
            className="text-white font-bold mb-2"
            style={{ fontSize: 25 * scale }}
          >
            {name}
          </Text>
          <Text
            className="text-white font-medium mt-1 mb-5"
            style={{ fontSize: 18 * scale, textAlign: "center" }}
          >
            {address}
          </Text>
        </View>
      </View>


      <View
        className="bg-gray-400/40"
        style={{ height: 1, marginVertical: 16 * scale }}
      />

      {/* ✅ Check-in Info */}
      <View style={{ gap: 8 * scale }}>
        <View className="flex-row justify-between">
          <Text
            className="text-white font-medium"
            style={{ fontSize: 17 * scale }}
          >
            CHECK IN:
          </Text>
          <Text
            className="text-white font-normal"
            style={{ fontSize: 17 * scale }}
          >
            {checkIn}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text
            className="text-white font-medium"
            style={{ fontSize: 17 * scale }}
          >
            VISITING:
          </Text>
          <Text
            className="text-white font-normal"
            style={{ fontSize: 17 * scale }}
          >
            {visiting}
          </Text>
        </View>
      </View>
    </View>
  );
}
