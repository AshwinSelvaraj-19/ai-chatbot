"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";
import { ChatInput } from "@/components/ChatInput";
import { EmptyState } from "@/components/EmptyState";
import { SettingsModal } from "@/components/SettingsModal";
import { ThemeStudio } from "@/components/ThemeStudio";
import { useChats } from "@/hooks/useChats";
import { supabase } from "@/lib/supabase";

export default function PhoenixPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeStudioOpen, setThemeStudioOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session?.user) {
        router.replace("/login");
        return;
      }
      setUserId(data.session.user.id);
      setUserEmail(data.session.user.email || null);
      setAuthChecked(true);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          router.replace("/login");
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const {
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
  } = useChats(userId);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSend = (text: string) => {
    sendMessage(text);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleClearHistory = async () => {
    if (!userId) return;
    await supabase.from("chats").delete().eq("user_id", userId);
    // Reload the page to refresh chats
    window.location.reload();
  };

  if (!authChecked) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  const showEmpty = !activeChat || activeChat.messages.length === 0;

  const streamingId =
    activeChat && streaming
      ? activeChat.messages[activeChat.messages.length - 1]?.id ?? null
      : null;

  return (
    <div
      className="flex h-screen w-full text-slate-200 overflow-hidden"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]"
          style={{ backgroundColor: `rgba(var(--color-primary-rgb), 0.1)` }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]"
          style={{ backgroundColor: `rgba(var(--color-secondary-rgb), 0.1)` }}
        />
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
        onSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 relative flex flex-col z-10 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(true)}
          onNewChat={() => newChat()}
          title={activeChat?.title ?? "New chat"}
          onLogout={handleLogout}
          onThemeStudio={() => setThemeStudioOpen(true)}
          onSettings={() => setSettingsOpen(true)}
          userEmail={userEmail || undefined}
        />
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        ) : showEmpty ? (
          <EmptyState onPick={handleSend} />
        ) : (
          <Chat
            messages={activeChat?.messages ?? []}
            streaming={streaming}
            streamingId={streamingId}
            onRegenerate={regenerate}
            onEdit={editMessage}
          />
        )}
        <ChatInput
          onSend={handleSend}
          streaming={streaming}
          onStop={stopGeneration}
        />
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLogout={handleLogout}
        onClearHistory={handleClearHistory}
        chats={chats}
        userEmail={userEmail || undefined}
      />

      <ThemeStudio
        isOpen={themeStudioOpen}
        onClose={() => setThemeStudioOpen(false)}
      />
    </div>
  );
}
