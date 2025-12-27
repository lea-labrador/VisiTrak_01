import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// 🔹 SCALE LOGIC
const scale = Math.min(Math.max(width / 400, 0.85), 1.6);
const isPhone = width < 600;

// 🔹 RESPONSIVE SIZES
const sizes = {
  modalWidth: isPhone ? "100%" : 420 * scale,
  modalRadius: 28 * scale,
  modalPadding: 26 * scale,

  iconSize: 100 * scale,

  titleFont: 22 * scale,

  primaryBtnHeight: 56 * scale,
  primaryFont: 16 * scale,

  secondaryBtnHeight: 56 * scale,
  secondaryFont: 15 * scale,
  secondaryBorder: 3 * scale,
};

export default function SuccessModal({ visible, onClose }) {
  const router = useRouter();

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/60 items-center justify-center px-5">
        <View
          className="bg-white items-center shadow-xl"
          style={{
            width: sizes.modalWidth,
            padding: sizes.modalPadding,
            borderRadius: sizes.modalRadius,
          }}
        >
          
          <Image
            source={require("../assets/images/modalIcon.png")}
            resizeMode="contain"
            style={{
              width: sizes.iconSize,
              height: sizes.iconSize,
              marginBottom: 2 * scale,
            }}
          />

          {/* Title */}
          <Text
            className="text-indigo-500 font-extrabold mb-10 text-center"
            style={{ fontSize: sizes.titleFont }}
          >
            Successfully Matched!
          </Text>

          {/* PRIMARY BUTTON */}
          <Pressable
            onPress={() => {
              onClose();
              router.push("/FeedbackForm");
            }}
            className="bg-purple-600 w-full items-center justify-center mb-6 active:opacity-90"
            style={{
              height: sizes.primaryBtnHeight,
              borderRadius: 20,
            }}
          >
            <Text
              className="text-white font-bold tracking-widest"
              style={{ fontSize: sizes.primaryFont }}
            >
              CHECK OUT & SURVEY
            </Text>
          </Pressable>

          {/* SECONDARY BUTTON */}
          <Pressable
            onPress={() => {
              onClose();
              router.push("./");
            }}
            className="w-full items-center justify-center bg-white"
            style={{
              height: sizes.secondaryBtnHeight,
              borderRadius: 20,
              borderWidth: sizes.secondaryBorder,
              borderColor: "#1E3A8A",
            }}
          >
            <Text
              className="font-extrabold tracking-widest text-blue-900"
              style={{ fontSize: sizes.secondaryFont }}
            >
              QUICK CHECK OUT (SKIP SURVEY)
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
