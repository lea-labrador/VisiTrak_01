// components/Logos.js
import { View, Image, useWindowDimensions } from "react-native";

export default function Logos() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Scale factor based on screen width
  const scale = Math.min(Math.max(width / 400, 0.8), 1.6);

  // Responsive sizes
  const sizes = {
    bisuLogo: {
      width: 40 * scale,
      height: 40 * scale,
    },
    logo02: {
      width: 70 * scale,
      height: 20 * scale,
    },
    
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: -5,
        marginBottom: 4 * scale,
      }}
    >
      <Image
        source={require("../assets/images/bisu-logo.png")}
        style={{
          width: sizes.bisuLogo.width,
          height: sizes.bisuLogo.height,
          resizeMode: "contain",
        }}
      />
      <Image
        source={require("../assets/images/logo02.png")}
        style={{
          width: sizes.logo02.width,
          height: sizes.logo02.height,
          resizeMode: "contain",
        }}
      />
    </View>
  );
}
