"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Phone,
  Mail,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  User,
  X,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Voicemail
} from "lucide-react";

interface Communication {
  id: string;
  team_id: string;
  type: "sms" | "email" | "call";
  direction: "inbound" | "outbound";
  contact_id: string | null;
  deal_id: string | null;
  lead_id: string | null;
  from_address: string | null;
  to_address: string | null;
  subject: string | null;
  body: string | null;
  status: string;
  duration_seconds: number | null;
  outcome: string | null;
  created_at: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const TYPE_CONFIG = {
  sms: {
    icon: MessageSquare,
    label: "SMS",
    color: "bg-green-500/20 text-green-300 border-green-500/30",
    iconColor: "text-green-400"
  },
  email: {
    icon: Mail,
    label: "Email",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    iconColor: "text-blue-400"
  },
  call: {
    icon: Phone,
    label: "Call",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    iconColor: "text-purple-400"
  }
};

const CALL_OUTCOMES = [
  { value: "connected", label: "Connected", icon: PhoneCall },
  { value: "voicemail", label: "Voicemail", icon: Voicemail },
  { value: "no_answer", label: "No Answer", icon: PhoneMissed },
  { value: "busy", label: "Busy", icon: PhoneOff },
];

export default function CRMCommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "sms" | "email" | "call">("all");
  const [filterDirection, setFilterDirection] = useState<"all" | "inbound" | "outbound">("all");

  // Modal states
  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState<"sms" | "email" | "call">("call");
  const [logDirection, setLogDirection] = useState<"inbound" | "outbound">("outbound");
  const [logContactId, setLogContactId] = useState("");
  const [logSubject, setLogSubject] = useState("");
  const [logBody, setLogBody] = useState("");
  const [logDuration, setLogDuration] = useState("");
  const [logOutcome, setLogOutcome] = useState("");

  const teamId = "default-team";

  useEffect(() => {
    fetchCommunications();
    fetchContacts();
  }, []);

