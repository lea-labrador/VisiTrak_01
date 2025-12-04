import { View, Text, Pressable, TextInput, useWindowDimensions } from "react-native";
import { useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";

export default function QrScanner({ onScanned, keyCode, setKeyCode }) {
  const { width } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState("back");
  const [isFocused, setIsFocused] = useState(false);

  // 📏 Responsive scaling based on screen width
  const isLarge = width > 800;
  const scale = isLarge ? 1.4 : width > 600 ? 1.2 : 1;

  // ✅ Handle QR scan
  const handleBarcodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setKeyCode(data);
      onScanned(data);

      // Reset for multiple scans
      setTimeout(() => setScanned(false), 2000);
    }
  };

  // ✅ Toggle camera (front/back)
  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  return (
    <View
      className="bg-white/10 backdrop-blur-lg border border-indigo-300 rounded-2xl shadow-lg items-center mb-6"
      style={{
        padding: 24 * scale,
        width: Math.min(width * 0.9, 420 * scale),
        alignSelf: "center",
      }}
    >
      {/* Title */}
      <Text
        className="text-white font-semibold mb-4 text-center"
        style={{ fontSize: 18 * scale }}
      >
        Scan QR Code
      </Text>

      {/* Live Camera */}
      <View
        className="rounded-xl overflow-hidden mb-4 relative"
        style={{
          width: 160 * scale,
          height: 160 * scale,
        }}
      >
        {permission?.granted ? (
          <>
            <CameraView
              style={{ flex: 1 }}
              facing={facing}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleBarcodeScanned}
            />

            {/* 🔄 Switch Camera Button */}
            <Pressable
              onPress={toggleCameraFacing}
              className="absolute bg-black/50 rounded-full"
              style={{
                top: 8 * scale,
                right: 8 * scale,
                padding: 6 * scale,
              }}
            >
              <MaterialIcons
                name="flip-camera-android"
                size={20 * scale}
                color="white"
              />
            </Pressable>
          </>
        ) : (
          <View className="flex-1 items-center justify-center bg-blue-200">
            <Text
              className="text-gray-600 text-center"
              style={{ fontSize: 14 * scale }}
            >
              Camera not allowed
            </Text>
            <Pressable
              onPress={requestPermission}
              className="bg-blue-600 rounded-xl mt-2"
              style={{
                paddingVertical: 8 * scale,
                paddingHorizontal: 16 * scale,
              }}
            >
              <Text
                className="text-white font-bold"
                style={{ fontSize: 14 * scale }}
              >
                Grant
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Info text */}
      <Text
        className="text-gray-200 mb-4 text-center"
        style={{ fontSize: 14 * scale }}
      >
        Align QR code inside the box
      </Text>
      {/* Or Divider */}
      <View
        className="flex-row items-center self-stretch"
        style={{ marginVertical: 12 * scale, gap: 12 * scale }}
      >
        <View className="flex-1 bg-white/20" style={{ height: 1 }} />
        <Text className="text-white/80 font-medium">OR</Text>
        <View className="flex-1 bg-white/20" style={{ height: 1 }} />
      </View>

      {/* Manual Input */}
      <View className="w-full">
        <TextInput
          placeholder="Enter Your Key Code"
          value={keyCode}
          onChangeText={setKeyCode}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#D1D5DB"
          className="bg-white/10 border rounded-xl text-white"
          style={{
            fontSize: 14 * scale,
            paddingVertical: 10 * scale,
            paddingHorizontal: 16 * scale,
            borderColor: isFocused ? "white" : "transparent",
          }}
        />

        {/* Submit Button */}
        <Pressable
          className="bg-purple-700 rounded-xl items-center mt-4"
          style={{
            paddingVertical: 12 * scale,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
          onPress={() => {
            if (keyCode.trim() === "") {
              alert("Please enter a key code first!");
            } else {
              onScanned(keyCode);
            }
          }}
        >
          <Text
            className="text-white font-semibold"
            style={{ fontSize: 15 * scale }}
          >
            SUBMIT KEY
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
