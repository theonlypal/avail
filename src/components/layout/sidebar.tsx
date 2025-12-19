"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, MessagesSquare, Users, LayoutDashboard, Sparkles, Home, DollarSign, Phone, UserCircle, Play, Zap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Team } from "@/types";

const routes = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Leads", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: UserCircle },
  { href: "/test-dialer", label: "AVAIL Co-Pilot", icon: Phone, highlight: true },
  { href: "/demos", label: "Demos", icon: Play },
  { href: "/analytics", label: "Analytics", icon: Map },
  { href: "/team", label: "Team", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const [team, setTeam] = useState<Team | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/team')
      .then(res => res.json())
      .then(setTeam)
      .catch(console.error);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <aside className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/95 backdrop-blur-xl text-white shadow-lg shadow-black/20">
      <div className="max-w-full mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Team Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">AVAIL</div>
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
              // Exact matching to prevent /leads from highlighting /demos, etc.
              const active =
                route.href.includes('#')
                  ? false // Hash links like /#pricing never show as active
                  : route.href === '/'
                    ? pathname === '/' // Exact match for home
                    : pathname === route.href || pathname.startsWith(route.href + '/'); // Exact or child routes only
              const isHighlight = 'highlight' in route && route.highlight;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                      : isHighlight
                        ? "bg-gradient-to-r from-emerald-600/20 to-green-600/20 text-emerald-400 border border-emerald-500/30 hover:from-emerald-600/30 hover:to-green-600/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <route.icon className={cn("h-4 w-4", isHighlight && !active && "text-emerald-400")} />
                  {route.label}
                  {isHighlight && !active && (
                    <Zap className="h-3 w-3 text-emerald-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Button - hidden on mobile */}
          <Button className="hidden sm:flex bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30" asChild>
            <Link href="/dashboard">Launch Workflow</Link>
          </Button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/98 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {routes.map((route) => {
              const active =
                route.href.includes('#')
                  ? false
                  : route.href === '/'
                    ? pathname === '/'
                    : pathname === route.href || pathname.startsWith(route.href + '/');
              const isHighlight = 'highlight' in route && route.highlight;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all",
                    active
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                      : isHighlight
                        ? "bg-gradient-to-r from-emerald-600/20 to-green-600/20 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <route.icon className={cn("h-5 w-5", isHighlight && !active && "text-emerald-400")} />
                  {route.label}
                  {isHighlight && !active && (
                    <Zap className="h-4 w-4 text-emerald-400 animate-pulse ml-auto" />
                  )}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-white/10">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold" asChild>
                <Link href="/dashboard">Launch Workflow</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
