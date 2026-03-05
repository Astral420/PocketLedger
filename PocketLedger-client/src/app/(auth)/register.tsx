import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, FontSize, Radius } from "../constants/theme";

// Light-mode constants — auth screens always render in light mode
const LIGHT = {
  bg: Colors.backgroundLight,
  card: Colors.white,
  border: Colors.slate200,
  text: Colors.slate900,
  textMuted: Colors.slate500,
  input: Colors.slate100,
};

export default function RegisterScreen() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!termsAccepted) e.terms = "You must accept the Terms of Service";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    Alert.alert("Success!", "Account created. Welcome to PocketLedger 🎉", [
      { text: "Continue", onPress: () => router.replace("/(tabs)") },
    ]);
  };

  const borderColor = (field: string) => {
    if (errors[field]) return Colors.red500;
    if (focusedField === field) return Colors.primary;
    return LIGHT.border;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: LIGHT.bg }]}>
      {/* Decorative blobs */}
      <View style={[styles.blobTopRight, { backgroundColor: `${Colors.primary}20` }]} />
      <View style={[styles.blobBottomLeft, { backgroundColor: `${Colors.primary}10` }]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Card ── */}
          <View style={[styles.card, { backgroundColor: LIGHT.card, borderColor: LIGHT.border }]}>

            {/* ── Header ── */}
            <View style={styles.headerSection}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="directions-bus" size={30} color={Colors.primary} />
              </View>
              <Text style={[styles.appName, { color: LIGHT.text }]}>PocketLedger</Text>
              <Text style={[styles.subTitle, { color: LIGHT.textMuted }]}>
                Simulan ang iyong pag-bubudget
              </Text>
            </View>

            {/* ── Form ── */}
            <View style={styles.form}>

              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: LIGHT.text }]}>Full Name</Text>
                <View style={[styles.inputRow, { backgroundColor: LIGHT.input, borderColor: borderColor("name") }]}>
                  <MaterialIcons name="person" size={18} color={Colors.slate400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: LIGHT.text }]}
                    placeholder="Juan Dela Cruz"
                    placeholderTextColor={Colors.slate400}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: LIGHT.text }]}>Email Address</Text>
                <View style={[styles.inputRow, { backgroundColor: LIGHT.input, borderColor: borderColor("email") }]}>
                  <MaterialIcons name="mail" size={18} color={Colors.slate400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: LIGHT.text }]}
                    placeholder="juan@email.com"
                    placeholderTextColor={Colors.slate400}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: LIGHT.text }]}>Password</Text>
                <View style={[styles.inputRow, { backgroundColor: LIGHT.input, borderColor: borderColor("password") }]}>
                  <MaterialIcons name="lock" size={18} color={Colors.slate400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: LIGHT.text }]}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.slate400}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                    <MaterialIcons
                      name={showPassword ? "visibility-off" : "visibility"}
                      size={18}
                      color={Colors.slate400}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Terms checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setTermsAccepted((v) => !v)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  {
                    backgroundColor: termsAccepted ? Colors.primary : "transparent",
                    borderColor: errors.terms ? Colors.red500 : termsAccepted ? Colors.primary : LIGHT.border,
                  },
                ]}>
                  {termsAccepted && <MaterialIcons name="check" size={13} color={Colors.white} />}
                </View>
                <Text style={[styles.termsText, { color: LIGHT.textMuted }]}>
                  Sumasang-ayon ako sa{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {" "}at{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>.
                </Text>
              </TouchableOpacity>
              {errors.terms && <Text style={[styles.errorText, { marginTop: -4 }]}>{errors.terms}</Text>}

              {/* Register button */}
              <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.85}>
                <Text style={styles.registerBtnText}>Register Now</Text>
              </TouchableOpacity>
            </View>

            {/* ── Footer divider ── */}
            <View style={styles.footerSection}>
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: LIGHT.border }]} />
                <Text style={[styles.dividerLabel, { color: LIGHT.textMuted, backgroundColor: LIGHT.card }]}>
                  May account na?
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: LIGHT.border }]} />
              </View>

              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.loginLink}>Mag-Login Dito</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* ── Gawang Pinoy footer ── */}
          <View style={styles.pinoyFooter}>
            <Text style={[styles.pinoyText, { color: LIGHT.textMuted }]}>Gawang Pinoy</Text>
            <MaterialIcons name="favorite" size={10} color={Colors.slate400} />
            <Text style={[styles.pinoyText, { color: LIGHT.textMuted }]}>2024 PocketLedger</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Blobs
  blobTopRight: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: "-10%",
    right: "-10%",
  },
  blobBottomLeft: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: "-10%",
    left: "-10%",
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: "center",
  },

  // Card
  card: {
    borderRadius: Radius.lg * 2,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  // Header
  headerSection: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}1a`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: FontSize["2xl"],
    fontWeight: "700",
    marginBottom: 4,
  },
  subTitle: {
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },

  // Form
  form: {
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 16,
  },
  fieldGroup: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: "500" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: FontSize.base },
  eyeBtn: { padding: 4 },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.red500,
    fontWeight: "500",
    marginTop: 2,
  },

  // Terms
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  termsText: { fontSize: FontSize.xs, flex: 1, lineHeight: 18 },
  termsLink: { color: Colors.primary, fontWeight: "600" },

  // Register button
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginTop: 8,
  },
  registerBtnText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "700",
  },

  // Footer divider
  footerSection: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: "center",
    gap: 16,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: {
    fontSize: FontSize.xs,
    paddingHorizontal: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: FontSize.base,
    fontWeight: "600",
  },

  // Gawang Pinoy
  pinoyFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 20,
    paddingBottom: 8,
  },
  pinoyText: { fontSize: 11 },
});
