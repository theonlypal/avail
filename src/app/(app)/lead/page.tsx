/**
 * LEADLY.AI - Lead Search & Discovery Page
 *
 * Main page for searching, discovering, and managing leads
 * Integrates with your AI search engine
 */

import { redirect } from 'next/navigation';

export default function LeadPage() {
  // Redirect to demos-live/crm where your lead management is
  redirect('/demos-live/crm');
}
