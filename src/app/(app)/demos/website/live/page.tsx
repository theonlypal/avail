"use client";

import { HeroSection } from "./components/hero-section";
import { ServicesGrid } from "./components/services-grid";
import { Testimonials } from "./components/testimonials";
import { ContactSection } from "./components/contact-section";
import { ChatWidget } from "./components/chat-widget";
import { Phone, MapPin, Clock } from "lucide-react";

export default function ProPlumbLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-6 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🔧</div>
            <div>
              <h1 className="text-2xl font-bold">ProPlumb Services</h1>
              <p className="text-xs text-blue-100">Denver's Trusted Plumbers Since 2010</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="hover:text-blue-200 transition-colors">Services</a>
            <a href="#testimonials" className="hover:text-blue-200 transition-colors">Reviews</a>
            <a href="#contact" className="hover:text-blue-200 transition-colors">Contact</a>
            <a href="tel:555-123-4567" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              📞 (555) 123-4567
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <HeroSection />
      <ServicesGrid />
      <Testimonials />
      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🔧 ProPlumb Services
            </h3>
            <p className="text-gray-400">Denver's most trusted plumbing company. Available 24/7 for all your plumbing needs.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>123 Main St, Denver, CO 80202</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>24/7 Emergency Service</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Hours</h4>
            <div className="space-y-1 text-gray-400 text-sm">
              <div>Mon-Fri: 7AM - 7PM</div>
              <div>Saturday: 8AM - 6PM</div>
              <div>Sunday: 9AM - 5PM</div>
              <div className="text-blue-400 font-semibold mt-2">Emergency: 24/7</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© 2024 ProPlumb Services. Licensed & Insured. License #CO-12345</p>
          <p className="mt-2 text-xs text-gray-600">
            This is a demo website created for AVAIL demonstration purposes
          </p>
        </div>
      </footer>

      {/* AI Chat Widget - The Star of the Show! */}
      <ChatWidget />
    </div>
  );
}
