/**
 * AVAIL Demos - Interactive Feature Showcase
 *
 * Live working demos of all platform capabilities
 * Real data, real features, no fake content
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Users,
  Search,
  BarChart3,
  Bot,
  Calendar,
  MessageSquare,
  Database,
  Building2,
  Workflow,
  Play,
  ExternalLink,
  CheckCircle2,
  Rocket,
  Target,
  Phone,
  Mail,
  FileText,
  Settings,
  Globe,
  TrendingUp,
  Star,
  Share2,
} from "lucide-react";

// Live demos that actually work
const liveFeatures = [
  {
    id: "ai-discovery",
    title: "AI Lead Discovery",
    subtitle: "Find leads with natural language",
    description: "Search for any business type in any location. Our AI finds and enriches leads automatically with scoring.",
    icon: Search,
    color: "from-cyan-500 to-blue-500",
    href: "/dashboard",
    features: ["Natural language search", "Google Places integration", "Auto-enrichment with AI scoring"],
    isLive: true,
  },
  {
    id: "crm",
    title: "Full CRM System",
    subtitle: "Contacts, Deals, Pipeline",
    description: "Complete CRM with contacts, deals, activities, notes, tags, and full communication history.",
    icon: Users,
    color: "from-purple-500 to-pink-500",
    href: "/crm",
    features: ["Contact management", "Deal pipeline Kanban", "Activity tracking"],
    isLive: true,
  },
  {
    id: "automation",
    title: "Automation Engine",
    subtitle: "Set it and forget it",
    description: "Create automated workflows with triggers and actions. SMS, email, task creation, and more.",
    icon: Workflow,
    color: "from-orange-500 to-red-500",
    href: "/settings/automations",
    features: ["Multiple trigger types", "SMS & email actions", "Scheduled sequences"],
    isLive: true,
  },
  {
    id: "analytics",
    title: "Pipeline Analytics",
    subtitle: "Real-time insights",
    description: "Track win rates, pipeline value, conversion rates, and lead score distribution with live data.",
    icon: BarChart3,
    color: "from-green-500 to-emerald-500",
    href: "/analytics",
    features: ["Win/loss tracking", "Revenue forecasting", "Score distribution"],
    isLive: true,
  },
  {
    id: "booking",
    title: "Calendar Booking",
    subtitle: "Schedule meetings",
    description: "Let leads book meetings directly. Integrates with your calendar for seamless scheduling.",
    icon: Calendar,
    color: "from-blue-500 to-indigo-500",
    href: "/booking",
    features: ["Calendly integration", "Pre-filled forms", "Booking confirmations"],
    isLive: true,
  },
  {
    id: "inbox",
    title: "Unified Inbox",
    subtitle: "All communications",
    description: "SMS, email, and call history in one place. Never miss a lead communication again.",
    icon: MessageSquare,
    color: "from-teal-500 to-cyan-500",
    href: "/inbox",
    features: ["SMS integration", "Email tracking", "Call logging"],
    isLive: true,
  },
];

// Interactive showcase demos
const showcaseDemos = [
  {
    id: "avail-copilot",
    title: "AVAIL Co-Pilot",
    subtitle: "AI-Powered Auto-Dialer",
    description: "Make real calls with live AI coaching. Real-time transcription from 3 sources with intelligent suggestions as you speak.",
    icon: Phone,
    color: "from-emerald-500 to-green-500",
    href: "/test-dialer",
    preview: "Live transcription + AI coaching + Call recording - All in one view",
    isInteractive: true,
    highlight: true,
  },
  {
    id: "website",
    title: "ProPlumb Services",
    subtitle: "Live Website Demo",
    description: "See a complete business website with AI chat, lead capture, and real-time dashboard tracking. Watch leads flow in as you interact.",
    icon: Building2,
    color: "from-blue-600 to-cyan-500",
    href: "/demos-live/website",
    preview: "Split-view: Customer experience + Business dashboard side by side",
    isInteractive: true,
  },
  {
    id: "crm-demo",
    title: "CRM Dashboard",
    subtitle: "Live Data Demo",
    description: "Explore the full CRM with real contacts, deals, and messages. This is your actual database, not a mockup.",
    icon: Database,
    color: "from-purple-600 to-pink-500",
    href: "/demos-live/crm",
    preview: "Real database queries, live data tables, full CRUD operations",
    isInteractive: true,
  },
  {
    id: "reviews-demo",
    title: "Reviews Management",
    subtitle: "Reputation Demo",
    description: "Send review requests, track responses across Google, Yelp, and Facebook. Manage your online reputation.",
    icon: Star,
    color: "from-yellow-500 to-orange-500",
    href: "/demos-live/reviews",
    preview: "Multi-platform review requests, ratings tracking, response analytics",
    isInteractive: true,
  },
  {
    id: "social-demo",
    title: "Social Media Manager",
    subtitle: "Content Demo",
    description: "Schedule posts, manage assets, and generate AI captions. Complete social media management for your business.",
    icon: Share2,
    color: "from-pink-500 to-purple-500",
    href: "/demos-live/social",
    preview: "Content calendar, asset library, AI caption generator",
    isInteractive: true,
  },
];

// Quick access features
const quickLinks = [
  { title: "Leads", href: "/leads", icon: Target, description: "View all discovered leads" },
  { title: "Team", href: "/team", icon: Users, description: "Manage team members" },
  { title: "Settings", href: "/settings", icon: Settings, description: "Configure platform" },
  { title: "Intake Form", href: "/intake", icon: FileText, description: "Lead capture form" },
  { title: "Calculator", href: "/calculator", icon: TrendingUp, description: "ROI calculator" },
];

export default function DemosPage() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

      <main className="relative mx-auto max-w-7xl px-6 py-12 space-y-16">

        {/* Hero Section */}
        <section className="text-center space-y-8">
          {/* Live indicator */}
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="font-semibold">All Features Are Live - No Mockups</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
              See AVAIL
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              In Action
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Every demo below connects to real features with real data. Click any card to explore the actual working system.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-4">
            {[
              { icon: Zap, value: "6+", label: "Live Features" },
              { icon: Database, value: "Real", label: "Database" },
              { icon: Bot, value: "AI", label: "Powered" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <stat.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Showcase Demos */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 uppercase tracking-wider">
              <Play className="h-4 w-4" />
              Interactive Showcases
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Full Demo Experiences
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Immersive demos that show the complete customer and business experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showcaseDemos.map((demo) => {
              const isHighlight = 'highlight' in demo && demo.highlight;
              return (
                <Link
                  key={demo.id}
                  href={demo.href}
                  className={`group relative rounded-2xl border bg-gradient-to-br from-white/5 to-white/[0.02] p-8 transition-all duration-300 ${
                    isHighlight
                      ? 'border-emerald-500/40 hover:border-emerald-400/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${demo.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                  {/* Featured badge for AVAIL Co-Pilot */}
                  {isHighlight && (
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full text-xs font-bold text-white shadow-lg shadow-emerald-500/30 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      FEATURED
                    </div>
                  )}

                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${demo.color} ${isHighlight ? 'shadow-lg shadow-emerald-500/30' : ''}`}>
                        <demo.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        isHighlight
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        <Play className="h-3 w-3" />
                        Interactive
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{demo.title}</h3>
                      <p className={`font-medium ${isHighlight ? 'text-emerald-400' : 'text-cyan-400'}`}>{demo.subtitle}</p>
                    </div>

                    <p className="text-slate-300">{demo.description}</p>

                    <div className="pt-2 text-sm text-slate-400 border-t border-white/10">
                      {demo.preview}
                    </div>

                    <div className={`flex items-center gap-2 font-semibold transition-colors ${
                      isHighlight
                        ? 'text-emerald-400 group-hover:text-emerald-300'
                        : 'text-white group-hover:text-cyan-400'
                    }`}>
                      Launch Demo
                      <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Live Feature Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Live Platform Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Explore Each Module
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Click any feature to jump directly into the live system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveFeatures.map((feature) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="group relative rounded-xl border border-white/10 bg-slate-900/50 p-6 hover:border-cyan-500/30 hover:bg-slate-900/80 transition-all duration-300"
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${feature.color}`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    {feature.isLive && (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Live
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-cyan-400/80">{feature.subtitle}</p>
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Features list */}
                  <div className="space-y-2">
                    {feature.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-2 flex items-center gap-2 text-sm font-medium text-slate-400 group-hover:text-cyan-400 transition-colors">
                    Open Feature
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold text-center text-slate-300">Quick Access</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 hover:border-cyan-500/30 hover:bg-slate-800 transition-all"
              >
                <link.icon className="h-4 w-4 text-slate-400 group-hover:text-cyan-400" />
                <span className="text-sm text-slate-300 group-hover:text-white">{link.title}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 p-12 md:p-16">
          {/* Background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />

          <div className="relative text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-slate-300">
              Start discovering leads with AI or explore the full CRM system.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-bold shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Open Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/intake"
                className="inline-flex items-center rounded-xl border-2 border-white/30 bg-white/5 px-8 py-4 text-lg font-bold hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              >
                <FileText className="mr-2 h-5 w-5" />
                Try Intake Form
              </Link>
            </div>
          </div>
        </section>

        {/* Platform Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "CRM Modules", value: "6+", color: "text-cyan-400" },
            { label: "API Endpoints", value: "20+", color: "text-purple-400" },
            { label: "Automation Actions", value: "5+", color: "text-orange-400" },
            { label: "Real Database", value: "Yes", color: "text-green-400" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-slate-900/30 border border-white/5">
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

      </main>

      {/* Footer Spacer */}
      <div className="h-12"></div>
    </div>
  );
}
