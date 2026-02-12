import { View, Text, FlatList } from "react-native";
import { useMatch } from "../context/MatchContext";

export default function Reservations() {
  const { reservedMatches } = useMatch();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Mijn gereserveerde wedstrijden</Text>

      {reservedMatches.length === 0 && <Text>Je hebt nog geen wedstrijden gereserveerd.</Text>}

      <FlatList
        data={reservedMatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              padding: 15,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.club}</Text>
            <Text>🕒 {item.time}</Text>
            <Text>🎾 Niveau {item.level}</Text>
            <Text>👥 {item.players} / 4 spelers</Text>
          </View>
        )}
      />
    </View>
  );
}
