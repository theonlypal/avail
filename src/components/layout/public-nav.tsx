"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonShiny } from "@/components/ui/button-shiny";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/crm", label: "CRM" },
  { href: "/test-dialer", label: "AVAIL Co-Pilot", highlight: true },
  { href: "/demos", label: "Demos" },
  { href: "/pricing", label: "Pricing" },
  { href: "/intake", label: "Contact" },
];

// Premium AVAIL Logo component - Text only
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

export function PublicNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrolled = useScroll(10);

  // Detect if we're on a dashboard/app page (route starts with /(app))
  const isDashboardPage = pathname?.startsWith("/dashboard") ||
                          pathname?.startsWith("/analytics") ||
                          pathname?.startsWith("/demos");

  // Lock body scroll when mobile menu is open
  // NOTE: This hook MUST be before any early returns to satisfy React's rules of hooks
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

  // Don't show public nav on dashboard pages
  if (isDashboardPage) return null;

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-out',
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
        <nav
          className={cn(
            'flex w-full items-center justify-between transition-all duration-500 ease-out mx-auto',
            {
              'h-12 px-4': scrolled && !mobileMenuOpen,
              'h-16 px-4 sm:px-6 lg:px-8': !scrolled || mobileMenuOpen,
            },
          )}
        >
          {/* Logo */}
          <Link href="/" className="group relative z-10">
            <AVAILLogo scrolled={scrolled && !mobileMenuOpen} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const isHighlight = 'highlight' in link && link.highlight;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg font-medium transition-all duration-500",
                    active
                      ? "text-cyan-400"
                      : isHighlight
                        ? "text-emerald-400"
                        : "text-slate-400 hover:text-white",
                    scrolled ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm"
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20" />
                  )}
                  {isHighlight && !active && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20" />
                  )}
                  <span className="relative z-10">{link.label}</span>
                  {isHighlight && !active && (
                    <Sparkles className={cn("text-emerald-400 relative z-10 transition-all duration-500", scrolled ? "h-2.5 w-2.5" : "h-3 w-3")} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA Button - Desktop */}
          <div className="hidden md:block relative z-10">
            <Link href="/intake">
              <ButtonShiny variant="cyan" className={cn("transition-all duration-500", scrolled ? "h-8 px-3 text-sm" : "h-10 px-5")}>
                <span className="flex items-center gap-2">
                  <Sparkles className={cn("transition-all duration-500", scrolled ? "h-3 w-3" : "h-4 w-4")} />
                  <span className={cn("transition-all duration-500", scrolled && "hidden sm:inline")}>Get Started</span>
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
            className="lg:hidden relative z-10 h-9 w-9 border-white/[0.08] bg-transparent text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <MenuToggleIcon open={mobileMenuOpen} className="size-5" duration={300} />
          </Button>
        </nav>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'fixed top-16 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-t border-white/[0.06] bg-slate-950/98 backdrop-blur-xl lg:hidden transition-all duration-300',
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
        )}
      >
        <div
          data-slot={mobileMenuOpen ? 'open' : 'closed'}
          className={cn(
            'data-[slot=open]:animate-in data-[slot=open]:fade-in-0 data-[slot=open]:zoom-in-95',
            'data-[slot=closed]:animate-out data-[slot=closed]:fade-out-0 data-[slot=closed]:zoom-out-95',
            'ease-out flex h-full w-full flex-col justify-between gap-y-2 p-4',
          )}
        >
          <div className="grid gap-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const isHighlight = 'highlight' in link && link.highlight;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-300",
                    active
                      ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20"
                      : isHighlight
                        ? "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                  )}
                >
                  {link.label}
                  {isHighlight && !active && (
                    <Sparkles className="h-4 w-4 text-emerald-400 ml-auto" />
                  )}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
            <Link href="/intake" onClick={() => setMobileMenuOpen(false)} className="block">
              <ButtonShiny variant="cyan" className="w-full">
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
