import React from "react";
import { View, Text, Image } from "react-native";
import { useRouter } from "expo-router";

import successIcon from "../assets/images/success_icon.png";
import qrSample from "../assets/images/qr-sample.png";

export default function SuccessCard({ name, exitKey, checkIn, visiting }) {
  const router = useRouter();

  return (
    <View className="relative bg-white/10 backdrop-blur-md border border-indigo-300 rounded-xl shadow-lg w-11/12 max-w-md self-center p-6 mt-24">

      {/* ✅ Centered Success Icon Overlay */}
      <View className="absolute -top-20 left-1/2 -translate-x-1/3">
        <Image
          source={successIcon}
          className="w-36 h-36" // increased slightly for better visual balance
          resizeMode="contain"
        />
      </View>

      {/* ✅ Success Text */}
      <Text className="text-center text-green-400 font-semibold mt-12 text-xl">
        Successfully Checked In
      </Text>

      <View className="my-3 h-[1px] bg-green-400 opacity-70" />

      {/* ✅ QR + User Info Section */}
      <View className="flex-row items-center mt-2">
        {/* QR Code */}
        <View className="relative items-center justify-center mt-3 ml-2">
          <Image
            source={qrSample}
            className="w-36 h-36 border border-gray-300 rounded-md"
            resizeMode="contain"
          />
        </View>

        {/* Vertical Divider */}
        <View className="w-0.5 h-32 bg-gray-400/40 mx-3 mt-5" />

        {/* Visitor Info */}
        <View className="flex-1 mt-4">
          <Text className="text-white font-bold text-lg">{name}</Text>
          <Text className="text-white font-semibold mt-1">
            EXIT KEY:{" "}
            <Text className="underline font-bold text-green-300">
              {exitKey}
            </Text>
          </Text>
        </View>
      </View>

      {/* ✅ Notes */}
      <Text className="text-sm text-gray-300 mt-4 leading-5">
        Note: Please keep the QR code or exit key visible during check out.
      </Text>

      <View className="my-4 h-[1px] bg-gray-400/40" />

      {/* ✅ Check-in Info */}
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-white text-md font-medium">CHECK IN:</Text>
          <Text className="text-white text-md font-normal">{checkIn}</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-white text-md font-medium">VISITING:</Text>
          <Text className="text-white text-md font-normal">{visiting}</Text>
        </View>
      </View>
    </View>
  );
}
