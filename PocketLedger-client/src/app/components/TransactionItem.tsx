import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors, FontSize, Radius } from "../constants/theme";

type Props = {
  icon: string;
  label: string;
  date: string;
  amount: string;
  isPositive: boolean;
};

export function TransactionItem({
  icon,
  label,
  date,
  amount,
  isPositive,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon as any} size={20} color={Colors.slate500} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: isPositive ? Colors.emerald500 : Colors.red500 },
        ]}
      >
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
    backgroundColor: Colors.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: "500",
    color: Colors.slate800,
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.slate400,
    marginTop: 2,
  },
  amount: {
    fontSize: FontSize.base,
    fontWeight: "600",
  },
});
