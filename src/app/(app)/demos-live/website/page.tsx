"use client";

import { useState } from "react";
import { HeroSection } from "./components/hero-section";
import { AboutSection } from "./components/about-section";
import { ProcessSection } from "./components/process-section";
import { ServicesGrid } from "./components/services-grid";
import { Testimonials } from "./components/testimonials";
import { ContactSection } from "./components/contact-section";
import { ChatWidget } from "./components/chat-widget";
import { LiveActivityFeed } from "./components/live-activity-feed";
import { Monitor, Smartphone, ArrowRight, Eye, Phone, MapPin, Clock } from "lucide-react";
import { DemoDisclaimerBanner } from "@/components/demos/disclaimer-banner";
import { MetricContextCard } from "@/components/demos/metric-context-card";

export default function ProPlumbLandingPage() {
  const [viewMode, setViewMode] = useState<'split' | 'website' | 'dashboard'>('split');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Control Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm border-b border-blue-700">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-semibold">LIVE DEMO</span>
              </div>
              <div className="h-6 w-px bg-white/30" />
              <h1 className="font-semibold text-base">AVAIL Showcase: ProPlumb Services</h1>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white/10 rounded-md p-1">
              <button
                onClick={() => setViewMode('website')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'website'
                    ? 'bg-white text-blue-600'
                    : 'text-white/90 hover:text-white hover:bg-white/20'
                }`}
              >
                <Smartphone className="w-4 h-4 inline mr-1" />
                Customer View
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'split'
                    ? 'bg-white text-blue-600'
                    : 'text-white/90 hover:text-white hover:bg-white/20'
                }`}
              >
                <Monitor className="w-4 h-4 inline mr-1" />
                Split View
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'dashboard'
                    ? 'bg-white text-blue-600'
                    : 'text-white/90 hover:text-white hover:bg-white/20'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Business View
              </button>
            </div>
          </div>

          {/* Explanation Bar */}
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-100">
            <ArrowRight className="w-4 h-4" />
            {viewMode === 'split' && (
              <span>
                <strong>Left:</strong> What your customers see | <strong>Right:</strong> What you see in real-time
              </span>
            )}
            {viewMode === 'website' && (
              <span>Customer experience: Try booking a service, chatting with AI, or requesting a quote</span>
            )}
            {viewMode === 'dashboard' && (
              <span>Business dashboard: Watch leads, bookings, and revenue update in real-time as customers interact</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Customer Website Side */}
        {(viewMode === 'split' || viewMode === 'website') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            } overflow-y-auto bg-white transition-all duration-300`}
          >
            {viewMode === 'split' && (
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 sticky top-0 z-40">
                <h2 className="font-semibold text-blue-900">Customer Website</h2>
                <p className="text-sm text-blue-700">What your customers see and interact with</p>
              </div>
            )}

            {/* Website Content */}
            <div>
              <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-lg">
                      P
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">ProPlumb Services</div>
                      <div className="text-xs text-gray-600">Denver's Professional Plumbers</div>
                    </div>
                  </div>
                  <a
                    href="tel:720-555-8421"
                    className="text-blue-600 font-medium hover:text-blue-700"
                  >
                    (720) 555-8421
                  </a>
                </div>
              </header>

              <HeroSection />
              <AboutSection />
              <ProcessSection />
              <ServicesGrid />
              <Testimonials />
              <ContactSection />
              <ChatWidget />

              <footer className="bg-gray-900 text-white py-8 px-6">
                <div className="max-w-7xl mx-auto text-center">
                  <p className="text-sm text-gray-400">
                    © 2024 ProPlumb Services. Licensed & Insured. Denver, CO
                  </p>
                </div>
              </footer>
            </div>
          </div>
        )}

        {/* Business Dashboard Side */}
        {(viewMode === 'split' || viewMode === 'dashboard') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2 border-l-4 border-cyan-500' : 'w-full'
            } overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 transition-all duration-300`}
          >
            {viewMode === 'split' && (
              <div className="bg-gradient-to-r from-green-600/20 to-cyan-600/20 border-b border-white/10 px-6 py-3 sticky top-0 z-40 backdrop-blur-xl">
                <h2 className="font-semibold text-white">AVAIL Business Dashboard</h2>
                <p className="text-sm text-slate-300">Real-time business metrics and ROI tracking</p>
              </div>
            )}

            {/* Dashboard Content */}
            <div className="p-6 space-y-6">
              {/* Demo Disclaimer */}
              <DemoDisclaimerBanner />

              {/* Hero Stats */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-8 text-white border border-white/10">
                <h2 className="text-2xl font-bold mb-2">Today's Performance</h2>
                <p className="text-blue-100 mb-6">Live metrics from ProPlumb Services</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-md p-4">
                    <div className="text-3xl font-bold">$2,450</div>
                    <div className="text-blue-100 text-sm">Revenue Today</div>
                    <div className="text-xs text-green-200 mt-1">↑ 240% vs without AVAIL</div>
                  </div>
                  <div className="bg-white/10 rounded-md p-4">
                    <div className="text-3xl font-bold">12</div>
                    <div className="text-blue-100 text-sm">Leads Captured</div>
                    <div className="text-xs text-green-200 mt-1">↑ 8 would have been missed</div>
                  </div>
                  <div className="bg-white/10 rounded-md p-4">
                    <div className="text-3xl font-bold">24%</div>
                    <div className="text-blue-100 text-sm">Conversion Rate</div>
                    <div className="text-xs text-green-200 mt-1">↑ 19% vs 5% before</div>
                  </div>
                  <div className="bg-white/10 rounded-md p-4">
                    <div className="text-3xl font-bold">Instant</div>
                    <div className="text-blue-100 text-sm">Response Time</div>
                    <div className="text-xs text-green-200 mt-1">↑ Was 4 hours avg</div>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <LiveActivityFeed />

              {/* ROI Comparison */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 hover:bg-red-500/20 transition-all">
                  <h3 className="font-semibold text-red-400 mb-4">Without AVAIL</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Website visitors:</span>
                      <span className="font-semibold text-white">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Leads captured:</span>
                      <span className="font-semibold text-white">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">After-hours leads:</span>
                      <span className="font-semibold text-red-400">0 (missed)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Conversion rate:</span>
                      <span className="font-semibold text-red-400">5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Revenue today:</span>
                      <span className="font-semibold text-red-400">$720</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Response time:</span>
                      <span className="font-semibold text-red-400">4 hours</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 hover:bg-green-500/20 transition-all">
                  <h3 className="font-semibold text-green-400 mb-4">With AVAIL</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Website visitors:</span>
                      <span className="font-semibold text-white">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Leads captured:</span>
                      <span className="font-semibold text-green-400">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">After-hours leads:</span>
                      <span className="font-semibold text-green-400">6 (captured!)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Conversion rate:</span>
                      <span className="font-semibold text-green-400">24%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Revenue today:</span>
                      <span className="font-semibold text-green-400">$2,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Response time:</span>
                      <span className="font-semibold text-green-400">Instant</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric Context Card */}
              <MetricContextCard />

              {/* Value Banner */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-6 text-center border border-yellow-500/30 hover:border-yellow-500/50 transition-all">
                <div className="text-3xl font-bold text-yellow-400 mb-2">+$1,730/day</div>
                <p className="text-white font-medium">Additional revenue with AVAIL</p>
                <p className="text-sm text-slate-300 mt-2">
                  $51,900/month additional revenue · $622,800/year
                </p>
              </div>

              {/* Explanation */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all">
                <h3 className="font-semibold text-lg mb-3 text-white">How This Works</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <p>
                    <strong className="text-white">1. Interact with the website</strong> (left side) - book a service, chat with AI, or request a quote
                  </p>
                  <p>
                    <strong className="text-white">2. Watch this dashboard update in real-time</strong> - see leads captured, revenue tracked, and metrics improve
                  </p>
                  <p>
                    <strong className="text-white">3. Compare before/after</strong> - understand the ROI of AI-powered automation
                  </p>
                  <p className="pt-3 border-t border-white/10 text-cyan-400 font-medium">
                    This is what your clients get with AVAIL - a complete business transformation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
