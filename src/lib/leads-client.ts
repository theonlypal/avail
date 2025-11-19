/**
 * Client-side lead operations
 * Calls API routes instead of direct database access
 */

import type { Lead, LeadFilter } from '@/types';

/**
 * Fetch leads from API with optional filters
 */
export async function fetchLeads(filter?: LeadFilter): Promise<Lead[]> {
  try {
    const params = new URLSearchParams();

    if (filter?.search) {
      params.append('search', filter.search);
    }

    if (filter?.industries && filter.industries.length > 0) {
      params.append('industries', filter.industries.join(','));
    }

    if (filter?.scoreRange) {
      params.append('scoreMin', filter.scoreRange[0].toString());
      params.append('scoreMax', filter.scoreRange[1].toString());
    }

    if (filter?.assignedTo && filter.assignedTo.length > 0) {
      params.append('assignedTo', filter.assignedTo.join(','));
    }

    const url = `/api/leads${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch leads');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
}

/**
 * Get a single lead by ID
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  try {
    const response = await fetch(`/api/leads/${id}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch lead');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching lead:', error);
    return null;
  }
}

/**
 * Create a new lead
 */
export async function createLead(
  lead: Omit<Lead, "id" | "created_at" | "team_id">
): Promise<Lead> {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    throw new Error('Failed to create lead');
  }

  return response.json();
}

/**
 * Update a lead
 */
export async function updateLead(
  id: string,
  updates: Partial<Omit<Lead, "id" | "created_at" | "team_id">>
): Promise<Lead> {
  const response = await fetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update lead');
  }

  return response.json();
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<void> {
  const response = await fetch(`/api/leads/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete lead');
  }
}

/**
 * Get industry breakdown
 */
export async function getIndustryBreakdown(): Promise<Record<string, number>> {
  try {
    const response = await fetch('/api/leads/stats/industries');

    if (!response.ok) {
      throw new Error('Failed to fetch industry breakdown');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching industry breakdown:', error);
    return {};
  }
}

/**
 * Get aggregate stats
 */
export async function getLeadStats() {
  try {
    const response = await fetch('/api/leads/stats');

    if (!response.ok) {
      throw new Error('Failed to fetch lead stats');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    return {
      totalLeads: 0,
      avgScore: 0,
      avgRating: 0,
      totalReviews: 0,
    };
  }
}
