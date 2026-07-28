"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, Conversation } from "@/lib/types";

const STORAGE_KEY = "phoenix-chats-v1";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadChats(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useChats() {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loaded = loadChats();
    setChats(loaded);
    setActiveId(loaded[0]?.id ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      // ignore quota / serialization errors
    }
  }, [chats, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (activeId && !chats.some((c) => c.id === activeId)) {
      setActiveId(chats[0]?.id ?? null);
    }
  }, [chats, activeId, hydrated]);

  const activeChat = chats.find((c) => c.id === activeId) ?? null;

  const newChat = useCallback(() => {
    const chat: Conversation = {
      id: uid(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats((prev) => [chat, ...prev]);
    setActiveId(chat.id);
    return chat.id;
  }, []);

  const selectChat = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addMessage = useCallback((chatId: string, message: ChatMessage) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const isFirstUser =
          c.messages.length === 0 && message.role === "user";
        return {
          ...c,
          title: isFirstUser
            ? message.content.slice(0, 42) || "New chat"
            : c.title,
          messages: [...c.messages, message],
          updatedAt: Date.now(),
        };
      })
    );
  }, []);

  const setLastAssistantContent = useCallback(
    (chatId: string, content: string) => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          const messages = [...c.messages];
          const last = messages[messages.length - 1];
          if (last && last.role === "assistant") {
            messages[messages.length - 1] = { ...last, content };
          }
          return { ...c, messages, updatedAt: Date.now() };
        })
      );
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const chatId = activeId ?? newChat();
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      addMessage(chatId, userMsg);
      addMessage(chatId, assistantMsg);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });
        const data = await res.json();
        setLastAssistantContent(chatId, data.response || "No response");
      } catch {
        setLastAssistantContent(chatId, "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [activeId, loading, newChat, addMessage, setLastAssistantContent]
  );

  return {
    chats,
    activeChat,
    activeId,
    hydrated,
    loading,
    newChat,
    selectChat,
    deleteChat,
    sendMessage,
  };
}
