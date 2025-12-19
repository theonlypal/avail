import * as React from "react"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonShinyProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    className?: string;
    variant?: "cyan" | "emerald" | "purple" | "amber";
}

/**
 * Premium shiny button with gradient effects
 * Matches AVAIL design system with cyan/blue theme
 */
function ButtonShiny({
    label = "Get Started",
    className,
    variant = "cyan",
    children,
    ...props
}: ButtonShinyProps) {
    const variants = {
        cyan: {
            border: "from-[#0e7490] via-[#0a1628] to-[#0369a1]",
            inner: "from-[#0a1628] via-[#0c1e35] to-[#0a1628]",
            glow: "from-[#22d3ee]/40 via-[#0c1e35] to-[#0ea5e9]/30",
            accent: "from-[#67e8f9]/10 via-[#0c1e35] to-[#164e63]/50",
            shadow: "rgba(34,211,238,0.15)",
            text: "from-[#a5f3fc] to-[#22d3ee]",
            textGlow: "rgba(34,211,238,0.4)",
            hover: "from-[#164e63]/20 via-[#22d3ee]/10 to-[#164e63]/20",
        },
        emerald: {
            border: "from-[#047857] via-[#0a1628] to-[#059669]",
            inner: "from-[#0a1628] via-[#0c2518] to-[#0a1628]",
            glow: "from-[#34d399]/40 via-[#0c2518] to-[#10b981]/30",
            accent: "from-[#6ee7b7]/10 via-[#0c2518] to-[#064e3b]/50",
            shadow: "rgba(52,211,153,0.15)",
            text: "from-[#a7f3d0] to-[#34d399]",
            textGlow: "rgba(52,211,153,0.4)",
            hover: "from-[#064e3b]/20 via-[#34d399]/10 to-[#064e3b]/20",
        },
        purple: {
            border: "from-[#654358] via-[#17092A] to-[#2F0D64]",
            inner: "from-[#170928] via-[#1d0d33] to-[#170928]",
            glow: "from-[#654358]/40 via-[#1d0d33] to-[#2F0D64]/30",
            accent: "from-[#C787F6]/10 via-[#1d0d33] to-[#2A1736]/50",
            shadow: "rgba(199,135,246,0.15)",
            text: "from-[#D69DDE] to-[#B873F8]",
            textGlow: "rgba(199,135,246,0.4)",
            hover: "from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20",
        },
        amber: {
            border: "from-[#b45309] via-[#1a1207] to-[#d97706]",
            inner: "from-[#1a1207] via-[#201a0c] to-[#1a1207]",
            glow: "from-[#fbbf24]/40 via-[#201a0c] to-[#f59e0b]/30",
            accent: "from-[#fde68a]/10 via-[#201a0c] to-[#78350f]/50",
            shadow: "rgba(251,191,36,0.15)",
            text: "from-[#fef3c7] to-[#fbbf24]",
            textGlow: "rgba(251,191,36,0.4)",
            hover: "from-[#78350f]/20 via-[#fbbf24]/10 to-[#78350f]/20",
        },
    };

    const v = variants[variant];

    return (
        <Button
            variant="ghost"
            className={cn(
                "group relative h-12 px-6 rounded-xl overflow-hidden transition-all duration-500",
                className
            )}
            {...props}
        >
            {/* Border gradient */}
            <div className={cn(
                "absolute inset-0 rounded-xl p-[2px] bg-gradient-to-b",
                v.border
            )}>
                <div className="absolute inset-0 bg-slate-950 rounded-xl opacity-90" />
            </div>

            {/* Inner background */}
            <div className="absolute inset-[2px] bg-slate-950 rounded-xl opacity-95" />

            {/* Gradient layers */}
            <div className={cn(
                "absolute inset-[2px] bg-gradient-to-r rounded-xl opacity-90",
                v.inner
            )} />
            <div className={cn(
                "absolute inset-[2px] bg-gradient-to-b rounded-xl opacity-80",
                v.glow
            )} />
            <div className={cn(
                "absolute inset-[2px] bg-gradient-to-br rounded-xl",
                v.accent
            )} />

            {/* Inner glow */}
            <div
                className="absolute inset-[2px] rounded-xl"
                style={{ boxShadow: `inset 0 0 15px ${v.shadow}` }}
            />

            {/* Content */}
            <div
                className={cn(
                    "relative flex items-center justify-center gap-2 text-base font-medium tracking-tight",
                    variant === "cyan" && "text-cyan-300",
                    variant === "emerald" && "text-emerald-300",
                    variant === "purple" && "text-purple-300",
                    variant === "amber" && "text-amber-300",
                )}
                style={{ filter: `drop-shadow(0 0 12px ${v.textGlow})` }}
            >
                {children || label}
            </div>

            {/* Hover effect */}
            <div className={cn(
                "absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r group-hover:opacity-100 rounded-xl",
                v.hover
            )} />
        </Button>
    );
}

/**
 * Minimal shiny button for inline use
 */
function ButtonShinyMinimal({
    label = "Learn more",
    className,
    variant = "cyan",
    children,
    ...props
}: ButtonShinyProps) {
    const colors = {
        cyan: "from-cyan-400 to-blue-500",
        emerald: "from-emerald-400 to-green-500",
        purple: "from-purple-400 to-pink-500",
        amber: "from-amber-400 to-orange-500",
    };

    return (
        <button
            className={cn(
                "group relative inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-300",
                className
            )}
            {...props}
        >
            <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                colors[variant]
            )}>
                {children || label}
            </span>
            <svg
                className={cn(
                    "w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5",
                    variant === "cyan" && "text-cyan-400",
                    variant === "emerald" && "text-emerald-400",
                    variant === "purple" && "text-purple-400",
                    variant === "amber" && "text-amber-400",
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className={cn(
                "absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full",
                colors[variant]
            )} />
        </button>
    );
}

export { ButtonShiny, ButtonShinyMinimal }
