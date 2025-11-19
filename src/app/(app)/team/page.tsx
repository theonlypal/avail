/**
 * AVAIL Team Management Page
 *
 * Beautiful team collaboration and management interface
 * Matches the premium dark gradient design system
 */

"use client";

import { useEffect, useState } from "react";
import type { Team, Lead } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  TrendingUp,
  Award,
  Mail,
  UserPlus,
  Crown,
  Zap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const planLimit = 500;

  useEffect(() => {
    Promise.all([
      fetch('/api/team').then(res => res.json()),
      fetch('/api/leads').then(res => res.json())
    ])
      .then(([teamData, leadsData]) => {
        setTeam(teamData);
        setLeads(leadsData);
      })
      .catch(console.error);
  }, []);

  const usage = Math.round((leads.length / planLimit) * 100);

  if (!team) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />

        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin-smooth rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="text-slate-300 text-lg">Loading team data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

      <main className="relative mx-auto max-w-7xl px-6 py-12 space-y-8">

        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-3 border border-blue-500/30">
              <Users className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Team {team.team_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Crown className="h-4 w-4 text-yellow-500" />
                <p className="text-sm text-slate-400 uppercase font-semibold">
                  {team.subscription_tier} Plan
                </p>
              </div>
            </div>
          </div>
          <p className="text-slate-400">
            {leads.length} AI-qualified leads • {team.members.length} team members
          </p>
        </div>

        {/* Team Members Grid */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            Team Members
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {team.members.map((member, index) => {
              const owned = leads.filter((lead) => lead.owner === member.id);
              const avgScore =
                owned.length > 0 ? owned.reduce((acc, lead) => acc + lead.opportunity_score, 0) / owned.length : 0;

              return (
                <div
                  key={member.id}
                  className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-white/20 transition-all hover-lift stagger-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

                  <div className="relative space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{member.name}</p>
                          <p className="text-xs text-slate-400 uppercase">{member.role}</p>
                        </div>
                      </div>
                      {member.role === 'owner' && (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Leads Owned</span>
                        <span className="font-semibold text-white">{owned.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Avg Score</span>
                        <span className="font-semibold text-cyan-400">{avgScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Plan Usage */}
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Plan Usage</h3>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">AI-Qualified Leads</span>
                <span className="font-semibold text-white">{leads.length} / {planLimit}</span>
              </div>
              <Progress value={usage} className="h-2" />
              <p className="mt-3 text-xs text-slate-400">
                Daily refresh scheduled at 9:00 AM PT. Upgrade to PRO+ for 5k leads/month.
              </p>
            </div>
          </div>

          {/* Wins This Week */}
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <Award className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">Wins This Week</h3>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">
                    Zach closed 3 med spas with AI receptionist play.
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">
                    Ryan launched 2 SMS drip campaigns.
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">
                    DC booked 5 demos from auto-repair segment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invite Teammates */}
        <section className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/20 p-2">
                <UserPlus className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Invite Teammates</h2>
                <p className="text-sm text-slate-400">Grow your team and collaborate on leads</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs uppercase text-slate-400 font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <Input
                  placeholder="newrep@avail.ai"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-slate-400 font-semibold">Role</label>
                <select className="w-full rounded-lg bg-white/5 border border-white/20 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option className="bg-slate-900">rep</option>
                  <option className="bg-slate-900">manager</option>
                  <option className="bg-slate-900">owner</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-slate-400 font-semibold opacity-0">Action</label>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all hover-lift">
                  Send Invite
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Spacer */}
      <div className="h-20"></div>
    </div>
  );
}
