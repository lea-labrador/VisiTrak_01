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
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";

import Header from "../components/Satisfaction_header";
import Question from "../components/Question";
import EmojiRating from "../components/EmojiRating";

import { addFeedback } from "../lib/feedbacks.service";
import { getVisitById } from "../lib/visits.service";

const ratingQuestions = [
  "Responsiveness (Pag abi-abi).",
  "Reliability (Quality) (Masaligan sa serbisyo).",
  "Access & Facilities (Sayon tuoron ang opisina, komportable ug maayo ang mga pasilidad).",
  "Communication (Pamaagi sa pagpasabot).",
  "Costs (Klaridad sa bayranan).",
  "Integrity (Matuinod-anon, makiangayon, ug patas).",
  "Assurance (Kasiguruhan sa serbisyo).",
  "Outcome (Nahatag ang hustong serbisyo).",
];

const clientTypeOptions = ["Citizen", "Business", "Government"];
const sexOptions = ["Male", "Female"];

const regionOptions = [
  "NCR", "CAR", "I", "II", "III", "IV-A", "IV-B", "V", "VI",
  "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "BARMM",
];

const citizensCharterQuestions = [
  {
    id: "cc1",
    title: "CC1",
    text: "Which of the following best describes your awareness of a CC?",
    singleColumn: true,
    options: [
      { value: "1", label: "1 - I know what a CC is and I saw this office's CC." },
      { value: "2", label: "2 - I know what a CC is but I did not see its office's CC." },
      { value: "3", label: "3 - I learned of the CC only when I saw this office's CC." },
      { value: "4", label: "4 - I do not know what a CC is and I did not see one in this office.", note: "(Answer 'N/A' on CC2 and CC3)" },
    ],
  },
  {
    id: "cc2",
    title: "CC2",
    text: "If aware of CC (answered 1-3 in CC1), would you say that the CC of this office was..?",
    options: [
      { value: "1", label: "1 - Easy to see" },
      { value: "4", label: "4 - Not visible at all" },
      { value: "2", label: "2 - Somewhat easy to see" },
      { value: "5", label: "5 - N/A" },
      { value: "3", label: "3 - Difficult to see" },
    ],
  },
  {
    id: "cc3",
    title: "CC3",
    text: "If aware of CC (answered codes 1-3 in CC1), how much did the CC help you in your transaction?",
    options: [
      { value: "1", label: "1 - Helped very much" },
      { value: "3", label: "3 - Did not help" },
      { value: "2", label: "2 - Somewhat helped" },
      { value: "4", label: "4 - N/A" },
    ],
  },
];

const readSingleParam = (value) => (Array.isArray(value) ? value[0] : value);

const parseBooleanParam = (value, fallbackValue = true) => {
  const resolvedValue = readSingleParam(value);
  if (resolvedValue === undefined || resolvedValue === null || resolvedValue === "") {
    return fallbackValue;
  }

  if (typeof resolvedValue === "boolean") {
    return resolvedValue;
  }

  const normalizedValue = String(resolvedValue).trim().toLowerCase();
  if (["false", "0", "no"].includes(normalizedValue)) return false;
  if (["true", "1", "yes"].includes(normalizedValue)) return true;
  return fallbackValue;
};

