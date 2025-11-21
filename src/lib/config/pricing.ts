/**
 * AVAIL Pricing Configuration
 * Single source of truth for all pricing tiers, services, and features
 */

export type ServiceId = 'crm' | 'website' | 'call-text' | 'reviews' | 'social';
export type TierId = 'foundation' | 'pro' | 'premium' | 'full-suite' | 'enterprise';

export interface Service {
  id: ServiceId;
  name: string;
  description: string;
  icon: string;
  demoUrl: string;
  regularFeatures: string[];
  premiumFeatures: string[];
}

export interface PricingTier {
  id: TierId;
  name: string;
  price: {
    min: number;
    max?: number;
    display: string;
  };
  setupFee: number;
  servicesIncluded: number | 'all';
  serviceSelectionType: 'pick' | 'all' | 'custom';
  featuresUnlocked: 'regular' | 'regular-plus' | 'all';
  support: string;
  features: string[];
  recommended?: boolean;
  contractMinimum: number; // months
}

/**
 * The 5 core AVAIL services
 */
export const SERVICES: Record<ServiceId, Service> = {
  crm: {
    id: 'crm',
    name: 'AVAIL CRM',
    description: 'Complete customer relationship management with AI-powered lead scoring and automation',
    icon: 'Database',
    demoUrl: '/demos/crm',
    regularFeatures: [
      'Contact management',
      'Basic pipeline tracking',
      'Email sequences (pre-built templates)',
      'Basic reporting',
      'GoHighLevel integration',
      'Task management',
      'Basic automations (5 workflows max)',
    ],
    premiumFeatures: [
      'AI lead scoring',
      'Custom workflow builder (unlimited)',
      'Advanced reporting & analytics',
      'Predictive lead value calculation',
      'Smart follow-up AI agent',
      'Multi-location support',
      'Custom fields & stages',
      'API access',
      'Zapier/Make integration',
    ],
  },
  website: {
    id: 'website',
    name: 'AVAIL Website',
    description: 'AI-powered website with advanced chat, lead capture, and conversion optimization',
    icon: 'Globe',
    demoUrl: '/demos/website',
    regularFeatures: [
      'Template-based design (3-5 professional templates)',
      '5-page website',
      'Basic AI chatbot',
      'Contact forms',
      'Mobile responsive',
      'Basic SEO setup',
      'SSL certificate',
      'Hosting included',
    ],
    premiumFeatures: [
      'Custom design & branding',
      'Unlimited pages',
      'Advanced AI intake flow',
      'CRO optimization',
      'A/B testing',
      'Advanced SEO (schema, local SEO, content strategy)',
      'Before/After galleries with AI tagging',
      'Financing calculator',
      'Virtual inspection booking',
      'Blog with AI content generation',
    ],
  },
  'call-text': {
    id: 'call-text',
    name: 'AVAIL Call & Text Support',
    description: '24/7 AI-powered phone and SMS automation for lead capture and customer support',
    icon: 'Phone',
    demoUrl: '/demos/call-text',
    regularFeatures: [
      'Business hours AI call answering',
      'Basic SMS auto-responses',
      'Appointment booking via text',
      'Lead notification alerts',
      'Pre-built conversation scripts',
      'Call recording',
      'Text message templates',
    ],
    premiumFeatures: [
      '24/7 AI call answering',
      'After-hours emergency routing',
      'AI SMS agent (full conversations)',
      'Sentiment analysis',
      'Multi-language support',
      'Custom voice cloning',
      'Advanced routing logic',
      'Integration with crew scheduling',
      'Payment collection via text',
    ],
  },
  reviews: {
    id: 'reviews',
    name: 'AVAIL Reviews Management',
    description: 'Automated review generation, monitoring, and AI-powered response management',
    icon: 'Star',
    demoUrl: '/demos/reviews',
    regularFeatures: [
      'Review monitoring (Google, Yelp, Facebook)',
      'Review request automation',
      'Basic response templates',
      'Weekly review digest',
      'Review widgets for website',
    ],
    premiumFeatures: [
      'AI-generated personalized responses',
      'Sentiment analysis & alerts',
      'Competitor review tracking',
      'Review generation campaigns',
      'Negative review recovery flow',
      'Review trend analytics',
      'Video review capture',
      'QR code review funnels',
    ],
  },
  social: {
    id: 'social',
    name: 'AVAIL AI-Powered Social Media',
    description: 'AI-generated content, video creation with Sora 2, and automated social media management',
    icon: 'Share2',
    demoUrl: '/demos/social',
    regularFeatures: [
      '3 posts per week (static images)',
      'Content calendar',
      'Basic post templates',
      'Hashtag research',
      'Facebook + Instagram posting',
      'Monthly performance report',
    ],
    premiumFeatures: [
      '5 posts per week',
      'Sora 2 AI video generation (2 videos/month)',
      'Custom content strategy',
      'TikTok + YouTube Shorts',
      'Trending topic integration',
      'Before/after video compilation',
      'Customer showcase videos',
      'Ad creative generation',
      'Engagement response automation',
      'Competitor analysis',
    ],
  },
};

/**
 * The 5 pricing tiers
 */
