"use client";

import { ChevronDown, LogOut, Menu, Moon, Plus, Search } from "lucide-react";
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
}: {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  title: string;
  onLogout: () => void;
}) {
  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 backdrop-blur-md bg-slate-950/40 z-10 flex-shrink-0">
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
          <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-slate-200 hover:bg-white/5 font-semibold outline-none">
            Phoenix 4.0
            <ChevronDown className="w-4 h-4 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-900 border-white/10 text-slate-200 min-w-48 p-1">
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
        >
          <Search className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex text-slate-400 hover:text-white rounded-full"
        >
          <Moon className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Log out"
          onClick={onLogout}
          className="text-slate-400 hover:text-red-400 rounded-full"
        >
          <LogOut className="w-5 h-5" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 border border-white/10 flex-shrink-0" />
      </div>
    </header>
  );
}
