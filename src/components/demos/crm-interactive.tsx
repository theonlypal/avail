"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Check, Clock, TrendingUp } from "lucide-react";

interface CRMInteractiveProps {
  demoData: any;
}

export function CRMInteractive({ demoData }: CRMInteractiveProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Calendar className="w-6 h-6 text-cyan-400" />
          Interactive CRM Demo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 data-[state=active]:text-cyan-400 text-slate-400">Pipeline</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 data-[state=active]:text-cyan-400 text-slate-400">Calendar</TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 data-[state=active]:text-cyan-400 text-slate-400">Automation</TabsTrigger>
            <TabsTrigger value="routes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 data-[state=active]:text-cyan-400 text-slate-400">Routes</TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{demoData.appointments?.length || 0} appointments</Badge>
            </div>
            <div className="space-y-3">
              {demoData.appointments?.map((apt: any) => (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md hover-lift ${
                    apt.status === 'confirmed'
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-yellow-500/30 bg-yellow-500/10'
                  } ${selectedAppointment?.id === apt.id ? 'ring-2 ring-cyan-500' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold">{apt.time}</span>
                        {apt.reminderSent && (
                          <Check className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <div className="font-bold text-lg text-white">{apt.client}</div>
                      <div className="text-sm text-slate-400">{apt.service}</div>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {apt.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-400">{apt.value}</div>
                      <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'} className="bg-white/10 border-white/20">
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                  {apt.reminderSent && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-green-400">
                      ✓ Reminder sent & confirmed by customer
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Pipeline Tab - Kanban Board */}
          <TabsContent value="pipeline" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(demoData.leadPipeline || {}).map(([stage, leads]: [string, any]) => (
                <div key={stage} className="space-y-3">
                  <div className="font-semibold capitalize flex items-center justify-between p-3 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-lg text-white">
                    <span>{stage}</span>
                    <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{leads.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {leads.map((lead: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-move hover-lift"
                        draggable
                      >
                        <div className="font-semibold text-sm text-white">{lead.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{lead.service}</div>
                        <div className="text-sm font-bold text-green-400 mt-2">{lead.value}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                          via {lead.source}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4 mt-4">
            {demoData.automations?.map((auto: any, idx: number) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-lg hover:border-cyan-500/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-white">{auto.name}</h4>
                    <p className="text-sm text-slate-400">{auto.description}</p>
                  </div>
                  <Badge variant={auto.active ? "default" : "secondary"} className={auto.active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-white/10 border-white/20"}>
                    {auto.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm mt-3">
                  <div className="flex items-center gap-1 text-white">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="font-semibold">{auto.triggered}</span>
                    <span className="text-slate-400">triggered</span>
                  </div>
                  <div className="text-green-400 font-semibold">
                    {auto.effectiveness}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-4 mt-4">
            <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-white/10 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <MapPin className="w-5 h-5 text-cyan-400" />
                AI Route Optimization
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="text-2xl font-bold text-blue-400">
                    {demoData.routeOptimization?.totalDistance}
                  </div>
                  <div className="text-sm text-slate-400">Total Distance</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="text-2xl font-bold text-green-400">
                    {demoData.routeOptimization?.timeSaved}
                  </div>
                  <div className="text-sm text-slate-400">Time Saved</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="text-2xl font-bold text-purple-400">
                    {demoData.routeOptimization?.fuelSaved}
                  </div>
                  <div className="text-sm text-slate-400">Fuel Saved</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded text-sm text-slate-300">
                ✓ Routes automatically optimized based on traffic, distance, and appointment times
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
