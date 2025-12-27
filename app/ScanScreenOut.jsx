import {View, Text, ImageBackground, Image, Pressable, StatusBar, useWindowDimensions,SafeAreaView} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import Card from "../components/Card";
import Divider from "../components/Divider";
import Logos from "../components/Logos";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function EntryScreen() {
  const { width, height } = useWindowDimensions();

  // 📱 Responsive scaling tiers
  const isLarge = width > 800; // tablet or large screen
  const scale = isLarge ? 1.4 : width > 600 ? 1.2 : 1;

  return (
    <ImageBackground
      source={require("../assets/images/BG009.png")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Safe area wrapper prevents overlap with system top bar */}
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* 🔹 Header */}
          <View
            className="px-6"
            style={{ paddingTop: (StatusBar.currentHeight || 0) + 10 * scale }}
          >
            <Header title="VisiTrak" />
          </View>

          {/* 🔸 Main Content */}
          <View
            className="flex-1 justify-center px-6"
            style={{
              paddingHorizontal: 24 * scale,
              marginTop: 20 * scale,
              marginBottom: 20 * scale,
            }}
          >
            <Card
              style={{
                transform: [{ scale }],
                maxWidth: Math.min(width * 0.9, 500 * scale),
                alignSelf: "center",
              }}
            >
              {/* Logos inside the card (aligned to right) */}
              <Logos scale={scale} />

              {/* Card Body */}
              <View className="items-center mt-4">
                <Text
                  className="text-white font-semibold mb-4"
                  style={{ fontSize: 18 * scale }}
                >
                  Scan QR Code
                </Text>

                {/* ✅ QR Placeholder */}
                <View
                  className="bg-white rounded-lg justify-center items-center mb-6"
                  style={{
                    width: 160 * scale,
                    height: 160 * scale,
                    borderRadius: 12 * scale,
                    shadowOpacity: 0.4,
                    shadowRadius: 6 * scale,
                  }}
                >
                  <Image
                    source={require("../assets/images/qr-out.png")}
                    style={{
                      width: 144 * scale,
                      height: 144 * scale,
                    }}
                    resizeMode="contain"
                  />
                </View>

                {/* Divider */}
                <Divider text="or" scale={scale} />

                {/* ✅ Start Registration Button */}
                <Link href="/ExitScreen" asChild>
                  <Pressable
                    className="flex-row items-center bg-white rounded-2xl shadow-md"
                    style={{
                      paddingVertical: 12 * scale,
                      paddingHorizontal: 24 * scale,
                      marginTop: 16 * scale,
                      minWidth: width * 0.7,       
                      maxWidth: width * 0.9,       
                      justifyContent: "center",   
                    }}
                  >
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={24 * scale}
                      color="black"
                    />
                    <Text
                      className="font-semibold ml-2 px-3"
                      style={{ fontSize: 15 * scale }}
                    >
                      Scan or tap to check Out 
                    </Text>
                    <Feather name="arrow-right" size={20 * scale} color="black" />
                  </Pressable>
                </Link>

              </View>
            </Card>
          </View>

          {/* 🔹 Footer */}
          <View style={{ paddingBottom: 20 * scale }}>
            <Footer scale={scale} />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
