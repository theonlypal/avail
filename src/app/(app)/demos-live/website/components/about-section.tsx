"use client";

import { Shield, Award, Users, Clock } from "lucide-react";
import Image from "next/image";

export function AboutSection() {
  return (
    <section id="about" className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: About Text */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900">
              Denver's Most Trusted Plumbing Company
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Since 2010, ProPlumb Services has been the go-to plumbing company for Denver residents and businesses. We've built our reputation on quality workmanship, honest pricing, and exceptional customer service.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our team of licensed and insured plumbers brings over 15 years of combined experience to every job. Whether it's a minor leak or a major emergency, we treat your home with the respect it deserves and complete every job to the highest standards.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We're available 24/7 for emergencies because we know plumbing problems don't wait for business hours. Our same-day service and upfront pricing mean no surprises—just reliable, professional plumbing you can count on.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">5,000+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Emergency Service</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Satisfaction Guaranteed</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              {/* Placeholder for team photo */}
              <div className="text-center text-blue-600 p-8">
                <Shield className="w-24 h-24 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-semibold">ProPlumb Team Photo</p>
                <p className="text-sm">Licensed & Insured Professionals</p>
              </div>
            </div>
            {/* Overlay badge */}
            <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-lg shadow-xl">
              <div className="text-3xl font-bold">4.9★</div>
              <div className="text-sm">Google Rating</div>
              <div className="text-xs opacity-90">500+ Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
