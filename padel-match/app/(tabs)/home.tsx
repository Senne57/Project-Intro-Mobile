import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useMatch } from "../context/MatchContext"; 

export default function Home() {
  const { matches, reserveMatch } = useMatch();

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Beschikbare wedstrijden</Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderRadius: 10,
              padding: 15,
              marginBottom: 10,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.club}</Text>
            <Text>🕒 {item.time}</Text>
            <Text>🎾 Niveau {item.level}</Text>
            <Text>👥 {item.players} / 4 spelers</Text>

            <TouchableOpacity
              style={{
                backgroundColor: "#0984e3",
                padding: 10,
                borderRadius: 8,
                marginTop: 10,
              }}
              onPress={() => reserveMatch(item.id)}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Reserveren</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
