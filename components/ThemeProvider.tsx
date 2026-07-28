"use client";

import { useEffect } from "react";

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  sidebar: string;
  chatBubble: string;
  button: string;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load saved theme or use defaults
    const savedTheme = localStorage.getItem("phoenix-theme");
    const theme: ThemeColors = savedTheme
      ? JSON.parse(savedTheme)
      : {
          primary: "#0EA5E9",
          secondary: "#06B6D4",
          background: "#0F172A",
          sidebar: "#1E293B",
          chatBubble: "#1E40AF",
          button: "#0284C7",
        };

    // Apply theme CSS variables
    applyTheme(theme);

    // Listen for theme changes from ThemeStudio
    const handleThemeChange = (e: StorageEvent) => {
      if (e.key === "phoenix-theme" && e.newValue) {
        const newTheme = JSON.parse(e.newValue);
        applyTheme(newTheme);
      }
    };

    window.addEventListener("storage", handleThemeChange);
    return () => window.removeEventListener("storage", handleThemeChange);
  }, []);

  return <>{children}</>;
}

function applyTheme(theme: ThemeColors) {
  const root = document.documentElement;
  
  // Set CSS variables
  root.style.setProperty("--color-primary", theme.primary);
  root.style.setProperty("--color-secondary", theme.secondary);
  root.style.setProperty("--color-background", theme.background);
  root.style.setProperty("--color-sidebar", theme.sidebar);
  root.style.setProperty("--color-chat-bubble", theme.chatBubble);
  root.style.setProperty("--color-button", theme.button);
  
  // Convert hex to RGB for use in rgba
  const rgbPrimary = hexToRgb(theme.primary);
  const rgbSecondary = hexToRgb(theme.secondary);
  const rgbBackground = hexToRgb(theme.background);
  const rgbSidebar = hexToRgb(theme.sidebar);
  const rgbChatBubble = hexToRgb(theme.chatBubble);
  const rgbButton = hexToRgb(theme.button);
  
  root.style.setProperty("--color-primary-rgb", rgbPrimary);
  root.style.setProperty("--color-secondary-rgb", rgbSecondary);
  root.style.setProperty("--color-background-rgb", rgbBackground);
  root.style.setProperty("--color-sidebar-rgb", rgbSidebar);
  root.style.setProperty("--color-chat-bubble-rgb", rgbChatBubble);
  root.style.setProperty("--color-button-rgb", rgbButton);
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
  }
  return "0 0 0";
}
