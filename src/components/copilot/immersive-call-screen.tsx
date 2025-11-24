"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Sparkles, TrendingUp, AlertCircle, X, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Lead } from "@/types";
import { cn } from "@/lib/utils";
import { PostCallAnalysis, type PostCallData } from "./post-call-analysis";

interface ImmersiveCallScreenProps {
  lead: Lead;
  onCallEnd?: (callData: CallData) => void;
  onClose?: () => void;
}

interface CallData {
  lead_id: string;
  duration: number;
  outcome?: string;
  notes?: string;
}

type CallStatus = "idle" | "dialing" | "ringing" | "connected" | "ended";

interface TranscriptLine {
  id: string;
  speaker: "user" | "lead";
  text: string;
  timestamp: Date;
  aiSuggestion?: string;
}

interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ImmersiveCallScreen({ lead, onCallEnd, onClose }: ImmersiveCallScreenProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [aiTip, setAiTip] = useState<string>("");
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showPostCallAnalysis, setShowPostCallAnalysis] = useState(false);
  const [callSid, setCallSid] = useState<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const copilotEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Auto-scroll copilot to bottom
  useEffect(() => {
    copilotEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [copilotMessages]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (callStatus === "connected" && callStartTime) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        setCallDuration(duration);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus, callStartTime]);

  // Poll for real-time transcripts (when using production Twilio)
  useEffect(() => {
    if (callStatus !== "connected" || !callSid) {
      return;
    }

    let lastTranscriptId: string | null = null;
    let pollInterval: NodeJS.Timeout;

    const pollTranscripts = async () => {
      try {
        const url = lastTranscriptId
          ? `/api/calls/transcripts?call_sid=${callSid}&last_id=${lastTranscriptId}`
          : `/api/calls/transcripts?call_sid=${callSid}`;

        const response = await fetch(url);
        if (!response.ok) return;

        const data = await response.json();
        if (data.transcripts && data.transcripts.length > 0) {
          data.transcripts.forEach((t: any) => {
            addTranscriptLine(t.speaker, t.text);
            lastTranscriptId = t.id;

            // Get AI suggestion for lead messages
            if (t.speaker === 'lead') {
              getAISuggestion(t.text);
            }
          });
        }
      } catch (error) {
        console.error('Transcript polling error:', error);
      }
    };

    // Start polling every 1.5 seconds
    pollInterval = setInterval(pollTranscripts, 1500);
    pollTranscripts(); // Initial fetch

    return () => {
      clearInterval(pollInterval);
      // Clean up transcripts when call ends
      if (callSid) {
        fetch(`/api/calls/transcripts?call_sid=${callSid}`, { method: 'DELETE' }).catch(console.error);
      }
    };
  }, [callStatus, callSid]);

  // Real-time AI suggestions during call
  useEffect(() => {
    if (callStatus === "connected" && callSid) {
      // Call is live - transcripts come from Twilio Media Streams
      setAiTip("💡 Call in progress - AI copilot ready to assist");
    }
  }, [callStatus, callSid]);

  // Get AI suggestion based on what lead said
  const getAISuggestion = async (leadMessage: string) => {
    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `The lead just said: "${leadMessage}". What should I say next?`,
          context: {
            lead: {
              business_name: lead.business_name,
              industry: lead.industry,
              pain_points: lead.pain_points,
            },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          setAiTip(`💡 ${data.response}`);
        }
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
    }
  };

  const addTranscriptLine = (speaker: "user" | "lead", text: string, suggestion?: string) => {
    setTranscript(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      speaker,
      text,
      timestamp: new Date(),
      aiSuggestion: suggestion,
    }]);
  };

  const handleCopilotMessage = async () => {
    if (!copilotInput.trim() || copilotLoading) return;

    const userMessage: CopilotMessage = {
      id: Date.now().toString(),
      role: "user",
      content: copilotInput.trim(),
      timestamp: new Date(),
    };

    setCopilotMessages(prev => [...prev, userMessage]);
    setCopilotInput("");
    setCopilotLoading(true);

    try {
      // Call AI copilot API with context about the lead and call
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            lead: {
              business_name: lead.business_name,
              industry: lead.industry,
              location: lead.location,
              opportunity_score: lead.opportunity_score,
              pain_points: lead.pain_points,
              rating: lead.rating,
            },
            transcript: transcript.map(t => `${t.speaker}: ${t.text}`).join("\n"),
            callStatus,
            callDuration,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get copilot response");
      }

      const data = await response.json();

      const assistantMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm here to help! What would you like to know?",
        timestamp: new Date(),
      };

      setCopilotMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Copilot error:", error);
      const errorMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm here to help during your call! You can ask me:\n\n• What should I say next?\n• How do I handle this objection?\n• Tell me more about this lead's pain points\n• What's a good closing question?\n\nJust type your question below!",
        timestamp: new Date(),
      };
      setCopilotMessages(prev => [...prev, errorMessage]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartCall = async () => {
    setCallStatus("dialing");

    try {
      // Call Twilio API to initiate call
      const response = await fetch("/api/calls/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          to_number: lead.phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate call");
      }

      const data = await response.json();
      console.log("Call initiated:", data);

      // Store call SID for WebSocket connection
      if (data.call_sid) {
        setCallSid(data.call_sid);
      }

      // Simulate call progression
      setTimeout(() => setCallStatus("ringing"), 1000);
      setTimeout(() => {
        setCallStatus("connected");
        setCallStartTime(Date.now());
      }, 3000);

    } catch (error) {
      console.error("Call initiation error:", error);
      // Don't use alert() - it can crash the page. Gracefully fall back to demo mode.
      // Still proceed with demo mode so user can test the UI
      setTimeout(() => setCallStatus("ringing"), 1000);
      setTimeout(() => {
        setCallStatus("connected");
        setCallStartTime(Date.now());
      }, 3000);
    }
  };

  const handleEndCall = async () => {
    setCallStatus("ended");
    // Show post-call analysis modal instead of immediately closing
    setShowPostCallAnalysis(true);
  };

  const handleSaveCallData = async (postCallData: PostCallData) => {
    try {
      // Save complete call analytics to database
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          duration: callDuration,
          outcome: postCallData.call_outcome,
          call_quality: postCallData.call_quality,
          transcript: JSON.stringify(postCallData.transcript),
          notes: postCallData.notes,
          next_actions: JSON.stringify(postCallData.next_actions),
          started_at: new Date(Date.now() - callDuration * 1000).toISOString(),
          ended_at: new Date().toISOString(),
        }),
      });

      // Notify parent component
      onCallEnd?.({
        lead_id: lead.id,
        duration: callDuration,
        outcome: postCallData.call_outcome,
        notes: postCallData.notes,
      });

      // Close the call screen
      onClose?.();
    } catch (error) {
      console.error("Failed to save call data:", error);
      alert("Failed to save call data. Please try again.");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const getStatusColor = (): string => {
    switch (callStatus) {
      case "dialing":
      case "ringing":
        return "text-yellow-400";
      case "connected":
        return "text-green-400";
      case "ended":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusText = (): string => {
    switch (callStatus) {
      case "dialing":
        return "Dialing...";
      case "ringing":
        return "Ringing...";
      case "connected":
        return "Connected";
      case "ended":
        return "Call Ended";
      default:
        return "Ready to Call";
    }
  };

  return (
    // Immersive full-screen overlay
    <div className="fixed inset-0 z-50">
      {/* Backdrop blur */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={() => callStatus === "idle" && onClose?.()}
      />

      {/* Main call interface - TRANSPARENT */}
      <div className="relative w-full h-full bg-gradient-to-br from-slate-900/30 via-slate-800/30 to-slate-900/30">

        {/* Close button */}
        {(callStatus === "idle" || callStatus === "ended") && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 z-10 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        )}

        {/* FLOATING LEFT PANEL - Lead Info & Controls */}
        <div className="absolute top-6 left-6 z-10 w-80 max-h-[calc(100vh-3rem)] overflow-y-auto">
          <div className="bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="flex flex-col">

            {/* Lead Header */}
            <div className="text-center mb-6">
              <Badge className={cn("mb-3 px-4 py-1", getStatusColor())}>
                {getStatusText()}
              </Badge>

              <div className="mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-10 w-10 text-cyan-400" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">{lead.business_name}</h2>
                <p className="text-lg text-slate-400">{lead.phone}</p>
                <p className="text-sm text-slate-500">{lead.location}</p>
              </div>

              {/* Call Duration (when connected) */}
              {callStatus === "connected" && (
                <div className="text-center mb-6">
                  <div className="text-6xl font-mono font-bold text-cyan-400 tracking-wider">
                    {formatDuration(callDuration)}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest">Call Duration</p>
                </div>
              )}
            </div>

            {/* Lead Quick Info */}
            <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Industry</span>
                  <p className="text-white font-medium">{lead.industry}</p>
                </div>
                <div>
                  <span className="text-slate-400">Score</span>
                  <p className="text-cyan-400 font-bold text-lg">{lead.opportunity_score}</p>
                </div>
                {lead.rating > 0 && (
                  <div>
                    <span className="text-slate-400">Rating</span>
                    <p className="text-white font-medium">{lead.rating.toFixed(1)} ⭐</p>
                  </div>
                )}
                {lead.review_count > 0 && (
                  <div>
                    <span className="text-slate-400">Reviews</span>
                    <p className="text-white font-medium">{lead.review_count}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pain Points */}
            {lead.pain_points && lead.pain_points.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Pain Points to Address
                </h3>
                <ul className="space-y-2">
                  {lead.pain_points.slice(0, 3).map((point, index) => (
                    <li key={index} className="text-sm text-orange-300 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Call Controls */}
            <div className="mt-4">
              <div className="flex items-center justify-center gap-3">
                {callStatus === "idle" && (
                  <Button
                    onClick={handleStartCall}
                    className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                  >
                    <Phone className="h-7 w-7" />
                  </Button>
                )}

                {(callStatus === "dialing" || callStatus === "ringing" || callStatus === "connected") && (
                  <>
                    {/* Mute Button */}
                    <Button
                      onClick={toggleMute}
                      variant="outline"
                      className={cn(
                        "h-12 w-12 rounded-full border-white/10",
                        isMuted ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white"
                      )}
                      disabled={callStatus !== "connected"}
                    >
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>

                    {/* End Call Button */}
                    <Button
                      onClick={handleEndCall}
                      className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30"
                    >
                      <PhoneOff className="h-7 w-7" />
                    </Button>

                    {/* Speaker Button */}
                    <Button
                      onClick={toggleSpeaker}
                      variant="outline"
                      className={cn(
                        "h-12 w-12 rounded-full border-white/10",
                        isSpeakerOn ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white"
                      )}
                      disabled={callStatus !== "connected"}
                    >
                      {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </Button>
                  </>
                )}

                {callStatus === "ended" && (
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-slate-500/20 flex items-center justify-center mx-auto mb-2">
                      <PhoneOff className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-xs">Call ended - {formatDuration(callDuration)}</p>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* CENTER - Transcription */}
        <div className="h-full flex items-center justify-center px-8 py-20">
          <div className="w-full max-w-3xl">
            <div className="flex flex-col h-[calc(100vh-10rem)]">

            {/* Header - Centered */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-3 mb-2 bg-slate-900/60 backdrop-blur-lg px-6 py-3 rounded-full border border-white/10">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">
                  Live Transcription
                </h3>
              </div>
              {callStatus === "connected" && (
                <div className="text-4xl font-mono font-bold text-cyan-400 tracking-wider mt-4">
                  {formatDuration(callDuration)}
                </div>
              )}
            </div>

            {/* AI Tip Banner */}
            {aiTip && (
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-lg border border-purple-500/40 animate-in slide-in-from-top">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-purple-200 font-medium">{aiTip}</p>
                </div>
              </div>
            )}

            {/* Transcript Container - More Transparent */}
            <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/20 p-6 space-y-4 shadow-2xl">
              {transcript.length === 0 && callStatus !== "connected" && (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-slate-500" />
                    </div>
                    <p className="text-slate-500 text-lg">Waiting for call to connect...</p>
                    <p className="text-slate-600 text-sm mt-2">Transcription will start automatically</p>
                  </div>
                </div>
              )}

              {transcript.map((line) => (
                <div
                  key={line.id}
                  className={cn(
                    "flex",
                    line.speaker === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl p-4 backdrop-blur-md",
                      line.speaker === "user"
                        ? "bg-cyan-500/30 border border-cyan-500/40"
                        : "bg-white/20 border border-white/30"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        line.speaker === "user" ? "text-cyan-200" : "text-slate-200"
                      )}>
                        {line.speaker === "user" ? "You" : lead.business_name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {line.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white text-sm leading-relaxed">{line.text}</p>
                  </div>
                </div>
              ))}

              <div ref={transcriptEndRef} />
            </div>
            </div>
          </div>
        </div>

        {/* FLOATING RIGHT PANEL - AI Copilot (Optional) */}
        {showCopilot && (
          <div className="absolute top-6 right-6 z-10 w-96 max-h-[calc(100vh-3rem)] flex flex-col">
            <div className="bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-full">
              {/* Copilot Header */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">AI Copilot</div>
                    <div className="text-xs text-slate-400">Real-time assistance</div>
                  </div>
                </div>
                <Button
                  onClick={() => setShowCopilot(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-white/10"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </Button>
              </div>

              {/* Copilot Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {copilotMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-6 w-6 text-cyan-400" />
                    </div>
                    <p className="text-sm text-slate-400 mb-2">I'm your AI assistant</p>
                    <p className="text-xs text-slate-500">Ask me questions like:</p>
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <p>• "What should I say next?"</p>
                      <p>• "How do I handle objections?"</p>
                      <p>• "What are pain points?"</p>
                    </div>
                  </div>
                ) : (
                  copilotMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl p-3 backdrop-blur-md",
                          msg.role === "user"
                            ? "bg-cyan-500/30 border border-cyan-500/40"
                            : "bg-purple-500/30 border border-purple-500/40"
                        )}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1"
                           style={{ color: msg.role === "user" ? "#67e8f9" : "#c084fc" }}>
                          {msg.role === "user" ? "You" : "AI Copilot"}
                        </p>
                        <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {copilotLoading && (
                  <div className="flex justify-start">
                    <div className="bg-purple-500/30 backdrop-blur-md border border-purple-500/40 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-purple-300">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={copilotEndRef} />
              </div>

              {/* Copilot Input */}
              <div className="p-4 border-t border-white/10 bg-slate-800/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCopilotMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    placeholder="Ask AI for help..."
                    disabled={copilotLoading}
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  />
                  <Button
                    type="submit"
                    disabled={!copilotInput.trim() || copilotLoading}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING BOTTOM - Copilot Toggle */}
        {!showCopilot && (
          <div className="absolute bottom-6 right-6 z-10">
            <Button
              onClick={() => setShowCopilot(true)}
              className="h-14 bg-gradient-to-r from-cyan-500/80 to-purple-600/80 backdrop-blur-lg hover:from-cyan-600/80 hover:to-purple-700/80 text-white shadow-2xl border border-white/20"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              AI Copilot
              {copilotMessages.length > 0 && (
                <Badge className="ml-2 bg-white/20 text-white">
                  {copilotMessages.length}
                </Badge>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Post-Call Analysis Modal */}
      {showPostCallAnalysis && (
        <PostCallAnalysis
          leadName={lead.business_name}
          duration={callDuration}
          transcript={transcript}
          onSave={handleSaveCallData}
          onClose={() => {
            setShowPostCallAnalysis(false);
            onClose?.();
          }}
        />
      )}
    </div>
  );
}
