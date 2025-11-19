"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, MessageSquare, Send, Share, Phone, Mail, Globe, Star, MapPin, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { Lead, TeamMember } from "@/types";
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
import { getTeamMembers } from "@/lib/team";

type Props = {
  leads: Lead[];
};

export function LeadTable({ leads }: Props) {
  const [sending, setSending] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    getTeamMembers().then(setTeamMembers).catch(console.error);
  }, []);

  const handleOutreach = async (lead: Lead) => {
    setSending(lead.id);
    const response = await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: lead.id }),
    });
    const data = await response.json();
    setSending(null);
    toast.success(`Outreach for ${lead.business_name}`, {
      description: data.body,
    });
  };

  const handlePushToCrm = async (lead: Lead) => {
    const response = await fetch("/api/crm/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leads: [lead.id], pipeline: "Local Demo" }),
    });
    const data = await response.json();
    toast.success(`Synced ${lead.business_name}`, {
      description: `Status: ${data.status ?? "queued"}`,
    });
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
            <TableHead className="text-slate-400 font-semibold">Business Info</TableHead>
            <TableHead className="hidden md:table-cell text-slate-400 font-semibold">Contact</TableHead>
            <TableHead className="hidden lg:table-cell text-slate-400 font-semibold">Pain Points</TableHead>
            <TableHead className="text-slate-400 font-semibold">Score</TableHead>
            <TableHead className="text-right text-slate-400 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const member = teamMembers.find((m) => m.id === lead.owner);
            return (
              <TableRow
                key={lead.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Business Info Column */}
                <TableCell className="py-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-base mb-1">
                          {lead.business_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                          <MapPin className="h-3 w-3" />
                          {lead.location}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[10px] border-purple-500/30 bg-purple-500/10 text-purple-300"
                          >
                            {lead.industry}
                          </Badge>
                          {!lead.website && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-red-500/30 bg-red-500/10 text-red-300"
                            >
                              No Website
                            </Badge>
                          )}
                          {lead.rating && (
                            <div className="flex items-center gap-1 text-xs text-amber-400">
                              <Star className="h-3 w-3 fill-amber-400" />
                              <span>{lead.rating}</span>
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
                                  className="text-[10px] border-green-500/30 bg-green-500/10 text-green-300"
                                >
                                  <CheckCircle2 className="h-2 w-2 mr-1" />
                                  Verified
                                </Badge>
                              ) : lead.verification_date ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-red-500/30 bg-red-500/10 text-red-300"
                                >
                                  <XCircle className="h-2 w-2 mr-1" />
                                  Unverified
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                                >
                                  <AlertCircle className="h-2 w-2 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Contact Column */}
                <TableCell className="hidden md:table-cell py-4">
                  <div className="space-y-2">
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Phone className="h-3 w-3 text-cyan-400" />
                        <a
                          href={`tel:${lead.phone}`}
                          className="hover:text-cyan-400 transition-colors"
                        >
                          {lead.phone}
                        </a>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Mail className="h-3 w-3 text-cyan-400" />
                        <a
                          href={`mailto:${lead.email}`}
                          className="hover:text-cyan-400 transition-colors truncate"
                        >
                          {lead.email}
                        </a>
                      </div>
                    )}
                    {lead.website && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Globe className="h-3 w-3 text-cyan-400" />
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
                    {member && (
                      <div className="text-xs text-slate-500 mt-2">
                        Assigned to {member.name}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Pain Points Column */}
                <TableCell className="hidden lg:table-cell py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {lead.pain_points.slice(0, 3).map((pain) => (
                      <Badge
                        key={pain}
                        variant="secondary"
                        className="text-[10px] border-white/10 bg-white/5 text-slate-300"
                      >
                        {pain}
                      </Badge>
                    ))}
                    {lead.pain_points.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] border-white/10 bg-white/5 text-slate-400"
                      >
                        +{lead.pain_points.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Score Column */}
                <TableCell className="py-4">
                  <div className={cn(
                    "inline-flex flex-col items-center justify-center w-16 h-16 rounded-2xl border",
                    getScoreBgColor(lead.opportunity_score)
                  )}>
                    <div className={cn(
                      "text-2xl font-bold",
                      getScoreColor(lead.opportunity_score)
                    )}>
                      {lead.opportunity_score}
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wide">
                      Score
                    </div>
                  </div>
                </TableCell>

                {/* Actions Column */}
                <TableCell className="text-right py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                      onClick={() => handlePushToCrm(lead)}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                      onClick={() => handleOutreach(lead)}
                      disabled={sending === lead.id}
                    >
                      {sending === lead.id ? (
                        <MessageSquare className="h-4 w-4 animate-pulse text-cyan-400" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      className="h-9 w-9 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                      asChild
                    >
                      <a href={`/lead/${lead.id}`}>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
