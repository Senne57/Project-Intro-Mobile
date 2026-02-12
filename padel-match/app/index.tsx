import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");

  const login = () => {
    if (email.includes("@")) {
      router.push({ pathname: "/confirm" });
    } else {
      alert("Vul een geldig e-mail adres in");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Padel Match</Text>

      <TextInput
        placeholder="E-mail"
        style={styles.input}
        onChangeText={setEmail}
        value={email}
      />

      <TouchableOpacity style={styles.btn} onPress={login}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 32, textAlign: "center", marginBottom: 30 },
  input: { borderWidth: 1, padding: 15, borderRadius: 8, marginBottom: 15 },
  btn: { backgroundColor: "#00B894", padding: 15, borderRadius: 8 },
  btnText: { color: "white", textAlign: "center", fontWeight: "bold" },
});
