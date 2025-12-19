"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  DollarSign,
  Mail,
  Phone,
  Search,
  Plus,
  ArrowLeft,
  RefreshCw,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";

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
  direction: "inbound" | "outbound";
  channel: "sms" | "email";
  from_number?: string;
  to_number?: string;
  body: string;
  status: string;
  sent_at: string;
  created_at: string;
}

export default function CRMDemoPage() {
  const [activeTab, setActiveTab] = useState<"contacts" | "deals" | "messages">("contacts");
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
      if (activeTab === "contacts") {
        const response = await fetch("/api/contacts?limit=50");
        const data = await response.json();
        setContacts(data.contacts || []);
      } else if (activeTab === "deals") {
        const response = await fetch("/api/deals?limit=50");
        const data = await response.json();
        setDeals(data.deals || []);
      } else if (activeTab === "messages") {
        const response = await fetch("/api/messages?limit=50");
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.first_name?.toLowerCase().includes(query) ||
      contact.last_name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      (contact.business_name && contact.business_name.toLowerCase().includes(query))
    );
  });

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      qualified: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      proposal: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      negotiation: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      won: "bg-green-500/20 text-green-400 border-green-500/30",
      lost: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[stage] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalDealsValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonDeals = deals.filter((d) => d.stage === "won");
  const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/demos"
                className="p-2 rounded-lg bg-slate-800/50 border border-white/10 hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-400" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">CRM Demo</h1>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Live Data
                  </span>
                </div>
                <p className="text-slate-400 text-sm">Real database queries - not a mockup</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <Link
                href="/crm"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                <Database className="h-4 w-4" />
                Open Full CRM
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-800/30 rounded-lg p-3 border border-white/5">
              <div className="text-2xl font-bold text-white">{contacts.length}</div>
              <div className="text-xs text-slate-400">Contacts</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-white/5">
              <div className="text-2xl font-bold text-white">{deals.length}</div>
              <div className="text-xs text-slate-400">Deals</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-white/5">
              <div className="text-2xl font-bold text-cyan-400">{formatCurrency(totalDealsValue)}</div>
              <div className="text-xs text-slate-400">Pipeline Value</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-white/5">
              <div className="text-2xl font-bold text-green-400">{formatCurrency(wonValue)}</div>
              <div className="text-xs text-slate-400">Won Revenue</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {[
              { id: "contacts", label: "Contacts", icon: Users, count: contacts.length },
              { id: "deals", label: "Deals", icon: DollarSign, count: deals.length },
              { id: "messages", label: "Messages", icon: Mail, count: messages.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-cyan-500/20 text-cyan-400 border-t border-l border-r border-cyan-500/30"
                    : "bg-slate-800/30 text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <span className="px-1.5 py-0.5 rounded-full bg-slate-700/50 text-xs">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search Bar */}
        {activeTab === "contacts" && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts by name, email, or business..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="h-10 w-10 text-cyan-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading from database...</p>
          </div>
        ) : (
          <>
            {/* Contacts Tab */}
            {activeTab === "contacts" && (
              <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No contacts found</h3>
                    <p className="text-slate-400 mb-4">
                      {searchQuery ? "Try a different search query" : "Create contacts via the intake form or CRM"}
                    </p>
                    <Link
                      href="/crm/contacts"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Contact
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-800/50 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Contact Info
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Tags
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredContacts.map((contact) => {
                          let tags: string[] = [];
                          try {
                            tags = typeof contact.tags === "string" ? JSON.parse(contact.tags) : [];
                          } catch {
                            tags = [];
                          }

                          return (
                            <tr key={contact.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      {contact.first_name?.[0]}
                                      {contact.last_name?.[0]}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">
                                      {contact.first_name} {contact.last_name}
                                    </div>
                                    {contact.title && <div className="text-xs text-slate-400">{contact.title}</div>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-slate-500" />
                                  <div>
                                    <div className="text-sm text-white">{contact.business_name || "N/A"}</div>
                                    {contact.business_industry && (
                                      <div className="text-xs text-slate-400">{contact.business_industry}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                    {contact.email}
                                  </div>
                                  {contact.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                      <Phone className="w-4 h-4 text-slate-500" />
                                      {contact.phone}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {tags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
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
            {activeTab === "deals" && (
              <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
                {deals.length === 0 ? (
                  <div className="text-center py-16">
                    <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No deals found</h3>
                    <p className="text-slate-400 mb-4">Create deals in the full CRM system</p>
                    <Link
                      href="/crm/deals"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Deal
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-800/50 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Stage
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {deals.map((deal) => (
                          <tr key={deal.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {deal.contact?.first_name} {deal.contact?.last_name}
                              </div>
                              <div className="text-xs text-slate-400">{deal.contact?.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border ${getStageColor(
                                  deal.stage
                                )}`}
                              >
                                {deal.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-cyan-400">{formatCurrency(deal.value)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                              {deal.source || "Direct"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
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
            {activeTab === "messages" && (
              <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
                {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No messages found</h3>
                    <p className="text-slate-400">Messages will appear here after sending SMS or emails</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {messages.map((message) => (
                      <div key={message.id} className="px-6 py-4 hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`px-2 py-1 rounded-md text-xs font-medium border ${
                                message.direction === "inbound"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              }`}
                            >
                              {message.direction}
                            </div>
                            <div
                              className={`px-2 py-1 rounded-md text-xs font-medium border ${
                                message.channel === "sms"
                                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                  : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                              }`}
                            >
                              {message.channel.toUpperCase()}
                            </div>
                            <div className="text-sm text-slate-500">{formatDate(message.sent_at)}</div>
                          </div>
                          <span
                            className={`text-xs font-medium flex items-center gap-1 ${
                              message.status === "sent" || message.status === "received"
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {message.status === "sent" || message.status === "received" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {message.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mb-2">
                          {message.from_number && <span>From: {message.from_number}</span>}
                          {message.from_number && message.to_number && <span className="mx-2">•</span>}
                          {message.to_number && <span>To: {message.to_number}</span>}
                        </div>
                        <div className="text-sm text-slate-200 bg-slate-800/50 p-3 rounded-lg border border-white/5">
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

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            This demo shows live data from your database. Changes made in the{" "}
            <Link href="/crm" className="text-cyan-400 hover:underline">
              full CRM
            </Link>{" "}
            will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
