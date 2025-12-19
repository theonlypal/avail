"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
  gradientFrom = "rgba(120, 119, 198, 0.3)",
  gradientTo = "rgba(74, 222, 222, 0.1)",
  ...props
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (cardRef.current) {
        const { left, top } = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
      }
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  useEffect(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative rounded-2xl border border-white/[0.04] bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-300",
        "hover:border-white/[0.08] hover:shadow-xl hover:shadow-black/30",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Gradient overlay that follows mouse */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientFrom}, ${gradientTo}, transparent 80%)
          `,
        }}
      />

      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Premium stat card variant of MagicCard
 * Designed for dashboard metrics and KPIs
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string | number;
    positive?: boolean;
  };
  accentColor?: "cyan" | "emerald" | "purple" | "amber" | "blue" | "green" | "pink" | "orange";
  href?: string;
}

const accentColors = {
  cyan: {
    gradient: "rgba(6, 182, 212, 0.2)",
    icon: "text-cyan-400",
    iconBg: "from-cyan-500/20 to-cyan-600/10",
    value: "text-cyan-400",
    border: "group-hover:border-cyan-500/30",
  },
  emerald: {
    gradient: "rgba(16, 185, 129, 0.2)",
    icon: "text-emerald-400",
    iconBg: "from-emerald-500/20 to-emerald-600/10",
    value: "text-emerald-400",
    border: "group-hover:border-emerald-500/30",
  },
  purple: {
    gradient: "rgba(168, 85, 247, 0.2)",
    icon: "text-purple-400",
    iconBg: "from-purple-500/20 to-purple-600/10",
    value: "text-purple-400",
    border: "group-hover:border-purple-500/30",
  },
  amber: {
    gradient: "rgba(245, 158, 11, 0.2)",
    icon: "text-amber-400",
    iconBg: "from-amber-500/20 to-amber-600/10",
    value: "text-amber-400",
    border: "group-hover:border-amber-500/30",
  },
  blue: {
    gradient: "rgba(59, 130, 246, 0.2)",
    icon: "text-blue-400",
    iconBg: "from-blue-500/20 to-blue-600/10",
    value: "text-blue-400",
    border: "group-hover:border-blue-500/30",
  },
  green: {
    gradient: "rgba(34, 197, 94, 0.2)",
    icon: "text-green-400",
    iconBg: "from-green-500/20 to-green-600/10",
    value: "text-green-400",
    border: "group-hover:border-green-500/30",
  },
  pink: {
    gradient: "rgba(236, 72, 153, 0.2)",
    icon: "text-pink-400",
    iconBg: "from-pink-500/20 to-pink-600/10",
    value: "text-pink-400",
    border: "group-hover:border-pink-500/30",
  },
  orange: {
    gradient: "rgba(249, 115, 22, 0.2)",
    icon: "text-orange-400",
    iconBg: "from-orange-500/20 to-orange-600/10",
    value: "text-orange-400",
    border: "group-hover:border-orange-500/30",
  },
};

export function StatCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  accentColor = "cyan",
  href,
  className,
  ...props
}: StatCardProps) {
  const colors = accentColors[accentColor];

  const content = (
    <MagicCard
      gradientFrom={colors.gradient}
      gradientTo="transparent"
      className={cn(
        "p-5 transition-all duration-300",
        colors.border,
        href && "cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className={cn(
            "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center",
            colors.iconBg
          )}>
            <div className={colors.icon}>{icon}</div>
          </div>
        )}
      </div>

      <div className={cn("text-3xl font-bold tracking-tight", colors.value)}>
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {subtitle && (
            <span className="text-xs text-slate-500">{subtitle}</span>
          )}
          {trend && (
            <span className={cn(
              "text-xs font-medium flex items-center gap-0.5",
              trend.positive ? "text-emerald-400" : "text-red-400"
            )}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      )}
    </MagicCard>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

/**
 * Compact stat card for secondary metrics
 */
export function CompactStatCard({
  icon,
  title,
  value,
  accentColor = "cyan",
  href,
  className,
  ...props
}: Omit<StatCardProps, "subtitle" | "trend">) {
  const colors = accentColors[accentColor];

  const content = (
    <MagicCard
      gradientFrom={colors.gradient}
      gradientTo="transparent"
      gradientSize={150}
      className={cn(
        "p-4 transition-all duration-300",
        colors.border,
        href && "cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
            colors.iconBg
          )}>
            <div className={colors.icon}>{icon}</div>
          </div>
        )}
        <div className="min-w-0">
          <div className={cn("text-xl font-bold", colors.value)}>{value}</div>
          <div className="text-xs text-slate-500 truncate">{title}</div>
        </div>
      </div>
    </MagicCard>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

/**
 * Navigation card for CRM quick links
 */
export interface NavCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  accentColor?: keyof typeof accentColors;
}

export function NavCard({
  icon,
  label,
  href,
  active = false,
  accentColor = "cyan",
  className,
  ...props
}: NavCardProps) {
  const colors = accentColors[accentColor];

  return (
    <Link href={href}>
      <MagicCard
        gradientFrom={active ? colors.gradient : "rgba(255, 255, 255, 0.05)"}
        gradientTo="transparent"
        gradientSize={120}
        className={cn(
          "p-4 flex flex-col items-center gap-2 transition-all duration-300",
          active
            ? cn("border-white/20", colors.border)
            : "hover:border-white/15",
          className
        )}
        {...props}
      >
        <div className={cn(
          "transition-colors duration-300",
          active ? colors.icon : "text-slate-400 group-hover:text-slate-300"
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-sm font-medium transition-colors duration-300",
          active ? "text-white" : "text-slate-400 group-hover:text-slate-300"
        )}>
          {label}
        </span>
      </MagicCard>
    </Link>
  );
}
