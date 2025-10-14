import React from "react";
import { Pressable, Text } from "react-native";

export default function SubmitButton({ onPress, title = "Submit Registration" }) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 w-11/12 mx-auto mt-6 mb-6 rounded-xl bg-indigo-900 justify-center items-center shadow-lg"
    >
      <Text className="text-white text-lg font-bold tracking-wide">{title}</Text>
    </Pressable>
  );
}
