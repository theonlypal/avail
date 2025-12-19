"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CalendlyEmbed } from "@/components/calendar/calendly-embed";
import { Calendar, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

function BookingContent() {
  const searchParams = useSearchParams();
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Get prefill data from URL params (from intake form)
  const name = searchParams.get("name") || "";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";

  // Default Calendly URL - this would be configured per team in a real app
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/leadly-demo";

  const handleEventScheduled = (event: any) => {
    setBookingDetails(event);
    setBookingComplete(true);

    // Log the booking to our system
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        team_id: "default-team",
        external_id: event.invitee?.uri || event.event?.uri,
        title: event.event?.name || "Meeting",
        attendee_name: event.invitee?.name || name,
        attendee_email: event.invitee?.email || email,
        start_time: event.event?.start_time,
        end_time: event.event?.end_time,
        status: "scheduled",
      }),
    }).catch(console.error);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Meeting Scheduled!
          </h1>
          <p className="text-slate-400 mb-8">
            Your meeting has been booked. You&apos;ll receive a confirmation email with all the details.
          </p>

          {bookingDetails?.event?.start_time && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10 mb-6">
              <p className="text-sm text-slate-400 mb-1">Scheduled for</p>
              <p className="text-lg font-semibold text-white">
                {new Date(bookingDetails.event.start_time).toLocaleString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-lg bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg bg-slate-800/50 border border-white/10 hover:border-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="h-8 w-8 text-cyan-400" />
              Schedule a Meeting
            </h1>
            <p className="text-slate-400 mt-1">
              Choose a time that works best for you
            </p>
          </div>
        </div>

        {/* Prefill Info */}
        {(name || email) && (
          <div className="mb-6 p-4 rounded-xl bg-slate-800/30 border border-white/10">
            <p className="text-sm text-slate-400">
              Booking for: <span className="text-white font-medium">{name || email}</span>
            </p>
          </div>
        )}

        {/* Calendly Embed */}
        <div className="rounded-2xl bg-white overflow-hidden">
          <CalendlyEmbed
            url={calendlyUrl}
            prefill={{ name, email, phone }}
            onEventScheduled={handleEventScheduled}
            styles={{ height: "700px" }}
          />
        </div>

        {/* Alternative */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Having trouble? Contact us directly at{" "}
            <a href="mailto:hello@leadly.ai" className="text-cyan-400 hover:underline">
              hello@leadly.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading booking calendar...</div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
