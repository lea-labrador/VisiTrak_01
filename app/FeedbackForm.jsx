import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // <-- import router

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
  const [q3, setQ3] = useState(null);
  const [q4, setQ4] = useState(null);
  const [offices, setOffices] = useState({});
  const [suggestion, setSuggestion] = useState("");

  const toggleOffice = (office) => {
    setOffices((prev) => ({ ...prev, [office]: !prev[office] }));
  };

  const handleSubmit = () => {
    const data = {
      satisfaction: q1,
      officeVisited: Object.keys(offices).filter((k) => offices[k]),
      cleanliness: q3,
      courteousStaff: q4,
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
              text="Overall, how satisfied are you with your visit to the campus today?"
            >
              <EmojiRating value={q1} onChange={setQ1} />
            </Question>

            {/* Q2 */}
            <Question
              number={2}
              text="Which area or office did you visit? (Choose one)"
            >
              <View className="flex-row flex-wrap">
                {[
                  "Admin Office",
                  "Registrar",
                  "Admin",
                  "SAS Office",
                  "CCIS Faculty Office",
                ].map((office) => (
                  <CheckboxOption
                    key={office}
                    label={office}
                    checked={!!offices[office]}
                    onChange={() => toggleOffice(office)}
                  />
                ))}
                <CheckboxOption
                  label="Other"
                  checked={!!offices["Other"]}
                  onChange={() => toggleOffice("Other")}
                />
              </View>
            </Question>

            {/* Q3 */}
            <Question
              number={3}
              text="How would you rate the cleanliness and safety of the campus?"
            >
              <EmojiRating value={q3} onChange={setQ3} />
            </Question>

            {/* Q4 */}
            <Question number={4} text="Were the staff courteous and helpful?">
              <EmojiRating value={q4} onChange={setQ4} />
            </Question>

            {/* Q5 */}
            <Question
              number={5}
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
