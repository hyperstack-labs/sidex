"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAIAssistant, quickActions } from "@/components/ai/use-ai-assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FloatingAIAssistant() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const { messages, inputValue, setInputValue, isTyping, handleQuickAction, handleSendMessage } =
    useAIAssistant();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <div className="fixed bottom-5 right-5 z-50" role="group" aria-label="AI assistant">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            aria-label="Open AI assistant"
            variant="default"
            size="icon"
            className="relative size-12 rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/20 ring-1 ring-accent/30 transition-transform hover:bg-accent/90 hover:scale-[1.03] animate-pulse-glow"
          >
            <MessageCircle aria-hidden="true" className="size-5" />
            <span className="sr-only">Open AI assistant</span>
            <span className="pointer-events-none absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-background" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="top"
          sideOffset={12}
          className="w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card/70 p-0 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex h-[min(560px,calc(100vh-8rem))] min-h-0 flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex size-10 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/25">
                    <MessageCircle aria-hidden="true" className="size-5 text-accent" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-accent ring-2 ring-background" />
                </div>

                <div className="leading-tight">
                  <div className="text-sm font-semibold">SidEx Intelligence</div>
                  <div className="text-xs text-muted-foreground">AI Assistant</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => {
                    setOpen(false);
                    router.push("/ai");
                  }}
                >
                  Open
                </Button>
                <Button
                  type="button"
                  aria-label="Close"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setOpen(false)}
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex shrink-0 gap-2 overflow-x-auto px-4 py-2">
              {quickActions.map((action) => (
                <Button
                  key={action.action}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 gap-2 border-primary/15 bg-background/40"
                  onClick={() => handleQuickAction(action.action)}
                  aria-label={action.label}
                >
                  <action.icon aria-hidden="true" className="size-4 text-primary" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <ScrollArea className="min-h-0 flex-1 px-4">
              <div className="space-y-3 py-3">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-muted/60 text-foreground"
                        }`}
                      >
                        <div className="whitespace-pre-line">{message.content}</div>
                        <div className="mt-1 text-[11px] opacity-60">
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
                    <div className="rounded-2xl border border-border bg-muted/60 px-3 py-2">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                          className="size-2 rounded-full bg-primary"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="size-2 rounded-full bg-primary"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="size-2 rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-border bg-background/40 p-3">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask anything…"
                  className="h-10 bg-input border-primary/15 focus:border-primary"
                />
                <Button
                  type="button"
                  aria-label="Send message"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="h-10 px-3"
                >
                  <Send aria-hidden="true" className="size-4" />
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                AI responses are for guidance only.
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
