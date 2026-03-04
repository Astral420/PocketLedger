import { createContext, useContext, useState, ReactNode } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

// ─── Theme values ─────────────────────────────────────────────────────────────

export type ThemeColors = {
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  input: string;
  isDark: boolean;
};

function buildTheme(dark: boolean): ThemeColors {
  return {
    isDark: dark,
    bg: dark ? Colors.backgroundDark : Colors.backgroundLight,
    card: dark ? Colors.slate800 : Colors.white,
    border: dark ? Colors.slate700 : Colors.slate200,
    text: dark ? Colors.white : Colors.slate900,
    textMuted: dark ? Colors.slate400 : Colors.slate500,
    input: dark ? "#1e293b" : Colors.slate100,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

type ThemeContextType = {
  theme: ThemeColors;
  isDark: boolean;
  toggleDark: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: buildTheme(false),
  isDark: false,
  toggleDark: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [overrideDark, setOverrideDark] = useState<boolean | null>(null);

  // Use manual override if set, otherwise follow system
  const isDark = overrideDark !== null ? overrideDark : systemScheme === "dark";
  const theme = buildTheme(isDark);

  const toggleDark = () => setOverrideDark((prev) => !(prev !== null ? prev : isDark));

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useThemeContext() {
  return useContext(ThemeContext);
}
