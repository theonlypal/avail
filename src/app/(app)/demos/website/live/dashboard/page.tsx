"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MessageSquare, TrendingUp, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Lead {
  timestamp: string;
  messages: Array<{ role: string; content: string }>;
  captured: boolean;
}

export default function WebsiteDemoDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalLeads: 0,
    conversionRate: 0,
    lastUpdated: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    // Load leads from localStorage
    const loadLeads = () => {
      const storedLeads = JSON.parse(localStorage.getItem('proplumb-leads') || '[]');
      setLeads(storedLeads);

      // Calculate stats
      const totalVisitors = Math.max(storedLeads.length * 4, 47); // Simulate visitors
      const totalLeads = storedLeads.length;
      const conversionRate = totalVisitors > 0 ? ((totalLeads / totalVisitors) * 100).toFixed(1) : '0';

      setStats({
        totalVisitors,
        totalLeads,
        conversionRate: parseFloat(conversionRate),
        lastUpdated: new Date().toLocaleTimeString()
      });
    };

    loadLeads();

    // Poll for updates every 2 seconds
    const interval = setInterval(loadLeads, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearLeads = () => {
    if (confirm('Clear all demo leads?')) {
      localStorage.removeItem('proplumb-leads');
      setLeads([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/demos/website/live"
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Website
            </Link>
            <h1 className="text-3xl font-bold text-white">ProPlumb Demo Dashboard</h1>
            <p className="text-slate-300">Real-time lead capture analytics</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Last updated</div>
            <div className="font-semibold text-white">{stats.lastUpdated}</div>
            <button
              onClick={clearLeads}
              className="text-xs text-red-400 hover:text-red-300 mt-2 transition-colors"
            >
              Clear Demo Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:bg-white/10 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalVisitors}</div>
              <p className="text-xs text-slate-500 mt-1">Website sessions today</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:bg-white/10 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Leads Captured</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{stats.totalLeads}</div>
              <p className="text-xs text-slate-500 mt-1">Via AI chat widget</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:bg-white/10 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">{stats.conversionRate}%</div>
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{(stats.conversionRate - 5).toFixed(1)}% vs before AVAIL
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:bg-white/10 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">Instant</div>
              <p className="text-xs text-slate-500 mt-1">24/7 availability</p>
            </CardContent>
          </Card>
        </div>

        {/* Before/After Comparison */}
        <Card className="border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <CardHeader>
            <CardTitle className="text-white">Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-red-400 mb-3">❌ Before AVAIL</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>• Conversion Rate: <span className="font-semibold text-white">5%</span></div>
                  <div>• After-Hours Leads: <span className="font-semibold text-white">0/month</span></div>
                  <div>• Response Time: <span className="font-semibold text-white">4 hours avg</span></div>
                  <div>• Missed Opportunities: <span className="font-semibold text-white">60%</span></div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-green-400 mb-3">✅ With AVAIL</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>• Conversion Rate: <span className="font-semibold text-green-400">{stats.conversionRate}%</span></div>
                  <div>• After-Hours Leads: <span className="font-semibold text-green-400">20/month</span></div>
                  <div>• Response Time: <span className="font-semibold text-green-400">Instant</span></div>
                  <div>• Missed Opportunities: <span className="font-semibold text-green-400">5%</span></div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">
                +$6,000/month additional revenue
              </div>
              <div className="text-sm text-slate-400">Estimated impact</div>
            </div>
          </CardContent>
        </Card>

        {/* Captured Leads */}
        <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Captured Leads ({leads.length})
              </CardTitle>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Live Demo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No leads captured yet.</p>
                <p className="text-sm mt-2">Go back to the website and chat with the AI assistant!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...leads].reverse().map((lead, index) => (
                  <div key={index} className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <div className="font-semibold text-white">Lead #{leads.length - index}</div>
                          <div className="text-xs text-slate-400">
                            {new Date(lead.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Captured</Badge>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {lead.messages.map((msg, msgIndex) => (
                        <div
                          key={msgIndex}
                          className={`text-sm p-2 rounded ${
                            msg.role === 'user'
                              ? 'bg-blue-500/20 text-right border border-blue-500/30'
                              : 'bg-white/5 border border-white/10'
                          }`}
                        >
                          <div className="font-semibold text-xs mb-1 text-slate-400">
                            {msg.role === 'user' ? 'Customer' : 'AI Assistant'}
                          </div>
                          <div className="text-white">{msg.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-white/10">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-4">See This For Your Business?</h3>
            <p className="mb-6 text-blue-100">
              Get your own AI-powered website with real-time lead capture starting at just $299/month.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Schedule Free Demo Call
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
