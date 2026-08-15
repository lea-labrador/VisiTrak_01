import { Text, TouchableOpacity } from "react-native";

export default function ActionButton({ label, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      touchSoundDisabled={false}
      className="w-40 py-3 rounded-xl border-2 border-orange-400 bg-white/10 items-center"
    >
      <Text className="text-white font-bold text-lg">{label}</Text>
    </TouchableOpacity>
  );
}
