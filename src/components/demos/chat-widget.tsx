/**
 * AI Chat Widget Component
 *
 * Embeddable chatbot widget for live website demos
 * Shows realistic AI conversation flow with lead capture
 *
 * Features:
 * - Floating chat button
 * - Expandable chat window
 * - Typing indicators
 * - Message history
 * - Lead capture form
 * - Mobile responsive
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

interface ChatWidgetProps {
  companyName?: string;
  variant?: 'floating' | 'inline';
  onLeadCaptured?: (lead: LeadData) => void;
}

interface LeadData {
  name: string;
  phone: string;
  service: string;
  preferredTime: string;
}

const demoConversationFlow = [
  {
    trigger: 'start',
    aiMessage: "Hi! I'm the AI assistant. How can I help you today?",
    delay: 500
  },
  {
    trigger: 'repair',
    aiMessage: "I can help with that! What type of repair do you need? (Heating, Cooling, Plumbing, or Electrical)",
    delay: 800
  },
  {
    trigger: 'service_selected',
    aiMessage: "Great! To schedule a technician, I'll need a few details. What's your name?",
    delay: 700
  },
  {
    trigger: 'name_provided',
    aiMessage: "Thanks {name}! What's the best phone number to reach you?",
    delay: 600
  },
  {
    trigger: 'phone_provided',
    aiMessage: "Perfect! When would work best for you? (Morning 8-12, Afternoon 12-4, or Evening 4-8)",
    delay: 700
  },
  {
    trigger: 'time_selected',
    aiMessage: "Excellent! I've scheduled a {service} appointment for {time}. Our technician will call you at {phone} to confirm. Is there anything else I can help with?",
    delay: 1000
  }
];

export function ChatWidget({
  companyName = 'ProPlumb HVAC',
  variant = 'floating',
  onLeadCaptured
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<'initial' | 'service' | 'name' | 'phone' | 'time' | 'complete'>('initial');
  const [leadData, setLeadData] = useState<Partial<LeadData>>({});
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addAIMessage("Hi! I'm the AI assistant for " + companyName + ". How can I help you today? 🔧");
      }, 500);
    }
  }, [isOpen]);

  // Show unread indicator
  useEffect(() => {
    if (!isOpen && messages.length > 0 && messages[messages.length - 1].sender === 'ai') {
      setHasUnreadMessages(true);
    }
  }, [messages, isOpen]);

  const addAIMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36),
          text,
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500); // Random delay for realism
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(36),
        text,
        sender: 'user',
        timestamp: new Date()
      }
    ]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    addUserMessage(userInput);
    setInputValue('');

    // Process conversation flow
    setTimeout(() => {
      processUserInput(userInput);
    }, 500);
  };

  const processUserInput = (input: string) => {
    const lowerInput = input.toLowerCase();

    switch (conversationState) {
      case 'initial':
        // Detect service need keywords
        if (lowerInput.includes('repair') || lowerInput.includes('fix') || lowerInput.includes('broken') ||
            lowerInput.includes('heating') || lowerInput.includes('cooling') || lowerInput.includes('ac') ||
            lowerInput.includes('furnace') || lowerInput.includes('water heater')) {
          addAIMessage("I can definitely help with that! What type of service do you need?\n\n• Heating Repair\n• Cooling/AC\n• Plumbing\n• Electrical");
          setConversationState('service');
        } else if (lowerInput.includes('schedule') || lowerInput.includes('appointment') || lowerInput.includes('book')) {
          addAIMessage("I'd be happy to schedule an appointment! What type of service do you need?");
          setConversationState('service');
        } else {
          addAIMessage("I can help you with repairs, maintenance, or emergency service. What brings you here today?");
        }
        break;

      case 'service':
        // Capture service type
        let service = 'HVAC Service';
        if (lowerInput.includes('heat') || lowerInput.includes('furnace')) {
          service = 'Heating Repair';
        } else if (lowerInput.includes('cool') || lowerInput.includes('ac') || lowerInput.includes('air')) {
          service = 'Cooling/AC Service';
        } else if (lowerInput.includes('plumb') || lowerInput.includes('water') || lowerInput.includes('leak')) {
          service = 'Plumbing';
        } else if (lowerInput.includes('electric') || lowerInput.includes('wire')) {
          service = 'Electrical';
        }

        setLeadData(prev => ({ ...prev, service }));
        addAIMessage(`Perfect! I'll help you schedule ${service}. What's your name?`);
        setConversationState('name');
        break;

      case 'name':
        setLeadData(prev => ({ ...prev, name: input }));
        addAIMessage(`Great to meet you, ${input}! What's the best phone number to reach you?`);
        setConversationState('phone');
        break;

      case 'phone':
        setLeadData(prev => ({ ...prev, phone: input }));
        addAIMessage("Perfect! When would work best for you?\n\n• Morning (8 AM - 12 PM)\n• Afternoon (12 PM - 4 PM)\n• Evening (4 PM - 8 PM)");
        setConversationState('time');
        break;

      case 'time':
        let timeSlot = 'this week';
        if (lowerInput.includes('morning')) {
          timeSlot = 'tomorrow morning (8 AM - 12 PM)';
        } else if (lowerInput.includes('afternoon')) {
          timeSlot = 'tomorrow afternoon (12 PM - 4 PM)';
        } else if (lowerInput.includes('evening')) {
          timeSlot = 'tomorrow evening (4 PM - 8 PM)';
        }

        setLeadData(prev => {
          const finalLead = { ...prev, preferredTime: timeSlot } as LeadData;

          // Trigger lead captured callback
          if (onLeadCaptured) {
            onLeadCaptured(finalLead);
          }

          return finalLead;
        });

        addAIMessage(`Excellent! ✅\n\nI've scheduled your ${leadData.service} appointment for ${timeSlot}.\n\nOur technician will call you at ${leadData.phone} to confirm the exact time.\n\nConfirmation sent to: ${leadData.name}\n\nIs there anything else I can help with?`);
        setConversationState('complete');
        break;

      case 'complete':
        if (lowerInput.includes('no') || lowerInput.includes('that\'s all') || lowerInput.includes('thanks')) {
          addAIMessage("You're all set! We look forward to serving you. Have a great day! 😊");
        } else {
          addAIMessage("Sure! What else can I help you with?");
          setConversationState('initial');
        }
        break;
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnreadMessages(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (variant === 'floating') {
    return (
      <>
        {/* Floating Chat Button */}
        {!isOpen && (
          <button
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 animate-bounce-subtle"
          >
            <MessageCircle className="h-7 w-7" />
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white animate-pulse" />
            )}
          </button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col w-96 h-[600px] max-h-[80vh] bg-background border border-border rounded-2xl shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{companyName} AI</p>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    Online • Instant replies
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 whitespace-pre-wrap',
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-sm'
                        : 'bg-background border border-border rounded-bl-sm'
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={cn(
                      'text-xs mt-1',
                      message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="rounded-xl px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Powered by AVAIL
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Inline variant (for demo pages)
  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-xl">
      {/* Same content as floating, but without positioning */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">{companyName} AI</p>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Online • Instant replies
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Start a Conversation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The AI assistant is ready to help you schedule service
            </p>
            <Button
              onClick={() => {
                addAIMessage("Hi! I'm the AI assistant for " + companyName + ". How can I help you today? 🔧");
              }}
              className="rounded-lg"
            >
              Start Chat
            </Button>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 whitespace-pre-wrap',
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-sm'
                      : 'bg-background border border-border rounded-bl-sm'
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={cn(
                    'text-xs mt-1',
                    message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-border bg-background rounded-b-xl">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="rounded-xl px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Powered by AVAIL
        </p>
      </div>
    </div>
  );
}
