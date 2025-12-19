"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  User,
  Briefcase,
  Target,
  Calendar,
  X
} from "lucide-react";

interface Note {
  id: string;
  team_id: string;
  content: string;
  contact_id: string | null;
  deal_id: string | null;
  lead_id: string | null;
  is_pinned: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  contact_first_name?: string;
  contact_last_name?: string;
  deal_name?: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Deal {
  id: string;
  name: string;
}

export default function CRMNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pinned" | "contact" | "deal">("all");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteContactId, setNoteContactId] = useState<string>("");
  const [noteDealId, setNoteDealId] = useState<string>("");
  const [notePinned, setNotePinned] = useState(false);

  const teamId = "default-team";

  useEffect(() => {
    fetchNotes();
    fetchContacts();
    fetchDeals();
  }, []);

  async function fetchNotes() {
    try {
      const res = await fetch(`/api/notes?team_id=${teamId}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
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

  async function fetchDeals() {
    try {
      const res = await fetch(`/api/deals?team_id=${teamId}&limit=100`);
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
    }
  }

  async function createNote() {
    if (!noteContent.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          content: noteContent,
          contact_id: noteContactId || null,
          deal_id: noteDealId || null,
          is_pinned: notePinned ? 1 : 0,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchNotes();
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  }

  async function updateNote() {
    if (!editingNote || !noteContent.trim()) return;

    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteContent,
          contact_id: noteContactId || null,
          deal_id: noteDealId || null,
          is_pinned: notePinned ? 1 : 0,
        }),
      });

      if (res.ok) {
        setEditingNote(null);
        resetForm();
        fetchNotes();
      }
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  }

  async function togglePin(note: Note) {
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_pinned: note.is_pinned ? 0 : 1,
        }),
      });
      fetchNotes();
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  }

  async function deleteNote(id: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      fetchNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }

  function resetForm() {
    setNoteContent("");
    setNoteContactId("");
    setNoteDealId("");
    setNotePinned(false);
  }

  function openEditModal(note: Note) {
    setEditingNote(note);
    setNoteContent(note.content);
    setNoteContactId(note.contact_id || "");
    setNoteDealId(note.deal_id || "");
    setNotePinned(!!note.is_pinned);
  }

  // Filter and search notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase());

    switch (filterType) {
      case "pinned":
        return matchesSearch && note.is_pinned;
      case "contact":
        return matchesSearch && note.contact_id;
      case "deal":
        return matchesSearch && note.deal_id;
      default:
        return matchesSearch;
    }
  });

  // Sort with pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  function getContactName(contactId: string | null) {
    if (!contactId) return null;
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : null;
  }

  function getDealName(dealId: string | null) {
    if (!dealId) return null;
    const deal = deals.find(d => d.id === dealId);
    return deal ? deal.name : null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="h-8 w-8 text-cyan-400" />
              Notes
            </h1>
            <p className="text-slate-400 mt-1">
              {notes.length} total notes
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-white/10 text-white"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "All" },
              { value: "pinned", label: "Pinned" },
              { value: "contact", label: "Contact Notes" },
              { value: "deal", label: "Deal Notes" },
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
        </div>

        {/* Notes Grid */}
        {sortedNotes.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-white/10">
            <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery ? "Try a different search term" : "Create your first note to get started"}
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-xl border transition-all hover:border-cyan-500/50 ${
                  note.is_pinned
                    ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30"
                    : "bg-slate-800/50 border-white/10"
                }`}
              >
                {/* Note Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {note.is_pinned && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pinned
                      </span>
                    )}
                    {note.contact_id && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {getContactName(note.contact_id) || "Contact"}
                      </span>
                    )}
                    {note.deal_id && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {getDealName(note.deal_id) || "Deal"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePin(note)}
                      className="h-8 w-8 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                    >
                      {note.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(note)}
                      className="h-8 w-8 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(note.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Note Content */}
                <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {note.content.length > 300
                    ? `${note.content.substring(0, 300)}...`
                    : note.content
                  }
                </p>

                {/* Note Footer */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-xs text-slate-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(note.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingNote) && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingNote ? "Edit Note" : "Create New Note"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingNote(null);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Note Content
                  </label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    placeholder="Write your note here..."
                  />
                </div>

                {/* Link to Contact */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Link to Contact (optional)
                  </label>
                  <select
                    value={noteContactId}
                    onChange={(e) => setNoteContactId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">No contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name} - {contact.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Link to Deal */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Link to Deal (optional)
                  </label>
                  <select
                    value={noteDealId}
                    onChange={(e) => setNoteDealId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">No deal</option>
                    {deals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {deal.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pin Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNotePinned(!notePinned)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notePinned ? "bg-amber-500" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notePinned ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-300">Pin this note</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingNote(null);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingNote ? updateNote : createNote}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {editingNote ? "Save Changes" : "Create Note"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
