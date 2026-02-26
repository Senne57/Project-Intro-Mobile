import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTheme } from "./context/ThemeContext";
import { useProfile } from "./context/ProfileContext.tsx";

export default function Index() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isRegistered } = useProfile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Als gebruiker al geregistreerd is, ga direct naar home
  if (isRegistered) {
    router.replace("/(tabs)/home");
    return null;
  }

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Vul alstublieft email en wachtwoord in");
      return;
    }
    router.replace("/confirm");
  };

  const handleSkip = () => {
    router.replace("/(tabs)/home");
  };

  const styles = getStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>🎾 Padel Match</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Vind je volgende wedstrijd
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
          placeholder="Email"
          placeholderTextColor={colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Wachtwoord"
          placeholderTextColor={colors.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.button }]}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Inloggen</Text>
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
        Nog geen account? Registreer je hier
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
    },
    loginButton: {
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 10,
    },
    loginButtonText: {
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