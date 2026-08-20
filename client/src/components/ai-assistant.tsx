"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CornerDownLeft } from "lucide-react";
import { quickActions, useAIAssistant } from "@/components/ai/use-ai-assistant";

/**
 * Ultra-Clean Unboxed Sharia AI Assistant View.
 * Zero box-in-a-box nesting, large crisp typography, and fluid conversation layout.
 */
export function AIAssistant() {
  const { messages, inputValue, setInputValue, isTyping, handleQuickAction, handleSendMessage } =
    useAIAssistant();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-14rem)] space-y-8 pb-12">
      {/* 1. Unboxed Minimal Header */}
      <section className="space-y-1.5 pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">SidEx AI</h1>
        <p className="text-sm text-zinc-400">
          Sharia financial advisory, real-time Zakat calculations, and on-chain verification.
        </p>
      </section>

      {/* 2. Quick Action Prompts - Clean Horizontal Text Pills */}
      <section className="flex flex-wrap gap-2 pt-1">
        {quickActions.map((action) => (
          <button
            key={action.action}
            type="button"
            onClick={() => handleQuickAction(action.action)}
            className="px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/25 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            {action.label}
          </button>
        ))}
      </section>

      {/* 3. Fluid Unboxed Conversation Feed */}
      <div className="flex-1 space-y-5 min-h-[280px]">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.type === "user"
                    ? "bg-white text-zinc-950 font-medium shadow-md"
                    : "border border-white/10 bg-zinc-900/70 text-zinc-200 shadow-sm"
                }`}
              >
                <div className="whitespace-pre-line">{message.content}</div>
                <div className="mt-1.5 text-[10px] font-mono opacity-40 text-right">
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
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 px-4 py-2.5 text-xs text-zinc-400 font-mono">
              Thinking…
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Sleek Command Input Bar */}
      <section className="sticky bottom-4 pt-2">
        <div className="flex items-center gap-3 rounded-2xl bg-zinc-900/90 border border-white/15 focus-within:border-white/30 px-4 py-3 backdrop-blur-2xl shadow-2xl transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask anything about Sharia rules, Zakat, or token swaps..."
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
          <button
            type="button"
            aria-label="Send Message"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
