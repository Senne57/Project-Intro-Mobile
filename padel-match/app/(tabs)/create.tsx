import { View, Text, Button } from "react-native";

export default function Create() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Nieuwe match aanmaken</Text>
      <Text>Sport: Padel</Text>
      <Text>Spelers: 4 verplicht</Text>
      <Button title="Aanmaken" onPress={() => alert("Match aangemaakt")} />
    </View>
  );
}
