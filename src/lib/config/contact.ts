/**
 * AVAIL Contact Configuration
 *
 * Centralized contact information used across the entire application.
 * Update these values to change contact info site-wide.
 */

export const AVAIL_CONTACT = {
  // Primary business phone - displayed on all pages
  phone: "(626) 394-7645",
  phoneRaw: "+16263947645",
  phoneE164: "+16263947645",

  // Email addresses
  email: "hello@availai.com",
  supportEmail: "support@availai.com",

  // Business info
  companyName: "AVAIL",
  tagline: "AI-Powered Business Automation",

  // Social links (update when available)
  social: {
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
  },

  // Business hours
  hours: {
    display: "Mon-Fri 9AM-6PM PT",
    timezone: "America/Los_Angeles",
  },
} as const;

/**
 * Helper to format phone for tel: links
 */
export function getPhoneLink(): string {
  return `tel:${AVAIL_CONTACT.phoneRaw}`;
}

/**
 * Helper to get formatted display phone
 */
export function getPhoneDisplay(): string {
  return AVAIL_CONTACT.phone;
}
