import { View, Text } from "react-native";

export default function Question({ number, text, children }) {
  return (
    <View className="mb-6">
      <Text className="text-gray-900 font-semibold mb-2">
        {number}. {text}
      </Text>
      {children}
    </View>
  );
}
 