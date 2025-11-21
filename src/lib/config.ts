/**
 * Application Configuration
 * Centralized configuration for all environment variables and settings
 */

// Business Configuration
export const BUSINESS_PHONE_NUMBER = process.env.BUSINESS_PHONE_NUMBER || process.env.NEXT_PUBLIC_BUSINESS_PHONE_NUMBER;

// Twilio Configuration
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
export const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

// Postmark Configuration
export const POSTMARK_API_KEY = process.env.POSTMARK_API_KEY;
export const POSTMARK_FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || 'noreply@avail.app';

// Google Configuration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';
export const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Anthropic Claude Configuration
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Database Configuration
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const POSTGRES_URL = process.env.POSTGRES_URL;

// Feature Flags
export const SHOW_REAL_RESULTS = process.env.SHOW_REAL_RESULTS === 'true';

// Pricing Configuration (server-only)
export const PRICING_TIERS = {
  foundation: {
    name: 'Foundation',
    monthly_3mo: 1997,
    monthly_1mo: 2597, // +600 surcharge
    features: ['CRM', 'Basic Automations', 'SMS/Email', 'Calendar Integration', 'Reviews']
  },
  pro: {
    name: 'Pro',
    monthly_3mo: 2997,
    monthly_1mo: 3597,
    features: ['Everything in Foundation', 'Advanced Automations', 'Social Media', 'Multi-location', 'Priority Support']
  },
  premium: {
    name: 'Premium',
    monthly_3mo: 4500,
    monthly_1mo: 5100,
    features: ['Everything in Pro', 'AI Features', 'Custom Integrations', 'Dedicated Success Manager', 'SLA Guarantees']
  },
  fullSite: {
    name: 'Full Site',
    monthly_3mo: 6000,
    monthly_1mo: 6600,
    features: ['Everything in Premium', 'Custom Website', 'Advanced SEO', 'Video Production', 'White Label']
  },
  enterprise: {
    name: 'Enterprise',
    monthly_min: 8500,
    monthly_max: 12500,
    features: ['Everything in Full Site', 'Unlimited Users', 'Custom Development', 'Dedicated Infrastructure', '24/7 Support']
  }
} as const;

// Validation helpers
export function isTwilioConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

export function isPostmarkConfigured(): boolean {
  return !!POSTMARK_API_KEY;
}

export function isGoogleCalendarConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

export function isAnthropicConfigured(): boolean {
  return !!ANTHROPIC_API_KEY;
}

// Format phone number for display
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Get recommended tier based on calculator inputs
export function getRecommendedTier(inputs: {
  jobsPerMonth: number;
  avgTicket: number;
  closeRate: number;
  adminHoursPerWeek: number;
  hourlyValue: number;
  afterHoursLeadsLost: number;
  noShowRate: number;
  currentAdSpend: number;
}): 'foundation' | 'pro' | 'premium' | 'fullSite' | 'enterprise' {
  const { jobsPerMonth, avgTicket, adminHoursPerWeek, currentAdSpend } = inputs;

  const monthlyRevenue = jobsPerMonth * avgTicket;
  const timeValue = adminHoursPerWeek * inputs.hourlyValue * 4.33; // weeks per month

  // Enterprise: Large operations
  if (monthlyRevenue > 500000 || adminHoursPerWeek > 40 || currentAdSpend > 10000) {
    return 'enterprise';
  }

  // Full Site: Growing businesses needing full digital presence
  if (monthlyRevenue > 200000 || adminHoursPerWeek > 25 || currentAdSpend > 5000) {
    return 'fullSite';
  }

  // Premium: Established businesses with complex needs
  if (monthlyRevenue > 100000 || adminHoursPerWeek > 15 || currentAdSpend > 2000) {
    return 'premium';
  }

  // Pro: Growing businesses with moderate volume
  if (monthlyRevenue > 50000 || adminHoursPerWeek > 10 || currentAdSpend > 1000) {
    return 'pro';
  }

  // Foundation: Starting out or smaller operations
  return 'foundation';
}
