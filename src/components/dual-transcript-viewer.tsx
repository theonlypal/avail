'use client';

/**
 * DUAL-SIDE TRANSCRIPT VIEWER
 *
 * Displays real-time transcription from BOTH sides of a Twilio call:
 * - Agent side (outbound)
 * - Lead side (inbound)
 *
 * Polls the backend for Deepgram transcripts captured via Twilio Media Streams
 */

import { useState, useEffect, useRef } from 'react';
import { Mic, Phone, UserCircle2 } from 'lucide-react';

interface TranscriptEntry {
  speaker: 'Agent' | 'Lead';
  text: string;
  timestamp: number;
  confidence?: number;
}

interface DualTranscriptViewerProps {
  callSid: string;
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void;
}

export default function DualTranscriptViewer({
  callSid,
  onTranscriptUpdate,
}: DualTranscriptViewerProps) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [callStatus, setCallStatus] = useState<'active' | 'completed'>('active');
  const [isPolling, setIsPolling] = useState(true);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Poll for new transcripts from the backend
   */
  useEffect(() => {
    if (!callSid || !isPolling) return;

    const pollTranscripts = async () => {
      try {
        const response = await fetch(`/api/calls/stream?callSid=${callSid}`);

        if (!response.ok) {
          console.error('[Transcript] Failed to fetch:', response.status);
          return;
        }

        const data = await response.json();

        if (data.transcript && data.transcript.length > 0) {
          setTranscript(data.transcript);

          if (onTranscriptUpdate) {
            onTranscriptUpdate(data.transcript);
          }
        }

        if (data.status === 'completed') {
          setCallStatus('completed');
          setIsPolling(false);
        }
      } catch (error) {
        console.error('[Transcript] Poll error:', error);
      }
    };

    // Initial poll
    pollTranscripts();

    // Poll every 500ms for real-time updates
    pollIntervalRef.current = setInterval(pollTranscripts, 500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [callSid, isPolling, onTranscriptUpdate]);

  /**
   * Auto-scroll to bottom when new transcript arrives
   */
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  /**
   * Format timestamp to readable time
   */
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/70">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-medium text-slate-300">Live Transcription</span>
        </div>
        <div className="flex items-center gap-2">
          {callStatus === 'active' && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400">Recording</span>
            </div>
          )}
          {callStatus === 'completed' && (
            <span className="text-xs text-slate-500">Call Ended</span>
          )}
        </div>
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {transcript.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
              <Mic className="h-8 w-8 text-cyan-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">
              Waiting for conversation to start...
            </p>
            <p className="text-slate-500 text-xs">
              Both sides will be transcribed in real-time
            </p>
          </div>
        )}

        {transcript.map((entry, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              entry.speaker === 'Agent' ? 'justify-end' : 'justify-start'
            }`}
          >
            {entry.speaker === 'Lead' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <UserCircle2 className="h-5 w-5 text-purple-400" />
              </div>
            )}

            <div
              className={`max-w-[75%] ${
                entry.speaker === 'Agent'
                  ? 'bg-cyan-500/10 border-cyan-500/30'
                  : 'bg-purple-500/10 border-purple-500/30'
              } border rounded-xl p-3`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-medium ${
                    entry.speaker === 'Agent' ? 'text-cyan-400' : 'text-purple-400'
                  }`}
                >
                  {entry.speaker}
                </span>
                <span className="text-[10px] text-slate-500">
                  {formatTime(entry.timestamp)}
                </span>
                {entry.confidence && (
                  <span className="text-[10px] text-slate-600">
                    {Math.round(entry.confidence * 100)}%
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{entry.text}</p>
            </div>

            {entry.speaker === 'Agent' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Mic className="h-4 w-4 text-cyan-400" />
              </div>
            )}
          </div>
        ))}

        <div ref={transcriptEndRef} />
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-slate-900/70">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-500/50" />
            <span className="text-slate-500">Agent: {transcript.filter(t => t.speaker === 'Agent').length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500/50" />
            <span className="text-slate-500">Lead: {transcript.filter(t => t.speaker === 'Lead').length}</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-600">
          Call SID: {callSid.slice(-8)}
        </span>
      </div>
    </div>
  );
}
