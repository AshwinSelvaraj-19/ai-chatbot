"use client";

import { ChevronDown, LogOut, Menu, Palette, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({
  onToggleSidebar,
  onNewChat,
  title,
  onLogout,
  onThemeStudio,
  onSettings,
  userEmail,
}: {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  title: string;
  onLogout: () => void;
  onThemeStudio?: () => void;
  onSettings?: () => void;
  userEmail?: string;
}) {
  const userInitials = userEmail
    ? userEmail
        .split("@")[0]
        .split(".")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";
  return (
    <header
      className="h-16 flex items-center justify-between px-4 md:px-6 backdrop-blur-md z-10 flex-shrink-0"
      style={{
        backgroundColor: `rgba(var(--color-background-rgb), 0.4)`,
        borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-300"
          onClick={onToggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-slate-200 font-semibold outline-none transition-colors hover:bg-white/5">
            Phoenix 4.0
            <ChevronDown className="w-4 h-4 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="text-slate-200 min-w-48 p-1"
            style={{
              backgroundColor: `rgba(var(--color-sidebar-rgb), 0.95)`,
              borderColor: `rgba(255, 255, 255, 0.1)`,
            }}
          >
            <DropdownMenuItem className="focus:bg-white/5 cursor-pointer rounded-lg p-3">
              <div className="flex flex-col">
                <span className="font-medium">Phoenix 4.0</span>
                <span className="text-xs text-slate-500">
                  Most capable model for complex tasks
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-white/5 cursor-pointer rounded-lg p-3">
              <div className="flex flex-col">
                <span className="font-medium">Phoenix Lite</span>
                <span className="text-xs text-slate-500">
                  Fast and lightweight for daily tasks
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <span className="hidden md:block text-sm text-slate-400 truncate max-w-[200px]">
          {title}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white rounded-full"
          onClick={onNewChat}
        >
          <Plus className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex text-slate-400 hover:text-white rounded-full"
          onClick={onThemeStudio}
        >
          <Palette className="w-5 h-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-8 rounded-full border border-white/10 flex-shrink-0 flex items-center justify-center text-white font-semibold text-xs hover:opacity-80 transition-opacity cursor-pointer"
            style={{ backgroundColor: `var(--color-primary)` }}
          >
            {userInitials}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="text-slate-200 min-w-40 p-1"
            style={{
              backgroundColor: `rgba(var(--color-sidebar-rgb), 0.95)`,
              borderColor: `rgba(255, 255, 255, 0.1)`,
            }}
          >
            <DropdownMenuItem
              onClick={onSettings}
              className="focus:bg-white/5 cursor-pointer rounded-lg p-3"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onThemeStudio}
              className="focus:bg-white/5 cursor-pointer rounded-lg p-3"
            >
              <Palette className="w-4 h-4 mr-2" />
              <span>Theme Studio</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onLogout}
              className="focus:bg-white/5 cursor-pointer rounded-lg p-3 text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
