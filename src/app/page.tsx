/**
 * AVAIL - Homepage
 *
 * Premium production-grade AI services platform homepage
 * Uses MagicCard styling for sophisticated hover effects
 * Clean, professional design with real CTAs
 */

"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calendar,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  BarChart3,
  Shield,
  Clock,
  Target,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { ButtonShiny } from "@/components/ui/button-shiny";
import { motion } from "framer-motion";

const aiServices = [
  {
    title: "AI Lead Discovery",
    description: "Find and qualify high-value leads automatically using AI-powered search and analysis",
    icon: Target,
    features: ["Google Maps integration", "AI scoring", "Auto-enrichment"],
    accentColor: "cyan" as const,
    href: "/dashboard",
  },
  {
    title: "CRM & Pipeline",
    description: "Manage contacts, deals, and your sales pipeline with a modern, intuitive interface",
    icon: Users,
    features: ["Contact management", "Deal tracking", "Custom pipelines"],
    accentColor: "blue" as const,
    href: "/crm/contacts",
  },
  {
    title: "Automation Engine",
    description: "Set up automated workflows for SMS, email, and task creation based on triggers",
    icon: Zap,
    features: ["SMS automation", "Email sequences", "Task creation"],
    accentColor: "amber" as const,
    href: "/settings/automations",
  },
  {
    title: "Communication Hub",
    description: "Unified inbox for SMS, email, and call logging with full conversation history",
    icon: MessageSquare,
    features: ["SMS send/receive", "Email integration", "Call logging"],
    accentColor: "purple" as const,
    href: "/inbox",
  },
  {
    title: "Calendar Booking",
    description: "Let leads book appointments directly with integrated scheduling",
    icon: Calendar,
    features: ["Calendly integration", "Booking forms", "Confirmations"],
    accentColor: "emerald" as const,
    href: "/intake",
  },
  {
    title: "Analytics & Insights",
    description: "Real-time metrics and pipeline analytics to track your sales performance",
    icon: BarChart3,
    features: ["Pipeline analytics", "Win rates", "Lead scoring"],
    accentColor: "pink" as const,
    href: "/analytics",
  },
];

const accentColorMap = {
  cyan: {
    gradient: "rgba(6, 182, 212, 0.15)",
    iconBg: "from-cyan-500/20 to-cyan-600/10",
    icon: "text-cyan-400",
    badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
  },
  blue: {
    gradient: "rgba(59, 130, 246, 0.15)",
    iconBg: "from-blue-500/20 to-blue-600/10",
    icon: "text-blue-400",
    badge: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  },
  amber: {
    gradient: "rgba(245, 158, 11, 0.15)",
    iconBg: "from-amber-500/20 to-amber-600/10",
    icon: "text-amber-400",
    badge: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  },
  purple: {
    gradient: "rgba(168, 85, 247, 0.15)",
    iconBg: "from-purple-500/20 to-purple-600/10",
    icon: "text-purple-400",
    badge: "bg-purple-500/10 border-purple-500/30 text-purple-300",
  },
  emerald: {
    gradient: "rgba(16, 185, 129, 0.15)",
    iconBg: "from-emerald-500/20 to-emerald-600/10",
    icon: "text-emerald-400",
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  },
  pink: {
    gradient: "rgba(236, 72, 153, 0.15)",
    iconBg: "from-pink-500/20 to-pink-600/10",
    icon: "text-pink-400",
    badge: "bg-pink-500/10 border-pink-500/30 text-pink-300",
  },
};

const platformCapabilities = [
  { label: "AI Availability", value: "24/7", icon: Clock, color: "cyan" },
  { label: "Lead Scoring", value: "Automated", icon: Target, color: "emerald" },
  { label: "Response Time", value: "Instant", icon: Zap, color: "amber" },
  { label: "Integration", value: "Seamless", icon: Shield, color: "purple" },
];

