import { useState, useRef, useEffect } from "react";
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import Header from "../components/Satisfaction_header";
import Question from "../components/Question";
import EmojiRating from "../components/EmojiRating";

import { addFeedback } from "../lib/feedbacks.service";

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
  const params = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);

  // Debug: Log received params
  useEffect(() => {
    console.log("🎯 FeedbackForm mounted with params:", params);
    console.log("  - visitId:", params.visitId);
    console.log("  - visitorName:", params.visitorName);
  }, [params]);

  const visitId = params.visitId;
  const visitorName = params.visitorName;

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
  const [submitting, setSubmitting] = useState(false);

  const questionRefs = useRef({});

  const handleAnswer = (number, value) => {
    console.log(`📝 Answer updated - Question ${number}: ${value}`);
    setAnswers((prev) => ({ ...prev, [number]: value }));
  };

  const handleSubmit = async () => {
    console.log("🚀 Submit button pressed");
    console.log("Current answers:", answers);
    console.log("Current suggestion:", suggestion);

    if (submitting) {
      console.log("⏳ Already submitting, ignoring...");
      return;
    }
    
    setSubmitting(true);

    // Check unanswered questions (allow 0 as valid)
    const firstUnansweredIndex = questions.findIndex(
      (_, i) => answers[i + 1] === undefined
    );
    
    if (firstUnansweredIndex !== -1) {
      const questionNumber = firstUnansweredIndex + 1;
      console.log(`⚠️ Question ${questionNumber} is unanswered`);
      
      const questionRef = questionRefs.current[questionNumber];

      if (questionRef) {
        questionRef.measureLayout(
          scrollRef.current,
          (x, y) => {
            scrollRef.current?.scrollTo({ y: y - 20, animated: true });
          },
          (error) => console.log("measureLayout error:", error)
        );
      }

      setHighlightQuestion(questionNumber);
      setShowModal(true);
      setSubmitting(false);
      return;
    }

    console.log("✅ All questions answered");

    if (!visitId || !visitorName) {
      console.error("❌ Missing visitId or visitorName!");
      Alert.alert("Error", "Missing visit information. Please try again.");
      setSubmitting(false);
      return;
    }

    try {
      // Sanitize answers - ensure all values are numbers
      const sanitizedAnswers = {};
      Object.keys(answers).forEach((key) => {
        sanitizedAnswers[key.toString()] = Number(answers[key]);
      });

      console.log("📦 Prepared feedback object:");
      const feedbackObject = {
        visitId,
        name: visitorName,
        answers: sanitizedAnswers,
        suggestion: suggestion.trim(),
      };
      console.log(JSON.stringify(feedbackObject, null, 2));

      console.log("⏳ Calling addFeedback...");
      const result = await addFeedback(feedbackObject);

      router.replace({
        pathname: "/ThankYouScreen",
        params: {
          visitorName,
        },
      });
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      console.error("Error stack:", error.stack);
      
      Alert.alert(
        "Error",
        `Failed to submit feedback: ${error.message}\n\nPlease check the console for details.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Early validation if visit info is missing
  if (!visitId || !visitorName) {
    console.warn("⚠️ Missing visit information on mount");
    return (
      <View className="flex-1 justify-center items-center bg-purple-800 px-5">
        <Feather name="alert-circle" size={60} color="#fff" />
        <Text className="text-white text-center text-xl font-bold mt-4">
          Missing Visit Information
        </Text>
        <Text className="text-white/80 text-center mt-2">
          visitId: {visitId || "missing"}
        </Text>
        <Text className="text-white/80 text-center">
          visitorName: {visitorName || "missing"}
        </Text>
        <Pressable
          onPress={() => router.replace("/")}
          className="bg-white mt-6 px-8 py-3 rounded-full"
        >
          <Text className="text-purple-800 font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

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
                marginTop: sizes.padding,
              }}
            >
              <Text
                style={{
                  fontSize: sizes.fontTitle,
                  fontWeight: "bold",
                  marginBottom: sizes.marginVertical / 2,
                  textAlign: "center",
                }}
              >
                Give Feedback
              </Text>
              
              <Text
                style={{
                  fontSize: sizes.statusText,
                  color: "#666",
                  marginBottom: sizes.marginVertical,
                  textAlign: "center",
                }}
              >
                Visitor: {visitorName}
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

              <View style={{ marginTop: sizes.marginVertical }}>
                <Text
                  style={{
                    fontWeight: "600",
                    marginBottom: sizes.iconPadding,
                    color: "#333",
                    fontSize: sizes.statusText,
                  }}
                >
                  Suggestions or comments
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
                  opacity: submitting ? 0.6 : 1,
                }}
                disabled={submitting}
              >
                <Text
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    fontSize: sizes.fontButton,
                    fontWeight: "600",
                  }}
                >
                  {submitting ? "Submitting..." : "SUBMIT FEEDBACK"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Incomplete Submission Modal */}
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
                <Feather name="alert-circle" size={sizes.icon} color="#6c47ff" />
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