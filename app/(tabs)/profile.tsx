import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useProfile } from "../context/ProfileContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function Profile() {
  const { theme, colors, toggleTheme } = useTheme();
  const { profile, isRegistered } = useProfile();
  const router = useRouter();

  if (!isRegistered || !profile) {
    const emptyStyles = getEmptyStyles(colors);
    return (
      <View style={[emptyStyles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
        />
        <View style={emptyStyles.emptyContainer}>
          <Text style={emptyStyles.emptyEmoji}>👤</Text>
          <Text style={[emptyStyles.emptyTitle, { color: colors.text }]}>
            Geen profiel
          </Text>
          <Text
            style={[emptyStyles.emptySubtitle, { color: colors.textSecondary }]}
          >
            Je moet eerst een profiel aanmaken
          </Text>
          <TouchableOpacity
            style={[emptyStyles.createProfileButton, { backgroundColor: colors.button }]}
            onPress={() => router.push("/register")}
          >
            <Text style={emptyStyles.createProfileButtonText}>
              + Profiel Aanmaken
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const styles = getStyles(colors, theme);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <LinearGradient
        colors={theme === "dark" ? ["#1a1a1a", "#2d2d2d"] : ["#0984e3", "#06c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>
              {profile.firstName.charAt(0)}
              {profile.lastName.charAt(0)}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={styles.profileLevel}>
              🎾 Niveau {profile.level}
            </Text>
            <Text style={styles.profileCity}>📍 {profile.city}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Personal Info */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Persoonlijke Gegevens
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              📧 Email
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profile.email}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              📞 Telefoonnummer
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profile.phone}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              📍 Stad
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profile.city}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              🎾 Speelniveau
            </Text>
            <Text style={[styles.infoValue, { color: colors.button }]}>
              {profile.level}
            </Text>
          </View>
        </View>

        {/* Bio */}
        {profile.bio && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Over Mij
            </Text>
            <Text style={[styles.bioText, { color: colors.text }]}>
              {profile.bio}
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Lid sinds
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {profile.joinDate.toLocaleDateString("nl-NL", {
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Wedstrijden
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
          </View>
        </View>

        {/* Theme Toggle */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              🌙 Dark Mode
            </Text>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: "#ccc", true: "#0984e3" }}
              thumbColor={theme === "dark" ? "#0984e3" : "#fff"}
            />
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={[styles.editButton, { borderColor: colors.button }]}
          onPress={() => Alert.alert("ℹ️", "Bewerk profiel functie komt binnenkort!")}
        >
          <Text style={[styles.editButtonText, { color: colors.button }]}>
            ✏️ Profiel Bewerken
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton]}
          onPress={() => {
            Alert.alert("Uitloggen?", "Je wordt teruggezet naar login", [
              { text: "Annuleren" },
              {
                text: "Uitloggen",
                onPress: () => router.replace("/"),
              },
            ]);
          }}
        >
          <Text style={styles.logoutButtonText}>🚪 Uitloggen</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function getEmptyStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 100,
    },
    emptyEmoji: {
      fontSize: 60,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      marginBottom: 24,
    },
    createProfileButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
    },
    createProfileButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
    },
  });
}

function getStyles(colors: any, theme: string) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },

    // Header
    headerGradient: {
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.4)",
    },
    avatar: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#fff",
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 4,
    },
    profileLevel: {
      fontSize: 14,
      color: "rgba(255,255,255,0.9)",
      marginBottom: 2,
    },
    profileCity: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
    },

    // Content
    content: {
      padding: 20,
      paddingBottom: 40,
    },

    // Section
    section: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 12,
    },

    // Info Rows
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 13,
      fontWeight: "600",
    },
    infoValue: {
      fontSize: 14,
      fontWeight: "500",
    },
    divider: {
      height: 1,
      marginVertical: 8,
    },

    // Bio
    bioText: {
      fontSize: 14,
      lineHeight: 22,
    },

    // Stats
    statsContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      padding: 16,
      alignItems: "center",
    },
    statEmoji: {
      fontSize: 28,
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "bold",
    },

    // Settings
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    settingLabel: {
      fontSize: 14,
      fontWeight: "600",
    },

    // Buttons
    editButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: "center",
      marginBottom: 12,
    },
    editButtonText: {
      fontSize: 14,
      fontWeight: "bold",
    },
    logoutButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: "#FF6B6B",
      marginBottom: 20,
    },
    logoutButtonText: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#fff",
    },
  });
}