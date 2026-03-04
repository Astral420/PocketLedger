import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../contexts/ThemeContext";
import { Colors } from "../constants/theme";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

const isIOS26 = Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;

export default function TabLayout() {
  const { theme, isDark } = useThemeContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.textMuted,
        headerShown: false,
        tabBarBackground: isIOS26
          ? () => (
              <BlurView
                tint={isDark ? "dark" : "light"}
                intensity={80}
                style={StyleSheet.absoluteFill}
              />
            )
          : undefined,
        tabBarStyle: {
          backgroundColor: isIOS26 ? "transparent" : theme.card,
          borderTopColor: isIOS26 ? "transparent" : theme.border,
          position: isIOS26 ? "absolute" : undefined,
          elevation: isIOS26 ? 0 : 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "Log",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="receipt-long" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallets"
        options={{
          title: "Wallets",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-balance-wallet" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
