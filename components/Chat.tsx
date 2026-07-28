"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Message } from "./Message";
import type { ChatMessage } from "@/lib/types";

export function Chat({
  messages,
  loading,
}: {
  messages: ChatMessage[];
  loading: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto phoenix-scroll">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
}
