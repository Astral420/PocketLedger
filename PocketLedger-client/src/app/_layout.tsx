import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-native-paper";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function RootLayout() {
  return (
    <Provider>
      <ThemeProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
