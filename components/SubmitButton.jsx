import React from "react";
import { Pressable, Text, useWindowDimensions } from "react-native";

export default function SubmitButton({
  onPress,
  title = "Submit Registration",
  disabled = false,
}) {
  const { width } = useWindowDimensions();

  // 🔹 Dynamic scaling (same logic as your other components)
  const scale = Math.min(Math.max(width / 400, 0.8), 1.8);

  const sizes = {
    height: 56 * scale,        // originally h-14
    marginTop: 24 * scale,     // mt-6
    marginBottom: 24 * scale,  // mb-6
    borderRadius: 12 * scale,  // rounded-xl
    fontSize: 24 * scale,      // text-3xl
    paddingHorizontal: 16 * scale,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-11/12 mx-auto bg-[#7816EF] justify-center items-center shadow-lg"
      style={{
        height: sizes.height,
        marginTop: sizes.marginTop,
        marginBottom: sizes.marginBottom,
        borderRadius: sizes.borderRadius,
        paddingHorizontal: sizes.paddingHorizontal,
        opacity: disabled ? 0.65 : 1,
      }}
    >
      <Text
        className="text-white font-bold tracking-wide"
        style={{ fontSize: sizes.fontSize }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
 
