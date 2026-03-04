import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../contexts/ThemeContext";
import { Colors, FontSize, Radius } from "../constants/theme";

type Props = {
  icon: string;
  label: string;
  date: string;
  amount: string;
  isPositive: boolean;
};

export function TransactionItem({ icon, label, date, amount, isPositive }: Props) {
  const { theme } = useThemeContext();

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: theme.input }]}>
        <MaterialIcons name={icon as any} size={20} color={theme.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.date, { color: theme.textMuted }]}>{date}</Text>
      </View>
      <Text style={[styles.amount, { color: isPositive ? Colors.emerald500 : Colors.red500 }]}>
        {isPositive ? "+₱" : "-₱"}{amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: FontSize.base, fontWeight: "500" },
  date: { fontSize: FontSize.sm, marginTop: 2 },
  amount: { fontSize: FontSize.base, fontWeight: "600" },
});
