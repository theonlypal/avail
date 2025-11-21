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
  const [isMounted, setIsMounted] = useState(false); // Track client-side mount
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
        console.log('[UnifiedCallView] Polling for transcripts. Call SID:', callSid);
        const response = await fetch(`/api/calls/stream?callSid=${callSid}`);

        if (!response.ok) {
          console.error('[Transcript] Failed to fetch:', response.status);
          return;
        }

        const data = await response.json();
        console.log('[UnifiedCallView] Poll response:', data);

        // Merge Twilio/Deepgram transcripts into unified transcript
        if (data.transcript && data.transcript.length > 0) {
          console.log('[UnifiedCallView] Received', data.transcript.length, 'transcripts from backend');

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

            console.log('[UnifiedCallView] Adding', newEntries.length, 'new entries from call');

            // Merge and sort by timestamp
            const merged = [...prev, ...newEntries].sort((a, b) => a.timestamp - b.timestamp);
            console.log('[UnifiedCallView] Total transcript entries:', merged.length);
            return merged;
          });
        } else {
          console.log('[UnifiedCallView] No transcripts in response');
        }

        if (data.status === 'completed') {
          console.log('[UnifiedCallView] Call status: completed');
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
          console.log('[UnifiedCallView] Mic transcript received:', text, 'isFinal:', isFinal);

          // Update current mic text
          setCurrentMicText(text);

          if (isFinal && text.trim()) {
            console.log('[UnifiedCallView] Adding final mic transcript to timeline:', text.trim());

            // Add to transcript history
            const entry: TranscriptEntry = {
              id: `mic-${Date.now()}-${Math.random()}`,
              speaker: 'agent-mic',
              text: text.trim(),
              timestamp: Date.now(),
              isFinal: true,
            };

            setTranscript((prev) => {
              const updated = [...prev, entry].sort((a, b) => a.timestamp - b.timestamp);
              console.log('[UnifiedCallView] Transcript updated. Total entries:', updated.length);
              return updated;
            });
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
   * Mark component as mounted on client-side
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Auto-start microphone capture when component mounts (client-side only)
   */
  useEffect(() => {
    if (isMounted && !isCallActive) {
      startCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isMounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-6 p-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl border border-cyan-500/30 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/20 animate-pulse">
            <Phone className="h-16 w-16 text-cyan-400" />
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-2">Loading Call Interface...</h3>
            <p className="text-slate-400">Preparing real-time transcription</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isCallActive) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-6 p-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <Phone className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-3xl font-bold text-white mb-2">Initializing Call...</h2>
            <p className="text-slate-300 text-lg">{lead.name}</p>
            <p className="text-slate-400">{lead.phone}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
              </span>
              LIVE CALL
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {lead.name}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
              {lead.business_type && (
                <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded-md text-blue-400 text-xs">
                  {lead.business_type}
                </span>
              )}
              {lead.score && (
                <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded-md text-purple-400 text-xs">
                  Score: {lead.score}/100
                </span>
              )}
              {lead.rating && (
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-400 text-xs">
                  ⭐ {lead.rating}
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {formatDuration(callDuration)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {callStatus === 'active' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Recording
                </span>
              ) : (
                'Call Ended'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Unified Transcript */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full bg-white/5 backdrop-blur-2xl rounded-2xl p-6 flex flex-col border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Unified Live Transcript
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  You (Mic)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-400/10 border border-cyan-400/30 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                  You (Call)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Lead
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  AI Coach
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={togglePause}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all backdrop-blur-xl ${
                  isPaused
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 hover:bg-yellow-500/30 shadow-lg shadow-yellow-500/20'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/50 hover:bg-purple-500/30 shadow-lg shadow-purple-500/20'
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
                    <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-purple-500/10 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <UserCircle2 className="h-5 w-5 text-purple-400" />
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-[75%] backdrop-blur-xl shadow-lg ${
                      entry.speaker === 'agent-mic'
                        ? 'bg-cyan-500/10 border-cyan-500/30 shadow-cyan-500/10'
                        : entry.speaker === 'agent-call'
                        ? 'bg-cyan-400/10 border-cyan-400/30 shadow-cyan-400/10'
                        : entry.speaker === 'lead'
                        ? 'bg-purple-500/10 border-purple-500/30 shadow-purple-500/10'
                        : 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/10'
                    } border rounded-2xl p-4`}
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
                    <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <Mic className="h-5 w-5 text-cyan-400" />
                    </div>
                  )}
                  {entry.speaker === 'agent-call' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-cyan-400/10 backdrop-blur-xl border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-400/20">
                      <Phone className="h-5 w-5 text-cyan-300" />
                    </div>
                  )}
                  {entry.speaker === 'ai-coach' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Bot className="h-5 w-5 text-amber-400" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Current mic text (streaming) */}
            {currentMicText && (
              <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="max-w-[75%] bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-lg shadow-cyan-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-cyan-400">You (Mic)</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-cyan-400 font-medium">Speaking...</span>
                    </div>
                  </div>
                  <p className="text-sm text-cyan-100 leading-relaxed">{currentMicText}</p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Mic className="h-5 w-5 text-cyan-400 animate-pulse" />
                </div>
              </div>
            )}

            {/* Current AI text (streaming) */}
            {currentAiText && (
              <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="max-w-[75%] bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-lg shadow-amber-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-amber-400">AI Coach</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-amber-400 font-medium">Suggesting...</span>
                    </div>
                  </div>
                  <p className="text-sm text-amber-100 leading-relaxed">{currentAiText}</p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Bot className="h-5 w-5 text-amber-400 animate-pulse" />
                </div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 backdrop-blur-xl border border-cyan-500/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                <span className="text-cyan-400 font-medium">You: {transcript.filter(t => t.speaker === 'agent-mic' || t.speaker === 'agent-call').length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/5 backdrop-blur-xl border border-purple-500/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                <span className="text-purple-400 font-medium">Lead: {transcript.filter(t => t.speaker === 'lead').length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
                <span className="text-amber-400 font-medium">AI: {transcript.filter(t => t.speaker === 'ai-coach').length}</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono px-2 py-1 bg-white/5 rounded-md border border-white/10">
              {callSid.slice(-8)}
            </span>
          </div>

          {/* Quick Notes */}
          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Quick notes during call..."
              className="w-full h-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 resize-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={endCall}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 flex items-center gap-2 border border-red-500/50"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 backdrop-blur-xl border ${
                isMuted
                  ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-lg'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              <span className="text-xs text-slate-400">
                <span className="text-emerald-400 font-mono font-semibold">~707ms</span> latency
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-xl border border-blue-500/30 rounded-xl">
              <span className="text-xs text-slate-400">
                <span className="text-blue-400 font-semibold">{transcript.length}</span> messages
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