export const PRICING_TIERS: Record<TierId, PricingTier> = {
  foundation: {
    id: 'foundation',
    name: 'AVAIL Foundation',
    price: {
      min: 1997,
      display: '$1,997',
    },
    setupFee: 1000,
    servicesIncluded: 1,
    serviceSelectionType: 'pick',
    featuresUnlocked: 'regular',
    support: 'Standard support (email + business-hours chat)',
    contractMinimum: 3, // 3-month commitment (Zach's spec)
    features: [
      'Choose ANY 1 service',
      'Regular features only',
      'Full setup + onboarding',
      'Standard workflows & automation',
      'Basic reporting',
      'Email & business-hours support',
      '3-month minimum commitment',
      '+$600/mo for 1-month commitment',
    ],
  },
  pro: {
    id: 'pro',
    name: 'AVAIL Pro',
    price: {
      min: 2997,
      display: '$2,997',
    },
    setupFee: 1000,
    servicesIncluded: 2,
    serviceSelectionType: 'pick',
    featuresUnlocked: 'regular-plus',
    support: 'Priority support',
    contractMinimum: 3, // 3-month commitment (Zach's spec)
    recommended: true,
    features: [
      'Choose ANY 2 services',
      'Regular features + enhancements',
      'Two services fully configured',
      'Faster support response',
      'Minor customizations',
      'Quarterly optimization check-ins',
      '3-month minimum commitment',
      '+$600/mo for 1-month commitment',
    ],
  },
  premium: {
    id: 'premium',
    name: 'AVAIL Premium',
    price: {
      min: 4500,
      display: '$4,500',
    },
    setupFee: 2000,
    servicesIncluded: 4,
    serviceSelectionType: 'pick',
    featuresUnlocked: 'all',
    support: 'Priority support + direct communication',
    contractMinimum: 3, // 3-month commitment (Zach's spec)
    features: [
      'Choose ANY 4 services',
      'ALL regular & premium features unlocked',
      'Four services fully managed',
      'Direct support channel (text, Slack, or phone)',
      'Monthly optimization & reporting',
      'Advanced AI models unlocked',
      'Full workflow customization',
      '3-month minimum commitment',
      '+$600/mo for 1-month commitment',
    ],
  },
  'full-suite': {
    id: 'full-suite',
    name: 'AVAIL Full Suite',
    price: {
      min: 6000,
      display: '$6,000',
    },
    setupFee: 2000,
    servicesIncluded: 'all',
    serviceSelectionType: 'all',
    featuresUnlocked: 'all',
    support: 'Dedicated account manager',
    contractMinimum: 3, // 3-month commitment (Zach's spec)
    features: [
      'ALL 5 services included',
      'Every premium feature unlocked',
      'Dedicated account manager',
      'Weekly performance reviews',
      'Unlimited workflow builds & automations',
      'Full funnel creation',
      'Brand-level social content + Sora AI',
      'Multi-location support',
      'All integrations connected',
      '3-month minimum commitment',
      '+$600/mo for 1-month commitment',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'AVAIL Enterprise',
    price: {
      min: 8500,
      max: 12500,
      display: '$8,500 - $12,500',
    },
    setupFee: 5000,
    servicesIncluded: 'all',
    serviceSelectionType: 'custom',
    featuresUnlocked: 'all',
    support: '24/7 support + engineering team',
    contractMinimum: 3, // 3-month commitment (Zach's spec)
    features: [
      'Everything in Full Suite',
      'Custom business management app',
      'Crew assignment & job tracking tools',
      'Material order logic',
      'Internal messaging system',
      'Custom-branded client portal',
      'Full enterprise integration layer',
      'Custom APIs & dashboards',
      'Dedicated engineering support',
      '3-month minimum commitment',
      '+$600/mo for 1-month commitment',
    ],
  },
};

/**
 * Service combination recommendations
 */
export const SERVICE_RECOMMENDATIONS = {
  'more-leads': {
    title: 'I need more leads',
    services: ['website', 'call-text'] as ServiceId[],
    description: 'Website captures visitors, Call & Text converts them 24/7',
  },
  'convert-leads': {
    title: 'I have leads but they\'re not converting',
    services: ['crm', 'call-text'] as ServiceId[],
    description: 'CRM organizes leads, Call & Text follows up instantly',
  },
  'build-brand': {
    title: 'I want to build my brand',
    services: ['website', 'social'] as ServiceId[],
    description: 'Professional website + consistent social media presence',
  },
  'improve-reputation': {
    title: 'I need to improve my reputation',
    services: ['reviews', 'social'] as ServiceId[],
    description: 'Generate reviews + showcase them on social media',
  },
  'complete-system': {
    title: 'I need a complete system',
    services: ['crm', 'website', 'call-text', 'reviews'] as ServiceId[],
    description: 'Full lead generation, management, and follow-up system',
  },
};

/**
 * Helper function to get features for a service based on tier
 */
export function getServiceFeatures(serviceId: ServiceId, tierId: TierId): string[] {
  const service = SERVICES[serviceId];
  const tier = PRICING_TIERS[tierId];

  if (tier.featuresUnlocked === 'all') {
    return [...service.regularFeatures, ...service.premiumFeatures];
  } else if (tier.featuresUnlocked === 'regular-plus') {
    // Pro tier gets regular features + a few premium teasers
    return [...service.regularFeatures];
  } else {
    return service.regularFeatures;
  }
}

/**
 * Helper to format pricing display
 */
export function formatPricing(tier: PricingTier): string {
  const monthly = tier.price.display;
  const setup = `$${tier.setupFee.toLocaleString()} setup`;
  return `${monthly}/mo + ${setup}`;
}
