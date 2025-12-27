import { View, Text, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// 🔹 SCALE FACTOR
const scale = Math.min(Math.max(width / 400, 0.8), 1.8);

// 🔹 RESPONSIVE SIZES
const sizes = {
  questionSize: 14 * scale,
};

export default function Question({ number, text, children }) {
  return (
    <View className="mb-6">
      <Text
        className="text-gray-900 font-semibold mb-2"
        style={{ fontSize: sizes.questionSize }}
      >
        {number}. {text}
      </Text>

      {children}
    </View>
  );
}
