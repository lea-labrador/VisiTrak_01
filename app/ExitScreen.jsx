import { View, SafeAreaView, StatusBar } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router"; // for navigation
import QrScanner from "./QrScanner";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ExitScreen() {
  const [keyCode, setKeyCode] = useState("");
  const router = useRouter();

  const handleScanned = (data) => {
    console.log("✅ User exit key:", data);
    router.push("/FeedbackForm"); // directly navigate after scan
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-900">
      <View className="flex-1 px-6">
        {/* 🔹 Header with safe padding */}
        <View style={{ paddingTop: StatusBar.currentHeight || 0 }}>
          <Header title="VisiTrak" />
        </View>

        {/* QR Scanner + Manual Input */}
        <View className="flex-1 justify-center">
          <QrScanner
            onScanned={handleScanned}
            keyCode={keyCode}
            setKeyCode={setKeyCode}
          />
        </View>

        {/* Footer always at bottom */}
        <Footer />
      </View>
    </SafeAreaView>
  );
}
