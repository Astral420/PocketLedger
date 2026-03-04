import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors, FontSize, Radius } from "../constants/theme";
import { TransactionItem } from "../components/TransactionItem";
import { useThemeContext } from "../contexts/ThemeContext";

// ─── Static data ─────────────────────────────────────────────────────────────

const QUICK_ITEMS = [
  { id: "1", label: "LRT / MRT", sub: "Commute", icon: "train" },
  { id: "2", label: "P2P Bus", sub: "Premium Point", icon: "directions-bus" },
  { id: "3", label: "Grab / Taxi", sub: "Ride Hailing", icon: "local-taxi" },
  { id: "4", label: "Snacks", sub: "Food & Drinks", icon: "fastfood" },
];

const RECENT_TRANSACTIONS = [
  { id: "t1", icon: "train", label: "LRT-1 Fare", date: "Today, 8:14 AM", amount: "35.00", isPositive: false },
  { id: "t2", icon: "restaurant", label: "Lunch – Jollibee", date: "Today, 12:02 PM", amount: "159.00", isPositive: false },
  { id: "t3", icon: "savings", label: "Salary Credit", date: "Yesterday", amount: "18,500.00", isPositive: true },
  { id: "t4", icon: "local-taxi", label: "Grab – Home", date: "Yesterday, 9:45 PM", amount: "215.00", isPositive: false },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { theme, isDark } = useThemeContext();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: theme.bg }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>PocketLedger</Text>
        <TouchableOpacity style={styles.avatarBtn}>
          <MaterialIcons name="account-circle" size={32} color={Colors.slate400} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Balance Card ── */}
        <View style={[styles.balanceSection, { backgroundColor: isDark ? Colors.primary : Colors.backgroundLight }]}>
          <Text style={[styles.balanceLabel, { color: isDark ? "rgba(255,255,255,0.75)" : Colors.slate900 }]}>Total Balance</Text>
          <Text style={[styles.balanceAmount, { color: isDark ? Colors.white : Colors.slate900 }]}>₱ 12,450.00</Text>
          <View style={[styles.badge, { backgroundColor: isDark ? "rgba(255,255,255,0.15)" : Colors.slate200 }]}>
            <MaterialIcons name="arrow-upward" size={13} color={Colors.emerald500} />
            <Text style={[styles.badgeText, { color: isDark ? Colors.white : Colors.slate900 }]}>2.4% vs last month</Text>
          </View>
        </View>

        {/* ── Quick Add ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Add</Text>
          <FlatList
            data={QUICK_ITEMS}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={styles.quickRow}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.quickCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={styles.quickIcon}>
                  <MaterialIcons name={item.icon as any} size={22} color={Colors.primary} />
                </View>
                <Text style={[styles.quickLabel, { color: theme.text }]}>{item.label}</Text>
                <Text style={[styles.quickSub, { color: theme.textMuted }]}>{item.sub}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ── Recent History ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent History</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {RECENT_TRANSACTIONS.map((tx, index) => (
              <View key={tx.id}>
                <TransactionItem
                  icon={tx.icon}
                  label={tx.label}
                  date={tx.date}
                  amount={tx.amount}
                  isPositive={tx.isPositive}
                />
                {index < RECENT_TRANSACTIONS.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: "700" },
  avatarBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 96 },

  // Balance — always solid primary blue
  balanceSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: Radius.lg,
  },
  balanceLabel: {
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  balanceAmount: {
    fontSize: FontSize["4xl"],
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: FontSize.sm, color: Colors.white, fontWeight: "500" },

  // Sections
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: "700", marginBottom: 12 },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600" },

  // Quick add
  quickRow: { gap: 12 },
  quickCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: `${Colors.primary}1a`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickLabel: { fontSize: FontSize.base, fontWeight: "600" },
  quickSub: { fontSize: FontSize.xs, marginTop: 2 },

  // Transaction card
  card: {
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  divider: { height: 1 },
});
