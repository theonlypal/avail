"use client";

import { useState } from "react";
import { Star, ThumbsUp, MessageCircle, Filter, Camera } from "lucide-react";

const allReviews = [
  {
    id: 1,
    name: "Sarah Mitchell",
    avatar: "SM",
    role: "Homeowner - Cherry Creek",
    rating: 5,
    text: "Had a burst pipe emergency at 11 PM on a Sunday. Called ProPlumb and they had someone here in 28 minutes! The technician (Marcus) was incredibly professional, explained everything he was doing, and had us back up and running within 2 hours. Price was exactly as quoted over the phone. Cannot recommend them enough!",
    date: "2 weeks ago",
    verified: true,
    helpful: 24,
    service: "Emergency Plumbing",
    photos: 2
  },
  {
    id: 2,
    name: "Michael Torres",
    avatar: "MT",
    role: "Business Owner - LoDo",
    rating: 5,
    text: "We use ProPlumb for all our commercial plumbing needs at our restaurant. They've handled everything from clogged drains to water heater replacements. Always professional, always on time, and they work around our business hours. Their preventive maintenance plan has saved us thousands.",
    date: "1 month ago",
    verified: true,
    helpful: 18,
    service: "Commercial Service"
  },
  {
    id: 3,
    name: "Jennifer Lopez",
    avatar: "JL",
    role: "Homeowner - Highlands",
    rating: 5,
    text: "Best plumbing company in Denver! Our 15-year-old water heater died on a Friday afternoon. ProPlumb had a new tankless unit installed by Saturday morning. The technician took time to explain how to use it and even gave us energy-saving tips. Fair pricing and excellent service.",
    date: "3 weeks ago",
    verified: true,
    helpful: 31,
    service: "Water Heater Installation",
    photos: 3
  },
  {
    id: 4,
    name: "David Chen",
    avatar: "DC",
    role: "Homeowner - Capitol Hill",
    rating: 5,
    text: "Used ProPlumb for drain cleaning after multiple DIY attempts failed. They brought a camera to inspect the line and found tree roots were the culprit. Cleared everything out with their hydro jetting equipment and showed me the before/after footage. Very transparent pricing, no hidden fees.",
    date: "4 days ago",
    verified: true,
    helpful: 12,
    service: "Drain Cleaning"
  },
  {
    id: 5,
    name: "Amanda Rodriguez",
    avatar: "AR",
    role: "Property Manager - Multiple Locations",
    rating: 5,
    text: "Managing 12 rental properties, I need a plumber I can trust. ProPlumb has been my go-to for 3 years. They handle emergency calls for tenants quickly, provide detailed reports for each job, and their pricing is always fair. They've literally saved me from nightmare scenarios multiple times.",
    date: "1 week ago",
    verified: true,
    helpful: 27,
    service: "Property Management"
  },
  {
    id: 6,
    name: "Robert Johnson",
    avatar: "RJ",
    role: "Homeowner - Washington Park",
    rating: 4,
    text: "Called for a leaky faucet repair. Technician arrived on time, was very polite, and fixed the issue quickly. Only giving 4 stars because the initial quote was $125 but ended up being $150 due to needing a special washer. Would have appreciated a heads up before the work, but overall satisfied with the service.",
    date: "5 days ago",
    verified: true,
    helpful: 8,
    service: "Leak Repair"
  },
  {
    id: 7,
    name: "Lisa Anderson",
    avatar: "LA",
    role: "Homeowner - Park Hill",
    rating: 5,
    text: "ProPlumb installed a whole-house water filtration system for us. The installation took about 4 hours and they left everything spotless. They explained how to maintain the system and even sent follow-up emails with maintenance reminders. Water tastes amazing now!",
    date: "2 months ago",
    verified: true,
    helpful: 15,
    service: "Installation"
  },
  {
    id: 8,
    name: "James Wilson",
    avatar: "JW",
    role: "Homeowner - Stapleton",
    rating: 5,
    text: "Had a slow drain in our master bathroom that was getting worse. ProPlumb came out same day, used a camera to diagnose the issue (partial clog), and cleared it completely. They also gave me tips on preventing future clogs. Great service and reasonable price ($145 total).",
    date: "1 week ago",
    verified: true,
    helpful: 19,
    service: "Drain Cleaning"
  }
];

export function Testimonials() {
  const [filter, setFilter] = useState("All");
  const [helpfulClicked, setHelpfulClicked] = useState<number[]>([]);

  const services = ["All", "Emergency Plumbing", "Water Heater Installation", "Drain Cleaning", "Leak Repair"];

  const filteredReviews = filter === "All"
    ? allReviews
    : allReviews.filter(r => r.service === filter);

  const avgRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1);
  const totalReviews = allReviews.length + 1192; // Add base number for realism

  const handleHelpful = (id: number) => {
    if (!helpfulClicked.includes(id)) {
      setHelpfulClicked([...helpfulClicked, id]);
    }
  };

  return (
    <section id="testimonials" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Customer Reviews</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-xl font-semibold">{avgRating}/5</span>
          </div>
          <p className="text-gray-600">{totalReviews} verified reviews</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          {services.map((service) => (
            <button
              key={service}
              onClick={() => setFilter(service)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === service
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {service}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.avatar}
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {review.name}
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{review.role}</div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>

              {/* Service Badge */}
              <div className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mb-3">
                {review.service}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">{review.text}</p>

              {/* Photos Badge */}
              {review.photos && (
                <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {review.photos} photos attached
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    helpfulClicked.includes(review.id)
                      ? "text-blue-600 font-medium"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful + (helpfulClicked.includes(review.id) ? 1 : 0)})
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
            Load More Reviews ({totalReviews - filteredReviews.length} more)
          </button>
        </div>
      </div>
    </section>
  );
}
