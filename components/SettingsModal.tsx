"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Download,
  Trash2,
  LogOut,
  User,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeStudio } from "./ThemeStudio";
import type { Conversation } from "@/lib/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onClearHistory?: () => void;
  chats: Conversation[];
  userEmail?: string;
}

export function SettingsModal({
  isOpen,
  onClose,
  onLogout,
  onClearHistory,
  chats,
  userEmail,
}: SettingsModalProps) {
  const [themeStudioOpen, setThemeStudioOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Phoenix User");

  const handleExportChats = () => {
    const content = chats
      .map((chat) => {
        const title = `=== ${chat.title} ===\n`;
        const messages = chat.messages
          .map(
            (msg) =>
              `[${msg.role.toUpperCase()}]: ${msg.content}\n`
          )
          .join("\n");
        return title + messages;
      })
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phoenix-chats-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all chat history?")) {
      onClearHistory?.();
    }
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
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Profile Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">
                  Profile Information
                </h3>
              </div>
              <div
                className="space-y-3 p-4 rounded-lg"
                style={{
                  backgroundColor: `rgba(var(--color-background-rgb), 0.3)`,
                }}
              >
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Email
                  </label>
                  <p className="text-sm text-slate-200">{userEmail || "Not set"}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm text-slate-200 border border-white/10"
                    style={{ backgroundColor: `rgba(var(--color-background-rgb), 0.5)` }}
                  />
                </div>
              </div>
            </div>

            {/* Theme Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Theme</h3>
              </div>
              <Button
                onClick={() => setThemeStudioOpen(true)}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200"
              >
                Open Theme Studio
              </Button>
            </div>

            {/* Data Section */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                Data Management
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={handleExportChats}
                  className="w-full justify-start gap-3 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200"
                >
                  <Download className="w-4 h-4" />
                  Export Chats (.txt)
                </Button>
                <Button
                  onClick={handleClearHistory}
                  className="w-full justify-start gap-3 bg-slate-800 hover:bg-red-900/20 border border-white/10 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Chat History
                </Button>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-2">
                About Phoenix AI
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Phoenix AI is a powerful chatbot powered by Google Gemini API.
                All conversations are securely stored in the cloud.
              </p>
              <div className="text-xs text-slate-500">
                <p>Version: 4.0</p>
                <p>© 2024 Phoenix AI. All rights reserved.</p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full justify-start gap-3 bg-red-900/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      <ThemeStudio
        isOpen={themeStudioOpen}
        onClose={() => setThemeStudioOpen(false)}
      />
    </>
  );
}
