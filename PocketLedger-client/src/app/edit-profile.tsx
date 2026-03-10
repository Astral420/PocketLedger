import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useThemeContext } from "./contexts/ThemeContext";
import { Colors, FontSize, Radius } from "./constants/theme";
import {
  getCurrentUserAPI,
  getUserInitials,
  updateCurrentUserAPI,
  uploadProfilePhotoAPI,
  type CurrentUser,
} from "./services/api";

export default function EditProfileScreen() {
  const { theme, isDark } = useThemeContext();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        setLoadingUser(true);
        const currentUser = await getCurrentUserAPI();
        if (!active) return;
        setUser(currentUser);
        setFullName(currentUser.full_name ?? "");
        setEmail(currentUser.email);
      } catch (error: any) {
        if (active) {
          Alert.alert("Edit Profile", error?.message ?? "Failed to load profile.");
        }
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    };

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Photo Access", "Please allow photo library access to upload a profile image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      setUploadingPhoto(true);
      const asset = result.assets[0];
      const updatedUser = await uploadProfilePhotoAPI({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });

      setUser(updatedUser);
    } catch (error: any) {
      Alert.alert("Upload Photo", error?.message ?? "Failed to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert("Edit Profile", "Email is required.");
      return;
    }

    if (password && password.length < 8) {
      Alert.alert("Edit Profile", "Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Edit Profile", "Passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await updateCurrentUserAPI({
        full_name: fullName.trim() || null,
        email: trimmedEmail,
        password: password || undefined,
      });

      setUser(updatedUser);
      setPassword("");
      setConfirmPassword("");
      router.back();
    } catch (error: any) {
      Alert.alert("Edit Profile", error?.message ?? "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const initials = user ? getUserInitials(user) : "..";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}> 
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.bg,
              borderBottomColor: isDark ? Colors.slate800 : Colors.slate200,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.profilePicContainer}>
            <TouchableOpacity style={styles.profilePicTap} onPress={handlePickPhoto} activeOpacity={0.85}>
              {user?.profile_image ? (
                <Image source={{ uri: user.profile_image }} style={styles.profilePic} contentFit="cover" />
              ) : (
                <View
                  style={[
                    styles.profilePic,
                    {
                      backgroundColor: `${Colors.primary}1a`,
                      borderColor: `${Colors.primary}33`,
                    },
                  ]}
                >
                  <Text style={styles.profileInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <MaterialIcons name="photo-camera" size={16} color={Colors.white} />
                )}
              </View>
                  

            </TouchableOpacity>
            {/* 
            <TouchableOpacity onPress={handlePickPhoto} disabled={uploadingPhoto}>
              <Text style={styles.changePhotoText}>
                {uploadingPhoto ? "Uploading photo..." : "Upload new photo"}
              </Text>
            </TouchableOpacity>
            */}
            
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person-outline" size={20} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? Colors.slate900 : Colors.white,
                    borderColor: isDark ? Colors.slate800 : Colors.slate200,
                    color: theme.text,
                  },
                ]}
                placeholder="e.g. Juan Dela Cruz"
                placeholderTextColor={isDark ? Colors.slate600 : Colors.slate400}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? Colors.slate900 : Colors.white,
                    borderColor: isDark ? Colors.slate800 : Colors.slate200,
                    color: theme.text,
                  },
                ]}
                placeholder="juan@pocketledger.app"
                placeholderTextColor={isDark ? Colors.slate600 : Colors.slate400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="lock-open" size={20} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Security</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: isDark ? Colors.slate900 : Colors.white,
                      borderColor: isDark ? Colors.slate800 : Colors.slate200,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Leave blank to keep current password"
                  placeholderTextColor={isDark ? Colors.slate600 : Colors.slate400}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? "visibility-off" : "visibility"}
                    size={22}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: isDark ? Colors.slate900 : Colors.white,
                      borderColor: isDark ? Colors.slate800 : Colors.slate200,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Repeat your new password"
                  placeholderTextColor={isDark ? Colors.slate600 : Colors.slate400}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? "visibility-off" : "visibility"}
                    size={22}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, (saving || loadingUser) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving || loadingUser}
            >
              {saving || loadingUser ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  profilePicTap: {
    position: "relative",
    marginBottom: 12,
  },
  profilePic: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitials: {
    fontSize: FontSize["2xl"],
    fontWeight: "700",
    color: Colors.primary,
  },
  cameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  changePhotoText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: FontSize.base,
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
  },
  footer: {
    marginTop: 8,
  },
  saveBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
});
