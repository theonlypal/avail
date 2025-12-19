"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LayoutDashboard, Home, DollarSign, Phone, UserCircle, Play, Zap, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonShiny } from "@/components/ui/button-shiny";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import type { Team } from "@/types";

const routes = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Leads", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: UserCircle },
  { href: "/test-dialer", label: "AVAIL Co-Pilot", icon: Phone, highlight: true },
  { href: "/demos", label: "Demos", icon: Play },
  { href: "/pricing", label: "Pricing", icon: DollarSign },
];

// Premium AVAIL Logo component - Text only (matches landing page)
function AVAILLogo({ className, scrolled }: { className?: string; scrolled?: boolean }) {
  return (
    <div className={cn("flex items-center transition-all duration-500", className)}>
      <span className={cn(
        "font-bold bg-gradient-to-r from-cyan-400 via-white to-slate-300 bg-clip-text text-transparent tracking-tight transition-all duration-500",
        scrolled ? "text-xl" : "text-2xl"
      )}>
        AVAIL
      </span>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [team, setTeam] = useState<Team | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrolled = useScroll(10);

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full text-white transition-all duration-500 ease-out',
        mobileMenuOpen ? 'bg-slate-950/98 backdrop-blur-xl' : '',
        // Add padding when scrolled to create floating effect
        scrolled && !mobileMenuOpen ? 'py-3 px-4' : ''
      )}
    >
      {/* Inner container that becomes the floating pill */}
      <div
        className={cn(
          'mx-auto transition-all duration-500 ease-out',
          {
            // Scrolled state: floating pill effect
            'max-w-5xl rounded-2xl border border-white/[0.08] bg-slate-950/95 supports-[backdrop-filter]:bg-slate-950/80 backdrop-blur-xl shadow-2xl shadow-black/40':
              scrolled && !mobileMenuOpen,
            // Default state: full width, subtle background
            'max-w-full bg-slate-950/50 backdrop-blur-md border-b border-white/[0.04]':
              !scrolled && !mobileMenuOpen,
            // Mobile menu open state
            'max-w-full bg-transparent': mobileMenuOpen,
          },
        )}
      >
        <div className={cn(
          "max-w-full mx-auto transition-all duration-500 ease-out",
          scrolled && !mobileMenuOpen ? "px-4 py-2" : "px-6 py-3"
        )}>
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Team Info */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <AVAILLogo scrolled={scrolled && !mobileMenuOpen} />
              </Link>
              {team?.team_name && !scrolled && (
                <>
                  <div className="h-5 w-px bg-white/10" />
                  <div className="text-sm font-medium text-slate-400">
                    {team.team_name}
                  </div>
                </>
              )}
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
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
                      "relative flex items-center gap-2 rounded-lg font-medium transition-all duration-500",
                      active
                        ? "text-cyan-400"
                        : isHighlight
                          ? "text-emerald-400"
                          : "text-slate-400 hover:text-white",
                      scrolled ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
                    )}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20" />
                    )}
                    {isHighlight && !active && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20" />
                    )}
                    <route.icon className={cn(
                      "relative z-10 transition-all duration-500",
                      scrolled ? "h-3.5 w-3.5" : "h-4 w-4",
                      active ? "text-cyan-400" : isHighlight ? "text-emerald-400" : ""
                    )} />
                    <span className="relative z-10">{route.label}</span>
                    {isHighlight && !active && (
                      <Sparkles className={cn(
                        "text-emerald-400 relative z-10 transition-all duration-500",
                        scrolled ? "h-2.5 w-2.5" : "h-3 w-3"
                      )} />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action Button - hidden on mobile */}
            <div className="hidden sm:block">
              <Link href="/dashboard">
                <ButtonShiny variant="cyan" className={cn("transition-all duration-500", scrolled ? "h-8 px-3" : "h-10 px-5")}>
                  <span className="flex items-center gap-2">
                    <Sparkles className={cn("transition-all duration-500", scrolled ? "h-3 w-3" : "h-4 w-4")} />
                    <span className={cn("transition-all duration-500", scrolled && "hidden md:inline")}>Get Started</span>
                    <ArrowRight className={cn("transition-all duration-500", scrolled ? "h-3 w-3" : "h-4 w-4")} />
                  </span>
                </ButtonShiny>
              </Link>
            </div>

            {/* Mobile menu button */}
            <Button
              size="icon"
              variant="outline"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-9 w-9 border-white/[0.08] bg-transparent text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Toggle menu"
            >
              <MenuToggleIcon open={mobileMenuOpen} className="size-5" duration={300} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-slate-950 border-l border-white/10 lg:hidden transform transition-transform duration-300 ease-out',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 via-white to-slate-300 bg-clip-text text-transparent">
            AVAIL
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMobileMenuOpen(false)}
            className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        {/* Mobile Menu Content */}
        <div className="flex flex-col h-[calc(100%-65px)] overflow-y-auto">
          <nav className="flex-1 p-4">
            <div className="space-y-1">
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
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium transition-colors",
                      active
                        ? "bg-cyan-500/15 text-cyan-400"
                        : isHighlight
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <route.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{route.label}</span>
                    {isHighlight && !active && (
                      <Sparkles className="h-4 w-4 text-emerald-400 ml-auto flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-white/10">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block">
              <ButtonShiny variant="cyan" className="w-full h-11">
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </span>
              </ButtonShiny>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
