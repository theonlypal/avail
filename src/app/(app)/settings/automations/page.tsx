"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  Clock,
  Mail,
  MessageSquare,
  CheckSquare,
  Tag,
  Bell,
  Globe,
  ChevronRight,
  X,
  AlertCircle,
} from "lucide-react";

// Types
type TriggerType =
  | "lead_created"
  | "lead_score_changed"
  | "contact_created"
  | "deal_created"
  | "deal_stage_changed"
  | "deal_won"
  | "deal_lost"
  | "form_submitted"
  | "booking_scheduled"
  | "no_response"
  | "tag_added";

type ActionType =
  | "send_sms"
  | "send_email"
  | "create_task"
  | "update_stage"
  | "add_tag"
  | "remove_tag"
  | "notify_team"
  | "webhook";

interface AutomationAction {
  type: ActionType;
  delay_minutes: number;
  config: {
    template_id?: string;
    message?: string;
    subject?: string;
    task_title?: string;
    task_assignee?: string;
    stage_id?: string;
    tag_id?: string;
    webhook_url?: string;
    notification_channel?: string;
  };
}

interface AutomationRule {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_config: any;
  actions: AutomationAction[];
  is_active: boolean;
  run_count: number;
  last_run_at?: string;
  created_at: string;
}

interface AutomationTemplate {
  id: string;
  name: string;
  type: "sms" | "email";
  subject?: string;
  body: string;
}

// Trigger options
const TRIGGER_OPTIONS: { value: TriggerType; label: string; description: string }[] = [
  { value: "lead_created", label: "Lead Created", description: "When a new lead is discovered" },
  { value: "lead_score_changed", label: "Lead Score Changed", description: "When a lead's score reaches a threshold" },
  { value: "contact_created", label: "Contact Created", description: "When a new contact is added" },
  { value: "deal_created", label: "Deal Created", description: "When a new deal is created" },
  { value: "deal_stage_changed", label: "Deal Stage Changed", description: "When a deal moves to a stage" },
  { value: "deal_won", label: "Deal Won", description: "When a deal is marked as won" },
  { value: "deal_lost", label: "Deal Lost", description: "When a deal is marked as lost" },
  { value: "form_submitted", label: "Form Submitted", description: "When a form is submitted" },
  { value: "booking_scheduled", label: "Booking Scheduled", description: "When a meeting is booked" },
  { value: "tag_added", label: "Tag Added", description: "When a tag is added to a contact" },
];

