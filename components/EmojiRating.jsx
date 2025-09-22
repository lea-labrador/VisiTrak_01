import { View, Pressable, Text } from "react-native";

const emojis = ["😞", "😕", "😐", "😊", "😁"];

export default function EmojiRating({ value, onChange }) {
  return (
    <View className="flex-row justify-between">
      {emojis.map((emoji, index) => (
        <Pressable
          key={index}
          onPress={() => onChange(index + 1)}
          className={`p-2 rounded-full ${
            value === index + 1 ? "bg-indigo-100" : ""
          }`}
        >
          <Text className="text-2xl">{emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
}
