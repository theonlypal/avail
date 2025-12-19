"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Plus,
  MoreHorizontal,
  User,
  Calendar,
  Trash2,
  Edit,
  Eye,
  ArrowLeft,
  GripVertical,
  Building2,
  Phone,
  Mail,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, type DropResult, type DroppableProvided, type DroppableStateSnapshot, type DraggableProvided, type DraggableStateSnapshot } from "@hello-pangea/dnd";

interface Deal {
  id: string;
  contact_id: string;
  stage: string;
  value: number;
  source?: string;
  notes?: string;
  expected_close_date?: string;
  probability?: number;
  created_at: string;
  contact?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
  };
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  probability: number;
}

const DEFAULT_STAGES: PipelineStage[] = [
  { id: 'new', name: 'New', color: 'text-blue-300', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', probability: 10 },
  { id: 'contacted', name: 'Contacted', color: 'text-cyan-300', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', probability: 20 },
  { id: 'qualified', name: 'Qualified', color: 'text-purple-300', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', probability: 40 },
  { id: 'proposal', name: 'Proposal', color: 'text-amber-300', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', probability: 60 },
  { id: 'negotiation', name: 'Negotiation', color: 'text-orange-300', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', probability: 80 },
  { id: 'won', name: 'Won', color: 'text-green-300', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', probability: 100 },
  { id: 'lost', name: 'Lost', color: 'text-red-300', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', probability: 0 },
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [stages] = useState<PipelineStage[]>(DEFAULT_STAGES);

  // New deal form state
  const [newDeal, setNewDeal] = useState({
    contact_id: "",
    value: "",
    source: "",
    notes: "",
    expected_close_date: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped: Record<string, Deal[]> = {};
    stages.forEach(stage => {
      grouped[stage.id] = deals.filter(deal => deal.stage === stage.id);
    });
    return grouped;
  }, [deals, stages]);

  // Pipeline stats
  const pipelineStats = useMemo(() => {
    const activeStages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];
    const activeDeals = deals.filter(d => activeStages.includes(d.stage));
    const wonDeals = deals.filter(d => d.stage === 'won');

    return {
      totalPipelineValue: activeDeals.reduce((sum, d) => sum + d.value, 0),
      totalDeals: activeDeals.length,
      wonValue: wonDeals.reduce((sum, d) => sum + d.value, 0),
      avgDealSize: activeDeals.length > 0
        ? Math.round(activeDeals.reduce((sum, d) => sum + d.value, 0) / activeDeals.length)
        : 0,
    };
  }, [deals]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dealsRes, contactsRes] = await Promise.all([
        fetch('/api/deals?limit=200'),
        fetch('/api/contacts?limit=500'),
      ]);

      const dealsData = await dealsRes.json();
      const contactsData = await contactsRes.json();

      setDeals(dealsData.deals || []);
      setContacts(contactsData.contacts || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!newDeal.contact_id || !newDeal.value) {
      toast.error("Please select a contact and enter a deal value");
      return;
    }

    setCreateLoading(true);
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: newDeal.contact_id,
          stage: 'new',
          value: parseFloat(newDeal.value),
          source: newDeal.source || 'manual',
          notes: newDeal.notes,
          expected_close_date: newDeal.expected_close_date || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create deal');
      }

      toast.success("Deal created successfully");
      setShowCreateModal(false);
      setNewDeal({ contact_id: "", value: "", source: "", notes: "", expected_close_date: "" });
      loadData();
    } catch (error) {
      console.error('Failed to create deal:', error);
      toast.error("Failed to create deal");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteDeal = async () => {
    if (!dealToDelete) return;

    try {
      const response = await fetch(`/api/deals/${dealToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deal');
      }

      toast.success("Deal deleted");
      setShowDeleteDialog(false);
      setDealToDelete(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete deal:', error);
      toast.error("Failed to delete deal");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStage = destination.droppableId;

    // Optimistic update
    setDeals(prevDeals =>
      prevDeals.map(deal =>
        deal.id === draggableId
          ? { ...deal, stage: newStage }
          : deal
      )
    );

    try {
      const response = await fetch(`/api/deals/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update deal stage');
      }

      const stageInfo = stages.find(s => s.id === newStage);
      toast.success(`Deal moved to ${stageInfo?.name || newStage}`);
    } catch (error) {
      console.error('Failed to update deal:', error);
      toast.error("Failed to update deal stage");
      loadData(); // Revert on error
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageTotal = (stageId: string) => {
    return dealsByStage[stageId]?.reduce((sum, deal) => sum + deal.value, 0) || 0;
  };

  return (
    <div className="relative min-h-screen">
      <div className="space-y-5 pb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/crm"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-400" />
              </Link>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Deals Pipeline</h1>
                <p className="text-sm text-slate-400">Drag and drop to move deals between stages</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="h-10 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Deal
              </Button>
            </div>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pipeline Value</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">
              {formatCurrency(pipelineStats.totalPipelineValue)}
            </div>
            <div className="text-xs text-slate-500 mt-1">{pipelineStats.totalDeals} active deals</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Won Revenue</span>
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">
              {formatCurrency(pipelineStats.wonValue)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Closed won</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Deal Size</span>
              <Building2 className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-cyan-400">
              {formatCurrency(pipelineStats.avgDealSize)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Per deal</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Win Rate</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400">
              {deals.length > 0
                ? `${Math.round((deals.filter(d => d.stage === 'won').length / deals.length) * 100)}%`
                : '0%'
              }
            </div>
            <div className="text-xs text-slate-500 mt-1">All time</div>
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-white/10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-emerald-500" />
            <p className="text-slate-400 mt-4">Loading pipeline...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.filter(s => !['won', 'lost'].includes(s.id)).map((stage) => (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  {/* Stage Header */}
                  <div className={`rounded-t-xl px-4 py-3 ${stage.bgColor} border ${stage.borderColor} border-b-0`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${stage.color}`}>{stage.name}</span>
                        <Badge variant="outline" className={`text-xs ${stage.borderColor} ${stage.color}`}>
                          {dealsByStage[stage.id]?.length || 0}
                        </Badge>
                      </div>
                      <span className={`text-sm font-medium ${stage.color}`}>
                        {formatCurrency(getStageTotal(stage.id))}
                      </span>
                    </div>
                  </div>

                  {/* Stage Content */}
                  <Droppable droppableId={stage.id}>
                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`rounded-b-xl border ${stage.borderColor} border-t-0 bg-slate-900/30 min-h-[400px] p-2 space-y-2 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-white/5' : ''
                        }`}
                      >
                        {dealsByStage[stage.id]?.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-slate-800/50 border border-white/10 rounded-xl p-4 group transition-all ${
                                  snapshot.isDragging ? 'shadow-xl shadow-black/30 rotate-2' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="p-1 -ml-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <GripVertical className="h-4 w-4 text-slate-500" />
                                  </div>
                                  <div className="text-xl font-bold text-emerald-400">
                                    {formatCurrency(deal.value)}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {deal.contact && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-semibold text-indigo-300">
                                          {deal.contact.first_name[0]}{deal.contact.last_name[0]}
                                        </span>
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-sm font-medium text-white truncate">
                                          {deal.contact.first_name} {deal.contact.last_name}
                                        </div>
                                        {deal.contact.company && (
                                          <div className="text-xs text-slate-500 truncate">
                                            {deal.contact.company}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {deal.source && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                      <Building2 className="h-3 w-3" />
                                      <span className="truncate">{deal.source}</span>
                                    </div>
                                  )}

                                  {deal.expected_close_date && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                      <Calendar className="h-3 w-3" />
                                      <span>Close by {new Date(deal.expected_close_date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${stage.borderColor} ${stage.color}`}
                                  >
                                    {stage.probability}% likely
                                  </Badge>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                                      <DropdownMenuItem className="text-slate-300 focus:bg-white/10 focus:text-white">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-slate-300 focus:bg-white/10 focus:text-white">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-white/10" />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setDealToDelete(deal);
                                          setShowDeleteDialog(true);
                                        }}
                                        className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {dealsByStage[stage.id]?.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                            <DollarSign className="h-8 w-8 mb-2 opacity-30" />
                            <span className="text-sm">No deals in this stage</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}

              {/* Won/Lost Columns */}
              {['won', 'lost'].map(stageId => {
                const stage = stages.find(s => s.id === stageId)!;
                return (
                  <div key={stage.id} className="flex-shrink-0 w-72">
                    <div className={`rounded-t-xl px-4 py-3 ${stage.bgColor} border ${stage.borderColor} border-b-0`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${stage.color}`}>{stage.name}</span>
                          <Badge variant="outline" className={`text-xs ${stage.borderColor} ${stage.color}`}>
                            {dealsByStage[stage.id]?.length || 0}
                          </Badge>
                        </div>
                        <span className={`text-sm font-medium ${stage.color}`}>
                          {formatCurrency(getStageTotal(stage.id))}
                        </span>
                      </div>
                    </div>

                    <Droppable droppableId={stage.id}>
                      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`rounded-b-xl border ${stage.borderColor} border-t-0 bg-slate-900/30 min-h-[200px] p-2 space-y-2 transition-colors ${
                            snapshot.isDraggingOver ? 'bg-white/5' : ''
                          }`}
                        >
                          {dealsByStage[stage.id]?.slice(0, 5).map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(provided: DraggableProvided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-slate-800/50 border border-white/10 rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-white font-medium">
                                      {deal.contact?.first_name} {deal.contact?.last_name}
                                    </span>
                                    <span className={`text-sm font-bold ${stage.color}`}>
                                      {formatCurrency(deal.value)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          {dealsByStage[stage.id]?.length > 5 && (
                            <div className="text-center py-2">
                              <span className="text-xs text-slate-500">
                                +{dealsByStage[stage.id].length - 5} more
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Create Deal Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Create New Deal</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new deal to your pipeline
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Contact *</Label>
              <Select
                value={newDeal.contact_id}
                onValueChange={(value) => setNewDeal({ ...newDeal, contact_id: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {contacts.map((contact) => (
                    <SelectItem
                      key={contact.id}
                      value={contact.id}
                      className="text-slate-300 focus:bg-white/10 focus:text-white"
                    >
                      {contact.first_name} {contact.last_name} ({contact.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Deal Value *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="number"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                  placeholder="10000"
                  className="pl-9 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Source</Label>
              <Input
                value={newDeal.source}
                onChange={(e) => setNewDeal({ ...newDeal, source: e.target.value })}
                placeholder="e.g., Website, Referral, Cold Outreach"
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Expected Close Date</Label>
              <Input
                type="date"
                value={newDeal.expected_close_date}
                onChange={(e) => setNewDeal({ ...newDeal, expected_close_date: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Notes</Label>
              <Textarea
                value={newDeal.notes}
                onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                placeholder="Add any notes about this deal..."
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDeal}
              disabled={createLoading}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              {createLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Deal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Delete Deal</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this {formatCurrency(dealToDelete?.value || 0)} deal?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteDeal}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
