"use client";

import { useState } from "react";
import { Phone, Mail, Globe, Star, MapPin, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import type { Lead } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UnifiedCallWrapper } from "@/components/dashboard/unified-call-wrapper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  leads: Lead[];
};

export function LeadTable({ leads }: Props) {
  const [callingLead, setCallingLead] = useState<Lead | null>(null);
  const [painPointsLead, setPainPointsLead] = useState<Lead | null>(null);

  // DEBUG: Log when callingLead state changes
  console.log('[LeadTable] 📊 callingLead state:', callingLead?.business_name || 'null');

  const handleStartCall = (lead: Lead) => {
    console.log('[LeadTable] ✅ handleStartCall called for:', lead.business_name);
    if (!lead.phone) {
      toast.error("No phone number available", {
        description: `${lead.business_name} doesn't have a phone number on file.`,
      });
      return;
    }
    console.log('[LeadTable] 🔄 Setting callingLead to:', lead.business_name);
    setCallingLead(lead);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-cyan-400";
    if (score >= 70) return "text-yellow-400";
    return "text-orange-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500/10 border-green-500/30";
    if (score >= 80) return "bg-cyan-500/10 border-cyan-500/30";
    if (score >= 70) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-orange-500/10 border-orange-500/30";
  };

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10 hover:bg-transparent">
            <TableHead className="text-slate-400 font-semibold w-[280px]">Business</TableHead>
            <TableHead className="hidden md:table-cell text-slate-400 font-semibold w-[180px]">Contact</TableHead>
            <TableHead className="hidden lg:table-cell text-slate-400 font-semibold w-[150px]">Insights</TableHead>
            <TableHead className="text-slate-400 font-semibold w-[100px]">Score</TableHead>
            <TableHead className="text-right text-slate-400 font-semibold w-[180px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            return (
              <TableRow
                key={lead.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors h-24"
              >
                {/* Business Column - Cleaner, more spacious */}
                <TableCell className="py-6">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-lg mb-1">
                          {lead.business_name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {lead.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap ml-15">
                      <Badge
                        variant="outline"
                        className="text-xs border-purple-500/30 bg-purple-500/10 text-purple-300"
                      >
                        {lead.industry}
                      </Badge>
                      {lead.rating && (
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          <span className="font-medium">{lead.rating}</span>
                          {lead.review_count && (
                            <span className="text-slate-500">({lead.review_count})</span>
                          )}
                        </div>
                      )}
                      {lead.verified !== undefined && lead.verified !== null && (
                        <div className="flex items-center gap-1">
                          {lead.verified === 1 ? (
                            <Badge
                              variant="outline"
                              className="text-xs border-green-500/30 bg-green-500/10 text-green-300"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : lead.verification_date ? (
                            <Badge
                              variant="outline"
                              className="text-xs border-red-500/30 bg-red-500/10 text-red-300"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Contact Column - Cleaner spacing */}
                <TableCell className="hidden md:table-cell py-6">
                  <div className="space-y-3">
                    {lead.phone && (
                      <div className="flex items-center gap-2.5 text-sm text-slate-300">
                        <Phone className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        <a
                          href={`tel:${lead.phone}`}
                          className="hover:text-cyan-400 transition-colors font-medium"
                        >
                          {lead.phone}
                        </a>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2.5 text-sm text-slate-300">
                        <Mail className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        <a
                          href={`mailto:${lead.email}`}
                          className="hover:text-cyan-400 transition-colors truncate"
                        >
                          {lead.email}
                        </a>
                      </div>
                    )}
                    {lead.website && (
                      <div className="flex items-center gap-2.5 text-sm text-slate-300">
                        <Globe className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-cyan-400 transition-colors truncate"
                        >
                          Website
                        </a>
                      </div>
                    )}
                    {!lead.website && (
                      <Badge
                        variant="outline"
                        className="text-xs border-red-500/30 bg-red-500/10 text-red-300"
                      >
                        No Website
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Pain Points Column - Subtle with expand option */}
                <TableCell className="hidden lg:table-cell py-6">
                  <div className="space-y-2">
                    {lead.pain_points.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Info className="h-4 w-4 text-slate-500" />
                          <span className="font-medium">{lead.pain_points.length} insights</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 px-3"
                          onClick={() => setPainPointsLead(lead)}
                        >
                          View Details
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-slate-500">No insights</span>
                    )}
                  </div>
                </TableCell>

                {/* Score Column - Larger and more prominent */}
                <TableCell className="py-6">
                  <div className={cn(
                    "inline-flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2",
                    getScoreBgColor(lead.opportunity_score)
                  )}>
                    <div className={cn(
                      "text-3xl font-bold",
                      getScoreColor(lead.opportunity_score)
                    )}>
                      {lead.opportunity_score}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">
                      Score
                    </div>
                  </div>
                </TableCell>

                {/* Actions Column - MASSIVE Call button */}
                <TableCell className="text-right py-6">
                  <div className="flex justify-end">
                    {/* HERO CALL BUTTON - Large and prominent */}
                    {lead.phone ? (
                      <Button
                        size="lg"
                        className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl shadow-green-500/30 font-semibold text-base"
                        onClick={() => handleStartCall(lead)}
                      >
                        <Phone className="h-5 w-5 mr-3" />
                        Call Now
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-14 px-8 border-slate-600 text-slate-500 cursor-not-allowed"
                        disabled
                      >
                        <Phone className="h-5 w-5 mr-3" />
                        No Phone
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* WebRTC Call Screen - Real browser-to-phone audio */}
      {callingLead && (
        <UnifiedCallWrapper
          lead={callingLead}
          onClose={() => {
            console.log('[LeadTable] ❌ onClose called - clearing callingLead');
            console.trace('[LeadTable] Call stack for onClose:');
            setCallingLead(null);
          }}
        />
      )}

      {/* Pain Points Dialog */}
      {painPointsLead && (
        <Dialog open={!!painPointsLead} onOpenChange={() => setPainPointsLead(null)}>
          <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                Insights for {painPointsLead.business_name}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Key pain points and opportunities identified
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto">
              {painPointsLead.pain_points.map((pain, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-semibold text-cyan-400">{index + 1}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{pain}</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
