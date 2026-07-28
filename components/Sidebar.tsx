"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  X,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";

interface SidebarProps {
  chats: Conversation[];
  activeId: string | null;
  open: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onSettings?: () => void;
}

export function Sidebar({
  chats,
  activeId,
  open,
  onToggle,
  onSelect,
  onNew,
  onDelete,
  onSettings,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    const query = searchQuery.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.title.toLowerCase().includes(query) ||
        chat.messages.some((msg) =>
          msg.content.toLowerCase().includes(query)
        )
    );
  }, [chats, searchQuery]);
  const content = (
    <aside
      className="relative z-20 flex flex-col backdrop-blur-3xl h-full w-[280px] max-w-[85vw]"
      style={{
        backgroundColor: `rgba(var(--color-sidebar-rgb), 0.3)`,
        borderRight: `1px solid rgba(255, 255, 255, 0.05)`,
      }}
    >
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white truncate">
            Phoenix AI
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-300"
          onClick={onToggle}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-3 py-2">
        <Button
          variant="ghost"
          onClick={onNew}
          className="w-full justify-start gap-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 rounded-xl h-11"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">New Chat</span>
        </Button>
      </div>

      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 hover:bg-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto phoenix-scroll px-3 py-4 space-y-1">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">
          {searchQuery ? "Search Results" : "Recent"}
        </div>
        {filteredChats.length === 0 && (
          <p className="px-3 text-sm text-slate-600">
            {searchQuery ? "No chats found." : "No conversations yet."}
          </p>
        )}
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            className={cn(
              "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
              chat.id === activeId
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <MessageSquare className="w-4 h-4 opacity-40 group-hover:opacity-100 flex-shrink-0" />
            <span className="truncate text-left text-sm flex-1">
              {chat.title || "New chat"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chat.id);
              }}
              aria-label="Delete chat"
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/5">
        <Button
          variant="ghost"
          onClick={onSettings}
          className="w-full justify-start gap-3 text-slate-400 hover:text-white rounded-lg"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:block h-full flex-shrink-0">{content}</div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed top-0 left-0 z-40 h-full"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
