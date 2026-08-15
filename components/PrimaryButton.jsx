import { Text } from "react-native";
import Pressable from "./SystemPressable";

export default function PrimaryButton({ title, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-indigo-700 rounded-lg py-3 mt-6"
    >
      <Text className="text-center text-white font-semibold text-base">
        {title}
      </Text>
    </Pressable>
  );
}
