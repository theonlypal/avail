/**
 * TEST AUTO-DIALER PAGE
 *
 * Simple test page to initiate calls with any phone number
 * Features live transcription and AI coaching during calls
 */

"use client";

import { useState } from "react";
import { Phone, Sparkles, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import LiveCallCoach from "@/components/live-call-coach";

export default function TestDialerPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [callStarted, setCallStarted] = useState(false);
  const [error, setError] = useState("");

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError("");
  };

  const validatePhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 || digits.length === 11;
  };

  const handleStartCall = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    // Convert to E.164 format for calling
    const digits = phoneNumber.replace(/\D/g, "");
    const e164Phone = digits.length === 11 ? `+${digits}` : `+1${digits}`;

    // Initiate actual Twilio call
    try {
      const response = await fetch("/api/calls/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: `test-${Date.now()}`,
          to_number: e164Phone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to initiate call");
        alert(`Failed to start call: ${result.error}\n\n${result.details || ""}`);
        return;
      }

      console.log(`✅ Twilio call initiated to ${e164Phone} - Call SID: ${result.call_sid}`);
      setCallStarted(true);
    } catch (err: any) {
      setError("Failed to initiate call");
      alert(`Failed to start call: ${err.message}`);
      console.error("Call initiation error:", err);
    }
  };

  const handleCallEnd = async (transcript: any[], duration: number) => {
    console.log("[Test Dialer] Call ended", { duration, transcriptLength: transcript.length });

    // Save to database if desired
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: null,
          direction: "outbound",
          channel: "sms",
          body: JSON.stringify(transcript),
          status: "completed",
          metadata: {
            type: "test_call",
            duration,
            ai_coached: true,
            phone_number: phoneNumber,
            business_name: businessName || "Test Call"
          },
        }),
      });
    } catch (error) {
      console.error("[Test Dialer] Failed to save call:", error);
    }

    // Reset form
    setCallStarted(false);
    setPhoneNumber("");
    setBusinessName("");
  };

  // If call started, show LiveCallCoach
  if (callStarted) {
    const digits = phoneNumber.replace(/\D/g, "");
    const e164Phone = digits.length === 11 ? `+${digits}` : `+1${digits}`;

    const leadContext = {
      id: `test-${Date.now()}`,
      name: businessName || "Test Call",
      phone: e164Phone,
      website: "",
      address: "",
      business_type: "Test",
      rating: undefined,
      user_ratings_total: undefined,
      score: undefined,
      place_id: undefined,
    };

    return <LiveCallCoach lead={leadContext} onCallEnd={handleCallEnd} />;
  }

  // Show phone input form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-white/10 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Phone className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Test Auto-Dialer</h1>
              <p className="text-slate-400 mt-1">
                Enter a phone number to start a test call with live AI coaching
              </p>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300">
                <p className="font-medium mb-1">Real Twilio Calls with AI Coaching</p>
                <p className="text-slate-400">
                  This makes a REAL phone call via Twilio to the number you enter. Your microphone will
                  capture your side of the conversation for real-time transcription (307ms latency) with
                  instant AI coaching suggestions powered by Claude Sonnet 4.5.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-xl mt-0.5">ℹ️</span>
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Twilio Required</p>
                <p className="text-blue-300/80">
                  This requires <span className="font-mono bg-blue-500/20 px-1 rounded">TWILIO_ACCOUNT_SID</span>,{' '}
                  <span className="font-mono bg-blue-500/20 px-1 rounded">TWILIO_AUTH_TOKEN</span>, and{' '}
                  <span className="font-mono bg-blue-500/20 px-1 rounded">TWILIO_PHONE_NUMBER</span> environment
                  variables to be configured in Vercel.
                </p>
              </div>
            </div>
          </div>

          {typeof window !== 'undefined' && window.location.protocol !== 'https:' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-xl mt-0.5">⚠️</span>
                <div className="text-sm text-yellow-200">
                  <p className="font-medium mb-1">HTTPS Required</p>
                  <p className="text-yellow-300/80">
                    Microphone access requires HTTPS. This feature works on the production deployment at{' '}
                    <span className="font-mono bg-yellow-500/20 px-1 rounded">https://</span> but may not work on localhost.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phone Input Form */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Business Name (Optional)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Joe's Pizza"
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              />
              <p className="text-xs text-slate-500 mt-1">
                Used to personalize the call coaching context
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className={`w-full bg-slate-800/50 border ${
                  error ? "border-red-500/50" : "border-white/10"
                } rounded-lg px-4 py-3 text-white text-lg placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50`}
              />
              {error && (
                <p className="text-sm text-red-400 mt-2">{error}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Enter a valid 10-digit US phone number
              </p>
            </div>

            <div className="bg-slate-800/30 border border-white/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">
                What happens when you start the call:
              </h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Twilio will place a REAL phone call to the number you entered</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Your microphone will be activated to capture your side of the conversation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Real-time transcription will begin (307ms latency via AssemblyAI)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>AI will provide live coaching suggestions as the conversation progresses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Full transcript and notes will be saved when call ends</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleStartCall}
              disabled={!phoneNumber.trim()}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              <Phone className="h-5 w-5 mr-2" />
              Start Call with AI Coaching
            </Button>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/30 border border-white/10 rounded-xl p-4">
            <div className="text-cyan-400 font-semibold mb-1">307ms Latency</div>
            <div className="text-xs text-slate-400">Real-time transcription</div>
          </div>
          <div className="bg-slate-900/30 border border-white/10 rounded-xl p-4">
            <div className="text-emerald-400 font-semibold mb-1">Claude 4.5</div>
            <div className="text-xs text-slate-400">AI coaching engine</div>
          </div>
          <div className="bg-slate-900/30 border border-white/10 rounded-xl p-4">
            <div className="text-purple-400 font-semibold mb-1">Auto-Save</div>
            <div className="text-xs text-slate-400">Full call records</div>
          </div>
        </div>

        {/* Quick Test Numbers */}
        <div className="mt-8 bg-slate-900/30 border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Quick Test Numbers</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPhoneNumber("(555) 123-4567")}
              className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
            >
              (555) 123-4567
            </button>
            <button
              onClick={() => setPhoneNumber("(555) 987-6543")}
              className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
            >
              (555) 987-6543
            </button>
            <button
              onClick={() => setPhoneNumber("(555) 111-2222")}
              className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
            >
              (555) 111-2222
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            These are test numbers for demo purposes only
          </p>
        </div>
      </div>
    </div>
  );
}
