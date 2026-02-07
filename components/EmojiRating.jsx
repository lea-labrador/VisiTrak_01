import { useState } from "react";
import {
  View,
  Pressable,
  Text,
  useWindowDimensions,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  Entypo,
} from "@expo/vector-icons";

const icons = [
  { lib: Ionicons, name: "sad-outline", active: "sad" },
  {
    lib: MaterialCommunityIcons,
    name: "emoticon-confused-outline",
    active: "emoticon-confused",
  },
  {
    lib: MaterialCommunityIcons,
    name: "emoticon-neutral-outline",
    active: "emoticon-neutral",
  },
  { lib: Ionicons, name: "happy-outline", active: "happy" },
  { lib: Entypo, name: "emoji-happy", active: "emoji-happy" },
];

const satisfactionLabels = [
  "Very unsatisfied",
  "Unsatisfied",
  "Neutral",
  "Satisfied",
  "Very Satisfied",
];
 
export default function EmojiRating({ value, onChange }) {
  const [notApplicable, setNotApplicable] = useState(false);
  const { width } = useWindowDimensions();

  /* 🔹 SCALE SYSTEM */
  const scale = Math.min(Math.max(width / 400, 0.85), 1.6);
  const isWideScreen = width >= 640;

  const sizes = {
    icon: 30 * scale,
    iconPadding: 12 * scale,

    checkboxSize: 20 * scale,
    checkboxIcon: 14 * scale,

    statusText: 14 * scale,
    checkboxText: 14 * scale,
  };

  const handleEmojiPress = (index) => {
    setNotApplicable(false);
    onChange(index + 1);
  };

  const handleNotApplicable = () => {
    setNotApplicable((prev) => {
      const next = !prev;
      if (next) onChange(null);
      return next;
    });
  };

  const Checkbox = (
    <Pressable
      onPress={handleNotApplicable}
      className={`flex-row items-center ${
        isWideScreen ? "ml-4" : "mt-4"
      }`}
    >
      <View
        style={{
          width: sizes.checkboxSize,
          height: sizes.checkboxSize,
        }}
        className={`mr-2 rounded border-2 items-center justify-center ${
          notApplicable
            ? "bg-indigo-600 border-indigo-600"
            : "border-gray-400"
        }`}
      >
        {notApplicable && (
          <Ionicons
            name="checkmark"
            size={sizes.checkboxIcon}
            color="#fff"
          />
        )}
      </View>

      <Text
        className="text-gray-700"
        style={{ fontSize: sizes.checkboxText }}
      >
        Not Applicable
      </Text>
    </Pressable>
  );

  const EmojiRow = (
    <View className="flex-row justify-between flex-1">
      {icons.map((icon, index) => {
        const isActive = value === index + 1 && !notApplicable;
        const IconComp = icon.lib;

        return (
          <Pressable
            key={index}
            onPress={() => handleEmojiPress(index)}
            style={{ padding: sizes.iconPadding }}
            className={`rounded-full ${
              isActive ? "bg-indigo-100" : ""
            }`}
          >
            <IconComp
              name={isActive ? icon.active : icon.name}
              size={sizes.icon}
              color={isActive ? "#4F46E5" : "#6B7280"}
            />
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View className="items-center w-full">
      {isWideScreen ? (
        <View className="flex-row items-center justify-center w-full px-6">
          {EmojiRow}
          {Checkbox}
        </View>
      ) : (
        <>
          <View className="flex-row justify-between w-full px-6">
            {EmojiRow}
          </View>
          {Checkbox}
        </>
      )}

      {/* STATUS TEXT */}
      <Text
        className="text-center mt-3 text-gray-600"
        style={{ fontSize: sizes.statusText }}
      >
        {notApplicable
          ? "Not Applicable selected"
          : value > 0
          ? `You selected: ${satisfactionLabels[value - 1]}`
          : "No rating yet"}
      </Text>
    </View>
  );
}
