"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Check, Clock } from "lucide-react";

interface SMSInteractiveProps {
  demoData: any;
}

export function SMSInteractive({ demoData }: SMSInteractiveProps) {
  const messages = demoData.smsThread || [];

  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageSquare className="w-6 h-6 text-purple-400" />
          SMS Conversation Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SMS Thread - iPhone Style */}
        <div className="max-w-md mx-auto">
          <div className="bg-slate-900 rounded-3xl p-4 space-y-3 border-4 border-slate-700 shadow-2xl">
            {/* Status Bar */}
            <div className="flex items-center justify-between text-xs px-2 text-white">
              <span>9:41</span>
              <span>📶 🔋</span>
            </div>

            {/* Header */}
            <div className="text-center py-2 border-b border-white/10">
              <div className="font-semibold text-white">Sarah Johnson</div>
              <div className="text-xs text-slate-400">Mobile</div>
            </div>

            {/* Messages */}
            <div className="space-y-3 h-[500px] overflow-y-auto px-2">
              {messages.map((msg: any, idx: number) => {
                if (msg.type === "notification") {
                  return (
                    <div key={idx} className="text-center py-2">
                      <div className="inline-block px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
                        {msg.message}
                      </div>
                    </div>
                  );
                }

                const isCustomer = msg.role === "customer";
                const isBusiness = msg.role === "business";

                return (
                  <div key={idx} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[75%] space-y-1">
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isCustomer
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-sm"
                            : "bg-slate-800 text-white rounded-tl-sm border border-white/10"
                        }`}
                      >
                        <div className="text-sm">{msg.message}</div>
                      </div>
                      <div className="flex items-center gap-1 px-2">
                        <span className="text-xs text-slate-400">{msg.timestamp}</span>
                        {msg.automated && (
                          <Badge variant="secondary" className="text-xs px-1 py-0 bg-purple-500/20 text-purple-400 border-purple-500/30">
                            Auto
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <div className="text-2xl font-bold text-purple-400">
              {demoData.analytics?.messagesSent || 0}
            </div>
            <div className="text-xs text-slate-400">Messages Sent</div>
          </div>
          <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <div className="text-2xl font-bold text-green-400">
              {demoData.analytics?.confirmationRate || "0%"}
            </div>
            <div className="text-xs text-slate-400">Confirmation Rate</div>
          </div>
          <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <div className="text-2xl font-bold text-blue-400">
              {demoData.analytics?.responseRate || "0%"}
            </div>
            <div className="text-xs text-slate-400">Response Rate</div>
          </div>
          <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <div className="text-2xl font-bold text-orange-400">
              {demoData.analytics?.automationSavings || "0 hrs"}
            </div>
            <div className="text-xs text-slate-400">Time Saved/Week</div>
          </div>
        </div>

        {/* Automation Rules */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Active Automations</h4>
          {demoData.automationRules?.map((rule: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{rule.trigger}</div>
                <div className="text-xs text-slate-400">{rule.action}</div>
              </div>
              {rule.enabled && (
                <Check className="w-5 h-5 text-green-400" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
