import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
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
  errorFont: 12 * scale,
  errorIcon: 18 * scale,
  errorPaddingV: 8 * scale,
  errorPaddingH: 12 * scale,
  errorRadius: 12 * scale,
};

export default function ExitScreen() {
  const [name, setName] = useState("");   
  const [showNameToAdmin, setShowNameToAdmin] = useState(true);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNameRequiredModal, setShowNameRequiredModal] = useState(false);
  const [visitId, setVisitId] = useState(null);
  const [visitorName, setVisitorName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const handleNameChange = (text) => {
    setName(text);
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setShowNameRequiredModal(true);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

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
      const message =
        error?.message?.toLowerCase?.().includes("no active visit")
          ? "No active visit found for this name. Please check the spelling or ensure you checked in first."
          : "Checkout failed. Please try again.";
      setErrorMessage(message);
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
                      errorMessage
                        ? "border-red-400 bg-white"
                        : focused
                          ? "border-purple-500 bg-white"
                          : "border-orange-400 bg-white/90"
                    }`}
                  >
                    <TextInput
                      ref={inputRef}
                      value={name.toUpperCase()}
                      onChangeText={handleNameChange}
                      onFocus={() => {
                        setFocused(true);
                        scrollRef.current?.scrollTo({ y: 0, animated: true });
                      }}
                      onBlur={() => setFocused(false)}
                      placeholder="Enter Your Full Name"
                      placeholderTextColor="#666"
                      autoCapitalize="characters"
                      autoCorrect={false}
                      spellCheck={false}
                      autoComplete="off"
                      textContentType="none"
                      importantForAutofill="no"
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

                  <Pressable
                    onPress={() => setShowNameToAdmin((current) => !current)}
                    disabled={loading}
                    style={{
                      marginTop: 14 * scale,
                      borderWidth: 1,
                      borderColor: "#c084fc",
                      borderRadius: 14 * scale,
                      backgroundColor: "rgba(255,255,255,0.12)",
                      paddingVertical: 12 * scale,
                      paddingHorizontal: 12 * scale,
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <View
                        style={{
                          width: 18 * scale,
                          height: 18 * scale,
                          borderRadius: 4 * scale,
                          borderWidth: 1.4,
                          borderColor: showNameToAdmin ? "#fb923c" : "#f8fafc",
                          backgroundColor: showNameToAdmin ? "#fb923c" : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 1 * scale,
                        }}
                      >
                        {showNameToAdmin ? (
                          <AntDesign name="check" size={11 * scale} color="#ffffff" />
                        ) : null}
                      </View>

                      <View style={{ flex: 1, marginLeft: 10 * scale }}>
                        <Text
                          className="text-white font-semibold"
                          style={{ fontSize: sizes.inputFont - 1 }}
                        >
                          Show my name to the admin with my feedback
                        </Text>
                        <Text
                          className="text-white/80 mt-1"
                          style={{ fontSize: sizes.subtitleFont + 0.5 }}
                        >
                          {showNameToAdmin
                            ? "Your feedback will include your name."
                            : "Your feedback will appear as Anonymous."}
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  {/* Error Message */}
                  {errorMessage ? (
                    <View
                      className="mt-4 border"
                      style={{
                        borderColor: "#E989B9",
                        backgroundColor: "#6B3A79",
                        borderRadius: sizes.errorRadius,
                        paddingVertical: sizes.errorPaddingV,
                        paddingHorizontal: sizes.errorPaddingH,
                      }}
                    >
                      <View className="flex-row items-start">
                        <View
                          style={{
                            width: sizes.errorIcon * 1.6,
                            height: sizes.errorIcon * 1.6,
                            borderRadius: (sizes.errorIcon * 1.6) / 2,
                            backgroundColor: "#7E4A8E",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 2 * scale,
                          }}
                        >
                          <AntDesign
                            name="warning"
                            size={sizes.errorIcon}
                            color="#F3B2D3"
                          />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text
                            className="text-white font-semibold"
                            style={{ fontSize: sizes.errorFont + 1 }}
                          >
                            No active visit found
                          </Text>
                          <Text
                            className="text-white/90 mt-1"
                            style={{ fontSize: sizes.errorFont }}
                          >
                            {errorMessage}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

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

              <Footer compact />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Success Modal - Now with visitId and visitorName */}
        <SuccessModal
          visible={showSuccess}
          onClose={() => setShowSuccess(false)}
          visitId={visitId}
          visitorName={visitorName}
          showNameToAdmin={showNameToAdmin}
        />

        <Modal
          visible={showNameRequiredModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNameRequiredModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.45)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24 * scale,
            }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: 320,
                backgroundColor: "#ffffff",
                borderRadius: 12 * scale,
                paddingVertical: 16 * scale,
                paddingHorizontal: 14 * scale,
                borderWidth: 2,
                borderColor: "#f97316",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 40 * scale,
                  height: 40 * scale,
                  borderRadius: 20 * scale,
                  backgroundColor: "#ffedd5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8 * scale,
                }}
              >
                <AntDesign name="warning" size={20 * scale} color="#ea580c" />
              </View>

              <Text
                style={{
                  fontSize: 16 * scale,
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                Error
              </Text>

              <Text
                style={{
                  marginTop: 4 * scale,
                  fontSize: 13 * scale,
                  color: "#374151",
                  textAlign: "center",
                }}
              >
                Please enter your full name.
              </Text>

              <Pressable
                onPress={() => {
                  setShowNameRequiredModal(false);
                  setTimeout(() => inputRef.current?.focus?.(), 100);
                }}
                style={{
                  marginTop: 12 * scale,
                  backgroundColor: "#7c3aed",
                  borderRadius: 8 * scale,
                  paddingVertical: 8 * scale,
                  paddingHorizontal: 20 * scale,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: 13 * scale,
                  }}
                >
                  OK
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