// Action options
const ACTION_OPTIONS: { value: ActionType; label: string; icon: any }[] = [
  { value: "send_sms", label: "Send SMS", icon: MessageSquare },
  { value: "send_email", label: "Send Email", icon: Mail },
  { value: "create_task", label: "Create Task", icon: CheckSquare },
  { value: "add_tag", label: "Add Tag", icon: Tag },
  { value: "notify_team", label: "Notify Team", icon: Bell },
  { value: "webhook", label: "Call Webhook", icon: Globe },
];

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  // Fetch rules and templates
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [rulesRes, templatesRes] = await Promise.all([
        fetch("/api/automations/rules?team_id=default-team"),
        fetch("/api/automations/templates?team_id=default-team"),
      ]);

      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setRules(data.rules || []);
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch automation data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRuleActive(ruleId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/automations/rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        setRules((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, is_active: !currentStatus } : r))
        );
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    }
  }

  async function deleteRule(ruleId: string) {
    if (!confirm("Are you sure you want to delete this automation rule?")) return;

    try {
      const res = await fetch(`/api/automations/rules/${ruleId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
      }
    } catch (error) {
      console.error("Failed to delete rule:", error);
    }
  }

  function getActionIcon(actionType: ActionType) {
    const option = ACTION_OPTIONS.find((a) => a.value === actionType);
    return option?.icon || Zap;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Zap className="h-8 w-8 text-amber-400" />
              Automations
            </h1>
            <p className="text-slate-400 mt-1">
              Create automated workflows to engage leads and customers
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRule(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            New Automation
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10">
            <p className="text-sm text-slate-400">Total Automations</p>
            <p className="text-2xl font-bold text-white">{rules.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10">
            <p className="text-sm text-slate-400">Active</p>
            <p className="text-2xl font-bold text-emerald-400">
              {rules.filter((r) => r.is_active).length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10">
            <p className="text-sm text-slate-400">Total Runs</p>
            <p className="text-2xl font-bold text-cyan-400">
              {rules.reduce((sum, r) => sum + (r.run_count || 0), 0)}
            </p>
          </div>
        </div>

        {/* Rules List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No automations yet</h3>
            <p className="text-slate-400 mb-6">
              Create your first automation to start engaging leads automatically
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg"
            >
              Create Automation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => {
              const actions =
                typeof rule.actions === "string" ? JSON.parse(rule.actions) : rule.actions || [];

              return (
                <div
                  key={rule.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    rule.is_active
                      ? "bg-slate-800/50 border-amber-500/30"
                      : "bg-slate-800/30 border-white/10 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            rule.is_active
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {rule.is_active ? "Active" : "Paused"}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-sm text-slate-400 mt-1">{rule.description}</p>
                      )}

                      {/* Trigger */}
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">
                          When
                        </span>
                        <span className="text-slate-300">
                          {TRIGGER_OPTIONS.find((t) => t.value === rule.trigger_type)?.label ||
                            rule.trigger_type}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {actions.map((action: AutomationAction, idx: number) => {
                          const Icon = getActionIcon(action.type);
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 text-sm"
                            >
                              {action.delay_minutes > 0 && (
                                <span className="flex items-center gap-1 text-amber-400 mr-1">
                                  <Clock className="h-3 w-3" />
                                  {action.delay_minutes}m
                                </span>
                              )}
                              <Icon className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-300">
                                {ACTION_OPTIONS.find((a) => a.value === action.type)?.label ||
                                  action.type}
                              </span>
                              {idx < actions.length - 1 && (
                                <ChevronRight className="h-4 w-4 text-slate-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Stats */}
                      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                        <span>Runs: {rule.run_count || 0}</span>
                        {rule.last_run_at && (
                          <span>
                            Last run: {new Date(rule.last_run_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRuleActive(rule.id, rule.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          rule.is_active
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                        }`}
                        title={rule.is_active ? "Pause" : "Activate"}
                      >
                        {rule.is_active ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setShowCreateModal(true);
                        }}
                        className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <AutomationModal
            rule={editingRule}
            templates={templates}
            onClose={() => {
              setShowCreateModal(false);
              setEditingRule(null);
            }}
            onSave={() => {
              setShowCreateModal(false);
              setEditingRule(null);
              fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Automation Create/Edit Modal
function AutomationModal({
  rule,
  templates,
  onClose,
  onSave,
}: {
  rule: AutomationRule | null;
  templates: AutomationTemplate[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(rule?.name || "");
  const [description, setDescription] = useState(rule?.description || "");
  const [triggerType, setTriggerType] = useState<TriggerType>(rule?.trigger_type || "lead_created");
  const [triggerConfig, setTriggerConfig] = useState<any>(
    typeof rule?.trigger_config === "string"
      ? JSON.parse(rule.trigger_config)
      : rule?.trigger_config || {}
  );
  const [actions, setActions] = useState<AutomationAction[]>(
    typeof rule?.actions === "string" ? JSON.parse(rule.actions) : rule?.actions || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addAction() {
    setActions([
      ...actions,
      {
        type: "send_sms",
        delay_minutes: 0,
        config: {},
      },
    ]);
  }

  function updateAction(index: number, updates: Partial<AutomationAction>) {
    setActions((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...updates } : a))
    );
  }

  function removeAction(index: number) {
    setActions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (actions.length === 0) {
      setError("Add at least one action");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        team_id: "default-team",
        name,
        description,
        trigger_type: triggerType,
        trigger_config: triggerConfig,
        actions,
      };

      const url = rule
        ? `/api/automations/rules/${rule.id}`
        : "/api/automations/rules";
      const method = rule ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save automation");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {rule ? "Edit Automation" : "Create Automation"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Name & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Automation Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Welcome new leads"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this automation does"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Trigger */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3">When this happens...</h3>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGER_OPTIONS.map((trigger) => (
                <button
                  key={trigger.value}
                  onClick={() => setTriggerType(trigger.value)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    triggerType === trigger.value
                      ? "bg-cyan-500/20 border border-cyan-500/50 text-white"
                      : "bg-slate-800/50 border border-white/10 text-slate-300 hover:border-white/20"
                  }`}
                >
                  <div className="font-medium text-sm">{trigger.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{trigger.description}</div>
                </button>
              ))}
            </div>

            {/* Trigger Config */}
            {triggerType === "lead_score_changed" && (
              <div className="mt-4">
                <label className="block text-sm text-slate-400 mb-1">Score threshold</label>
                <input
                  type="number"
                  value={triggerConfig.score_threshold || ""}
                  onChange={(e) =>
                    setTriggerConfig({ ...triggerConfig, score_threshold: parseInt(e.target.value) })
                  }
                  placeholder="e.g., 80"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3">Do these actions...</h3>
            <div className="space-y-3">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-800/50 border border-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Action Type */}
                      <select
                        value={action.type}
                        onChange={(e) =>
                          updateAction(index, { type: e.target.value as ActionType })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-white/10 text-white"
                      >
                        {ACTION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {/* Delay */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <input
                          type="number"
                          min="0"
                          value={action.delay_minutes}
                          onChange={(e) =>
                            updateAction(index, { delay_minutes: parseInt(e.target.value) || 0 })
                          }
                          className="w-20 px-2 py-1 rounded bg-slate-700/50 border border-white/10 text-white text-sm"
                        />
                        <span className="text-sm text-slate-400">minutes delay</span>
                      </div>

                      {/* Action Config */}
                      {(action.type === "send_sms" || action.type === "send_email") && (
                        <div>
                          <select
                            value={action.config.template_id || ""}
                            onChange={(e) =>
                              updateAction(index, {
                                config: { ...action.config, template_id: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-white/10 text-white"
                          >
                            <option value="">Select a template or write message below</option>
                            {templates
                              .filter((t) =>
                                action.type === "send_sms" ? t.type === "sms" : t.type === "email"
                              )
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                          </select>
                          {!action.config.template_id && (
                            <textarea
                              value={action.config.message || ""}
                              onChange={(e) =>
                                updateAction(index, {
                                  config: { ...action.config, message: e.target.value },
                                })
                              }
                              placeholder="Message content. Use {{contact_name}}, {{business_name}}, {{score}}, etc."
                              rows={2}
                              className="w-full mt-2 px-3 py-2 rounded-lg bg-slate-700/50 border border-white/10 text-white placeholder-slate-500"
                            />
                          )}
                        </div>
                      )}

                      {action.type === "create_task" && (
                        <input
                          type="text"
                          value={action.config.task_title || ""}
                          onChange={(e) =>
                            updateAction(index, {
                              config: { ...action.config, task_title: e.target.value },
                            })
                          }
                          placeholder="Task title"
                          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-white/10 text-white"
                        />
                      )}

                      {action.type === "webhook" && (
                        <input
                          type="url"
                          value={action.config.webhook_url || ""}
                          onChange={(e) =>
                            updateAction(index, {
                              config: { ...action.config, webhook_url: e.target.value },
                            })
                          }
                          placeholder="https://your-webhook.com/endpoint"
                          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-white/10 text-white"
                        />
                      )}
                    </div>

                    <button
                      onClick={() => removeAction(index)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addAction}
                className="w-full p-3 rounded-lg border border-dashed border-white/20 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Action
              </button>
            </div>
          </div>
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
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : rule ? "Update" : "Create Automation"}
          </button>
        </div>
      </div>
    </div>
  );
}
