"use client";

import { useRef, useState } from "react";
import { Paperclip, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (text: string) => void;
  streaming: boolean;
  onStop: () => void;
}

const MIN_HEIGHT = 52;
const MAX_HEIGHT = 260;
const LINE_HEIGHT = 24;

export function ChatInput({ onSend, streaming, onStop }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(
      Math.max(el.scrollHeight, MIN_HEIGHT),
      MAX_HEIGHT
    );
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  };

  const submit = () => {
    if (!value.trim() || streaming) return;
    onSend(value);
    setValue("");
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = `${MIN_HEIGHT}px`;
    });
  };

  return (
    <div className="px-4 pb-6 pt-2 flex justify-center">
      <div className="w-full max-w-3xl relative group">
        <div
          className="absolute -inset-1 rounded-[26px] blur-2xl opacity-0 group-focus-within:opacity-75 transition-all duration-500"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(var(--color-primary-rgb), 0.3), rgba(var(--color-secondary-rgb), 0.3))",
          }}
        />
        <div
          className="relative backdrop-blur-3xl rounded-3xl overflow-hidden transition-all duration-300 group-focus-within:shadow-2xl"
          style={{
            backgroundColor: `rgba(255, 255, 255, 0.07)`,
            border: `1px solid rgba(255, 255, 255, 0.12)`,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1)`,
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autoResize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message  Mind Make AI..."
            rows={1}
            style={{ height: MIN_HEIGHT, lineHeight: `${LINE_HEIGHT}px` }}
            className="w-full bg-transparent border-0 focus:outline-none text-slate-200 placeholder:text-slate-500 pt-4 pb-2 px-6 resize-none text-base phoenix-scroll"
          />
          <div className="flex items-center justify-between px-4 pb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-9 w-9"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-medium tracking-wider hidden sm:block">
                ENTER TO SEND · SHIFT+ENTER FOR NEW LINE
              </span>
              {streaming ? (
                <Button
                  onClick={onStop}
                  size="icon"
                  aria-label="Stop generating"
                  className="h-9 w-9 rounded-full text-white transition-all duration-200 hover:scale-110 active:scale-95"
                  style={{ 
                    backgroundColor: `var(--color-button)`,
                    boxShadow: `0 4px 12px rgba(2, 132, 199, 0.3)`,
                  }}
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </Button>
              ) : (
                <Button
                  onClick={submit}
                  disabled={!value.trim()}
                  size="icon"
                  aria-label="Send message"
                  className={cn(
                    "h-9 w-9 rounded-full transition-all duration-300 hover:scale-110 active:scale-95",
                    value.trim() ? "scale-100" : "scale-90 opacity-50"
                  )}
                  style={
                    value.trim()
                      ? {
                          backgroundColor: `var(--color-button)`,
                          color: "white",
                          boxShadow: `0 4px 12px rgba(2, 132, 199, 0.3)`,
                        }
                      : {
                          backgroundColor: `rgba(255, 255, 255, 0.08)`,
                          color: "#64748b",
                        }
                  }
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-600 mt-4 tracking-wide uppercase">
          Phoenix AI may provide inaccurate info. Check important facts.
        </p>
      </div>
    </div>
  );
}
