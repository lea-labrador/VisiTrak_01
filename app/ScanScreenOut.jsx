// screens/EntryScreen.js
import { View, Text, ImageBackground, Image, Pressable, SafeAreaView, StatusBar } from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import Card from "../components/Card";
import Divider from "../components/Divider";
import Logos from "../components/Logos";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function EntryScreen() {
  return (
    <ImageBackground
      source={require("../assets/images/backG1.png")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Safe area wrapper prevents overlap with system top bar */}
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* 🔹 Header stays fixed at top */}
          <View
            className="px-6"
            style={{ paddingTop: StatusBar.currentHeight || 0 }}
          >
            <Header title="VisiTrak" />
          </View>

          {/* Main Content */}
          <View className="flex-1 justify-center px-6">
            <Card>
              {/* Logos inside the card (aligned to right) */}
              <Logos />

              {/* Card Body */}
              <View className="items-center mt-4">
                <Text className="text-white text-lg font-semibold mb-4">
                  Scan QR Code
                </Text>

                {/* QR Placeholder */}
                <View className="w-40 h-40 bg-white rounded-lg justify-center items-center mb-6">
                  <Image
                    source={require("../assets/images/VisitorOut_QR.png")}
                    className="w-36 h-36"
                    resizeMode="contain"
                  />
                </View>

                {/* Divider */}
                <Divider text="or" />

                {/* Start Registration Button */}
                <Link href="/ExitScreen" asChild>
                  <Pressable className="flex-row items-center bg-white px-10 py-4 rounded-2xl mt-4 shadow-md">
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={24}
                      color="black"
                    />
                    <Text className="text-base font-semibold ml-2 px-3">
                      Exit without QR
                    </Text>
                    <Feather name="arrow-right" size={20} color="black" />
                  </Pressable>
                </Link>
              </View>
            </Card>
          </View>

          {/* Footer - always at bottom */}
          <View className="pb-4">
            <Footer />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
