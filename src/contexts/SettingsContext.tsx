
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, Theme } from "@/types";

interface SettingsContextType {
  language: Language;
  theme: Theme;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage or default values
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("language");
    return (savedLanguage as Language) || "en";
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    // Use system preference as fallback
    if (!savedTheme) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return savedTheme as Theme;
  });

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };

  return (
    <SettingsContext.Provider value={{ language, theme, toggleTheme, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Fast refresh requires this hook to be exported with the provider; suppressing the lint rule for this export.
// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
