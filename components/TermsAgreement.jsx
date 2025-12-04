import React, { useState } from "react";
import { View, Text, Modal, ScrollView, Pressable, useWindowDimensions } from "react-native";
import Checkbox from "expo-checkbox";

export default function TermsAgreement({ agreeTerms, setAgreeTerms, errors, onTermsLayout }) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { width, height } = useWindowDimensions();

  const hasError = errors?.agreeTerms;

  // Responsive sizing based on screen dimensions
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;
  const isTablet = width >= 768;

  // Dynamic sizes
  const containerPaddingHorizontal = isSmallScreen ? 6 : isMediumScreen ? 8 : 12;
  const checkboxSize = isSmallScreen ? 18 : isMediumScreen ? 20 : 22;
  const textSize = isSmallScreen ? 12 : isMediumScreen ? 14 : 16;
  const modalPadding = isSmallScreen ? 3 : isMediumScreen ? 4 : 6;
  const modalMaxHeight = isTablet ? "85%" : "80%";
  const titleSize = isSmallScreen ? 16 : isMediumScreen ? 18 : 20;
  const contentTextSize = isSmallScreen ? 12 : isMediumScreen ? 14 : 16;
  const sectionTitleSize = isSmallScreen ? 14 : isMediumScreen ? 16 : 18;
  const buttonPaddingVertical = isSmallScreen ? 10 : isMediumScreen ? 12 : 14;

  return (
    <View 
      className="mt-6 mb-2"
      style={{ paddingHorizontal: containerPaddingHorizontal }}
      onLayout={onTermsLayout}
    >
      {/* Agreement Section */}
      <View className="flex-row items-start">

        {/* FIXED CHECKBOX — NOW WHITE WHEN UNCHECKED */}
        <View 
          style={{
            marginLeft: 30,
            marginRight: 8,
            borderWidth: 2,
            borderColor: hasError && !agreeTerms ? "red" : "white",
            borderRadius: 6,
          }}
        >
          <Checkbox
            value={agreeTerms}
            onValueChange={setAgreeTerms}
            color={agreeTerms ? "#3949AB" : undefined}
            style={{
              width: checkboxSize,
              height: checkboxSize,
              backgroundColor: "white",
            }}
          />
        </View>

        <Text 
          className="text-white flex-1 flex-wrap"
          style={{ fontSize: textSize, lineHeight: textSize * 1.4, marginTop: 2, paddingRight: 10 }}
        >
          I have read and agree to the{" "}
          <Text className="text-blue-300 underline font-medium" onPress={() => setShowTerms(true)}>
            Terms and Conditions
          </Text>{" "}
          and{" "}
          <Text className="text-blue-300 underline font-medium" onPress={() => setShowPrivacy(true)}>
            Privacy Policy
          </Text>.
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
          <View 
            className="bg-white rounded-2xl"
            style={{
              padding: modalPadding * 4,
              maxHeight: modalMaxHeight,
              marginHorizontal: isTablet ? width * 0.1 : 0
            }}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              <Text 
                className="text-center font-bold mb-2"
                style={{ fontSize: titleSize }}
              >
                VisiTrak – Terms and Conditions
              </Text>
              <Text 
                className="text-gray-700 mb-3 text-center"
                style={{ fontSize: contentTextSize - 2 }}
              >
                Last Updated: October 25, 2025
              </Text>

              <Text 
                className="text-gray-800 leading-5 mb-3"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                Welcome to VisiTrak! These Terms and Conditions govern your use
                of the VisiTrak mobile application. By using this app, you agree
                to the following:
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                1. Authorized Use
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                VisiTrak is for authorized personnel only. Visitors cannot log
                in or create accounts. Only designated staff may record visitor
                entries. Unauthorized access or misuse is strictly prohibited.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                2. Data Collection
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                The app may collect visitor information such as name, contact
                details, purpose of visit, and time of entry. This data is used
                only for visitor tracking and official records.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                3. Privacy and Security
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                All collected data is handled securely and used only for
                authorized purposes. VisiTrak does not share or sell any
                personal data.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                4. Staff Responsibilities
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                Authorized users must enter accurate visitor details, maintain
                confidentiality, and use the app only for legitimate purposes.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                5. Limitation of Liability
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                The developers of VisiTrak are not responsible for data loss,
                misuse, or unauthorized access beyond reasonable control. Use of
                this app implies acceptance of these terms.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                6. Updates to Terms
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                These Terms may be updated periodically. Continued use after
                updates means you accept the revised version.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                7. Contact
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                For questions or concerns, contact us at
                support@visitrak.app.
              </Text>

              <Text 
                className="text-center text-gray-500 mt-4"
                style={{ fontSize: contentTextSize - 2 }}
              >
                © 2025 VisiTrak. All rights reserved.
              </Text>
            </ScrollView>

            <Pressable
              onPress={() => setShowTerms(false)}
              className="bg-blue-600 rounded-xl mt-4"
              style={{ paddingVertical: buttonPaddingVertical }}
            >
              <Text 
                className="text-center text-white font-medium"
                style={{ fontSize: contentTextSize }}
              >
                Close
              </Text>
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
          <View 
            className="bg-white rounded-2xl"
            style={{
              padding: modalPadding * 4,
              maxHeight: modalMaxHeight,
              marginHorizontal: isTablet ? width * 0.1 : 0
            }}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              <Text 
                className="text-center font-bold mb-2"
                style={{ fontSize: titleSize }}
              >
                VisiTrak – Privacy Policy
              </Text>
              <Text 
                className="text-gray-700 mb-3 text-center"
                style={{ fontSize: contentTextSize - 2 }}
              >
                Last Updated: October 25, 2025
              </Text>

              <Text 
                className="text-gray-800 leading-5 mb-3"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                This Privacy Policy explains how VisiTrak collects, uses, and
                protects visitor information. By using the app, you agree to the
                practices described below.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                1. Information We Collect
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                VisiTrak records basic visitor details such as name, contact
                number, purpose of visit, and time of entry and exit. All data
                is collected by authorized personnel.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                2. Data Usage
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                The collected data is used only for monitoring visitor traffic, maintaining
                security, and generating authorized reports. It is not shared or sold to any
                third party.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                3. Data Storage and Security
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                All personal information is stored securely and accessed only by authorized
                personnel. Appropriate technical and organizational measures are applied to
                protect against unauthorized access.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                4. Data Sharing
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                VisiTrak does not share or sell personal data. Information may
                only be shared if required by law or authorized agencies.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                5. Data Retention
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                Visitor records are retained only as long as necessary or as
                required by policy, after which they are securely deleted.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                6. User Rights
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                Visitors may request access to or correction of their data
                through the managing organization.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                7. Policy Updates
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                This Privacy Policy may be updated periodically. Continued use
                of the app means you accept the revised version.
              </Text>

              <Text 
                className="font-semibold mt-2 mb-1"
                style={{ fontSize: sectionTitleSize }}
              >
                8. Contact Us
              </Text>
              <Text 
                className="text-gray-800 mb-2"
                style={{ fontSize: contentTextSize, lineHeight: contentTextSize * 1.5 }}
              >
                For privacy concerns, contact privacy@visitrak.app.
              </Text>

              <Text 
                className="text-center text-gray-500 mt-4"
                style={{ fontSize: contentTextSize - 2 }}
              >
                © 2025 VisiTrak. All rights reserved.
              </Text>
            </ScrollView>

            <Pressable
              onPress={() => setShowPrivacy(false)}
              className="bg-blue-600 rounded-xl mt-4"
              style={{ paddingVertical: buttonPaddingVertical }}
            >
              <Text 
                className="text-center text-white font-medium"
                style={{ fontSize: contentTextSize }}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}