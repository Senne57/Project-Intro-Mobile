import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: "Zoeken" }} />
      <Tabs.Screen name="create" options={{ title: "Aanmaken" }} />
      <Tabs.Screen name="messages" options={{ title: "Berichten" }} />
      <Tabs.Screen name="reservations" options={{ title: "Mijn reservaties" }} />
      <Tabs.Screen name="profile" options={{ title: "Profiel" }} />
    </Tabs>
  );
}
