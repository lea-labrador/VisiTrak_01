import { TextInput } from "react-native";

export default function TextArea({ value, onChange }) {
  return (
    <TextInput
      multiline
      numberOfLines={4}
      value={value}
      onChangeText={onChange}
      placeholder="Write your suggestion here..."
      placeholderTextColor="#666"
      className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white"
    />
  );
}
