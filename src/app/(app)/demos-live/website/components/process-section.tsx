"use client";

import { Phone, Calendar, Wrench, CheckCircle, Clock, DollarSign } from "lucide-react";

export function ProcessSection() {
  const steps = [
    {
      number: "1",
      icon: Phone,
      title: "Call or Book Online",
      description: "Reach out 24/7 via phone or use our online booking system. We respond within minutes and schedule at your convenience.",
      image: "📞"
    },
    {
      number: "2",
      icon: Calendar,
      title: "We Arrive On Time",
      description: "Our licensed plumber arrives at your scheduled time in a fully-stocked truck. We'll call 30 minutes before arrival.",
      image: "🚛"
    },
    {
      number: "3",
      icon: Wrench,
      title: "Diagnose & Quote",
      description: "We thoroughly inspect the issue and provide upfront, honest pricing before starting any work. No hidden fees, ever.",
      image: "🔧"
    },
    {
      number: "4",
      icon: CheckCircle,
      title: "Fix It Right",
      description: "Our expert completes the repair using professional-grade tools and materials. We test everything to ensure it's working perfectly.",
      image: "✅"
    }
  ];

  return (
    <section id="process" className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold mb-2">OUR PROCESS</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How We Work
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From the moment you contact us to the final quality check, our process is designed for your convenience and peace of mind.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[calc(100%-20%)] h-0.5 bg-blue-200" />
              )}

              <div className="relative bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
                {/* Step Number Badge */}
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                  {step.number}
                </div>

                {/* Icon/Image */}
                <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center text-4xl mb-4 mx-auto">
                  {step.image}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Fast Response Time</h4>
              <p className="text-sm text-gray-600">Average 45-minute arrival for emergencies. Same-day service available.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Upfront Pricing</h4>
              <p className="text-sm text-gray-600">Know the exact cost before we start. No hidden fees or surprise charges.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">100% Satisfaction Guarantee</h4>
              <p className="text-sm text-gray-600">Not happy? We'll make it right or refund your money. That's our promise.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
