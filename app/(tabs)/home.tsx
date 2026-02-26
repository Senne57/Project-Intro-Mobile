import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Alert, ScrollView, StatusBar, TextInput } from "react-native";
import { useMatch, MatchWithPlayers } from "../context/MatchContext";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const { matches, reserveMatch } = useMatch();
  const { profile, isRegistered } = useProfile();
  const { colors, theme } = useTheme();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const available = matches.filter((m) => {
    const matchesLevel = selectedLevel === null || Math.abs(m.level - selectedLevel) <= 1;
    const matchesSearch =
      searchQuery === "" ||
      m.club.toLowerCase().includes(searchQuery.toLowerCase());
    // Toon alle matches met lege plaatsen (zowel eigen als van anderen)
    return m.players < 4 && matchesLevel && matchesSearch;
  });

  const levelOptions = [0.5, 2, 3.5, 5, 6.5];

  const handleReserve = (item: MatchWithPlayers) => {
    // Als het je eigen match is, kun je niet reserveren
    if (item.createdByMe) {
      Alert.alert("ℹ️", "Dit is je eigen wedstrijd. Je bent al ingeschreven als organizer!");
      return;
    }

    if (!isRegistered || !profile) {
      Alert.alert(
        "👤 Profiel Vereist",
        "Je moet eerst een profiel aanmaken om te kunnen reserveren.",
        [
          {
            text: "Profiel Aanmaken",
            onPress: () => router.push("/register"),
            style: "default",
          },
          {
            text: "Later Doen",
            onPress: () => {
              router.push({
                pathname: "/payment",
                params: {
                  matchId: item.id,
                  club: item.club,
                  date: item.date.toISOString(),
                  time: item.time,
                  level: item.level,
                  price: item.price.toString(),
                  hasProfile: "false",
                },
              });
            },
            style: "default",
          },
          { text: "Annuleren", onPress: () => {}, style: "cancel" },
        ]
      );
      return;
    }

    const match = reserveMatch(item.id);
    if (match) {
      router.push({
        pathname: "/payment",
        params: {
          matchId: match.id,
          club: match.club,
          date: match.date.toISOString(),
          time: item.time,
          level: match.level,
          price: match.price.toString(),
          hasProfile: "true",
        },
      });
    } else {
      Alert.alert("❌ Fout", "Deze wedstrijd is vol of niet beschikbaar.");
    }
  };

  const styles = getStyles(colors, theme);

  const getPlayerColor = (index: number): string => {
    const playerColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"];
    return playerColors[index % playerColors.length];
  };

  // Team Display Component
  const TeamDisplay = ({ match }: { match: MatchWithPlayers }) => {
    const maxPlayers = 2;
    const playersList = Array.isArray(match.playersList) ? match.playersList : [];
    const displayPlayers = playersList.slice(0, maxPlayers);
    const emptySlots = Math.max(0, maxPlayers - displayPlayers.length);

    return (
      <View style={styles.teamContainer}>
        {/* Team 1 */}
        <View style={styles.team}>
          {displayPlayers.map((player, i) => (
            <View key={`player-${i}`} style={styles.playerSlot}>
              <View
                style={[
                  styles.playerCircle,
                  { backgroundColor: getPlayerColor(i) },
                ]}
              >
                <Text style={styles.playerInitials}>
                  {player.firstName === "?"
                    ? "?"
                    : `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`}
                </Text>
              </View>
            </View>
          ))}
          {emptySlots > 0 && [...Array(emptySlots)].map((_, i) => (
            <View key={`empty-${i}`} style={styles.playerSlot}>
              <View style={[styles.emptyCircle, { borderColor: colors.button }]}>
                <Text style={[styles.plusText, { color: colors.button }]}>+</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Divider */}
        <Text style={[styles.divider, { color: colors.textSecondary }]}>|</Text>

        {/* Team 2 */}
        <View style={styles.team}>
          {[...Array(maxPlayers)].map((_, i) => (
            <View key={`team2-${i}`} style={styles.playerSlot}>
              <View style={[styles.emptyCircle, { borderColor: colors.button }]}>
                <Text style={[styles.plusText, { color: colors.button }]}>+</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme === "dark" ? "#1a1a1a" : "#0984e3"}
      />

      {/* Header Section */}
      <LinearGradient
        colors={
          theme === "dark"
            ? ["#1a1a1a", "#2d2d2d"]
            : ["#0984e3", "#06c"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTextSection}>
            <Text style={styles.headerEmoji}>🎾</Text>
            <Text style={styles.headerTitle}>Vind je Match</Text>
            <Text style={styles.headerSubtitle}>
              {available.length} wedstrijden beschikbaar
            </Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{matches.length}</Text>
              <Text style={styles.statLabel}>Totaal</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        key={refreshKey}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <View style={styles.searchInputWrapper}>
              <Text style={[styles.searchLabel, { color: colors.textSecondary }]}>
                Zoek stad
              </Text>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Bijv. Antwerpen..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Level Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>
            Filtrer op Niveau
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.levelScroll}
            contentContainerStyle={styles.levelScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.levelButton,
                selectedLevel === null && styles.levelButtonActive,
                {
                  backgroundColor:
                    selectedLevel === null
                      ? colors.button
                      : colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedLevel(null)}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  {
                    color: selectedLevel === null ? "#fff" : colors.text,
                  },
                ]}
              >
                Allemaal
              </Text>
            </TouchableOpacity>
            {levelOptions.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  selectedLevel === level && styles.levelButtonActive,
                  {
                    backgroundColor:
                      selectedLevel === level
                        ? colors.button
                        : colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text
                  style={[
                    styles.levelButtonText,
                    {
                      color:
                        selectedLevel === level ? "#fff" : colors.text,
                    },
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Wedstrijden List */}
        {available.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>😢</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Geen wedstrijden gevonden
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Probeer andere filters of maak zelf een wedstrijd aan!
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.button }]}
              onPress={() => router.push("/(tabs)/create")}
            >
              <Text style={styles.createButtonText}>+ Wedstrijd aanmaken</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {available.map((item) => (
              <View key={item.id} style={styles.cardWrapper}>
                <ImageBackground
                  source={item.image}
                  style={styles.card}
                  imageStyle={styles.cardImage}
                  blurRadius={2}
                >
                  {/* Overlay Gradient */}
                  <LinearGradient
                    colors={[
                      "rgba(0,0,0,0.2)",
                      "rgba(0,0,0,0.5)",
                      "rgba(0,0,0,0.85)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.overlay}
                  >
                    {/* Top Section with Badges */}
                    <View style={styles.badgeRow}>
                      {item.createdByMe && (
                        <View
                          style={[
                            styles.ownMatchBadge,
                            { backgroundColor: "#4CAF50" },
                          ]}
                        >
                          <Text style={styles.ownMatchBadgeText}>
                            📍 Jij organiseert
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.levelBadge,
                          {
                            backgroundColor: getLevelColor(item.level),
                          },
                        ]}
                      >
                        <Text style={styles.levelBadgeText}>
                          🎾 Niveau {item.level}
                        </Text>
                      </View>
                    </View>

                    {/* Team Display */}
                    <View style={styles.teamDisplaySection}>
                      <TeamDisplay match={item} />
                    </View>

                    {/* Spacer */}
                    <View style={{ flex: 1 }} />

                    {/* Content Section */}
                    <View style={styles.cardContent}>
                      <View>
                        <Text style={styles.clubName}>{item.club}</Text>
                        <View style={styles.detailsRow}>
                          <Text style={styles.detail}>
                            🕒 {item.startTime} - {item.endTime}
                          </Text>
                          <Text style={styles.detailDot}>•</Text>
                          <Text style={styles.detail}>
                            📅{" "}
                            {item.date.toLocaleDateString("nl-NL", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                        </View>
                      </View>

                      {/* Bottom Section */}
                      <View style={styles.bottomSection}>
                        <View style={styles.priceContainer}>
                          <Text
                            style={[
                              styles.priceLabel,
                              {
                                color: "rgba(255,255,255,0.7)",
                              },
                            ]}
                          >
                            Prijs
                          </Text>
                          <Text style={styles.price}>
                            €{item.price.toFixed(2)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.reserveerButton,
                            {
                              backgroundColor: item.createdByMe
                                ? "rgba(255,255,255,0.3)"
                                : colors.button,
                            },
                          ]}
                          onPress={() => handleReserve(item)}
                          activeOpacity={0.8}
                          disabled={item.createdByMe}
                        >
                          <Text style={styles.reserveerButtonText}>
                            {item.createdByMe ? "Jouw Match" : "Reserveren →"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

function getLevelColor(level: number): string {
  if (level <= 1.5) return "#4CAF50";
  if (level <= 3) return "#2196F3";
  if (level <= 4.5) return "#FF9800";
  return "#F44336";
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
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    headerTextSection: {
      flex: 1,
    },
    headerEmoji: {
      fontSize: 40,
      marginBottom: 8,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: "rgba(255,255,255,0.85)",
      fontWeight: "500",
    },
    headerStats: {
      justifyContent: "center",
    },
    statBox: {
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#fff",
    },
    statLabel: {
      fontSize: 11,
      color: "rgba(255,255,255,0.7)",
      marginTop: 4,
      fontWeight: "600",
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 30,
    },
    searchSection: {
      marginBottom: 20,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    searchIcon: {
      fontSize: 18,
      marginRight: 12,
    },
    searchInputWrapper: {
      flex: 1,
    },
    searchLabel: {
      fontSize: 11,
      fontWeight: "600",
      marginBottom: 2,
    },
    searchInput: {
      fontSize: 14,
      fontWeight: "500",
      padding: 0,
    },
    clearIcon: {
      fontSize: 18,
      color: "#999",
      fontWeight: "bold",
    },
    filterSection: {
      marginBottom: 24,
    },
    filterTitle: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 12,
    },
    levelScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },
    levelScrollContent: {
      gap: 10,
    },
    levelButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1.5,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 70,
    },
    levelButtonActive: {
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
    },
    levelButtonText: {
      fontWeight: "600",
      fontSize: 13,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
      paddingHorizontal: 20,
    },
    emptyEmoji: {
      fontSize: 60,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 20,
    },
    createButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    createButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
    },
    listContainer: {
      gap: 14,
    },
    cardWrapper: {
      marginBottom: 4,
    },
    card: {
      height: 280,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    cardImage: {
      borderRadius: 16,
    },
    overlay: {
      flex: 1,
      padding: 16,
      justifyContent: "space-between",
    },
    badgeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    },
    ownMatchBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    ownMatchBadgeText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 11,
    },
    levelBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    levelBadgeText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 12,
    },
    teamDisplaySection: {
      alignItems: "center",
      marginVertical: 8,
    },
    teamContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    team: {
      flexDirection: "row",
      gap: 8,
    },
    playerSlot: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    playerCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    playerInitials: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 11,
    },
    emptyCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    plusText: {
      fontSize: 18,
      fontWeight: "bold",
    },
    divider: {
      fontSize: 24,
      fontWeight: "bold",
      marginHorizontal: 8,
    },
    cardContent: {
      justifyContent: "space-between",
    },
    clubName: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 8,
      textShadowColor: "rgba(0,0,0,0.4)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    detailsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    detail: {
      color: "rgba(255,255,255,0.95)",
      fontSize: 12,
      fontWeight: "500",
    },
    detailDot: {
      color: "rgba(255,255,255,0.5)",
      fontSize: 10,
    },
    bottomSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.2)",
    },
    priceContainer: {
      justifyContent: "flex-end",
    },
    priceLabel: {
      fontSize: 11,
      fontWeight: "600",
      marginBottom: 4,
    },
    price: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "bold",
      textShadowColor: "rgba(0,0,0,0.3)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    reserveerButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    reserveerButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 13,
    },
    bottomSpacing: {
      height: 20,
    },
  });
}