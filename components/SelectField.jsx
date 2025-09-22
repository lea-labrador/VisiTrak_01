// components/SelectField.jsx
import React from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function SelectField({ icon, selectedValue, onValueChange, placeholder, options }) {
  return (
    <View className="flex-row items-center bg-indigo-200/70 border-2 border-gray-500/70 rounded-lg px-3 py-2 mb-3">
      {icon}
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        dropdownIconColor="#4967e3"
        style={{ flex: 1 }}
      >
        <Picker.Item label={placeholder} value="" color="#000" />
        {options.map((opt, i) => (
          <Picker.Item key={i} label={opt} value={opt} />
        ))}
      </Picker>
    </View>
  );
}
