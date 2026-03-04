import { View, Text, TextInput, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
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
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon as any} size={22} color={iconColor} />
        </View>
        <View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.sub}>{subLabel}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.peso}>₱</Text>
        <TextInput
          style={styles.amountInput}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          textAlign="right"
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
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.slate800,
  },
  sub: {
    fontSize: FontSize.sm,
    color: Colors.slate400,
    marginTop: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  peso: {
    fontSize: FontSize.base,
    color: Colors.slate500,
    marginRight: 4,
  },
  amountInput: {
    fontSize: FontSize.base,
    color: Colors.slate800,
    minWidth: 80,
    textAlign: "right",
  },
});
