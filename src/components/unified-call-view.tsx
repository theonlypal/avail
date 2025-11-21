'use client';

/**
 * UNIFIED CALL VIEW
 *
 * The complete real-time call coaching interface that blends THREE transcription sources:
 * 1. Agent Microphone (AssemblyAI - 307ms latency) - What YOU say
 * 2. Dual-Side Call (Twilio + Deepgram) - What BOTH sides say on the phone
 * 3. AI Coaching (Claude Sonnet 4.5 - 400ms streaming) - What you SHOULD say
 *
 * All displayed in one smooth, chronological transcript view with:
 * - Color-coded speakers (Agent/You = Cyan, Lead = Purple, AI = Gold)
 * - Real-time updates and auto-scroll
 * - Call controls and duration tracking
 * - Post-call notes and saving
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioCapture } from '@/lib/audio-capture';
import { Phone, PhoneOff, Pause, Play, Mic, MicOff, UserCircle2, Sparkles, Bot } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  business_type?: string;
  rating?: number;
  user_ratings_total?: number;
  score?: number;
  website?: string;
  address?: string;
}

interface TranscriptEntry {
  id: string;
  speaker: 'agent-mic' | 'agent-call' | 'lead' | 'ai-coach';
  text: string;
  timestamp: number;
  confidence?: number;
  isFinal: boolean;
}

interface UnifiedCallViewProps {
  callSid: string; // Twilio call SID for polling
  lead: Lead;
  onCallEnd?: (transcript: TranscriptEntry[], duration: number) => void;
}

export default function UnifiedCallView({ callSid, lead, onCallEnd }: UnifiedCallViewProps) {
  // State
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentMicText, setCurrentMicText] = useState('');
  const [currentAiText, setCurrentAiText] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [notes, setNotes] = useState('');
  const [callStatus, setCallStatus] = useState<'active' | 'completed'>('active');

  // Refs
  const audioCapture = useRef<AudioCapture | null>(null);
  const callStartTime = useRef<number>(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  /**
   * Format call duration as MM:SS
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  /**
   * Poll for Twilio/Deepgram transcripts from backend
   */
  useEffect(() => {
    if (!callSid || !isCallActive) return;

    const pollTranscripts = async () => {
      try {
        const response = await fetch(`/api/calls/stream?callSid=${callSid}`);

        if (!response.ok) {
          console.error('[Transcript] Failed to fetch:', response.status);
          return;
        }

        const data = await response.json();

        // Merge Twilio/Deepgram transcripts into unified transcript
        if (data.transcript && data.transcript.length > 0) {
          setTranscript((prev) => {
            // Add new entries from Twilio/Deepgram that aren't already in transcript
            const existing = new Set(prev.map(t => `${t.speaker}-${t.timestamp}-${t.text}`));
            const newEntries = data.transcript
              .filter((t: any) => !existing.has(`${t.speaker === 'Agent' ? 'agent-call' : 'lead'}-${t.timestamp}-${t.text}`))
              .map((t: any) => ({
                id: `twilio-${t.timestamp}-${Math.random()}`,
                speaker: t.speaker === 'Agent' ? 'agent-call' : 'lead',
                text: t.text,
                timestamp: t.timestamp,
                confidence: t.confidence,
                isFinal: true,
              }));

            // Merge and sort by timestamp
            const merged = [...prev, ...newEntries].sort((a, b) => a.timestamp - b.timestamp);
            return merged;
          });
        }

        if (data.status === 'completed') {
          setCallStatus('completed');
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
  }, [callSid, isCallActive]);

  /**
   * Start call and audio capture
   */
  const startCall = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      // Initialize audio capture (AssemblyAI)
      audioCapture.current = new AudioCapture();

      await audioCapture.current.start(
        stream,
        (text, isFinal) => {
          // Update current mic text
          setCurrentMicText(text);

          if (isFinal && text.trim()) {
            // Add to transcript history
            const entry: TranscriptEntry = {
              id: `mic-${Date.now()}-${Math.random()}`,
              speaker: 'agent-mic',
              text: text.trim(),
              timestamp: Date.now(),
              isFinal: true,
            };

            setTranscript((prev) => [...prev, entry].sort((a, b) => a.timestamp - b.timestamp));
            setCurrentMicText('');

            // Get AI coaching suggestion
            if (!isPaused) {
              fetchAiCoaching(text.trim());
            }
          }
        },
        (error) => {
          console.error('Audio capture error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          alert(`Failed to capture audio: ${errorMsg}\n\nPlease check:\n1. Microphone permissions are allowed\n2. You're on HTTPS (production)\n3. Check browser console for details`);
          endCall();
        }
      );

      // Start call timer
      callStartTime.current = Date.now();
      setIsCallActive(true);

      timerInterval.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to start call:', error);

      // Provide specific error messages
      let errorMessage = 'Failed to start microphone capture. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Microphone access was denied. Please allow microphone permissions in your browser settings and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Microphone is already in use by another application. Please close other apps using the microphone and try again.';
      } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        errorMessage += 'Microphone access requires HTTPS. This feature only works on the production deployment (https://...).';
      } else {
        errorMessage += error.message || 'Please check microphone permissions and try again.';
      }

      alert(errorMessage);
    }
  };

  /**
   * End call and cleanup
   */
  const endCall = () => {
    // Stop audio capture
    if (audioCapture.current) {
      audioCapture.current.stop();
      audioCapture.current = null;
    }

    // Stop timer
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    // Stop polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    const duration = Math.floor((Date.now() - callStartTime.current) / 1000);

    // Call callback
    if (onCallEnd) {
      onCallEnd(transcript, duration);
    }

    setIsCallActive(false);
  };

  /**
   * Toggle AI coaching
   */
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  /**
   * Fetch AI coaching suggestion
   */
  const fetchAiCoaching = useCallback(
    async (agentText: string) => {
      try {
        setIsAiStreaming(true);
        setCurrentAiText('');

        const response = await fetch('/api/ai/call-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: agentText,
            leadContext: lead,
            conversationHistory: transcript
              .slice(-5)
              .map((t) => ({
                speaker: t.speaker === 'agent-mic' || t.speaker === 'agent-call' ? 'agent' : t.speaker === 'lead' ? 'lead' : 'ai',
                text: t.text
              })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI coaching');
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setCurrentAiText(fullText);
        }

        setIsAiStreaming(false);

        // Add to transcript as final entry
        if (fullText.trim()) {
          const entry: TranscriptEntry = {
            id: `ai-${Date.now()}-${Math.random()}`,
            speaker: 'ai-coach',
            text: fullText.trim(),
            timestamp: Date.now(),
            isFinal: true,
          };

          setTranscript((prev) => [...prev, entry].sort((a, b) => a.timestamp - b.timestamp));
          setCurrentAiText('');
        }
      } catch (error) {
        console.error('AI coaching error:', error);
        setIsAiStreaming(false);
        setCurrentAiText('');
      }
    },
    [lead, transcript]
  );

  /**
   * Auto-scroll transcript
   */
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, currentMicText, currentAiText]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (audioCapture.current) {
        audioCapture.current.stop();
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  /**
   * Auto-start microphone capture when component mounts
   */
  useEffect(() => {
    startCall();
  }, []);

  if (!isCallActive) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center space-y-6 p-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
            <Phone className="w-16 h-16 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Initializing Call...</h2>
            <p className="text-slate-300 text-lg">{lead.name}</p>
            <p className="text-slate-400">{lead.phone}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              LIVE CALL - {lead.name}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {lead.business_type && `${lead.business_type} • `}
              {lead.score && `Score: ${lead.score}/100 • `}
              {lead.rating && `⭐ ${lead.rating}`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono text-white">{formatDuration(callDuration)}</div>
            <div className="text-xs text-slate-400">
              {callStatus === 'active' ? 'Recording' : 'Call Ended'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Unified Transcript */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full bg-slate-800/50 rounded-xl p-6 flex flex-col backdrop-blur border border-white/10">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
            <div>
              <h2 className="text-white font-semibold text-lg">Unified Live Transcript</h2>
              <p className="text-xs text-slate-400">
                <span className="text-cyan-400">You (Mic)</span> • <span className="text-cyan-300">You (Call)</span> • <span className="text-purple-400">Lead</span> • <span className="text-amber-400">AI Coach</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={togglePause}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isPaused
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3 h-3 inline mr-1" />
                    Resume AI
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 inline mr-1" />
                    Pause AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Unified Transcript Area */}
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-600 pr-2">
            {transcript.length === 0 && !currentMicText && !currentAiText && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
                  <Mic className="h-8 w-8 text-cyan-400" />
                </div>
                <p className="text-slate-400 text-sm mb-1">
                  Waiting for conversation to start...
                </p>
                <p className="text-slate-500 text-xs">
                  All three sources will appear here in real-time
                </p>
              </div>
            )}

            {/* Render all transcript entries */}
            {transcript.map((entry) => {
              const isAgent = entry.speaker === 'agent-mic' || entry.speaker === 'agent-call';
              const isLead = entry.speaker === 'lead';
              const isAI = entry.speaker === 'ai-coach';

              return (
                <div
                  key={entry.id}
                  className={`flex gap-3 ${isAgent || isAI ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Lead avatar on left */}
                  {isLead && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <UserCircle2 className="h-5 w-5 text-purple-400" />
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-[75%] ${
                      entry.speaker === 'agent-mic'
                        ? 'bg-cyan-500/10 border-cyan-500/30'
                        : entry.speaker === 'agent-call'
                        ? 'bg-cyan-400/10 border-cyan-400/30'
                        : entry.speaker === 'lead'
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    } border rounded-xl p-3`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium ${
                          entry.speaker === 'agent-mic'
                            ? 'text-cyan-400'
                            : entry.speaker === 'agent-call'
                            ? 'text-cyan-300'
                            : entry.speaker === 'lead'
                            ? 'text-purple-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {entry.speaker === 'agent-mic' ? 'You (Mic)' : entry.speaker === 'agent-call' ? 'You (Call)' : entry.speaker === 'lead' ? 'Lead' : 'AI Coach'}
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

                  {/* Agent/AI avatars on right */}
                  {entry.speaker === 'agent-mic' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <Mic className="h-4 w-4 text-cyan-400" />
                    </div>
                  )}
                  {entry.speaker === 'agent-call' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-cyan-300" />
                    </div>
                  )}
                  {entry.speaker === 'ai-coach' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-amber-400" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Current mic text (streaming) */}
            {currentMicText && (
              <div className="flex gap-3 justify-end">
                <div className="max-w-[75%] bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-cyan-400">You (Mic)</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-cyan-400">Speaking...</span>
                    </div>
                  </div>
                  <p className="text-sm text-cyan-200 leading-relaxed">{currentMicText}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Mic className="h-4 w-4 text-cyan-400 animate-pulse" />
                </div>
              </div>
            )}

            {/* Current AI text (streaming) */}
            {currentAiText && (
              <div className="flex gap-3 justify-end">
                <div className="max-w-[75%] bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-amber-400">AI Coach</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-amber-400">Suggesting...</span>
                    </div>
                  </div>
                  <p className="text-sm text-amber-200 leading-relaxed">{currentAiText}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-amber-400 animate-pulse" />
                </div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-500/50" />
                <span className="text-slate-500">You: {transcript.filter(t => t.speaker === 'agent-mic' || t.speaker === 'agent-call').length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500/50" />
                <span className="text-slate-500">Lead: {transcript.filter(t => t.speaker === 'lead').length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                <span className="text-slate-500">AI: {transcript.filter(t => t.speaker === 'ai-coach').length}</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-600">
              Call SID: {callSid.slice(-8)}
            </span>
          </div>

          {/* Quick Notes */}
          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Quick notes during call..."
              className="w-full h-16 bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 border-t border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={endCall}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                isMuted
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-slate-400">
              <span className="text-green-400 font-mono font-semibold">~707ms</span> total latency
            </div>
            <div className="text-sm text-slate-400">
              <span className="text-green-400 font-semibold">{transcript.length}</span> messages
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
