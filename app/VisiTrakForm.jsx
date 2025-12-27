import React, { useState, useRef } from "react";
import { ScrollView, KeyboardAvoidingView, Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import Footer from "../components/Footer";
import BackgroundCarousel from "../components/BackgroundCarousel";
import PersonalInfoSection from "../components/PersonalInfoSection";
import VisitInfoSection from "../components/VisitInfoSection";
import ContactInfoSection from "../components/ContactInfoSection";
import TermsAgreement from "../components/TermsAgreement";
import SubmitButton from "../components/SubmitButton";

import backG01 from "../assets/images/backG009.png";
import backG02 from "../assets/images/backG004.png";
import backG03 from "../assets/images/backG010.png";

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
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [emojiRating] = useState(0);
  const [errors, setErrors] = useState({});

  /* 🔹 OPTIONS */
  const purposes = [
    "COR/TOR",
    "MEDICAL",
    "PAYMENT",
    "INQUIRY",
    "SUBMISSION OF REQUIREMENTS",
    "VISIT",
    "SEMINAR / WEBINAR",
    "Other",
  ];

  const offices = [
    "REGISTRAR",
    "CLINIC",
    "CASHIER",
    "CCIS/CTAS OFFICE",
    "CCIS EXTENSION OFFICE",
    "CCJ OFFICE",
    "Other",
  ];

  const images = [backG01, backG02, backG03];

  /* 🔹 EXIT KEY */
  const generateExitKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

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

  /* 🔹 SUBMIT */
  const onSubmit = () => {
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

    /* 🔹 FIND FIRST SECTION WITH ERROR */
    for (const section in sectionErrorMap) {
      const hasError = sectionErrorMap[section].some(
        (field) => newErrors[field]
      );

      if (hasError) {
        scrollToSection(section);
        return;
      }
    }

    /* 🔹 ALL VALID */
    const exitKey = generateExitKey();
    const checkInTime = new Date().toLocaleTimeString();
    const finalOffice = office === "Other" ? customOffice : office;
    const finalPurpose = purpose === "Other" ? customPurpose : purpose;

    router.push({
      pathname: "/CheckInSummary",
      params: {
        name: fullName,
        address: homeAddress,
        office: finalOffice,
        purpose: finalPurpose,
        contactNumber,
        email,
        checkInTime,
        exitKey,
        rating: emojiRating,
      },
    });
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
              (sectionPositions.current.personal =
                e.nativeEvent.layout.y)
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
              onFullNameSubmit={() => homeAddressRef.current?.focus()}
              onHomeAddressSubmit={() => customOfficeRef.current?.focus()}
            />
          </View>

          {/* 🔹 VISIT INFO */}
          <View
            onLayout={(e) =>
              (sectionPositions.current.visit =
                e.nativeEvent.layout.y)
            }
          >
            <VisitInfoSection
              office={office}
              setOffice={setOffice}
              customOffice={customOffice}
              setCustomOffice={setCustomOffice}
              customOfficeRef={customOfficeRef}
              purpose={purpose}
              setPurpose={setPurpose}
              customPurpose={customPurpose}
              setCustomPurpose={setCustomPurpose}
              customPurposeRef={customPurposeRef}
              offices={offices}
              purposes={purposes}
              errors={errors}
              setErrors={setErrors}
              onCustomOfficeSubmit={() => contactNumberRef.current?.focus()}
              onCustomPurposeSubmit={() => contactNumberRef.current?.focus()}
            />
          </View>

          {/* 🔹 CONTACT INFO */}
          <View
            onLayout={(e) =>
              (sectionPositions.current.contact =
                e.nativeEvent.layout.y)
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
              (sectionPositions.current.terms =
                e.nativeEvent.layout.y)
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

          <SubmitButton onPress={onSubmit} />
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
