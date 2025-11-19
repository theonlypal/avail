import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateOutreachContent } from "@/lib/ai";
import { assignLead } from "@/app/(app)/lead/assign-action";
import { getLeadById } from "@/lib/leads";
import { getTeamMembers } from "@/lib/team";
import { MapPin, Phone, Mail, ExternalLink, Sparkles } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  params: { id: string };
};

export default async function LeadPage({ params }: Props) {
  const { id } = params;
  const lead = await getLeadById(id);
  if (!lead) {
    notFound();
  }

  const [outreach, teamMembers] = await Promise.all([
    generateOutreachContent(lead),
    getTeamMembers()
  ]);

  const signals = [
    { label: "Website", value: lead.website || "Missing", tone: lead.website ? "positive" : "warning" },
    { label: "Reviews", value: `${lead.rating} ⭐ (${lead.review_count})`, tone: lead.rating >= 4 ? "positive" : "warning" },
    { label: "Ads", value: lead.ad_presence ? "Running Ads" : "No Paid Media", tone: lead.ad_presence ? "positive" : "warning" },
    { label: "Social", value: lead.social_presence, tone: lead.social_presence === "Minimal" ? "warning" : "neutral" },
  ];

  const timeline = [
    {
      title: "AI score created",
      detail: `${lead.opportunity_score}/100 with ${lead.pain_points[0]}`,
      time: "Just now",
    },
    {
      title: "Owner needs follow-up",
      detail: "No AI receptionist + manual intake flagged",
      time: "Due today",
    },
    {
      title: "Recommended play",
      detail: lead.recommended_services.join(", "),
      time: "Within 48h",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-3xl border border-border/70">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-semibold">{lead.business_name}</CardTitle>
              <Badge variant="outline" className="text-xs uppercase">
                {lead.id}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {lead.industry} • {lead.location}
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-3 md:grid-cols-3">
              <Metric label="Opportunity Score" value={lead.opportunity_score} accent="text-emerald-400" />
              <Metric label="Review Count" value={lead.review_count} />
              <Metric label="Website Score" value={lead.website_score} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoBlock title="Pain Points">
                {lead.pain_points.map((point) => (
                  <Badge key={point} variant="secondary" className="mr-2 mb-2 inline-flex">
                    {point}
                  </Badge>
                ))}
              </InfoBlock>
              <InfoBlock title="Recommended Plays">
                {lead.recommended_services.map((service) => (
                  <Badge key={service} variant="outline" className="mr-2 mb-2 inline-flex">
                    {service}
                  </Badge>
                ))}
              </InfoBlock>
            </div>
            <div className="rounded-3xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
              {lead.ai_summary}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="overflow-hidden rounded-3xl border border-border/70 bg-background">
                <Image
                  src="/hero-map.svg"
                  alt="Local heatmap"
                  width={600}
                  height={400}
                  className="w-full"
                />
                <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {lead.lat && lead.lng ? `${lead.lat.toFixed(3)}, ${lead.lng.toFixed(3)}` : 'Location unknown'}
                  </span>
                  <span>{lead.location}</span>
                </div>
              </div>
              <div className="rounded-3xl border border-border/60 bg-background p-4">
                <h4 className="text-sm font-semibold text-muted-foreground">Digital Signals</h4>
                <div className="mt-3 space-y-3">
                  {signals.map((signal) => (
                    <div key={signal.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{signal.label}</span>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs",
                          signal.tone === "positive" && "bg-emerald-500/10 text-emerald-300",
                          signal.tone === "warning" && "bg-amber-500/10 text-amber-300",
                          signal.tone === "neutral" && "bg-slate-500/10 text-slate-200"
                        )}
                      >
                        {signal.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border border-border/70">
            <CardHeader>
              <CardTitle>AI Outreach</CardTitle>
              <p className="text-sm text-muted-foreground">Draft generated by Leadly Copilot.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Subject</p>
                <p className="font-medium">{outreach.subject}</p>
              </div>
              <pre className="rounded-2xl bg-muted/80 p-4 text-sm leading-relaxed">{outreach.body}</pre>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" className="flex-1" asChild>
                  <a href={`mailto:${lead.email}?subject=${encodeURIComponent(outreach.subject)}`}>Send Email</a>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href="/analytics">View analytics</Link>
                </Button>
              </div>
              <form action={assignLead.bind(null, lead.id)} className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground">Assign To</label>
                <select
                  name="userId"
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="">Select rep</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <Button className="w-full">Assign Lead</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/70">
            <CardHeader>
              <CardTitle>Contact & Signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                {lead.phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                {lead.email}
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                {lead.website || "No website detected"}
              </div>
              <div className="rounded-2xl bg-muted/50 p-3 text-xs">
                Added by: {lead.added_by} • {new Date(lead.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/70">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Next Best Actions</CardTitle>
              <Sparkles className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              {timeline.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/50 p-3">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                  <p className="text-[11px] text-primary">{item.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border/50 p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-semibold", accent)}>{value}</p>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase text-muted-foreground">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}
