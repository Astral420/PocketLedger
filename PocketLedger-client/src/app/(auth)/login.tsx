import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, FontSize, Radius } from "../constants/theme";

import { Portal, Snackbar } from "react-native-paper";
import GoogleLogo  from "../assets/google.svg";
import { loginAPI } from "../services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    let valid = true;

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try{
      setLoading(true);
      setError("");
      await loginAPI(email.trim(), password);
      router.replace("/(tabs)");

    } catch (e:any){
      setError(e?.message ?? "Invalid Credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoBox}>
            <MaterialIcons name="travel-explore" size={36} color={Colors.primary} />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          {/* ── Email ── */}
          <View style={styles.fieldGroup}>
            <View
              style={[
                styles.inputRow,
                emailError ? styles.inputRowError : null,
              ]}
            >
              <MaterialIcons
                name="mail"
                size={18}
                color={emailError ? Colors.red500 : Colors.slate400}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={Colors.slate300}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (emailError) setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* ── Password ── */}
          <View style={styles.fieldGroup}>
            <View
              style={[
                styles.inputRow,
                passwordError ? styles.inputRowError : null,
              ]}
            >
              <MaterialIcons
                name="lock"
                size={18}
                color={passwordError ? Colors.red500 : Colors.slate400}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.slate300}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (passwordError) setPasswordError("");
                }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeBtn}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={18}
                  color={Colors.slate400}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!email || !password) && styles.primaryButtonDisabled,
            ]}
            onPress={handleLogin} disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>
          

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google button */}
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
            <GoogleLogo/>
            <Text style={styles.secondaryButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerLink}>
            Don't have an account?{" "}
            <Text
              style={styles.footerLinkCta}
              onPress={() => router.push("/(auth)/register" as any)}
            >
              Create an account
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <Snackbar
          visible={!!error}
          onDismiss={() => setError("")}
          theme={{
            colors : {
              inverseOnSurface: "#ffffff",
            },
          }}
          duration={3000}
          style={{ backgroundColor: Colors.red500 }}
        >
          {error}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: "center",
  },

  // Logo
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    backgroundColor: `${Colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  // Heading
  title: {
    fontSize: FontSize["3xl"],
    fontWeight: "700",
    color: Colors.slate900,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.slate500,
    marginBottom: 36,
    textAlign: "center",
  },

  // Field groups
  fieldGroup: {
    width: "100%",
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    height: 52,
  },
  inputRowError: {
    borderColor: Colors.red500,
    backgroundColor: "#fff5f5",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.slate800,
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 6,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.red500,
    marginTop: 5,
    marginLeft: 4,
  },

  // Forgot password
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "500",
  },

  // Primary button
  primaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "700",
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.slate200,
  },
  dividerText: {
    fontSize: FontSize.sm,
    color: Colors.slate400,
  },

  // Secondary (Google) button
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    height: 52,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: Radius.md,
    marginBottom: 32,
  },
  secondaryButtonText: {
    color: Colors.slate700,
    fontSize: FontSize.base,
    fontWeight: "600",
  },

  // Footer
  footerLink: {
    fontSize: FontSize.sm,
    color: Colors.slate500,
    textAlign: "center",
  },
  footerLinkCta: {
    color: Colors.primary,
    fontWeight: "700",
  },
});
