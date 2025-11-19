"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, MessagesSquare, Users, LayoutDashboard, Sparkles, Home, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Team } from "@/types";

const routes = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Leadly.AI", icon: LayoutDashboard },
  { href: "/demos", label: "Demos", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: Map },
  { href: "/team", label: "Team", icon: Users },
  { href: "/#pricing", label: "Pricing", icon: DollarSign },
];

export function Sidebar() {
  const pathname = usePathname();
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    fetch('/api/team')
      .then(res => res.json())
      .then(setTeam)
      .catch(console.error);
  }, []);

  return (
    <aside className="w-full border-b border-white/10 bg-slate-950/50 backdrop-blur-xl text-white">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo and Team Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">LEADLY.AI</div>
              {team?.team_name && (
                <>
                  <div className="h-4 w-px bg-white/20" />
                  <div className="text-lg font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Team {team.team_name}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            {routes.map((route) => {
              const active = pathname.startsWith(route.href);
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Button */}
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30" asChild>
            <Link href="/dashboard">Launch Workflow</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
