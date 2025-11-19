"use client";

import { Droplet, Flame, Wrench, AlertCircle } from "lucide-react";

const services = [
  {
    icon: AlertCircle,
    title: "Emergency Plumbing",
    description: "24/7 emergency service for urgent plumbing issues. We arrive within 45 minutes!",
    price: "From $150",
    features: ["Burst pipes", "Major leaks", "Sewage backup", "No water"]
  },
  {
    icon: Flame,
    title: "Water Heater Service",
    description: "Installation, repair, and maintenance of all water heater types.",
    price: "$800 - $1,500",
    features: ["Tank & tankless", "Repair & replace", "Same-day service", "10-year warranty"]
  },
  {
    icon: Droplet,
    title: "Drain Cleaning",
    description: "Professional drain and sewer line cleaning using advanced equipment.",
    price: "$100 - $200",
    features: ["Video inspection", "Hydro jetting", "Root removal", "Prevention tips"]
  },
  {
    icon: Wrench,
    title: "Leak Repair",
    description: "Fast detection and repair of leaks in pipes, faucets, and fixtures.",
    price: "$75 - $300",
    features: ["Leak detection", "Pipe repair", "Faucet replacement", "Preventive maintenance"]
  }
];

export function ServicesGrid() {
  return (
    <section id="services" className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-gray-600">Professional plumbing solutions for every need</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              <div className="text-blue-600 font-bold text-lg mb-4">{service.price}</div>
              <ul className="space-y-2">
                {service.features.map((feature, j) => (
                  <li key={j} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Get Quote
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
