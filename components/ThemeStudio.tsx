"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    sidebar: string;
    chatBubble: string;
    button: string;
  };
}

const PRESET_THEMES: Theme[] = [
  {
    name: "Ocean Blue",
    colors: {
      primary: "#0EA5E9",
      secondary: "#06B6D4",
      background: "#0F172A",
      sidebar: "#1E293B",
      chatBubble: "#1E40AF",
      button: "#0284C7",
    },
  },
  {
    name: "Royal Purple",
    colors: {
      primary: "#A855F7",
      secondary: "#D946EF",
      background: "#1E1B4B",
      sidebar: "#312E81",
      chatBubble: "#7C3AED",
      button: "#9333EA",
    },
  },
  {
    name: "Emerald Green",
    colors: {
      primary: "#10B981",
      secondary: "#14B8A6",
      background: "#064E3B",
      sidebar: "#047857",
      chatBubble: "#059669",
      button: "#0891B2",
    },
  },
  {
    name: "Crimson Red",
    colors: {
      primary: "#EF4444",
      secondary: "#F87171",
      background: "#7F1D1D",
      sidebar: "#991B1B",
      chatBubble: "#DC2626",
      button: "#B91C1C",
    },
  },
  {
    name: "Sunset Orange",
    colors: {
      primary: "#F97316",
      secondary: "#FB923C",
      background: "#431407",
      sidebar: "#7C2D12",
      chatBubble: "#EA580C",
      button: "#D97706",
    },
  },
  {
    name: "Midnight",
    colors: {
      primary: "#64748B",
      secondary: "#78716C",
      background: "#000000",
      sidebar: "#1F2937",
      chatBubble: "#374151",
      button: "#4B5563",
    },
  },
  {
    name: "Aurora",
    colors: {
      primary: "#06B6D4",
      secondary: "#8B5CF6",
      background: "#0C0E27",
      sidebar: "#1A1F3A",
      chatBubble: "#0891B2",
      button: "#7C3AED",
    },
  },
  {
    name: "Glass",
    colors: {
      primary: "#E0F2FE",
      secondary: "#F0F9FF",
      background: "#020617",
      sidebar: "#1E293B",
      chatBubble: "#38BDF8",
      button: "#0369A1",
    },
  },
];

interface ThemeStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeStudio({ isOpen, onClose }: ThemeStudioProps) {
  const [theme, setTheme] = useState<Theme["colors"]>(() => {
    if (typeof window === "undefined") return PRESET_THEMES[0].colors;
    const saved = localStorage.getItem("phoenix-theme");
    return saved ? JSON.parse(saved) : PRESET_THEMES[0].colors;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("phoenix-theme", JSON.stringify(theme));
    // Apply theme to document
    document.documentElement.style.setProperty("--color-primary", theme.primary);
    document.documentElement.style.setProperty(
      "--color-secondary",
      theme.secondary
    );
    document.documentElement.style.setProperty(
      "--color-background",
      theme.background
    );
    document.documentElement.style.setProperty("--color-sidebar", theme.sidebar);
    document.documentElement.style.setProperty(
      "--color-chat-bubble",
      theme.chatBubble
    );
    document.documentElement.style.setProperty("--color-button", theme.button);
  }, [theme]);

  const handleColorChange = (
    key: keyof Theme["colors"],
    value: string
  ) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const handlePresetSelect = (presetTheme: Theme) => {
    setTheme(presetTheme.colors);
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: `rgba(var(--color-sidebar-rgb), 0.95)`,
            border: `1px solid rgba(255, 255, 255, 0.1)`,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 sticky top-0 backdrop-blur-sm"
            style={{
              borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
              backgroundColor: `rgba(var(--color-sidebar-rgb), 0.95)`,
            }}
          >
            <h2 className="text-xl font-bold text-white">Theme Studio</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Live Preview */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Live Preview
              </h3>
              <div
                className="relative overflow-hidden rounded-lg border border-white/10 p-4"
                style={{ backgroundColor: `rgba(var(--color-background-rgb), 0.5)` }}
              >
                <div className="space-y-2">
                  <div
                    className="h-12 rounded-lg flex items-center px-4 text-white font-medium"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="h-12 rounded-lg flex items-center px-4 text-white text-sm"
                    style={{ backgroundColor: theme.button }}
                  >
                    Secondary Action
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div
                      className="h-8 w-8 rounded-lg"
                      style={{ backgroundColor: theme.secondary }}
                    />
                    <div
                      className="h-8 w-8 rounded-lg"
                      style={{ backgroundColor: theme.chatBubble }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Color Controls */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-4">
                Colors
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(theme).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs text-slate-400 capitalize block mb-2">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) =>
                          handleColorChange(
                            key as keyof Theme["colors"],
                            e.target.value
                          )
                        }
                        className="w-10 h-10 rounded cursor-pointer border border-white/10"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handleColorChange(
                            key as keyof Theme["colors"],
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 rounded text-xs text-slate-200 border border-white/10"
                        style={{ backgroundColor: `rgba(var(--color-background-rgb), 0.5)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preset Themes */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-4">
                Preset Themes
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_THEMES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className="group relative overflow-hidden rounded-lg p-3 transition-all"
                    style={{
                      backgroundColor: `rgba(var(--color-background-rgb), 0.3)`,
                      borderColor: `rgba(255, 255, 255, 0.1)`,
                      border: `1px solid rgba(255, 255, 255, 0.1)`,
                    }}
                  >
                    <div className="flex gap-1 mb-2">
                      <div
                        className="h-6 w-6 rounded"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <div
                        className="h-6 w-6 rounded"
                        style={{ backgroundColor: preset.colors.secondary }}
                      />
                    </div>
                    <p className="text-xs text-slate-300 text-left">
                      {preset.name}
                    </p>
                    {JSON.stringify(theme) === JSON.stringify(preset.colors) && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:opacity-90"
            >
              Apply Theme
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
