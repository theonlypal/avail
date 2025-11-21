/**
 * LIVE CALL COACH PAGE
 *
 * Real-time AI-powered sales coaching during live calls
 * Integrates with Leadly.AI search engine for contextual coaching
 */

import { notFound, redirect } from 'next/navigation';
import LiveCallCoach from '@/components/live-call-coach';
import { getBusinessById, createMessage } from '@/lib/db-crm';

interface PageProps {
  params: Promise<{
    leadId: string;
  }>;
}

export default async function CallCoachPage({ params }: PageProps) {
  const { leadId } = await params;

  // Fetch business from database
  const business = await getBusinessById(leadId);

  if (!business) {
    notFound();
  }

  // Parse metadata
  const metadata = business.metadata || {};

  // Validate phone number first
  if (!business.phone) {
    redirect(`/lead/${leadId}?error=missing-phone`);
  }

  // Build lead object with all context
  const leadContext = {
    id: business.id,
    name: business.name,
    phone: business.phone, // Now guaranteed to be string
    website: business.website || '',
    address: business.address || '',
    business_type: metadata.business_type || metadata.category || business.industry || '',
    rating: metadata.rating,
    user_ratings_total: metadata.reviews || metadata.user_ratings_total,
    score: metadata.leadly_score || metadata.score,
    place_id: metadata.place_id,
  };

  /**
   * Handle call end - Save transcript and update CRM
   */
  async function handleCallEnd(transcript: any[], duration: number) {
    'use server';

    try {
      // Save call record as a message
      await createMessage({
        contact_id: null,
        direction: 'outbound',
        channel: 'sms', // Using SMS channel type for now
        body: JSON.stringify(transcript),
        status: 'completed',
        metadata: {
          type: 'call',
          duration,
          ai_coached: true,
          business_id: leadId
        },
        sent_at: new Date(),
      });

      console.log(`[Call Coach] Saved call transcript for lead ${leadId}`);
    } catch (error) {
      console.error('[Call Coach] Failed to save call:', error);
    }
  }

  return <LiveCallCoach lead={leadContext} onCallEnd={handleCallEnd} />;
}
