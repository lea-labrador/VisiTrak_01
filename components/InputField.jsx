import React, { forwardRef } from "react";
import { View, TextInput } from "react-native";

const InputField = forwardRef(({
  icon,
  placeholder,
  value,
  onChangeText,
  uppercase = false,
  hasError = false,
  onSubmitEditing,   // new: called when Enter/Next is pressed
  returnKeyType = "next", // new: set keyboard return key type
}, ref) => {

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
        borderColor: hasError ? "red" : "rgba(107,114,128,0.7)",
      }}
    >
      {icon}
      <TextInput
        ref={ref}                     // attach ref
        placeholder={placeholder}
        placeholderTextColor={hasError ? "red" : "#000"}
        value={value}
        onChangeText={handleChangeText}
        onSubmitEditing={onSubmitEditing} // handle Enter/Next
        returnKeyType={returnKeyType}     // keyboard button
        className="flex-1 text-gray-700 font-medium ml-3"
        autoCapitalize={uppercase ? "characters" : "none"}
      />
    </View>
  );
});

export default InputField;
