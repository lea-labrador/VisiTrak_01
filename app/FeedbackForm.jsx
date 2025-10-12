import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import Header from "../components/Header";
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

  const handleAnswer = (number, value) => {
    setAnswers((prev) => ({ ...prev, [number]: value }));
  };

  const handleSubmit = () => {
    const formData = { answers, suggestion };
    console.log("Feedback submitted:", formData);
    router.push("/ThankYouScreen");
  };

  return (
    <LinearGradient
      colors={["#1A237E", "#3949AB", "#5C6BC0"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <Header title="VisiTrak" />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          className="flex-1 px-6 py-6"
        >
          <View className="bg-[#eaddc3] rounded-2xl p-6 shadow-md">
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

            {/* 💬 Suggestion Text Field (Enhanced Styling) */}
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
                  onChangeText={setSuggestion}
                  className="p-4 text-gray-700 text-base min-h-[120px]"
                />
              </View>

              {/* Optional character counter (can remove if not needed) */}
              <Text className="text-right text-gray-500 text-xs mt-1">
                {suggestion.length}/300
              </Text>
            </View>

            {/* 🚀 Submit Button */}
            <Pressable
              onPress={handleSubmit}
              className="w-full bg-blue-900 py-3 rounded-md mt-6"
            >
              <Text className="text-white text-center font-semibold">
                SUBMIT FEEDBACK
              </Text>
            </Pressable>

            <Text className="text-center text-gray-500 text-sm mt-4">
              © 2025 LMT. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
