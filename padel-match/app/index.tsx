import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useTheme } from "./context/ThemeContext";
import { auth, db } from "./lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useProfile } from "./context/ProfileContext";

export default function Index() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setProfileFromFirebase } = useProfile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Controleer of gebruiker al ingelogd is
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Gebruiker is ingelogd, laad profiel
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setProfileFromFirebase({ id: user.uid, ...docSnap.data() });
          router.replace("/(tabs)/home");
        } else {
          // Ingelogd maar geen profiel → naar register
          router.replace("/register");
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Fout", "Vul alstublieft email en wachtwoord in");
      return;
    }

    setIsLoggingIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Laad profiel uit Firebase
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setProfileFromFirebase({ id: user.uid, ...docSnap.data() });
        router.replace("/(tabs)/home");
      } else {
        // Account bestaat maar geen profiel
        router.replace("/register");
      }
    } catch (error: any) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        Alert.alert(
          "Fout",
          "Email of wachtwoord is incorrect. Heb je al een account?",
          [
            { text: "Annuleren", style: "cancel" },
            {
              text: "Registreren",
              onPress: () => router.push("/register"),
            },
          ]
        );
      } else {
        Alert.alert("Fout", "Er is iets misgegaan. Probeer opnieuw.");
      }
    }
    setIsLoggingIn(false);
  };

  const handleSkip = () => {
    router.replace("/(tabs)/home");
  };

  const styles = getStyles(colors);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.loadingEmoji}></Text>
        <ActivityIndicator size="large" color={colors.button} style={{ marginTop: 20 }} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Laden...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Padel Match</Text>
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
          style={[styles.loginButton, { backgroundColor: colors.button, opacity: isLoggingIn ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Inloggen</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.skipButton, { borderColor: colors.border }]}
          onPress={handleSkip}
        >
          <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
            Overslaan
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={[styles.footer, { color: colors.button }]}>
          Nog geen account? Registreer je hier
        </Text>
      </TouchableOpacity>
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
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingEmoji: {
      fontSize: 60,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
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
      borderWidth: 1,
    },
    skipButtonText: {
      fontSize: 16,
    },
    footer: {
      textAlign: "center",
      fontSize: 14,
      marginBottom: 10,
    },
  });
}