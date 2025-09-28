import {
  View,
  Text,
  ImageBackground,
  Pressable,
  Image,
  useWindowDimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Footer from "../components/Footer"

// Import images
import backG1 from "../assets/images/backG1.png";
import backG2 from "../assets/images/backG2.png";
import backG3 from "../assets/images/backG3.png";
import bisuLogo from "../assets/images/bisu-logo.png";
import creativeLogo from "../assets/images/creative-logo.png"; // add your creative logo file

const backgroundImages = [backG1, backG2, backG3];

const HomeScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();

  // Autoplay background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Check if screen is small (phone)
  const isPhone = width < 600; // adjust threshold for your needs

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-black">
      <ImageBackground
        source={backgroundImages[currentIndex]}
        resizeMode="cover"
        style={{ flex: 1 }}
        className="items-center justify-center px-5"
      >
        {/* Logos Inline */}
        <View className="flex-row items-center justify-center mb-6 space-x-6">
          <Image
            source={bisuLogo}
            className="mr-3 w-20 h-20"
            resizeMode="contain"
          />
          <Image
            source={creativeLogo}
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-white text-xl text-center mb-1">Welcome to</Text>
        <Text className="text-white text-3xl md:text-5xl font-bold text-center tracking-wide mb-3">
          BISU BALILIHAN
        </Text>
        <Text className="text-white text-base md:text-lg text-center mb-10 leading-6 px-3">
          Please register your visit by providing the required information.
        </Text>

        {/* Buttons - responsive layout */}
        <View
          className="w-11/12 max-w-xl"
          style={{
            flexDirection: isPhone ? "column" : "row",
            justifyContent: isPhone ? "center" : "space-between",
          }}
        >
          <Link href="/VisiTrakForm" asChild>
            <Pressable
              className={`h-14 ${
                isPhone ? "w-full mb-4" : "flex-1 mx-1"
              } rounded-xl border-2 border-orange-400 bg-white/20 justify-center items-center shadow-md`}
            >
              <Text className="text-white text-2xl font-bold tracking-wide">
                VISITOR IN
              </Text>
            </Pressable>
          </Link>

          <Link href="/ExitScreen" asChild>
            <Pressable
              className={`h-14 ${
                isPhone ? "w-full" : "flex-1 mx-1"
              } rounded-xl border-2 border-orange-400 bg-white/20 justify-center items-center shadow-md`}
            >
              <Text className="text-white text-2xl font-bold tracking-wide">
                VISITOR OUT
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Footer */}
        <Text className="absolute bottom-5 text-center text-xs text-gray-300 tracking-wide">
          © 2025 LMT. All rights reserved.
        </Text>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default HomeScreen;
