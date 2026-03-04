import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../contexts/ThemeContext";
import { Colors, FontSize, Radius } from "../constants/theme";

type Props = {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  hasChevron?: boolean;
  rightElement?: React.ReactNode;
  onPress?: () => void;
};

export function SettingRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  hasChevron,
  rightElement,
  onPress,
}: Props) {
  const { theme } = useThemeContext();

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: theme.border }]}
      onPress={onPress}
      activeOpacity={onPress || hasChevron ? 0.7 : 1}
      disabled={!onPress && !hasChevron}
    >
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      </View>
      <View style={styles.right}>
        {value && (
          <Text style={[styles.value, { color: theme.textMuted }]}>{value}</Text>
        )}
        {rightElement}
        {hasChevron && (
          <MaterialIcons name="chevron-right" size={18} color={Colors.slate300} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: "500",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
});
