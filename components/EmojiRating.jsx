import { useState } from "react";
import { View, Pressable, Text, useWindowDimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";

const icons = [
  { lib: Ionicons, name: "sad-outline", active: "sad" },
  { lib: MaterialCommunityIcons, name: "emoticon-confused-outline", active: "emoticon-confused" },
  { lib: MaterialCommunityIcons, name: "emoticon-neutral-outline", active: "emoticon-neutral" },
  { lib: Ionicons, name: "happy-outline", active: "happy" },
  { lib: Entypo, name: "emoji-happy", active: "emoji-happy" },
];

export default function EmojiRating({ value, onChange }) {
  const [notApplicable, setNotApplicable] = useState(false);
  const { width } = useWindowDimensions();

  // define breakpoint (customize as needed)
  const isWideScreen = width >= 640;

  const handleEmojiPress = (index) => {
    setNotApplicable(false);
    onChange(index + 1);
  };

  const handleNotApplicable = () => {
    setNotApplicable((prev) => {
      const newVal = !prev;
      if (newVal) onChange(null);
      return newVal;
    });
  };

  const Checkbox = (
    <Pressable
      onPress={handleNotApplicable}
      className={`flex-row items-center ${isWideScreen ? "ml-4" : "mt-4"}`}
    >
      <View
        className={`w-5 h-5 mr-2 rounded border-2 ${
          notApplicable ? "bg-indigo-600 border-indigo-600" : "border-gray-400"
        } items-center justify-center`}
      >
        {notApplicable && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text className="text-gray-700 text-base">Not Applicable</Text>
    </Pressable>
  );

  return (
    <View className="items-center w-full">
      {/* If wide screen → inline layout */}
      {isWideScreen ? (
        <View className="flex-row items-center justify-center w-full px-6">
          <View className="flex-row justify-between flex-1">
            {icons.map((icon, index) => {
              const isActive = value === index + 1 && !notApplicable;
              const IconComp = icon.lib;
              return (
                <Pressable
                  key={index}
                  onPress={() => handleEmojiPress(index)}
                  className={`p-3 rounded-full ${isActive ? "bg-indigo-100" : ""}`}
                >
                  <IconComp
                    name={isActive ? icon.active : icon.name}
                    size={32}
                    color={isActive ? "#4F46E5" : "#6B7280"}
                  />
                </Pressable>
              );
            })}
          </View>
          {Checkbox}
        </View>
      ) : (
        // If small screen → stacked layout
        <>
          <View className="flex-row justify-between w-full px-6">
            {icons.map((icon, index) => {
              const isActive = value === index + 1 && !notApplicable;
              const IconComp = icon.lib;
              return (
                <Pressable
                  key={index}
                  onPress={() => handleEmojiPress(index)}
                  className={`p-3 rounded-full ${isActive ? "bg-indigo-100" : ""}`}
                >
                  <IconComp
                    name={isActive ? icon.active : icon.name}
                    size={32}
                    color={isActive ? "#4F46E5" : "#6B7280"}
                  />
                </Pressable>
              );
            })}
          </View>
          {Checkbox}
        </>
      )}

      {/* Dynamic Status Text */}
      <Text className="text-sm text-center mt-3 text-gray-600 sm:text-base">
        {notApplicable
          ? "Not Applicable selected"
          : value > 0
          ? `You selected: ${value}`
          : "No rating yet"}
      </Text>
    </View>
  );
}
