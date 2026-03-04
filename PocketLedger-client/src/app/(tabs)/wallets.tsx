import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CategoryCard } from "../components/CategoryCard";
import { PillToggle } from "../components/PillToggle";
import { useThemeContext } from "../contexts/ThemeContext";
import { Colors, FontSize, Radius } from "../constants/theme";

type Frequency = "Weekly" | "Monthly";

const CATEGORIES = [
  { id: "transport", label: "Transport", sub: "Commute, Grab, Fuel", icon: "directions-bus", iconBg: "#197fe61a", iconColor: Colors.primary, default: "2000" },
  { id: "food", label: "Food", sub: "Groceries, Dining out", icon: "restaurant", iconBg: "#ffedd5", iconColor: Colors.orange600, default: "5000" },
  { id: "savings", label: "Savings", sub: "Emergency, Travel fund", icon: "savings", iconBg: "#d1fae5", iconColor: Colors.emerald500, default: "3000" },
  { id: "others", label: "Others", sub: "Miscellaneous", icon: "more-horiz", iconBg: Colors.slate100, iconColor: Colors.slate500, default: "1000" },
];

export default function BudgetSetupScreen() {
  const { theme } = useThemeContext();
  const [freq, setFreq] = useState<Frequency>("Monthly");
  const [totalBudget, setTotalBudget] = useState("18500");
  const [amounts, setAmounts] = useState<Record<string, string>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.id, c.default]))
  );

  const allocated = Object.values(amounts).reduce(
    (sum, v) => sum + (parseFloat(v.replace(/,/g, "")) || 0),
    0
  );
  const total = parseFloat(totalBudget.replace(/,/g, "")) || 0;
  const remaining = total - allocated;
  const allocationPct = total > 0 ? Math.min((allocated / total) * 100, 100) : 0;

  const handleAmountChange = (id: string, value: string) =>
    setAmounts((prev) => ({ ...prev, [id]: value }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>

        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: theme.bg }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Budget Setup</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Frequency toggle ── */}
          <View style={styles.toggleRow}>
            <PillToggle value={freq} onChange={setFreq} />
          </View>

          {/* ── Total budget input ── */}
          <View style={[styles.totalSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.totalLabel, { color: theme.textMuted }]}>
              {freq === "Monthly" ? "Monthly" : "Weekly"} Budget
            </Text>
            <View style={styles.totalInputRow}>
              <Text style={[styles.totalPeso, { color: theme.textMuted }]}>₱</Text>
              <TextInput
                style={[styles.totalInput, { color: theme.text }]}
                value={totalBudget}
                onChangeText={setTotalBudget}
                keyboardType="numeric"
                textAlign="center"
                placeholder="0"
                placeholderTextColor={Colors.slate300}
              />
            </View>

            {/* Progress bar */}
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${allocationPct}%` as any,
                    backgroundColor: allocationPct >= 100 ? Colors.red500 : Colors.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressSub, { color: theme.textMuted }]}>
                ₱{allocated.toLocaleString()} allocated
              </Text>
              <Text
                style={[
                  styles.progressSub,
                  { color: remaining < 0 ? Colors.red500 : theme.textMuted },
                ]}
              >
                {remaining >= 0
                  ? `₱${remaining.toLocaleString()} left`
                  : `-₱${Math.abs(remaining).toLocaleString()} over`}
              </Text>
            </View>
          </View>

          {/* ── Category cards ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>ALLOCATE BY CATEGORY</Text>
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                label={cat.label}
                subLabel={cat.sub}
                icon={cat.icon}
                iconBg={cat.iconBg}
                iconColor={cat.iconColor}
                value={amounts[cat.id]}
                onChange={(v) => handleAmountChange(cat.id, v)}
              />
            ))}
          </View>

          {/* ── Add custom category ── */}
          <TouchableOpacity
            style={[styles.addCategory, { borderColor: theme.border, backgroundColor: theme.card }]}
          >
            <MaterialIcons name="add-circle" size={20} color={Colors.primary} />
            <Text style={styles.addCategoryText}>Add Category</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Sticky Save button ── */}
        <View style={[styles.footer, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.saveBtn, remaining < 0 && styles.saveBtnWarning]}
            activeOpacity={0.85}
          >
            <MaterialIcons name="check-circle" size={20} color={Colors.white} />
            <Text style={styles.saveBtnText}>
              {remaining < 0 ? "Save Anyway" : "Save Budget"}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: "700" },
  scroll: { paddingBottom: 24 },
  toggleRow: { flexDirection: "row", justifyContent: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  totalSection: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  totalLabel: { fontSize: FontSize.sm, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 },
  totalInputRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  totalPeso: { fontSize: FontSize["4xl"], fontWeight: "700", lineHeight: 52 },
  totalInput: { fontSize: FontSize["4xl"], fontWeight: "700", minWidth: 160, lineHeight: 52 },
  progressBar: { width: "100%", height: 6, borderRadius: Radius.full, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: Radius.full },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  progressSub: { fontSize: FontSize.xs, fontWeight: "500" },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: "700", letterSpacing: 0.8, marginBottom: 12 },
  addCategory: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: Radius.md,
  },
  addCategoryText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: "600" },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
  },
  saveBtnWarning: { backgroundColor: Colors.orange600 },
  saveBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: "700" },
});
