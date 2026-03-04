import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "../contexts/ThemeContext";
import { Colors, FontSize, Radius } from "../constants/theme";

// ─── Static data ─────────────────────────────────────────────────────────────

const LINES = [
  { id: "lrt1", label: "LRT-1", color: "Green" },
  { id: "lrt2", label: "LRT-2", color: "Blue" },
  { id: "mrt3", label: "MRT-3", color: "Yellow" },
  { id: "mrt7", label: "MRT-7", color: "Red" },
];

const LRT1_STATIONS = [
  "Baclaran", "EDSA", "Libertad", "Gil Puyat", "Vito Cruz",
  "Quirino", "Pedro Gil", "UN Avenue", "Central Terminal", "Carriedo",
  "Doroteo Jose", "Bambang", "Tayuman", "Blumentritt", "Abad Santos",
  "R. Papa", "5th Avenue", "Monumento", "Balintawak", "Fernando Poe Jr.",
];

const P2P_ROUTES = [
  { id: "p1", label: "Alabang → Pasay", fare: "₱90.00" },
  { id: "p2", label: "Fairview → Pasay", fare: "₱120.00" },
  { id: "p3", label: "Antipolo → Cubao", fare: "₱80.00" },
];

// ─── Custom Station Picker ────────────────────────────────────────────────────

type StationPickerProps = {
  label: string;
  value: string;
  onSelect: (v: string) => void;
  stations: string[];
  exclude?: string;
};

