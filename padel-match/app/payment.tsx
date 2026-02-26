import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "./context/ThemeContext";
import { useMatch, MatchWithPlayers } from "./context/MatchContext";
import { useProfile } from "./context/ProfileContext";
import { useState } from "react";

export default function Payment() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setMyReservations, matches } = useMatch();
  const { profile } = useProfile();
  const { matchId, club, date, time, level, price, hasProfile } =
    useLocalSearchParams();

  const matchDate = new Date(date as string);
  const priceNum = parseFloat(price as string);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      // Zoek de match
      const match = matches.find((m) => m.id === matchId) as MatchWithPlayers | undefined;
      if (!match) {
        Alert.alert("❌ Fout", "Match niet gevonden");
        return;
      }

      // Voeg jouw profiel toe aan de spelers lijst
      let updatedPlayersList = [...(match.playersList || [])];
      
      if (hasProfile === "true" && profile) {
        // Met profiel: voeg echte initialen toe
        updatedPlayersList.push({
          firstName: profile.firstName,
          lastName: profile.lastName,
        });
      } else {
        // Zonder profiel: voeg "?" toe
        updatedPlayersList.push({
          firstName: "?",
          lastName: "",
        });
      }

      // Voeg de match toe aan reservaties met spelers
      const reservedMatch: MatchWithPlayers = {
        ...match,
        players: match.players + 1,
        createdByMe: false,
        playersList: updatedPlayersList,
      };

      setMyReservations(reservedMatch);

      // Update ook de zoeken pagina
      // (Dit gebeurt automatisch via het context)

      // Simuleer succesvol betaling
      Alert.alert(
        "✅ Betaling Succesvol!",
        `Je bent ingeschreven voor de wedstrijd!\n\n📍 ${club}\n📅 ${matchDate.toLocaleDateString(
          "nl-NL"
        )}\n🕒 ${time}\n🎾 Niveau ${level}\n💳 Betaald: €${priceNum.toFixed(2)}\n\nJe kunt je reservering vinden onder 'Mijn Reservaties'`,
        [
          {
            text: "Ga naar Mijn Reservaties",
            onPress: () => router.replace("/(tabs)/reservations"),
            style: "default",
          },
          {
            text: "Terug naar Zoeken",
            onPress: () => router.replace("/(tabs)/home"),
            style: "cancel",
          },
        ]
      );
    }, 1500);
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Order Summary */}
      <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Wedstrijd Details</Text>

        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>📍 Locatie</Text>
          <Text style={[styles.value, { color: colors.text }]}>{club}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>📅 Datum</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {matchDate.toLocaleDateString("nl-NL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>🕒 Tijd</Text>
          <Text style={[styles.value, { color: colors.text }]}>{time}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>🎾 Niveau</Text>
          <Text style={[styles.value, { color: colors.text }]}>{level}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Your Profile */}
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>👤 Deelnemer</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {hasProfile === "true" && profile
              ? `${profile.firstName} ${profile.lastName}`
              : "Anoniem"}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Price Breakdown */}
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Deelnameprijs</Text>
          <Text style={[styles.value, { color: colors.text }]}>€{priceNum.toFixed(2)}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Totaal</Text>
          <Text style={[styles.totalPrice, { color: colors.button }]}>€{priceNum.toFixed(2)}</Text>
        </View>
      </View>

      {/* Payment Method */}
      <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Betaalmethode</Text>

        <View style={[styles.paymentMethod, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={styles.paymentIcon}>💳</Text>
          <View style={styles.paymentInfo}>
            <Text style={[styles.paymentName, { color: colors.text }]}>Credit Card</Text>
            <Text style={[styles.paymentDetails, { color: colors.textSecondary }]}>
              Visa •••• 4242
            </Text>
          </View>
          <Text style={[styles.checkmark, { color: colors.button }]}>✓</Text>
        </View>
      </View>

      {/* Warning */}
      <View style={[styles.warningBox, { backgroundColor: colors.infoBox, borderColor: colors.infoBorder }]}>
        <Text style={[styles.warningText, { color: colors.text }]}>
          ⚠️ Na betaling ben je ingeschreven voor deze wedstrijd. Je kunt deze annuleren onder 'Mijn Reservaties'.
        </Text>
      </View>

      {/* Pay Button */}
      <TouchableOpacity
        style={[styles.payButton, { backgroundColor: colors.button, opacity: isProcessing ? 0.6 : 1 }]}
        onPress={handlePay}
        disabled={isProcessing}
      >
        <Text style={styles.payButtonText}>
          {isProcessing ? "⏳ Bezig met verwerken..." : `💰 Betaal €${priceNum.toFixed(2)}`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: colors.border }]}
        onPress={() => router.dismiss()}
        disabled={isProcessing}
      >
        <Text style={[styles.cancelButtonText, { color: colors.button }]}>Annuleren</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
      backgroundColor: colors.background,
    },
    card: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
    },
    value: {
      fontSize: 14,
      fontWeight: "500",
      textAlign: "right",
      flex: 1,
      marginLeft: 10,
    },
    divider: {
      height: 1,
      marginVertical: 12,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: "bold",
    },
    totalPrice: {
      fontSize: 24,
      fontWeight: "bold",
    },
    paymentMethod: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
    },
    paymentIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    paymentInfo: {
      flex: 1,
    },
    paymentName: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 2,
    },
    paymentDetails: {
      fontSize: 12,
    },
    checkmark: {
      fontSize: 20,
      fontWeight: "bold",
    },
    warningBox: {
      borderRadius: 10,
      borderLeftWidth: 4,
      padding: 12,
      marginBottom: 20,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 20,
    },
    payButton: {
      padding: 16,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 12,
    },
    payButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    cancelButton: {
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      borderWidth: 2,
      marginBottom: 30,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "bold",
    },
  });
}