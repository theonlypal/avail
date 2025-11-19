"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  PhoneOff,
  PhoneMissed,
  Voicemail,
  Calendar,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CallOutcome =
  | "connected"
  | "no_answer"
  | "voicemail"
  | "busy"
  | "wrong_number"
  | "callback_requested"
  | "not_interested"
  | "meeting_scheduled"
  | "failed";

export type CallQuality = "excellent" | "good" | "fair" | "poor";

export interface TranscriptLine {
  id: string;
  speaker: "user" | "lead";
  text: string;
  timestamp: Date;
}

export interface PostCallData {
  call_outcome: CallOutcome;
  call_quality: CallQuality;
  transcript: TranscriptLine[];
  notes: string;
  next_actions: string[];
}

interface PostCallAnalysisProps {
  leadName: string;
  duration: number;
  transcript: TranscriptLine[];
  onSave: (data: PostCallData) => Promise<void>;
  onClose: () => void;
}

const OUTCOME_OPTIONS: { value: CallOutcome; label: string; icon: any; color: string }[] = [
  { value: "connected", label: "Connected", icon: CheckCircle2, color: "text-green-400 bg-green-500/20 border-green-500/40" },
  { value: "meeting_scheduled", label: "Meeting Booked", icon: Calendar, color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40" },
  { value: "callback_requested", label: "Call Back Later", icon: PhoneOff, color: "text-cyan-400 bg-cyan-500/20 border-cyan-500/40" },
  { value: "not_interested", label: "Not Interested", icon: XCircle, color: "text-red-400 bg-red-500/20 border-red-500/40" },
  { value: "no_answer", label: "No Answer", icon: PhoneMissed, color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/40" },
  { value: "voicemail", label: "Voicemail", icon: Voicemail, color: "text-orange-400 bg-orange-500/20 border-orange-500/40" },
  { value: "busy", label: "Busy", icon: AlertCircle, color: "text-purple-400 bg-purple-500/20 border-purple-500/40" },
  { value: "wrong_number", label: "Wrong Number", icon: XCircle, color: "text-slate-400 bg-slate-500/20 border-slate-500/40" },
  { value: "failed", label: "Technical Failure", icon: AlertCircle, color: "text-red-400 bg-red-500/20 border-red-500/40" },
];

const QUALITY_OPTIONS: { value: CallQuality; label: string; description: string }[] = [
  { value: "excellent", label: "Excellent", description: "Great conversation, strong engagement" },
  { value: "good", label: "Good", description: "Productive call, positive interaction" },
  { value: "fair", label: "Fair", description: "Decent call, some challenges" },
  { value: "poor", label: "Poor", description: "Difficult call, low engagement" },
];

export function PostCallAnalysis({
  leadName,
  duration,
  transcript,
  onSave,
  onClose,
}: PostCallAnalysisProps) {
  const [outcome, setOutcome] = useState<CallOutcome>("connected");
  const [quality, setQuality] = useState<CallQuality>("good");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextActions, setNextActions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>("");

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleAddAction = () => {
    if (nextAction.trim()) {
      setNextActions([...nextActions, nextAction.trim()]);
      setNextAction("");
    }
  };

  const handleRemoveAction = (index: number) => {
    setNextActions(nextActions.filter((_, i) => i !== index));
  };

  const handleGetAIInsights = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/copilot/analyze-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript.map((t) => `${t.speaker}: ${t.text}`).join("\n"),
          duration,
          outcome,
        }),
      });

      const data = await response.json();
      if (data.insights) {
        setAiInsights(data.insights);
        if (data.suggested_actions) {
          setNextActions([...nextActions, ...data.suggested_actions]);
        }
      }
    } catch (error) {
      console.error("AI analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        call_outcome: outcome,
        call_quality: quality,
        transcript,
        notes,
        next_actions: nextActions,
      });
      onClose();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const talkRatio = transcript.length > 0
    ? Math.round((transcript.filter((t) => t.speaker === "lead").length / transcript.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <PhoneOff className="h-5 w-5 text-cyan-400" />
                </div>
                Call Summary
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Call with {leadName} • {formatDuration(duration)}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-white/10"
            >
              <XCircle className="h-5 w-5 text-slate-400" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Duration</div>
              <div className="text-2xl font-bold text-white">{formatDuration(duration)}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Talk Ratio</div>
              <div className="text-2xl font-bold text-cyan-400">{talkRatio}%</div>
              <div className="text-xs text-slate-500 mt-1">Lead spoke</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Exchanges</div>
              <div className="text-2xl font-bold text-purple-400">{transcript.length}</div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                AI Insights
              </h3>
              <Button
                onClick={handleGetAIInsights}
                disabled={analyzing}
                size="sm"
                className="h-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {analyzing ? "Analyzing..." : "Get AI Analysis"}
              </Button>
            </div>
            {aiInsights ? (
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{aiInsights}</p>
            ) : (
              <p className="text-sm text-slate-500 italic">Click to analyze this call with AI</p>
            )}
          </div>

          {/* Call Outcome */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Call Outcome *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {OUTCOME_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setOutcome(option.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      outcome === option.value
                        ? option.color
                        : "border-white/10 bg-slate-800/30 hover:bg-slate-800/50"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium text-white">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Call Quality */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Call Quality *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {QUALITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setQuality(option.value)}
                  className={cn(
                    "flex flex-col p-4 rounded-xl border transition-all text-left",
                    quality === option.value
                      ? "border-cyan-500/40 bg-cyan-500/20"
                      : "border-white/10 bg-slate-800/30 hover:bg-slate-800/50"
                  )}
                >
                  <span className="text-sm font-semibold text-white">{option.label}</span>
                  <span className="text-xs text-slate-400 mt-1">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Call Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any important details, objections raised, or key points discussed..."
              className="min-h-[120px] bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Next Actions */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Next Actions
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAction();
                    }
                  }}
                  placeholder="e.g., Send follow-up email with pricing"
                  className="flex-1 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
                <Button
                  onClick={handleAddAction}
                  disabled={!nextAction.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  Add
                </Button>
              </div>

              {nextActions.length > 0 && (
                <div className="space-y-2">
                  {nextActions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-slate-800/30"
                    >
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span className="flex-1 text-sm text-white">{action}</span>
                      <button
                        onClick={() => handleRemoveAction(index)}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <XCircle className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              {saving ? "Saving..." : "Save Call Data"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
