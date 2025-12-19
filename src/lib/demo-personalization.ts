/**
 * Demo Personalization Engine
 *
 * Transforms generic demo data into personalized experiences
 * based on prospect information from the intake form.
 */

import { type Prospect, INDUSTRY_CONFIG } from './db-prospects';

/**
 * Demo context with prospect personalization
 */
export interface DemoContext {
  prospect: Prospect | null;
  industryConfig: typeof INDUSTRY_CONFIG[keyof typeof INDUSTRY_CONFIG];
  isPersonalized: boolean;
}

/**
 * Personalized business info for demos
 */
export interface PersonalizedBusiness {
  name: string;
  industry: string;
  businessType: string;
  location: string;
  phone: string;
  website: string;
  services: string[];
  avgDealValue: number;
  monthlyLeads: number;
}

/**
 * Personalized metrics for ROI demos
 */
export interface PersonalizedMetrics {
  currentLeadsPerMonth: number;
  currentConversionRate: number;
  currentResponseTime: string;
  currentMissedLeads: number;

  projectedLeadsPerMonth: number;
  projectedConversionRate: number;
  projectedResponseTime: string;
  projectedCapturedAfterHours: number;

  currentMonthlyRevenue: number;
  projectedMonthlyRevenue: number;
  additionalMonthlyRevenue: number;
  additionalAnnualRevenue: number;
}

/**
 * Sample lead for personalized demos
 */
export interface PersonalizedLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  source: string;
  score: number;
  createdAt: string;
}

/**
 * Create demo context from prospect token
 */
export function createDemoContext(prospect: Prospect | null): DemoContext {
  const industry = prospect?.industry || 'other';
  const industryConfig = INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG['other'];

  return {
    prospect,
    industryConfig,
    isPersonalized: !!prospect,
  };
}

/**
 * Get personalized business info
 */
export function getPersonalizedBusiness(context: DemoContext): PersonalizedBusiness {
  const { prospect, industryConfig } = context;

  if (prospect) {
    return {
      name: prospect.company_name,
      industry: industryConfig.name,
      businessType: prospect.business_type,
      location: prospect.location || 'Your City',
      phone: prospect.contact_phone || '(555) 123-4567',
      website: prospect.website_url || 'yourwebsite.com',
      services: prospect.services?.length ? prospect.services : industryConfig.sampleServices,
      avgDealValue: prospect.avg_deal_value || industryConfig.avgDealValue,
      monthlyLeads: prospect.monthly_leads || industryConfig.avgMonthlyLeads,
    };
  }

  // Default demo business
  return {
    name: industryConfig.sampleBusinessNames[0],
    industry: industryConfig.name,
    businessType: industryConfig.sampleServices[0],
    location: 'Denver, CO',
    phone: '(720) 555-8421',
    website: 'proplumb.example.com',
    services: industryConfig.sampleServices,
    avgDealValue: industryConfig.avgDealValue,
    monthlyLeads: industryConfig.avgMonthlyLeads,
  };
}

/**
 * Calculate personalized metrics for ROI demonstration
 */
export function getPersonalizedMetrics(context: DemoContext): PersonalizedMetrics {
  const business = getPersonalizedBusiness(context);

  // Current state (without AVAIL)
  const currentLeadsPerMonth = business.monthlyLeads;
  const currentConversionRate = 0.05; // 5% baseline
  const currentMissedLeads = Math.round(currentLeadsPerMonth * 0.4); // 40% missed
  const currentMonthlyRevenue = currentLeadsPerMonth * currentConversionRate * business.avgDealValue;

  // Projected state (with AVAIL)
  const projectedConversionRate = 0.24; // 24% with AI
  const projectedLeadsPerMonth = Math.round(currentLeadsPerMonth * 2.5); // 2.5x more leads
  const projectedCapturedAfterHours = Math.round(projectedLeadsPerMonth * 0.3); // 30% after hours
  const projectedMonthlyRevenue = projectedLeadsPerMonth * projectedConversionRate * business.avgDealValue;

  return {
    currentLeadsPerMonth,
    currentConversionRate,
    currentResponseTime: '4 hours',
    currentMissedLeads,

    projectedLeadsPerMonth,
    projectedConversionRate,
    projectedResponseTime: 'Instant',
    projectedCapturedAfterHours,

    currentMonthlyRevenue,
    projectedMonthlyRevenue,
    additionalMonthlyRevenue: projectedMonthlyRevenue - currentMonthlyRevenue,
    additionalAnnualRevenue: (projectedMonthlyRevenue - currentMonthlyRevenue) * 12,
  };
}

