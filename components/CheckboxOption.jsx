import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CheckboxOption({ label, checked, onChange }) {
  return (
    <Pressable
      onPress={onChange}
      className="flex-row items-center mb-2 mr-4 flex-wrap"
    >
      <View
        className={`w-5 h-5 mr-2 border rounded ${
          checked ? "bg-indigo-600 border-indigo-600" : "border-gray-400"
        } flex items-center justify-center`}
      >
        {checked && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
      <Text className="text-gray-800">{label}</Text>
    </Pressable>
  );
}
