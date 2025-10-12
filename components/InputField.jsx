import React from "react";
import { View, TextInput } from "react-native";

export default function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  uppercase = false, 
}) {
  const handleChangeText = (text) => {
    if (uppercase) {
      onChangeText(text.toUpperCase());
    } else {
      onChangeText(text);
    }
  };

  return (
    <View className="flex-row items-center bg-indigo-200/70 border-2 border-gray-500/70 rounded-lg px-4 py-3 mb-3">
      {icon}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#000"
        value={value}
        onChangeText={handleChangeText}
        className="flex-1 text-gray-700 font-medium ml-3"
        autoCapitalize={uppercase ? "characters" : "none"} // 🔠 auto-uppercase keyboard
      />
    </View>
  );
}
