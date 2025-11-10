import React, { useState } from "react";
import { View, Text, Modal, ScrollView, Pressable } from "react-native";
import Checkbox from "expo-checkbox";

export default function TermsAgreement({ agreeTerms, setAgreeTerms }) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <View className="mt-6 mb-2 px-12">
      {/* Agreement Section */}
      <View className="flex-row items-center">
        <Checkbox
          value={agreeTerms}
          onValueChange={setAgreeTerms}
          color={agreeTerms ? "#3949AB" : undefined}
          className="mr-2"
        />
        <Text className="text-white flex-1 flex-wrap text-sm">
          I have read and agree to the{" "}
          <Text
            className="text-blue-300 underline font-medium"
            onPress={() => setShowTerms(true)}
          >
            Terms and Conditions
          </Text>{" "}
          and{" "}
          <Text
            className="text-blue-300 underline font-medium"
            onPress={() => setShowPrivacy(true)}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      {/* Terms and Conditions Modal */}
      <Modal
        visible={showTerms}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTerms(false)}
      >
        <View className="flex-1 bg-black/60 justify-center px-4">
          <View className="bg-white rounded-2xl p-4 max-h-[80%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-center font-bold text-lg mb-2">
                VisiTrak – Terms and Conditions
              </Text>
              <Text className="text-xs text-gray-700 mb-3 text-center">
                Last Updated: October 25, 2025
              </Text>

              <Text className="text-gray-800 text-sm leading-5 mb-3">
                Welcome to VisiTrak! These Terms and Conditions govern your use
                of the VisiTrak mobile application. By using this app, you agree
                to the following:
              </Text>

              <Text className="font-semibold mt-2 mb-1">1. Authorized Use</Text>
              <Text className="text-gray-800 text-sm mb-2">
                VisiTrak is for authorized personnel only. Visitors cannot log
                in or create accounts. Only designated staff may record visitor
                entries. Unauthorized access or misuse is strictly prohibited.
              </Text>

              <Text className="font-semibold mt-2 mb-1">2. Data Collection</Text>
              <Text className="text-gray-800 text-sm mb-2">
                The app may collect visitor information such as name, contact
                details, purpose of visit, and time of entry. This data is used
                only for visitor tracking and official records.
              </Text>

              <Text className="font-semibold mt-2 mb-1">3. Privacy</Text>
              <Text className="text-gray-800 text-sm mb-2">
                All collected data is handled securely and used only for
                authorized purposes. VisiTrak does not share or sell any
                personal data.
              </Text>

              <Text className="font-semibold mt-2 mb-1">
                4. Staff Responsibilities
              </Text>
              <Text className="text-gray-800 text-sm mb-2">
                Authorized users must enter accurate visitor details, maintain
                confidentiality, and use the app only for legitimate purposes.
              </Text>

              <Text className="font-semibold mt-2 mb-1">
                5. Limitation of Liability
              </Text>
              <Text className="text-gray-800 text-sm mb-2">
                The developers of VisiTrak are not responsible for data loss,
                misuse, or unauthorized access beyond reasonable control. Use of
                this app implies acceptance of these terms.
              </Text>

              <Text className="font-semibold mt-2 mb-1">6. Updates</Text>
              <Text className="text-gray-800 text-sm mb-2">
                These Terms may be updated periodically. Continued use after
                updates means you accept the revised version.
              </Text>

              <Text className="font-semibold mt-2 mb-1">7. Contact</Text>
              <Text className="text-gray-800 text-sm mb-2">
                For questions or concerns, contact us at
                support@visitrak.app.
              </Text>

              <Text className="text-xs text-center text-gray-500 mt-4">
                © 2025 VisiTrak. All rights reserved.
              </Text>
            </ScrollView>

            <Pressable
              onPress={() => setShowTerms(false)}
              className="bg-blue-600 py-2 rounded-xl mt-4"
            >
              <Text className="text-center text-white font-medium">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacy}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacy(false)}
      >
        <View className="flex-1 bg-black/60 justify-center px-4">
          <View className="bg-white rounded-2xl p-4 max-h-[80%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-center font-bold text-lg mb-2">
                VisiTrak – Privacy Policy
              </Text>
              <Text className="text-xs text-gray-700 mb-3 text-center">
                Last Updated: October 25, 2025
              </Text>

              <Text className="text-gray-800 text-sm leading-5 mb-3">
                This Privacy Policy explains how VisiTrak collects, uses, and
                protects visitor information. By using the app, you agree to the
                practices described below.
              </Text>

              <Text className="font-semibold mt-2 mb-1">
                1. Information We Collect
              </Text>
              <Text className="text-gray-800 text-sm mb-2">
                VisiTrak records basic visitor details such as name, contact
                number, purpose of visit, and time of entry and exit. All data
                is collected by authorized personnel.
              </Text>

              <Text className="font-semibold mt-2 mb-1">
                2. How We Use Information
              </Text>
              <Text className="text-gray-800 text-sm mb-2">
                Data is used only for visitor tracking, reporting, and security
                purposes. We do not use data for marketing or advertising.
              </Text>

              <Text className="font-semibold mt-2 mb-1">
                3. Data Storage and Security
              </Text>
              <Text className="text-gray-800 text-sm mb-2">
                Visitor data is stored securely within the organization’s
                system. Reasonable measures are taken to prevent unauthorized
                access or misuse.
              </Text>

              <Text className="font-semibold mt-2 mb-1">4. Data Sharing</Text>
              <Text className="text-gray-800 text-sm mb-2">
                VisiTrak does not share or sell personal data. Information may
                only be shared if required by law or authorized agencies.
              </Text>

              <Text className="font-semibold mt-2 mb-1">5. Data Retention</Text>
              <Text className="text-gray-800 text-sm mb-2">
                Visitor records are retained only as long as necessary or as
                required by policy, after which they are securely deleted.
              </Text>

              <Text className="font-semibold mt-2 mb-1">6. User Rights</Text>
              <Text className="text-gray-800 text-sm mb-2">
                Visitors may request access to or correction of their data
                through the managing organization.
              </Text>

              <Text className="font-semibold mt-2 mb-1">
                7. Policy Updates
              </Text>
              <Text className="text-gray-800 text-sm mb-2">
                This Privacy Policy may be updated periodically. Continued use
                of the app means you accept the revised version.
              </Text>

              <Text className="font-semibold mt-2 mb-1">8. Contact Us</Text>
              <Text className="text-gray-800 text-sm mb-2">
                For privacy concerns, contact privacy@visitrak.app.
              </Text>

              <Text className="text-xs text-center text-gray-500 mt-4">
                © 2025 VisiTrak. All rights reserved.
              </Text>
            </ScrollView>

            <Pressable
              onPress={() => setShowPrivacy(false)}
              className="bg-blue-600 py-2 rounded-xl mt-4"
            >
              <Text className="text-center text-white font-medium">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
