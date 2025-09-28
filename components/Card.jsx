// components/Card.js
import { View } from "react-native";

export default function Card({ children }) {
  return (
    <View className="mx-6 my-10 p-6 rounded-2xl border border-yellow-400 bg-white/5">
      {children}
    </View>
  );
}
