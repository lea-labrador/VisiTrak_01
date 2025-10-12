import { View, Text, Pressable, ImageBackground, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";


export default function ThankYouScreen() {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require("../assets/images/thankYou_bg1.png")} // put your gradient background here
      className="flex-1 justify-center items-center px-6"
      resizeMode="cover"
    >
      {/* Illustration */}
      <Image
        source={require("../assets/images/thank_youBG3.png")}
        className="w-64 h-64 mb-6"
        resizeMode="contain"
      />

      {/* Title */}
      <Text className="text-white text-2xl font-bold mb-2">THANK YOU!</Text>
      <Text className="text-gray-200 text-base mb-8">VISIT COMPLETE</Text>

      {/* Message */}
      <Text className="text-white text-center mb-8">
        We hope to see you again soon!
      </Text>

      {/* Button */}
      <Pressable
        className="bg-blue-800 py-3 px-8 rounded-xl"
        onPress={() => navigation.navigate("index")}
      >
        <Text className="text-white font-semibold text-base">HOME</Text>
      </Pressable>
    </ImageBackground>
  );
}
