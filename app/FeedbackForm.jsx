import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; 

import Header from "../components/Header";
import Footer from "../components/Footer";
import Question from "../components/Question";
import EmojiRating from "../components/EmojiRating";
import CheckboxOption from "../components/CheckboxOption";
import TextArea from "../components/TextArea";
import PrimaryButton from "../components/PrimaryButton";

export default function FeedbackForm() {
  const router = useRouter(); // <-- hook for navigation

  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState(null);
  const [q4, setQ4] = useState(null);
  const [q5, setQ5] = useState(null);
  const [q6, setQ6] = useState(null);
  const [q7, setQ7] = useState(null);
  const [q8, setQ8] = useState(null);
  const [offices, setOffices] = useState({});
  const [suggestion, setSuggestion] = useState("");

  const toggleOffice = (office) => {
    setOffices((prev) => ({ ...prev, [office]: !prev[office] }));
  };

  const handleSubmit = () => {
    const data = {
      responsiveness: q1,
      reliability: q2,
      cleanliness: q3,
      courteousStaff: q4,
      courteousStaff: q5,
      courteousStaff: q6,
      courteousStaff: q7,
      courteousStaff: q8,
      suggestion,
    };

    // // Optional: Debug alert
    // Alert.alert("Feedback Submitted", JSON.stringify(data, null, 2));

    // Navigate to ThankYouScreen
    router.push("/ThankYouScreen");
  };

  return (
    <LinearGradient
      colors={["#1A237E", "#3949AB", "#5C6BC0"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          className="flex-1 px-6 py-6"
        >
          <Header title="VisiTrak" />

          {/* Feedback Card */}
          <View className="bg-white rounded-2xl p-6 shadow-md mt-10">
            {/* Q1 */}
            <Question
              number={1}
              text="Responsiveness (Pag abi-abi)."
            >
              <EmojiRating value={q1} onChange={setQ1} />
            </Question>

            {/* Q2 */}
            <Question
              number={2}
              text="Reliability (Quality) (Masaligan sa serbisyo)."
            >
              <EmojiRating value={q2} onChange={setQ2} />
            </Question>

            {/* Q3 */}
            <Question
              number={3}
              text="Access & Facilities (Sayon tuoron ang opisina, komportable ug maayo ang mga pasilidad).">
              <EmojiRating value={q3} onChange={setQ3} />
            </Question>

            {/* Q4 */}
            <Question 
              number={4} 
              text="Communication (Pamaagi sa pag pasabot).">
              <EmojiRating value={q4} onChange={setQ4} />
            </Question>

            {/* Q5 */}
            <Question 
              number={5} 
              text="Costs (Kantidad sa balayrunon).">
              <EmojiRating value={q5} onChange={setQ5} />
            </Question>

            {/* Q6 */}
            <Question 
              number={6} 
              text="Integrity (Matinud-anun, makiangayon, ug patas).">
              <EmojiRating value={q6} onChange={setQ6} />
            </Question>

            {/* Q7 */}
            <Question 
              number={7} 
              text="Assurance (Kapaniguruan sa serbisyo).">
              <EmojiRating value={q7} onChange={setQ7} />
            </Question>

            {/* Q8 */}
            <Question 
              number={8} 
              text="Outcome (Naangkong ang husto  nga serbisyo).">
              <EmojiRating value={q8} onChange={setQ8} />
            </Question>

            {/* Q9 */}
            <Question
              number={9}
              text="Do you have any suggestions or comments to help us improve?"
            >
              <TextArea value={suggestion} onChange={setSuggestion} />
            </Question>

            {/* Submit Button */}
            <PrimaryButton title="SUBMIT FEEDBACK" onPress={handleSubmit} />
          </View>
        </ScrollView>

        <Footer />
      </SafeAreaView>
    </LinearGradient>
  );
}
