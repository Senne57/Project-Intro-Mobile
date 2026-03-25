import { Stack } from "expo-router";
import { ThemeProvider } from "./context/ThemeContext";
import { MatchProvider } from "./context/MatchContext";
import { MessageProvider } from "./context/MessageContext";
import { ProfileProvider } from "./context/ProfileContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <MatchProvider>
          <MessageProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="confirm" />
              <Stack.Screen name="register" />
              <Stack.Screen
                name="payment"
                options={{
                  presentation: "modal",
                  headerShown: true,
                  headerTitle: "Betaling",
                }}
              />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </MessageProvider>
        </MatchProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}