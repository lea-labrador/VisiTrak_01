import React from "react";
import { View, Text } from "react-native";
import Checkbox from "expo-checkbox";

export default function TermsAgreement({ agreeTerms, setAgreeTerms }) {
  return (
    <View className="flex-row items-center mt-6 mb-2 px-12">
      <Checkbox
        value={agreeTerms}
        onValueChange={setAgreeTerms}
        color={agreeTerms ? "#3949AB" : undefined}
        className="mr-2"
      />
      <Text className="text-white flex-1 flex-wrap text-sm">
        I have read and agree to the{" "}
        <Text
          className="text-black underline font-medium"
          onPress={() => alert("Show Terms and Conditions")}
        >
          Terms and Conditions
        </Text>
      </Text>
    </View>
  );
}
