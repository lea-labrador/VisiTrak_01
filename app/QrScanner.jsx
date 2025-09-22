import { View, Text, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";

export default function QrScanner({ onScanned, keyCode, setKeyCode }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState("back");

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
    <View className="bg-white p-6 rounded-2xl items-center shadow mb-6 w-full">
      <Text className="text-blue-800 font-semibold mb-4">Scan QR Code</Text>

      {/* Live Camera */}
      <View className="w-40 h-40 rounded-xl overflow-hidden mb-4 relative">
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
              className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
            >
              <MaterialIcons name="flip-camera-android" size={20} color="white" />
            </Pressable>
          </>
        ) : (
          <View className="flex-1 items-center justify-center bg-blue-200">
            <Text className="text-gray-600">Camera not allowed</Text>
            <Pressable
              onPress={requestPermission}
              className="bg-blue-600 px-4 py-2 rounded-xl mt-2"
            >
              <Text className="text-white font-bold">Grant</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Text className="text-gray-500 mb-4">Align QR code inside the box</Text>
      <Text className="text-gray-400">or</Text>

      {/* Manual Input */}
      <View className="mt-4 w-full">
        <TextInput
          placeholder="Enter Your Key Code"
          value={keyCode}
          onChangeText={setKeyCode}
          placeholderTextColor="#9CA3AF"
          className="w-full bg-gray-100 px-4 py-3 rounded-xl mb-4"
        />
        <Pressable
          className="bg-blue-600 py-3 rounded-xl items-center"
          onPress={() => {
            if (keyCode.trim() === "") {
              alert("Please enter a key code first!");
            } else {
              onScanned(keyCode);
            }
          }}
        >
          <Text className="text-white font-semibold">SUBMIT KEY</Text>
        </Pressable>
      </View>
    </View>
  );
}
