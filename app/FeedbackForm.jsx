import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
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
  const [answers, setAnswers] = useState({});
  const [suggestion, setSuggestion] = useState("");
  const [exitKey, setExitKey] = useState(""); // 🔥 FIXED — state added
  const [showModal, setShowModal] = useState(false);

  const handleAnswer = (number, value) => {
    setAnswers((prev) => ({ ...prev, [number]: value }));
  };

  const handleSubmit = () => {
    const totalQuestions = questions.length;

    if (Object.keys(answers).length !== totalQuestions) {
      setShowModal(true);
      return;
    }

    const formData = { answers, suggestion, exitKey };
    console.log("Feedback submitted:", formData);

    router.push("/ThankYouScreen");
  };

  return (
    <LinearGradient
      colors={["#381366", "#4A2279", "#573483"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <Header title="VisiTrak" />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          className="flex-1 px-6 py-6"
        >
          <View className="bg-[#F2F2F2] rounded-2xl p-6 shadow-md">

            <Text className="text-2xl font-bold mb-6 text-center">
              Give Feedback
            </Text>

            {questions.map((text, index) => (
              <Question key={index} number={index + 1} text={text}>
                <EmojiRating
                  value={answers[index + 1]}
                  onChange={(value) => handleAnswer(index + 1, value)}
                />
              </Question>
            ))}

            {/* Suggestion Box */}
            <View className="mt-6">
              <Text className="font-semibold mb-2 text-gray-800">
                Do you have any suggestions or comments to help us improve?
              </Text>

              <View className="bg-white rounded-xl border border-gray-300 shadow-sm">
                <TextInput
                  multiline
                  textAlignVertical="top"
                  placeholder="Write your suggestion here..."
                  value={suggestion}
                  maxLength={300}
                  onChangeText={setSuggestion}
                  className="p-4 text-gray-700 text-base min-h-[120px]"
                />
              </View>

              <Text className="text-right text-gray-500 text-xs mt-1">
                {suggestion.length}/300
              </Text>
            </View>

            {/* Exit Key Input (Fixed React Native version) */}
            <Text className="mt-4 mb-1 text-gray-800 font-semibold">
              Enter your name <Text className="text-gray-500">(Your name will be shown anonymously.)</Text>
            </Text>

            <View className="flex flex-row items-center gap-2 mb-4 border rounded-md px-3 py-2 bg-white">
              <TextInput
                placeholder="Enter full name..."
                value={exitKey}
                onChangeText={setExitKey}
                className="flex-1 text-gray-700"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              className="w-full bg-purple-800 py-3 rounded-md mt-6"
            >
              <Text className="text-white text-center text-2xl font-semibold">
                SUBMIT FEEDBACK
              </Text>
            </Pressable>

            <Text className="text-center text-gray-500 text-sm mt-4">
              © 2025 LMT. All rights reserved.
            </Text>
          </View>
        </ScrollView>

        {/* Modal */}
        <Modal
          transparent
          animationType="fade"
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View className="flex-1 bg-black/40 justify-center items-center px-8">
            <View className="bg-white rounded-2xl p-6 w-full max-w-[300px] items-center">
              <Feather name="alert-circle" size={38} color="#6c47ff" />

              <Text className="text-lg font-semibold text-gray-800 mt-3 text-center">
                Incomplete Submission
              </Text>

              <Text className="text-center text-gray-600 mt-1 text-sm">
                Please complete all ratings before submitting. Thank you!
              </Text>

              <Pressable
                onPress={() => setShowModal(false)}
                className="mt-5 bg-purple-700 py-2 px-6 rounded-xl"
              >
                <Text className="text-white font-semibold text-base">OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