const howItWorks = [
  {
    step: "1",
    title: "Discover Leads",
    description: "Use AI-powered search to find qualified leads in any industry and location automatically",
    icon: Target,
    accentColor: "cyan" as const,
  },
  {
    step: "2",
    title: "Engage & Nurture",
    description: "Set up automated SMS and email sequences to engage leads at the right time",
    icon: MessageSquare,
    accentColor: "purple" as const,
  },
  {
    step: "3",
    title: "Close & Track",
    description: "Manage your pipeline, track deals, and analyze performance with real-time analytics",
    icon: TrendingUp,
    accentColor: "emerald" as const,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />

      <main className="relative mx-auto flex max-w-7xl flex-col gap-28 px-6 py-20">

        {/* HERO SECTION */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
        >
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">AI-Powered Lead Management</span>
            </div>

            <h1 className="text-5xl font-bold leading-[1.1] md:text-6xl lg:text-7xl tracking-tight">
              <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                Find, Engage, and Convert Leads with AI
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              AVAIL discovers qualified leads, automates your outreach, and helps you close more deals.
              Built for businesses that want to grow faster.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/dashboard">
                <ButtonShiny variant="cyan" className="px-8">
                  <span className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </ButtonShiny>
              </Link>
              <Link href="/intake">
                <ButtonShiny variant="emerald" label="Book a Demo" className="px-8" />
              </Link>
            </div>

            {/* Platform Capabilities */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {platformCapabilities.map((capability, index) => (
                <motion.div
                  key={capability.label}
                  variants={itemVariants}
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <capability.icon className={`h-4 w-4 text-${capability.color}-400`} />
                    <p className="text-lg font-bold text-white">{capability.value}</p>
                  </div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{capability.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature Preview Card */}
          <motion.div variants={itemVariants} className="relative">
            <MagicCard
              className="p-8 bg-slate-900/40"
              gradientFrom="rgba(6, 182, 212, 0.12)"
              gradientTo="rgba(59, 130, 246, 0.06)"
              gradientSize={300}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">AI Lead Discovery</p>
                    <p className="text-sm text-slate-500">Powered by Google Places + AI</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Target, color: "cyan", title: "Lead Discovery", desc: "Find businesses by industry and location with AI scoring" },
                    { icon: Zap, color: "amber", title: "Automation", desc: "Automated SMS and email sequences" },
                    { icon: BarChart3, color: "emerald", title: "Analytics", desc: "Real-time pipeline metrics and insights" },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="rounded-xl border border-white/[0.03] bg-slate-950/60 p-4 hover:border-white/[0.08] hover:bg-slate-950/80 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-1.5">
                        <feature.icon className={`h-4 w-4 text-${feature.color}-400`} />
                        <span className="text-sm font-medium text-slate-200">{feature.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 pl-7">{feature.desc}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 py-3.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/15 hover:border-cyan-500/30 transition-all duration-300"
                >
                  Try Lead Discovery
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </MagicCard>
          </motion.div>
        </motion.section>

        {/* SERVICES SECTION */}
        <section className="space-y-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 max-w-3xl mx-auto"
          >
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">Platform Features</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything You Need to Grow Your Business
            </h2>
            <p className="text-lg text-slate-400">
              A complete platform for lead generation, CRM, automation, and analytics.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {aiServices.map((service, index) => {
              const colors = accentColorMap[service.accentColor];
              return (
                <motion.div key={service.title} variants={itemVariants}>
                  <Link href={service.href}>
                    <MagicCard
                      className="p-6 h-full cursor-pointer group bg-slate-900/40"
                      gradientFrom={colors.gradient}
                      gradientTo="transparent"
                      gradientSize={200}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`rounded-xl bg-gradient-to-br ${colors.iconBg} p-3 border border-white/[0.03]`}>
                            <service.icon className={`h-5 w-5 ${colors.icon}`} />
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all duration-300" />
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {service.title}
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {service.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {service.features.map((feature) => (
                            <span
                              key={feature}
                              className="text-xs px-2.5 py-1 rounded-full bg-slate-950/60 text-slate-400 border border-white/[0.03]"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </MagicCard>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section className="space-y-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 max-w-3xl mx-auto"
          >
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Get Started in 3 Steps
            </h2>
            <p className="text-lg text-slate-400">
              From lead discovery to closed deals, we make it simple.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid gap-6 md:grid-cols-3"
          >
            {howItWorks.map((item, index) => {
              const colors = accentColorMap[item.accentColor];
              return (
                <motion.div key={item.step} variants={itemVariants} className="relative">
                  <div className="absolute -top-6 -left-2 text-[80px] font-bold text-white/[0.02] select-none pointer-events-none">
                    {item.step}
                  </div>
                  <MagicCard
                    className="p-6 h-full relative bg-slate-900/40"
                    gradientFrom={colors.gradient}
                    gradientTo="transparent"
                    gradientSize={180}
                  >
                    <div className="space-y-4">
                      <div className={`rounded-xl bg-gradient-to-br ${colors.iconBg} p-3 w-fit border border-white/[0.03]`}>
                        <item.icon className={`h-5 w-5 ${colors.icon}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </MagicCard>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ABOUT SECTION */}
        <section className="space-y-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 max-w-3xl mx-auto"
          >
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">About AVAIL</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Built for Modern Sales Teams
            </h2>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <p className="text-slate-400 leading-relaxed">
                AVAIL was built to solve a common problem: finding and engaging qualified leads takes too much time.
                Our AI-powered platform automates the tedious parts of sales so you can focus on closing deals.
              </p>
              <p className="text-slate-400 leading-relaxed">
                With integrated lead discovery, CRM, automation, and analytics, everything you need is in one place.
                No more juggling multiple tools or losing leads in the process.
              </p>
              <div className="space-y-3 pt-4">
                {[
                  "AI-powered lead scoring",
                  "Automated follow-ups",
                  "Real-time analytics",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-slate-300">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <MagicCard
                className="p-8 bg-slate-900/40"
                gradientFrom="rgba(6, 182, 212, 0.08)"
                gradientSize={250}
              >
                <h3 className="text-lg font-semibold text-white mb-6">Platform Highlights</h3>
                <div className="space-y-5">
                  {[
                    { icon: Target, color: "cyan", title: "Lead Discovery", desc: "Find leads by industry + location" },
                    { icon: Zap, color: "amber", title: "Automation", desc: "SMS, email, and task automation" },
                    { icon: BarChart3, color: "emerald", title: "Analytics", desc: "Pipeline metrics and insights" },
                  ].map((highlight) => (
                    <div key={highlight.title} className="flex items-center gap-4">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br from-${highlight.color}-500/15 to-${highlight.color}-600/5 border border-white/[0.03] flex items-center justify-center flex-shrink-0`}>
                        <highlight.icon className={`h-5 w-5 text-${highlight.color}-400`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{highlight.title}</p>
                        <p className="text-sm text-slate-500">{highlight.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </MagicCard>
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <MagicCard
            className="p-12 md:p-16 bg-slate-900/40"
            gradientFrom="rgba(6, 182, 212, 0.10)"
            gradientTo="rgba(168, 85, 247, 0.06)"
            gradientSize={400}
          >
            <div className="text-center space-y-8 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Ready to Find More Leads?
              </h2>
              <p className="text-lg text-slate-400">
                Start discovering qualified leads in minutes.
                No credit card required to get started.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-2 items-center">
                <Link href="/dashboard">
                  <ButtonShiny variant="cyan" className="px-8">
                    <span className="flex items-center gap-2">
                      Start Free
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </ButtonShiny>
                </Link>
                <Link href="/intake">
                  <ButtonShiny variant="purple" label="Book a Demo" className="px-8" />
                </Link>
              </div>
            </div>
          </MagicCard>
        </motion.section>

        {/* CONTACT */}
        <section className="text-center space-y-6">
          <h3 className="text-xl font-semibold text-slate-300">Questions? Get in Touch</h3>
          <div className="flex flex-wrap gap-6 justify-center">
            <a
              href="tel:6263947645"
              className="inline-flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors duration-300"
            >
              <div className="h-9 w-9 rounded-lg bg-slate-900/60 border border-white/[0.03] flex items-center justify-center">
                <Phone className="h-4 w-4" />
              </div>
              <span className="font-medium">(626) 394-7645</span>
            </a>
            <a
              href="mailto:hello@leadly.ai"
              className="inline-flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors duration-300"
            >
              <div className="h-9 w-9 rounded-lg bg-slate-900/60 border border-white/[0.03] flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <span className="font-medium">hello@leadly.ai</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.03] bg-slate-950/90 backdrop-blur-sm mt-16">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">AVAIL</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                AI-powered lead generation and CRM platform for modern sales teams.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link href="/dashboard" className="hover:text-white transition-colors duration-300">Dashboard</Link></li>
                <li><Link href="/crm/contacts" className="hover:text-white transition-colors duration-300">CRM</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors duration-300">Analytics</Link></li>
                <li><Link href="/settings/automations" className="hover:text-white transition-colors duration-300">Automations</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link href="/intake" className="hover:text-white transition-colors duration-300">Book Demo</Link></li>
                <li><Link href="/calculator" className="hover:text-white transition-colors duration-300">ROI Calculator</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors duration-300">Pricing</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><a href="tel:6263947645" className="hover:text-white transition-colors duration-300">(626) 394-7645</a></li>
                <li><a href="mailto:hello@leadly.ai" className="hover:text-white transition-colors duration-300">hello@leadly.ai</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/[0.03] text-center text-sm text-slate-600">
            <p>&copy; 2025 AVAIL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
