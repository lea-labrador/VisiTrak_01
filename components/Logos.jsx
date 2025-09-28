// components/Logos.js
import { View, Image } from "react-native";

export default function Logos() {
  return (
    <View className="flex-row space-x-2 justify-end">
      <Image
        source={require("../assets/images/bisu-logo.png")}
        className="w-10 h-10"
        resizeMode="contain"
      />
      <Image
        source={require("../assets/images/creative-logo.png")}
        className="w-16 h-6 mt-2 ml-2"
        resizeMode="contain"
      />
    </View>
  );
}
