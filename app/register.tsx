import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTheme } from "./context/ThemeContext";
import { useProfile } from "./context/ProfileContext.tsx";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";

export default function Register() {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const { createProfile } = useProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Antwerpen");
  const [level, setLevel] = useState(3.5);
  const [bio, setBio] = useState("");

  const handleRegister = () => {
    if (!firstName || !lastName || !email || !phone || !city) {
      Alert.alert("❌ Fout", "Vul alstublieft alle velden in");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("❌ Fout", "Voer een geldig email adres in");
      return;
    }

    createProfile({
      firstName,
      lastName,
      email,
      phone,
      city,
      level,
      bio,
    });

    Alert.alert(
      "✅ Profiel aangemaakt!",
      `Welkom ${firstName}! Je profiel is klaar.`,
      [
        {
          text: "Start",
          onPress: () => router.replace("/(tabs)/home"),
        },
      ]
    );
  };

  const styles = getStyles(colors, theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme === "dark" ? "#1a1a1a" : "#0984e3"}
      />

      {/* Header */}
      <LinearGradient
        colors={theme === "dark" ? ["#1a1a1a", "#2d2d2d"] : ["#0984e3", "#06c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.headerEmoji}>👤</Text>
        <Text style={styles.headerTitle}>Profiel Aanmaken</Text>
        <Text style={styles.headerSubtitle}>
          Maak je profiel aan om te kunnen reserveren
        </Text>
      </LinearGradient>

      {/* Form */}
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        {/* First Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Voornaam *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Bijv. John"
            placeholderTextColor={colors.textTertiary}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        {/* Last Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Achternaam *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Bijv. Doe"
            placeholderTextColor={colors.textTertiary}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="jouw@email.com"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Phone */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Telefoonnummer *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="+32 123 456 789"
            placeholderTextColor={colors.textTertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* City */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Stad *</Text>
          <View
            style={[
              styles.picker,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Picker
              selectedValue={city}
              onValueChange={setCity}
              itemStyle={{
                color: colors.text,
                backgroundColor: colors.cardBackground,
                fontSize: 16,
              }}
            >
              <Picker.Item label="Antwerpen" value="Antwerpen" color={colors.text} />
              <Picker.Item label="Brussel" value="Brussel" color={colors.text} />
              <Picker.Item label="Gent" value="Gent" color={colors.text} />
              <Picker.Item label="Leuven" value="Leuven" color={colors.text} />
              <Picker.Item label="Oostende" value="Oostende" color={colors.text} />
            </Picker>
          </View>
        </View>

        {/* Level */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Speelniveau (0.5 - 7) *</Text>
          <View
            style={[
              styles.picker,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Picker
              selectedValue={level}
              onValueChange={setLevel}
              itemStyle={{
                color: colors.text,
                backgroundColor: colors.cardBackground,
                fontSize: 16,
              }}
            >
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7].map((lvl) => (
                <Picker.Item
                  key={lvl}
                  label={lvl.toString()}
                  value={lvl}
                  color={colors.text}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Bio (optioneel)</Text>
          <TextInput
            style={[
              styles.bioInput,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Vertel wat over jezelf..."
            placeholderTextColor={colors.textTertiary}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: colors.button }]}
          onPress={handleRegister}
        >
          <Text style={styles.registerButtonText}>✓ Profiel Aanmaken</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.skipButton, { borderColor: colors.button }]}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={[styles.skipButtonText, { color: colors.button }]}>
            ⏭️ Later doen
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function getStyles(colors: any, theme: string) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    headerGradient: {
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    headerEmoji: {
      fontSize: 50,
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: "rgba(255,255,255,0.85)",
      textAlign: "center",
    },
    form: {
      flex: 1,
    },
    formContent: {
      padding: 20,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 15,
      fontSize: 14,
    },
    picker: {
      borderWidth: 1,
      borderRadius: 10,
      overflow: "hidden",
    },
    bioInput: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 15,
      fontSize: 14,
      minHeight: 100,
    },
    registerButton: {
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    registerButtonText: {
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
  });
}