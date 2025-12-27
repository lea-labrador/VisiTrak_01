import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

import Header from "../components/Header";
import Footer from "../components/Footer";
import SuccessModal from "./SuccessModal";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Auto-focus input when screen loads
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) return;
    setShowSuccess(true);
  };

  return (
    <LinearGradient
      colors={["#381366", "#4A2279", "#573483"]}
      className="flex-1"
    >
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

              {/* Content */}
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
                      <AntDesign
                        name="logout"
                        size={sizes.iconSize}
                        color="#4F46E5"
                      />
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
                      focused
                        ? "border-purple-500 bg-white"
                        : "border-orange-400 bg-white/90"
                    }`}
                  >
                    <TextInput
                      ref={inputRef}
                      value={name.toUpperCase()}
                      onChangeText={setName}
                      onFocus={() => {
                        setFocused(true);
                        // Scroll to input when keyboard opens
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
                    />
                  </View>

                  {/* Button */}
                  <Pressable
                    onPress={handleSubmit}
                    className="bg-purple-600 mt-8 active:scale-95 active:opacity-90 shadow-md"
                    style={{
                      paddingVertical: sizes.buttonPadding,
                      borderRadius: sizes.cardRadius / 1.6,
                    }}
                  >
                    <Text
                      className="text-white text-center font-bold tracking-widest"
                      style={{ fontSize: sizes.buttonFont }}
                    >
                      SUBMIT
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Footer />
            </View>

            <SuccessModal
              visible={showSuccess}
              onClose={() => setShowSuccess(false)}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
