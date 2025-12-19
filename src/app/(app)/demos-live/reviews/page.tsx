'use client';

/**
 * Reviews Management Demo - Session 4
 *
 * Features:
 * - View all review requests and their status
 * - Send new review requests to customers
 * - Track review responses (rating, text)
 * - Import customers from CSV for bulk review requests
 * - Display review stats and analytics
 */

import { useState, useEffect } from 'react';
import { Star, Send, Upload, CheckCircle, Clock, XCircle, Mail, MessageSquare, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

interface ReviewRequest {
  id: string;
  contact_id: string;
  business_id: string;
  channel: 'sms' | 'email';
  status: 'pending' | 'sent' | 'responded' | 'declined';
  platform?: string;
  review_url?: string;
  sent_at?: string;
  responded_at?: string;
  rating?: number;
  review_text?: string;
  created_at: string;

  // Joined data from contacts
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  business_id: string;
}

export default function ReviewsDemo() {
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [platform, setPlatform] = useState<string>('google');
  const [sending, setSending] = useState(false);

  // Fetch review requests and contacts on mount
  useEffect(() => {
    Promise.all([
      fetchReviewRequests(),
      fetchContacts()
    ]).finally(() => setLoading(false));
  }, []);

  async function fetchReviewRequests() {
    try {
      // For demo purposes, we'll create some sample data since we don't have a GET endpoint yet
      // In production, this would call: /api/reviews/requests?businessId=xxx
      const sampleRequests: ReviewRequest[] = [
        {
          id: '1',
          contact_id: 'c1',
          business_id: 'b1',
          channel: 'sms',
          status: 'responded',
          platform: 'google',
          sent_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          responded_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          rating: 5,
          review_text: 'Excellent service! Very professional and timely.',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          contact_name: 'John Smith',
          contact_phone: '(555) 123-4567',
        },
        {
          id: '2',
          contact_id: 'c2',
          business_id: 'b1',
          channel: 'sms',
          status: 'sent',
          platform: 'google',
          sent_at: new Date(Date.now() - 1 * 86400000).toISOString(),
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
          contact_name: 'Jane Doe',
          contact_phone: '(555) 987-6543',
        },
        {
          id: '3',
          contact_id: 'c3',
          business_id: 'b1',
          channel: 'email',
          status: 'responded',
          platform: 'yelp',
          sent_at: new Date(Date.now() - 7 * 86400000).toISOString(),
          responded_at: new Date(Date.now() - 6 * 86400000).toISOString(),
          rating: 4,
          review_text: 'Good experience overall, would recommend.',
          created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
          contact_name: 'Bob Johnson',
          contact_email: 'bob@example.com',
        },
      ];
      setReviewRequests(sampleRequests);
    } catch (error) {
      console.error('Failed to fetch review requests:', error);
    }
  }

  async function fetchContacts() {
    try {
      const response = await fetch('/api/contacts?limit=100');
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  }

  async function handleSendReviewRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedContact) return;

    setSending(true);
    try {
      const contact = contacts.find(c => c.id === selectedContact);
      if (!contact) return;

      const response = await fetch('/api/reviews/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: selectedContact,
          business_id: contact.business_id,
          channel,
          platform,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the list
        await fetchReviewRequests();
        setSelectedContact('');
        alert(`Review request sent via ${channel}!`);
      } else {
        alert(`Error: ${data.error || 'Failed to send review request'}`);
      }
    } catch (error) {
      console.error('Failed to send review request:', error);
      alert('Failed to send review request');
    } finally {
      setSending(false);
    }
  }

  // Calculate stats
  const stats = {
    total: reviewRequests.length,
    sent: reviewRequests.filter(r => r.status === 'sent' || r.status === 'responded').length,
    responded: reviewRequests.filter(r => r.status === 'responded').length,
    avgRating: reviewRequests.filter(r => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) /
               (reviewRequests.filter(r => r.rating).length || 1),
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Pending' },
    sent: { icon: Send, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Sent' },
    responded: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Responded' },
    declined: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Declined' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/demos"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Demos
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Zap className="w-3 h-3" />
              Live Demo
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Reviews Management</h1>
          <p className="text-slate-400">Request and track customer reviews across platforms</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 hover:bg-slate-900/70 transition-all">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total Requests</div>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 hover:bg-slate-900/70 transition-all">
            <div className="text-2xl font-bold text-blue-400">{stats.sent}</div>
            <div className="text-sm text-slate-400">Sent</div>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 hover:bg-slate-900/70 transition-all">
            <div className="text-2xl font-bold text-green-400">{stats.responded}</div>
            <div className="text-sm text-slate-400">Responses</div>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 hover:bg-slate-900/70 transition-all">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <div className="text-2xl font-bold text-white">{stats.avgRating.toFixed(1)}</div>
            </div>
            <div className="text-sm text-slate-400">Avg Rating</div>
          </div>
        </div>

        {/* Send New Review Request */}
        <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Send Review Request</h2>
          <form onSubmit={handleSendReviewRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Customer
                </label>
                <select
                  value={selectedContact}
                  onChange={(e) => setSelectedContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  required
                >
                  <option value="">Choose a customer...</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name} - {contact.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as 'sms' | 'email')}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                >
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                >
                  <option value="google">Google</option>
                  <option value="yelp">Yelp</option>
                  <option value="facebook">Facebook</option>
                  <option value="tripadvisor">TripAdvisor</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={sending || !selectedContact}
                className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Request'}
              </button>

              <button
                type="button"
                onClick={() => alert('CSV import feature coming soon!')}
                className="flex items-center gap-2 px-6 py-2 bg-slate-800/50 text-slate-300 border border-white/10 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import from CSV
              </button>
            </div>
          </form>
        </div>

        {/* Review Requests Table */}
        <div className="bg-slate-900/50 border border-white/10 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Review Requests</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Review
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {reviewRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No review requests yet. Send your first one above!
                    </td>
                  </tr>
                ) : (
                  reviewRequests.map((request) => {
                    const StatusIcon = statusConfig[request.status].icon;
                    return (
                      <tr key={request.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {request.contact_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-slate-400">
                            {request.contact_email || request.contact_phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {request.channel === 'sms' ? (
                              <MessageSquare className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Mail className="w-4 h-4 text-purple-400" />
                            )}
                            <span className="text-sm text-slate-300 capitalize">{request.channel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 capitalize">
                          {request.platform || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[request.status].bg} ${statusConfig[request.status].color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[request.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {request.sent_at ? new Date(request.sent_at).toLocaleDateString() : 'Not sent'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.rating ? (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < request.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          {request.review_text ? (
                            <div className="text-sm text-slate-300 truncate" title={request.review_text}>
                              {request.review_text}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
