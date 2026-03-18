import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import Footer from "../components/Footer";
import BackgroundCarousel from "../components/BackgroundCarousel";
import PersonalInfoSection from "../components/PersonalInfoSection";
import VisitInfoSection from "../components/VisitInfoSection";
import ContactInfoSection from "../components/ContactInfoSection";
import TermsAgreement from "../components/TermsAgreement";
import SubmitButton from "../components/SubmitButton";
import DuplicateVisitModal from "../components/DuplicateVisitModal";

import backG01 from "../assets/images/backG009.png";
import backG02 from "../assets/images/backG004.png";
import backG03 from "../assets/images/backG010.png";

import { addVisit, checkActiveVisitByNameToday } from "../lib/visits.service";
export default function VisiTrakForm() {
  const router = useRouter();
  const scrollRef = useRef(null);

  /* 🔹 SECTION POSITIONS */
  const sectionPositions = useRef({});

  /* 🔹 INPUT REFS */
  const fullNameRef = useRef(null);
  const homeAddressRef = useRef(null);
  const customOfficeRef = useRef(null);
  const customPurposeRef = useRef(null);
  const contactNumberRef = useRef(null);
  const emailRef = useRef(null);
  const agreeTermsRef = useRef(null);

  /* 🔹 FORM STATE */
  const [fullName, setFullName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [office, setOffice] = useState("");
  const [customOffice, setCustomOffice] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [staffName, setStaffName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [emojiRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* 🔹 DUPLICATE CHECK STATE */
  const [nameExistsToday, setNameExistsToday] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [duplicateVisitInfo, setDuplicateVisitInfo] = useState(null);

  /* 🔹 MODAL STATE */
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);

  const images = [backG01, backG02, backG03];

  /* 🔹 SCROLL TO SECTION */
  const scrollToSection = (section) => {
    const y = sectionPositions.current[section];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({
        y: Math.max(0, y - 30),
        animated: true,
      });
    }
  };

  /* 🔹 SECTION → FIELD MAPPING */
  const sectionErrorMap = {
    personal: ["fullName", "homeAddress"],
    visit: ["office", "customOffice", "purpose", "customPurpose"],
    contact: ["contactNumber"],
    terms: ["agreeTerms"],
  };

  /* ======================================================
     🔍 AUTO DUPLICATE CHECK (RUNS WHILE TYPING FULL NAME)
  ====================================================== */
  useEffect(() => {
    const handler = setTimeout(async () => {
      const name = fullName.trim();
      if (name.length < 3) {
        setNameExistsToday(false);
        setDuplicateVisitInfo(null);
        return;
      }

      setCheckingName(true);
      try {
        // 🔹 Fetch previous active visit info
        const existingVisit = await checkActiveVisitByNameToday(name);
        if (existingVisit) {
          setNameExistsToday(true);
          setDuplicateVisitInfo(existingVisit); // Save previous visit
          setErrors((prev) => ({ ...prev, fullName: true }));
          setDuplicateModalVisible(true); // Show modal
        } else {
          setNameExistsToday(false);
          setDuplicateVisitInfo(null);
        }
      } catch (error) {
        console.error("❌ Name duplicate check error:", error);
      } finally {
        setCheckingName(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [fullName]);

  /* 🔹 SUBMIT */
  const onSubmit = async () => {
    if (submitting) return;

    // 🔴 BLOCK IF DUPLICATE FOUND
    if (nameExistsToday && duplicateVisitInfo) {
      setDuplicateModalVisible(true);
      scrollToSection("personal");
      return;
    }

    const digitsOnly = (contactNumber || "").replace(/[^0-9]/g, "");

    const newErrors = {
      fullName: fullName.trim() === "",
      homeAddress: homeAddress.trim() === "",
      office: office.trim() === "",
      customOffice: office === "Other" && customOffice.trim() === "",
      purpose: purpose.trim() === "",
      customPurpose: purpose === "Other" && customPurpose.trim() === "",
      contactNumber: digitsOnly.length !== 11,
      agreeTerms: !agreeTerms,
    };

    setErrors(newErrors);

    // 🔹 FIND FIRST SECTION WITH ERROR
    for (const section in sectionErrorMap) {
      const hasError = sectionErrorMap[section].some(
        (field) => newErrors[field]
      );
      if (hasError) {
        scrollToSection(section);
        return;
      }
    }

    // 🔹 ALL VALID
    const finalOffice = office === "Other" ? customOffice : office;
    const finalPurpose = purpose === "Other" ? customPurpose : purpose;

    const visitData = {
      name: fullName,
      address: homeAddress,
      office: finalOffice,
      purpose: finalPurpose,
      staffName,
      contactNumber,
      email,
      rating: emojiRating,
      comment: "",
      checkOutTime: null,
    };

    setSubmitting(true);
    try {
      await addVisit(visitData);
      router.push({
        pathname: "/CheckInSummary",
        params: visitData,
      });
    } catch (error) {
      console.error("Firestore submission error:", error);
      Alert.alert("Error", "Failed to submit visit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={["#381366", "#4A2279", "#573483"]} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <BackgroundCarousel images={images} />

          {/* 🔹 PERSONAL INFO */}
          <View
            onLayout={(e) =>
              (sectionPositions.current.personal = e.nativeEvent.layout.y)
            }
          >
            <PersonalInfoSection
              fullName={fullName}
              setFullName={setFullName}
              fullNameRef={fullNameRef}
              homeAddress={homeAddress}
              setHomeAddress={setHomeAddress}
              homeAddressRef={homeAddressRef}
              errors={errors}
              setErrors={setErrors}
              nameExistsToday={nameExistsToday}
              checkingName={checkingName}
              onFullNameSubmit={() => homeAddressRef.current?.focus()}
              onHomeAddressSubmit={() => customOfficeRef.current?.focus()}
            />
          </View>

          {/* 🔹 VISIT INFO */}
          <View
            onLayout={(e) =>
              (sectionPositions.current.visit = e.nativeEvent.layout.y)
            }
          >
            <VisitInfoSection
              purpose={purpose}
              setPurpose={setPurpose}
              office={office}
              setOffice={setOffice}
              customOffice={customOffice}
              setCustomOffice={setCustomOffice}
              customPurpose={customPurpose}
              setCustomPurpose={setCustomPurpose}
              staffName={staffName}
              setStaffName={setStaffName}
              errors={errors}
              setErrors={setErrors}
              customOfficeRef={customOfficeRef}
              customPurposeRef={customPurposeRef}
              onCustomOfficeSubmit={() => contactNumberRef.current?.focus()}
              onCustomPurposeSubmit={() => contactNumberRef.current?.focus()}
            />
          </View>

          {/* 🔹 CONTACT INFO */}
          <View
            onLayout={(e) =>
              (sectionPositions.current.contact = e.nativeEvent.layout.y)
            }
          >
            <ContactInfoSection
              contactNumber={contactNumber}
              setContactNumber={setContactNumber}
              contactNumberRef={contactNumberRef}
              email={email}
              setEmail={setEmail}
              emailRef={emailRef}
              errors={errors}
              setErrors={setErrors}
              onContactSubmit={() => emailRef.current?.focus()}
              onEmailSubmit={onSubmit}
            />
          </View>

          {/* 🔹 TERMS */}
          <View
            onLayout={(e) =>
              (sectionPositions.current.terms = e.nativeEvent.layout.y)
            }
          >
            <TermsAgreement
              agreeTerms={agreeTerms}
              setAgreeTerms={setAgreeTerms} 
              ref={agreeTermsRef}
              errors={errors}
              setErrors={setErrors}
            />
          </View>

          <SubmitButton
            onPress={onSubmit}
            disabled={submitting}
            title={submitting ? "Submitting..." : "Submit Registration"}
          />
          <Footer />
        </ScrollView>

        {/* 🔹 DUPLICATE MODAL WITH VISITOR DETAILS */}
        <DuplicateVisitModal
          visible={duplicateModalVisible}
          onClose={() => setDuplicateModalVisible(false)}
          onProceed={() => {
            setDuplicateModalVisible(false);
            router.push("/ScanScreenOut"); // Navigate to check-out page
          }}
          visitorData={duplicateVisitInfo} // Pass visitor info
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
