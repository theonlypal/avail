/**
 * AVAIL - Homepage
 *
 * Production-grade AI services platform homepage
 * Accurately represents AVAIL's comprehensive AI automation services
 * Features leadly.ai - our custom lead generation engine
 */

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  Play,
  BarChart3,
  Shield,
  Clock
} from "lucide-react";

// AVAIL - AI Services Platform

const aiServices = [
  {
    title: "leadly.ai - Custom Lead Engine",
    description: "Our proprietary AI lead generation system that captures and qualifies leads 24/7 with intelligent automation",
    icon: Zap,
    features: ["Proprietary AI", "24/7 lead capture", "Smart qualification", "Auto-scheduling"],
    color: "from-yellow-500/20 to-orange-500/20",
    demo: "/dashboard",
    highlight: true,
    inDevelopment: false,
    developmentNote: ""
  },
  {
    title: "AI Lead Generation",
    description: "Capture and qualify leads 24/7 with intelligent chatbots that never sleep",
    icon: Users,
    features: ["24/7 lead capture", "Smart qualification", "Auto-scheduling"],
    color: "from-blue-500/20 to-cyan-500/20",
    demo: "/demos/website"
  },
  {
    title: "AI Customer Support",
    description: "Provide instant, intelligent responses to customer queries around the clock",
    icon: MessageSquare,
    features: ["Instant responses", "Multi-channel", "Context-aware"],
    color: "from-purple-500/20 to-pink-500/20",
    demo: "/demos/website"
  },
  {
    title: "AI Sales Automation",
    description: "Automate follow-ups, nurturing, and closing with AI-powered workflows",
    icon: TrendingUp,
    features: ["Smart follow-ups", "Lead scoring", "Pipeline automation"],
    color: "from-green-500/20 to-emerald-500/20",
    demo: "/demos/crm"
  },
  {
    title: "AI Appointment Scheduling",
    description: "Let AI handle your calendar with smart scheduling and reminders",
    icon: Calendar,
    features: ["Smart scheduling", "Auto-reminders", "Calendar sync"],
    color: "from-orange-500/20 to-amber-500/20",
    demo: "/demos/calendar"
  },
  {
    title: "AI Review Management",
    description: "Monitor and respond to reviews across all platforms automatically",
    icon: Star,
    features: ["Multi-platform", "AI responses", "Sentiment analysis"],
    color: "from-pink-500/20 to-rose-500/20",
    demo: "/demos/reviews"
  },
];

const companyFeatures = [
  { label: "AI Availability", value: "24/7", icon: Zap },
  { label: "Response Time", value: "Instant", icon: Clock },
  { label: "Lead Capture", value: "Automated", icon: Users },
  { label: "Integration", value: "Seamless", icon: Bot },
];

const howItWorks = [
  {
    step: "1",
    title: "Connect Your Data",
    description: "Integrate your website, CRM, calendar, and communication channels in minutes",
    icon: Shield
  },
  {
    step: "2",
    title: "AI Learns Your Business",
    description: "Our AI analyzes your brand voice, services, and customer patterns automatically",
    icon: Bot
  },
  {
    step: "3",
    title: "Automation Runs 24/7",
    description: "Sit back and watch AI handle leads, support, scheduling, and more around the clock",
    icon: Zap
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    title: "CEO, ProPlumb HVAC",
    quote: "AVAIL captures leads after hours and books appointments automatically. The AI handles customer inquiries instantly while we focus on the actual work.",
    rating: 5
  },
  {
    name: "Marcus Chen",
    title: "Marketing Director, Dental Dynamics",
    quote: "The AI responds to reviews faster than we ever could. It maintains our brand voice and handles responses professionally across all platforms.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    title: "Founder, Local Agency Co",
    quote: "We use AVAIL for all our clients. The automation is seamless - leads are captured, qualified, and followed up on without any manual work.",
    rating: 5
  },
];

