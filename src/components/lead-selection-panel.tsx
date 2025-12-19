'use client';

/**
 * Lead Selection Panel
 *
 * Allows users to select leads from the discovered leads list
 * and push them to the power dialer queue.
 *
 * Workflow: Leadly AI Search → Select Leads → Push to Dialer → Call
 */

import { useState } from 'react';
import {
  Phone,
  CheckCircle2,
  Circle,
  ArrowRight,
  X,
  Loader2,
  Users,
  Zap,
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  business_type?: string;
  rating?: number;
  score?: number;
  address?: string;
  website?: string;
}

interface LeadSelectionPanelProps {
  leads: Lead[];
  onPushToDialer: (selectedLeads: Lead[]) => void;
  onClose?: () => void;
}

export function LeadSelectionPanel({
  leads,
  onPushToDialer,
  onClose,
}: LeadSelectionPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pushing, setPushing] = useState(false);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  const handlePushToDialer = async () => {
    if (selectedIds.size === 0) return;

    setPushing(true);
    const selectedLeads = leads.filter(l => selectedIds.has(l.id));

    try {
      // Save to dialer queue in database
      await fetch('/api/dialer/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: selectedLeads.map(l => ({
            lead_id: l.id,
            name: l.name,
            phone: l.phone,
            business_type: l.business_type,
            score: l.score,
            priority: l.score ? Math.round(l.score / 10) : 5,
          })),
        }),
      });

      onPushToDialer(selectedLeads);
    } catch (error) {
      console.error('Failed to push to dialer:', error);
      alert('Failed to add leads to dialer queue');
    } finally {
      setPushing(false);
    }
  };

  const selectedLeads = leads.filter(l => selectedIds.has(l.id));
  const avgScore = selectedLeads.length > 0
    ? Math.round(selectedLeads.reduce((sum, l) => sum + (l.score || 50), 0) / selectedLeads.length)
    : 0;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Select Leads for Dialer</h3>
            <p className="text-xs text-slate-400">
              {selectedIds.size} of {leads.length} selected
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Select All */}
      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <button
          onClick={selectAll}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
        >
          {selectedIds.size === leads.length ? (
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <Circle className="w-4 h-4 text-slate-500" />
          )}
          Select All ({leads.length})
        </button>
      </div>

      {/* Lead List */}
      <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
        {leads.map((lead) => {
          const isSelected = selectedIds.has(lead.id);
          return (
            <button
              key={lead.id}
              onClick={() => toggleSelect(lead.id)}
              className={`w-full p-4 flex items-center gap-4 text-left transition-colors ${
                isSelected ? 'bg-cyan-500/10' : 'hover:bg-white/5'
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{lead.name}</div>
                <div className="text-sm text-slate-400 truncate">{lead.phone}</div>
                {lead.business_type && (
                  <div className="text-xs text-slate-500 mt-1">{lead.business_type}</div>
                )}
              </div>

              {lead.score !== undefined && (
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  lead.score >= 70
                    ? 'bg-green-500/20 text-green-400'
                    : lead.score >= 50
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {lead.score}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer with Action */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
            <span>{selectedIds.size} leads selected</span>
            {avgScore > 0 && (
              <span>Avg score: <span className="text-cyan-400">{avgScore}</span></span>
            )}
          </div>
        )}

        <button
          onClick={handlePushToDialer}
          disabled={selectedIds.size === 0 || pushing}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
        >
          {pushing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding to Dialer...
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              Push {selectedIds.size || ''} to Dialer
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-xs text-slate-500 text-center mt-3">
          Leads will be added to your power dialer queue
        </p>
      </div>
    </div>
  );
}

/**
 * Compact version for inline use
 */
export function LeadSelectionButton({
  selectedCount,
  onOpen,
}: {
  selectedCount: number;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors"
    >
      <Zap className="w-4 h-4" />
      Push to Dialer
      {selectedCount > 0 && (
        <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
          {selectedCount}
        </span>
      )}
    </button>
  );
}
