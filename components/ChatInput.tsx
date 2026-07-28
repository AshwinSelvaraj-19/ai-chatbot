"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ChatInput({
  onSend,
  loading,
}: {
  onSend: (text: string) => void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim() || loading) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="px-4 pb-6 pt-2 flex justify-center">
      <div className="w-full max-w-3xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 rounded-[26px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 group-focus-within:border-white/20">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message Phoenix AI..."
            className="w-full min-h-[60px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-200 placeholder:text-slate-500 py-4 px-6 resize-none text-base"
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
                ENTER TO SEND
              </span>
              <Button
                onClick={submit}
                disabled={!value.trim() || loading}
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full transition-all duration-300",
                  value.trim()
                    ? "bg-white text-black hover:bg-slate-200 scale-100"
                    : "bg-white/10 text-slate-500 scale-90"
                )}
              >
                <Send className="w-4 h-4" />
              </Button>
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
