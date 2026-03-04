import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, FontSize, Radius } from "../constants/theme";

type Frequency = "Weekly" | "Monthly";

type Props = {
  value?: Frequency;
  onChange?: (freq: Frequency) => void;
};

export function PillToggle({ value, onChange }: Props) {
  const [internalFreq, setInternalFreq] = useState<Frequency>("Monthly");

  const freq = value ?? internalFreq;

  const handlePress = (option: Frequency) => {
    if (!value) setInternalFreq(option);
    onChange?.(option);
  };

  return (
    <View style={styles.toggleContainer}>
      {(["Weekly", "Monthly"] as const).map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.toggleOption,
            freq === option && styles.toggleActive,
          ]}
          onPress={() => handlePress(option)}
        >
          <Text
            style={[
              styles.toggleText,
              freq === option && styles.toggleTextActive,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.slate100,
    borderRadius: Radius.full,
    padding: 4,
    alignSelf: "flex-start",
  },
  toggleOption: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  toggleActive: {
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  toggleText: {
    fontSize: FontSize.sm,
    color: Colors.slate500,
    fontWeight: "500",
  },
  toggleTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
});
