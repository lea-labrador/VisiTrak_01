import { View, Text } from "react-native";

export default function Divider({ text = "or" }) {
  return (
    <View className="flex-row items-center my-6">
      <View className="flex-1 h-[1px] bg-white/40" />
      <Text className="mx-3 text-white font-medium">{text}</Text>
      <View className="flex-1 h-[1px] bg-white/40" />
    </View>
  );
}
