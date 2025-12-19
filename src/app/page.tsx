/**
 * AVAIL - Homepage
 *
 * Production-grade AI services platform homepage
 * Clean, professional design with real CTAs
 * No fake testimonials or demo stats
 */

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
} from "lucide-react";

const aiServices = [
  {
    title: "AI Lead Discovery",
    description: "Find and qualify high-value leads automatically using AI-powered search and analysis",
    icon: Target,
    features: ["Google Maps integration", "AI scoring", "Auto-enrichment"],
    color: "from-cyan-500/20 to-blue-500/20",
    href: "/dashboard",
  },
  {
    title: "CRM & Pipeline",
    description: "Manage contacts, deals, and your sales pipeline with a modern, intuitive interface",
    icon: Users,
    features: ["Contact management", "Deal tracking", "Custom pipelines"],
    color: "from-blue-500/20 to-indigo-500/20",
    href: "/crm/contacts",
  },
  {
    title: "Automation Engine",
    description: "Set up automated workflows for SMS, email, and task creation based on triggers",
    icon: Zap,
    features: ["SMS automation", "Email sequences", "Task creation"],
    color: "from-amber-500/20 to-orange-500/20",
    href: "/settings/automations",
  },
  {
    title: "Communication Hub",
    description: "Unified inbox for SMS, email, and call logging with full conversation history",
    icon: MessageSquare,
    features: ["SMS send/receive", "Email integration", "Call logging"],
    color: "from-purple-500/20 to-pink-500/20",
    href: "/inbox",
  },
  {
    title: "Calendar Booking",
    description: "Let leads book appointments directly with integrated scheduling",
    icon: Calendar,
    features: ["Calendly integration", "Booking forms", "Confirmations"],
    color: "from-green-500/20 to-emerald-500/20",
    href: "/intake",
  },
  {
    title: "Analytics & Insights",
    description: "Real-time metrics and pipeline analytics to track your sales performance",
    icon: BarChart3,
    features: ["Pipeline analytics", "Win rates", "Lead scoring"],
    color: "from-rose-500/20 to-red-500/20",
    href: "/analytics",
  },
];

const platformCapabilities = [
  { label: "AI Availability", value: "24/7", icon: Clock },
  { label: "Lead Scoring", value: "Automated", icon: Target },
  { label: "Response Time", value: "Instant", icon: Zap },
  { label: "Integration", value: "Seamless", icon: Shield },
];

const howItWorks = [
  {
    step: "1",
    title: "Discover Leads",
    description: "Use AI-powered search to find qualified leads in any industry and location automatically",
    icon: Target,
  },
  {
    step: "2",
    title: "Engage & Nurture",
    description: "Set up automated SMS and email sequences to engage leads at the right time",
    icon: MessageSquare,
  },
  {
    step: "3",
    title: "Close & Track",
    description: "Manage your pipeline, track deals, and analyze performance with real-time analytics",
    icon: TrendingUp,
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />

      <main className="relative mx-auto flex max-w-7xl flex-col gap-24 px-6 py-20">

        {/* HERO SECTION */}
        <section className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              <Zap className="h-4 w-4" />
              <span>AI-Powered Lead Management</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight md:text-6xl bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
              Find, Engage, and Convert Leads with AI
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed">
              AVAIL discovers qualified leads, automates your outreach, and helps you close more deals.
              Built for businesses that want to grow faster.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/intake"
                className="inline-flex items-center rounded-xl border-2 border-white/20 px-8 py-4 text-lg font-semibold hover:bg-white/5 transition-all"
              >
                Book a Demo
              </Link>
            </div>

            {/* Platform Capabilities */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {platformCapabilities.map((capability) => (
                <div key={capability.label} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <capability.icon className="h-5 w-5 text-cyan-400" />
                    <p className="text-xl font-bold text-white">{capability.value}</p>
                  </div>
                  <p className="text-sm text-slate-400">{capability.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Preview */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">AI Lead Discovery</p>
                      <p className="text-xs text-slate-400">Powered by Google Places + AI</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg bg-slate-800/50 border border-white/10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-medium text-slate-300">Lead Discovery</span>
                    </div>
                    <p className="text-xs text-slate-500">Find businesses by industry and location with AI scoring</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 border border-white/10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-medium text-slate-300">Automation</span>
                    </div>
                    <p className="text-xs text-slate-500">Automated SMS and email sequences</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 border border-white/10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-medium text-slate-300">Analytics</span>
                    </div>
                    <p className="text-xs text-slate-500">Real-time pipeline metrics and insights</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                  >
                    Try Lead Discovery
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">Platform Features</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need to Grow Your Business
            </h2>
            <p className="text-xl text-slate-300">
              A complete platform for lead generation, CRM, automation, and analytics.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {aiServices.map((service, index) => (
              <Link
                key={service.title}
                href={service.href}
                className="group relative rounded-2xl p-6 transition-all border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-white/20"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />

                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-white/10 p-3 group-hover:bg-white/20 transition-colors">
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Get Started in 3 Steps
            </h2>
            <p className="text-xl text-slate-300">
              From lead discovery to closed deals, we make it simple.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <div className="absolute -top-4 -left-4 text-8xl font-bold text-white/5">
                  {item.step}
                </div>
                <div className="relative space-y-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                  <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-3 w-fit">
                    <item.icon className="h-6 w-6 text-cyan-300" />
                  </div>
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">About AVAIL</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Built for Modern Sales Teams
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <p className="text-lg text-slate-300 leading-relaxed">
                AVAIL was built to solve a common problem: finding and engaging qualified leads takes too much time.
                Our AI-powered platform automates the tedious parts of sales so you can focus on closing deals.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                With integrated lead discovery, CRM, automation, and analytics, everything you need is in one place.
                No more juggling multiple tools or losing leads in the process.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span>AI-powered lead scoring</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span>Automated follow-ups</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span>Real-time analytics</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-8 space-y-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Platform Highlights</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">Lead Discovery</p>
                      <p className="text-sm text-slate-400">Find leads by industry + location</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">Automation</p>
                      <p className="text-sm text-slate-400">SMS, email, and task automation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">Analytics</p>
                      <p className="text-sm text-slate-400">Pipeline metrics and insights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 p-12 md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
          <div className="relative text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Find More Leads?
            </h2>
            <p className="text-xl text-slate-200">
              Start discovering qualified leads in minutes.
              No credit card required to get started.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-xl bg-white text-slate-900 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/intake"
                className="inline-flex items-center rounded-xl border-2 border-white px-8 py-4 text-lg font-semibold hover:bg-white/10 transition-all"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="text-center space-y-6">
          <h3 className="text-2xl font-bold">Questions? Get in Touch</h3>
          <div className="flex flex-wrap gap-6 justify-center">
            <a
              href="tel:6263947645"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="h-5 w-5" />
              (626) 394-7645
            </a>
            <a
              href="mailto:hello@leadly.ai"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <Mail className="h-5 w-5" />
              hello@leadly.ai
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AVAIL</h3>
              <p className="text-sm text-slate-400">
                AI-powered lead generation and CRM platform for modern sales teams.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/crm/contacts" className="hover:text-white transition-colors">CRM</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link href="/settings/automations" className="hover:text-white transition-colors">Automations</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/intake" className="hover:text-white transition-colors">Book Demo</Link></li>
                <li><Link href="/calculator" className="hover:text-white transition-colors">ROI Calculator</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="tel:6263947645" className="hover:text-white transition-colors">(626) 394-7645</a></li>
                <li><a href="mailto:hello@leadly.ai" className="hover:text-white transition-colors">hello@leadly.ai</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-400">
            <p>© 2025 AVAIL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
