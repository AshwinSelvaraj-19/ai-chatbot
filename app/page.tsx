"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";
import { ChatInput } from "@/components/ChatInput";
import { EmptyState } from "@/components/EmptyState";
import { useChats } from "@/hooks/useChats";

export default function PhoenixPage() {
  const {
    chats,
    activeChat,
    activeId,
    hydrated,
    loading,
    newChat,
    selectChat,
    deleteChat,
    sendMessage,
  } = useChats();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSend = (text: string) => {
    sendMessage(text);
    setSidebarOpen(false);
  };

  const showEmpty = !activeChat || activeChat.messages.length === 0;

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      <Sidebar
        chats={chats}
        activeId={activeId}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onSelect={(id) => {
          selectChat(id);
          setSidebarOpen(false);
        }}
        onNew={() => {
          newChat();
          setSidebarOpen(false);
        }}
        onDelete={deleteChat}
      />

      <main className="flex-1 relative flex flex-col z-10 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(true)}
          onNewChat={() => newChat()}
          title={activeChat?.title ?? "New chat"}
        />
        {hydrated && showEmpty ? (
          <EmptyState onPick={handleSend} />
        ) : (
          <Chat messages={activeChat?.messages ?? []} loading={loading} />
        )}
        <ChatInput onSend={handleSend} loading={loading} />
      </main>
    </div>
  );
}
