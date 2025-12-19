/**
 * Intake Form Page
 *
 * Per Zach's spec:
 * - Creates Business + Contact + Deal in CRM via API
 * - Sends confirmation SMS (Twilio) + Email (Postmark)
 * - Shows embedded calendar picker (Google Calendar)
 * - Pre-filled with calculator data if coming from /calculator
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, CheckCircle2, Calendar, Mail, MessageSquare, ExternalLink } from "lucide-react";
import { CalendlyEmbed } from "@/components/calendar/calendly-embed";

interface IntakeFormData {
  // Contact Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Business Info
  company: string;
  website: string;
  city: string;
  state: string;
  industry: string;

  // Business Metrics
  jobsPerMonth: number;
  avgTicket: number;

  // Pain Points
  painPoints: string[];

  // Scheduling
  preferredTime: string;

  // Calculator Data (if coming from ROI calculator)
  calculatorData?: any;
}

function IntakeFormContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<IntakeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    city: '',
    state: '',
    industry: '',
    jobsPerMonth: 0,
    avgTicket: 0,
    painPoints: [],
    preferredTime: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Load calculator data if present
  useEffect(() => {
    const calculatorParam = searchParams.get('calculator');
    if (calculatorParam) {
      try {
        const calculatorData = JSON.parse(decodeURIComponent(calculatorParam));
        setFormData(prev => ({
          ...prev,
          jobsPerMonth: calculatorData.inputs?.jobsPerMonth || 0,
          avgTicket: calculatorData.inputs?.avgTicket || 0,
          calculatorData,
        }));
      } catch (error) {
        console.error('Failed to parse calculator data:', error);
      }
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof IntakeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePainPointToggle = (painPoint: string) => {
    setFormData(prev => ({
      ...prev,
      painPoints: prev.painPoints.includes(painPoint)
        ? prev.painPoints.filter(p => p !== painPoint)
        : [...prev.painPoints, painPoint],
    }));
  };

  const [demoUrl, setDemoUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create prospect for personalized demo experience
      const prospectResponse = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.company,
          contact_name: `${formData.firstName} ${formData.lastName}`,
          contact_email: formData.email,
          contact_phone: formData.phone,
          industry: mapIndustryToKey(formData.industry),
          business_type: formData.industry,
          location: `${formData.city}, ${formData.state}`,
          website_url: formData.website,
          monthly_leads: formData.jobsPerMonth,
          avg_deal_value: formData.avgTicket,
          pain_points: formData.painPoints,
          source: 'intake_form',
        }),
      });

      if (prospectResponse.ok) {
        const prospectResult = await prospectResponse.json();
        if (prospectResult.demo_url) {
          setDemoUrl(prospectResult.demo_url);
        }
      }

      // Also call CRM API to create Business + Contact + Deal
      const response = await fetch('/api/crm/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        console.warn('CRM intake failed, but prospect created');
      }

      setSubmitted(true);
      setShowCalendar(true);
    } catch (error) {
      console.error('Intake submission error:', error);
      alert('There was an error submitting your form. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map free-form industry input to industry key
  function mapIndustryToKey(industry: string): string {
    const lower = industry.toLowerCase();
    if (lower.includes('plumb') || lower.includes('hvac') || lower.includes('electric') || lower.includes('roof') || lower.includes('landscap')) {
      return 'home-services';
    }
    if (lower.includes('dental') || lower.includes('chiro') || lower.includes('med spa') || lower.includes('health') || lower.includes('therapy')) {
      return 'healthcare';
    }
    if (lower.includes('law') || lower.includes('account') || lower.includes('consult') || lower.includes('market')) {
      return 'professional-services';
    }
    if (lower.includes('fitness') || lower.includes('gym') || lower.includes('yoga') || lower.includes('crossfit') || lower.includes('pilates')) {
      return 'fitness';
    }
    if (lower.includes('real estate') || lower.includes('realtor') || lower.includes('property')) {
      return 'real-estate';
    }
    if (lower.includes('restaurant') || lower.includes('food') || lower.includes('cafe') || lower.includes('bar')) {
      return 'restaurant';
    }
    if (lower.includes('auto') || lower.includes('car') || lower.includes('mechanic') || lower.includes('tire')) {
      return 'automotive';
    }
    return 'other';
  }

  const painPointOptions = [
    'Not enough leads',
    'Leads not converting',
    'Too much time on admin work',
    'Missing after-hours calls',
    'High no-show rate',
    'Poor online reputation',
    'Inconsistent social media',
    'Need better follow-up',
  ];

  if (submitted) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

        <main className="relative mx-auto max-w-4xl px-6 py-12">
          <Card className="border-green-500/50 bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-500/20 p-6 border-4 border-green-500/50">
                  <CheckCircle2 className="h-16 w-16 text-green-400" />
                </div>
              </div>
              <CardTitle className="text-3xl text-white">Thank You!</CardTitle>
              <CardDescription className="text-lg text-slate-300">
                We've received your information and are excited to help grow your business.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-white/10 bg-white/5 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-cyan-400 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Email Confirmation Sent</p>
                    <p className="text-sm text-slate-400">Check your inbox for next steps and meeting details</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-cyan-400 mt-1" />
                  <div>
                    <p className="font-semibold text-white">SMS Confirmation Sent</p>
                    <p className="text-sm text-slate-400">You'll receive a text message shortly with your booking link</p>
                  </div>
                </div>
              </div>

              {/* Personalized Demo Link */}
              {demoUrl && (
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-cyan-500/20 p-2">
                      <ExternalLink className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Your Personalized Demo is Ready</p>
                      <p className="text-sm text-slate-400">Explore AVAIL customized for {formData.company}</p>
                    </div>
                  </div>
                  <a
                    href={demoUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-cyan-700 transition-all w-full justify-center"
                  >
                    View Your Custom Demo
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              {showCalendar && (
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-6 w-6 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">Book Your Call</h3>
                  </div>

                  {process.env.NEXT_PUBLIC_CALENDLY_URL ? (
                    <div className="rounded-xl overflow-hidden bg-white">
                      <CalendlyEmbed
                        url={process.env.NEXT_PUBLIC_CALENDLY_URL}
                        prefill={{
                          name: `${formData.firstName} ${formData.lastName}`,
                          email: formData.email,
                          phone: formData.phone,
                        }}
                        onEventScheduled={(event) => {
                          console.log('Meeting scheduled:', event);
                          // Optionally log to our API
                          fetch('/api/bookings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              team_id: 'default-team',
                              title: event.event?.name || 'Discovery Call',
                              start_time: event.event?.start_time,
                              end_time: event.event?.end_time,
                              attendee_name: `${formData.firstName} ${formData.lastName}`,
                              attendee_email: formData.email,
                              external_id: event.invitee?.uri,
                              status: 'scheduled',
                            }),
                          }).catch(console.error);
                        }}
                        styles={{ height: '650px' }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/20 bg-white/5 p-8 text-center">
                      <p className="text-slate-300 mb-4">
                        Our team will reach out within 24 hours to schedule your call.
                      </p>
                      <a
                        href="/booking"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-cyan-700 transition-all"
                      >
                        <Calendar className="h-4 w-4" />
                        Schedule Now
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <p className="text-sm text-slate-500 mt-4">
                        You can also call us directly at {process.env.NEXT_PUBLIC_BUSINESS_PHONE_NUMBER || '+1 (213) 555-0120'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center pt-4">
                <p className="text-slate-400">
                  Questions? Email us at <span className="text-cyan-400">hello@avail.ai</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

      <main className="relative mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="space-y-2 animate-fade-in text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-3 border border-blue-500/30">
              <ClipboardList className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Let's Get Started
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Tell us about your business so we can customize the perfect AVAIL solution for you
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Contact Information</CardTitle>
              <CardDescription className="text-slate-400">
                How can we reach you?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">First Name *</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Business Information</CardTitle>
              <CardDescription className="text-slate-400">
                Tell us about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-white">Company Name *</Label>
                  <Input
                    id="company"
                    required
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">City *</Label>
                  <Input
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-white">State *</Label>
                  <Input
                    id="state"
                    required
                    placeholder="CA"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-white">Industry *</Label>
                  <Input
                    id="industry"
                    required
                    placeholder="e.g., Plumbing, HVAC, Med Spa"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Metrics */}
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Business Metrics</CardTitle>
              <CardDescription className="text-slate-400">
                Help us understand your volume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jobsPerMonth" className="text-white">Jobs Per Month</Label>
                  <Input
                    id="jobsPerMonth"
                    type="number"
                    value={formData.jobsPerMonth || ''}
                    onChange={(e) => handleInputChange('jobsPerMonth', parseFloat(e.target.value) || 0)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avgTicket" className="text-white">Average Job Value ($)</Label>
                  <Input
                    id="avgTicket"
                    type="number"
                    value={formData.avgTicket || ''}
                    onChange={(e) => handleInputChange('avgTicket', parseFloat(e.target.value) || 0)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pain Points */}
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">What are your biggest challenges?</CardTitle>
              <CardDescription className="text-slate-400">
                Select all that apply
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {painPointOptions.map((painPoint) => (
                  <div key={painPoint} className="flex items-center space-x-2">
                    <Checkbox
                      id={painPoint}
                      checked={formData.painPoints.includes(painPoint)}
                      onCheckedChange={() => handlePainPointToggle(painPoint)}
                      className="border-white/20 data-[state=checked]:bg-cyan-600"
                    />
                    <Label
                      htmlFor={painPoint}
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {painPoint}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferred Time */}
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">When's the best time to reach you?</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Weekdays 2-5pm, Mornings, ASAP"
                value={formData.preferredTime}
                onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[80px]"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-lg py-6"
          >
            {isSubmitting ? 'Submitting...' : 'Book My Call'}
          </Button>

          <p className="text-center text-sm text-slate-500">
            By submitting, you agree to receive communication from AVAIL. We respect your privacy.
          </p>
        </form>
      </main>

      {/* Footer Spacer */}
      <div className="h-20"></div>
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
      </div>
    }>
      <IntakeFormContent />
    </Suspense>
  );
}
