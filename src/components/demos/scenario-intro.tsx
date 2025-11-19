"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

interface ScenarioIntroProps {
  businessName: string;
  businessType: string;
  problem: string;
  solution: string;
}

export function ScenarioIntro({ businessName, businessType, problem, solution }: ScenarioIntroProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-6 space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Demo Scenario</h2>
          <p className="text-muted-foreground">See how AVAIL transforms a real business</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Business Info */}
          <div className="p-4 bg-white/70 dark:bg-slate-900/70 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏢</span>
              <h3 className="font-semibold">Business</h3>
            </div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{businessName}</p>
            <p className="text-sm text-muted-foreground">{businessType}</p>
          </div>

          {/* Problem */}
          <div className="p-4 bg-white/70 dark:bg-slate-900/70 rounded-lg border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-600 dark:text-red-400">Problem</h3>
            </div>
            <p className="text-sm">{problem}</p>
          </div>

          {/* Solution */}
          <div className="p-4 bg-white/70 dark:bg-slate-900/70 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-green-600 dark:text-green-400">Solution</h3>
            </div>
            <p className="text-sm">{solution}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 rounded-lg mt-4">
          <Lightbulb className="w-5 h-5 text-blue-500" />
          <p className="text-sm font-medium">Watch the demo below to see AVAIL in action!</p>
        </div>
      </CardContent>
    </Card>
  );
}
