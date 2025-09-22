import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons, Entypo } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { Line } from "react-native-svg";
import { Link} from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaFrameContext, SafeAreaView } from "react-native-safe-area-context";

// Reusable row
const InfoRow = ({ label, value }) => (
  <View className="flex-row justify-between px-4 py-1">
    <Text className="text-sm text-gray-700 font-medium">{label}</Text>
    <Text className="text-sm text-gray-900 font-semibold">{value}</Text>
  </View>
);

// Card container
const Card = ({ children }) => (
  <View className="bg-white w-11/12 rounded-2xl shadow-lg p-4 border border-orange-500 ">
    {children}
  </View>
);

export default function CheckInSummary() {
  const { name, office, purpose, contactNumber, email, checkInTime, exitKey } =
    useLocalSearchParams();

  return (
    <LinearGradient
     colors={["#1A237E", "#3949AB", "#5C6BC0"]}
    className="flex-1">

    <SafeAreaView>
    <View className="flex-row items-center mt-5">
        <Text className="flex-1 text-3xl font-semibold text-white text-center">
          VisiTrak
        </Text>
        <Link href="/" asChild>
          <Pressable className="w-11 bg-white/20 rounded-lg p-2 justify-center items-center border-2 border-gray-500 shadow-md">
            <Entypo name="chevron-right" size={24} color="white" />
          </Pressable>
        </Link>
        <View className="w-5" />
      </View>
      </SafeAreaView>

    <View className="flex-1 bg-gradient-to-b from-blue-900 to-blue-600 items-center justify-center px-4">

      {/* Card */}
      <Card>
        {/* Name */}
        <Text className="text-center text-3xl font-bold mb-3">{name}</Text>

        {/* QR Code */}
        <View className="self-center mb-2">
          <QRCode value={exitKey || "VISIT"} size={120} />
        </View>

        {/* Exit Key */}
        <Text className="text-center text-gray-700 font-medium mb-4">
          EXIT KEY : <Text className="font-bold">{exitKey}</Text>
        </Text>

        {/* Divider */}
        <View className="h-[1px] bg-gray-300 my-2" />

        {/* Info */}
        <InfoRow label="CHECK IN :" value={checkInTime} />
        <InfoRow label="VISITING :" value={office} />

        {/* Status */}
        <View className="bg-green-100 rounded-lg mt-4 py-2 flex-row items-center justify-center">
          <Ionicons name="checkmark-circle" size={18} color="green" />
          <Text className="ml-2 text-green-700 font-semibold">
            Successfully Checked In
          </Text>
        </View>
      </Card>

      {/* Footer */}
      <Text className="text-center text-white mt-6 leading-6 text-md">
        Please keep the QR Code or exit key visible during check out.{"\n"}
        Have a great visit!
      </Text>

      <Text className="absolute bottom-4 text-gray-300 text-xs">
        © 2025 LMT. All rights reserved.
      </Text>
    </View>
    </LinearGradient>
  );
}
