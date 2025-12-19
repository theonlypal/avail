"use client";

import Link from "next/link";
import {
  Settings,
  Zap,
  FileText,
  Users,
  Bell,
  Palette,
  Shield,
  Database,
  ChevronRight,
  Calendar,
  Mail,
  MessageSquare,
} from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    title: "Automations & Workflows",
    items: [
      {
        name: "Automation Rules",
        description: "Create automated workflows for leads and contacts",
        href: "/settings/automations",
        icon: Zap,
        color: "amber",
      },
      {
        name: "Message Templates",
        description: "Reusable SMS and email templates",
        href: "/settings/templates",
        icon: FileText,
        color: "violet",
      },
    ],
  },
  {
    title: "Integrations",
    items: [
      {
        name: "Calendar",
        description: "Connect Calendly or Google Calendar",
        href: "/settings/calendar",
        icon: Calendar,
        color: "cyan",
      },
      {
        name: "Email",
        description: "Configure email sending with Postmark",
        href: "/settings/email",
        icon: Mail,
        color: "blue",
      },
      {
        name: "SMS",
        description: "Configure SMS with Twilio",
        href: "/settings/sms",
        icon: MessageSquare,
        color: "emerald",
      },
    ],
  },
  {
    title: "Team & Access",
    items: [
      {
        name: "Team Members",
        description: "Manage team members and permissions",
        href: "/team",
        icon: Users,
        color: "pink",
      },
      {
        name: "Notifications",
        description: "Configure notification preferences",
        href: "/settings/notifications",
        icon: Bell,
        color: "orange",
      },
    ],
  },
  {
    title: "Customization",
    items: [
      {
        name: "Appearance",
        description: "Theme and display settings",
        href: "/settings/appearance",
        icon: Palette,
        color: "purple",
      },
      {
        name: "Security",
        description: "Password and security settings",
        href: "/settings/security",
        icon: Shield,
        color: "red",
      },
      {
        name: "Data Management",
        description: "Import, export, and backup data",
        href: "/crm/import",
        icon: Database,
        color: "slate",
      },
    ],
  },
];

const colorClasses: Record<string, string> = {
  amber: "bg-amber-500/20 text-amber-400",
  violet: "bg-violet-500/20 text-violet-400",
  cyan: "bg-cyan-500/20 text-cyan-400",
  blue: "bg-blue-500/20 text-blue-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  pink: "bg-pink-500/20 text-pink-400",
  orange: "bg-orange-500/20 text-orange-400",
  purple: "bg-purple-500/20 text-purple-400",
  red: "bg-red-500/20 text-red-400",
  slate: "bg-slate-500/20 text-slate-400",
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="h-8 w-8 text-slate-400" />
            Settings
          </h1>
          <p className="text-slate-400 mt-1">
            Configure your workspace, integrations, and preferences
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SETTINGS_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-slate-300 mb-4">
                {section.title}
              </h2>
              <div className="grid gap-3">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className={`p-3 rounded-xl ${colorClasses[item.color]}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-800/30 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Account Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-cyan-400">Free</p>
              <p className="text-sm text-slate-500">Current Plan</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1</p>
              <p className="text-sm text-slate-500">Team Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-sm text-slate-500">Active Automations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">Connected</p>
              <p className="text-sm text-slate-500">API Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
