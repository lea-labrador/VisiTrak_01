import { View, Text, ImageBackground, TextInput } from "react-native";
import { useState } from "react";
import Pressable from "../components/SystemPressable";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ExitScreen() {
  const [name, setName] = useState("");

  return (
    <ImageBackground
      source={require("../assets/images/BG009.png")}
      resizeMode="cover"
      className="flex-1"
    >
      {/* Overlay */}
      <View className="flex-1 bg-purple-900/80">
        <Header title="VisiTrak" onBack={() => console.log("Back")} />

        {/* Content */}
        <View className="flex-1 justify-center px-5">
          <View className="border-2 border-orange-400 rounded-3xl px-6 py-8 bg-white/10">
            {/* Icon */}
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-orange-400 items-center justify-center mb-4">
                <Ionicons name="log-out-outline" size={38} color="#4F46E5" />
              </View>

              <Text className="text-white text-2xl font-bold">
                Visitor Checkout
              </Text>

              <Text className="text-orange-200 text-sm mt-1 italic">
                NOTE : Enter your checked in name
              </Text>
            </View>

            {/* Input */}
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter Your Name"
              placeholderTextColor="#555"
              autoCapitalize="characters"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
              className="bg-white/80 rounded-xl px-5 py-4 text-lg border border-orange-400"
            />

            {/* Button */}
            <Pressable
              onPress={() => console.log("Checkout:", name)}
              className="bg-purple-600 rounded-xl py-4 mt-6 active:opacity-80"
            >
              <Text className="text-white text-center text-lg font-bold tracking-widest">
                SUBMIT
              </Text>
            </Pressable>
          </View>
        </View>

        <Footer />
      </View>
    </ImageBackground>
  );
}
