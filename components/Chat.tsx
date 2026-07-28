"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Message } from "./Message";
import type { ChatMessage } from "@/lib/types";

interface ChatProps {
  messages: ChatMessage[];
  streaming: boolean;
  streamingId: string | null;
  onRegenerate: (assistantId: string) => void;
  onEdit: (userMsgId: string, newText: string) => void;
}

export function Chat({
  messages,
  streaming,
  streamingId,
  onRegenerate,
  onEdit,
}: ChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      pinnedRef.current = distance < 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pinnedRef.current) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streaming]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto phoenix-scroll">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <Message
              key={m.id}
              message={m}
              isStreaming={streaming && m.id === streamingId}
              onRegenerate={onRegenerate}
              onEdit={onEdit}
            />
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
}
