import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useThemeContext } from "../contexts/ThemeContext";
import { Colors, FontSize, Radius } from "../constants/theme";

const isIOS26 = Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;

type Frequency = "Weekly" | "Monthly";

type Props = {
  value?: Frequency;
  onChange?: (freq: Frequency) => void;
};

export function PillToggle({ value, onChange }: Props) {
  const { theme, isDark } = useThemeContext();
  const [internalFreq, setInternalFreq] = useState<Frequency>("Monthly");
  const freq = value ?? internalFreq;

  const handlePress = (option: Frequency) => {
    if (!value) setInternalFreq(option);
    onChange?.(option);
  };

  const content = (["Weekly", "Monthly"] as const).map((option) => (
    <TouchableOpacity
      key={option}
      style={[
        styles.option,
        freq === option && [
          styles.optionActive,
          { backgroundColor: theme.card },
        ],
      ]}
      onPress={() => handlePress(option)}
    >
      <Text
        style={[
          styles.text,
          { color: theme.textMuted },
          freq === option && { color: Colors.primary, fontWeight: "700" },
        ]}
      >
        {option}
      </Text>
    </TouchableOpacity>
  ));

  const containerStyle = [
    styles.container,
    !isIOS26 && { backgroundColor: isDark ? Colors.slate700 : Colors.slate100 },
  ];

  if (isIOS26) {
    return (
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={80}
        style={[containerStyle, { overflow: "hidden" }]}
      >
        {content}
      </BlurView>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: Radius.full,
    padding: 4,
    alignSelf: "flex-start",
  },
  option: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  optionActive: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  text: { fontSize: FontSize.sm, fontWeight: "500" },
});
