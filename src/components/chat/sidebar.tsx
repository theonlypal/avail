"use client";

import { useCallback, useMemo, useState } from "react";
import { SendHorizonal, Sparkles } from "lucide-react";
import { v4 as uuid } from "uuid";
import type { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { CollapseButton } from "./collapse-button";
import { ApiStatusIndicator } from "./api-status-indicator";

const cannedPrompts = [
  "What is AVAIL and how does it work?",
  "What services does AVAIL offer?",
  "How much does AVAIL cost?",
  "How can AVAIL help my business?",
];

type ChatSidebarProps = {
  variant?: "desktop" | "sheet";
  isCollapsed?: boolean;
  onToggle?: () => void;
};

export function ChatSidebar({ variant = "desktop", isCollapsed: externalIsCollapsed, onToggle: externalOnToggle }: ChatSidebarProps) {
  // Use external state if provided (from app-shell), otherwise use internal hook
  const internalHook = useSidebarCollapse();
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalHook.isCollapsed;
  const toggle = externalOnToggle || internalHook.toggle;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "system",
      role: "assistant",
      content:
        "Hi! I'm AVAIL Copilot. Ask me anything about AVAIL's AI automation services, pricing, features, or how we can help your business grow.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      const message: ChatMessage = {
        id: uuid(),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, message, { id: `${message.id}-loading`, role: "assistant", content: "…", createdAt: new Date().toISOString(), loading: true }]);
      setInput("");
      setIsStreaming(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const reader = response.body?.getReader();
      if (!reader) {
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let assistantContent = "";
      let action: ChatMessage["action"];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const events = chunk
          .split("\n\n")
          .map((line) => line.replace(/^data:\s*/, "").trim())
          .filter(Boolean);
        for (const event of events) {
          try {
            const payload = JSON.parse(event);
            if (payload?.result?.text) {
              assistantContent = payload.result.text;
              if (payload.result.action) {
                action = payload.result.action;
              }
            }
          } catch (error) {
            console.warn("Failed to parse chat chunk", error);
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.loading
            ? {
                ...msg,
                loading: false,
                content: assistantContent || "Done.",
                action,
              }
            : msg
        )
      );
      setIsStreaming(false);
    },
    [isStreaming]
  );

  const quickActions = useMemo(
    () =>
      cannedPrompts.map((prompt) => (
        <Button
          key={prompt}
          size="sm"
          variant="secondary"
          className="justify-start"
          onClick={() => sendMessage(prompt)}
        >
          <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
          {prompt}
        </Button>
      )),
    [sendMessage]
  );

  const Container = variant === "desktop" ? "aside" : "div";

  // Don't render collapsed desktop version (CopilotIconBar handles that)
  if (variant === "desktop" && isCollapsed) {
    return null;
  }

  return (
    <Container
      className={cn(
        "flex flex-col border-white/10 bg-slate-950/50 backdrop-blur-xl transition-all duration-200 ease-in-out",
        variant === "desktop"
          ? "hidden h-full flex-shrink-0 border-l xl:flex"
          : "h-full w-full border-l-0",
        variant === "desktop" && !isCollapsed ? "w-[360px]" : ""
      )}
      style={
        variant === "desktop" && !isCollapsed
          ? { animation: "slideIn 200ms cubic-bezier(0.4, 0, 0.2, 1)" }
          : undefined
      }
    >
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">AVAIL Copilot</p>
            <h3 className="text-lg font-semibold text-white">Command Center</h3>
          </div>
          {variant === "desktop" && (
            <CollapseButton isCollapsed={isCollapsed} onToggle={toggle} />
          )}
        </div>
        <div className="mt-2">
          <ApiStatusIndicator />
        </div>
      </div>
      <ScrollArea className="h-full flex-1 px-4 py-3">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.role === "user" ? "text-right" : "text-left"}
            >
              <div
                className={`inline-flex max-w-full flex-col rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                    : "bg-white/5 text-slate-200 border border-white/10"
                }`}
              >
                <span>{msg.content}</span>
                {msg.action && (
                  <span className="mt-1 text-xs text-slate-400">
                    Action: {msg.action.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-2">{quickActions}</div>
      </ScrollArea>
      <form
        className="border-t border-white/10 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(input);
        }}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-3 py-2">
          <Input
            className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0"
            placeholder="Ask AVAIL to take action…"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isStreaming}
          />
          <Button type="submit" size="icon" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" disabled={isStreaming}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Container>
  );
}
