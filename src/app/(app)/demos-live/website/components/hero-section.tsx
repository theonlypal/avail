"use client";

import { useState } from "react";
import { Phone, Calendar, Clock, Wrench, AlertCircle, Flame, Droplet } from "lucide-react";
import { BookingModal } from "./booking-modal";

export function HeroSection() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <section className="relative bg-blue-600 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                ProPlumb Services
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                24/7 Emergency Service • Licensed & Insured • Same-Day Repairs
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:720-555-8421"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-md text-base font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Phone className="w-5 h-5" />
                  (720) 555-8421
                </a>
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-8 py-3 rounded-md text-base font-medium hover:bg-blue-800 transition-colors border border-blue-500"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Appointment
                </button>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-md flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">Fast Response</div>
                    <div className="text-blue-200 text-xs">45-min avg arrival</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-md flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">Expert Team</div>
                    <div className="text-blue-200 text-xs">15+ years exp</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6">Services Available</h3>
                <div className="space-y-4">
                  {[
                    { Icon: AlertCircle, title: "Emergency Plumbing", desc: "24/7 immediate response" },
                    { Icon: Flame, title: "Water Heaters", desc: "Install, repair, maintain" },
                    { Icon: Droplet, title: "Drain Cleaning", desc: "Professional equipment" },
                    { Icon: Wrench, title: "Leak Repair", desc: "Fast detection & fix" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center">
                        <item.Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">{item.title}</div>
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

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
}
