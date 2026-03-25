import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useMessage } from "../context/MessageContext";

function UnreadBadge() {
  const { totalUnread } = useMessage();
  const { colors } = useTheme();
  if (!totalUnread) return null;
  return (
    <View style={[badgeStyles.badge, { backgroundColor: colors.button }]}>
      <Text style={badgeStyles.text}>{totalUnread > 9 ? "9+" : totalUnread}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  text: { color: "#fff", fontSize: 10, fontWeight: "bold" },
});

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
      <Tabs.Screen name="messages" options={{ title: "Berichten" }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profiel" }} />
    </Tabs>
  );
}
