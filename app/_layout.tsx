import { useEffect, useRef } from "react";
import { BackHandler, Platform } from "react-native";
import { Stack, usePathname, useRouter } from "expo-router";
import "@/global.css";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { useGlobalAutoCheckout } from "../hooks/useGlobalAutoCheckout";

const useForceBackToIndex = () => {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      const currentPath = pathnameRef.current || "";
      const isIndex =
        !currentPath || currentPath === "/" || currentPath === "/index";
      if (isIndex) {
        BackHandler.exitApp();
        return true;
      }

      pathnameRef.current = "/";
      router.replace("/");
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, [router]);
};

export default function RootLayout() {
  useOfflineSync();
  useGlobalAutoCheckout();
  useForceBackToIndex();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="VisiTrakForm" options={{ headerShown: false }} />
      <Stack.Screen name="CheckInSummary" options={{ headerShown: false }} />
      <Stack.Screen name="ExitScreen" options={{ headerShown: false }} />
      <Stack.Screen name="FeedbackForm" options={{ headerShown: false }} />
      <Stack.Screen name="ThankYouScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ScanScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ScanScreenOut" options={{ headerShown: false }} />
      <Stack.Screen name="exit" options={{ headerShown: false }} />
    </Stack>
  );
}
