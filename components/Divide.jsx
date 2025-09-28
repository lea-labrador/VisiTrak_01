// components/Divider.js
import { View, Text } from "react-native";

export default function Divider({ text = "or" }) {
  return (
    <View className="flex-row items-center my-4">
      <View className="flex-1 h-[1px] bg-gray-300" />
      <Text className="mx-2 text-gray-500 font-medium">{text}</Text>
      <View className="flex-1 h-[1px] bg-gray-300" />
    </View>
  );
}
