import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

export default function Confirm() {
  const [code, setCode] = useState("");

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Bevestigingscode</Text>

      <TextInput
        placeholder="Eender welke code"
        value={code}
        onChangeText={setCode}
        style={{ borderWidth: 1, padding: 15, borderRadius: 8, marginBottom: 20 }}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={{ backgroundColor: "#00B894", padding: 15, borderRadius: 8 }}
        onPress={() => router.replace({ pathname: "/(tabs)/home" })} // RELATIVE ROUTE
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
          Bevestigen
        </Text>
      </TouchableOpacity>
    </View>
  );
}
