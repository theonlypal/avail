'use client';

/**
 * Call Outcome Selector
 *
 * After each call, the sales rep selects an outcome which
 * automatically updates the lead's deal stage in the CRM.
 *
 * Outcome → Pipeline Stage mapping:
 * - No Answer → Follow-up Queue
 * - Left Voicemail → Follow-up Queue
 * - Interested → Qualified
 * - Booked Meeting → Appointment Set
 * - Not Interested → Closed-Lost
 * - Wrong Number → Remove from list
 * - Call Back Later → Follow-up Queue
 */

import { useState } from 'react';
import {
  PhoneOff,
  PhoneMissed,
  Voicemail,
  ThumbsUp,
  Calendar,
  ThumbsDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export interface CallOutcome {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  pipelineStage: string;
  shouldRemove?: boolean;
}

export const CALL_OUTCOMES: CallOutcome[] = [
  {
    id: 'no_answer',
    label: 'No Answer',
    description: 'Call was not picked up',
    icon: PhoneMissed,
    color: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
    pipelineStage: 'follow_up',
  },
  {
    id: 'voicemail',
    label: 'Left Voicemail',
    description: 'Left a voice message',
    icon: Voicemail,
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    pipelineStage: 'follow_up',
  },
  {
    id: 'interested',
    label: 'Interested',
    description: 'Showed interest in services',
    icon: ThumbsUp,
    color: 'text-green-400 bg-green-500/20 border-green-500/30',
    pipelineStage: 'qualified',
  },
  {
    id: 'meeting_booked',
    label: 'Meeting Booked',
    description: 'Scheduled an appointment',
    icon: Calendar,
    color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    pipelineStage: 'appointment_set',
  },
  {
    id: 'call_back',
    label: 'Call Back Later',
    description: 'Asked to call at another time',
    icon: Clock,
    color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    pipelineStage: 'follow_up',
  },
  {
    id: 'not_interested',
    label: 'Not Interested',
    description: 'Declined services',
    icon: ThumbsDown,
    color: 'text-red-400 bg-red-500/20 border-red-500/30',
    pipelineStage: 'closed_lost',
  },
  {
    id: 'wrong_number',
    label: 'Wrong Number',
    description: 'Not the right contact',
    icon: AlertTriangle,
    color: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    pipelineStage: 'disqualified',
    shouldRemove: true,
  },
];

interface CallOutcomeSelectorProps {
  leadId: string;
  contactId?: string;
  dealId?: string;
  onOutcomeSelected: (outcome: CallOutcome, notes: string) => void;
  onClose?: () => void;
  callDuration?: number;
  transcript?: string;
}

export function CallOutcomeSelector({
  leadId,
  contactId,
  dealId,
  onOutcomeSelected,
  onClose,
  callDuration,
  transcript,
}: CallOutcomeSelectorProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!selectedOutcome) return;

    setSaving(true);

    try {
      // Update deal stage if we have a deal
      if (dealId) {
        await fetch(`/api/deals/${dealId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: selectedOutcome.pipelineStage,
            notes: notes ? `Call outcome: ${selectedOutcome.label}. ${notes}` : `Call outcome: ${selectedOutcome.label}`,
          }),
        });
      }

      // Log activity
      if (contactId) {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contact_id: contactId,
            type: 'call',
            description: `${selectedOutcome.label}: ${notes || 'No notes'}`,
            metadata: JSON.stringify({
              outcome: selectedOutcome.id,
              duration: callDuration,
              pipeline_stage: selectedOutcome.pipelineStage,
              transcript_preview: transcript?.substring(0, 500),
            }),
          }),
        });
      }

      // If wrong number, potentially remove from call list
      if (selectedOutcome.shouldRemove && leadId) {
        await fetch(`/api/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'disqualified',
            disqualification_reason: 'Wrong number',
          }),
        });
      }

      setSaved(true);
      onOutcomeSelected(selectedOutcome, notes);
    } catch (error) {
      console.error('Failed to save call outcome:', error);
      alert('Failed to save outcome. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Outcome Saved</h3>
        <p className="text-slate-400 mb-4">
          Lead moved to <span className="text-cyan-400 font-medium">{selectedOutcome?.pipelineStage.replace('_', ' ')}</span>
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            Done
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 bg-cyan-500/20 rounded-full flex items-center justify-center">
          <PhoneOff className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Call Outcome</h3>
        <p className="text-slate-400 text-sm mt-1">
          How did the call go? This will update the CRM pipeline.
        </p>
        {callDuration !== undefined && (
          <p className="text-xs text-slate-500 mt-2">
            Call duration: {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
          </p>
        )}
      </div>

      {/* Outcome buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {CALL_OUTCOMES.map((outcome) => {
          const Icon = outcome.icon;
          const isSelected = selectedOutcome?.id === outcome.id;

          return (
            <button
              key={outcome.id}
              onClick={() => setSelectedOutcome(outcome)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? `${outcome.color} ring-2 ring-offset-2 ring-offset-slate-900 ring-current`
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-slate-400'}`} />
                <div>
                  <div className="font-medium">{outcome.label}</div>
                  <div className="text-xs opacity-70">{outcome.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Notes field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about the call..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none resize-none"
          rows={3}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!selectedOutcome || saving}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Outcome'
          )}
        </button>
      </div>
    </div>
  );
}
