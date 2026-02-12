import { Stack } from "expo-router";
import { MatchProvider } from "./context/MatchContext";

export default function Layout() {
  return (
    <MatchProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MatchProvider>
  );
}
