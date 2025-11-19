"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const events = [
  {
    title: "New leads synced",
    detail: "12 HVAC shops added from Google Maps + Yelp",
    time: "08:12 AM",
    status: "success",
  },
  {
    title: "AI outreach queued",
    detail: "Ryan scheduled SMS follow-up for sd-022",
    time: "08:45 AM",
    status: "info",
  },
  {
    title: "CRM push",
    detail: "3 dental clinics sent to GoHighLevel pipeline",
    time: "09:10 AM",
    status: "success",
  },
  {
    title: "Needs attention",
    detail: "DC has 5 uncontacted med spas >90 score",
    time: "09:32 AM",
    status: "warning",
  },
];

export function ActivityTimeline() {
  return (
    <Card className="rounded-3xl border border-white/10 bg-white/[0.02] p-4">
      <h3 className="text-lg font-semibold text-white">Live Activity</h3>
      <ol className="mt-4 space-y-4 text-sm text-slate-400">
        {events.map((event, index) => (
          <li key={event.title} className="flex gap-3">
            <div
              className={cn(
                "mt-1 size-2 rounded-full",
                event.status === "success" && "bg-emerald-400",
                event.status === "info" && "bg-sky-400",
                event.status === "warning" && "bg-amber-400"
              )}
            />
            <div>
              <p className="text-white">{event.title}</p>
              <p>{event.detail}</p>
              <p className="text-[11px] text-slate-500">{event.time}</p>
              {index < events.length - 1 && <div className="mt-3 h-px bg-white/10" />}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
