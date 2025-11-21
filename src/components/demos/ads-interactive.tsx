"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Target, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface AdsInteractiveProps {
  demoData: any;
}

// Helper to format values that might already have $ or be numbers
const ensureCurrency = (value: any): string => {
  if (!value && value !== 0) return '$0.00';
  const str = String(value);
  if (str.startsWith('$')) return str;
  const num = parseFloat(str);
  return isNaN(num) ? str : formatCurrency(num);
};

export function AdsInteractive({ demoData }: AdsInteractiveProps) {
  const googleAds = demoData.googleAds || {};
  const facebookAds = demoData.facebookAds || {};
  const seo = demoData.seo || {};

  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="w-6 h-6 text-red-400" />
          Ads & SEO Performance Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="google" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 data-[state=active]:text-cyan-400 text-slate-400">Google Ads</TabsTrigger>
            <TabsTrigger value="facebook" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 data-[state=active]:text-cyan-400 text-slate-400">Facebook Ads</TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 data-[state=active]:text-cyan-400 text-slate-400">SEO</TabsTrigger>
          </TabsList>

          {/* Google Ads Tab */}
          <TabsContent value="google" className="space-y-4 mt-4">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg border border-white/10 text-center hover:border-red-500/30 transition-all">
                <div className="text-2xl font-bold text-red-400">
                  {googleAds.totalSpend}
                </div>
                <div className="text-xs text-slate-400">Monthly Spend</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-white/10 text-center hover:border-green-500/30 transition-all">
                <div className="text-2xl font-bold text-green-400">
                  {googleAds.totalConversions}
                </div>
                <div className="text-xs text-slate-400">Conversions</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-white/10 text-center hover:border-cyan-500/30 transition-all">
                <div className="text-2xl font-bold text-blue-400">
                  {ensureCurrency(googleAds.avgCostPerLead)}
                </div>
                <div className="text-xs text-slate-400">Cost Per Lead</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-white/10 text-center hover:border-purple-500/30 transition-all">
                <div className="text-2xl font-bold text-purple-400">
                  {googleAds.overallROI}
                </div>
                <div className="text-xs text-slate-400">ROI</div>
              </div>
            </div>

            {/* Campaigns */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Active Campaigns</h4>
              {googleAds.campaigns?.map((campaign: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-white">{campaign.name}</h5>
                      <Badge className="text-xs mt-1 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        ROI: {campaign.roi}
                      </div>
                      <div className="text-xs text-slate-400">{campaign.budget}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                    <div>
                      <div className="font-semibold text-white">{campaign.impressions?.toLocaleString()}</div>
                      <div className="text-slate-400">Impressions</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{campaign.clicks}</div>
                      <div className="text-slate-400">Clicks</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{campaign.ctr}</div>
                      <div className="text-slate-400">CTR</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{campaign.conversions}</div>
                      <div className="text-slate-400">Conversions</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{campaign.conversionRate}</div>
                      <div className="text-slate-400">Conv. Rate</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-400">{campaign.revenue}</div>
                      <div className="text-slate-400">Revenue</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Facebook Ads Tab */}
          <TabsContent value="facebook" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-white/10 text-center hover:border-blue-500/30 transition-all">
                <div className="text-2xl font-bold text-blue-400">
                  {facebookAds.totalSpend}
                </div>
                <div className="text-xs text-slate-400">Monthly Spend</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-white/10 text-center hover:border-green-500/30 transition-all">
                <div className="text-2xl font-bold text-green-400">
                  {facebookAds.totalLeads}
                </div>
                <div className="text-xs text-slate-400">Total Leads</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-white/10 text-center hover:border-orange-500/30 transition-all">
                <div className="text-2xl font-bold text-orange-400">
                  {ensureCurrency(facebookAds.avgCostPerLead)}
                </div>
                <div className="text-xs text-slate-400">Cost Per Lead</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-white/10 text-center hover:border-purple-500/30 transition-all">
                <div className="text-2xl font-bold text-purple-400">
                  {facebookAds.overallROI}
                </div>
                <div className="text-xs text-slate-400">ROI</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-white">Active Campaigns</h4>
              {facebookAds.campaigns?.map((campaign: any, idx: number) => (
                <div key={idx} className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-white">{campaign.name}</h5>
                      <Badge className="text-xs mt-1 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {campaign.objective}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        ROI: {campaign.roi}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                    <div>
                      <div className="font-semibold text-white">{campaign.reach?.toLocaleString()}</div>
                      <div className="text-slate-400">Reach</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{campaign.clicks?.toLocaleString()}</div>
                      <div className="text-slate-400">Clicks</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{campaign.leads}</div>
                      <div className="text-slate-400">Leads</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{ensureCurrency(campaign.costPerLead)}</div>
                      <div className="text-slate-400">Cost/Lead</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-400">{campaign.revenue}</div>
                      <div className="text-slate-400">Revenue</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-white/10 text-center hover:border-green-500/30 transition-all">
                <div className="text-2xl font-bold text-green-400">
                  {seo.totalKeywords}
                </div>
                <div className="text-xs text-slate-400">Total Keywords</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-white/10 text-center hover:border-cyan-500/30 transition-all">
                <div className="text-2xl font-bold text-blue-400">
                  {seo.keywordsInTop3}
                </div>
                <div className="text-xs text-slate-400">Top 3 Rankings</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-white/10 text-center hover:border-purple-500/30 transition-all">
                <div className="text-2xl font-bold text-purple-400">
                  {seo.organicTraffic?.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">Organic Visits/mo</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-white/10 text-center hover:border-orange-500/30 transition-all">
                <div className="text-2xl font-bold text-orange-400">
                  {seo.estimatedValue}
                </div>
                <div className="text-xs text-slate-400">Est. Monthly Value</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-white">
                <Target className="w-5 h-5 text-green-400" />
                Top Ranking Keywords
              </h4>
              {seo.topKeywords?.map((keyword: any, idx: number) => (
                <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between hover:bg-white/10 hover:border-cyan-500/30 transition-all">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-white">{keyword.keyword}</div>
                    <div className="text-xs text-slate-400">
                      {keyword.searchVolume} searches/month • {keyword.difficulty} difficulty
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <Badge className={`text-lg px-3 ${keyword.position <= 3 ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : "bg-white/10 text-slate-300 border-white/20"}`}>
                        #{keyword.position}
                      </Badge>
                      <div className="text-xs text-slate-400 mt-1">Position</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-400">{keyword.clicks}</div>
                      <div className="text-xs text-slate-400">Clicks</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Performance Over Time */}
        {demoData.performanceOverTime && (
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Performance Trend
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {demoData.performanceOverTime.map((month: any, idx: number) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded text-center hover:bg-white/10 transition-all">
                  <div className="font-bold text-sm mb-1 text-white">{month.month}</div>
                  <div className="text-xs space-y-1">
                    <div className="text-slate-400">Leads: {month.leads}</div>
                    <div className="text-green-400 font-semibold">ROI: {month.roi}x</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
