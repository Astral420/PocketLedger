import { View, Text, TextInput, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../contexts/ThemeContext";
import { Colors, FontSize, Radius } from "../constants/theme";

type Props = {
  label: string;
  subLabel: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string;
  onChange: (v: string) => void;
};

export function CategoryCard({
  label,
  subLabel,
  icon,
  iconBg,
  iconColor,
  value,
  onChange,
}: Props) {
  const { theme } = useThemeContext();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon as any} size={22} color={iconColor} />
        </View>
        <View>
          <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
          <Text style={[styles.sub, { color: theme.textMuted }]}>{subLabel}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.peso, { color: theme.textMuted }]}>₱</Text>
        <TextInput
          style={[styles.amountInput, { color: theme.text }]}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          textAlign="right"
          placeholderTextColor={Colors.slate300}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  label: { fontSize: FontSize.base, fontWeight: "600" },
  sub: { fontSize: FontSize.sm, marginTop: 2 },
  right: { flexDirection: "row", alignItems: "center" },
  peso: { fontSize: FontSize.base, marginRight: 4 },
  amountInput: { fontSize: FontSize.base, minWidth: 80, textAlign: "right" },
});
