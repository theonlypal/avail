"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  Mail,
  X,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

interface AutomationTemplate {
  id: string;
  team_id: string;
  name: string;
  type: "sms" | "email";
  subject?: string;
  body: string;
  created_at: string;
}

// Available template variables
const TEMPLATE_VARIABLES = [
  { key: "contact_name", description: "Full contact name" },
  { key: "first_name", description: "Contact first name" },
  { key: "last_name", description: "Contact last name" },
  { key: "email", description: "Contact email" },
  { key: "phone", description: "Contact phone" },
  { key: "company", description: "Contact company" },
  { key: "business_name", description: "Lead business name" },
  { key: "score", description: "Lead score" },
  { key: "deal_name", description: "Deal name" },
  { key: "deal_value", description: "Deal value" },
  { key: "stage", description: "Current stage" },
  { key: "booking_link", description: "Calendly booking link" },
  { key: "booking_time", description: "Scheduled booking time" },
  { key: "team_name", description: "Team name" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AutomationTemplate | null>(null);
  const [filter, setFilter] = useState<"all" | "sms" | "email">("all");

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await fetch("/api/automations/templates?team_id=default-team");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;

    try {
      const res = await fetch(`/api/automations/templates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  }

  const filteredTemplates = templates.filter((t) =>
    filter === "all" ? true : t.type === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="h-8 w-8 text-violet-400" />
              Message Templates
            </h1>
            <p className="text-slate-400 mt-1">
              Reusable SMS and email templates for automations
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            New Template
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {(["all", "sms", "email"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "bg-slate-800/50 text-slate-400 border border-white/10 hover:border-white/20"
              }`}
            >
              {f === "all" ? "All" : f === "sms" ? "SMS" : "Email"} (
              {templates.filter((t) => (f === "all" ? true : t.type === f)).length})
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-violet-400 border-t-transparent rounded-full" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No templates yet</h3>
            <p className="text-slate-400 mb-6">
              Create templates to use in your automations
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg"
            >
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-6 rounded-2xl bg-slate-800/50 border border-white/10 hover:border-violet-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {template.type === "sms" ? (
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <MessageSquare className="h-5 w-5 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Mail className="h-5 w-5 text-blue-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{template.name}</h3>
                      <span className="text-xs text-slate-500 uppercase">{template.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTemplate(template);
                        setShowModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {template.type === "email" && template.subject && (
                  <div className="mt-3">
                    <span className="text-xs text-slate-500">Subject:</span>
                    <p className="text-sm text-slate-300">{template.subject}</p>
                  </div>
                )}

                <div className="mt-3 p-3 rounded-lg bg-slate-900/50 max-h-24 overflow-hidden">
                  <p className="text-sm text-slate-400 whitespace-pre-wrap line-clamp-3">
                    {template.body}
                  </p>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Created {new Date(template.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <TemplateModal
            template={editingTemplate}
            onClose={() => {
              setShowModal(false);
              setEditingTemplate(null);
            }}
            onSave={() => {
              setShowModal(false);
              setEditingTemplate(null);
              fetchTemplates();
            }}
          />
        )}
      </div>
    </div>
  );
}

function TemplateModal({
  template,
  onClose,
  onSave,
}: {
  template: AutomationTemplate | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(template?.name || "");
  const [type, setType] = useState<"sms" | "email">(template?.type || "sms");
  const [subject, setSubject] = useState(template?.subject || "");
  const [body, setBody] = useState(template?.body || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!body.trim()) {
      setError("Message body is required");
      return;
    }
    if (type === "email" && !subject.trim()) {
      setError("Subject is required for email templates");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        team_id: "default-team",
        name,
        type,
        subject: type === "email" ? subject : undefined,
        body,
      };

      const url = template
        ? `/api/automations/templates/${template.id}`
        : "/api/automations/templates";
      const method = template ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save template");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function insertVariable(key: string) {
    const variable = `{{${key}}}`;
    setBody((prev) => prev + variable);
    setCopiedVar(key);
    setTimeout(() => setCopiedVar(null), 1500);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {template ? "Edit Template" : "Create Template"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome Message"
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Type *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("sms")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  type === "sms"
                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                    : "bg-slate-800/50 border border-white/10 text-slate-400"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                SMS
              </button>
              <button
                type="button"
                onClick={() => setType("email")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  type === "email"
                    ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                    : "bg-slate-800/50 border border-white/10 text-slate-400"
                }`}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
            </div>
          </div>

          {/* Subject (email only) */}
          {type === "email" && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          )}

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Message Body *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Your message content..."
              rows={6}
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              {type === "sms" ? "160 characters recommended for SMS" : "HTML supported for emails"}
            </p>
          </div>

          {/* Variables */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Insert Variable
            </label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className="px-2 py-1 text-xs rounded bg-slate-800 border border-white/10 text-slate-300 hover:border-violet-500/50 hover:text-violet-400 transition-colors flex items-center gap-1"
                  title={v.description}
                >
                  {copiedVar === v.key ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {`{{${v.key}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {body && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Preview</label>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-white/10">
                {type === "email" && subject && (
                  <div className="text-sm text-slate-300 mb-2 pb-2 border-b border-white/10">
                    <strong>Subject:</strong> {subject}
                  </div>
                )}
                <div className="text-sm text-slate-400 whitespace-pre-wrap">{body}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 p-6 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : template ? "Update" : "Create Template"}
          </button>
        </div>
      </div>
    </div>
  );
}
