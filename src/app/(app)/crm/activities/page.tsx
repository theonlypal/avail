"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Plus,
  Filter,
  MoreHorizontal,
  Trash2,
  Edit,
  Check,
  Circle,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  Video,
  FileText,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
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

interface Activity {
  id: string;
  team_id: string;
  type: 'task' | 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description?: string;
  contact_id?: string;
  deal_id?: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  outcome?: string;
  created_at: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_email?: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const ACTIVITY_TYPES = [
  { value: 'task', label: 'Task', icon: CheckCircle2, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  { value: 'call', label: 'Call', icon: Phone, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
  { value: 'email', label: 'Email', icon: Mail, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  { value: 'meeting', label: 'Meeting', icon: Video, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  { value: 'note', label: 'Note', icon: FileText, color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30' },
  { value: 'medium', label: 'Medium', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  { value: 'high', label: 'High', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30' },
];

const STATUSES = [
  { value: 'pending', label: 'Pending', color: 'text-slate-400' },
  { value: 'in_progress', label: 'In Progress', color: 'text-blue-400' },
  { value: 'completed', label: 'Completed', color: 'text-green-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-400' },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // New activity form state
  const [newActivity, setNewActivity] = useState({
    type: "task" as const,
    title: "",
    description: "",
    contact_id: "",
    due_date: "",
    priority: "medium" as const,
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const pending = activities.filter(a => a.status === 'pending').length;
    const inProgress = activities.filter(a => a.status === 'in_progress').length;
    const completed = activities.filter(a => a.status === 'completed').length;
    const overdue = activities.filter(a =>
      a.status !== 'completed' &&
      a.status !== 'cancelled' &&
      a.due_date &&
      new Date(a.due_date) < new Date()
    ).length;

    return { pending, inProgress, completed, overdue };
  }, [activities]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesType = !filterType || activity.type === filterType;
      const matchesStatus = !filterStatus || activity.status === filterStatus;
      return matchesType && matchesStatus;
    });
  }, [activities, filterType, filterStatus]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activitiesRes, contactsRes] = await Promise.all([
        fetch('/api/activities?team_id=default-team&limit=200'),
        fetch('/api/contacts?limit=500'),
      ]);

      const activitiesData = await activitiesRes.json();
      const contactsData = await contactsRes.json();

      setActivities(activitiesData.activities || []);
      setContacts(contactsData.contacts || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    if (!newActivity.title) {
      toast.error("Please enter a title");
      return;
    }

    setCreateLoading(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: 'default-team',
          ...newActivity,
          contact_id: newActivity.contact_id || null,
          due_date: newActivity.due_date || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create activity');
      }

      toast.success("Activity created successfully");
      setShowCreateModal(false);
      setNewActivity({ type: "task", title: "", description: "", contact_id: "", due_date: "", priority: "medium" });
      loadData();
    } catch (error) {
      console.error('Failed to create activity:', error);
      toast.error("Failed to create activity");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleComplete = async (activity: Activity) => {
    const newStatus = activity.status === 'completed' ? 'pending' : 'completed';

    try {
      const response = await fetch(`/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update activity');
      }

      toast.success(newStatus === 'completed' ? "Activity completed!" : "Activity reopened");
      loadData();
    } catch (error) {
      console.error('Failed to update activity:', error);
      toast.error("Failed to update activity");
    }
  };

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return;

    try {
      const response = await fetch(`/api/activities/${activityToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }

      toast.success("Activity deleted");
      setShowDeleteDialog(false);
      setActivityToDelete(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete activity:', error);
      toast.error("Failed to delete activity");
    }
  };

  const getTypeInfo = (type: string) => ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[0];
  const getPriorityInfo = (priority: string) => PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
  const getStatusInfo = (status: string) => STATUSES.find(s => s.value === status) || STATUSES[0];

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (activity: Activity) => {
    return activity.status !== 'completed' &&
      activity.status !== 'cancelled' &&
      activity.due_date &&
      new Date(activity.due_date) < new Date();
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <Activity className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Activities</h1>
                <p className="text-sm text-slate-400">Tasks, calls, meetings, and more</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="h-10 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending</span>
              <Circle className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.pending}</div>
            <div className="text-xs text-slate-500 mt-1">To do</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">In Progress</span>
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">{stats.inProgress}</div>
            <div className="text-xs text-slate-500 mt-1">Working on</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-xs text-slate-500 mt-1">Done</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overdue</span>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.overdue}</div>
            <div className="text-xs text-slate-500 mt-1">Needs attention</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-white/10 text-slate-300 hover:bg-white/5">
                <Filter className="h-4 w-4 mr-2" />
                {filterType ? getTypeInfo(filterType).label : "All Types"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-white/10">
              <DropdownMenuItem
                onClick={() => setFilterType(null)}
                className="text-slate-300 focus:bg-white/10 focus:text-white"
              >
                All Types
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              {ACTIVITY_TYPES.map(type => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className="text-slate-300 focus:bg-white/10 focus:text-white"
                >
                  <type.icon className={`h-4 w-4 mr-2 ${type.color}`} />
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-white/10 text-slate-300 hover:bg-white/5">
                {filterStatus ? getStatusInfo(filterStatus).label : "All Status"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-white/10">
              <DropdownMenuItem
                onClick={() => setFilterStatus(null)}
                className="text-slate-300 focus:bg-white/10 focus:text-white"
              >
                All Status
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              {STATUSES.map(status => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => setFilterStatus(status.value)}
                  className="text-slate-300 focus:bg-white/10 focus:text-white"
                >
                  <span className={status.color}>{status.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {(filterType || filterStatus) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilterType(null); setFilterStatus(null); }}
              className="text-slate-400 hover:text-white"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Activities List */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 bg-slate-900/50">
            <h2 className="text-lg font-semibold text-white">All Activities</h2>
            <p className="text-xs text-slate-400 mt-1">{filteredActivities.length} activities</p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-amber-500" />
              <p className="text-slate-400 mt-4">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
                <Activity className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No activities yet</h3>
              <p className="text-slate-400 mb-6">Create your first task or log an activity</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredActivities.map((activity) => {
                const typeInfo = getTypeInfo(activity.type);
                const priorityInfo = getPriorityInfo(activity.priority);
                const overdue = isOverdue(activity);
                const isComplete = activity.status === 'completed';

                return (
                  <div
                    key={activity.id}
                    className={`px-6 py-4 hover:bg-white/[0.02] transition-colors ${isComplete ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Complete Toggle */}
                      <button
                        onClick={() => handleToggleComplete(activity)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isComplete
                            ? 'bg-green-500/20 border-green-500 text-green-400'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        {isComplete && <Check className="h-3 w-3" />}
                      </button>

                      {/* Type Icon */}
                      <div className={`w-10 h-10 rounded-xl ${typeInfo.bgColor} border ${typeInfo.borderColor} flex items-center justify-center flex-shrink-0`}>
                        <typeInfo.icon className={`h-5 w-5 ${typeInfo.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className={`font-medium text-white ${isComplete ? 'line-through' : ''}`}>
                              {activity.title}
                            </h3>
                            {activity.description && (
                              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                              <DropdownMenuItem className="text-slate-300 focus:bg-white/10 focus:text-white">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem
                                onClick={() => {
                                  setActivityToDelete(activity);
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

                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {/* Contact */}
                          {activity.contact_first_name && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <User className="h-3 w-3" />
                              <span>{activity.contact_first_name} {activity.contact_last_name}</span>
                            </div>
                          )}

                          {/* Due Date */}
                          {activity.due_date && (
                            <div className={`flex items-center gap-1.5 text-xs ${overdue ? 'text-red-400' : 'text-slate-400'}`}>
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(activity.due_date)}</span>
                              {overdue && <Badge variant="outline" className="text-xs border-red-500/30 bg-red-500/10 text-red-400">Overdue</Badge>}
                            </div>
                          )}

                          {/* Priority */}
                          <Badge
                            variant="outline"
                            className={`text-xs ${priorityInfo.bgColor} ${priorityInfo.borderColor} ${priorityInfo.color}`}
                          >
                            {priorityInfo.label}
                          </Badge>

                          {/* Type */}
                          <Badge
                            variant="outline"
                            className={`text-xs ${typeInfo.bgColor} ${typeInfo.borderColor} ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Activity Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Create Activity</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new task, call, meeting, or note
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Type</Label>
              <Select
                value={newActivity.type}
                onValueChange={(value: any) => setNewActivity({ ...newActivity, type: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-slate-300 focus:bg-white/10 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <type.icon className={`h-4 w-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Title *</Label>
              <Input
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                placeholder="e.g., Follow up with client"
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Add details..."
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Contact</Label>
                <Select
                  value={newActivity.contact_id}
                  onValueChange={(value) => setNewActivity({ ...newActivity, contact_id: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 max-h-[200px]">
                    {contacts.map((contact) => (
                      <SelectItem
                        key={contact.id}
                        value={contact.id}
                        className="text-slate-300 focus:bg-white/10 focus:text-white"
                      >
                        {contact.first_name} {contact.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Priority</Label>
                <Select
                  value={newActivity.priority}
                  onValueChange={(value: any) => setNewActivity({ ...newActivity, priority: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {PRIORITIES.map((priority) => (
                      <SelectItem
                        key={priority.value}
                        value={priority.value}
                        className="text-slate-300 focus:bg-white/10 focus:text-white"
                      >
                        <span className={priority.color}>{priority.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Due Date</Label>
              <Input
                type="datetime-local"
                value={newActivity.due_date}
                onChange={(e) => setNewActivity({ ...newActivity, due_date: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white"
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
              onClick={handleCreateActivity}
              disabled={createLoading}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {createLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Activity
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
            <DialogTitle className="text-xl text-white">Delete Activity</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{activityToDelete?.title}"?
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
              onClick={handleDeleteActivity}
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
