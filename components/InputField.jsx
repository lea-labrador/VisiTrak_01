import React from "react";
import { View, TextInput } from "react-native";

export default function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  uppercase = false,
  hasError = false,  // default to false
}) {
  const handleChangeText = (text) => {
    if (uppercase) {
      onChangeText(text.toUpperCase());
    } else {
      onChangeText(text);
    }
  };

  return (
    <View
      className="flex-row items-center bg-indigo-200/70 rounded-lg px-4 py-3 mb-3"
      style={{
        borderWidth: 2,
        borderColor: hasError ? "red" : "rgba(107,114,128,0.7)", // 🔴 border red if error
      }}
    >
      {icon}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={hasError ? "red" : "#000"} // 🔴 placeholder red if error
        value={value}
        onChangeText={handleChangeText}
        className="flex-1 text-gray-700 font-medium ml-3"
        autoCapitalize={uppercase ? "characters" : "none"}
      />
    </View>
  );
}
