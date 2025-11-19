"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, AlertCircle } from "lucide-react";

interface ReviewsInteractiveProps {
  demoData: any;
}

export function ReviewsInteractive({ demoData }: ReviewsInteractiveProps) {
  const reviews = demoData.reviews || [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
      />
    ));
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "negative":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    }
  };

  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Star className="w-6 h-6 text-yellow-400" />
          Reviews Management Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reputation Score */}
        <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-400">
                {demoData.reputationScore?.current || 0} ★
              </div>
              <div className="text-xs text-slate-400">Current Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                <TrendingUp className="w-5 h-5" />
                {demoData.reputationScore?.trend || "+0"}
              </div>
              <div className="text-xs text-slate-400">3-Month Trend</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">
                {demoData.reputationScore?.totalReviews || 0}
              </div>
              <div className="text-xs text-slate-400">Total Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">
                {demoData.reputationScore?.responseRate || "0%"}
              </div>
              <div className="text-xs text-slate-400">Response Rate</div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h4 className="font-semibold text-white">Recent Reviews & AI Responses</h4>
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className={`p-4 rounded-lg border ${getSentimentColor(review.sentiment)} hover:bg-white/5 transition-all`}
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{review.author}</span>
                    <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-slate-300">
                      {review.platform}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-xs text-slate-400">{review.date}</span>
                  </div>
                </div>
                {review.escalated && (
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                )}
              </div>

              {/* Original Review */}
              <div className="mb-3 p-3 bg-white/5 border border-white/10 rounded">
                <div className="text-sm text-slate-300">{review.text}</div>
              </div>

              {/* AI Response */}
              {review.responded && (
                <div className="p-3 bg-white/5 rounded border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">AI Response</Badge>
                    <span className="text-xs text-slate-400">
                      Replied in {review.responseTime}
                    </span>
                  </div>
                  <div className="text-sm text-slate-300">{review.aiResponse}</div>
                  {review.followUpScheduled && (
                    <div className="mt-2 text-xs text-green-400 font-semibold">
                      ✓ Manager follow-up scheduled
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sentiment Analysis */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <h4 className="font-semibold mb-3 text-white">Sentiment Analysis</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{ width: `${demoData.sentimentAnalysis?.positivePercentage || 0}%` }}
                />
              </div>
              <span className="text-sm font-semibold w-12 text-white">
                {demoData.sentimentAnalysis?.positivePercentage || 0}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <div className="font-semibold mb-1 text-white">Common Praise:</div>
                <div className="space-y-1">
                  {demoData.sentimentAnalysis?.commonPraise?.map((praise: string, idx: number) => (
                    <div key={idx} className="text-xs text-green-400">
                      ✓ {praise}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1 text-white">Areas to Improve:</div>
                <div className="space-y-1">
                  {demoData.sentimentAnalysis?.commonComplaints?.map((complaint: string, idx: number) => (
                    <div key={idx} className="text-xs text-orange-400">
                      • {complaint}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
