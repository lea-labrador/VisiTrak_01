import { View, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";

const icons = [
  { lib: Ionicons, name: "sad-outline", active: "sad" }, // 😞
  { lib: MaterialCommunityIcons, name: "emoticon-confused-outline", active: "emoticon-confused" }, // 😕
  { lib: MaterialCommunityIcons, name: "emoticon-neutral-outline", active: "emoticon-neutral" }, // 😐
  { lib: Ionicons, name: "happy-outline", active: "happy" }, // 😊
  { lib: Entypo, name: "emoji-happy", active: "emoji-happy" }, // 😁
];

export default function EmojiRating({ value, onChange }) {
  return (
    <View className="flex-row justify-between">
      {icons.map((icon, index) => {
        const isActive = value === index + 1;
        const IconComp = icon.lib; // dynamic component
        return (
          <Pressable
            key={index}
            onPress={() => onChange(index + 1)}
            className={`p-3 rounded-full ${isActive ? "bg-indigo-100" : ""}`}
          >
            <IconComp
              name={isActive ? icon.active : icon.name}
              size={32}
              color={isActive ? "#4F46E5" : "#6B7280"} // active = indigo, inactive = gray
            />
          </Pressable>
        );
      })}
    </View>
  );
}
