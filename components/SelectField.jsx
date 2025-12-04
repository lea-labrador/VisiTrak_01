// components/SelectField.jsx
import React from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function SelectField({
  icon,
  selectedValue,
  onValueChange,
  placeholder,
  options,
  hasError,
  disabled,
  disabledTextColor, // optional override for disabled text color
}) {
  return (
    <View
      className="flex-row items-center rounded-lg px-3 py-2 mb-3 bg-indigo-200/70"
      style={{
        borderWidth: 2,
        borderColor: hasError ? "red" : "rgba(107,114,128,0.7)",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {icon}

      <Picker
        enabled={!disabled}         // 🔥 Disable interaction BUT do NOT fade
        selectedValue={selectedValue}
        onValueChange={(val) => {
          if (!disabled) onValueChange(val); // safety
        }}
        dropdownIconColor={disabled ? "#888" : "#4967e3"}
        style={{ flex: 1, color: disabled ? (disabledTextColor || '#6b7280') : undefined }}
      >
        <Picker.Item label={placeholder} value="" color={disabled ? (disabledTextColor || '#6b7280') : '#000000ff'} />

        {options.map((opt, i) => (
          <Picker.Item key={i} label={opt} value={opt} />
        ))}
      </Picker>
    </View>
  );
}
