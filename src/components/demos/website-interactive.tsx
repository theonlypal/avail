"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User, Bot, CheckCircle } from "lucide-react";

interface WebsiteInteractiveProps {
  demoData: any;
}

export function WebsiteInteractive({ demoData }: WebsiteInteractiveProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLeadCreated, setShowLeadCreated] = useState(false);

  const chatMessages = demoData.chatConversation || [];

  useEffect(() => {
    if (isPlaying && currentIndex < chatMessages.length) {
      const message = chatMessages[currentIndex];
      const delay = message.role === "ai" ? (message.delay || 1000) : 500;

      const timer = setTimeout(() => {
        setMessages(prev => [...prev, message]);
        setCurrentIndex(prev => prev + 1);

        // Show lead created after last AI message
        if (currentIndex === chatMessages.length - 1) {
          setTimeout(() => {
            setShowLeadCreated(true);
            setIsPlaying(false);
          }, 1000);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentIndex, chatMessages]);

  const startDemo = () => {
    setMessages([]);
    setCurrentIndex(0);
    setShowLeadCreated(false);
    setIsPlaying(true);
  };

  const resetDemo = () => {
    setMessages([]);
    setCurrentIndex(0);
    setShowLeadCreated(false);
    setIsPlaying(false);
  };

  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="w-6 h-6 text-green-400" />
          Interactive Website Chat Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isPlaying && messages.length === 0 && (
            <button
              onClick={startDemo}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              ▶ Start Chat Demo
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={resetDemo}
              className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              🔄 Reset Demo
            </button>
          )}
        </div>

        {/* Chat Widget Simulation */}
        <div className="border border-white/10 rounded-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <div>
                <div className="font-semibold">AVAIL Assistant</div>
                <div className="text-xs opacity-90">Online • Responds instantly</div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto bg-white/5 p-4 space-y-3">
            {messages.length === 0 && !isPlaying && (
              <div className="text-center text-slate-400 py-12">
                Click "Start Chat Demo" to see the AI assistant in action
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 items-start ${msg.role === "visitor" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "visitor"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      : "bg-white/10 border border-white/20 text-white"
                  }`}
                >
                  <div className="text-sm">{msg.message}</div>
                  <div className={`text-xs mt-1 ${msg.role === "visitor" ? "text-blue-100" : "text-slate-400"}`}>
                    {msg.timestamp}
                  </div>
                </div>
                {msg.role === "visitor" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isPlaying && currentIndex < chatMessages.length && chatMessages[currentIndex]?.role === "ai" && (
              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white/10 border border-white/20 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lead Created Notification */}
        {showLeadCreated && (
          <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500/50 rounded-lg animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div className="flex-1">
                <div className="font-bold text-lg text-white">Lead Successfully Created!</div>
                <div className="text-sm text-slate-300">
                  ✓ Lead added to CRM • ✓ Technician notified • ✓ SMS confirmation sent
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white text-lg px-4 py-2">
                $500-1000 value
              </Badge>
            </div>
            <div className="mt-3 p-3 bg-white/10 border border-white/20 rounded">
              <div className="grid grid-cols-2 gap-2 text-sm text-white">
                <div><span className="font-semibold">Urgency:</span> Emergency</div>
                <div><span className="font-semibold">Score:</span> 95/100</div>
                <div><span className="font-semibold">Time:</span> 10:48 PM (After Hours)</div>
                <div><span className="font-semibold">Status:</span> Dispatched</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-white/10">
          <div>
            <div className="text-2xl font-bold text-green-400">24/7</div>
            <div className="text-xs text-slate-400">Always Available</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">&lt;30s</div>
            <div className="text-xs text-slate-400">Avg Response Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">25%</div>
            <div className="text-xs text-slate-400">Conversion Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
