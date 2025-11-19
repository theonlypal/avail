"use client";

import { useState, useEffect } from "react";
import type { TeamMember, LeadFilter } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type Props = {
  onChange: (filter: LeadFilter) => void;
};

export function LeadFilters({ onChange }: Props) {
  const [industries, setIndustries] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads/stats/industries').then(res => res.json()).then(breakdown => Object.keys(breakdown)),
      fetch('/api/team/members').then(res => res.json())
    ]).then(([industryList, members]) => {
      setIndustries(industryList);
      setTeamMembers(members);
    }).catch(console.error);
  }, []);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string | undefined>();
  const [scoreRange, setScoreRange] = useState<[number, number]>([70, 98]);
  const [rep, setRep] = useState<string | undefined>();
  const [verificationStatus, setVerificationStatus] = useState<string | undefined>();
  const [websiteStatus, setWebsiteStatus] = useState<string | undefined>();

  const dispatch = () => {
    onChange({
      search: search || undefined,
      industries: industry ? [industry] : undefined,
      scoreRange,
      assignedTo: rep ? [rep] : undefined,
      verified: verificationStatus === 'all' ? undefined : verificationStatus,
      hasWebsite: websiteStatus === 'all' ? undefined : (websiteStatus === 'yes' ? true : websiteStatus === 'no' ? false : undefined),
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-4 shadow">
      <div>
        <Label className="text-xs uppercase text-slate-400 font-semibold">Search</Label>
        <Input
          placeholder="Industry, business, keyword"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-cyan-500"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <Label className="text-xs uppercase text-slate-400 font-semibold">Industry</Label>
          <Select value={industry} onValueChange={(value) => setIndustry(value)}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-cyan-500">
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20">
              {industries.map((item) => (
                <SelectItem key={item} value={item} className="text-white hover:bg-white/10">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase text-slate-400 font-semibold">Verification Status</Label>
          <Select value={verificationStatus} onValueChange={(value) => setVerificationStatus(value)}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-cyan-500">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20">
              <SelectItem value="all" className="text-white hover:bg-white/10">
                All Leads
              </SelectItem>
              <SelectItem value="verified" className="text-white hover:bg-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Verified
                </div>
              </SelectItem>
              <SelectItem value="unverified" className="text-white hover:bg-white/10">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-500" />
                  Unverified
                </div>
              </SelectItem>
              <SelectItem value="pending" className="text-white hover:bg-white/10">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  Pending
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase text-slate-400 font-semibold">Website Status</Label>
          <Select value={websiteStatus} onValueChange={(value) => setWebsiteStatus(value)}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-cyan-500">
              <SelectValue placeholder="All leads" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20">
              <SelectItem value="all" className="text-white hover:bg-white/10">
                All Leads
              </SelectItem>
              <SelectItem value="yes" className="text-white hover:bg-white/10">
                Has Website
              </SelectItem>
              <SelectItem value="no" className="text-white hover:bg-white/10">
                No Website
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase text-slate-400 font-semibold">Assigned Rep</Label>
          <Select value={rep} onValueChange={(value) => setRep(value)}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-cyan-500">
              <SelectValue placeholder="All reps" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20">
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id} className="text-white hover:bg-white/10">
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase text-slate-400 font-semibold">Score Range</Label>
          <Slider
            min={60}
            max={100}
            step={1}
            value={scoreRange}
            onValueChange={(value) => setScoreRange(value as [number, number])}
            className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-400"
          />
          <p className="text-xs text-slate-400">
            {scoreRange[0]} - {scoreRange[1]}
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={dispatch} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30">Apply Filters</Button>
      </div>
    </div>
  );
}
