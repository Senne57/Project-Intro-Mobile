import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTheme } from "./context/ThemeContext";

export default function Confirm() {
  const { colors } = useTheme();
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleConfirm = () => {
    if (!code) {
      Alert.alert("Error", "Vul alstublieft je code in");
      return;
    }
    // Ga naar register om profiel aan te maken
    router.replace("/register");
  };

  const handleSkip = () => {
    router.replace("/(tabs)/home");
  };

  const styles = getStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>📧 Code Bevestigen</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We hebben je een code gestuurd
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Voer je code in"
          placeholderTextColor={colors.textTertiary}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: colors.button }]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Bevestigen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.skipButton, { borderColor: colors.button }]}
          onPress={handleSkip}
        >
          <Text style={[styles.skipButtonText, { color: colors.button }]}>
            ⏭️ Overslaan
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.footer, { color: colors.textTertiary }]}>
        Code niet ontvangen? Verstuur opnieuw
      </Text>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: "space-between",
    },
    content: {
      flex: 1,
      justifyContent: "center",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 40,
    },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      fontSize: 16,
      textAlign: "center",
      letterSpacing: 2,
    },
    confirmButton: {
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 10,
    },
    confirmButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    skipButton: {
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      borderWidth: 2,
    },
    skipButtonText: {
      fontSize: 16,
      fontWeight: "bold",
    },
    footer: {
      textAlign: "center",
      fontSize: 14,
    },
  });
}