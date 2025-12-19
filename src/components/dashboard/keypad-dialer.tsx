"use client";

import { useState } from "react";
import { Phone, PhoneOff, Delete, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedCallWrapper } from "@/components/dashboard/unified-call-wrapper";
import type { Lead } from "@/types";

interface KeypadDialerProps {
  onClose: () => void;
}

export function KeypadDialer({ onClose }: KeypadDialerProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [calling, setCalling] = useState(false);
  const [callLead, setCallLead] = useState<Lead | null>(null);

  const handleDigit = (digit: string) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(phoneNumber + digit);
    }
  };

  const handleDelete = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleCall = () => {
    if (phoneNumber.length >= 10) {
      // Format phone number with +1 if not already present
      const formattedNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : phoneNumber.startsWith('1')
          ? `+${phoneNumber}`
          : `+1${phoneNumber}`;

      // Create a temporary lead object for the call
      const tempLead: Lead = {
        id: `manual-${Date.now()}`,
        business_name: "Manual Dial",
        phone: formattedNumber,
        location: "Manual Entry",
        opportunity_score: 0,
        industry: "Unknown",
        pain_points: [],
        rating: 0,
        review_count: 0,
        created_at: new Date().toISOString(),
        email: null,
        website: null,
        website_score: 0,
        social_presence: null,
        ad_presence: false,
        recommended_services: [],
        ai_summary: null,
        lat: null,
        lng: null,
        added_by: null,
      };

      setCallLead(tempLead);
      setCalling(true);
    }
  };

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  if (calling && callLead) {
    return (
      <UnifiedCallWrapper
        lead={callLead}
        onClose={() => {
          setCalling(false);
          setCallLead(null);
          setPhoneNumber("");
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Keypad Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl p-8">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-10 w-10 rounded-full hover:bg-white/10 text-slate-400"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Quick Dial</h2>
          <p className="text-sm text-slate-400">Enter a phone number to call</p>
        </div>

        {/* Phone Number Display */}
        <div className="mb-8 p-6 rounded-2xl bg-slate-900/60 border border-white/10 min-h-[80px] flex items-center justify-center">
          {phoneNumber ? (
            <div className="text-3xl font-mono font-bold text-white tracking-wider">
              {phoneNumber}
            </div>
          ) : (
            <div className="text-2xl text-slate-500">Enter number</div>
          )}
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {keypadButtons.map((row, rowIndex) =>
            row.map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700/70 border border-white/10 text-2xl font-semibold text-white transition-all hover:scale-105 hover:border-cyan-500/40 active:scale-95"
              >
                {digit}
              </button>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Delete Button */}
          <Button
            onClick={handleDelete}
            disabled={phoneNumber.length === 0}
            variant="outline"
            className="flex-1 h-14 rounded-2xl border-white/10 bg-slate-800/50 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 disabled:opacity-30 disabled:hover:bg-slate-800/50"
          >
            <Delete className="h-5 w-5" />
          </Button>

          {/* Call Button */}
          <Button
            onClick={handleCall}
            disabled={phoneNumber.length < 10}
            className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/30 disabled:opacity-30 disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-slate-500 text-center mt-4">
          Enter at least 10 digits to initiate call
        </p>
      </div>
    </div>
  );
}
