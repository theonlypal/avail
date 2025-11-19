"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, CheckCircle } from "lucide-react";

const SYSTEM_PROMPT = `You are an AI assistant for ProPlumb Services, a plumbing company in Denver, Colorado.

Your purpose is to demonstrate AI-powered lead capture by:
- Answering questions about plumbing services, pricing, and availability
- Naturally collecting customer information (name, phone, address, issue) through conversation
- Being helpful and conversational

Services & Pricing:
- Emergency Plumbing: $150 service call + parts/labor (24/7)
- Water Heater: $800-1,500 (tank & tankless)
- Drain Cleaning: $100-200 (video inspection included)
- Leak Repair: $75-300

Hours:
- Mon-Fri 7AM-7PM, Sat 8AM-6PM, Sun 9AM-5PM
- Emergency: 24/7, 45-min avg response
- Today's openings: 2pm, 4pm, 6pm

Conversation flow:
1. Ask about their plumbing issue
2. Ask for their name
3. Ask for phone number
4. Ask for address if needed
5. Once you have name + phone + issue, acknowledge the information has been captured

Keep responses natural and concise (2-3 sentences).`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message when chat opens
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm ProPlumb's AI assistant. How can I help you with your plumbing needs today?"
      }]);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Call Claude API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: SYSTEM_PROMPT
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Add AI response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message
        }]);

        // Check if lead was captured
        if (data.leadCaptured && data.leadCaptured.captured) {
          setLeadCaptured(true);
          // Store lead in localStorage for demo dashboard
          const leads = JSON.parse(localStorage.getItem('proplumb-leads') || '[]');
          leads.push({
            timestamp: new Date().toISOString(),
            messages: [...newMessages, { role: 'assistant', content: data.message }],
            captured: true
          });
          localStorage.setItem('proplumb-leads', JSON.stringify(leads));
        }
      } else {
        // Error handling
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I apologize, but I'm having trouble connecting right now. Please call us at (720) 555-8421 for immediate assistance!"
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please call us at (720) 555-8421 for immediate assistance!"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 flex items-center gap-3 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden group-hover:inline-block font-semibold pr-2">
          Chat with us!
        </span>
        {leadCaptured && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-md flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="font-medium">ProPlumb Assistant</div>
            <div className="text-xs text-blue-100">Online • Responds instantly</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-2 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div
              className={`max-w-[75%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-200 rounded-tl-sm'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Lead Captured Notification */}
      {leadCaptured && (
        <div className="px-4 py-2 bg-green-50 border-t border-green-200 flex items-center gap-2 text-sm text-green-800">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="font-semibold">Lead captured!</span>
          <span className="text-green-600">We'll call you shortly.</span>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Powered by AVAIL AI • Demo Mode
        </div>
      </div>
    </div>
  );
}
