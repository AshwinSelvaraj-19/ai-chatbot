"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const lang = language || "text";

  return (
    <div className="group/code relative my-3 rounded-xl overflow-hidden border border-white/10 bg-[#282c34]">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
          {lang}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto phoenix-scroll text-sm">
        <SyntaxHighlighter
          language={lang}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.85rem",
          }}
          codeTagProps={{
            style: { fontFamily: "var(--font-mono, monospace)" },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
