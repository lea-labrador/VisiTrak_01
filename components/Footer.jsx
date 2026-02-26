import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Footer({ fontSize, compact = false }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const scale = Math.min(Math.max(width / 400, 0.8), 1.8);

  const sizes = {
    footerFont: fontSize ?? 12 * scale,
    verticalGap: compact ? 3 * scale : 6 * scale,
    bottomPadding: compact ? 2 * scale : Math.max(insets.bottom, 4 * scale),
  };

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        marginTop: sizes.verticalGap,
        paddingBottom: sizes.bottomPadding,
      }}
    >
      <Text
        className="text-center text-gray-300"
        style={{ fontSize: sizes.footerFont }}
      >
        &copy; 2025 LMT. All rights reserved.
      </Text>
    </View>
  );
}
