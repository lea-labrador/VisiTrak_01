import React, { useState, useRef } from "react";
import { ScrollView, View } from "react-native";
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
  const positions = useRef({});
  const addressParts = useRef({ municipality: "", barangay: "" });

  // Form States
  const [fullName, setFullName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [office, setOffice] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [emojiRating] = useState(0);

  // Error States 🔴
  const [errors, setErrors] = useState({
    fullName: false,
    homeAddress: false,
    purpose: false,
    office: false,
    contactNumber: false,
    agreeTerms: false,
  });

  const purposes = ["COR/TOR", "MEDICAL", "PAYMENT", "INQUIRY", "SUBMISSION OF REQUIREMENTS", "VISIT", "SEMINAR / WEBINAR", "Other"];
  const offices = ["REGISTRAR", "CLINIC", "CASHIER", "CCIS/CTAS OFFICE", "CCIS EXTENSION OFFICE", "CCJ OFFICE", "Other"];
  const images = [backG01, backG02, backG03];

  const generateExitKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const onSubmit = () => {
    const digitsOnly = (contactNumber || "").replace(/[^0-9]/g, "");
    const newErrors = {
      fullName: fullName.trim() === "",
      homeAddress: homeAddress.trim() === "", 
      purpose: purpose.trim() === "",
      office: office.trim() === "",
      // mark as error unless exactly 11 digits
      contactNumber: digitsOnly.length !== 11,
      agreeTerms: !agreeTerms,
    };


    setErrors(newErrors);

    // If any field is still invalid, stop submission
    if (Object.values(newErrors).includes(true)) {
      // find first invalid key in priority order and scroll to it
      const order = [
        "fullName",
        "homeAddress",
        "purpose",
        "office",
        "contactNumber",
        "agreeTerms",
      ]; 
      const firstInvalid = order.find((k) => newErrors[k]);
      if (firstInvalid) {
        // handle home/address subfields specially
        if (firstInvalid === "homeAddress") {
          // if municipality missing
          if (!addressParts.current.municipality && positions.current.municipality != null) {
            scrollRef.current?.scrollTo({ y: Math.max(0, positions.current.municipality - 20), animated: true });
          } else if (addressParts.current.municipality && !addressParts.current.barangay && positions.current.barangay != null) {
            scrollRef.current?.scrollTo({ y: Math.max(0, positions.current.barangay - 20), animated: true });
          } else if (positions.current.homeAddress != null) {
            scrollRef.current?.scrollTo({ y: Math.max(0, positions.current.homeAddress - 20), animated: true });
          }
        } else if (firstInvalid === "contactNumber") {
          if (positions.current.contactNumber != null) {
            scrollRef.current?.scrollTo({ y: Math.max(0, positions.current.contactNumber - 20), animated: true });
          } else {
            // fallback: scroll to end where contact input is likely located
            scrollRef.current?.scrollToEnd({ animated: true });
          }
        } else if (positions.current[firstInvalid] != null) {
          scrollRef.current?.scrollTo({ y: Math.max(0, positions.current[firstInvalid] - 20), animated: true });
        }
      }
      return;
    }

    const exitKey = generateExitKey();
    const checkInTime = new Date().toLocaleTimeString();

    router.push({
      pathname: "/CheckInSummary",
      params: {
        name: fullName,
        address: homeAddress,
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
    <LinearGradient colors={["#381366", "#4A2279", "#573483"]} className="flex-1">
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 40 }}>
        <BackgroundCarousel images={images} />

        <View onLayout={(e) => { positions.current.header = e.nativeEvent.layout.y; }} />

        <PersonalInfoSection
          fullName={fullName}
          setFullName={setFullName}
          homeAddress={homeAddress}
          setHomeAddress={setHomeAddress}
          errors={errors}
          setErrors={setErrors}
          onNameLayout={(e) => { positions.current.fullName = e.nativeEvent.layout.y; }}
          onAddressLayout={(e) => { positions.current.homeAddress = e.nativeEvent.layout.y; }}
          onAddressPartsChange={(parts) => { addressParts.current = parts; }}
        />


        <VisitInfoSection
          purpose={purpose}
          setPurpose={setPurpose}
          office={office}
          setOffice={setOffice}
          purposes={purposes}
          offices={offices}
          errors={errors}
          setErrors={setErrors}  
          onPurposeLayout={(e) => { positions.current.purpose = e.nativeEvent.layout.y; }}
          onOfficeLayout={(e) => { positions.current.office = e.nativeEvent.layout.y; }}
        />


        <ContactInfoSection
          contactNumber={contactNumber}
          setContactNumber={setContactNumber}
          email={email}
          setEmail={setEmail}
          errors={errors}
          setErrors={setErrors}
          onContactLayout={(e) => { positions.current.contactNumber = e.nativeEvent.layout.y; }}
        />


        <TermsAgreement
          agreeTerms={agreeTerms}
          setAgreeTerms={setAgreeTerms}
          errors={errors}
          setErrors={setErrors}
          onTermsLayout={(e) => { positions.current.agreeTerms = e.nativeEvent.layout.y; }}
        />

        <SubmitButton onPress={onSubmit} />
        <Footer />
      </ScrollView>
    </LinearGradient>
  );
}
