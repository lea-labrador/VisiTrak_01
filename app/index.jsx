import { View, Text, ImageBackground, Pressable, Image, useWindowDimensions } from "react-native";
import React, { useState, useEffect } from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Import images
import backG1 from "../assets/images/BG009.png";
import backG2 from "../assets/images/BG010.png";
import backG3 from "../assets/images/BG011.png";
import bisuLogo from "../assets/images/bisu-logo.png";
import creativeLogo from "../assets/images/vlogo01.png";

const backgroundImages = [backG1, backG2, backG3]; 

const HomeScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();

  // Auto-play background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scale factor (for responsive sizes)
  const scale = Math.min(Math.max(width / 400, 0.8), 1.8);
  const isPhone = width < 600;

  // Responsive size values
  const sizes = {
    bisuLogo: 80 * scale,
    creativeLogo: 75 * scale,
    titleFont: 45 * scale,
    subtitleFont: 20 * scale,
    descFont: 12 * scale,
    buttonFont: 30 * scale,
    buttonHeight: 65 * scale,
    buttonWidth: isPhone ? "100%" : 190 * scale, 
    footerFont: 10 * scale,
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ImageBackground
        source={backgroundImages[currentIndex]}
        resizeMode="cover"
        className="flex-1 items-center justify-center px-5"
      >
        {/* Logos */}
        <View className="flex-row items-center justify-center mb-6">
          <Image
            source={bisuLogo}
            className="mr-3"
            style={{
              width: sizes.bisuLogo,
              height: sizes.bisuLogo,
            }}
            resizeMode="contain"
          />
          <Image
            source={creativeLogo}
            style={{
              width: sizes.creativeLogo,
              height: sizes.creativeLogo,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Texts */}
        <Text
          className="text-white text-center mb-1"
          style={{ fontSize: sizes.subtitleFont }}
        >
          Welcome to
        </Text>

        <Text
          className="text-white font-bold text-center tracking-wide mb-3"
          style={{ fontSize: sizes.titleFont }}
        >
          BISU BALILIHAN
        </Text>

        <Text
          className="text-white text-center px-3 mb-10"
          style={{
            fontSize: sizes.descFont,
            lineHeight: sizes.descFont * 1.5,
          }}
        >
          Please register your visit by providing the required information.
        </Text>

        {/* Buttons */}
        <View
          className="w-11/12 max-w-xxl flex-row flex-wrap justify-center"
          style={{
            flexDirection: isPhone ? "column" : "row",
            alignItems: "center",
          }}
        >
          <Link href="/ScanScreen" asChild>
            <Pressable
              className="rounded-xl border-4 border-orange-400 bg-white/20 justify-center items-center shadow-md mb-4"
              style={{
                width: sizes.buttonWidth,
                height: sizes.buttonHeight,
                marginRight: isPhone ? 0 : 15,
              }}
            >
              <Text
                className="text-white font-bold tracking-wide"
                style={{ fontSize: sizes.buttonFont }}
              > 
                VISITOR IN
              </Text>
            </Pressable>
          </Link>

          <Link href="/ScanScreenOut" asChild>
            <Pressable
              className="rounded-xl border-4 border-orange-400 bg-white/20 justify-center items-center shadow-md"
              style={{
                width: sizes.buttonWidth,
                height: sizes.buttonHeight,
              }}
            >
              <Text
                className="text-white font-bold tracking-wide"
                style={{ fontSize: sizes.buttonFont }}
              >
                VISITOR OUT
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Footer */}
        <Text
          className="absolute bottom-5 text-center text-gray-300 tracking-wide"
          style={{ fontSize: sizes.footerFont }}
        >
          &copy; 2025 LMT. All rights reserved.
        </Text>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default HomeScreen;
