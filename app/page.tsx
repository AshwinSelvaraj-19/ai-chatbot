"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  Paperclip, 
  Send, 
  ChevronDown, 
  Moon, 
  Sparkles,
  Command,
  LayoutGrid,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 280;

export default function PhoenixPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
  { role: "user" | "assistant"; content: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const sendMessage = async () => {
  if (!message.trim() || loading) return;

  const userMessage = message;

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      content: userMessage,
    },
  ]);

  setMessage("");
  setLoading(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
      }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.response || "No response",
      },
    ]);
  } catch (error) {
    console.error(error);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Something went wrong.",
      },
    ]);
  }

  setLoading(false);
};
  const recentChats = [
    "Architectural analysis for Neo-Tokyo",
    "Tailwind CSS v4 implementation",
    "React Server Components best practices",
    "Phoenix AI Beta Feedback",
  ];

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside 
        style={{ width: SIDEBAR_WIDTH }}
        className="relative z-20 flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-3xl h-full transition-all duration-300"
      >
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Phoenix AI</span>
        </div>

        <div className="px-3 py-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 rounded-xl h-11 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Chat</span>
            <div className="ml-auto flex items-center gap-1 opacity-40">
              <Command className="w-3 h-3" />
              <span className="text-[10px]">N</span>
            </div>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Recent</div>
          {recentChats.map((chat, i) => (
            <motion.button
              key={i}
              whileHover={{ x: 4 }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
            >
              <MessageSquare className="w-4 h-4 opacity-40 group-hover:opacity-100" />
              <span className="truncate text-left">{chat}</span>
            </motion.button>
          ))}
        </div>

        <div className="p-3 border-t border-white/5 space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white rounded-lg">
            <LayoutGrid className="w-4 h-4" />
            <span className="text-sm">Explore GPTs</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white rounded-lg">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col z-10">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 backdrop-blur-md bg-slate-950/40">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-slate-200 hover:bg-white/5 font-semibold">
              Phoenix 4.0
              <ChevronDown className="w-4 h-4 opacity-50" />
            </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-white/10 text-slate-200 min-w-48 p-1">
                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer rounded-lg p-3">
                  <div className="flex flex-col">
                    <span className="font-medium">Phoenix 4.0</span>
                    <span className="text-xs text-slate-500">Most capable model for complex tasks</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer rounded-lg p-3">
                  <div className="flex flex-col">
                    <span className="font-medium">Phoenix Lite</span>
                    <span className="text-xs text-slate-500">Fast and lightweight for daily tasks</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full">
              <Moon className="w-5 h-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 border border-white/10" />
          </div>
        </header>

        {/* Chat Canvas */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 relative">
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-6 max-w-2xl"
            >
              <div className="inline-flex h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 border border-white/10 items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                How can <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-400">Phoenix</span> help today?
              </h2>
              <div className="grid grid-cols-2 gap-3 mt-8">
                {[
                  "Design a sleek login UI",
                  "Explain Quantum Physics",
                  "Write a Python script",
                  "Plan a 3-day trip"
                ].map((hint, i) => (
                  <button 
                    key={i}
                    className="p-4 text-left rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                  >
                    <p className="text-sm font-medium text-slate-300 group-hover:text-white truncate">{hint}</p>
                    <p className="text-xs text-slate-500 mt-1">Suggested prompt</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className="p-6 md:p-10 flex justify-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-3xl relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 rounded-[26px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 group-focus-within:border-white/20">
              <Textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }}
                placeholder="Message Phoenix AI..." 
                className="w-full min-h-[60px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-200 placeholder:text-slate-500 py-4 px-6 resize-none scrollbar-none text-base"
              />
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-9 w-9">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-medium tracking-wider">ENTER TO SEND</span>
                  <Button
  onClick={sendMessage}
  disabled={!message.trim() || loading}
                    size="icon" 
                    className={cn(
                      "h-9 w-9 rounded-full transition-all duration-300",
                      message.trim() 
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
          </motion.div>
        </div>
      </main>
    </div>
  );
}