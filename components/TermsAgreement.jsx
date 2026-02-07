import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Checkbox from "expo-checkbox";

export default function TermsAgreement({
  agreeTerms,
  setAgreeTerms,
  errors,
  onTermsLayout,
}) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { width, height } = useWindowDimensions();

  const hasError = errors?.agreeTerms;

  // ===============================
  // 🔹 Dynamic Scaling (same pattern as your other files)
  // ===============================
  const scale = Math.min(Math.max(width / 400, 0.8), 1.8);
  const isTablet = width >= 768;

  const sizes = {
    containerPaddingHorizontal: 10 * scale,
    checkboxSize: 20 * scale,
    textSize: 14 * scale,
    modalPadding: 16 * scale,
    titleSize: 18 * scale,
    contentTextSize: 14 * scale,
    sectionTitleSize: 16 * scale,
    buttonPaddingVertical: 12 * scale,
  };

  const modalMaxHeight = isTablet ? "85%" : "80%";

  return (
    <View
      className="mt-6 mb-2"
      style={{ paddingHorizontal: sizes.containerPaddingHorizontal }}
      onLayout={onTermsLayout}
    >
      {/* Agreement Section */}
      <View className="flex-row items-start">
        {/* Checkbox Container */}
        <View
          style={{
            marginLeft: 30 * scale,
            marginRight: 8 * scale,
            borderWidth: 0.5,
            borderColor: hasError && !agreeTerms ? "red" : "white",
            borderRadius: 1 * scale,
          }}
        >
          <Checkbox
            value={agreeTerms}
            onValueChange={setAgreeTerms}
            color={agreeTerms ? "#3949AB" : undefined}
            style={{
              width: sizes.checkboxSize,
              height: sizes.checkboxSize,
              backgroundColor: "white",
            }}
          />
        </View>

        <Text
          className="text-white flex-1 flex-wrap"
          style={{
            fontSize: sizes.textSize,
            lineHeight: sizes.textSize * 1.4,
            marginTop: 2 * scale,
            paddingRight: 10 * scale,
          }}
        >
          I have read and agree to the{" "}
          <Text
            className="text-blue-300 underline font-medium"
            style={{ fontSize: sizes.textSize }}
            onPress={() => setShowTerms(true)}
          >
            Terms and Conditions
          </Text>{" "}
          and{" "}
          <Text
            className="text-blue-300 underline font-medium"
            style={{ fontSize: sizes.textSize }}
            onPress={() => setShowPrivacy(true)}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      {/* ================= Terms Modal ================= */}
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
              padding: sizes.modalPadding,
              maxHeight: modalMaxHeight,
              marginHorizontal: isTablet ? width * 0.1 : 0,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                className="text-center font-bold mb-2"
                style={{ fontSize: sizes.titleSize }}
              >
                VisiTrak – Terms and Conditions
              </Text>

              <Text
                className="text-gray-700 mb-3 text-center"
                style={{ fontSize: sizes.contentTextSize - 2 }}
              >
                Last Updated: October 25, 2025
              </Text>

              <Text
                className="text-gray-800 mb-3"
                style={{
                  fontSize: sizes.contentTextSize,
                  lineHeight: sizes.contentTextSize * 1.5,
                }}
              >
                Welcome to VisiTrak! These Terms and Conditions govern your use
                of the VisiTrak mobile application. By using this app, you agree
                to the following:
              </Text>

              {/* Sections */}
              {[
                ["1. Authorized Use", "VisiTrak is for authorized personnel only. Visitors cannot log in or create accounts. Only designated staff may record visitor entries. Unauthorized access or misuse is strictly prohibited."],
                ["2. Data Collection", "The app may collect visitor information such as name, contact details, purpose of visit, and time of entry. This data is used only for visitor tracking and official records."],
                ["3. Privacy and Security", "All collected data is handled securely and used only for authorized purposes. VisiTrak does not share or sell any personal data."],
                ["4. Staff Responsibilities", "Authorized users must enter accurate visitor details, maintain confidentiality, and use the app only for legitimate purposes."],
                ["5. Limitation of Liability", "The developers of VisiTrak are not responsible for data loss, misuse, or unauthorized access beyond reasonable control. Use of this app implies acceptance of these terms."],
                ["6. Updates to Terms", "These Terms may be updated periodically. Continued use after updates means you accept the revised version."],
                ["7. Contact", "For questions or concerns, contact us at support@visitrak.app."],
              ].map(([title, content], idx) => (
                <View key={idx}>
                  <Text
                    className="font-semibold mt-2 mb-1"
                    style={{ fontSize: sizes.sectionTitleSize }}
                  >
                    {title}
                  </Text>
                  <Text
                    className="text-gray-800 mb-2"
                    style={{
                      fontSize: sizes.contentTextSize,
                      lineHeight: sizes.contentTextSize * 1.5,
                    }}
                  >
                    {content}
                  </Text>
                </View>
              ))}

              <Text
                className="text-center text-gray-500 mt-4"
                style={{ fontSize: sizes.contentTextSize - 2 }}
              >
                © 2025 VisiTrak. All rights reserved.
              </Text>
            </ScrollView>

            <Pressable
              onPress={() => setShowTerms(false)}
              className="bg-indigo-600 rounded-xl mt-4"
              style={{ paddingVertical: sizes.buttonPaddingVertical }}
            >
              <Text
                className="text-center text-white font-medium"
                style={{ fontSize: sizes.contentTextSize }}
              >
                I Understand - Close Terms
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ================= Privacy Modal (same scaling) ================= */}
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
              padding: sizes.modalPadding,
              maxHeight: modalMaxHeight,
              marginHorizontal: isTablet ? width * 0.1 : 0,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                className="text-center font-bold mb-2"
                style={{ fontSize: sizes.titleSize }}
              >
                VisiTrak – Privacy Policy
              </Text>

              <Text
                className="text-gray-700 mb-3 text-center"
                style={{ fontSize: sizes.contentTextSize - 2 }}
              >
                Last Updated: October 25, 2025
              </Text>

              <Text
                className="text-gray-800 mb-3"
                style={{
                  fontSize: sizes.contentTextSize,
                  lineHeight: sizes.contentTextSize * 1.5,
                }}
              >
                This Privacy Policy explains how VisiTrak collects, uses, and
                protects visitor information. By using the app, you agree to the
                practices described below.
              </Text>

              {/* Reuse same section style */}
              {[
                ["1. Information We Collect", "VisiTrak records basic visitor details such as name, contact number, purpose of visit, and time of entry and exit. All data is collected by authorized personnel."],
                ["2. Data Usage", "The collected data is used only for monitoring visitor traffic, maintaining security, and generating authorized reports. It is not shared or sold to any third party."],
                ["3. Data Storage and Security", "All personal information is stored securely and accessed only by authorized personnel. Appropriate technical and organizational measures are applied to protect against unauthorized access."],
                ["4. Data Sharing", "VisiTrak does not share or sell personal data. Information may only be shared if required by law or authorized agencies."],
                ["5. Data Retention", "Visitor records are retained only as long as necessary or as required by policy, after which they are securely deleted."],
                ["6. User Rights", "Visitors may request access to or correction of their data through the managing organization."],
                ["7. Policy Updates", "This Privacy Policy may be updated periodically. Continued use of the app means you accept the revised version."],
                ["8. Contact Us", "For privacy concerns, contact privacy@visitrak.app."],
              ].map(([title, content], idx) => (
                <View key={idx}>
                  <Text
                    className="font-semibold mt-2 mb-1"
                    style={{ fontSize: sizes.sectionTitleSize }}
                  >
                    {title}
                  </Text>
                  <Text
                    className="text-gray-800 mb-2"
                    style={{
                      fontSize: sizes.contentTextSize,
                      lineHeight: sizes.contentTextSize * 1.5,
                    }}
                  >
                    {content}
                  </Text>
                </View>
              ))}

              <Text
                className="text-center text-gray-500 mt-4"
                style={{ fontSize: sizes.contentTextSize - 2 }}
              >
                © 2025 VisiTrak. All rights reserved.
              </Text>
            </ScrollView>

            <Pressable
              onPress={() => setShowPrivacy(false)}
              className="bg-emerald-600 rounded-xl mt-4"
              style={{ paddingVertical: sizes.buttonPaddingVertical }}
            >
              <Text
                className="text-center text-white font-medium"
                style={{ fontSize: sizes.contentTextSize }}
              >
                I Understand - Close Privacy Policy
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
 