  async function fetchCommunications() {
    try {
      const res = await fetch(`/api/communications?team_id=${teamId}`);
      const data = await res.json();
      setCommunications(data.communications || []);
    } catch (error) {
      console.error("Failed to fetch communications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchContacts() {
    try {
      const res = await fetch(`/api/contacts?team_id=${teamId}&limit=100`);
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  }

  async function logCommunication() {
    if (!logContactId) {
      alert("Please select a contact");
      return;
    }

    const contact = contacts.find(c => c.id === logContactId);

    try {
      const res = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          type: logType,
          direction: logDirection,
          contact_id: logContactId,
          from_address: logDirection === "outbound" ? "You" : (contact?.phone || contact?.email),
          to_address: logDirection === "outbound" ? (contact?.phone || contact?.email) : "You",
          subject: logSubject || null,
          body: logBody || null,
          duration_seconds: logType === "call" && logDuration ? parseInt(logDuration) * 60 : null,
          outcome: logType === "call" ? logOutcome : null,
          status: "sent"
        }),
      });

      if (res.ok) {
        setShowLogModal(false);
        resetForm();
        fetchCommunications();
      }
    } catch (error) {
      console.error("Failed to log communication:", error);
    }
  }

  function resetForm() {
    setLogType("call");
    setLogDirection("outbound");
    setLogContactId("");
    setLogSubject("");
    setLogBody("");
    setLogDuration("");
    setLogOutcome("");
  }

  // Filter communications
  const filteredCommunications = communications.filter((comm) => {
    const contactName = `${comm.contact_first_name || ""} ${comm.contact_last_name || ""}`.toLowerCase();
    const matchesSearch =
      contactName.includes(searchQuery.toLowerCase()) ||
      (comm.body || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comm.subject || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || comm.type === filterType;
    const matchesDirection = filterDirection === "all" || comm.direction === filterDirection;

    return matchesSearch && matchesType && matchesDirection;
  });

  function formatDuration(seconds: number | null): string {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function getOutcomeIcon(outcome: string | null) {
    const found = CALL_OUTCOMES.find(o => o.value === outcome);
    return found ? found.icon : PhoneCall;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading communications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-cyan-400" />
              Communications
            </h1>
            <p className="text-slate-400 mt-1">
              {communications.length} total communications logged
            </p>
          </div>
          <Button
            onClick={() => setShowLogModal(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Communication
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search communications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-white/10 text-white"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {[
              { value: "all", label: "All Types" },
              { value: "call", label: "Calls" },
              { value: "email", label: "Emails" },
              { value: "sms", label: "SMS" },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={filterType === filter.value ? "default" : "outline"}
                onClick={() => setFilterType(filter.value as any)}
                className={filterType === filter.value
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "border-white/10 text-slate-300 hover:bg-white/5"
                }
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Direction Filter */}
          <div className="flex gap-2">
            {[
              { value: "all", label: "All" },
              { value: "inbound", label: "Inbound", icon: ArrowDownLeft },
              { value: "outbound", label: "Outbound", icon: ArrowUpRight },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={filterDirection === filter.value ? "default" : "outline"}
                onClick={() => setFilterDirection(filter.value as any)}
                className={filterDirection === filter.value
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "border-white/10 text-slate-300 hover:bg-white/5"
                }
              >
                {filter.icon && <filter.icon className="h-4 w-4 mr-1" />}
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Communication Timeline */}
        {filteredCommunications.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-white/10">
            <MessageSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No communications found</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery ? "Try a different search term" : "Log your first call, email, or SMS"}
            </p>
            <Button
              onClick={() => setShowLogModal(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Communication
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommunications.map((comm) => {
              const TypeIcon = TYPE_CONFIG[comm.type].icon;
              const OutcomeIcon = comm.type === "call" ? getOutcomeIcon(comm.outcome) : null;

              return (
                <div
                  key={comm.id}
                  className="p-4 rounded-xl bg-slate-800/50 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Type Icon */}
                    <div className={`p-3 rounded-xl ${TYPE_CONFIG[comm.type].color}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {/* Header */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_CONFIG[comm.type].color}`}>
                              {TYPE_CONFIG[comm.type].label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                              comm.direction === "inbound"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}>
                              {comm.direction === "inbound" ? (
                                <ArrowDownLeft className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              {comm.direction === "inbound" ? "Inbound" : "Outbound"}
                            </span>
                            {comm.type === "call" && comm.outcome && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300 flex items-center gap-1">
                                {OutcomeIcon && <OutcomeIcon className="h-3 w-3" />}
                                {CALL_OUTCOMES.find(o => o.value === comm.outcome)?.label || comm.outcome}
                              </span>
                            )}
                            {comm.duration_seconds && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(comm.duration_seconds)}
                              </span>
                            )}
                          </div>

                          {/* Contact */}
                          {(comm.contact_first_name || comm.contact_last_name) && (
                            <div className="flex items-center gap-2 mt-2 text-white font-medium">
                              <User className="h-4 w-4 text-slate-400" />
                              {comm.contact_first_name} {comm.contact_last_name}
                            </div>
                          )}

                          {/* Subject (for emails) */}
                          {comm.subject && (
                            <p className="text-slate-300 font-medium mt-1">
                              {comm.subject}
                            </p>
                          )}

                          {/* Body */}
                          {comm.body && (
                            <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                              {comm.body}
                            </p>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(comm.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Log Communication Modal */}
        {showLogModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Log Communication</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowLogModal(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["call", "email", "sms"] as const).map((type) => {
                      const Icon = TYPE_CONFIG[type].icon;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setLogType(type)}
                          className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                            logType === type
                              ? TYPE_CONFIG[type].color
                              : "bg-slate-800/50 border-white/10 text-slate-400 hover:border-white/20"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm">{TYPE_CONFIG[type].label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direction */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["outbound", "inbound"] as const).map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => setLogDirection(dir)}
                        className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                          logDirection === dir
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                            : "bg-slate-800/50 border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        {dir === "outbound" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                        {dir === "outbound" ? "Outbound" : "Inbound"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contact
                  </label>
                  <select
                    value={logContactId}
                    onChange={(e) => setLogContactId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name} - {contact.email || contact.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Call-specific fields */}
                {logType === "call" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Call Outcome
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {CALL_OUTCOMES.map((outcome) => (
                          <button
                            key={outcome.value}
                            type="button"
                            onClick={() => setLogOutcome(outcome.value)}
                            className={`p-3 rounded-lg border flex items-center gap-2 transition-all ${
                              logOutcome === outcome.value
                                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                : "bg-slate-800/50 border-white/10 text-slate-400 hover:border-white/20"
                            }`}
                          >
                            <outcome.icon className="h-4 w-4" />
                            {outcome.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Duration (minutes)
                      </label>
                      <Input
                        type="number"
                        value={logDuration}
                        onChange={(e) => setLogDuration(e.target.value)}
                        placeholder="e.g., 5"
                        className="bg-slate-800/50 border-white/10 text-white"
                      />
                    </div>
                  </>
                )}

                {/* Email subject */}
                {logType === "email" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Subject
                    </label>
                    <Input
                      value={logSubject}
                      onChange={(e) => setLogSubject(e.target.value)}
                      placeholder="Email subject"
                      className="bg-slate-800/50 border-white/10 text-white"
                    />
                  </div>
                )}

                {/* Notes / Body */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {logType === "call" ? "Notes" : logType === "email" ? "Email Body" : "Message"}
                  </label>
                  <textarea
                    value={logBody}
                    onChange={(e) => setLogBody(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    placeholder={
                      logType === "call"
                        ? "Notes from the call..."
                        : logType === "email"
                        ? "Email content..."
                        : "Message content..."
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowLogModal(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={logCommunication}
                  disabled={!logContactId}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
                >
                  Log {TYPE_CONFIG[logType].label}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
