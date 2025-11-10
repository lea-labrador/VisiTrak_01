import React, { useState } from "react";
import { ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import Footer from "../components/Footer";
import BackgroundCarousel from "../components/BackgroundCarousel";
import PersonalInfoSection from "../components/PersonalInfoSection";
import VisitInfoSection from "../components/VisitInfoSection";
import ContactInfoSection from "../components/ContactInfoSection";
import TermsAgreement from "../components/TermsAgreement";
import SubmitButton from "../components/SubmitButton";

import backG01 from "../assets/images/backG01.png";
import backG02 from "../assets/images/backG02.png";
import backG03 from "../assets/images/backG03.png";

export default function VisiTrakForm() {
  const router = useRouter();

  // States
  const [fullName, setFullName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [office, setOffice] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [emojiRating] = useState(0);

  const purposes = ["COR/TOR", "Medical", "Payment", "VISIT", "Other"];
  const offices = ["Registrar", "Clinic", "Cashier", "CCIS/CTAS Faculty", "CCJ Faculty", "Other"];
  const images = [backG01, backG02, backG03];

  const generateExitKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const onSubmit = () => {
    if (!agreeTerms) {
      alert("Please agree to the Terms and Conditions and Privacy Policy");
      return;
    }
    if (!fullName || !purpose || !office || !contactNumber) {
      alert("Please fill in all required fields");
      return;
    }

    const exitKey = generateExitKey();
    const checkInTime = new Date().toLocaleTimeString();

    router.push({
      pathname: "/CheckInSummary",
      params: {
        name: fullName,
        office,
        purpose,
        contactNumber,
        email,
        checkInTime,
        exitKey,
        rating: emojiRating,
      },
    });
  };

  return (
    <LinearGradient colors={["#1A237E", "#3949AB", "#5C6BC0"]} className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <BackgroundCarousel images={images} />
        <PersonalInfoSection
          fullName={fullName}
          setFullName={setFullName}
          homeAddress={homeAddress}
          setHomeAddress={setHomeAddress}
        />
        <VisitInfoSection
          purpose={purpose}
          setPurpose={setPurpose}
          office={office}
          setOffice={setOffice}
          purposes={purposes}
          offices={offices}
        />
        <ContactInfoSection
          contactNumber={contactNumber}
          setContactNumber={setContactNumber}
          email={email}
          setEmail={setEmail}
        />
        <TermsAgreement agreeTerms={agreeTerms} setAgreeTerms={setAgreeTerms} />
        <SubmitButton onPress={onSubmit} />
        <Footer />
      </ScrollView>
    </LinearGradient>
  );
}
