import { View, Text } from "react-native";
import { Button } from "@/components/ui/button"; // shadcn/ui button
import { Image } from "react-native";

export default function CenteredCard({ icon, title, subtitle, message, buttonText, onPress }) {
  return (
    <View className="flex-1 items-center justify-center px-4">
      {/* Background Circle */}
      <View className="w-72 h-72 rounded-full bg-indigo-500/10 items-center justify-center">
        {/* Icon */}
        <Image source={icon} className="w-16 h-16 mb-4" resizeMode="contain" />
        
        {/* Title */}
        <Text className="text-white text-xl font-bold tracking-wide text-center">
          {title}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text className="text-gray-200 text-sm mt-1 text-center">
            {subtitle}
          </Text>
        )}

        {/* Message */}
        {message && (
          <Text className="text-gray-300 text-base mt-4 text-center">
            {message}
          </Text>
        )}

        {/* Button */}
        <Button className="mt-6 w-32 rounded-xl bg-blue-700" onPress={onPress}>
          <Text className="text-white font-semibold">{buttonText}</Text>
        </Button>
      </View>
    </View>
  );
}
