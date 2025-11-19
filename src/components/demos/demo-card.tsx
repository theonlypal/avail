/**
 * Demo Card Component
 *
 * Beautiful card for showcasing AI demos
 * Matches the premium dark gradient design system
 */

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface DemoCardProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

const colorClasses = {
  blue: "from-blue-500/20 to-cyan-500/20",
  green: "from-green-500/20 to-emerald-500/20",
  purple: "from-purple-500/20 to-pink-500/20",
  yellow: "from-yellow-500/20 to-orange-500/20",
  pink: "from-pink-500/20 to-rose-500/20",
  red: "from-red-500/20 to-orange-500/20",
};

export function DemoCard({ id, title, subtitle, description, icon, color, features }: DemoCardProps) {
  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <Link href={`/demos/${id}`} className="block group">
      <div className={cn(
        "relative h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6",
        "hover:border-white/20 transition-all hover-lift cursor-pointer"
      )}>
        {/* Hover glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity blur-xl",
          colorClass
        )} />

        <div className="relative space-y-4">
          {/* Icon and Arrow */}
          <div className="flex items-start justify-between">
            <div className="text-5xl">{icon}</div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>

          {/* Title and Subtitle */}
          <div>
            <h3 className="text-xl font-semibold mb-1 text-white group-hover:text-white transition-colors">
              {title}
            </h3>
            <p className="text-sm text-cyan-400 font-medium">
              {subtitle}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {description}
          </p>

          {/* Features */}
          <div className="space-y-2 pt-2">
            {features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Badge */}
          <div className="pt-4">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
              Try Demo
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
