"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricsComparisonProps {
  before: Record<string, string>;
  after: Record<string, string>;
  savings?: Record<string, string>;
  title?: string;
}

export function MetricsComparison({ before, after, savings, title = "Results" }: MetricsComparisonProps) {
  const metrics = Object.keys(before);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            📊 {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Before AVAIL</h3>
              </div>
              {metrics.map((metric) => (
                <div key={`before-${metric}`} className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-red-200/50 dark:border-red-900/50">
                  <span className="text-sm font-medium capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <Badge variant="outline" className="text-red-600 border-red-300 dark:text-red-400 dark:border-red-800">
                    {before[metric]}
                  </Badge>
                </div>
              ))}
            </div>

            {/* After Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">After AVAIL</h3>
              </div>
              {metrics.map((metric) => (
                <div key={`after-${metric}`} className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-green-200/50 dark:border-green-900/50">
                  <span className="text-sm font-medium capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <Badge variant="outline" className="text-green-600 border-green-300 dark:text-green-400 dark:border-green-800">
                    {after[metric]}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Savings/Impact Section */}
          {savings && Object.keys(savings).length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                ✨ Total Impact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(savings).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{value}</div>
                    <div className="text-xs text-muted-foreground capitalize mt-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
