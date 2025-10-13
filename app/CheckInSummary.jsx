import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import Header from "../components/Sucess-header";
import SuccessCard from "../components/SuccessCard";
import Footer from "../components/Footer";

export default function CheckInSummary() {
  const { name, exitKey, checkInTime, office } = useLocalSearchParams();

  return (
    <LinearGradient
      colors={["#1A237E", "#3949AB", "#5C6BC0"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* ✅ Header */}
        <Header title="VisiTrak" />

        {/* ✅ Main Content */}
        <View className="flex-1 items-center justify-center px-4">
          <SuccessCard
            name={name || "Guest Visitor"}
            exitKey={exitKey || "N/A"}
            checkIn={checkInTime || "N/A"}
            visiting={office || "N/A"}
          />

          {/* ✅ Message */}
          <View className="mt-7">
            <Text className="text-center text-white text-2xl font-semibold">
              Have a great visit!
            </Text>
          </View>
        </View>

        {/* ✅ Footer */}
        <Footer />
      </SafeAreaView>
    </LinearGradient>
  );
}