/**
 * Generate personalized sample leads
 */
export function generatePersonalizedLeads(context: DemoContext, count: number = 10): PersonalizedLead[] {
  const business = getPersonalizedBusiness(context);
  const { industryConfig } = context;

  const firstNames = ['Sarah', 'Michael', 'Jennifer', 'David', 'Amanda', 'Robert', 'Lisa', 'James', 'Emily', 'Chris'];
  const lastNames = ['Mitchell', 'Torres', 'Lopez', 'Chen', 'Rodriguez', 'Johnson', 'Anderson', 'Wilson', 'Brown', 'Garcia'];

  const sources = ['Website Chat', 'Contact Form', 'Google Search', 'Referral', 'Facebook Ad', 'Yelp'];

  const leads: PersonalizedLead[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[(i + 3) % lastNames.length];
    const service = business.services[i % business.services.length];
    const source = sources[i % sources.length];

    leads.push({
      id: `lead-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `(555) ${String(100 + i * 11).padStart(3, '0')}-${String(1000 + i * 111).slice(0, 4)}`,
      service,
      message: getServiceMessage(service, industryConfig.name),
      source,
      score: 60 + Math.floor(Math.random() * 35),
      createdAt: getRandomRecentDate(i),
    });
  }

  return leads;
}

/**
 * Get industry-appropriate service message
 */
function getServiceMessage(service: string, industry: string): string {
  const messages: Record<string, string[]> = {
    'Home Services': [
      `I need help with ${service.toLowerCase()}. When can you come out?`,
      `Looking for a quote on ${service.toLowerCase()} services.`,
      `Emergency ${service.toLowerCase()} issue - need help ASAP!`,
      `Can you provide an estimate for ${service.toLowerCase()}?`,
    ],
    'Healthcare': [
      `I'd like to schedule an appointment for ${service.toLowerCase()}.`,
      `Do you accept my insurance for ${service.toLowerCase()}?`,
      `Looking for a new ${service.toLowerCase()} provider in the area.`,
    ],
    'Professional Services': [
      `I'm interested in your ${service.toLowerCase()} services.`,
      `Can we schedule a consultation about ${service.toLowerCase()}?`,
      `Looking for help with ${service.toLowerCase()} for my business.`,
    ],
    'Fitness & Wellness': [
      `I'm interested in ${service.toLowerCase()} classes.`,
      `What are your membership options for ${service.toLowerCase()}?`,
      `Can I try a free ${service.toLowerCase()} session?`,
    ],
    'default': [
      `I'm interested in your ${service.toLowerCase()} services.`,
      `Can you tell me more about ${service.toLowerCase()}?`,
      `Looking for help with ${service.toLowerCase()}.`,
    ],
  };

  const industryMessages = messages[industry] || messages['default'];
  return industryMessages[Math.floor(Math.random() * industryMessages.length)];
}

/**
 * Get random recent date for demo data
 */
function getRandomRecentDate(index: number): string {
  const now = new Date();
  const hoursAgo = index * 4 + Math.floor(Math.random() * 12);
  now.setHours(now.getHours() - hoursAgo);
  return now.toISOString();
}

/**
 * Get pain points based on industry
 */
export function getIndustryPainPoints(context: DemoContext): string[] {
  return context.industryConfig.commonPainPoints;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
