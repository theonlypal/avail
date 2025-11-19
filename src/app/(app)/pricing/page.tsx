/**
 * AVAIL Pricing Page
 * 5-tier pricing system with service selection and setup fees
 */

"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles, Phone } from "lucide-react";
import { PRICING_TIERS, formatPricing, type TierId } from "@/lib/config/pricing";

export default function PricingPage() {
  const tiers = Object.values(PRICING_TIERS);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />

      <main className="relative mx-auto max-w-7xl px-6 py-20 space-y-24">

        {/* Hero Section */}
        <section className="text-center space-y-10 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-2.5 text-sm text-cyan-300 shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="font-semibold">Enterprise AI Automation</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black leading-tight bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
            Choose Your Growth Path
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Select the services you need, unlock the features that matter, and scale as you grow.
            All plans include 12-month commitment for maximum results.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={tier.id}
              className={`relative rounded-3xl border p-8 transition-all duration-300 hover-lift stagger-fade-in ${
                tier.recommended
                  ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10'
                  : 'border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]'
              } ${tier.id === 'enterprise' ? 'md:col-span-2 lg:col-span-1' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Recommended Badge */}
              {tier.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              )}

              {/* Tier Name */}
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold">{tier.name}</h3>

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {tier.price.display}
                    </span>
                    <span className="text-slate-400 text-lg">/month</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    ${tier.setupFee.toLocaleString()} one-time setup fee
                  </p>
                  <p className="text-xs text-slate-500">
                    {tier.contractMinimum}-month minimum commitment
                  </p>
                </div>

                {/* Support Type */}
                <p className="text-sm text-slate-300">
                  {tier.support}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href="/dashboard"
                className={`block w-full text-center rounded-xl px-8 py-4 font-bold transition-all duration-300 ${
                  tier.recommended
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                Talk to Sales Representative
              </Link>
            </div>
          ))}
        </section>

        {/* Service Comparison Info */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 p-12 md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

          <div className="relative space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-black">
                The 5 Core AVAIL Services
              </h2>
              <p className="text-xl text-slate-200 max-w-3xl mx-auto">
                Mix and match services based on your tier, or get them all with Full Suite and Enterprise plans
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'AVAIL CRM',
                  description: 'Complete customer relationship management with AI lead scoring',
                  color: 'from-blue-400 to-cyan-400',
                },
                {
                  name: 'AVAIL Website',
                  description: 'AI-powered website with advanced chat and lead capture',
                  color: 'from-purple-400 to-pink-400',
                },
                {
                  name: 'AVAIL Call & Text',
                  description: '24/7 AI phone and SMS automation for instant follow-up',
                  color: 'from-green-400 to-emerald-400',
                },
                {
                  name: 'AVAIL Reviews',
                  description: 'Automated review generation and AI-powered responses',
                  color: 'from-yellow-400 to-orange-400',
                },
                {
                  name: 'AVAIL Social Media',
                  description: 'AI-generated content with Sora 2 video creation',
                  color: 'from-pink-400 to-red-400',
                },
              ].map((service) => (
                <div
                  key={service.name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3"
                >
                  <h3 className={`text-lg font-bold bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}>
                    {service.name}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Unlock Info */}
        <section className="space-y-12">
          <div className="text-center space-y-6">
            <p className="text-sm uppercase tracking-widest text-cyan-400 font-bold">Feature Access</p>
            <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Premium Features Unlock at Tier 3
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Foundation and Pro tiers include regular features. Premium, Full Suite, and Enterprise
              tiers unlock ALL premium features including AI scoring, Sora 2 videos, and advanced automation.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                title: 'Regular Features',
                description: 'Available in all tiers',
                features: [
                  'Template-based implementations',
                  'Pre-built workflows',
                  'Standard AI models',
                  'Basic reporting',
                  'Email support',
                ],
                color: 'from-blue-400 to-cyan-400',
              },
              {
                title: 'Premium Features',
                description: 'Unlocked at Premium tier and above',
                features: [
                  'Custom workflows & designs',
                  'Advanced AI models (GPT-4, Claude, Sora 2)',
                  'Predictive analytics',
                  'Multi-location support',
                  'API access & integrations',
                ],
                color: 'from-purple-400 to-pink-400',
              },
            ].map((featureSet) => (
              <div
                key={featureSet.title}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 space-y-6"
              >
                <div>
                  <h3 className={`text-2xl font-black bg-gradient-to-r ${featureSet.color} bg-clip-text text-transparent mb-2`}>
                    {featureSet.title}
                  </h3>
                  <p className="text-sm text-slate-400">{featureSet.description}</p>
                </div>
                <ul className="space-y-3">
                  {featureSet.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-200">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-widest text-cyan-400 font-bold">Common Questions</p>
            <h2 className="text-4xl md:text-5xl font-black">
              Pricing FAQs
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                q: 'Why is there a setup fee?',
                a: 'The setup fee covers initial onboarding, system configuration, integrations, and custom workflows tailored to your business. This ensures you get maximum value from day one.',
              },
              {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Yes! You can upgrade at any time. Downgrades are available at contract renewal. We recommend starting with the tier that matches your immediate needs.',
              },
              {
                q: 'What happens after my contract ends?',
                a: 'Contracts auto-renew month-to-month after the initial commitment. You can cancel with 30 days notice, but we recommend staying for continued optimization.',
              },
              {
                q: 'Can I add individual services later?',
                a: 'Absolutely. You can add services by upgrading to a higher tier. We offer flexible paths to scale as your business grows.',
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3"
              >
                <h3 className="text-lg font-bold text-cyan-300">{faq.q}</h3>
                <p className="text-sm text-slate-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-cyan-600/30 p-12 md:p-20 shadow-2xl shadow-blue-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

          <div className="relative text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-slate-200">
              Talk to our team to find the perfect tier and service combination for your business goals.
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
                <Phone className="mr-2 h-5 w-5" />
                Call (626) 394-7645
              </a>
            </div>

            <p className="text-sm text-slate-200 pt-6 font-medium">
              Enterprise-Ready Solutions • Dedicated Support • Custom Integration
            </p>
          </div>
        </section>

      </main>

      {/* Footer Spacer */}
      <div className="h-20"></div>
    </div>
  );
}
