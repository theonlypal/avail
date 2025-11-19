"use client";

import { useState } from "react";
import { Droplet, Flame, Wrench, AlertCircle, Check } from "lucide-react";
import { BookingModal } from "./booking-modal";

const services = [
  {
    icon: AlertCircle,
    title: "Emergency Plumbing",
    description: "24/7 emergency service for urgent plumbing issues",
    price: "From $150",
    features: ["Burst pipes", "Major leaks", "Sewage backup", "No water"]
  },
  {
    icon: Flame,
    title: "Water Heater Service",
    description: "Installation, repair, and maintenance of all water heater types",
    price: "$800 - $1,500",
    features: ["Tank & tankless", "Repair & replace", "Same-day service", "10-year warranty"]
  },
  {
    icon: Droplet,
    title: "Drain Cleaning",
    description: "Professional drain and sewer line cleaning",
    price: "$100 - $200",
    features: ["Video inspection", "Hydro jetting", "Root removal", "Prevention tips"]
  },
  {
    icon: Wrench,
    title: "Leak Repair",
    description: "Fast detection and repair of leaks",
    price: "$75 - $300",
    features: ["Leak detection", "Pipe repair", "Faucet replacement", "Preventive maintenance"]
  }
];

export function ServicesGrid() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsBookingOpen(true);
  };

  return (
    <>
      <section id="services" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Services</h2>
            <p className="text-xl text-gray-600">Professional plumbing solutions</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <div className="text-blue-600 font-semibold text-base mb-4">{service.price}</div>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, j) => (
                    <li key={j} className="text-sm text-gray-600 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleServiceClick(service.title)}
                  className="mt-auto w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Book Service
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        serviceType={selectedService}
      />
    </>
  );
}
