/**
 * AVAIL Pricing Page
 * Premium pricing with animated transitions and premium MagicCard styling
 */

"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles, Phone, Star } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { Pricing, type PricingPlan } from "@/components/ui/pricing";
import { PRICING_TIERS } from "@/lib/config/pricing";
import { ButtonShiny } from "@/components/ui/button-shiny";

// Convert AVAIL pricing tiers to the Pricing component format
const pricingPlans: PricingPlan[] = [
  {
    name: "FOUNDATION",
    price: "1997",
    yearlyPrice: "1597",
    period: "month",
    features: [
      "1 Core Service of Your Choice",
      "Template-based implementation",
      "Standard AI models",
      "Basic reporting & analytics",
      "Email support",
      "12-month commitment",
    ],
    description: "Perfect for businesses just getting started with AI automation",
    buttonText: "Get Started",
    href: "/intake",
    isPopular: false,
  },
  {
    name: "PRO",
    price: "2997",
    yearlyPrice: "2397",
    period: "month",
    features: [
      "2 Core Services",
      "Advanced workflows",
      "Enhanced AI models",
      "Custom reporting",
      "Priority support",
      "Quarterly strategy calls",
    ],
    description: "Ideal for growing teams ready to scale",
    buttonText: "Get Started",
    href: "/intake",
    isPopular: true,
  },
  {
    name: "PREMIUM",
    price: "4500",
    yearlyPrice: "3600",
    period: "month",
    features: [
      "3 Core Services",
      "All Premium Features unlocked",
      "GPT-4, Claude, Sora 2 access",
      "Predictive analytics",
      "Multi-location support",
      "Dedicated account manager",
    ],
    description: "For established businesses seeking competitive advantage",
    buttonText: "Contact Sales",
    href: "/intake",
    isPopular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent" />

      <main className="relative mx-auto max-w-7xl px-6 py-16 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">Enterprise AI Automation</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Choose Your Growth Path
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Select the services you need, unlock the features that matter, and scale as you grow.
          </p>
        </section>

        {/* Premium Pricing Component */}
        <Pricing
          plans={pricingPlans}
          title=""
          description=""
        />

        {/* Additional Tiers */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-center text-slate-300">Enterprise Solutions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <MagicCard className="p-8 bg-slate-900/40" gradientFrom="rgba(16, 185, 129, 0.12)">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Full Suite</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-400">$6,000</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-400">All 5 Core Services included</p>
                <ul className="space-y-2 pt-4">
                  {["CRM, Website, Call & Text, Reviews, Social", "All Premium Features", "Priority 24/7 support", "Quarterly business reviews"].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/intake" className="block mt-6">
                  <ButtonShiny variant="emerald" className="w-full">
                    Contact Sales
                  </ButtonShiny>
                </Link>
              </div>
            </MagicCard>

            <MagicCard className="p-8 bg-slate-900/40" gradientFrom="rgba(168, 85, 247, 0.12)">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">Enterprise</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Custom</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-purple-400">$8,500+</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-400">Tailored for large organizations</p>
                <ul className="space-y-2 pt-4">
                  {["Everything in Full Suite", "White-label options", "Custom integrations & API", "Dedicated success team", "SLA agreements"].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/intake" className="block mt-6">
                  <ButtonShiny variant="purple" className="w-full">
                    Contact Sales
                  </ButtonShiny>
                </Link>
              </div>
            </MagicCard>
          </div>
        </section>

        {/* Service Overview */}
        <section className="space-y-8">
          <MagicCard className="p-10 bg-slate-900/40" gradientSize={400}>
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold text-white">The 5 Core AVAIL Services</h2>
                <p className="text-slate-400">Mix and match based on your tier</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[
                  { name: "CRM", color: "cyan", desc: "AI lead scoring" },
                  { name: "Website", color: "purple", desc: "Smart lead capture" },
                  { name: "Call & Text", color: "emerald", desc: "24/7 automation" },
                  { name: "Reviews", color: "amber", desc: "Reputation management" },
                  { name: "Social", color: "pink", desc: "AI content creation" },
                ].map((service) => (
                  <div
                    key={service.name}
                    className="rounded-xl border border-white/[0.03] bg-slate-950/60 p-4 text-center"
                  >
                    <h3 className={`font-semibold text-${service.color}-400`}>{service.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </MagicCard>
        </section>

        {/* FAQ Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-center">Common Questions</h2>
          <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              {
                q: "Why is there a setup fee?",
                a: "The setup fee covers onboarding, configuration, integrations, and custom workflows tailored to your business.",
              },
              {
                q: "Can I upgrade my plan?",
                a: "Yes! You can upgrade at any time. Downgrades are available at contract renewal.",
              },
              {
                q: "What happens after my contract ends?",
                a: "Contracts auto-renew month-to-month. Cancel with 30 days notice.",
              },
              {
                q: "Can I add services later?",
                a: "Absolutely. Add services by upgrading to a higher tier as your business grows.",
              },
            ].map((faq) => (
              <MagicCard key={faq.q} className="p-6 bg-slate-900/40" gradientSize={150}>
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-400">{faq.a}</p>
              </MagicCard>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section>
          <MagicCard className="p-12 text-center bg-slate-900/40" gradientFrom="rgba(6, 182, 212, 0.10)">
            <div className="space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold">Ready to Transform Your Business?</h2>
              <p className="text-slate-400">
                Talk to our team to find the perfect tier and service combination.
              </p>

              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Link href="/intake">
                  <ButtonShiny variant="cyan" className="px-8 py-4 text-lg">
                    <span className="flex items-center gap-2">
                      Talk to Sales
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </ButtonShiny>
                </Link>
                <a href="tel:6263947645">
                  <ButtonShiny variant="amber" className="px-8 py-4 text-lg">
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      (626) 394-7645
                    </span>
                  </ButtonShiny>
                </a>
              </div>
            </div>
          </MagicCard>
        </section>
      </main>

      <div className="h-16" />
    </div>
  );
}
