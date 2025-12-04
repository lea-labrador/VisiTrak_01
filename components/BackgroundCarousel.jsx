import React, { useEffect, useState } from "react";
import { View, Text, ImageBackground, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "./Header";

export default function BackgroundCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions();

  // 📱 Responsive scaling tiers
  const isLarge = width > 800;
  const scale = isLarge ? 1.4 : width > 600 ? 1.2 : 1;

  // Adjusted height dynamically
  const bannerHeight = Math.min(260 * scale, height * 0.35);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <View
      className="w-full"
      style={{
        height: bannerHeight,
      }}
    >
      {/* 🌅 Background Image */}
      <ImageBackground
        source={images[currentIndex]}
        resizeMode="cover"
        className="w-full"
        style={{
          height: bannerHeight,
          paddingHorizontal: 24 * scale,
          paddingTop: 30 * scale,
        }}
      > 
        <View className="flex-1">
          {/* Header */}
          <Header title="VisiTrak" scale={scale} />

          {/* Title */}
          <Text
            className="text-white font-bold mt-4 tracking-wide"
            style={{
              fontSize: 27 * scale,
            }}
          >
            Your Visit Matters
          </Text>

          {/* Subtitle */}
          <Text
            className="text-white mt-1"
            style={{
              fontSize: 17 * scale,
              maxWidth: "90%",
            }}
          >
            Thank you for being part of our vibrant community!
          </Text>

          {/* 👤 Avatar Circle */}
          <View
            className="absolute self-center"
            style={{
              bottom: -30 * scale,
            }}
          >
            <View
              className="bg-white justify-center items-center border-2 border-blue-500"
              style={{
                width: 80 * scale,
                height: 80 * scale,
                borderRadius: 9999,
              }}
            >
              <Ionicons
                name="person"
                size={32 * scale}
                color="#1a3c9e"
              />
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* 🔘 Carousel Dots */}
      <View
        className="absolute left-0 right-0 flex-row justify-center"
        style={{
          bottom: 8 * scale,
          gap: 8 * scale,
        }}
      >
        {images.map((_, index) => (
          <View
            key={index}
            style={{
              width: 10 * scale,
              height: 10 * scale,
              borderRadius: 9999,
              backgroundColor:
                index === currentIndex ? "white" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </View>
    </View>
  );
}
