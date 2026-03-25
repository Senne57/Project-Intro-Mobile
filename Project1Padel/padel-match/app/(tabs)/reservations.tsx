import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { useMatch, MatchWithPlayers } from "../context/MatchContext";
import { useTheme } from "../context/ThemeContext";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

export default function Reservations() {
  const { myReservations, cancelReservation } = useMatch();
  const { colors, theme } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterType, setFilterType] = useState<"all" | "created" | "reserved">("all");

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const filteredReservations = myReservations.filter((m) => {
    if (filterType === "created") return m.createdByMe;
    if (filterType === "reserved") return !m.createdByMe;
    return true;
  });

  const handleCancel = (item: MatchWithPlayers) => {
    Alert.alert(
      "Annuleren?",
      `Wil je je reservering voor ${item.club} annuleren?`,
      [
        { text: "Nee", style: "cancel" },
        {
          text: "Ja, annuleren",
          style: "destructive",
          onPress: async () => {
            await cancelReservation(item.id);
            Alert.alert("✅ Geannuleerd", "Je reservering is verwijderd.");
          },
        },
      ]
    );
  };

  const styles = getStyles(colors, theme);

  const getPlayerColor = (index: number): string => {
    const playerColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"];
    return playerColors[index % playerColors.length];
  };

  const TeamDisplay = ({ match }: { match: MatchWithPlayers }) => {
    const maxPlayers = 2;
    const playersList = Array.isArray(match.playersList) ? match.playersList : [];
    const displayPlayers = playersList.slice(0, maxPlayers);
    const emptySlots = Math.max(0, maxPlayers - displayPlayers.length);

    return (
      <View style={styles.teamContainer}>
        <View style={styles.team}>
          {displayPlayers.map((player, i) => (
            <View key={`player-${i}`} style={styles.playerSlot}>
              <View style={[styles.playerCircle, { backgroundColor: getPlayerColor(i) }]}>
                <Text style={styles.playerInitials}>
                  {player.firstName === "?" ? "?" : `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`}
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
        <Text style={[styles.divider, { color: colors.textSecondary }]}>|</Text>
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

      <LinearGradient
        colors={theme === "dark" ? ["#1a1a1a", "#2d2d2d"] : ["#0984e3", "#06c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTextSection}>
            <Text style={styles.headerEmoji}>📋</Text>
            <Text style={styles.headerTitle}>Mijn Reservaties</Text>
            <Text style={styles.headerSubtitle}>{filteredReservations.length} wedstrijden</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{myReservations.length}</Text>
              <Text style={styles.statLabel}>Totaal</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView key={refreshKey} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Filtrer</Text>
          <View style={styles.filterButtons}>
            {(["all", "created", "reserved"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  filterType === type && styles.filterButtonActive,
                  { backgroundColor: filterType === type ? colors.button : colors.cardBackground, borderColor: colors.border },
                ]}
                onPress={() => setFilterType(type)}
              >
                <Text style={[styles.filterButtonText, { color: filterType === type ? "#fff" : colors.text }]}>
                  {type === "all" ? "Allemaal" : type === "created" ? "Aangemaakt" : "Gereserveerd"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {filteredReservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎾</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>Geen reservaties gevonden</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {filterType === "created"
                ? "Je hebt nog geen wedstrijden aangemaakt"
                : filterType === "reserved"
                ? "Je bent nog niet ingeschreven voor wedstrijden"
                : "Je hebt nog geen reservaties"}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredReservations.map((item) => (
              <View key={item.id} style={styles.cardWrapper}>
                <ImageBackground source={item.image} style={styles.card} imageStyle={styles.cardImage} blurRadius={2}>
                  <LinearGradient
                    colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.85)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.overlay}
                  >
                    <View style={styles.badgeRow}>
                      <View style={[styles.statusBadge, { backgroundColor: item.createdByMe ? "#4CAF50" : "#2196F3" }]}>
                        <Text style={styles.statusBadgeText}>
                          {item.createdByMe ? "Jij organiseert" : "Ingeschreven"}
                        </Text>
                      </View>
                      <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) }]}>
                        <Text style={styles.levelBadgeText}>{item.level}</Text>
                      </View>
                    </View>

                    <View style={styles.teamDisplaySection}>
                      <TeamDisplay match={item} />
                    </View>

                    <View style={{ flex: 1 }} />

                    <View style={styles.cardContent}>
                      <View>
                        <Text style={styles.clubName}>{item.club}</Text>
                        <View style={styles.detailsRow}>
                          <Text style={styles.detail}>{item.startTime} - {item.endTime}</Text>
                          <Text style={styles.detailDot}>•</Text>
                          <Text style={styles.detail}>
                            {item.date.toLocaleDateString("nl-NL", { weekday: "short", month: "short", day: "numeric" })}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.bottomSection}>
                        <View style={styles.priceContainer}>
                          <Text style={[styles.priceLabel, { color: "rgba(255,255,255,0.7)" }]}>Prijs</Text>
                          <Text style={styles.price}>€{item.price.toFixed(2)}</Text>
                        </View>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={[styles.detailsButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
                            onPress={() => Alert.alert("", `Wedstrijd details van ${item.club}`)}
                          >
                            <Text style={styles.detailsButtonText}></Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: "#FF6B6B" }]}
                            onPress={() => handleCancel(item)}
                          >
                            <Text style={styles.cancelButtonText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </View>
            ))}
          </View>
        )}

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
    container: { flex: 1 },
    headerGradient: { paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    headerTextSection: { flex: 1 },
    headerEmoji: { fontSize: 40, marginBottom: 8 },
    headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: "500" },
    headerStats: { justifyContent: "center" },
    statBox: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
    statNumber: { fontSize: 20, fontWeight: "bold", color: "#fff" },
    statLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4, fontWeight: "600" },
    scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },
    filterSection: { marginBottom: 24 },
    filterTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 12 },
    filterButtons: { flexDirection: "row", gap: 10 },
    filterButton: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, justifyContent: "center", alignItems: "center" },
    filterButtonActive: { elevation: 3 },
    filterButtonText: { fontWeight: "600", fontSize: 12 },
    emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 80, paddingHorizontal: 20 },
    emptyEmoji: { fontSize: 60, marginBottom: 16 },
    emptyText: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
    emptySubtext: { fontSize: 14, textAlign: "center", lineHeight: 20 },
    listContainer: { gap: 14 },
    cardWrapper: { marginBottom: 4 },
    card: { height: 300, borderRadius: 16, overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4 },
    cardImage: { borderRadius: 16 },
    overlay: { flex: 1, padding: 16, justifyContent: "space-between" },
    badgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
    levelBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    levelBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
    teamDisplaySection: { alignItems: "center", marginVertical: 8 },
    teamContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
    team: { flexDirection: "row", gap: 8 },
    playerSlot: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
    playerCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
    playerInitials: { color: "#fff", fontWeight: "bold", fontSize: 11 },
    emptyCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, justifyContent: "center", alignItems: "center" },
    plusText: { fontSize: 18, fontWeight: "bold" },
    divider: { fontSize: 24, fontWeight: "bold", marginHorizontal: 8 },
    cardContent: { justifyContent: "space-between" },
    clubName: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 8 },
    detailsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    detail: { color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: "500" },
    detailDot: { color: "rgba(255,255,255,0.5)", fontSize: 10 },
    bottomSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)" },
    priceContainer: { justifyContent: "flex-end" },
    priceLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
    price: { color: "#fff", fontSize: 24, fontWeight: "bold" },
    actionButtons: { flexDirection: "row", gap: 8 },
    detailsButton: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    detailsButtonText: { fontSize: 18 },
    cancelButton: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    cancelButtonText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
    bottomSpacing: { height: 20 },
  });
}