export default function FeedbackForm() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);
  const questionRefs = useRef({});

  const visitIdParam = readSingleParam(params.visitId);
  const visitorNameParam = readSingleParam(params.visitorName);
  const showNameToAdminParam = parseBooleanParam(params.showNameToAdmin, true);

  const visitId = visitIdParam ? String(visitIdParam) : "";
  const visitorName = visitorNameParam ? String(visitorNameParam) : "";

  const scale = Math.min(Math.max(width / 400, 0.85), 1.3);

  const sizes = {
    icon: 28 * scale,
    iconPadding: 10 * scale,
    fontTitle: 19 * scale,
    fontButton: 18 * scale,
    fontInput: 14 * scale,
    fontLabel: 13 * scale,
    fontBody: 12.5 * scale,
    padding: 16 * scale,
    borderRadius: 10 * scale,
    marginVertical: 12 * scale,
    minHeightInput: 120 * scale,
    statusText: 12 * scale,
  };

  const [answers, setAnswers] = useState({});
  const [commendation, setCommendation] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [highlightQuestion, setHighlightQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [clientType, setClientType] = useState("");
  const [sex, setSex] = useState("");
  const [region, setRegion] = useState("VII");
  const [officeVisited, setOfficeVisited] = useState("");
  const [servicesAvailed, setServicesAvailed] = useState("");
  const [servicedBy, setServicedBy] = useState("");
  const [ccResponses, setCcResponses] = useState({ cc1: "", cc2: "", cc3: "" });
  const [loadingVisitOffice, setLoadingVisitOffice] = useState(false);
  const [visitOfficeError, setVisitOfficeError] = useState("");
  const [showNameToAdmin, setShowNameToAdmin] = useState(showNameToAdminParam);

  useEffect(() => {
    setShowNameToAdmin(showNameToAdminParam);
  }, [showNameToAdminParam]);

  useEffect(() => {
    let mounted = true;

    const loadVisitOffice = async () => {
      if (!visitId) return;

      if (mounted) {
        setLoadingVisitOffice(true);
        setVisitOfficeError("");
      }

      try {
        const visit = await getVisitById(visitId);
        if (!mounted) return;

        const officeName = String(visit?.office || "").trim();

        setOfficeVisited(officeName);
        setValidationErrors((prev) =>
          prev.officeVisited ? { ...prev, officeVisited: false } : prev
        );

        if (!officeName) {
          setVisitOfficeError(
            "The checked-in office for this visit could not be found."
          );
        }
      } catch (loadError) {
        console.error("Failed to load visit details:", loadError);
        if (!mounted) return;
        setOfficeVisited("");
        setVisitOfficeError("Failed to load the checked-in office for this visit.");
      } finally {
        if (mounted) {
          setLoadingVisitOffice(false);
        }
      }
    };

    loadVisitOffice();

    return () => {
      mounted = false;
    };
  }, [visitId]);

  const clearValidationError = (fieldName) => {
    setError("");
    setValidationErrors((prev) => {
      if (!prev[fieldName]) return prev;
      return { ...prev, [fieldName]: false };
    });
  };

  const handleAnswer = (number, value) => {
    setAnswers((prev) => ({ ...prev, [number]: value }));
    setHighlightQuestion(null);
  };

  const handleCcOptionChange = (questionId, optionValue) => {
    clearValidationError(questionId);

    if (questionId === "cc1" && optionValue === "4" && ccResponses.cc1 !== "4") {
      clearValidationError("cc2");
      clearValidationError("cc3");
    }

    setCcResponses((prev) => {
      const isTogglingOff = prev[questionId] === optionValue;

      if (questionId === "cc1") {
        if (optionValue === "4") {
          if (isTogglingOff) return { ...prev, cc1: "", cc2: "", cc3: "" };
          return { ...prev, cc1: "4", cc2: "5", cc3: "4" };
        }

        const nextCc1 = isTogglingOff ? "" : optionValue;
        if (prev.cc1 === "4") {
          return { ...prev, cc1: nextCc1, cc2: "", cc3: "" };
        }
        return { ...prev, cc1: nextCc1 };
      }

      return { ...prev, [questionId]: isTogglingOff ? "" : optionValue };
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setError("");

    const nonRatingValidation = {
      clientType: !clientType,
      sex: !sex,
      region: !region,
      officeVisited: !officeVisited,
      cc1: !ccResponses.cc1,
      cc2: !ccResponses.cc2,
      cc3: !ccResponses.cc3,
    };
    setValidationErrors(nonRatingValidation);

    if (Object.values(nonRatingValidation).some(Boolean)) {
      const officeMessage = nonRatingValidation.officeVisited
        ? " The checked-in office for this visit is missing."
        : "";
      setError(
        `Please complete all required fields in Client Type, Sex, Region, and CC questions.${officeMessage}`
      );
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setSubmitting(false);
      return;
    }

    const firstUnansweredIndex = ratingQuestions.findIndex((_, i) => answers[i + 1] === undefined);
    if (firstUnansweredIndex !== -1) {
      const questionNumber = firstUnansweredIndex + 1;
      const questionRef = questionRefs.current[questionNumber];

      if (questionRef) {
        questionRef.measureLayout(
          scrollRef.current,
          (x, y) => {
            scrollRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
          },
          () => {}
        );
      }

      setHighlightQuestion(questionNumber);
      setShowModal(true);
      setSubmitting(false);
      return;
    }

    if (!visitId || !visitorName) {
      Alert.alert("Error", "Missing visit information. Please try again.");
      setSubmitting(false);
      return;
    }

    try {
      const sanitizedAnswers = {};
      Object.keys(answers).forEach((key) => {
        sanitizedAnswers[key.toString()] = Number(answers[key]);
      });

      const displayName = showNameToAdmin ? visitorName : "Anonymous";

      const feedbackObject = {
        visitId,
        name: visitorName,
        displayName,
        showNameToAdmin,
        answers: sanitizedAnswers,
        suggestion: suggestion.trim(),
        commendation: commendation.trim(),
        surveyDetails: {
          clientType: clientType || null,
          sex: sex || null,
          region: region || null,
          unitOfficeVisited: officeVisited || null,
          servicesAvailed: servicesAvailed.trim(),
          servicedBy: servicedBy.trim(),
          citizensCharter: ccResponses,
        },
      };

      await addFeedback(feedbackObject);

      router.replace({
        pathname: "/ThankYouScreen",
        params: { visitorName },
      });
    } catch (submitError) {
      console.error("Feedback submit failed:", submitError);
      Alert.alert("Error", `Failed to submit feedback: ${submitError.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!visitId || !visitorName) {
    return (
      <View className="flex-1 justify-center items-center bg-purple-800 px-5">
        <Feather name="alert-circle" size={60} color="#fff" />
        <Text className="text-white text-center text-xl font-bold mt-4">Missing Visit Information</Text>
        <Text className="text-white/80 text-center mt-2">visitId: {visitId || "missing"}</Text>
        <Text className="text-white/80 text-center">visitorName: {visitorName || "missing"}</Text>
        <Pressable onPress={() => router.replace("/")} className="bg-white mt-6 px-8 py-3 rounded-full">
          <Text className="text-purple-800 font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#381366", "#4A2279", "#573483"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <Header title="VisiTrak" />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: sizes.padding }} keyboardShouldPersistTaps="handled">
            <View style={{ backgroundColor: "#F2F2F2", borderRadius: sizes.borderRadius, padding: sizes.padding, marginHorizontal: sizes.padding / 2, marginTop: sizes.padding }}>
              <Text style={{ fontSize: sizes.fontTitle, fontWeight: "700", textAlign: "center", color: "#1f1f1f" }}>
                CUSTOMER SATISFACTION FEEDBACK FORM
              </Text>

              <Text style={{ fontSize: sizes.statusText, color: "#5f5f5f", marginTop: 6 * scale, marginBottom: sizes.marginVertical, textAlign: "center" }}>
                VISITOR: {visitorName}
              </Text>

              <View
                style={{
                  marginBottom: sizes.marginVertical,
                  borderWidth: 1,
                  borderColor: "#d8b4fe",
                  borderRadius: 10 * scale,
                  backgroundColor: "#faf5ff",
                  paddingHorizontal: 12 * scale,
                  paddingVertical: 10 * scale,
                }}
              >
                <Pressable
                  onPress={() => setShowNameToAdmin((current) => !current)}
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                  <View
                    style={{
                      width: 18 * scale,
                      height: 18 * scale,
                      borderRadius: 4 * scale,
                      borderWidth: 1.2,
                      borderColor: showNameToAdmin ? "#552b98" : "#707070",
                      backgroundColor: showNameToAdmin ? "#552b98" : "#fff",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 1 * scale,
                    }}
                  >
                    {showNameToAdmin ? <Feather name="check" size={11 * scale} color="#fff" /> : null}
                  </View>

                  <View style={{ flex: 1, marginLeft: 10 * scale }}>
                    <Text style={{ fontSize: sizes.fontLabel, fontWeight: "700", color: "#1f1f1f" }}>
                      Show my name to the admin with this feedback
                    </Text>
                    <Text
                      style={{
                        marginTop: 3 * scale,
                        fontSize: sizes.statusText,
                        color: "#5b426f",
                        lineHeight: 18 * scale,
                      }}
                    >
                      {showNameToAdmin
                        ? `Admins will see ${visitorName}.`
                        : "Admins will see Anonymous instead of your name."}
                    </Text>
                  </View>
                </Pressable>
              </View>

              {error ? (
                <View style={{ borderWidth: 1, borderColor: "#f87171", backgroundColor: "#fef2f2", borderRadius: 8 * scale, paddingHorizontal: 10 * scale, paddingVertical: 8 * scale, marginBottom: sizes.marginVertical }}>
                  <Text style={{ color: "#b91c1c", fontSize: sizes.statusText }}>{error}</Text>
                </View>
              ) : null}

              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 8 * scale }}>
                <View style={{ width: "48%", minWidth: 150 * scale, borderWidth: validationErrors.clientType ? 1 : 0, borderColor: "#f87171", backgroundColor: validationErrors.clientType ? "#fff1f2" : "transparent", borderRadius: 8 * scale, paddingHorizontal: 6 * scale, paddingVertical: 4 * scale, marginBottom: 8 * scale }}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
                    <Text style={{ fontSize: sizes.fontLabel, fontWeight: "600", color: "#1f1f1f", marginRight: 8 * scale }}>Client Type:</Text>
                    {clientTypeOptions.map((option) => {
                      const checked = clientType === option;
                      return (
                        <Pressable key={option} onPress={() => { clearValidationError("clientType"); setClientType((current) => (current === option ? "" : option)); }} style={{ flexDirection: "row", alignItems: "center", marginRight: 14 * scale, marginBottom: 4 * scale }}>
                          <View style={{ width: 16 * scale, height: 16 * scale, borderRadius: 3, borderWidth: 1, borderColor: checked ? "#552b98" : "#707070", backgroundColor: checked ? "#552b98" : "#fff", justifyContent: "center", alignItems: "center" }}>
                            {checked ? <Feather name="check" size={11 * scale} color="#fff" /> : null}
                          </View>
                          <Text numberOfLines={1} style={{ marginLeft: 6 * scale, fontSize: sizes.fontBody, color: "#2f2f2f" }}>{option}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={{ width: "48%", minWidth: 150 * scale, borderWidth: validationErrors.sex ? 1 : 0, borderColor: "#f87171", backgroundColor: validationErrors.sex ? "#fff1f2" : "transparent", borderRadius: 8 * scale, paddingHorizontal: 6 * scale, paddingVertical: 4 * scale, marginBottom: 8 * scale }}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
                    <Text style={{ fontSize: sizes.fontLabel, fontWeight: "600", color: "#1f1f1f", marginRight: 8 * scale }}>Sex:</Text>
                    {sexOptions.map((option) => {
                      const checked = sex === option;
                      return (
                        <Pressable key={option} onPress={() => { clearValidationError("sex"); setSex((current) => (current === option ? "" : option)); }} style={{ flexDirection: "row", alignItems: "center", marginRight: 14 * scale, marginBottom: 4 * scale }}>
                          <View style={{ width: 16 * scale, height: 16 * scale, borderRadius: 3, borderWidth: 1, borderColor: checked ? "#552b98" : "#707070", backgroundColor: checked ? "#552b98" : "#fff", justifyContent: "center", alignItems: "center" }}>
                            {checked ? <Feather name="check" size={11 * scale} color="#fff" /> : null}
                          </View>
                          <Text numberOfLines={1} style={{ marginLeft: 6 * scale, fontSize: sizes.fontBody, color: "#2f2f2f" }}>{option}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View style={{ marginTop: 4 * scale }}>
                <Text style={{ fontSize: sizes.fontLabel, fontWeight: "600", color: "#1f1f1f" }}>Region of Residence</Text>
                <View style={{ marginTop: 4 * scale, borderWidth: 1, borderColor: validationErrors.region ? "#ef4444" : "#707070", borderRadius: 8 * scale, overflow: "hidden", backgroundColor: validationErrors.region ? "#fff1f2" : "#fff" }}>
                  <Picker selectedValue={region} onValueChange={(value) => { clearValidationError("region"); setRegion(value); }} style={{ height: 48 * scale, color: "#1f1f1f" }}>
                    {regionOptions.map((option) => <Picker.Item key={option} label={option} value={option} />)}
                  </Picker>
                </View>
              </View>

              <View style={{ marginTop: 10 * scale }}>
                <Text style={{ fontSize: sizes.fontLabel, fontWeight: "600", color: "#1f1f1f" }}>Unit / Office Visited</Text>
                <View style={{ marginTop: 4 * scale, borderWidth: 1, borderColor: validationErrors.officeVisited ? "#ef4444" : "#707070", borderRadius: 8 * scale, backgroundColor: validationErrors.officeVisited ? "#fff1f2" : "#fff", paddingHorizontal: 12 * scale, paddingVertical: 12 * scale, minHeight: 48 * scale, justifyContent: "center" }}>
                  <Text style={{ color: officeVisited ? "#1f1f1f" : "#707070", fontSize: sizes.fontInput }}>
                    {loadingVisitOffice
                      ? "Loading checked-in office..."
                      : officeVisited || "No checked-in office found for this visit."}
                  </Text>
                </View>
                {visitOfficeError ? (
                  <Text style={{ marginTop: 4 * scale, fontSize: sizes.statusText, color: "#b91c1c" }}>
                    {visitOfficeError}
                  </Text>
                ) : null}
              </View>

              <View style={{ marginTop: 10 * scale }}>
                <Text style={{ fontSize: sizes.fontLabel, fontWeight: "600", color: "#1f1f1f" }}>Services Availed (Optional)</Text>
                <TextInput value={servicesAvailed} onChangeText={setServicesAvailed} placeholder="Type here..." style={{ marginTop: 4 * scale, borderWidth: 1, borderColor: "#707070", borderRadius: 8 * scale, backgroundColor: "#fff", paddingHorizontal: 12 * scale, paddingVertical: 10 * scale, fontSize: sizes.fontInput, color: "#1f1f1f" }} />
              </View>

              <View style={{ marginTop: 10 * scale }}>
                <Text style={{ fontSize: sizes.fontLabel, fontWeight: "600", color: "#1f1f1f" }}>Serviced by (Optional)</Text>
                <TextInput value={servicedBy} onChangeText={setServicedBy} placeholder="Type here..." style={{ marginTop: 4 * scale, borderWidth: 1, borderColor: "#707070", borderRadius: 8 * scale, backgroundColor: "#fff", paddingHorizontal: 12 * scale, paddingVertical: 10 * scale, fontSize: sizes.fontInput, color: "#1f1f1f" }} />
              </View>

              <View style={{ height: 3, borderRadius: 2, backgroundColor: "#6f4aa7", marginTop: 16 * scale, marginBottom: 12 * scale }} />

              <Text style={{ fontSize: sizes.statusText, color: "#2f2f2f", lineHeight: 18 * scale, marginBottom: 10 * scale }}>
                Instructions: Tap you answer to the Citizen&apos;s Charter (CC) questions. The Citizen&apos;s Charter is an official document that reflects the services of a government agency/office including its requirements, fees, and processing time among others.
              </Text>

              {citizensCharterQuestions.map((question) => (
                <View key={question.id} style={{ borderWidth: validationErrors[question.id] ? 1 : 0, borderColor: "#f87171", backgroundColor: validationErrors[question.id] ? "#fff1f2" : "transparent", borderRadius: 8 * scale, paddingHorizontal: 6 * scale, paddingVertical: 6 * scale, marginBottom: 10 * scale }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 6 * scale }}>
                    <Text style={{ width: 34 * scale, fontSize: sizes.fontLabel, fontWeight: "700", color: "#1f1f1f" }}>{question.title}</Text>
                    <Text style={{ flex: 1, fontSize: sizes.fontBody, color: "#1f1f1f", lineHeight: 18 * scale }}>{question.text}</Text>
                  </View>

                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {question.options.map((option) => {
                      const selected = ccResponses[question.id] === option.value;
                      return (
                        <Pressable key={option.value} onPress={() => handleCcOptionChange(question.id, option.value)} style={{ width: question.singleColumn ? "100%" : "50%", paddingRight: question.singleColumn ? 0 : 8 * scale, marginBottom: 6 * scale, flexDirection: "row", alignItems: "flex-start" }}>
                          <View style={{ width: 16 * scale, height: 16 * scale, borderRadius: 3, borderWidth: 1, borderColor: selected ? "#552b98" : "#707070", backgroundColor: selected ? "#552b98" : "#fff", justifyContent: "center", alignItems: "center", marginTop: 1 }}>
                            {selected ? <Feather name="check" size={11 * scale} color="#fff" /> : null}
                          </View>
                          <Text style={{ marginLeft: 6 * scale, flex: 1, fontSize: sizes.statusText, color: "#2f2f2f", lineHeight: 18 * scale }}>
                            {option.label}
                            {option.note ? <Text style={{ fontStyle: "italic" }}> {option.note}</Text> : null}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              <View style={{ height: 3, borderRadius: 2, backgroundColor: "#6f4aa7", marginTop: 6 * scale, marginBottom: 12 * scale }} />

              <Text style={{ fontSize: 16 * scale, fontWeight: "700", color: "#1f1f1f", marginBottom: 6 * scale }}>
                Tap your rate.
              </Text>

              {ratingQuestions.map((text, index) => (
                <View key={index} ref={(el) => { questionRefs.current[index + 1] = el; }}>
                  <Question number={index + 1} text={text} highlight={highlightQuestion === index + 1}>
                    <EmojiRating value={answers[index + 1]} onChange={(value) => handleAnswer(index + 1, value)} iconSize={sizes.icon} iconPadding={sizes.iconPadding} />
                  </Question>
                </View>
              ))}

              <View style={{ marginTop: sizes.marginVertical }}>
                <Text style={{ fontWeight: "600", marginBottom: 6 * scale, color: "#333", fontSize: sizes.fontLabel }}>
                  Commendations (Mga Pagdayeg)
                </Text>
                <View style={{ backgroundColor: "#fff", borderRadius: sizes.borderRadius, borderWidth: 2, borderColor: "#595959" }}>
                  <TextInput multiline textAlignVertical="top" placeholder="Write your commendations here..." value={commendation} maxLength={500} onChangeText={setCommendation} style={{ padding: sizes.padding, color: "#333", fontSize: sizes.fontInput, minHeight: sizes.minHeightInput }} />
                </View>
              </View>

              <View style={{ marginTop: 10 * scale }}>
                <Text style={{ fontWeight: "600", marginBottom: 6 * scale, color: "#333", fontSize: sizes.fontLabel }}>
                  Suggestions (Mga Sugyot)
                </Text>
                <View style={{ backgroundColor: "#fff", borderRadius: sizes.borderRadius, borderWidth: 2, borderColor: "#595959" }}>
                  <TextInput multiline textAlignVertical="top" placeholder="Write your suggestions here..." value={suggestion} maxLength={500} onChangeText={setSuggestion} style={{ padding: sizes.padding, color: "#333", fontSize: sizes.fontInput, minHeight: sizes.minHeightInput }} />
                </View>
              </View>

              <Pressable onPress={handleSubmit} style={{ width: "100%", backgroundColor: "#4A2279", paddingVertical: 14 * scale, borderRadius: sizes.borderRadius, marginTop: sizes.marginVertical, opacity: submitting ? 0.6 : 1 }} disabled={submitting}>
                <Text style={{ color: "#fff", textAlign: "center", fontSize: sizes.fontButton, fontWeight: "700" }}>
                  {submitting ? "Submitting..." : "SUBMIT FEEDBACK"}
                </Text>
              </Pressable>

              <Text style={{ textAlign: "center", color: "#4b4b4b", fontSize: sizes.statusText, marginTop: 8 * scale }}>
                © 2025 LMT. All rights reserved.
              </Text>
            </View>
          </ScrollView>

          <Modal transparent animationType="fade" visible={showModal} onRequestClose={() => setShowModal(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", paddingHorizontal: sizes.padding }}>
              <View style={{ backgroundColor: "#fff", borderRadius: sizes.borderRadius, padding: sizes.padding, width: "100%", maxWidth: 300 * scale, alignItems: "center" }}>
                <Feather name="alert-circle" size={sizes.icon} color="#6c47ff" />
                <Text style={{ fontSize: sizes.fontTitle / 1.2, fontWeight: "700", color: "#333", marginTop: sizes.iconPadding, textAlign: "center" }}>
                  Incomplete Submission
                </Text>
                <Text style={{ textAlign: "center", color: "#555", marginTop: 6 * scale, fontSize: sizes.statusText }}>
                  Please complete all ratings before submitting.
                </Text>
                <Pressable onPress={() => setShowModal(false)} style={{ marginTop: 16 * scale, backgroundColor: "#4A2279", paddingVertical: 10 * scale, paddingHorizontal: 24 * scale, borderRadius: sizes.borderRadius }}>
                  <Text style={{ color: "#fff", fontWeight: "600", fontSize: sizes.fontInput }}>OK</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
