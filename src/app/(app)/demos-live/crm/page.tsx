"use client";

import { useState, useEffect } from "react";
import { Users, Building2, DollarSign, Mail, Phone, Calendar, Search, Plus, X, Tag } from "lucide-react";

interface Contact {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  tags?: string;
  business_name?: string;
  business_industry?: string;
  created_at: string;
}

interface Deal {
  id: string;
  contact_id: string;
  stage: string;
  value: number;
  source?: string;
  notes?: string;
  created_at: string;
  contact?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Message {
  id: string;
  contact_id: string | null;
  direction: 'inbound' | 'outbound';
  channel: 'sms' | 'email';
  from_number?: string;
  to_number?: string;
  body: string;
  status: string;
  sent_at: string;
  created_at: string;
}

export default function CRMDemoPage() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'deals' | 'messages'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contacts') {
        const response = await fetch('/api/contacts?limit=50');
        const data = await response.json();
        setContacts(data.contacts || []);
      } else if (activeTab === 'deals') {
        const response = await fetch('/api/deals?limit=50');
        const data = await response.json();
        setDeals(data.deals || []);
      } else if (activeTab === 'messages') {
        const response = await fetch('/api/messages?limit=50');
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.first_name.toLowerCase().includes(query) ||
      contact.last_name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      (contact.business_name && contact.business_name.toLowerCase().includes(query))
    );
  });

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-700',
      'contacted': 'bg-yellow-100 text-yellow-700',
      'qualified': 'bg-purple-100 text-purple-700',
      'proposal': 'bg-indigo-100 text-indigo-700',
      'negotiation': 'bg-orange-100 text-orange-700',
      'won': 'bg-green-100 text-green-700',
      'lost': 'bg-gray-100 text-gray-700',
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
              <p className="text-gray-600 mt-1">Live data from your database</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 rounded-t-md font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Contacts
              </div>
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`px-4 py-2 rounded-t-md font-medium transition-colors ${
                activeTab === 'deals'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Deals
              </div>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-t-md font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Messages
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search Bar */}
        {activeTab === 'contacts' && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts by name, email, or business..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading data...</p>
          </div>
        ) : (
          <>
            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                    <p className="text-gray-600">
                      {searchQuery ? 'Try a different search query' : 'Submit the website form to create your first contact'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tags
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredContacts.map((contact) => {
                          let tags: string[] = [];
                          try {
                            tags = typeof contact.tags === 'string' ? JSON.parse(contact.tags) : [];
                          } catch {
                            tags = [];
                          }

                          return (
                            <tr key={contact.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-blue-600 rounded-md flex items-center justify-center">
                                    <span className="text-white font-medium">
                                      {contact.first_name[0]}{contact.last_name[0]}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {contact.first_name} {contact.last_name}
                                    </div>
                                    {contact.title && (
                                      <div className="text-sm text-gray-500">{contact.title}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {contact.business_name || 'N/A'}
                                    </div>
                                    {contact.business_industry && (
                                      <div className="text-sm text-gray-500">{contact.business_industry}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-gray-900">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    {contact.email}
                                  </div>
                                  {contact.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                      <Phone className="w-4 h-4 text-gray-400" />
                                      {contact.phone}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {tags.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(contact.created_at)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Deals Tab */}
            {activeTab === 'deals' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {deals.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
                    <p className="text-gray-600">Deals will appear here after contacts submit forms</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {deals.map((deal) => (
                          <tr key={deal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {deal.contact?.first_name} {deal.contact?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{deal.contact?.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                                {deal.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(deal.value)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {deal.source || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(deal.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                    <p className="text-gray-600">Messages will appear here after sending confirmations or receiving webhooks</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {messages.map((message) => (
                      <div key={message.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                              message.direction === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {message.direction}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                              message.channel === 'sms' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {message.channel.toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">{formatDate(message.sent_at)}</div>
                          </div>
                          <span className={`text-xs font-medium ${
                            message.status === 'sent' || message.status === 'received'
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`}>
                            {message.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {message.from_number && <div>From: {message.from_number}</div>}
                          {message.to_number && <div>To: {message.to_number}</div>}
                        </div>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          {message.body}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
