"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PipelineAnalytics {
  stages: { name: string; count: number; totalValue: number; avgValue: number }[];
  winLoss: {
    won: number;
    lost: number;
    total: number;
    wonValue: number;
    lostValue: number;
    winRate: number;
  };
  trend: { month: string; dealsCreated: number; dealsWon: number; wonValue: number }[];
  scoreDistribution: { range: string; count: number }[];
  sources: { name: string; count: number }[];
  activities: { type: string; count: number; completed: number }[];
  period: number;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30);

  const { data: analytics, isLoading } = useQuery<PipelineAnalytics>({
    queryKey: ["pipeline-analytics", period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/pipeline?team_id=default-team&period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const stageColors: Record<string, string> = {
    new: "bg-blue-500",
    contacted: "bg-cyan-500",
    qualified: "bg-purple-500",
    proposal: "bg-amber-500",
    negotiation: "bg-orange-500",
    won: "bg-emerald-500",
    lost: "bg-red-500",
  };

  const getStageColor = (stage: string) => {
    return stageColors[stage.toLowerCase()] || "bg-slate-500";
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pipeline Analytics</h1>
          <p className="text-slate-400">Real-time insights into your sales pipeline performance</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              onClick={() => setPeriod(days)}
              variant="outline"
              size="sm"
              className={`border-white/10 ${
                period === days
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Win Rate</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {analytics?.winLoss.winRate || 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {analytics?.winLoss.won || 0} won / {analytics?.winLoss.total || 0} total
          </div>
        </Card>

        <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-green-500/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Revenue Won</span>
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {formatCurrency(analytics?.winLoss.wonValue || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Last {period} days</div>
        </Card>

        <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Deals</span>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {analytics?.stages.reduce((sum, s) => sum + (s.name !== 'won' && s.name !== 'lost' ? s.count : 0), 0) || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">In pipeline</div>
        </Card>

        <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pipeline Value</span>
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {formatCurrency(
              analytics?.stages
                .filter(s => s.name !== 'won' && s.name !== 'lost')
                .reduce((sum, s) => sum + s.totalValue, 0) || 0
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">Open opportunities</div>
        </Card>
      </div>

      {/* Pipeline Stage Distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border border-white/10 bg-slate-900/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-cyan-400" />
            Deal Stage Distribution
          </h3>
          {analytics?.stages && analytics.stages.length > 0 ? (
            <div className="space-y-3">
              {analytics.stages.map((stage) => {
                const total = analytics.stages.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? Math.round((stage.count / total) * 100) : 0;
                return (
                  <div key={stage.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 capitalize">{stage.name}</span>
                      <span className="text-slate-500">
                        {stage.count} deals ({formatCurrency(stage.totalValue)})
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStageColor(stage.name)} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No deals in pipeline yet</p>
              <Link href="/crm/deals">
                <Button variant="outline" className="mt-4 border-white/10 text-slate-400 hover:text-white">
                  Create First Deal
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Lead Score Distribution */}
        <Card className="rounded-2xl border border-white/10 bg-slate-900/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            Lead Score Distribution
          </h3>
          {analytics?.scoreDistribution && analytics.scoreDistribution.length > 0 ? (
            <div className="space-y-3">
              {analytics.scoreDistribution.map((score) => {
                const maxCount = Math.max(...analytics.scoreDistribution.map(s => s.count));
                const width = maxCount > 0 ? Math.round((score.count / maxCount) * 100) : 0;
                const isHighScore = score.range.includes('90') || score.range.includes('80');
                return (
                  <div key={score.range} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-20">{score.range}</span>
                    <div className="flex-1 h-6 bg-slate-800 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${isHighScore ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-slate-600'} transition-all flex items-center justify-end pr-2`}
                        style={{ width: `${width}%` }}
                      >
                        {width > 20 && (
                          <span className="text-xs font-medium text-white">{score.count}</span>
                        )}
                      </div>
                    </div>
                    {width <= 20 && (
                      <span className="text-xs text-slate-500">{score.count}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No leads scored yet</p>
              <Link href="/dashboard">
                <Button variant="outline" className="mt-4 border-white/10 text-slate-400 hover:text-white">
                  Discover Leads
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Lead Sources and Activity Stats */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Lead Sources */}
        <Card className="rounded-2xl border border-white/10 bg-slate-900/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Lead Sources
          </h3>
          {analytics?.sources && analytics.sources.length > 0 ? (
            <div className="grid gap-2">
              {analytics.sources.map((source, idx) => (
                <div
                  key={source.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300">{source.name}</span>
                  </div>
                  <span className="text-slate-500">{source.count} leads</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No leads tracked yet</p>
            </div>
          )}
        </Card>

        {/* Activity Stats */}
        <Card className="rounded-2xl border border-white/10 bg-slate-900/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Activity Performance
          </h3>
          {analytics?.activities && analytics.activities.length > 0 ? (
            <div className="grid gap-2">
              {analytics.activities.map((activity) => {
                const completionRate = activity.count > 0
                  ? Math.round((activity.completed / activity.count) * 100)
                  : 0;
                return (
                  <div
                    key={activity.type}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-slate-300 capitalize">{activity.type}</span>
                        <div className="text-xs text-slate-500">
                          {activity.completed}/{activity.count} completed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${completionRate >= 80 ? 'text-emerald-400' : completionRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {completionRate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No activities logged yet</p>
              <Link href="/crm/activities">
                <Button variant="outline" className="mt-4 border-white/10 text-slate-400 hover:text-white">
                  Create Activity
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Monthly Trend */}
      {analytics?.trend && analytics.trend.length > 0 && (
        <Card className="rounded-2xl border border-white/10 bg-slate-900/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            Monthly Trend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {analytics.trend.map((month) => (
              <div
                key={month.month}
                className="p-4 rounded-xl bg-slate-800/50 text-center"
              >
                <div className="text-xs text-slate-500 mb-2">{month.month}</div>
                <div className="text-xl font-bold text-white mb-1">{month.dealsWon}</div>
                <div className="text-xs text-slate-400">won</div>
                <div className="text-sm font-medium text-emerald-400 mt-2">
                  {formatCurrency(month.wonValue)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/crm/deals" className="group">
          <Card className="rounded-2xl border border-white/10 bg-slate-900/30 p-6 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                <Target className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors">View Pipeline</h4>
                <p className="text-sm text-slate-500">Manage your deals</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-600 ml-auto group-hover:text-cyan-400 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link href="/crm/contacts" className="group">
          <Card className="rounded-2xl border border-white/10 bg-slate-900/30 p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">View Contacts</h4>
                <p className="text-sm text-slate-500">Manage relationships</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-600 ml-auto group-hover:text-blue-400 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link href="/settings/automations" className="group">
          <Card className="rounded-2xl border border-white/10 bg-slate-900/30 p-6 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                <Zap className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-amber-400 transition-colors">Automations</h4>
                <p className="text-sm text-slate-500">Setup workflows</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-600 ml-auto group-hover:text-amber-400 transition-colors" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
