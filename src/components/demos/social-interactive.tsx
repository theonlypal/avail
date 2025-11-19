"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Calendar, TrendingUp, Video } from "lucide-react";

interface SocialInteractiveProps {
  demoData: any;
}

export function SocialInteractive({ demoData }: SocialInteractiveProps) {
  const contentCalendar = demoData.contentCalendar || [];
  const platformPerformance = demoData.platformPerformance || {};

  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Instagram className="w-6 h-6 text-pink-400" />
          Social Media Content Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(platformPerformance).map(([platform, data]: [string, any]) => (
            <div key={platform} className="p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg border border-white/10 hover:border-pink-500/30 transition-all">
              <div className="font-semibold text-lg mb-2 text-white">{platform}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Followers</span>
                  <span className="font-bold text-white">{data.followers?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Engagement</span>
                  <span className="font-bold text-green-400">{data.avgEngagement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Leads</span>
                  <span className="font-bold text-blue-400">{data.monthlyLeads}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Calendar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-cyan-400" />
              This Week's Content
            </h4>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {contentCalendar.length} posts scheduled
            </Badge>
          </div>

          <div className="space-y-3">
            {contentCalendar.slice(0, 6).map((post: any, idx: number) => (
              <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-white">{post.date}</span>
                      <span className="text-xs text-slate-400">{post.scheduled}</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-slate-300">
                      {post.postType}
                    </Badge>
                    {post.videoType && (
                      <Badge className="text-xs ml-1 bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Video className="w-3 h-3 mr-1" />
                        {post.videoType}
                      </Badge>
                    )}
                  </div>
                  {post.aiGenerated && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                      AI Generated
                    </Badge>
                  )}
                </div>

                <div className="text-sm mb-2 text-slate-300">{post.caption}</div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-2">
                    {post.platform.map((p: string) => (
                      <Badge key={p} className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-slate-400">
                    Est. reach: {post.estimatedReach}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sora Videos Showcase */}
        {demoData.soraVideos && demoData.soraVideos.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-white/10">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <Video className="w-5 h-5 text-purple-400" />
              Top Performing Sora AI Videos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoData.soraVideos.map((video: any) => (
                <div key={video.id} className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
                  <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 rounded mb-2 flex items-center justify-center text-white font-bold">
                    <Video className="w-12 h-12" />
                  </div>
                  <div className="text-sm font-semibold mb-1 text-white">{video.title}</div>
                  <div className="text-xs text-slate-400 mb-2">{video.description}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="font-bold text-white">{video.views.toLocaleString()}</div>
                      <div className="text-slate-400">Views</div>
                    </div>
                    <div>
                      <div className="font-bold text-white">{video.likes}</div>
                      <div className="text-slate-400">Likes</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-400">{video.leadsGenerated}</div>
                      <div className="text-slate-400">Leads</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Funnel Tracking */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Social Funnel Tracking
          </h4>
          <div className="space-y-2">
            {[
              { label: "Social Views", value: demoData.funnelTracking?.socialViews },
              { label: "Profile Visits", value: demoData.funnelTracking?.profileVisits },
              { label: "Link Clicks", value: demoData.funnelTracking?.linkClicks },
              { label: "Website Visits", value: demoData.funnelTracking?.websiteVisits },
              { label: "Leads Generated", value: demoData.funnelTracking?.leadsGenerated },
              { label: "Bookings Completed", value: demoData.funnelTracking?.bookingsCompleted },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-all">
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className="font-bold text-blue-400">
                  {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Revenue Generated</span>
                <span className="text-2xl font-bold text-green-400">
                  {demoData.funnelTracking?.revenue}
                </span>
              </div>
              <div className="text-center mt-2">
                <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg px-4 py-1">
                  ROI: {demoData.funnelTracking?.roi}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
