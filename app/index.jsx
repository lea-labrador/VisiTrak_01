import { View, Text, ImageBackground, Pressable, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Import images
import backG1 from "../assets/images/backG1.png";
import backG2 from "../assets/images/backG2.png";
import backG3 from "../assets/images/backG3.png";
import bisuLogo from "../assets/images/bisu-logo.png";

const backgroundImages = [backG1, backG2, backG3];

const App = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Autoplay background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-black">
      <ImageBackground
        source={backgroundImages[currentIndex]}
        resizeMode="cover"
        style={{ flex: 1 }}
        className="items-center justify-center px-5"
      >
        {/* Logo */}
        <Image
          source={bisuLogo}
          className="w-40 h-40 mb-5"
          resizeMode="contain"
        />

        {/* Title */}
        <Text className="text-white text-3xl text-center mb-1">Welcome to</Text>
        <Text className="text-white text-4xl md:text-5xl font-bold text-center tracking-wide mb-3">
          BISU BALILIHAN
        </Text>
        <Text className="text-white text-lg text-center mb-10 leading-7 px-3">
          Please register your visit by providing the required informations.
        </Text>

        {/* Buttons */}
        <Link href="/VisiTrakForm" asChild>
          <Pressable className="h-14 w-11/12 max-w-xl rounded-xl bg-white justify-center items-center mb-6 shadow-lg">
            <View className="flex-row items-center justify-center">
              <Ionicons
                name="book-outline"
                size={22}
                color="black"
                style={{ marginRight: 30 }}
              />
              <Text className="text-black text-lg font-bold tracking-wide">
                Start Registration
              </Text>
              <Ionicons
                name="arrow-forward-outline"
                size={22}
                color="black"
                style={{ marginLeft: 30 }}
              />
            </View>
          </Pressable>
        </Link>

        <Link href="/ExitScreen" asChild>
          <Pressable>
            <Text className="text-white text-base font-bold underline tracking-widest mb-20">
              EXIT / TIME OUT
            </Text>
          </Pressable>
        </Link>

        {/* Footer */}
        <Text className="absolute bottom-5 text-center text-xs text-gray-300 tracking-wide">
          © 2025 LMT. All rights reserved.
        </Text>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default App;
