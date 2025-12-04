import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import Header from "../components/Sucess-header";
import SuccessCard from "../components/SuccessCard";
import Footer from "../components/Footer";

export default function CheckInSummary() {
  const { name, exitKey, checkInTime, office, address } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

  // Scale factor — dynamically adjusts based on screen size
  const scale = Math.min(Math.max(width / 400, 0.8), 1.6);
  const isTablet = width >= 768;

  // Responsive sizes
  const sizes = {
    paddingVertical: 40 * scale,
    paddingHorizontal: 16 * scale,
    messageFont: 22 * scale,
    messageSpacing: 28 * scale,
  };

  return (
    <LinearGradient
      colors={["#381366", "#4A2279", "#573483"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* ✅ Header */}
        <View style={{ paddingHorizontal: 10 * scale }}>
          <Header title="VisiTrak" />
        </View>

        {/* ✅ Scrollable Main Content */}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: sizes.paddingVertical,
            paddingHorizontal: sizes.paddingHorizontal,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ Success Card */}
          <SuccessCard
            name={name || "Guest Visitor"}
            address={address || "N/A"}
            exitKey={exitKey || "N/A"}
            checkIn={checkInTime || "N/A"}
            visiting={office || "N/A"}
          />

          {/* ✅ Message */}
          <View style={{ marginTop: sizes.messageSpacing }}>
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: sizes.messageFont,
                fontWeight: "600",
              }}
            >
              Have a great visit!
            </Text>
          </View>
        </ScrollView>

        {/* ✅ Footer */}
        <Footer />
      </SafeAreaView>
    </LinearGradient>
  );
}
