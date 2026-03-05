import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors, FontSize, Radius } from "../constants/theme";

const { width } = Dimensions.get("window");

// Light-mode constants — auth screens always render in light mode
const LIGHT = {
  bg: Colors.backgroundLight,
  text: Colors.slate900,
  textMuted: Colors.slate500,
};

export default function SplashScreen() {
  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const footerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence: logo pops in → tagline fades → progress animates → navigate
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]),
      Animated.timing(taglineFade, { toValue: 1, duration: 400, delay: 100, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(progress, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(footerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start(() => {
      // Navigate to login after loading completes
      setTimeout(() => router.replace("/(auth)/login"), 300);
    });
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const progressLabel = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: ["0%", "30%", "100%"],
  });

  return (
    <View style={[styles.container, { backgroundColor: LIGHT.bg }]}>
      {/* Decorative blobs */}
      <View style={[styles.blobTopRight, { backgroundColor: `${Colors.primary}0d` }]} />
      <View style={[styles.blobBottomLeft, { backgroundColor: `${Colors.primary}0d` }]} />

      {/* Centre content */}
      <Animated.View style={[styles.centre, { opacity: fadeIn }]}>

        {/* Logo group */}
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
          {/* Glow halo (light mode only) */}
          <View style={styles.glow} />

          {/* Main icon tile — rotated 3° */}
          <View style={styles.iconTile}>
            <MaterialIcons name="airport-shuttle" size={64} color={Colors.white} />

            {/* Badge floater */}
            <View style={[styles.badge, { backgroundColor: Colors.white }]}>
              <MaterialIcons name="payments" size={22} color={Colors.primary} />
            </View>
          </View>
        </Animated.View>

        {/* App name */}
        <Text style={[styles.appName, { color: LIGHT.text }]}>PocketLedger</Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { color: LIGHT.textMuted, opacity: taglineFade }]}>
          Your premium Filipino-geared{"\n"}budgeting companion
        </Animated.Text>

        {/* Progress bar section */}
        <Animated.View style={[styles.progressSection, { opacity: taglineFade }]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>INITIALISING</Text>
            <Animated.Text style={[styles.progressPct, { color: LIGHT.textMuted }]}>
              {/* static 30% label matching HTML reference */}
              30%
            </Animated.Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: Colors.slate200 }]}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: footerFade }]}>
        <MaterialIcons name="location-on" size={14} color={Colors.slate400} />
        <Text style={[styles.footerText, { color: LIGHT.textMuted }]}>MABUHAY!</Text>
        <View style={[styles.footerBar, { backgroundColor: `${Colors.primary}4d` }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Blobs
  blobTopRight: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: "-10%",
    right: "-10%",
  },
  blobBottomLeft: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: "-5%",
    left: "-10%",
  },

  // Centre
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    width: "100%",
  },

  // Logo
  logoWrap: {
    marginBottom: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${Colors.primary}1a`,
  },
  iconTile: {
    width: 128,
    height: 128,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "3deg" }],
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  badge: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-12deg" }],
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  // Text
  appName: {
    fontSize: 38,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 10,
  },
  tagline: {
    fontSize: FontSize.base,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 260,
  },

  // Progress
  progressSection: {
    width: 240,
    marginTop: 64,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  progressLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  progressPct: {
    fontSize: FontSize.xs,
    fontWeight: "500",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },

  // Footer
  footer: {
    paddingBottom: 48,
    alignItems: "center",
    gap: 6,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  footerBar: {
    width: 32,
    height: 4,
    borderRadius: Radius.full,
    marginTop: 2,
  },
});
