import { Tabs } from "expo-router";
import { useTheme } from "../context/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: "#0984e3",
        tabBarInactiveTintColor: colors.textTertiary,
        headerStyle: {
          backgroundColor: colors.cardBackground,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: colors.text,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Zoeken" }} />
      <Tabs.Screen name="create" options={{ title: "Aanmaken" }} />
      <Tabs.Screen name="reservations" options={{ title: "Mijn Reservaties" }} />
      <Tabs.Screen name="messages" options={{ title: "Berichten" }} />
      <Tabs.Screen name="profile" options={{ title: "Profiel" }} />
    </Tabs>
  );
}