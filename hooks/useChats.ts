"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ChatMessage, Conversation } from "@/lib/types";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toApiMessages(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));
}

interface DbChat {
  id: string;
  title: string;
  created_at: string;
}

interface DbMessage {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  created_at: string;
}

export function useChats(userId: string | null) {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const skipPersistRef = useRef(false);

  // Load chats + messages for the signed-in user
  const loadChats = useCallback(async (uid: string) => {
    setLoading(true);
    const { data: dbChats } = await supabase
      .from("chats")
      .select("id, title, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!dbChats || dbChats.length === 0) {
      setChats([]);
      setActiveId(null);
      setLoading(false);
      return;
    }

    const chatIds = dbChats.map((c: DbChat) => c.id);
    const { data: dbMessages } = await supabase
      .from("messages")
      .select("id, chat_id, role, content, created_at")
      .in("chat_id", chatIds)
      .order("created_at", { ascending: true });

    const messagesByChat = new Map<string, ChatMessage[]>();
    for (const m of (dbMessages ?? []) as DbMessage[]) {
      const arr = messagesByChat.get(m.chat_id) ?? [];
      arr.push({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        createdAt: new Date(m.created_at).getTime(),
      });
      messagesByChat.set(m.chat_id, arr);
    }

    const loaded: Conversation[] = dbChats.map((c: DbChat) => ({
      id: c.id,
      title: c.title,
      messages: messagesByChat.get(c.id) ?? [],
      createdAt: new Date(c.created_at).getTime(),
      updatedAt: new Date(c.created_at).getTime(),
    }));

    setChats(loaded);
    setActiveId(loaded[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      await loadChats(userId);
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [userId, loadChats]);

  const activeChat = chats.find((c) => c.id === activeId) ?? null;

  const newChat = useCallback(() => {
    // Create locally only; persisted on first message (when we have a title).
    const chat: Conversation = {
      id: uid(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    skipPersistRef.current = true;
    setChats((prev) => [chat, ...prev]);
    setActiveId(chat.id);
    return chat.id;
  }, []);

  const selectChat = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteChat = useCallback(
    async (id: string) => {
      setChats((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (id === activeId) setActiveId(next[0]?.id ?? null);
        return next;
      });
      await supabase.from("chats").delete().eq("id", id);
    },
    [activeId]
  );

  const persistMessage = useCallback(
    async (chatId: string, msg: ChatMessage) => {
      await supabase.from("messages").insert({
        id: msg.id,
        chat_id: chatId,
        role: msg.role,
        content: msg.content,
      });
    },
    []
  );

  const updateMessageContent = useCallback(
    async (msgId: string, content: string) => {
      await supabase
        .from("messages")
        .update({ content })
        .eq("id", msgId);
    },
    []
  );

  const deleteMessagesAfter = useCallback(
    async (chatId: string, keepCount: number) => {
      const { data } = await supabase
        .from("messages")
        .select("id")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })
        .range(keepCount, Number.MAX_SAFE_INTEGER);
      if (data && data.length > 0) {
        const ids = data.map((d) => d.id);
        await supabase.from("messages").delete().in("id", ids);
      }
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

  const addMessage = useCallback(
    (chatId: string, message: ChatMessage) => {
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
    },
    []
  );

  const setMessages = useCallback(
    (chatId: string, messages: ChatMessage[]) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, messages, updatedAt: Date.now() } : c
        )
      );
    },
    []
  );

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
          appendToMessage(chatId, assistantId, "Something went wrong.");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          if (text) {
            full += text;
            appendToMessage(chatId, assistantId, text);
          }
        }

        await updateMessageContent(assistantId, full);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          appendToMessage(chatId, assistantId, "\n\n*Connection interrupted.*");
        }
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [appendToMessage, updateMessageContent]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming || !userId) return;

      let chatId = activeId;
      let isNew = false;
      if (!chatId) {
        chatId = newChat();
        isNew = true;
      } else if (!chats.some((c) => c.id === chatId)) {
        chatId = newChat();
        isNew = true;
      }

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

      // Persist chat (if new) then the user message.
      const title = trimmed.slice(0, 42) || "New chat";
      if (isNew) {
        await supabase.from("chats").insert({
          id: chatId,
          user_id: userId,
          title,
        });
      } else {
        await supabase.from("chats").update({ title }).eq("id", chatId).eq(
          "user_id",
          userId
        );
      }
      await persistMessage(chatId, userMsg);
      await persistMessage(chatId, assistantMsg);

      await runStream(chatId, history, assistantMsg.id);
    },
    [
      activeId,
      activeChat,
      chats,
      streaming,
      userId,
      newChat,
      addMessage,
      persistMessage,
      runStream,
    ]
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

      // Remove old messages after idx from DB, then insert the new assistant placeholder.
      await deleteMessagesAfter(activeChat.id, idx);
      await persistMessage(activeChat.id, newAssistant);

      await runStream(activeChat.id, history, newAssistant.id);
    },
    [
      activeChat,
      streaming,
      setMessages,
      deleteMessagesAfter,
      persistMessage,
      runStream,
    ]
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

      await updateMessageContent(userMsgId, trimmed);
      await deleteMessagesAfter(activeChat.id, idx + 1);
      await persistMessage(activeChat.id, newAssistant);

      await runStream(activeChat.id, history, newAssistant.id);
    },
    [
      activeChat,
      streaming,
      setMessages,
      updateMessageContent,
      deleteMessagesAfter,
      persistMessage,
      runStream,
    ]
  );

  return {
    chats,
    activeChat,
    activeId,
    loading,
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
