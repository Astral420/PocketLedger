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
import { router, useLocalSearchParams } from "expo-router";
import { Colors, FontSize, Radius } from "../constants/theme";
import { sendVerificationAPI, verifyEmailAPI } from "../services/api";
import { maskEmail } from "../helpers/emailMasker";

// Light-mode constants: auth screens should not follow the app theme
const LIGHT = {
  bg: Colors.backgroundLight,
  card: Colors.white,
  border: Colors.slate200,
  text: Colors.slate900,
  textMuted: Colors.slate500,
  input: Colors.white,
  inputMuted: Colors.slate200,
  surfaceMuted: Colors.slate200,
  footerText: Colors.slate400,
};

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);

  const [timeLeft, setTimeLeft] = useState(119); // 1:59 remaining in seconds
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
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

  const handleVerify = async () => {
    const fullCode = code.join("");

    if(fullCode.length < 6){
      setError("Please enter all 6 digits.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await verifyEmailAPI(fullCode);
      router.replace("/(tabs)");

    } catch (e: any) {
      setError(e.message || "Verification Failed. Please Try Again,");
    } finally {
      setLoading(false);
    }
    
  };

  const handleResend = async () => {
    try {
      setError("");
      await sendVerificationAPI();
      setTimeLeft(119); // reset to 1:59
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (e:any) {
      setError(e.message || "Failed to resend code.");
    }
    
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: LIGHT.bg }]}>
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
                  { backgroundColor: LIGHT.border },
                ]}
                onPress={() => router.back()}
              >
                <MaterialIcons name="arrow-back-ios" size={18} color={LIGHT.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: LIGHT.text }]}>
                Verification
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Title & Subtitle */}
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: LIGHT.text }]}>
                Check Your Email
              </Text>
              <Text style={[styles.subtitle, { color: LIGHT.textMuted }]}>
                We've sent a 6-digit verification code to{" "}
                <Text style={{ fontWeight: "600", color: LIGHT.text }}>
                  {maskEmail(email ?? "")}
                </Text>
                . Please enter it below to access your stats.
              </Text>
            </View>

            {!!error && (
              <View
                style={[
                  styles.apiErrorBox,
                  {
                    backgroundColor: `${Colors.red500}1a`,
                    borderColor: Colors.red500,
                  },
                ]}
              >
                <MaterialIcons
                  name="error-outline"
                  size={20}
                  color={Colors.red500}
                />
                <Text style={styles.apiErrorDisplay}>{error}</Text>
              </View>
            )}

            {/* Code inputs */}
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputs.current[index] = ref; }}
                  style={[
                    styles.codeInput,
                    {
                      backgroundColor: LIGHT.input,
                      borderColor: digit ? Colors.primary : LIGHT.inputMuted,
                      color: LIGHT.text,
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
                    { backgroundColor: `${LIGHT.surfaceMuted}80` },
                  ]}
                >
                  <Text style={[styles.timerValue, { color: LIGHT.text }]}>
                    {minutes < 10 ? `0${minutes}` : minutes}
                  </Text>
                </View>
                <Text style={[styles.timerLabel, { color: LIGHT.textMuted }]}>
                  Min
                </Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlockWrap}>
                <View
                  style={[
                    styles.timerBlock,
                    { backgroundColor: `${LIGHT.surfaceMuted}80` },
                  ]}
                >
                  <Text style={[styles.timerValue, { color: LIGHT.text }]}>
                    {seconds < 10 ? `0${seconds}` : seconds}
                  </Text>
                </View>
                <Text style={[styles.timerLabel, { color: LIGHT.textMuted }]}>
                  Sec
                </Text>
              </View>
            </View>

            <View style={styles.resendContainer}>
              <Text style={[styles.resendText, { color: LIGHT.textMuted }]}>
                Didn't receive the code?{" "}
              </Text>
              <TouchableOpacity onPress={ timeLeft > 0 ? undefined : handleResend} disabled={timeLeft > 0}>
                <Text style={[styles.resendAction, timeLeft > 0 && {opacity: 0.4}]}>Resend code</Text>
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
              <Text style={[styles.footerText, { color: LIGHT.footerText }]}>
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
  apiErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  apiErrorDisplay: {
    flex: 1,
    color: Colors.red500,
    fontSize: FontSize.sm,
    fontWeight: "500",
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
