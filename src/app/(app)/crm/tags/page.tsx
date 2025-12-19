"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  Users,
  X,
  Palette
} from "lucide-react";

interface TagData {
  id: string;
  team_id: string;
  name: string;
  color: string;
  contact_count: number;
  created_at: string;
}

const PRESET_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#64748b", // slate
];

export default function CRMTagsPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#6366f1");

  const teamId = "default-team";

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    try {
      const res = await fetch(`/api/tags?team_id=${teamId}`);
      const data = await res.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createTag() {
    if (!tagName.trim()) return;

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          name: tagName,
          color: tagColor,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchTags();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create tag");
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  }

  async function updateTag() {
    if (!editingTag || !tagName.trim()) return;

    try {
      const res = await fetch(`/api/tags/${editingTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tagName,
          color: tagColor,
        }),
      });

      if (res.ok) {
        setEditingTag(null);
        resetForm();
        fetchTags();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update tag");
      }
    } catch (error) {
      console.error("Failed to update tag:", error);
    }
  }

  async function deleteTag(id: string) {
    if (!confirm("Are you sure you want to delete this tag? It will be removed from all contacts.")) return;

    try {
      await fetch(`/api/tags/${id}`, { method: "DELETE" });
      fetchTags();
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  }

  function resetForm() {
    setTagName("");
    setTagColor("#6366f1");
  }

  function openEditModal(tag: TagData) {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
  }

  // Sort tags by name
  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading tags...</div>
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
              <Tag className="h-8 w-8 text-cyan-400" />
              Tags
            </h1>
            <p className="text-slate-400 mt-1">
              Organize your contacts with custom tags
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Tag
          </Button>
        </div>

        {/* Tags Grid */}
        {sortedTags.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-white/10">
            <Tag className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tags yet</h3>
            <p className="text-slate-400 mb-4">
              Create tags to organize and segment your contacts
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Tag
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedTags.map((tag) => (
              <div
                key={tag.id}
                className="p-4 rounded-xl bg-slate-800/50 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${tag.color}20` }}
                    >
                      <Tag
                        className="h-5 w-5"
                        style={{ color: tag.color }}
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{tag.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Users className="h-3 w-3" />
                        {tag.contact_count || 0} contacts
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(tag)}
                      className="h-8 w-8 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTag(tag.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-xs text-slate-500 font-mono">{tag.color}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {tags.length > 0 && (
          <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">
                Total Tags: <span className="text-white font-medium">{tags.length}</span>
              </span>
              <span className="text-slate-400">
                Total Tagged Contacts:{" "}
                <span className="text-white font-medium">
                  {tags.reduce((sum, t) => sum + (t.contact_count || 0), 0)}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingTag) && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingTag ? "Edit Tag" : "Create New Tag"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTag(null);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Tag Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tag Name
                  </label>
                  <Input
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="e.g., VIP, Hot Lead, Referral"
                    className="bg-slate-800/50 border-white/10 text-white"
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Tag Color
                  </label>
                  <div className="grid grid-cols-9 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setTagColor(color)}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          tagColor === color
                            ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Custom Color Input */}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="color"
                      value={tagColor}
                      onChange={(e) => setTagColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
                    />
                    <Input
                      value={tagColor}
                      onChange={(e) => setTagColor(e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1 bg-slate-800/50 border-white/10 text-white font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Preview
                  </label>
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-white/10">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${tagColor}20`,
                        color: tagColor,
                        border: `1px solid ${tagColor}40`,
                      }}
                    >
                      <Tag className="h-3.5 w-3.5" />
                      {tagName || "Tag Name"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTag(null);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingTag ? updateTag : createTag}
                  disabled={!tagName.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
                >
                  {editingTag ? "Save Changes" : "Create Tag"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
