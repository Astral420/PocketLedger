import { useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return {
    isDark,
    bg: isDark ? Colors.backgroundDark : Colors.backgroundLight,
    card: isDark ? Colors.slate800 : Colors.white,
    border: isDark ? Colors.slate700 : Colors.slate200,
    text: isDark ? Colors.slate100 : Colors.slate900,
    textMuted: isDark ? Colors.slate400 : Colors.slate500,
  };
}


