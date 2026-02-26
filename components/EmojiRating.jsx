import { useEffect, useState } from "react";
import { View, Pressable, Text, useWindowDimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";

const ratingIcons = [
  { lib: Ionicons, name: "sad-outline", active: "sad", activeColor: "#EF4444" },
  {
    lib: MaterialCommunityIcons,
    name: "emoticon-confused-outline",
    active: "emoticon-confused",
    activeColor: "#F97316",
  },
  {
    lib: MaterialCommunityIcons,
    name: "emoticon-neutral-outline",
    active: "emoticon-neutral",
    activeColor: "#EAB308",
  },
  { lib: Ionicons, name: "happy-outline", active: "happy", activeColor: "#22C55E" },
  { lib: Entypo, name: "emoji-happy", active: "emoji-happy", activeColor: "#3B82F6" },
];

const satisfactionLabels = [
  "Very Unsatisfied",
  "Unsatisfied",
  "Neutral",
  "Satisfied",
  "Very Satisfied",
];

export default function EmojiRating({
  value,
  onChange,
  iconSize,
  iconPadding,
}) {
  const [notApplicable, setNotApplicable] = useState(false);
  const { width } = useWindowDimensions();

  const scale = Math.min(Math.max(width / 400, 0.82), 1.4);

  const baseIconSize = iconSize ?? 30 * scale;
  const baseIconPadding = iconPadding ?? 12 * scale;
  const inactiveCircleSize = Math.max(baseIconSize + baseIconPadding, 44 * scale);
  const activeCircleSize = inactiveCircleSize + 16 * scale;

  const sizes = {
    icon: baseIconSize,
    iconActive: baseIconSize + 2 * scale,
    inactiveCircle: inactiveCircleSize,
    activeCircle: activeCircleSize,
    numberText: 15 * scale,
    checkboxSize: 22 * scale,
    checkboxIcon: 16 * scale,
    checkboxText: 14 * scale,
    statusText: 15 * scale,
  };

  useEffect(() => {
    if (value != null && notApplicable) {
      setNotApplicable(false);
    }
  }, [value, notApplicable]);

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

  const selectedText =
    !notApplicable && typeof value === "number" && value > 0
      ? `\u2713 You selected: ${satisfactionLabels[value - 1]} (${value})`
      : notApplicable
      ? "\u2713 Marked as Not Applicable"
      : null;

  const checkboxControl = (
    <Pressable
      onPress={handleNotApplicable}
      className="ml-3 flex-row items-center"
    >
      <View
        className="mr-2 items-center justify-center rounded border"
        style={{
          width: sizes.checkboxSize,
          height: sizes.checkboxSize,
          borderColor: notApplicable ? "#3B5BDB" : "#94A3B8",
          backgroundColor: "#fff",
        }}
      >
        {notApplicable && (
          <Ionicons name="checkmark" size={sizes.checkboxIcon} color="#3B5BDB" />
        )}
      </View>
      <Text numberOfLines={1} style={{ fontSize: sizes.checkboxText, color: "#334155" }}>
        Not Applicable
      </Text>
    </Pressable>
  );

  const emojiRow = (
    <View className="flex-1 flex-row items-start justify-between">
      {ratingIcons.map((icon, index) => {
        const isActive = value === index + 1 && !notApplicable;
        const IconComponent = icon.lib;

        return (
          <Pressable
            key={index}
            onPress={() => handleEmojiPress(index)}
            className="flex-1 items-center"
            hitSlop={6}
          >
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: isActive ? sizes.activeCircle : sizes.inactiveCircle,
                height: isActive ? sizes.activeCircle : sizes.inactiveCircle,
                backgroundColor: isActive ? "#DDE5FF" : "transparent",
                borderWidth: isActive ? 2 : 0,
                borderColor: isActive ? "#9CB1FF" : "transparent",
              }}
            >
              <IconComponent
                name={isActive ? icon.active : icon.name}
                size={isActive ? sizes.iconActive : sizes.icon}
                color={isActive ? icon.activeColor : "#9CA3AF"}
              />
            </View>
            <Text
              style={{
                fontSize: sizes.numberText,
                marginTop: 6 * scale,
                color: "#475569",
              }}
            >
              {index + 1}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View className="w-full items-center">
      <View className="w-full flex-row items-center px-1">
        {emojiRow}
        {checkboxControl}
      </View>

      {selectedText && (
        <View
          className="mt-3 rounded-xl px-4 py-2"
          style={{ backgroundColor: "#E6EBFF" }}
        >
          <Text style={{ fontSize: sizes.statusText, color: "#3042CC" }}>
            {selectedText}
          </Text>
        </View>
      )}
    </View>
  );
}
