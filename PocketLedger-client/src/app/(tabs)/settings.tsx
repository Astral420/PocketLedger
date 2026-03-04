import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SettingRow } from "../components/SettingRow";
import { useThemeContext } from "../contexts/ThemeContext";
import { Colors, FontSize, Radius } from "../constants/theme";

// ─── Static mock user ────────────────────────────────────────────────────────

const USER = {
  name: "Juan dela Cruz",
  email: "juan@example.com",
  initials: "JD",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { isDark, toggleDark, theme } = useThemeContext();
  const [notificationsOn, setNotificationsOn] = useState(true);

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => router.replace("/(auth)/login"),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile card ── */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{USER.initials}</Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <MaterialIcons name="edit" size={13} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {USER.name}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.textMuted }]}>
              {USER.email}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.editProfileBtn,
              { borderColor: theme.border, backgroundColor: theme.bg },
            ]}
          >
            <Text style={[styles.editProfileText, { color: theme.text }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Preferences ── */}
        <Text style={[styles.groupLabel, { color: theme.textMuted }]}>
          PREFERENCES
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <SettingRow
            icon="language"
            iconBg="#197fe61a"
            iconColor={Colors.primary}
            label="Currency"
            value="PHP (₱)"
            hasChevron
            onPress={() => {}}
          />
          <SettingRow
            icon="notifications"
            iconBg="#ffedd5"
            iconColor={Colors.orange600}
            label="Notifications"
            rightElement={
              <Switch
                value={notificationsOn}
                onValueChange={setNotificationsOn}
                trackColor={{ false: Colors.slate200, true: Colors.primary }}
                thumbColor={notificationsOn ? Colors.white : Colors.slate400}
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
            }
          />
          <SettingRow
            icon="dark-mode"
            iconBg={isDark ? Colors.slate700 : Colors.slate100}
            iconColor={isDark ? Colors.white : Colors.slate500}
            label="Dark Mode"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleDark}
                trackColor={{ false: Colors.slate200, true: Colors.primary }}
                thumbColor={isDark ? Colors.white : Colors.slate400}
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
            }
          />
          <SettingRow
            icon="translate"
            iconBg="#d1fae5"
            iconColor={Colors.emerald500}
            label="Language"
            value="English"
            hasChevron
            onPress={() => {}}
          />
        </View>

        {/* ── App info ── */}
        <Text style={[styles.groupLabel, { color: theme.textMuted }]}>
          APP INFO
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <SettingRow
            icon="info"
            iconBg={isDark ? Colors.slate700 : Colors.slate100}
            iconColor={isDark ? Colors.slate300 : Colors.slate500}
            label="About PocketLedger"
            hasChevron
            onPress={() => {}}
          />
          <SettingRow
            icon="description"
            iconBg={isDark ? Colors.slate700 : Colors.slate100}
            iconColor={isDark ? Colors.slate300 : Colors.slate500}
            label="Terms & Privacy Policy"
            hasChevron
            onPress={() => {}}
          />
          <SettingRow
            icon="update"
            iconBg={isDark ? Colors.slate700 : Colors.slate100}
            iconColor={Colors.slate400}
            label="App Version"
            value="v1.0.0"
          />
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={Colors.red500} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  scroll: {
    paddingBottom: 96,
    paddingTop: 16,
  },

  // Profile card
  profileCard: {
    marginHorizontal: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrap: {
    marginBottom: 12,
    position: "relative",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.primary}1a`,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: FontSize["2xl"],
    fontWeight: "700",
    color: Colors.primary,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 14,
  },
  profileName: {
    fontSize: FontSize.md,
    fontWeight: "700",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: FontSize.sm,
  },
  editProfileBtn: {
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  editProfileText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },

  // Group
  groupLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff5f5",
  },
  logoutText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.red500,
  },
});
