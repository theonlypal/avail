"use client";

import { useState } from "react";
import { Folder, Plus, Edit2, Trash2, FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/types";

interface FolderManagerProps {
  leads: Lead[];
  onFolderSelect: (folderId: string | null) => void;
  selectedFolder: string | null;
}

interface FolderData {
  id: string;
  name: string;
  leadCount: number;
  color: string;
}

const defaultFolders: FolderData[] = [
  { id: "hot-leads", name: "Hot Leads", leadCount: 0, color: "red" },
  { id: "contacted", name: "Contacted", leadCount: 0, color: "blue" },
  { id: "follow-up", name: "Follow Up", leadCount: 0, color: "yellow" },
  { id: "qualified", name: "Qualified", leadCount: 0, color: "green" },
];

export function FolderManager({
  leads,
  onFolderSelect,
  selectedFolder,
}: FolderManagerProps) {
  const [folders, setFolders] = useState<FolderData[]>(defaultFolders);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: FolderData = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      leadCount: 0,
      color: "purple",
    };

    setFolders([...folders, newFolder]);
    setNewFolderName("");
    setIsCreating(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm("Are you sure you want to delete this folder?")) {
      setFolders(folders.filter((f) => f.id !== folderId));
      if (selectedFolder === folderId) {
        onFolderSelect(null);
      }
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      red: "bg-red-500/20 text-red-400 border-red-500/30",
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      green: "bg-green-500/20 text-green-400 border-green-500/30",
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    };
    return colorMap[color] || colorMap.cyan;
  };

  return (
    <Card className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Folder className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Folders</h3>
            <p className="text-sm text-slate-400">Organize your leads</p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreating(!isCreating)}
          variant="outline"
          size="sm"
          className="border-white/10 text-white hover:bg-white/5"
        >
          {isCreating ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </>
          )}
        </Button>
      </div>

      {/* Create New Folder */}
      {isCreating && (
        <div className="mb-6 p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5">
          <div className="flex gap-3">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="bg-white/5 border-white/20 text-white"
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCreateFolder();
              }}
            />
            <Button
              onClick={handleCreateFolder}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Create
            </Button>
          </div>
        </div>
      )}

      {/* Folders Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* All Leads */}
        <button
          onClick={() => onFolderSelect(null)}
          className={`group relative rounded-2xl border p-4 transition-all hover:scale-105 ${
            selectedFolder === null
              ? "bg-cyan-500/20 border-cyan-500/50"
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <FolderOpen
              className={`h-5 w-5 ${
                selectedFolder === null ? "text-cyan-400" : "text-slate-400"
              }`}
            />
          </div>
          <div className="text-sm font-semibold text-white">All Leads</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {leads.length}
          </div>
        </button>

        {/* Custom Folders */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`group relative rounded-2xl border p-4 transition-all hover:scale-105 ${
              selectedFolder === folder.id
                ? getColorClasses(folder.color)
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30"
            }`}
          >
            <button
              onClick={() => onFolderSelect(folder.id)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <Folder
                  className={`h-5 w-5 ${
                    selectedFolder === folder.id
                      ? `text-${folder.color}-400`
                      : "text-slate-400"
                  }`}
                />
              </div>
              <div className="text-sm font-semibold text-white">
                {folder.name}
              </div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {folder.leadCount}
              </div>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => handleDeleteFolder(folder.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30"
            >
              <Trash2 className="h-3 w-3 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Folder Actions Info */}
      <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-xs text-slate-400">
          💡 <strong>Tip:</strong> Drag and drop leads onto folders to organize
          them, or use bulk actions to move multiple leads at once. (Coming
          soon)
        </p>
      </div>
    </Card>
  );
}
