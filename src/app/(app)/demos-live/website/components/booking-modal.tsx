"use client";

import { useState } from "react";
import { X, Calendar, Clock, User, Phone, MapPin, CheckCircle } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType?: string;
}

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

export function BookingModal({ isOpen, onClose, serviceType = "" }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: serviceType,
    name: "",
    phone: "",
    address: "",
    date: "",
    time: "",
    description: ""
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store booking in localStorage for demo purposes
    const bookings = JSON.parse(localStorage.getItem('proplumb-bookings') || '[]');
    bookings.push({
      ...formData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'scheduled'
    });
    localStorage.setItem('proplumb-bookings', JSON.stringify(bookings));

    setSubmitted(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setStep(1);
      setFormData({
        service: serviceType,
        name: "",
        phone: "",
        address: "",
        date: "",
        time: "",
        description: ""
      });
      onClose();
    }, 3000);
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceedStep1 = formData.service && formData.description;
  const canProceedStep2 = formData.date && formData.time;
  const canSubmit = formData.name && formData.phone && formData.address;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-md flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Booking Confirmed</h3>
          <p className="text-gray-600 mb-4">
            Your appointment has been scheduled for {formData.date} at {formData.time}.
          </p>
          <p className="text-sm text-gray-500">
            Confirmation details saved. Check the dashboard to see your booking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-6 rounded-t-lg flex items-center justify-between border-b border-blue-700">
          <div>
            <h2 className="text-xl font-bold">Schedule Service</h2>
            <p className="text-blue-100 text-sm">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-md transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Service Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">What service do you need?</h3>

              <div>
                <label className="block text-sm font-semibold mb-2">Select Service</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                >
                  <option value="">Choose a service...</option>
                  <option value="Emergency Plumbing">Emergency Plumbing</option>
                  <option value="Water Heater Service">Water Heater Service</option>
                  <option value="Drain Cleaning">Drain Cleaning</option>
                  <option value="Leak Repair">Leak Repair</option>
                  <option value="General Plumbing">General Plumbing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Describe the issue</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                  placeholder="Tell us what's happening with your plumbing..."
                  required
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceedStep1}
                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Date & Time
              </button>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">When would you like us to come?</h3>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Select Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot })}
                      className={`py-2 px-3 rounded-md border-2 transition-all text-sm font-medium ${
                        formData.time === slot
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedStep2}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Contact Info
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Your contact information</h3>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Service Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="123 Main St, Denver, CO 80202"
                  required
                />
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
                <h4 className="font-medium mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <div><span className="font-medium">Service:</span> {formData.service}</div>
                  <div><span className="font-medium">Date:</span> {formData.date}</div>
                  <div><span className="font-medium">Time:</span> {formData.time}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
