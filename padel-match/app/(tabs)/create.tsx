import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useMatch } from "../context/MatchContext";
import { useProfile } from "../context/ProfileContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { locations, timeSlots, Location } from "../data/matches";
import { LinearGradient } from "expo-linear-gradient";

export default function Create() {
  const { colors, theme } = useTheme();
  const { createMatch } = useMatch();
  const { profile, isRegistered } = useProfile();
  const router = useRouter();

  const [selectedCity, setSelectedCity] = useState<string>("Antwerpen");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(3.5);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlots[0]);
  const [date, setDate] = useState(new Date());

  const cityLocations = locations.filter(
    (loc) => loc.city === selectedCity
  );

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
  };

  const handleCreate = async () => {
    if (!selectedLocation) {
      Alert.alert("❌ Fout", "Selecteer alstublieft een locatie");
      return;
    }

    const creatorInfo = profile ? {
      firstName: profile.firstName,
      lastName: profile.lastName,
    } : undefined;

    const success = await createMatch(
      selectedLocation.name,
      selectedLevel,
      date,
      selectedTimeSlot.start,
      selectedTimeSlot.end,
      creatorInfo
    );

    if (success) {
      const creatorName = profile
        ? `${profile.firstName} ${profile.lastName}`
        : "Anoniem";

      Alert.alert(
        "✅ Wedstrijd Aangemaakt!",
        `Je wedstrijd is aangemaakt!\n\n📍 ${selectedLocation.name}\n📅 ${date.toLocaleDateString("nl-NL")}\n🕒 ${selectedTimeSlot.label}\n🎾 Niveau ${selectedLevel}\n👤 Organizer: ${creatorName}`,
        [
          {
            text: "Terug naar Zoeken",
            onPress: () => router.replace("/(tabs)/home"),
          },
        ]
      );
    } else {
      Alert.alert(
        "⚠️ Oops",
        "Er bestaat al een wedstrijd op deze plek en tijd. Kies een ander moment!"
      );
    }
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
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>➕</Text>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Wedstrijd Aanmaken</Text>
            <Text style={styles.headerSubtitle}>Maak je eigen match</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Form */}
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.infoBox, borderColor: colors.infoBorder }]}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            👤 Je zult automatisch als organizer aan deze wedstrijd worden toegevoegd
          </Text>
          {isRegistered && profile && (
            <Text style={[styles.infoTextSub, { color: colors.textSecondary }]}>
              ✓ Als: {profile.firstName} {profile.lastName}
            </Text>
          )}
          {(!isRegistered || !profile) && (
            <Text style={[styles.infoTextSub, { color: colors.textSecondary }]}>
              ⚠️ Je zult als anoniem (?) verschijnen
            </Text>
          )}
        </View>

        {/* Stad Selectie */}
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
              selectedValue={selectedCity}
              onValueChange={(value) => {
                setSelectedCity(value);
                setSelectedLocation(null);
              }}
              itemStyle={{
                color: colors.text,
                backgroundColor: colors.cardBackground,
                fontSize: 16,
              }}
            >
              <Picker.Item label="Antwerpen" value="Antwerpen" color={colors.text} />
              <Picker.Item label="Brussel" value="Brussel" color={colors.text} />
              <Picker.Item label="Gent" value="Gent" color={colors.text} />
            </Picker>
          </View>
        </View>

        {/* Locatie Selectie */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Locatie *</Text>
          <TouchableOpacity
            style={[
              styles.locationButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: selectedLocation ? colors.button : colors.border,
              },
            ]}
            onPress={() => setShowLocationModal(true)}
          >
            <Text
              style={[
                styles.locationButtonText,
                { color: selectedLocation ? colors.text : colors.textSecondary },
              ]}
            >
              {selectedLocation ? selectedLocation.name : "Kies een locatie..."}
            </Text>
            <Text style={[styles.locationIcon, { color: colors.button }]}>
              {selectedLocation ? "✓" : "▼"}
            </Text>
          </TouchableOpacity>

          {selectedLocation && (
            <Text style={[styles.locationAddress, { color: colors.textSecondary }]}>
              📍 {selectedLocation.address}
            </Text>
          )}
        </View>

        {/* Datum */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Datum *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={date.toLocaleDateString("nl-NL")}
            editable={false}
            placeholder="Datum"
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Klik hieronder om datum te wijzigen
          </Text>
        </View>

        {/* Tijdslot */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Tijdslot (2u) *</Text>
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
              selectedValue={selectedTimeSlot.start}
              onValueChange={(value) => {
                const slot = timeSlots.find((ts) => ts.start === value);
                if (slot) setSelectedTimeSlot(slot);
              }}
              itemStyle={{
                color: colors.text,
                backgroundColor: colors.cardBackground,
                fontSize: 16,
              }}
            >
              {timeSlots.map((slot) => (
                <Picker.Item
                  key={slot.start}
                  label={slot.label}
                  value={slot.start}
                  color={colors.text}
                />
              ))}
            </Picker>
          </View>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            ℹ️ Elk tijdslot is 2 uur lang
          </Text>
        </View>

        {/* Niveau */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Speelniveau *</Text>
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
              selectedValue={selectedLevel}
              onValueChange={setSelectedLevel}
              itemStyle={{
                color: colors.text,
                backgroundColor: colors.cardBackground,
                fontSize: 16,
              }}
            >
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7].map(
                (level) => (
                  <Picker.Item
                    key={level}
                    label={level.toString()}
                    value={level}
                    color={colors.text}
                  />
                )
              )}
            </Picker>
          </View>
        </View>

        {/* Waarschuwing */}
        <View
          style={[
            styles.warningBox,
            { backgroundColor: colors.infoBox, borderColor: colors.infoBorder },
          ]}
        >
          <Text style={[styles.warningText, { color: colors.text }]}>
            ℹ️ Je kan meerdere wedstrijden op dezelfde locatie aanmaken, zolang de
            uren niet hetzelfde zijn.
          </Text>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.button }]}
          onPress={handleCreate}
        >
          <Text style={styles.createButtonText}>➕ Wedstrijd Aanmaken</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Location Modal */}
      <Modal visible={showLocationModal} animationType="slide" transparent>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Kies een locatie in {selectedCity}
            </Text>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <Text style={[styles.closeButton, { color: colors.button }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={cityLocations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.locationItem,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleSelectLocation(item)}
              >
                <View style={styles.locationItemContent}>
                  <Text style={[styles.locationItemName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.locationItemAddress, { color: colors.textSecondary }]}
                  >
                    📍 {item.address}
                  </Text>
                </View>
                {selectedLocation?.id === item.id && (
                  <Text style={[styles.selectedCheckmark, { color: colors.button }]}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.locationList}
          />
        </View>
      </Modal>
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
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerEmoji: {
      fontSize: 40,
      marginRight: 16,
    },
    headerText: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
    },
    form: {
      flex: 1,
    },
    formContent: {
      padding: 20,
      paddingBottom: 40,
    },
    infoBox: {
      borderRadius: 10,
      borderLeftWidth: 4,
      padding: 12,
      marginBottom: 20,
    },
    infoText: {
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 20,
    },
    infoTextSub: {
      fontSize: 12,
      marginTop: 6,
      fontStyle: "italic",
    },
    section: {
      marginBottom: 24,
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
    hint: {
      fontSize: 12,
      marginTop: 6,
      fontStyle: "italic",
    },
    locationButton: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 15,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    locationButtonText: {
      fontSize: 14,
      fontWeight: "500",
    },
    locationIcon: {
      fontSize: 16,
      fontWeight: "bold",
    },
    locationAddress: {
      fontSize: 12,
      marginTop: 8,
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
    createButton: {
      padding: 16,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 20,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    createButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    modalContainer: {
      flex: 1,
      paddingTop: 20,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(0,0,0,0.1)",
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: "bold",
    },
    closeButton: {
      fontSize: 24,
      fontWeight: "bold",
    },
    locationList: {
      padding: 16,
    },
    locationItem: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    locationItemContent: {
      flex: 1,
    },
    locationItemName: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    locationItemAddress: {
      fontSize: 12,
    },
    selectedCheckmark: {
      fontSize: 20,
      fontWeight: "bold",
      marginLeft: 12,
    },
  });
}