import {
  View,
  Text,
  ImageBackground,
  Image,
  StatusBar,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import Card from "../components/Card";
import Divider from "../components/Divider";
import Logos from "../components/Logos";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Pressable from "../components/SystemPressable";

export default function EntryScreen() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;
  const isSmallPhone = width < 360;
  const isShortHeight = height < 700;
  const elementBump = 1.06;

  // Balanced responsiveness for both portrait/landscape screens.
  const baseScale = Math.min(Math.max(Math.min(width / 400, height / 860), 0.82), 1.4);
  const tabletBoost = isTablet ? (isLargeTablet ? 1.24 : 1.16) : 1;
  const scale = baseScale * tabletBoost;

  const sizes = {
    cardMaxWidth: isTablet ? (isLargeTablet ? 860 : 760) : 520,
    cardPaddingV: (isShortHeight ? 18 : 22) * scale,
    cardPaddingH: (isTablet ? 28 : 22) * scale,
    cardMarginV: (isShortHeight ? 12 : 20) * scale,
    cardInnerTop: (isShortHeight ? 10 : 14) * scale,
    qrCode: (isShortHeight ? 120 : isTablet ? 150 : 140) * scale * elementBump,
    qrFrameExtra: 20 * scale,
    qrImageExtra: 10 * scale,
    qrMarginBottom: (isShortHeight ? 16 : 22) * scale,
    scanFont: (isShortHeight ? 17 : isTablet ? 19 : 18) * scale * elementBump,
    buttonFont: (isShortHeight ? 15 : isTablet ? 17 : 16) * scale * elementBump,
    buttonMinHeight: (isShortHeight ? 46 : isTablet ? 56 : 50) * scale * elementBump,
    buttonWidth: isTablet ? width * 0.66 : isSmallPhone ? width * 0.86 : width * 0.74,
    buttonMarginTop: (isShortHeight ? 14 : 18) * scale,
    buttonIcon: (isTablet ? 24 : 22) * scale * elementBump,
    arrowIcon: (isTablet ? 20 : 18) * scale * elementBump,
    contentPadX: isTablet ? 36 : 14,
    contentPadTop: isShortHeight ? 6 : 0,
    footerFont: 15 * scale,
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
          <View style={{ paddingHorizontal: 24, paddingTop: sizes.headerPaddingTop }}>
            <Header title="VisiTrak" />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: isShortHeight ? "flex-start" : "center",
              paddingHorizontal: sizes.contentPadX,
              paddingTop: sizes.contentPadTop,
              paddingBottom: 8,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ width: "100%", alignItems: "center" }}>
              <Card
                style={{
                  width: "100%",
                  maxWidth: sizes.cardMaxWidth,
                  marginHorizontal: 0,
                  marginVertical: sizes.cardMarginV,
                  paddingVertical: sizes.cardPaddingV,
                  paddingHorizontal: sizes.cardPaddingH,
                }}
              >
                <Logos />

                <View
                  style={{
                    alignItems: "center",
                    marginTop: sizes.cardInnerTop,
                    width: "100%",
                  }}
                >
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

                  <View
                    style={{
                      width: sizes.qrCode + sizes.qrFrameExtra,
                      height: sizes.qrCode + sizes.qrFrameExtra,
                      backgroundColor: "white",
                      borderRadius: 16,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: sizes.qrMarginBottom,
                    }}
                  >
                    <Image
                      source={require("../assets/images/out_code.png")}
                      style={{
                        width: sizes.qrCode + sizes.qrImageExtra,
                        height: sizes.qrCode + sizes.qrImageExtra,
                      }}
                      resizeMode="contain"
                    />
                  </View>

                  <Divider text="or" />

                  <Link href="/ExitScreen" asChild>
                    <Pressable
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "white",
                        borderRadius: 16,
                        marginTop: sizes.buttonMarginTop,
                        width: sizes.buttonWidth,
                        maxWidth: "100%",
                        minHeight: sizes.buttonMinHeight,
                        paddingHorizontal: 14 * scale,
                        paddingVertical: 8 * scale,
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
                        size={sizes.buttonIcon}
                        color="black"
                      />
                      <Text
                        style={{
                          fontSize: sizes.buttonFont,
                          fontWeight: "600",
                          marginHorizontal: 8,
                          flexShrink: 1,
                          textAlign: "center",
                        }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        Scan or tap to check Out
                      </Text>
                      <Feather name="arrow-right" size={sizes.arrowIcon} color="black" />
                    </Pressable>
                  </Link>
                </View>
              </Card>
            </View>
          </ScrollView>

          <View style={{ alignItems: "center" }}>
            <Footer fontSize={sizes.footerFont} compact />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
