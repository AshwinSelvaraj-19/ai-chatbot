"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { TypingIndicator } from "./TypingIndicator";

export function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isWaiting = !isUser && message.content.trim() === "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex w-full gap-3 md:gap-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={cn("max-w-[85%] md:max-w-[75%]", isUser && "order-2")}>
        {isWaiting ? (
          <TypingIndicator />
        ) : (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
              isUser
                ? "bg-indigo-600 text-white rounded-br-md"
                : "bg-white/5 border border-white/10 text-slate-200 rounded-bl-md"
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div className="prose-chat">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700 border border-white/10 flex items-center justify-center">
          <User className="w-4 h-4 text-slate-300" />
        </div>
      )}
    </motion.div>
  );
}
