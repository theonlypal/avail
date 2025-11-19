"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contact" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-bold mb-6">Get In Touch</h2>
            <p className="text-gray-300 mb-8">
              Need plumbing help? Contact us today for a free quote or emergency service.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Call Us</div>
                  <a href="tel:555-123-4567" className="text-blue-400 hover:text-blue-300 text-lg">
                    (555) 123-4567
                  </a>
                  <div className="text-sm text-gray-400 mt-1">Available 24/7 for emergencies</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Email Us</div>
                  <a href="mailto:info@proplumb.com" className="text-blue-400 hover:text-blue-300">
                    info@proplumb.com
                  </a>
                  <div className="text-sm text-gray-400 mt-1">We respond within 1 hour</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Visit Us</div>
                  <div className="text-gray-300">123 Main Street</div>
                  <div className="text-gray-300">Denver, CO 80202</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Business Hours</div>
                  <div className="text-gray-300">Mon-Fri: 7AM - 7PM</div>
                  <div className="text-gray-300">Sat: 8AM - 6PM, Sun: 9AM - 5PM</div>
                  <div className="text-blue-400 font-semibold mt-1">Emergency: 24/7</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-8 text-gray-900">
            <h3 className="text-2xl font-bold mb-6">Request a Free Quote</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Service Needed</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                  <option>Select a service</option>
                  <option>Emergency Plumbing</option>
                  <option>Water Heater</option>
                  <option>Drain Cleaning</option>
                  <option>Leak Repair</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                  placeholder="Tell us about your plumbing issue..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Free Quote
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
