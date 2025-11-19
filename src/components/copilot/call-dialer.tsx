"use client";

import { useState } from "react";
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/types";

interface CallDialerProps {
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

export function CallDialer({ lead, onCallEnd, onClose }: CallDialerProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  // Interval for call duration
  useState(() => {
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
  });

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

      // Simulate call progression
      setTimeout(() => setCallStatus("ringing"), 1000);
      setTimeout(() => {
        setCallStatus("connected");
        setCallStartTime(Date.now());
      }, 3000);

    } catch (error) {
      console.error("Call initiation error:", error);
      alert("Failed to start call. Please check Twilio configuration.");
      setCallStatus("idle");
    }
  };

  const handleEndCall = async () => {
    setCallStatus("ended");

    const callData: CallData = {
      lead_id: lead.id,
      duration: callDuration,
      outcome: "completed",
      notes: "",
    };

    // Save call data to database
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          duration: callDuration,
          outcome: "completed",
          started_at: new Date(Date.now() - callDuration * 1000).toISOString(),
          ended_at: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Failed to save call data:", error);
    }

    onCallEnd?.(callData);

    // Close after 2 seconds
    setTimeout(() => {
      onClose?.();
    }, 2000);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Implement actual mute functionality with Twilio
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // TODO: Implement actual speaker toggle
  };

  const getStatusColor = (): string => {
    switch (callStatus) {
      case "dialing":
      case "ringing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "connected":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "ended":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
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
    <Card className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <Badge className={`${getStatusColor()} mb-3`}>
          {getStatusText()}
        </Badge>

        <h2 className="text-2xl font-bold text-white mb-1">{lead.business_name}</h2>
        <p className="text-slate-400">{lead.phone}</p>
        <p className="text-slate-500 text-sm">{lead.location}</p>
      </div>

      {/* Call Duration (when connected) */}
      {callStatus === "connected" && (
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-cyan-400">
            {formatDuration(callDuration)}
          </div>
        </div>
      )}

      {/* Lead Quick Info */}
      <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Industry</span>
            <p className="text-white font-medium">{lead.industry}</p>
          </div>
          <div>
            <span className="text-slate-400">Opportunity Score</span>
            <p className="text-white font-medium">{lead.opportunity_score}/100</p>
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

      {/* Call Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {callStatus === "idle" && (
          <Button
            onClick={handleStartCall}
            className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
          >
            <Phone className="h-6 w-6" />
          </Button>
        )}

        {(callStatus === "dialing" || callStatus === "ringing" || callStatus === "connected") && (
          <>
            {/* Mute Button */}
            <Button
              onClick={toggleMute}
              variant="outline"
              className={`h-14 w-14 rounded-full border-white/10 ${
                isMuted ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white"
              }`}
              disabled={callStatus !== "connected"}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* End Call Button */}
            <Button
              onClick={handleEndCall}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            {/* Speaker Button */}
            <Button
              onClick={toggleSpeaker}
              variant="outline"
              className={`h-14 w-14 rounded-full border-white/10 ${
                isSpeakerOn ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white"
              }`}
              disabled={callStatus !== "connected"}
            >
              {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </>
        )}

        {callStatus === "ended" && (
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-slate-500/20 flex items-center justify-center mx-auto mb-2">
              <PhoneOff className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-400 text-sm">Call ended - {formatDuration(callDuration)}</p>
          </div>
        )}
      </div>

      {/* Pain Points (for reference during call) */}
      {callStatus === "connected" && lead.pain_points && lead.pain_points.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30">
          <h3 className="text-sm font-semibold text-orange-400 mb-2">Pain Points to Address:</h3>
          <ul className="space-y-1">
            {lead.pain_points.slice(0, 3).map((point, index) => (
              <li key={index} className="text-sm text-orange-300 flex items-start">
                <span className="mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Close Button */}
      {(callStatus === "idle" || callStatus === "ended") && onClose && (
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full mt-4 border-white/10 text-white hover:bg-white/5"
        >
          Close
        </Button>
      )}
    </Card>
  );
}
