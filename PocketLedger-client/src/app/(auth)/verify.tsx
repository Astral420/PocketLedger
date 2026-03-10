import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeContext } from "../contexts/ThemeContext";
import { Colors, FontSize, Radius } from "../constants/theme";

export default function VerifyScreen() {
  const { theme, isDark } = useThemeContext();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);

  const [timeLeft, setTimeLeft] = useState(119); // 1:59 remaining in seconds

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // move to next input if there's a character
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Check if backspace is pressed and current box is empty, then move backward
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // Mock verifying and then routing to login or tabs
    router.replace("/(tabs)");
  };

  const handleResend = () => {
    setTimeLeft(119); // reset to 1:59
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={[
                  styles.backBtn,
                  { backgroundColor: isDark ? Colors.slate800 : Colors.slate200 },
                ]}
                onPress={() => router.back()}
              >
                <MaterialIcons name="arrow-back-ios" size={18} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Verification
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Title & Subtitle */}
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.text }]}>
                Check Your Email
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                We've sent a 6-digit verification code to{" "}
                <Text style={{ fontWeight: "600", color: theme.text }}>
                  m***@skitrack.com
                </Text>
                . Please enter it below to access your stats.
              </Text>
            </View>

            {/* Code inputs */}
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputs.current[index] = ref; }}
                  style={[
                    styles.codeInput,
                    {
                      backgroundColor: isDark ? Colors.slate900 : Colors.white,
                      borderColor: digit
                        ? Colors.primary
                        : isDark
                        ? Colors.slate800
                        : Colors.slate200,
                      color: theme.text,
                    },
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

             {/* Timer */}
             <View style={styles.timerContainer}>
              <View style={styles.timerBlockWrap}>
                <View
                  style={[
                    styles.timerBlock,
                    { backgroundColor: isDark ? `${Colors.slate800}80` : `${Colors.slate200}80` },
                  ]}
                >
                  <Text style={[styles.timerValue, { color: theme.text }]}>
                    {minutes < 10 ? `0${minutes}` : minutes}
                  </Text>
                </View>
                <Text style={[styles.timerLabel, { color: theme.textMuted }]}>
                  Min
                </Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlockWrap}>
                <View
                  style={[
                    styles.timerBlock,
                    { backgroundColor: isDark ? `${Colors.slate800}80` : `${Colors.slate200}80` },
                  ]}
                >
                  <Text style={[styles.timerValue, { color: theme.text }]}>
                    {seconds < 10 ? `0${seconds}` : seconds}
                  </Text>
                </View>
                <Text style={[styles.timerLabel, { color: theme.textMuted }]}>
                  Sec
                </Text>
              </View>
            </View>

            <View style={styles.resendContainer}>
              <Text style={[styles.resendText, { color: theme.textMuted }]}>
                Didn't receive the code?{" "}
              </Text>
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendAction}>Resend code</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleVerify}
              >
                <Text style={styles.verifyBtnText}>Verify & Continue</Text>
              </TouchableOpacity>
              <Text style={[styles.footerText, { color: isDark ? Colors.slate600 : Colors.slate400 }]}>
                By continuing, you agree to our Terms of Service and Privacy Policy.
                Your security is our priority at PocketLedger.
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: FontSize["3xl"],
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: FontSize.base,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "90%",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 8, // mostly for standard gaps
  },
  codeInput: {
    flex: 1,
    height: 64,
    borderWidth: 2,
    borderRadius: Radius.lg,
    fontSize: FontSize["2xl"],
    fontWeight: "700",
    textAlign: "center",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  timerBlockWrap: {
    alignItems: "center",
    width: 60,
  },
  timerBlock: {
    width: "100%",
    height: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  timerValue: {
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  timerLabel: {
    fontSize: FontSize.xs,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 1,
  },
  timerColon: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.slate400,
    marginHorizontal: 16,
    marginBottom: 24, // vertically align with blocks
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    fontSize: FontSize.sm,
  },
  resendAction: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "700",
  },
  footerContainer: {
    marginTop: "auto",
    paddingVertical: 40,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  verifyBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  footerText: {
    fontSize: FontSize.xs,
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 18,
  },
});
