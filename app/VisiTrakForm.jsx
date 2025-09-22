import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  ImageBackground,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Checkbox from "expo-checkbox";

import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import EmojiRating from "../components/EmojiRating";

import backG1 from "../assets/images/header-bg4.png";

export default function VisiTrakForm() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [office, setOffice] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [emojiRating, setEmojiRating] = useState(0); // 1-5 for backend

  const purposes = ["COR/TOR", "Medical", "Delivery", "Maintenance", "Other"];
  const offices = ["Registrar", "Clinic", "Finance Office", "IT Support", "Management"];

  // Generate 6-character alphanumeric exit key
  const generateExitKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const onSubmit = () => {
    if (!agreeTerms) {
      alert("Please agree to the Terms and Conditions");
      return;
    }
    if (!fullName || !purpose || !office || !contactNumber) {
      alert("Please fill in all required fields");
      return;
    }

    const exitKey = generateExitKey();
    const checkInTime = new Date().toLocaleTimeString();

    // Navigate to summary screen using Expo Router
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
        {/* Header */}
        <ImageBackground source={backG1} className="w-full h-64 px-9 pt-8">
          <View className="flex-1">
            <Header title="VisiTrak" />
            <Text className="text-white font-bold text-2xl mt-4 tracking-wide">
              Your Visit Matters
            </Text>
            <Text className="text-white text-lg mt-1">
              Thank you for being part of our vibrant community!
            </Text>
            <View className="absolute -bottom-8 self-center">
              <View className="flex-1 w-20 h-20 rounded-full bg-white justify-center items-center border-2 border-blue-500">
                <Ionicons name="person" size={32} color="#1a3c9e" />
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Personal Info */}
        <View className="mt-24 px-9">
          <SectionTitle icon={<Ionicons name="person" size={20} color="#b6b6b6" />} text="Personal Information" />
          <View className="bg-white/10 border-2 border-indigo-400 rounded-xl p-6">
            <InputField
              icon={<Ionicons name="person-outline" size={20} color="#0a3aca" />}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
            <InputField
              icon={<Ionicons name="home-outline" size={20} color="#0a3aca" />}
              placeholder="Home Address"
              value={homeAddress}
              onChangeText={setHomeAddress}
            />
          </View>
        </View>

        {/* Visit Info */}
        <View className="mt-8 px-9">
          <SectionTitle icon={<Ionicons name="location-outline" size={20} color="#b6b6b6" />} text="Visit Information" />
          <View className="bg-white/10 border-2 border-indigo-400 rounded-xl p-6">
            <SelectField
              icon={<Ionicons name="newspaper-outline" size={20} color="#0a3aca" />}
              selectedValue={purpose}
              onValueChange={setPurpose}
              placeholder="Purpose of Visit"
              options={purposes}
            />
            <SelectField
              icon={<FontAwesome name="building-o" size={20} color="#0a3aca" />}
              selectedValue={office}
              onValueChange={setOffice}
              placeholder="Office to Visit"
              options={offices}
            />
          </View>
        </View>

        {/* Contact Info */}
        <View className="mt-8 px-9">
          <SectionTitle icon={<MaterialIcons name="contact-phone" size={18} color="#fff" />} text="Contact Information" />
          <View className="bg-white/10 border-2 border-indigo-400 rounded-xl p-6">
            <InputField
              icon={<Entypo name="phone" size={16} color="#0a3aca" />}
              placeholder="Contact Number"
              value={contactNumber}
              onChangeText={setContactNumber}
            />
            <InputField
              icon={<Entypo name="email" size={16} color="#0a3aca" />}
              placeholder="Email (optional)"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>


        {/* Terms */}
        <View className="flex-row items-center mt-6 mb-2 px-12">
          <Checkbox
            value={agreeTerms}
            onValueChange={setAgreeTerms}
            color={agreeTerms ? "#3949AB" : undefined}
            className="mr-2"
          />
          <Text className="text-white flex-1 flex-wrap">
            I have read and agree to the{" "}
            <Text className="text-black underline font-medium" onPress={() => alert("Show Terms and Conditions")}>
              Terms and Conditions
            </Text>
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          onPress={onSubmit}
          className="h-14 w-11/12 mx-auto mt-6 mb-6 rounded-xl bg-indigo-900 justify-center items-center shadow-lg"
        >
          <Text className="text-white text-lg font-bold tracking-wide">Submit Registration</Text>
        </Pressable>

        <Footer />
      </ScrollView>
    </LinearGradient>
  );
}
