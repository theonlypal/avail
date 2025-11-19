/**
 * AVAIL Demos - Overview Page
 *
 * Beautiful showcase of all AI demonstration capabilities
 * Matches the premium homepage dark gradient design
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DemoCard } from "@/components/demos/demo-card";
import {
  Sparkles,
  Rocket,
  ArrowRight,
  Zap,
  Clock,
  TrendingUp,
  Users
} from "lucide-react";

interface Demo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export default function DemosPage() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/demos")
      .then((res) => res.json())
      .then((data) => {
        setDemos(data.demos);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading demos:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />

        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8">
            {/* Large AVAIL Logo Text */}
            <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
              AVAIL
            </h1>
            <div className="space-y-4">
              <div className="animate-spin-smooth rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="text-slate-300 text-lg">Loading amazing demos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

      <main className="relative mx-auto max-w-7xl px-6 py-20 space-y-24">

        {/* Hero Section */}
        <section className="text-center space-y-10 animate-fade-in">
          {/* Badge with enhanced design */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-2.5 text-sm text-cyan-300 shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="font-semibold">Interactive AI Demonstrations</span>
          </div>

          {/* Main headline with enhanced gradient */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
            Experience AVAIL in Action
          </h1>

          {/* Subheadline with better spacing */}
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Explore interactive demos showcasing how AVAIL's AI automation transforms businesses.
            See real results, not just promises.
          </p>

          {/* Enhanced CTA buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <Link
              href="/dashboard"
              className="group inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 px-10 py-5 text-lg font-bold shadow-xl shadow-blue-500/40 hover:shadow-cyan-500/60 transition-all duration-300 hover-lift"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Talk to Sales Representative
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#stats"
              className="inline-flex items-center rounded-xl border-2 border-cyan-400/30 bg-cyan-400/5 px-10 py-5 text-lg font-bold hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
            >
              View Success Stories
            </Link>
          </div>

          {/* Enhanced Company Stats with better visual treatment */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-5xl mx-auto" id="stats">
            {[
              { icon: Zap, label: "AI Availability", value: "24/7", color: "from-yellow-400 to-orange-400" },
              { icon: TrendingUp, label: "Average ROI", value: "10x", color: "from-green-400 to-emerald-400" },
              { icon: Users, label: "Satisfaction", value: "95%", color: "from-blue-400 to-cyan-400" },
              { icon: Clock, label: "Time Saved/Week", value: "20hrs", color: "from-purple-400 to-pink-400" }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="relative group stagger-fade-in rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-cyan-400/30 hover:bg-white/10 transition-all duration-300 hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300" />

                <div className="relative space-y-3">
                  <div className="flex items-center justify-center">
                    <div className={`rounded-full bg-gradient-to-r ${stat.color} p-3 shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                  <p className="text-sm font-semibold text-slate-300">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Demo Cards Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">Live Demonstrations</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Try Our AI Services
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Each demo is fully interactive. Click to explore how AVAIL works in real scenarios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demos.map((demo, index) => (
              <div key={demo.id} className="stagger-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <DemoCard {...demo} />
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-cyan-600/30 p-12 md:p-20 shadow-2xl shadow-blue-500/20">
          {/* Enhanced background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/30 via-transparent to-transparent" />

          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

          <div className="relative text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-slate-200">
              These demos show real results from businesses like yours.
              Let's discuss how AVAIL can help you achieve similar growth.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-xl bg-white text-slate-900 px-10 py-5 text-lg font-bold shadow-2xl hover:shadow-white/30 transition-all duration-300 hover-lift hover:scale-105"
              >
                Talk to Sales Representative
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="tel:6263947645"
                className="inline-flex items-center rounded-xl border-2 border-white/80 bg-white/10 px-10 py-5 text-lg font-bold hover:bg-white/20 hover:border-white transition-all duration-300"
              >
                Call (626) 394-7645
              </a>
            </div>

            <p className="text-sm text-slate-200 pt-6 font-medium">
              Enterprise-Ready Solutions • 24/7 Support • Custom Integration
            </p>
          </div>
        </section>

        {/* Social Proof / Testimonials Preview */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">Trusted By Leaders</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Proven Results Across Industries
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                metric: "65%",
                label: "Booking Rate Increase",
                company: "ProPlumb HVAC",
                color: "from-green-400 to-emerald-400"
              },
              {
                metric: "4.2→4.8",
                label: "Star Rating Improvement",
                company: "Dental Dynamics",
                color: "from-yellow-400 to-orange-400"
              },
              {
                metric: "0%",
                label: "Leads Lost After Hours",
                company: "Local Agency Co",
                color: "from-blue-400 to-cyan-400"
              }
            ].map((item, index) => (
              <div
                key={item.company}
                className="relative group rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 space-y-5 hover:border-cyan-400/30 hover:bg-white/10 transition-all duration-300 hover-lift stagger-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300" />

                <div className="relative">
                  <div className={`text-6xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-4`}>
                    {item.metric}
                  </div>
                  <p className="text-lg text-slate-100 font-bold mb-2">{item.label}</p>
                  <div className="h-px bg-gradient-to-r from-cyan-400/50 to-blue-400/50 my-4" />
                  <p className="text-sm text-cyan-400 font-semibold tracking-wide">{item.company}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer Spacer */}
      <div className="h-20"></div>
    </div>
  );
}
