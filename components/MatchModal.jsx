import { View, Text, Modal, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Pressable from "./SystemPressable";

export default function MatchModal({ visible, onClose }) {
  const navigation = useNavigation();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-md items-center">
          {/* Illustration */}
          <Image
            source={{
              uri: "https://img.icons8.com/color/96/survey.png", // placeholder
            }}
            className="w-20 h-20 mb-4"
            resizeMode="contain"
          />

          {/* Success text */}
          <Text className="text-blue-700 font-semibold text-lg mb-6">
            Successfully Matched!
          </Text>

          {/* Buttons */}
          <Pressable
            className="bg-blue-800 py-3 rounded-xl w-full items-center mb-3"
            onPress={() => {
              onClose();
              navigation.navigate("FeedbackForm");
            }}
          >
            <Text className="text-white font-semibold text-base">
              CHECK OUT & SURVEY
            </Text>
          </Pressable>

          <Pressable
            className="border border-blue-800 py-3 rounded-xl w-full items-center"
            onPress={() => {
              onClose();
              navigation.navigate("ThankYouScreen");
            }}
          >
            <Text className="text-blue-800 font-semibold text-base">
              QUICK CHECK OUT (SKIP SURVEY)
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
