import React from "react";
import { View, Text, useWindowDimensions } from "react-native";

export default function Footer() {
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 400, 0.8), 1.8);
  

  const sizes = {
    footerFont: 12 * scale,
  };

  return (
    <View className="mt-auto mb-4">
      <Text className="text-center text-gray-300 text-sm "
      style={{ fontSize: sizes.footerFont }}
      >
        &copy; 2025 LMT. All rights reserved.
      </Text>
    </View>
  );
}
