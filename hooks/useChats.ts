"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

function toApiMessages(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));
}

export function useChats() {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // One-time hydration of chats from localStorage. SSR-safe: runs only in the browser.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const loaded = loadChats();
    setChats(loaded);
    setActiveId(loaded[0]?.id ?? null);
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      // ignore quota / serialization errors
    }
  }, [chats, hydrated]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

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
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === activeId) {
        setActiveId(next[0]?.id ?? null);
      }
      return next;
    });
  }, [activeId]);

  const updateMessage = useCallback(
    (chatId: string, msgId: string, content: string) => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId ? { ...m, content } : m
            ),
            updatedAt: Date.now(),
          };
        })
      );
    },
    []
  );

  const appendToMessage = useCallback(
    (chatId: string, msgId: string, chunk: string) => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId ? { ...m, content: m.content + chunk } : m
            ),
            updatedAt: Date.now(),
          };
        })
      );
    },
    []
  );

  const setMessages = useCallback(
    (chatId: string, messages: ChatMessage[]) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages, updatedAt: Date.now() }
            : c
        )
      );
    },
    []
  );

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

  const runStream = useCallback(
    async (chatId: string, history: ChatMessage[], assistantId: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: toApiMessages(history) }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          updateMessage(chatId, assistantId, "Something went wrong.");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          if (text) appendToMessage(chatId, assistantId, text);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          appendToMessage(chatId, assistantId, "\n\n*Connection interrupted.*");
        }
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [appendToMessage, updateMessage]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

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

      const history = activeChat
        ? [...activeChat.messages, userMsg]
        : [userMsg];

      addMessage(chatId, userMsg);
      addMessage(chatId, assistantMsg);

      await runStream(chatId, history, assistantMsg.id);
    },
    [activeId, activeChat, streaming, newChat, addMessage, runStream]
  );

  const regenerate = useCallback(
    async (assistantId: string) => {
      if (!activeChat || streaming) return;
      const idx = activeChat.messages.findIndex(
        (m) => m.id === assistantId
      );
      if (idx === -1) return;

      const history = activeChat.messages.slice(0, idx);
      const newAssistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      setMessages(activeChat.id, [...history, newAssistant]);
      await runStream(activeChat.id, history, newAssistant.id);
    },
    [activeChat, streaming, setMessages, runStream]
  );

  const editMessage = useCallback(
    async (userMsgId: string, newText: string) => {
      if (!activeChat || streaming) return;
      const trimmed = newText.trim();
      if (!trimmed) return;

      const idx = activeChat.messages.findIndex((m) => m.id === userMsgId);
      if (idx === -1) return;

      const editedUser: ChatMessage = {
        ...activeChat.messages[idx],
        content: trimmed,
        createdAt: Date.now(),
      };
      const history = [
        ...activeChat.messages.slice(0, idx),
        editedUser,
      ];
      const newAssistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      setMessages(activeChat.id, [...history, newAssistant]);
      await runStream(activeChat.id, history, newAssistant.id);
    },
    [activeChat, streaming, setMessages, runStream]
  );

  return {
    chats,
    activeChat,
    activeId,
    hydrated,
    streaming,
    newChat,
    selectChat,
    deleteChat,
    sendMessage,
    stopGeneration,
    regenerate,
    editMessage,
  };
}
