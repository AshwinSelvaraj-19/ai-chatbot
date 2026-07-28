"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  { title: "Design a sleek login UI", subtitle: "UI / UX" },
  { title: "Explain Quantum Physics", subtitle: "Learn" },
  { title: "Write a Python script", subtitle: "Code" },
  { title: "Plan a 3-day trip", subtitle: "Travel" },
];

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-6 max-w-2xl w-full"
      >
        <div className="inline-flex h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 border border-white/10 items-center justify-center mb-4">
          <Sparkles className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          How can{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-400">
            Phoenix
          </span>{" "}
          help today?
        </h2>
        <div className="grid grid-cols-2 gap-3 mt-8">
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s.title}
              onClick={() => onPick(s.title)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 text-left rounded-2xl border border-white/8 bg-white/5 hover:bg-white/10 hover:border-white/15 transition-all duration-200 group backdrop-blur-sm"
            >
              <p className="text-sm font-medium text-slate-300 group-hover:text-white truncate transition-colors">
                {s.title}
              </p>
              <p className="text-xs text-slate-500 mt-1 transition-colors">{s.subtitle}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
