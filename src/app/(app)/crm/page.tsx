"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Building2,
  DollarSign,
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  Tag,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Activity,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

interface Contact {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  company?: string;
  tags?: string | string[];
  lifecycle_stage?: string;
  business_name?: string;
  business_industry?: string;
  created_at: string;
  last_contacted_at?: string;
}

interface CRMStats {
  totalContacts: number;
  newThisWeek: number;
  totalDeals: number;
  pipelineValue: number;
  openTasks: number;
  messagesThisWeek: number;
}

const LIFECYCLE_STAGES = [
  { value: 'lead', label: 'Lead', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { value: 'opportunity', label: 'Opportunity', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'customer', label: 'Customer', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { value: 'churned', label: 'Churned', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
];

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [filterStage, setFilterStage] = useState<string | null>(null);

  // New contact form state
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Stats
  const stats: CRMStats = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return {
      totalContacts: contacts.length,
      newThisWeek: contacts.filter(c => new Date(c.created_at) >= oneWeekAgo).length,
      totalDeals: 0, // Will be fetched separately
      pipelineValue: 0,
      openTasks: 0,
      messagesThisWeek: 0,
    };
  }, [contacts]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        contact.first_name.toLowerCase().includes(query) ||
        contact.last_name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        (contact.company && contact.company.toLowerCase().includes(query)) ||
        (contact.business_name && contact.business_name.toLowerCase().includes(query));

      const matchesStage = !filterStage || contact.lifecycle_stage === filterStage;

      return matchesSearch && matchesStage;
    });
  }, [contacts, searchQuery, filterStage]);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contacts?limit=200');
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    if (!newContact.first_name || !newContact.last_name || !newContact.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreateLoading(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: 'manual-entry',
          ...newContact,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create contact');
      }

      const data = await response.json();
      toast.success("Contact created successfully");
      setShowCreateModal(false);
      setNewContact({ first_name: "", last_name: "", email: "", phone: "", company: "", title: "" });
      loadContacts();
    } catch (error) {
      console.error('Failed to create contact:', error);
      toast.error("Failed to create contact");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;

    try {
      const response = await fetch(`/api/contacts/${contactToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      toast.success("Contact deleted");
      setShowDeleteDialog(false);
      setContactToDelete(null);
      loadContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
      toast.error("Failed to delete contact");
    }
  };

  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const selectAllContacts = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const getStageStyle = (stage?: string) => {
    const found = LIFECYCLE_STAGES.find(s => s.value === stage);
    return found?.color || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  const getStageLabel = (stage?: string) => {
    const found = LIFECYCLE_STAGES.find(s => s.value === stage);
    return found?.label || stage || 'Unknown';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const parseTags = (tags?: string | string[]): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
      return JSON.parse(tags);
    } catch {
      return [];
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="space-y-5 pb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CRM</h1>
                <p className="text-sm text-slate-400">Manage contacts, deals, and communications</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="h-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Link
            href="/crm"
            className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-indigo-500/20 transition-all"
          >
            <Users className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Contacts</span>
          </Link>
          <Link
            href="/crm/deals"
            className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
          >
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium text-slate-300 group-hover:text-emerald-300">Deals</span>
          </Link>
          <Link
            href="/crm/activities"
            className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
          >
            <Activity className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-medium text-slate-300 group-hover:text-amber-300">Activities</span>
          </Link>
          <Link
            href="/crm/notes"
            className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
          >
            <MessageSquare className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-300">Notes</span>
          </Link>
          <Link
            href="/crm/communications"
            className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
          >
            <Phone className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-slate-300 group-hover:text-purple-300">Communications</span>
          </Link>
          <Link
            href="/crm/tags"
            className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all group"
          >
            <Tag className="h-5 w-5 text-pink-400" />
            <span className="text-sm font-medium text-slate-300 group-hover:text-pink-300">Tags</span>
          </Link>
          <Link
            href="/crm/import"
            className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all group"
          >
            <TrendingUp className="h-5 w-5 text-teal-400" />
            <span className="text-sm font-medium text-slate-300 group-hover:text-teal-300">Import</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Contacts</span>
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalContacts}</div>
            <div className="text-xs text-slate-500 mt-1">
              <span className="text-emerald-400">+{stats.newThisWeek}</span> this week
            </div>
          </div>

          <Link href="/crm/deals" className="bg-slate-900/50 border border-white/10 rounded-xl p-5 hover:border-cyan-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pipeline</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">View Deals</div>
            <div className="flex items-center text-xs text-slate-500 mt-1 group-hover:text-cyan-400 transition-colors">
              <span>Manage pipeline</span>
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </div>
          </Link>

          <Link href="/crm/activities" className="bg-slate-900/50 border border-white/10 rounded-xl p-5 hover:border-amber-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tasks</span>
              <Activity className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400">View Tasks</div>
            <div className="flex items-center text-xs text-slate-500 mt-1 group-hover:text-amber-400 transition-colors">
              <span>Manage activities</span>
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </div>
          </Link>

          <Link href="/crm/communications" className="bg-slate-900/50 border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Communications</span>
              <MessageSquare className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400">View Log</div>
            <div className="flex items-center text-xs text-slate-500 mt-1 group-hover:text-purple-400 transition-colors">
              <span>Calls, emails, SMS</span>
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </div>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts by name, email, or company..."
              className="pl-11 h-11 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 border-white/10 text-slate-300 hover:bg-white/5">
                <Filter className="h-4 w-4 mr-2" />
                {filterStage ? getStageLabel(filterStage) : "All Stages"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-white/10">
              <DropdownMenuItem
                onClick={() => setFilterStage(null)}
                className="text-slate-300 focus:bg-white/10 focus:text-white"
              >
                All Stages
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              {LIFECYCLE_STAGES.map(stage => (
                <DropdownMenuItem
                  key={stage.value}
                  onClick={() => setFilterStage(stage.value)}
                  className="text-slate-300 focus:bg-white/10 focus:text-white"
                >
                  {stage.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bulk Actions Bar */}
        {selectedContacts.size > 0 && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">
                {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-white/20 text-slate-300 hover:bg-white/10"
              >
                <Tag className="h-3 w-3 mr-2" />
                Add Tag
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-white/20 text-slate-300 hover:bg-white/10"
              >
                <Mail className="h-3 w-3 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedContacts(new Set())}
                className="h-8 text-slate-400 hover:text-white"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Contacts Table */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
            <div>
              <h2 className="text-lg font-semibold text-white">Contacts</h2>
              <p className="text-xs text-slate-400 mt-1">
                {filteredContacts.length} total contacts
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-indigo-500" />
              <p className="text-slate-400 mt-4">Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-4">
                <Users className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? "No contacts found" : "No contacts yet"}
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? "Try a different search query"
                  : "Add your first contact to get started with your CRM"
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Contact
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="w-12">
                    <button
                      onClick={selectAllContacts}
                      className={`w-5 h-5 rounded border ${
                        selectedContacts.size === filteredContacts.length
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-white/20 hover:border-white/40'
                      } flex items-center justify-center transition-colors`}
                    >
                      {selectedContacts.size === filteredContacts.length && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-slate-400 font-semibold">Contact</TableHead>
                  <TableHead className="text-slate-400 font-semibold hidden md:table-cell">Company</TableHead>
                  <TableHead className="text-slate-400 font-semibold hidden lg:table-cell">Stage</TableHead>
                  <TableHead className="text-slate-400 font-semibold hidden lg:table-cell">Tags</TableHead>
                  <TableHead className="text-slate-400 font-semibold hidden xl:table-cell">Created</TableHead>
                  <TableHead className="text-slate-400 font-semibold w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => {
                  const tags = parseTags(contact.tags);
                  const isSelected = selectedContacts.has(contact.id);

                  return (
                    <TableRow
                      key={contact.id}
                      className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                        isSelected ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      <TableCell>
                        <button
                          onClick={() => toggleContactSelection(contact.id)}
                          className={`w-5 h-5 rounded border ${
                            isSelected
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'border-white/20 hover:border-white/40'
                          } flex items-center justify-center transition-colors`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-indigo-300">
                              {contact.first_name[0]}{contact.last_name[0]}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate">
                              {contact.first_name} {contact.last_name}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                {contact.email}
                              </span>
                              {contact.phone && (
                                <span className="flex items-center gap-1 hidden sm:flex">
                                  <Phone className="h-3 w-3" />
                                  {contact.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          <div>
                            <div className="text-sm text-white">
                              {contact.company || contact.business_name || '-'}
                            </div>
                            {contact.title && (
                              <div className="text-xs text-slate-500">{contact.title}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStageStyle(contact.lifecycle_stage)}`}
                        >
                          {getStageLabel(contact.lifecycle_stage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {tags.slice(0, 3).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {tags.length > 3 && (
                            <Badge variant="outline" className="text-xs border-white/20 text-slate-400">
                              +{tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-slate-400">
                        {formatDate(contact.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                            <DropdownMenuItem className="text-slate-300 focus:bg-white/10 focus:text-white">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 focus:bg-white/10 focus:text-white">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 focus:bg-white/10 focus:text-white">
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 focus:bg-white/10 focus:text-white">
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              onClick={() => {
                                setContactToDelete(contact);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Create Contact Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Add New Contact</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new contact in your CRM
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">First Name *</Label>
                <Input
                  value={newContact.first_name}
                  onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                  placeholder="John"
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Last Name *</Label>
                <Input
                  value={newContact.last_name}
                  onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                  placeholder="Doe"
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Email *</Label>
              <Input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="john@example.com"
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Phone</Label>
              <Input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Company</Label>
                <Input
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  placeholder="Acme Inc."
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Job Title</Label>
                <Input
                  value={newContact.title}
                  onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                  placeholder="CEO"
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateContact}
              disabled={createLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {createLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Contact
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Delete Contact</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete {contactToDelete?.first_name} {contactToDelete?.last_name}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteContact}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
