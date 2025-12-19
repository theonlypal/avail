"use client";

import { useState, useEffect, useRef } from "react";
import {
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Filter,
  Send,
  ArrowLeft,
  User,
  Clock,
  ChevronDown,
  RefreshCw,
  MoreVertical,
} from "lucide-react";

interface Communication {
  id: string;
  team_id: string;
  type: "sms" | "email" | "call";
  direction: "inbound" | "outbound";
  contact_id?: string;
  lead_id?: string;
  deal_id?: string;
  from_address?: string;
  to_address?: string;
  subject?: string;
  body?: string;
  status?: string;
  external_id?: string;
  created_at: string;
  // Joined data
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

interface ConversationThread {
  contact_id: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  last_message: Communication;
  unread_count: number;
  messages: Communication[];
}

export default function InboxPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sms" | "email" | "call">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCommunications();
  }, [filter]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages]);

  async function fetchCommunications() {
    setLoading(true);
    try {
      let url = "/api/communications?team_id=default-team";
      if (filter !== "all") {
        url += `&type=${filter}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCommunications(data.communications || []);
        // Group into threads
        groupIntoThreads(data.communications || []);
      }
    } catch (error) {
      console.error("Failed to fetch communications:", error);
    } finally {
      setLoading(false);
    }
  }

  function groupIntoThreads(comms: Communication[]) {
    const threadMap = new Map<string, ConversationThread>();

    comms.forEach((comm) => {
      const key = comm.contact_id || comm.from_address || comm.to_address || "unknown";

      if (!threadMap.has(key)) {
        threadMap.set(key, {
          contact_id: comm.contact_id || key,
          contact_name: comm.contact_name || comm.from_address || comm.to_address || "Unknown",
          contact_email: comm.contact_email,
          contact_phone: comm.contact_phone || comm.from_address || comm.to_address,
          last_message: comm,
          unread_count: comm.direction === "inbound" ? 1 : 0,
          messages: [comm],
        });
      } else {
        const thread = threadMap.get(key)!;
        thread.messages.push(comm);
        if (new Date(comm.created_at) > new Date(thread.last_message.created_at)) {
          thread.last_message = comm;
        }
        if (comm.direction === "inbound") {
          thread.unread_count++;
        }
      }
    });

    // Sort threads by last message time
    const sortedThreads = Array.from(threadMap.values()).sort(
      (a, b) =>
        new Date(b.last_message.created_at).getTime() -
        new Date(a.last_message.created_at).getTime()
    );

    setThreads(sortedThreads);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedThread) return;

    setSending(true);
    try {
      const res = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: "default-team",
          type: "sms", // Default to SMS for now
          direction: "outbound",
          contact_id: selectedThread.contact_id,
          to_address: selectedThread.contact_phone,
          from_address: process.env.NEXT_PUBLIC_TWILIO_PHONE || "+1234567890",
          body: newMessage,
          status: "sent",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Add to thread
        setSelectedThread((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, data.communication],
                last_message: data.communication,
              }
            : null
        );
        setNewMessage("");
        // Refresh communications
        fetchCommunications();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case "sms":
        return MessageSquare;
      case "email":
        return Mail;
      case "call":
        return Phone;
      default:
        return MessageSquare;
    }
  }

  function formatTime(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 86400000) {
      // Today
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } else if (diff < 604800000) {
      // This week
      return d.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }

  const filteredThreads = threads.filter((t) =>
    t.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.contact_phone?.includes(searchQuery) ||
    t.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Inbox className="h-7 w-7 text-cyan-400" />
            Inbox
          </h1>
          <button
            onClick={fetchCommunications}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Thread List */}
        <div className="w-96 border-r border-white/10 flex flex-col">
          {/* Search & Filter */}
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "sms", "email", "call"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filter === f
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-slate-800/50 text-slate-400 border border-white/10"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Inbox className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No conversations yet</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const Icon = getTypeIcon(thread.last_message.type);
                const isSelected = selectedThread?.contact_id === thread.contact_id;

                return (
                  <button
                    key={thread.contact_id}
                    onClick={() => setSelectedThread(thread)}
                    className={`w-full p-4 text-left border-b border-white/5 transition-colors ${
                      isSelected
                        ? "bg-cyan-500/10 border-l-2 border-l-cyan-500"
                        : "hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white truncate">
                            {thread.contact_name}
                          </p>
                          <span className="text-xs text-slate-500">
                            {formatTime(thread.last_message.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Icon className="h-3 w-3 text-slate-500 flex-shrink-0" />
                          <p className="text-sm text-slate-400 truncate">
                            {thread.last_message.direction === "outbound" && "You: "}
                            {thread.last_message.subject || thread.last_message.body}
                          </p>
                        </div>
                      </div>
                      {thread.unread_count > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message View */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedThread(null)}
                    className="md:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedThread.contact_name}</p>
                    <p className="text-sm text-slate-500">
                      {selectedThread.contact_phone || selectedThread.contact_email}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedThread.messages
                  .sort(
                    (a, b) =>
                      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  )
                  .map((msg) => {
                    const isOutbound = msg.direction === "outbound";
                    const Icon = getTypeIcon(msg.type);

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-4 ${
                            isOutbound
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-800 text-slate-200"
                          }`}
                        >
                          {msg.type === "email" && msg.subject && (
                            <p className="font-medium mb-1">{msg.subject}</p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.body}</p>
                          <div
                            className={`flex items-center gap-2 mt-2 text-xs ${
                              isOutbound ? "text-cyan-200" : "text-slate-500"
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            <span>{msg.type.toUpperCase()}</span>
                            <span>•</span>
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Inbox className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-slate-400">
                  Choose a thread from the list to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