const featuredDemos = [
  {
    title: "ProPlumb Website Integration",
    description: "See how AI captures leads directly on a live HVAC website",
    image: "/demo-website.jpg",
    link: "/demos-live/website",
    badge: "Live Demo"
  },
  {
    title: "Smart Calendar Booking",
    description: "Watch AI schedule appointments and send confirmations automatically",
    image: "/demo-calendar.jpg",
    link: "/demos/calendar",
    badge: "Interactive"
  },
  {
    title: "CRM Pipeline Automation",
    description: "See how AI scores leads and automates your sales pipeline",
    image: "/demo-crm.jpg",
    link: "/demos/crm",
    badge: "Interactive"
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

      <main className="relative mx-auto flex max-w-7xl flex-col gap-24 px-6 py-20">

        {/* HERO SECTION */}
        <section className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-300">
              <Zap className="h-4 w-4" />
              <span>AI-Powered Business Automation</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight md:text-7xl bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
              Turn Your Business Into an AI-Powered Machine
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed md:text-2xl">
              AVAIL provides intelligent automation for lead generation, customer support, sales, scheduling, and more.
              Let AI handle the repetitive work while you focus on growth.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/demos"
                className="group inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover-lift"
              >
                Explore Live Demos
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-lg border-2 border-white/20 px-8 py-4 text-lg font-semibold hover:bg-white/5 transition-all"
              >
                <Play className="mr-2 h-5 w-5" />
                Get Started
              </Link>
            </div>

            {/* Platform Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {companyFeatures.map((feature) => (
                <div key={feature.label} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <feature.icon className="h-5 w-5 text-cyan-400" />
                    <p className="text-2xl font-bold text-white">{feature.value}</p>
                  </div>
                  <p className="text-sm text-slate-400">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="relative animate-slide-in-right">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
              <div className="space-y-4">
                {/* Simulated Dashboard Preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">AI Assistant</p>
                      <p className="text-xs text-slate-400">Online • Responding</p>
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                    <p className="text-sm text-blue-200">New lead captured from website chat</p>
                    <p className="text-xs text-slate-400 mt-1">Just now</p>
                  </div>
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                    <p className="text-sm text-green-200">Appointment scheduled for tomorrow 2PM</p>
                    <p className="text-xs text-slate-400 mt-1">2 minutes ago</p>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
                    <p className="text-sm text-purple-200">Review responded to on Google</p>
                    <p className="text-xs text-slate-400 mt-1">5 minutes ago</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">AI Actions Today</span>
                    <span className="text-white font-semibold">247</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">AI Services</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Comprehensive AI Automation for Every Business Need
            </h2>
            <p className="text-xl text-slate-300">
              From lead generation to social media management, our AI handles it all.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {aiServices.map((service, index) => (
              <Link
                key={service.title}
                href={service.demo}
                className={`group relative rounded-2xl p-6 transition-all hover-lift stagger-fade-in ${
                  service.highlight
                    ? 'border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:border-yellow-500/70 ring-2 ring-yellow-500/20'
                    : 'border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-white/20'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {service.highlight && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    PROPRIETARY
                  </div>
                )}
                {service.inDevelopment && (
                  <div className="absolute -top-3 -left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    IN DEVELOPMENT
                  </div>
                )}
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
                    {service.developmentNote && (
                      <div className="mt-3 p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                        <p className="text-xs text-orange-300 font-medium">
                          ⚠️ {service.developmentNote}
                        </p>
                      </div>
                    )}
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
              Get Started in 3 Easy Steps
            </h2>
            <p className="text-xl text-slate-300">
              Setting up your AI automation is quick and painless.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <div className="absolute -top-4 -left-4 text-8xl font-bold text-white/5">
                  {item.step}
                </div>
                <div className="relative space-y-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 w-fit">
                    <item.icon className="h-6 w-6 text-cyan-300" />
                  </div>
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT US SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">About AVAIL</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Built by Business Owners, For Business Owners
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 space-y-3">
                <h3 className="text-xl font-bold text-cyan-400">Why "AVAIL"?</h3>
                <p className="text-lg text-slate-200 leading-relaxed">
                  Our name reflects our mission. <span className="font-semibold text-white">Avail</span> means <span className="italic text-cyan-300">"to help or benefit"</span>—and that's exactly what we do. We help businesses benefit from AI automation, making cutting-edge technology available to companies of all sizes.
                </p>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed">
                AVAIL was born from a simple frustration: watching countless leads slip through the cracks because businesses couldn't respond fast enough. We knew AI could solve this problem, so we built it ourselves.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                Today, AVAIL powers automation for businesses of all sizes, capturing leads 24/7, responding to customers instantly, and handling the repetitive tasks that eat up your time. Our proprietary <span className="text-yellow-400 font-semibold">leadly.ai</span> engine is specifically designed to turn website visitors into qualified leads automatically.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                We're not just another AI platform—we're a team that understands the challenges of running a business. Every feature we build is designed to solve real problems we've faced or heard from our customers.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Small business focused</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Easy to use</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Proven ROI</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Team/Platform Image Placeholder */}
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl" />
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
                      <Bot className="w-16 h-16 text-cyan-400 opacity-60" />
                    </div>
                    <p className="text-lg font-semibold text-slate-400">AI Platform Dashboard</p>
                    <p className="text-sm text-slate-500 mt-2">Real-time automation in action</p>
                  </div>
                </div>
              </div>

              {/* Platform Capabilities */}
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl" />
                <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-8 space-y-6">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4">Platform Capabilities</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">24/7</p>
                        <p className="text-sm text-slate-400">AI Availability</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">Instant</p>
                        <p className="text-sm text-slate-400">Response Time</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">Seamless</p>
                        <p className="text-sm text-slate-400">Integration</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING OVERVIEW */}
        <section id="pricing" className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 p-12 md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

          <div className="relative space-y-8">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">Flexible Pricing</p>
              <h2 className="text-4xl md:text-5xl font-bold">
                Choose Your Perfect Service Combination
              </h2>
              <p className="text-xl text-slate-300">
                Select from 5 core services across 5 pricing tiers. Pay only for what you need, upgrade as you grow.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
              {[
                { name: 'Foundation', price: '$1,997', services: '1 Service' },
                { name: 'Pro', price: '$2,500-$3K', services: '2 Services', popular: true },
                { name: 'Premium', price: '$4K-$4.5K', services: '4 Services' },
                { name: 'Full Suite', price: '$6K-$7K', services: 'All 5' },
                { name: 'Enterprise', price: '$8.5K-$12.5K', services: 'All + Custom App' },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-2xl border p-6 space-y-3 ${
                    tier.popular
                      ? 'border-cyan-400/50 bg-cyan-500/10 ring-2 ring-cyan-500/20'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  {tier.popular && (
                    <div className="text-xs font-bold text-cyan-300 text-center">MOST POPULAR</div>
                  )}
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <p className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {tier.price}
                  </p>
                  <p className="text-sm text-slate-400">/month</p>
                  <p className="text-sm text-slate-300 font-semibold">{tier.services}</p>
                </div>
              ))}
            </div>

            <div className="text-center pt-8">
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-xl bg-white text-slate-900 px-10 py-4 text-lg font-bold shadow-2xl hover:shadow-white/30 transition-all duration-300 hover-lift"
              >
                View Full Pricing Details
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <p className="text-sm text-slate-300 mt-6">
                All tiers include setup fee • 12-month commitment for best results
              </p>
            </div>
          </div>
        </section>

        {/* DEMO SHOWCASE */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">See It In Action</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Explore Our Live Demos
            </h2>
            <p className="text-xl text-slate-300">
              Experience AVAIL's capabilities with interactive demonstrations.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featuredDemos.map((demo) => (
              <Link
                key={demo.title}
                href={demo.link}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-white/20 transition-all hover-lift"
              >
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <Play className="h-16 w-16 text-white/40 group-hover:text-white/60 group-hover:scale-110 transition-all" />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {demo.badge}
                    </span>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-cyan-300 transition-colors">
                    {demo.title}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {demo.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center pt-8">
            <Link
              href="/demos"
              className="inline-flex items-center gap-2 text-lg font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All Demos
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-cyan-400 font-semibold">Customer Success</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Trusted by Growing Businesses
            </h2>
            <p className="text-xl text-slate-300">
              See what our customers have to say about AVAIL.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-200 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  {/* Profile Image Placeholder */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                    idx === 0 ? 'from-blue-500 to-cyan-500' :
                    idx === 1 ? 'from-green-500 to-emerald-500' :
                    'from-purple-500 to-pink-500'
                  } flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20 p-12 md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
          <div className="relative text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Automate Your Business with AI?
            </h2>
            <p className="text-xl text-slate-200">
              Join businesses that have automated their operations with AVAIL.
              Talk to our team or explore interactive demos first.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/demos"
                className="inline-flex items-center rounded-lg bg-white text-slate-900 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover-lift"
              >
                Explore Demos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="tel:6263947645"
                className="inline-flex items-center rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold hover:bg-white/10 transition-all"
              >
                Call (626) 394-7645
              </a>
            </div>
            <p className="text-sm text-slate-300">
              Enterprise-Ready Solutions • Dedicated Support • Custom Integration
            </p>
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
                AI-powered business automation for modern companies. Featuring leadly.ai - our custom lead generation engine.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/demos" className="hover:text-white transition-colors">Demos</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/team" className="hover:text-white transition-colors">Team</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
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
