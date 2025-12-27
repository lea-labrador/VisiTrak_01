import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import Header from "../components/Satisfaction_header";
import Question from "../components/Question";
import EmojiRating from "../components/EmojiRating";

const questions = [
  "Responsiveness (Pag abi-abi).",
  "Reliability (Kalig-on sa serbisyo).",
  "Access & Facilities (Sayon tuoran ang opisina, komportable ug maayo ang mga pasilidad).",
  "Communication (Pamagi sa pag pasabot).",
  "Costs (Klaridad sa balayaran).",
  "Integrity (Matinud-anon, makiangayon, ug patas).",
  "Assurance (Kasiguruhan sa serbisyo).",
  "Outcome (Nanghatag ang hustong serbisyo).",
];

export default function FeedbackForm() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);

  const scale = Math.min(Math.max(width / 400, 0.85), 1.6);

  const sizes = {
    icon: 30 * scale,
    iconPadding: 12 * scale,
    fontTitle: 24 * scale,
    fontButton: 20 * scale,
    fontInput: 16 * scale,
    padding: 16 * scale,
    borderRadius: 10 * scale,
    marginVertical: 12 * scale,
    minHeightInput: 120 * scale,
    statusText: 14 * scale,
  };

  const [answers, setAnswers] = useState({});
  const [suggestion, setSuggestion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [highlightQuestion, setHighlightQuestion] = useState(null);

  // Store refs to each question container
  const questionRefs = useRef({});

  const handleAnswer = (number, value) => {
    setAnswers((prev) => ({ ...prev, [number]: value }));
  };

  const handleSubmit = () => {
    const firstUnansweredIndex = questions.findIndex((_, i) => !answers[i + 1]);

    if (firstUnansweredIndex !== -1) {
      const questionNumber = firstUnansweredIndex + 1;
      const questionRef = questionRefs.current[questionNumber];

      if (questionRef) {
        questionRef.measureLayout(
          scrollRef.current,
          (x, y) => {
            scrollRef.current?.scrollTo({ y: y - 20, animated: true });
          },
          (error) => {
            console.log("measureLayout error:", error);
          }
        );
      }

      setHighlightQuestion(questionNumber);
      setShowModal(true);
      return;
    }

    // All questions answered
    const formData = { answers, suggestion };
    console.log("Feedback submitted:", formData);
    router.push("/ThankYouScreen");
  };

  return (
    <LinearGradient colors={["#381366", "#4A2279", "#573483"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <Header title="VisiTrak" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ paddingBottom: sizes.padding }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                backgroundColor: "#F2F2F2",
                borderRadius: sizes.borderRadius,
                padding: sizes.padding,
                marginHorizontal: sizes.padding / 2,
              }}
            >
              <Text
                style={{
                  fontSize: sizes.fontTitle,
                  fontWeight: "bold",
                  marginBottom: sizes.marginVertical,
                  textAlign: "center",
                }}
              >
                Give Feedback
              </Text>

              {questions.map((text, index) => (
                <View
                  key={index}
                  ref={(el) => (questionRefs.current[index + 1] = el)}
                >
                  <Question
                    number={index + 1}
                    text={text}
                    highlight={highlightQuestion === index + 1}
                  >
                    <EmojiRating
                      value={answers[index + 1]}
                      onChange={(value) => handleAnswer(index + 1, value)}
                      iconSize={sizes.icon}
                      iconPadding={sizes.iconPadding}
                    />
                  </Question>
                </View>
              ))}

              {/* Suggestion Box */}
              <View style={{ marginTop: sizes.marginVertical }}>
                <Text
                  style={{
                    fontWeight: "600",
                    marginBottom: sizes.iconPadding,
                    color: "#333",
                    fontSize: sizes.statusText,
                  }}
                >
                  Suggestions or comments to help us improve?
                </Text>
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: sizes.borderRadius,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                >
                  <TextInput
                    multiline
                    textAlignVertical="top"
                    placeholder="Write your suggestion here..."
                    value={suggestion}
                    maxLength={300}
                    onChangeText={setSuggestion}
                    style={{
                      padding: sizes.padding,
                      color: "#333",
                      fontSize: sizes.fontInput,
                      minHeight: sizes.minHeightInput,
                    }}
                  />
                </View>
                <Text
                  style={{
                    textAlign: "right",
                    color: "#777",
                    fontSize: sizes.statusText,
                    marginTop: 4 * scale,
                  }}
                >
                  {suggestion.length}/300
                </Text>
              </View>

              <Pressable
                onPress={handleSubmit}
                style={{
                  width: "100%",
                  backgroundColor: "#4A2279",
                  paddingVertical: 14 * scale,
                  borderRadius: sizes.borderRadius,
                  marginTop: sizes.marginVertical,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    fontSize: sizes.fontButton,
                    fontWeight: "600",
                  }}
                >
                  SUBMIT FEEDBACK
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Modal */}
          <Modal
            transparent
            animationType="fade"
            visible={showModal}
            onRequestClose={() => setShowModal(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: sizes.padding,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: sizes.borderRadius,
                  padding: sizes.padding,
                  width: "100%",
                  maxWidth: 300 * scale,
                  alignItems: "center",
                }}
              >
                <Feather
                  name="alert-circle"
                  size={sizes.icon}
                  color="#6c47ff"
                />
                <Text
                  style={{
                    fontSize: sizes.fontTitle / 1.5,
                    fontWeight: "600",
                    color: "#333",
                    marginTop: sizes.iconPadding,
                    textAlign: "center",
                  }}
                >
                  Incomplete Submission
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#555",
                    marginTop: 6 * scale,
                    fontSize: sizes.statusText,
                  }}
                >
                  Please complete all ratings before submitting.
                </Text>
                <Pressable
                  onPress={() => setShowModal(false)}
                  style={{
                    marginTop: 16 * scale,
                    backgroundColor: "#4A2279",
                    paddingVertical: 10 * scale,
                    paddingHorizontal: 24 * scale,
                    borderRadius: sizes.borderRadius,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: sizes.fontInput,
                    }}
                  >
                    OK
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
