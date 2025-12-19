/**
 * ROI Calculator Page
 *
 * Per Zach's spec: NO PRICE DISPLAY
 * Calculates potential savings and recommends tier based on business metrics
 * Routes to /intake with pre-filled data on "Book a Call"
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, Clock, DollarSign, AlertCircle, ArrowRight, Wrench, Heart, Briefcase, Dumbbell, Home, UtensilsCrossed, Car, Building2 } from "lucide-react";
import type { TierId } from "@/lib/config/pricing";

// Business model presets for common industries
const BUSINESS_PRESETS = [
  {
    id: 'home-services',
    name: 'Home Services',
    description: 'Plumbing, HVAC, Electrical, etc.',
    icon: Wrench,
    color: 'from-blue-500 to-cyan-500',
    defaults: {
      jobsPerMonth: 25,
      avgTicket: 450,
      closeRate: 35,
      adminHoursPerWeek: 12,
      hourlyValue: 75,
      afterHoursLeadsLost: 30,
      noShowRate: 15,
      currentAdSpend: 1500,
    },
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Dental, Chiropractic, Med Spa',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    defaults: {
      jobsPerMonth: 80,
      avgTicket: 250,
      closeRate: 45,
      adminHoursPerWeek: 20,
      hourlyValue: 50,
      afterHoursLeadsLost: 25,
      noShowRate: 20,
      currentAdSpend: 2000,
    },
  },
  {
    id: 'professional',
    name: 'Professional Services',
    description: 'Legal, Accounting, Consulting',
    icon: Briefcase,
    color: 'from-purple-500 to-indigo-500',
    defaults: {
      jobsPerMonth: 12,
      avgTicket: 2500,
      closeRate: 25,
      adminHoursPerWeek: 15,
      hourlyValue: 150,
      afterHoursLeadsLost: 20,
      noShowRate: 10,
      currentAdSpend: 3000,
    },
  },
  {
    id: 'fitness',
    name: 'Fitness & Wellness',
    description: 'Gyms, Personal Training, Yoga',
    icon: Dumbbell,
    color: 'from-green-500 to-emerald-500',
    defaults: {
      jobsPerMonth: 40,
      avgTicket: 150,
      closeRate: 40,
      adminHoursPerWeek: 10,
      hourlyValue: 40,
      afterHoursLeadsLost: 35,
      noShowRate: 25,
      currentAdSpend: 800,
    },
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Agents, Brokers, Property Mgmt',
    icon: Home,
    color: 'from-amber-500 to-orange-500',
    defaults: {
      jobsPerMonth: 4,
      avgTicket: 8000,
      closeRate: 20,
      adminHoursPerWeek: 25,
      hourlyValue: 100,
      afterHoursLeadsLost: 40,
      noShowRate: 15,
      currentAdSpend: 5000,
    },
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Dining, Catering, Events',
    icon: UtensilsCrossed,
    color: 'from-red-500 to-pink-500',
    defaults: {
      jobsPerMonth: 500,
      avgTicket: 45,
      closeRate: 60,
      adminHoursPerWeek: 15,
      hourlyValue: 35,
      afterHoursLeadsLost: 20,
      noShowRate: 10,
      currentAdSpend: 1000,
    },
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Repair, Detailing, Sales',
    icon: Car,
    color: 'from-slate-500 to-zinc-500',
    defaults: {
      jobsPerMonth: 60,
      avgTicket: 350,
      closeRate: 50,
      adminHoursPerWeek: 10,
      hourlyValue: 60,
      afterHoursLeadsLost: 25,
      noShowRate: 12,
      currentAdSpend: 1200,
    },
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Enter your own numbers',
    icon: Building2,
    color: 'from-cyan-500 to-blue-500',
    defaults: null,
  },
];

interface CalculatorInputs {
  jobsPerMonth: number;
  avgTicket: number;
  closeRate: number;
  adminHoursPerWeek: number;
  hourlyValue: number;
  afterHoursLeadsLost: number;
  noShowRate: number;
  currentAdSpend: number;
}

interface CalculatorResults {
  revenueLostToDelays: number;
  revenueLostToNoShows: number;
  timeSaved: number;
  timeSavingsValue: number;
  afterHoursRevenueLost: number;
  totalMonthlySavings: number;
  recommendedTier: TierId;
  tierReason: string;
}

export default function ROICalculatorPage() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [inputs, setInputs] = useState<CalculatorInputs>({
    jobsPerMonth: 0,
    avgTicket: 0,
    closeRate: 0,
    adminHoursPerWeek: 0,
    hourlyValue: 0,
    afterHoursLeadsLost: 0,
    noShowRate: 0,
    currentAdSpend: 0,
  });

  const [results, setResults] = useState<CalculatorResults | null>(null);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = BUSINESS_PRESETS.find(p => p.id === presetId);
    if (preset?.defaults) {
      setInputs(preset.defaults);
      setResults(null); // Clear previous results
    }
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const calculateROI = () => {
    // Revenue lost to delays (assume 15% of leads are lost due to slow response)
    const monthlyLeads = inputs.jobsPerMonth / (inputs.closeRate / 100);
    const leadsLostToDelays = monthlyLeads * 0.15;
    const revenueLostToDelays = leadsLostToDelays * (inputs.closeRate / 100) * inputs.avgTicket;

    // Revenue lost to no-shows
    const noShows = inputs.jobsPerMonth * (inputs.noShowRate / 100);
    const revenueLostToNoShows = noShows * inputs.avgTicket;

    // Time saved (automation reduces admin time by ~60%)
    const timeSaved = inputs.adminHoursPerWeek * 4 * 0.6; // Hours per month
    const timeSavingsValue = timeSaved * inputs.hourlyValue;

    // After-hours revenue lost
    const afterHoursLeads = monthlyLeads * (inputs.afterHoursLeadsLost / 100);
    const afterHoursRevenueLost = afterHoursLeads * (inputs.closeRate / 100) * inputs.avgTicket;

    // Total monthly savings
    const totalMonthlySavings =
      revenueLostToDelays +
      revenueLostToNoShows +
      timeSavingsValue +
      afterHoursRevenueLost;

    // Recommend tier based on complexity and volume
    let recommendedTier: TierId = 'foundation';
    let tierReason = '';

    if (inputs.jobsPerMonth >= 100 || inputs.currentAdSpend >= 5000) {
      recommendedTier = 'enterprise';
      tierReason = 'High volume and complexity requires full enterprise solution';
    } else if (inputs.jobsPerMonth >= 50 || inputs.avgTicket >= 3000) {
      recommendedTier = 'full-suite';
      tierReason = 'Your business size needs comprehensive automation across all channels';
    } else if (inputs.jobsPerMonth >= 30) {
      recommendedTier = 'premium';
      tierReason = 'Multiple service integration will maximize your efficiency';
    } else if (inputs.jobsPerMonth >= 15) {
      recommendedTier = 'pro';
      tierReason = 'Two core services will handle your current volume effectively';
    } else {
      recommendedTier = 'foundation';
      tierReason = 'Start with one core service and scale as you grow';
    }

    setResults({
      revenueLostToDelays,
      revenueLostToNoShows,
      timeSaved,
      timeSavingsValue,
      afterHoursRevenueLost,
      totalMonthlySavings,
      recommendedTier,
      tierReason,
    });
  };

  const handleBookCall = () => {
    // Encode calculator data to pass to intake form
    const calculatorData = encodeURIComponent(JSON.stringify({ inputs, results }));
    router.push(`/intake?calculator=${calculatorData}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTierDisplayName = (tierId: TierId): string => {
    const names: Record<TierId, string> = {
      'foundation': 'AVAIL Foundation',
      'pro': 'AVAIL Pro',
      'premium': 'AVAIL Premium',
      'full-suite': 'AVAIL Full Suite',
      'enterprise': 'AVAIL Enterprise',
    };
    return names[tierId];
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

      <main className="relative mx-auto max-w-6xl px-6 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2 animate-fade-in text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 border border-green-500/30">
              <Calculator className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            ROI Calculator
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            See how much revenue you're leaving on the table and discover the perfect AVAIL solution for your business
          </p>
        </div>

        {/* Business Type Presets */}
        <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Select Your Business Type</CardTitle>
            <CardDescription className="text-slate-400">
              Choose a preset to auto-fill industry averages, or enter custom values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BUSINESS_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedPreset === preset.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${preset.color} border-white/30 shadow-lg`
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <div className={`font-medium ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {preset.name}
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Input Form */}
        <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Your Business Metrics</CardTitle>
            <CardDescription className="text-slate-400">
              {selectedPreset && selectedPreset !== 'custom'
                ? 'Pre-filled with industry averages. Adjust to match your business.'
                : 'Enter your current numbers to see your potential savings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Jobs Per Month */}
              <div className="space-y-2">
                <Label htmlFor="jobsPerMonth" className="text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-cyan-400" />
                  Jobs Completed Per Month
                </Label>
                <Input
                  id="jobsPerMonth"
                  type="number"
                  placeholder="e.g., 25"
                  value={inputs.jobsPerMonth || ''}
                  onChange={(e) => handleInputChange('jobsPerMonth', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              {/* Average Ticket */}
              <div className="space-y-2">
                <Label htmlFor="avgTicket" className="text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-cyan-400" />
                  Average Job Value ($)
                </Label>
                <Input
                  id="avgTicket"
                  type="number"
                  placeholder="e.g., 1500"
                  value={inputs.avgTicket || ''}
                  onChange={(e) => handleInputChange('avgTicket', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              {/* Close Rate */}
              <div className="space-y-2">
                <Label htmlFor="closeRate" className="text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  Close Rate (%)
                </Label>
                <Input
                  id="closeRate"
                  type="number"
                  placeholder="e.g., 40"
                  value={inputs.closeRate || ''}
                  onChange={(e) => handleInputChange('closeRate', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              {/* Admin Hours Per Week */}
              <div className="space-y-2">
                <Label htmlFor="adminHoursPerWeek" className="text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  Admin Hours Per Week
                </Label>
                <Input
                  id="adminHoursPerWeek"
                  type="number"
                  placeholder="e.g., 15"
                  value={inputs.adminHoursPerWeek || ''}
                  onChange={(e) => handleInputChange('adminHoursPerWeek', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              {/* Hourly Value */}
              <div className="space-y-2">
                <Label htmlFor="hourlyValue" className="text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-cyan-400" />
                  Value of Your Time ($/hour)
                </Label>
                <Input
                  id="hourlyValue"
                  type="number"
                  placeholder="e.g., 150"
                  value={inputs.hourlyValue || ''}
                  onChange={(e) => handleInputChange('hourlyValue', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              {/* After Hours Leads Lost */}
              <div className="space-y-2">
                <Label htmlFor="afterHoursLeadsLost" className="text-white flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-cyan-400" />
                  After-Hours Leads Lost (%)
                </Label>
                <Input
                  id="afterHoursLeadsLost"
                  type="number"
                  placeholder="e.g., 30"
                  value={inputs.afterHoursLeadsLost || ''}
                  onChange={(e) => handleInputChange('afterHoursLeadsLost', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              {/* No Show Rate */}
              <div className="space-y-2">
                <Label htmlFor="noShowRate" className="text-white flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-cyan-400" />
                  No-Show Rate (%)
                </Label>
                <Input
                  id="noShowRate"
                  type="number"
                  placeholder="e.g., 15"
                  value={inputs.noShowRate || ''}
                  onChange={(e) => handleInputChange('noShowRate', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              {/* Current Ad Spend */}
              <div className="space-y-2">
                <Label htmlFor="currentAdSpend" className="text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-cyan-400" />
                  Monthly Ad Spend ($)
                </Label>
                <Input
                  id="currentAdSpend"
                  type="number"
                  placeholder="e.g., 2000"
                  value={inputs.currentAdSpend || ''}
                  onChange={(e) => handleInputChange('currentAdSpend', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            <Button
              onClick={calculateROI}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg py-6"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calculate Your ROI
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6 animate-fade-in">
            {/* Savings Breakdown */}
            <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Your Potential Monthly Savings</CardTitle>
                <CardDescription className="text-slate-400">
                  Here's what you're missing out on without automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-slate-400">Revenue Lost to Slow Response</p>
                    <p className="text-3xl font-bold text-red-400">{formatCurrency(results.revenueLostToDelays)}</p>
                  </div>

                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-slate-400">Revenue Lost to No-Shows</p>
                    <p className="text-3xl font-bold text-red-400">{formatCurrency(results.revenueLostToNoShows)}</p>
                  </div>

                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                    <p className="text-sm text-slate-400">Time Savings Value</p>
                    <p className="text-3xl font-bold text-yellow-400">{formatCurrency(results.timeSavingsValue)}</p>
                    <p className="text-xs text-slate-500 mt-1">{results.timeSaved.toFixed(1)} hours saved/month</p>
                  </div>

                  <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
                    <p className="text-sm text-slate-400">After-Hours Revenue Lost</p>
                    <p className="text-3xl font-bold text-orange-400">{formatCurrency(results.afterHoursRevenueLost)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-green-500/50 bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300 mb-1">Total Monthly Opportunity</p>
                      <p className="text-5xl font-bold text-green-400">{formatCurrency(results.totalMonthlySavings)}</p>
                      <p className="text-sm text-slate-400 mt-2">
                        That's {formatCurrency(results.totalMonthlySavings * 12)} per year you could be capturing
                      </p>
                    </div>
                    <TrendingUp className="h-16 w-16 text-green-400 opacity-50" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Tier - NO PRICE SHOWN per Zach's spec */}
            <Card className="border-cyan-500/50 bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <ArrowRight className="h-6 w-6 text-cyan-400" />
                  Recommended Solution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-6">
                  <h3 className="text-3xl font-bold text-cyan-400 mb-2">
                    {getTierDisplayName(results.recommendedTier)}
                  </h3>
                  <p className="text-slate-300 text-lg mb-4">{results.tierReason}</p>
                  <p className="text-sm text-slate-400">
                    Based on your business metrics, this tier provides the optimal balance of features and automation to capture your opportunity.
                  </p>
                </div>

                <Button
                  onClick={handleBookCall}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-lg py-6"
                >
                  Book a Call to Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-center text-xs text-slate-500">
                  No pricing shown here. We'll discuss your custom package on the call.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer Spacer */}
      <div className="h-20"></div>
    </div>
  );
}
