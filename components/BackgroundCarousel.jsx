import React, { useEffect, useState } from "react";
import { View, Text, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "./Header";

export default function BackgroundCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="w-full h-64">
      <ImageBackground
        source={images[currentIndex]}
        resizeMode="cover"
        className="w-full h-64 px-9 pt-8"
      >
        <View className="flex-1">
          <Header title="VisiTrak" />
          <Text className="text-white font-bold text-2xl mt-4 tracking-wide">
            Your Visit Matters
          </Text>
          <Text className="text-white text-lg mt-1">
            Thank you for being part of our vibrant community!
          </Text>

          {/* Avatar Circle */}
          <View className="absolute -bottom-8 self-center">
            <View className="w-20 h-20 rounded-full bg-white justify-center items-center border-2 border-blue-500">
              <Ionicons name="person" size={32} color="#1a3c9e" />
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Carousel Dots */}
      <View className="absolute bottom-2 left-0 right-0 flex-row justify-center space-x-2">
        {images.map((_, index) => (
          <View
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
