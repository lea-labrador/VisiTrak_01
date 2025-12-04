// screens/EntryScreen.js
import {View, Text, ImageBackground, Image, Pressable, StatusBar,useWindowDimensions, SafeAreaView,} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import Card from "../components/Card";
import Divider from "../components/Divider";
import Logos from "../components/Logos";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function EntryScreen() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isSmallPhone = width < 360;

  // Scale factor for responsive design
  const scale = Math.min(Math.max(width / 400, 0.8), 1.6);

  const sizes = {
    qrCode: 140 * scale,
    scanFont: 18 * scale,
    buttonFont: 16 * scale,
    buttonHeight: 48 * scale,
    buttonWidth: isTablet ? width * 0.6 : isSmallPhone ? width * 0.85 : width * 0.7,
    footerFont: 20 * scale,
    headerPaddingTop: (StatusBar.currentHeight ?? 0) + (isTablet ? 20 : 10),
  };

  return (
    <ImageBackground
      source={require("../assets/images/BG009.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: sizes.headerPaddingTop }}>
            <Header title="VisiTrak" />
          </View>

          {/* Main Content */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: isTablet ? 80 : 24,
            }}
          >
            <Card>
              <Logos />

              <View style={{ alignItems: "center", marginTop: 16 }}>
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: sizes.scanFont,
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  Scan QR Code
                </Text>

                {/* QR Placeholder */}
                <View
                  style={{
                    width: sizes.qrCode + 10,
                    height: sizes.qrCode + 10,
                    backgroundColor: "white",
                    borderRadius: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <Image
                    source={require("../assets/images/qr-in.png")}
                    style={{
                      width: sizes.qrCode,
                      height: sizes.qrCode,
                    }}
                    resizeMode="contain"
                  />
                </View>

                {/* Divider */}
                <Divider text="or" />

                {/* Start Registration Button */}
                <Link href="/VisiTrakForm" asChild>
                  <Pressable
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "white",
                      borderRadius: 16,
                      marginTop: 20,
                      width: sizes.buttonWidth,
                      height: sizes.buttonHeight,
                      shadowColor: "#000",
                      shadowOpacity: 0.2,
                      shadowOffset: { width: 0, height: 3 },
                      shadowRadius: 4,
                      elevation: 4,
                      alignSelf: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={22 * scale}
                      color="black"
                    />
                    <Text
                      style={{
                        fontSize: sizes.buttonFont,
                        fontWeight: "600",
                        marginHorizontal: 8,
                      }}
                    >
                      Start Registration
                    </Text>
                    <Feather name="arrow-right" size={18 * scale} color="black" />
                  </Pressable>
                </Link>
              </View>
            </Card>
          </View>

          {/* Footer */}
          <View style={{ paddingBottom: 12, alignItems: "center" }}>
            <Footer fontSize={sizes.footerFont} />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
