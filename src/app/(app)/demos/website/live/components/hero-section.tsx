"use client";

import { Phone, Calendar, Wrench } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Denver's Most Trusted Plumbing Experts
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              24/7 Emergency Service • Licensed & Insured • Same-Day Repairs
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:555-123-4567"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                <Phone className="w-5 h-5" />
                Call Now: (555) 123-4567
              </a>
              <button className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-400 transition-all border-2 border-white/20">
                <Calendar className="w-5 h-5" />
                Book Online
              </button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <div className="font-semibold">Free Estimates</div>
                  <div className="text-blue-200 text-xs">On all jobs</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  ⭐
                </div>
                <div>
                  <div className="font-semibold">4.9 Star Rating</div>
                  <div className="text-blue-200 text-xs">1,200+ reviews</div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6">Why Choose ProPlumb?</h3>
              <div className="space-y-4">
                {[
                  { icon: "🚀", title: "Fast Response", desc: "Average 45-min arrival time" },
                  { icon: "💰", title: "Upfront Pricing", desc: "No hidden fees or surprises" },
                  { icon: "🛠️", title: "Expert Technicians", desc: "15+ years experience" },
                  { icon: "✅", title: "Satisfaction Guaranteed", desc: "100% money-back guarantee" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="text-3xl">{item.icon}</div>
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-blue-100 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
