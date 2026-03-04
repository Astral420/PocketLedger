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

// ─── Static data ─────────────────────────────────────────────────────────────

const QUICK_ITEMS = [
  { id: "1", label: "LRT / MRT", sub: "Commute", icon: "train" },
  { id: "2", label: "P2P Bus", sub: "Premium Point", icon: "directions-bus" },
  { id: "3", label: "Grab / Taxi", sub: "Ride Hailing", icon: "local-taxi" },
  { id: "4", label: "Snacks", sub: "Food & Drinks", icon: "fastfood" },
];

const RECENT_TRANSACTIONS = [
  {
    id: "t1",
    icon: "train",
    label: "LRT-1 Fare",
    date: "Today, 8:14 AM",
    amount: "35.00",
    isPositive: false,
  },
  {
    id: "t2",
    icon: "restaurant",
    label: "Lunch – Jollibee",
    date: "Today, 12:02 PM",
    amount: "159.00",
    isPositive: false,
  },
  {
    id: "t3",
    icon: "savings",
    label: "Salary Credit",
    date: "Yesterday",
    amount: "18,500.00",
    isPositive: true,
  },
  {
    id: "t4",
    icon: "local-taxi",
    label: "Grab – Home",
    date: "Yesterday, 9:45 PM",
    amount: "215.00",
    isPositive: false,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PocketLedger</Text>
        <TouchableOpacity style={styles.avatarBtn}>
          <MaterialIcons name="account-circle" size={32} color={Colors.slate400} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Balance Card ── */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>₱ 12,450.00</Text>
          <View style={styles.badge}>
            <MaterialIcons name="arrow-upward" size={13} color={Colors.emerald500} />
            <Text style={styles.badgeText}>2.4% vs last month</Text>
          </View>
        </View>

        {/* ── Quick Add ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <FlatList
            data={QUICK_ITEMS}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={styles.quickRow}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.quickCard}>
                <View style={styles.quickIcon}>
                  <MaterialIcons
                    name={item.icon as any}
                    size={22}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
                <Text style={styles.quickSub}>{item.sub}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ── Recent History ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent History</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
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
                  <View style={styles.divider} />
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
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundLight,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.slate900,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingBottom: 96,
  },

  // Balance
  balanceSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.backgroundLight,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: Radius.lg,
  },
  balanceLabel: {
    fontSize: FontSize.sm,
    color: Colors.slate900,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  balanceAmount: {
    fontSize: FontSize["4xl"],
    fontWeight: "700",
    color: Colors.slate900,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.slate200,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: FontSize.sm,
    color: Colors.slate900,
    fontWeight: "500",
  },

  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.slate900,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "600",
  },

  // Quick Add
  quickRow: {
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate200,
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
  quickLabel: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.slate800,
  },
  quickSub: {
    fontSize: FontSize.xs,
    color: Colors.slate400,
    marginTop: 2,
  },

  // Transaction card
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.slate100,
  },
});
