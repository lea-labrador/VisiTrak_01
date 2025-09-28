// components/Header.js
import { View, Image } from "react-native";

export default function Header() {
  return (
    <View className="flex-row justify-between items-center px-4 py-2">
      <Image
        source={require("../assets/images/bisu-logo.png")}
        className="w-12 h-12"
        resizeMode="contain"
      />
      <Image
        source={require("../assets/images/creative-logo.png")}
        className="w-16 h-6"
        resizeMode="contain"
      />
    </View>
  );
}
