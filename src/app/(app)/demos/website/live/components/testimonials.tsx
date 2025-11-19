"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Homeowner",
    rating: 5,
    text: "Had a burst pipe emergency at 11 PM. ProPlumb arrived in 30 minutes and fixed it quickly. Saved us from major water damage!",
    date: "2 weeks ago"
  },
  {
    name: "Michael T.",
    role: "Business Owner",
    rating: 5,
    text: "We use ProPlumb for all our commercial plumbing needs. Always professional, always on time. Highly recommend!",
    date: "1 month ago"
  },
  {
    name: "Jennifer L.",
    role: "Homeowner",
    rating: 5,
    text: "Best plumbing company in Denver! Replaced our water heater same day. Fair pricing and excellent service.",
    date: "3 weeks ago"
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-xl font-semibold">4.9/5</span>
          </div>
          <p className="text-gray-600">Based on 1,200+ reviews</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">{testimonial.text}</p>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-gray-500">{testimonial.role}</div>
                </div>
                <div className="text-gray-400">{testimonial.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