function StationPicker({ label, value, onSelect, stations, exclude }: StationPickerProps) {
  const { theme } = useThemeContext();
  const [visible, setVisible] = useState(false);
  const filtered = stations.filter((s) => s !== exclude);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Text style={[pStyles.label, { color: theme.textMuted }]}>{label}</Text>
        <TouchableOpacity
          style={[pStyles.trigger, { backgroundColor: theme.input }]}
          onPress={() => setVisible(true)}
        >
          <Text style={[pStyles.triggerText, !value && { color: Colors.slate400 }, { color: value ? theme.text : Colors.slate400 }]}>
            {value || "Select Station"}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.slate400} />
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={pStyles.overlay} activeOpacity={1} onPress={() => setVisible(false)} />
        <View style={[pStyles.sheet, { backgroundColor: theme.card }]}>
          <View style={[pStyles.sheetHandle, { backgroundColor: theme.border }]} />
          <Text style={[pStyles.sheetTitle, { color: theme.text }]}>{label}</Text>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  pStyles.stationRow,
                  { borderBottomColor: theme.border },
                  item === value && { backgroundColor: `${Colors.primary}10` },
                ]}
                onPress={() => { onSelect(item); setVisible(false); }}
              >
                <Text style={[pStyles.stationText, { color: theme.text }, item === value && { color: Colors.primary, fontWeight: "600" }]}>
                  {item}
                </Text>
                {item === value && <MaterialIcons name="check" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const pStyles = StyleSheet.create({
  label: { fontSize: FontSize.xs, fontWeight: "700", letterSpacing: 0.6, marginBottom: 6 },
  trigger: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10 },
  triggerText: { fontSize: FontSize.base, fontWeight: "500" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: Radius.lg * 2, borderTopRightRadius: Radius.lg * 2, paddingHorizontal: 16, paddingBottom: Platform.OS === "ios" ? 40 : 24, maxHeight: "60%" },
  sheetHandle: { width: 40, height: 4, borderRadius: Radius.full, alignSelf: "center", marginVertical: 12 },
  sheetTitle: { fontSize: FontSize.md, fontWeight: "700", marginBottom: 12 },
  stationRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: 1 },
  stationText: { fontSize: FontSize.base },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function LogsScreen() {
  const { theme, isDark } = useThemeContext();
  const [selectedLine, setSelectedLine] = useState("lrt1");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [discount, setDiscount] = useState(false);
  const [manualAmount, setManualAmount] = useState("");

  const handleOriginSelect = (s: string) => { setOrigin(s); if (destination === s) setDestination(""); };
  const handleDestinationSelect = (s: string) => { setDestination(s); if (origin === s) setOrigin(""); };

  const originIdx = LRT1_STATIONS.indexOf(origin);
  const destIdx = LRT1_STATIONS.indexOf(destination);
  const stops = originIdx >= 0 && destIdx >= 0 ? Math.abs(destIdx - originIdx) : 0;
  const rawFare = stops > 0 ? 15 + stops * 2 : 0;
  const estimatedFare = discount ? rawFare * 0.5 : rawFare;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Biyahe Logger</Text>
        <TouchableOpacity style={styles.historyBtn}>
          <MaterialIcons name="history" size={22} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Map / Gradient ── */}
        <View style={styles.mapWrapper}>
          <LinearGradient colors={[Colors.primary, "#0d5cb5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mapGradient}>
            <MaterialIcons name="map" size={48} color="rgba(255,255,255,0.3)" />
          </LinearGradient>
          <View style={[styles.todayBadge, { backgroundColor: theme.card }]}>
            <MaterialIcons name="directions-bus" size={14} color={Colors.primary} />
            <Text style={[styles.todayBadgeText, { color: theme.textMuted }]}>Today's total: </Text>
            <Text style={[styles.todayBadgeAmount, { color: theme.text }]}>₱215.00</Text>
          </View>
        </View>

        {/* ── LRT / MRT Line Selector ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>SELECT LINE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lineScroll}>
            {LINES.map((line) => (
              <TouchableOpacity
                key={line.id}
                style={[
                  styles.lineCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  selectedLine === line.id && { borderColor: Colors.primary, backgroundColor: `${Colors.primary}15` },
                ]}
                onPress={() => setSelectedLine(line.id)}
              >
                <Text style={[styles.lineLabel, { color: theme.text }, selectedLine === line.id && { color: Colors.primary }]}>
                  {line.label}
                </Text>
                <Text style={[styles.lineColor, { color: theme.textMuted }, selectedLine === line.id && { color: Colors.primary }]}>
                  {line.color}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Unified Card: Route + Discount + Fare ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>ROUTE</Text>
          <View style={[styles.unifiedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>

            {/* Route pickers */}
            <View style={styles.routeInner}>
              <View style={styles.routeViz}>
                <MaterialIcons name="radio-button-checked" size={16} color={Colors.primary} />
                <View style={[styles.routeLine, { backgroundColor: theme.border }]} />
                <MaterialIcons name="location-on" size={16} color={Colors.slate400} />
              </View>
              <View style={styles.routePickers}>
                <StationPicker label="ORIGIN STATION" value={origin} onSelect={handleOriginSelect} stations={LRT1_STATIONS} exclude={destination} />
                <View style={[styles.pickerDivider, { backgroundColor: theme.border }]} />
                <StationPicker label="DESTINATION STATION" value={destination} onSelect={handleDestinationSelect} stations={LRT1_STATIONS} exclude={origin} />
              </View>
            </View>

            <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

            {/* Discount toggle */}
            <View style={styles.discountRow}>
              <View style={styles.discountLeft}>
                <MaterialIcons name="percent" size={18} color={theme.textMuted} />
                <Text style={[styles.discountLabel, { color: theme.text }]}>Apply 50% Discount</Text>
              </View>
              <Switch
                value={discount}
                onValueChange={setDiscount}
                trackColor={{ false: Colors.slate200, true: Colors.primary }}
                thumbColor={discount ? Colors.white : Colors.slate400}
              />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

            {/* Estimated fare */}
            <View style={styles.fareRow}>
              <View>
                <Text style={[styles.fareLabel, { color: theme.textMuted }]}>ESTIMATED FARE</Text>
                <Text style={estimatedFare > 0 ? styles.fareAmount : [styles.fareAmountEmpty, { color: isDark ? Colors.slate500 : Colors.slate300 }]}>
                  {estimatedFare > 0 ? `₱${estimatedFare.toFixed(2)}` : "₱ 0.00"}
                </Text>
              </View>
              <TouchableOpacity style={[styles.logBtn, estimatedFare === 0 && styles.logBtnDisabled]} disabled={estimatedFare === 0}>
                <Text style={styles.logBtnText}>Log Fare</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        {/* ── OR Divider ── */}
        <View style={styles.orDivider}>
          <View style={[styles.orLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.orText, { color: theme.textMuted }]}>or log manually</Text>
          <View style={[styles.orLine, { backgroundColor: theme.border }]} />
        </View>

        {/* ── Manual Entry ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>MANUAL ENTRY</Text>
          <View style={[styles.manualCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.manualPeso, { color: theme.textMuted }]}>₱</Text>
            <TextInput
              style={[styles.manualInput, { color: theme.text }]}
              value={manualAmount}
              onChangeText={setManualAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={Colors.slate400}
            />
            <TouchableOpacity style={[styles.logBtn, !manualAmount && styles.logBtnDisabled]} disabled={!manualAmount}>
              <Text style={styles.logBtnText}>Log</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── P2P Bus Routes ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>P2P BUS ROUTES</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
          </View>
          {P2P_ROUTES.map((route) => (
            <TouchableOpacity key={route.id} style={[styles.p2pCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.p2pIcon}>
                <MaterialIcons name="directions-bus" size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.p2pLabel, { color: theme.text }]}>{route.label}</Text>
              <View style={styles.p2pRight}>
                <Text style={[styles.p2pFare, { color: theme.text }]}>{route.fare}</Text>
                <TouchableOpacity style={styles.p2pLogBtn}>
                  <Text style={styles.p2pLogText}>Log</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: "700" },
  historyBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 96 },

  mapWrapper: { marginHorizontal: 16, borderRadius: Radius.lg, overflow: "hidden", height: 140, marginBottom: 4 },
  mapGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  todayBadge: {
    position: "absolute", bottom: 12, left: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  todayBadgeText: { fontSize: FontSize.sm },
  todayBadgeAmount: { fontSize: FontSize.sm, fontWeight: "700" },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: "700", letterSpacing: 0.8, marginBottom: 10 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  viewAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600" },

  lineScroll: { gap: 10, paddingRight: 16 },
  lineCard: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, alignItems: "center", minWidth: 80 },
  lineLabel: { fontSize: FontSize.sm, fontWeight: "700" },
  lineColor: { fontSize: FontSize.xs, marginTop: 2 },

  unifiedCard: { borderRadius: Radius.lg, borderWidth: 1, overflow: "hidden" },
  routeInner: { flexDirection: "row", padding: 16, gap: 14, alignItems: "stretch" },
  routeViz: { alignItems: "center", paddingTop: 28, paddingBottom: 4 },
  routeLine: { width: 2, flex: 1, marginVertical: 6, minHeight: 28 },
  routePickers: { flex: 1 },
  pickerDivider: { height: 1, marginVertical: 14 },
  cardDivider: { height: 1 },

  discountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  discountLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  discountLabel: { fontSize: FontSize.base, fontWeight: "500" },

  fareRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  fareLabel: { fontSize: FontSize.xs, fontWeight: "700", letterSpacing: 0.6, marginBottom: 4 },
  fareAmount: { fontSize: FontSize["2xl"], fontWeight: "700", color: Colors.primary },
  fareAmountEmpty: { fontSize: FontSize["2xl"], fontWeight: "700" },
  logBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  logBtnDisabled: { backgroundColor: Colors.slate300 },
  logBtnText: { color: Colors.white, fontWeight: "700", fontSize: FontSize.base },

  orDivider: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 24, gap: 12 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: FontSize.sm },

  manualCard: { flexDirection: "row", alignItems: "center", borderRadius: Radius.lg, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  manualPeso: { fontSize: FontSize.xl, fontWeight: "600" },
  manualInput: { flex: 1, fontSize: FontSize.xl, fontWeight: "600" },

  p2pCard: { flexDirection: "row", alignItems: "center", borderRadius: Radius.lg, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, gap: 12 },
  p2pIcon: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: `${Colors.primary}1a`, alignItems: "center", justifyContent: "center" },
  p2pLabel: { flex: 1, fontSize: FontSize.base, fontWeight: "600" },
  p2pRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  p2pFare: { fontSize: FontSize.base, fontWeight: "700" },
  p2pLogBtn: { backgroundColor: `${Colors.primary}1a`, paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.md },
  p2pLogText: { fontSize: FontSize.sm, fontWeight: "700", color: Colors.primary },
});
