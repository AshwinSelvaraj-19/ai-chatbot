"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Pencil, RefreshCw, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { TypingIndicator } from "./TypingIndicator";
import { CodeBlock } from "./CodeBlock";

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onRegenerate?: (assistantId: string) => void;
  onEdit?: (userMsgId: string, newText: string) => void;
}

export function Message({
  message,
  isStreaming = false,
  onRegenerate,
  onEdit,
}: MessageProps) {
  const isUser = message.role === "user";
  const isWaiting = !isUser && message.content.trim() === "" && isStreaming;

  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const submitEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed || !onEdit) return;
    onEdit(message.id, trimmed);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(message.content);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group/msg flex w-full gap-3 md:gap-4",
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
        ) : editing && isUser ? (
          <div
            className="rounded-2xl p-3 border"
            style={{
              backgroundColor: `rgba(var(--color-primary-rgb), 0.2)`,
              borderColor: `rgba(var(--color-primary-rgb), 0.3)`,
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              rows={Math.min(Math.max(draft.split("\n").length, 1), 10)}
              className="w-full bg-transparent text-white text-sm leading-relaxed resize-none outline-none min-h-[40px] max-h-[240px] overflow-y-auto phoenix-scroll"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={cancelEdit}
                className="px-3 py-1 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="px-3 py-1 text-xs font-medium bg-white text-black rounded-lg hover:bg-slate-200 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed text-white backdrop-blur-sm transition-all duration-200",
                isUser 
                  ? "rounded-br-md shadow-lg" 
                  : "rounded-bl-md border border-white/10 text-slate-200 hover:bg-white/[0.07]"
              )}
              style={
                isUser
                  ? { 
                    backgroundColor: `var(--color-primary)`,
                    boxShadow: `0 4px 16px rgba(14, 165, 233, 0.2)`,
                  }
                  : {
                      backgroundColor: `rgba(255, 255, 255, 0.05)`,
                    }
              }
            >
              {isUser ? (
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              ) : (
                <div className="prose-chat">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const value = String(children).replace(/\n$/, "");
                        if (match) {
                          return (
                            <CodeBlock
                              language={match[1]}
                              value={value}
                            />
                          );
                        }
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 bg-slate-300 animate-pulse align-middle rounded-sm" />
                  )}
                </div>
              )}
            </div>

            {!isStreaming && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-1.5 opacity-0 group-hover/msg:opacity-100 transition-all duration-200",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                {isUser ? (
                  <button
                    onClick={() => {
                      setDraft(message.content);
                      setEditing(true);
                    }}
                    aria-label="Edit message"
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded-md hover:bg-white/8 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCopy}
                      aria-label="Copy response"
                      className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded-md hover:bg-white/8 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    {onRegenerate && (
                      <button
                        onClick={() => onRegenerate(message.id)}
                        aria-label="Regenerate response"
                        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded-md hover:bg-white/8 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </>
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
