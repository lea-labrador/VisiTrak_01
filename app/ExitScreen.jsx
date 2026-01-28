import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

import Header from "../components/Header";
import Footer from "../components/Footer";
import SuccessModal from "./SuccessModal";

import { setCheckOutTimeByName } from "../lib/visits.service";

const { width } = Dimensions.get("window");
const scale = Math.min(Math.max(width / 400, 0.8), 1.8);

const sizes = {
  iconCircle: 60 * scale,
  iconSize: 38 * scale,
  titleFont: 25 * scale,
  subtitleFont: 12 * scale,
  inputFont: 16 * scale,
  inputPaddingV: 10 * scale,
  inputPaddingH: 14 * scale,
  buttonFont: 16 * scale,
  buttonPadding: 10 * scale,
  cardPadding: 24 * scale,
  cardRadius: 20 * scale,
};

export default function ExitScreen() {
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [visitId, setVisitId] = useState(null);
  const [visitorName, setVisitorName] = useState("");

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name.");
      return;
    }

    try {
      setLoading(true);

      const upperCaseName = name.trim().toUpperCase();
      
      // setCheckOutTimeByName returns the visit document ID
      const id = await setCheckOutTimeByName(upperCaseName);

      if (!id) {
        throw new Error("No active visit found");
      }

      // Store both visitId and visitorName for the modal
      setVisitId(id);
      setVisitorName(upperCaseName);
      setShowSuccess(true);
      
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (error) {
      console.error("Checkout error:", error);
      Alert.alert(
        "Checkout Failed",
        "No active visit found for this name. Please check the spelling or ensure you checked in first."
      );
    } finally {
      setLoading(false);
      setName(""); // Reset input
    }
  };

  return (
    <LinearGradient colors={["#381366", "#4A2279", "#573483"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1">
              <Header title="VisiTrak" />

              {/* Main Content */}
              <View className="flex-1 justify-center px-5 py-8">
                <View
                  className="bg-white/15 border border-orange-400 shadow-lg"
                  style={{
                    padding: sizes.cardPadding,
                    borderRadius: sizes.cardRadius,
                  }}
                >
                  {/* Icon */}
                  <View className="items-center mb-6">
                    <View
                      className="bg-orange-400/90 items-center justify-center mb-4"
                      style={{
                        width: sizes.iconCircle,
                        height: sizes.iconCircle,
                        borderRadius: sizes.iconCircle / 2,
                      }}
                    >
                      <AntDesign name="logout" size={sizes.iconSize} color="#4F46E5" />
                    </View>

                    <Text
                      className="text-white font-extrabold text-center"
                      style={{ fontSize: sizes.titleFont }}
                    >
                      Visitor Checkout
                    </Text>

                    <Text
                      className="text-red-300 italic text-center mt-2 mb-4"
                      style={{ fontSize: sizes.subtitleFont }}
                    >
                      NOTE: Enter the name used during check-in
                    </Text>
                  </View>

                  {/* Input */}
                  <View
                    className={`border rounded-xl ${
                      focused ? "border-purple-500 bg-white" : "border-orange-400 bg-white/90"
                    }`}
                  >
                    <TextInput
                      ref={inputRef}
                      value={name.toUpperCase()}
                      onChangeText={setName}
                      onFocus={() => {
                        setFocused(true);
                        scrollRef.current?.scrollTo({ y: 0, animated: true });
                      }}
                      onBlur={() => setFocused(false)}
                      placeholder="Enter Your Name"
                      placeholderTextColor="#666"
                      style={{
                        fontSize: sizes.inputFont,
                        paddingVertical: sizes.inputPaddingV,
                        paddingHorizontal: sizes.inputPaddingH,
                        color: "#1f2937",
                      }}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                      editable={!loading}
                    />
                  </View>

                  {/* Submit Button */}
                  <Pressable
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                    className={`mt-8 shadow-md ${
                      loading ? "bg-gray-400" : "bg-purple-600"
                    }`}
                    style={{
                      paddingVertical: sizes.buttonPadding,
                      borderRadius: sizes.cardRadius / 1.6,
                    }}
                  >
                    <Text
                      className="text-white text-center font-bold tracking-widest"
                      style={{ fontSize: sizes.buttonFont }}
                    >
                      {loading ? "PROCESSING..." : "SUBMIT"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Footer />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Success Modal - Now with visitId and visitorName */}
        <SuccessModal
          visible={showSuccess}
          onClose={() => setShowSuccess(false)}
          visitId={visitId}
          visitorName={visitorName}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}