import { View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router"; // for navigation
import QrScanner from "./QrScanner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MatchModal from "../components/MatchModal";

export default function ExitScreen() {
  const [keyCode, setKeyCode] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleScanned = (data) => {
    console.log("✅ User exit key:", data);
    setModalVisible(true);
  };

  const handleSurvey = () => {
    setModalVisible(false);
    router.push("/FeedbackForm"); // navigate to survey screen
  };

  const handleQuickOut = () => {
    setModalVisible(false);
    console.log("🚪 Quick checkout done without survey");
    // TODO: perform logout or time-out logic here
  };

  return (
    <View className="flex-1 bg-blue-900 px-6">
      {/* Header */}
      <Header title="VisiTrak" />

      {/* QR Scanner + Manual Input */}
      <View className="flex-1 justify-center">
        <QrScanner
          onScanned={handleScanned}
          keyCode={keyCode}
          setKeyCode={setKeyCode}
        />
      </View>

      {/* Footer */}
      <Footer />

      {/* Match Modal */}
      <MatchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSurvey={handleSurvey}
        onQuickOut={handleQuickOut}
      />
    </View>
  );
}
