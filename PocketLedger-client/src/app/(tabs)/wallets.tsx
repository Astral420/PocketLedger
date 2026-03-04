import { View, Text, StyleSheet } from "react-native";
import { Colors, FontSize } from "../constants/theme";

export default function WalletsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Wallets</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundLight,
  },
  text: {
    fontSize: FontSize.lg,
    color: Colors.slate700,
  },
});
