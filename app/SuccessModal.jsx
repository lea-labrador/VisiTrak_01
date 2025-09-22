import { View, Text, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";

export default function SuccessModal({ visible, onClose }) {
  const router = useRouter();

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="bg-white w-11/12 rounded-2xl p-6 items-center shadow-lg">
          <Text className="text-lg font-semibold text-green-600 mb-6">
            Successfully Matched!
          </Text>

          <Pressable
            className="bg-blue-600 w-full py-3 rounded-xl mb-3 items-center"
            onPress={() => {
              onClose();
              router.push("/survey");
            }}
          >
            <Text className="text-white font-semibold">CHECK OUT & SURVEY</Text>
          </Pressable>

          <Pressable
            className="bg-blue-800 w-full py-3 rounded-xl items-center"
            onPress={() => {
              onClose();
              router.push("/skip");
            }}
          >
            <Text className="text-white font-semibold">
              QUICK CHECK OUT (SKIP SURVEY)
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}