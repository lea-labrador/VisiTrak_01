import { View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import QrScanner from "./QrScanner";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ExitScreen() {
  const [keyCode, setKeyCode] = useState("");
  const router = useRouter();

  const handleScanned = (data) => {
    console.log("✅ User exit key:", data);
    router.push("/FeedbackForm");
  };

  return (
    <LinearGradient
      colors={["#381366", "#4A2279", "#573483"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">

          {/* Header with StatusBar padding */}
          <View style={{ paddingTop: StatusBar.currentHeight || 0 }}>
            <Header title="VisiTrak" />
          </View>

          {/* QR Scanner Section */}
          <View className="flex-1 justify-center">
            <QrScanner
              onScanned={handleScanned}
              keyCode={keyCode}
              setKeyCode={setKeyCode}
            />
          </View>

          {/* Bottom footer */}
          <Footer />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
