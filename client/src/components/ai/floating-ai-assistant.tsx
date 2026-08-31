"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, ArrowUpRight, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAIAssistant, quickActions } from "@/components/ai/use-ai-assistant";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Minimalist Sharia AI Copilot.
 * Ultra-clean typography, zero redundant icons or badge containers, matching Gotrade/Linear design.
 */
export function FloatingAIAssistant() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const { messages, inputValue, setInputValue, isTyping, handleQuickAction, handleSendMessage } =
    useAIAssistant();

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <div className="fixed bottom-20 right-6 sm:right-10 z-40">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open AI Assistant"
            className="group flex items-center gap-2.5 bg-transparent border-0 shadow-none text-zinc-400 hover:text-white transition-colors cursor-pointer outline-none p-1 select-none"
          >
            <span className="text-base font-semibold tracking-tight">Ask AI</span>
            <span className="text-xs font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">
              ⌘K
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="top"
          sideOffset={14}
          className="w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 p-0 shadow-2xl backdrop-blur-3xl"
        >
          <div className="flex h-[min(500px,calc(100vh-10rem))] min-h-0 flex-col">
            {/* Header: Pure Minimalist Typography */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-zinc-950">
              <span className="text-sm font-semibold text-white tracking-tight">SidEx AI</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/ai");
                  }}
                  className="flex items-center gap-0.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-mono"
                >
                  <span>Full View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompts: Clean Text Pills */}
            <div className="flex shrink-0 gap-1.5 overflow-x-auto px-4 py-2.5 border-b border-white/5 bg-zinc-900/30 scrollbar-none">
              {quickActions.map((action) => (
                <button
                  key={action.action}
                  type="button"
                  onClick={() => handleQuickAction(action.action)}
                  className="px-3 py-1 rounded-full border border-white/10 hover:border-white/20 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium shrink-0 transition-all cursor-pointer"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Messages Feed */}
            <ScrollArea className="min-h-0 flex-1 px-4">
              <div className="space-y-3 py-3">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                          message.type === "user"
                            ? "bg-white text-zinc-950 font-medium"
                            : "border border-white/5 bg-zinc-900/70 text-zinc-200"
                        }`}
                      >
                        <div className="whitespace-pre-line">{message.content}</div>
                        <div className="mt-1 text-[10px] font-mono opacity-40 text-right">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="rounded-xl border border-white/5 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-500 font-mono">
                      Thinking…
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input Bar */}
            <div className="shrink-0 border-t border-white/5 bg-zinc-950 p-3">
              <div className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 focus-within:border-white/20 transition-colors">
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask a question..."
                  className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none"
                />
                <button
                  type="button"
                  aria-label="Send message"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
