import React, { createContext, useContext, useState, ReactNode } from "react";

export type Theme = "light" | "dark";

export const lightColors = {
  background: "#f8f9fa",
  cardBackground: "#fff",
  text: "#000",
  textSecondary: "#666",
  textTertiary: "#999",
  border: "#ddd",
  overlay: "rgba(0, 0, 0, 0.4)",
  button: "#0984e3",
  buttonSuccess: "#27ae60",
  buttonDanger: "#ff6b6b",
  inputBorder: "#ddd",
  infoBox: "#ecf0f1",
  infoBorder: "#0984e3",
};

export const darkColors = {
  background: "#1a1a1a",
  cardBackground: "#2d2d2d",
  text: "#fff",
  textSecondary: "#ccc",
  textTertiary: "#999",
  border: "#444",
  overlay: "rgba(0, 0, 0, 0.7)",
  button: "#0984e3",
  buttonSuccess: "#27ae60",
  buttonDanger: "#ff6b6b",
  inputBorder: "#444",
  infoBox: "#3a3a3a",
  infoBorder: "#0984e3",
};

type ThemeContextType = {
  theme: Theme;
  colors: typeof lightColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  const colors = theme === "light" ? lightColors : darkColors;

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};