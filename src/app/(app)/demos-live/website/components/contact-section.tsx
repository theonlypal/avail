"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle } from "lucide-react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(formData.phone.trim())) {
      newErrors.phone = "Valid phone number required";
    }

    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Store quote request in localStorage for demo
    const quotes = JSON.parse(localStorage.getItem('proplumb-quotes') || '[]');
    quotes.push({
      ...formData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('proplumb-quotes', JSON.stringify(quotes));

    setSubmitted(true);

    // Reset after 4 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", phone: "", service: "", message: "" });
      setErrors({});
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 px-6 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-bold mb-6">Contact Information</h2>
            <p className="text-gray-300 mb-8">
              Reach out for emergency service or general inquiries
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium mb-1">Phone</div>
                  <a href="tel:720-555-8421" className="text-blue-400 hover:text-blue-300 text-lg">
                    (720) 555-8421
                  </a>
                  <div className="text-sm text-gray-400 mt-1">24/7 emergency line</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium mb-1">Email</div>
                  <a href="mailto:info@proplumb.com" className="text-blue-400 hover:text-blue-300">
                    info@proplumb.com
                  </a>
                  <div className="text-sm text-gray-400 mt-1">Response within 1 hour</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium mb-1">Location</div>
                  <div className="text-gray-300">2847 Larimer St</div>
                  <div className="text-gray-300">Denver, CO 80205</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium mb-1">Hours</div>
                  <div className="text-gray-300">Mon-Fri: 7AM - 7PM</div>
                  <div className="text-gray-300">Sat: 8AM - 6PM, Sun: 9AM - 5PM</div>
                  <div className="text-blue-400 font-medium mt-1">Emergency: 24/7</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-8 text-gray-900">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-md flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Quote Request Received</h3>
                <p className="text-gray-600">
                  We'll contact you within 1 hour to discuss your needs.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-6">Request a Quote</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none`}
                      placeholder="Your name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-2 rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none`}
                      placeholder="(720) 555-0000"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Service Needed</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className={`w-full px-4 py-2 rounded-md border ${errors.service ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none`}
                    >
                      <option value="">Select a service</option>
                      <option>Emergency Plumbing</option>
                      <option>Water Heater Service</option>
                      <option>Drain Cleaning</option>
                      <option>Leak Repair</option>
                      <option>Other</option>
                    </select>
                    {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Message</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full px-4 py-2 rounded-md border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none`}
                      placeholder="Describe your plumbing issue..."
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Submit Request
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
