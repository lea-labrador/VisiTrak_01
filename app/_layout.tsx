import { Stack } from "expo-router";
import "@/global.css"

export default function RootLayout() {
  return <Stack>  
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
}
