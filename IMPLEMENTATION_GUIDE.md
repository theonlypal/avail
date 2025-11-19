# Leadly.AI Production Implementation Guide

## ✅ COMPLETED
1. **Database Schema** - Full analytics columns in call_logs, team boards tables created
2. **PostCallAnalysis Component** - Production-ready modal with AI insights
3. **Call Analysis API** - `/api/copilot/analyze-call` with fallbacks

## 🚧 IN PROGRESS - CRITICAL PATH

### PRIORITY 1: Complete Call Flow (End-to-End)

#### Step 1: Update `/src/app/api/calls/route.ts` POST handler

Replace lines 20-98 with:

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lead_id, duration, outcome, call_quality,
      transcript, notes, next_actions,
      started_at, ended_at
    } = body;

    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 });
    }

    const db = getDb();
    const teamId = getDefaultTeamId();
    const member = db.prepare(`SELECT id FROM team_members WHERE team_id = ? LIMIT 1`).get(teamId) as { id: string } | undefined;

    if (!member) {
      return NextResponse.json({ error: 'No team member found' }, { status: 404 });
    }

    const callId = uuidv4();
    const now = new Date().toISOString();

    // Calculate metrics
    let talkRatio = null;
    let aiSentiment = null;
    if (transcript && Array.isArray(transcript) && transcript.length > 0) {
      const leadMessages = transcript.filter((t: any) => t.speaker === 'lead').length;
      talkRatio = leadMessages / transcript.length;
      aiSentiment = (outcome === 'meeting_scheduled' || outcome === 'connected') ? 'positive'
        : (outcome === 'not_interested' || outcome === 'failed') ? 'negative' : 'neutral';
    }

    // Save full analytics
    db.prepare(`
      INSERT INTO call_logs (
        id, lead_id, member_id, status, direction, duration, outcome, call_quality,
        transcript, ai_sentiment, talk_ratio, next_actions, notes,
        started_at, ended_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      callId, lead_id, member.id, 'completed', 'outbound', duration || 0,
      outcome || 'completed', call_quality || null,
      transcript ? JSON.stringify(transcript) : null,
      aiSentiment, talkRatio,
      next_actions ? JSON.stringify(next_actions) : null,
      notes || null, started_at, ended_at, now, now
    );

    // Activity log
    const activityId = uuidv4();
    db.prepare(`
      INSERT INTO activity_logs (id, team_id, lead_id, member_id, action_type, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(activityId, teamId, lead_id, member.id, 'call',
      `${outcome} • ${Math.floor(duration / 60)}m ${duration % 60}s`, now);

    return NextResponse.json({ success: true, call_id: callId });
  } catch (error) {
    console.error('Call logging error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### Step 2: Integrate PostCallAnalysis into ImmersiveCallScreen

In `/src/components/copilot/immersive-call-screen.tsx`:

1. Add import:
```typescript
import { PostCallAnalysis, type CallOutcome, type CallQuality } from "./post-call-analysis";
```

2. Add state after line 52:
```typescript
const [showPostCallAnalysis, setShowPostCallAnalysis] = useState(false);
```

3. Replace `handleEndCall` function (lines 234-267) with:
```typescript
const handleEndCall = async () => {
  setCallStatus("ended");
  // Show post-call analysis instead of immediately closing
  setShowPostCallAnalysis(true);
};

const handleSaveCallData = async (data: {
  call_outcome: CallOutcome;
  call_quality: CallQuality;
  transcript: TranscriptLine[];
  notes: string;
  next_actions: string[];
}) => {
  const callData = {
    lead_id: lead.id,
    duration: callDuration,
    outcome: data.call_outcome,
    call_quality: data.call_quality,
    transcript: data.transcript,
    notes: data.notes,
    next_actions: data.next_actions,
    started_at: new Date(Date.now() - callDuration * 1000).toISOString(),
    ended_at: new Date().toISOString(),
  };

  try {
    await fetch("/api/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(callData),
    });

    onCallEnd?.({ lead_id: lead.id, duration: callDuration });
    setShowPostCallAnalysis(false);
    setTimeout(() => onClose?.(), 500);
  } catch (error) {
    console.error("Failed to save call data:", error);
  }
};
```

4. Add before closing `</div></div>` (before line 681):
```typescript
{/* Post-Call Analysis Modal */}
{showPostCallAnalysis && (
  <PostCallAnalysis
    leadName={lead.business_name}
    duration={callDuration}
    transcript={transcript}
    onSave={handleSaveCallData}
    onClose={() => {
      setShowPostCallAnalysis(false);
      onClose?.();
    }}
  />
)}
```

### PRIORITY 2: Enhance Call Screen Layout (Professional 3-Panel)

#### Update ImmersiveCallScreen Structure

Replace the main layout (lines 330-678) with professional 3-panel design:

```typescript
<div className="h-full flex">
  {/* LEFT PANEL - Lead Info (w-1/4) - Toggleable */}
  {showLeftPanel && (
    <div className="w-1/4 border-r border-white/10 bg-slate-900/40 backdrop-blur-lg overflow-y-auto">
      {/* Move existing left panel content here - lines 331-469 */}
      {/* Keep lead header, quick info, pain points, call controls */}
    </div>
  )}

  {/* CENTER - Transcription (flex-1) */}
  <div className={cn("flex-1 flex items-center justify-center p-8", !showLeftPanel && !showCopilot && "max-w-4xl mx-auto")}>
    {/* Keep existing center transcription - lines 472-547 */}
  </div>

  {/* RIGHT PANEL - AI Copilot (w-1/3) - Toggleable */}
  {showCopilot && (
    <div className="w-1/3 border-l border-white/10 bg-slate-900/40 backdrop-blur-lg flex flex-col">
      {/* Existing copilot with LARGER design - lines 550-659 */}
      {/* Increase message font sizes, add quick action buttons */}
    </div>
  )}
</div>

{/* Toggle Buttons - Floating */}
<div className="absolute bottom-6 left-6 z-10 flex gap-2">
  <Button
    onClick={() => setShowLeftPanel(!showLeftPanel)}
    className="bg-slate-900/60 backdrop-blur-lg border border-white/20"
  >
    {showLeftPanel ? "Hide" : "Show"} Lead Info
  </Button>
</div>

<div className="absolute bottom-6 right-6 z-10">
  {!showCopilot && (
    <Button
      onClick={() => setShowCopilot(true)}
      className="bg-gradient-to-r from-cyan-500/80 to-purple-600/80 backdrop-blur-lg border border-white/20"
    >
      <MessageSquare className="h-5 w-5 mr-2" />
      AI Copilot
    </Button>
  )}
</div>
```

Add state at top:
```typescript
const [showLeftPanel, setShowLeftPanel] = useState(true);
```

### PRIORITY 3: Team Boards - Full Implementation

#### Create Team Board API Endpoints

**File: `/src/app/api/team/boards/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb, getDefaultTeamId } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const teamId = getDefaultTeamId();

    const boards = db.prepare(`
      SELECT * FROM team_boards WHERE team_id = ? ORDER BY created_at DESC
    `).all(teamId);

    return NextResponse.json({ success: true, boards });
  } catch (error) {
    console.error('Get boards error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const db = getDb();
    const teamId = getDefaultTeamId();
    const boardId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO team_boards (id, team_id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(boardId, teamId, name, description || null, now, now);

    // Create default columns
    const defaultColumns = ['To Do', 'In Progress', 'Done'];
    defaultColumns.forEach((colName, index) => {
      const colId = uuidv4();
      db.prepare(`
        INSERT INTO board_columns (id, board_id, name, order_index, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(colId, boardId, colName, index, now);
    });

    return NextResponse.json({ success: true, board_id: boardId });
  } catch (error) {
    console.error('Create board error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**File: `/src/app/api/team/boards/[board_id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { board_id: string } }
) {
  try {
    const db = getDb();
    const boardId = params.board_id;

    const board = db.prepare(`SELECT * FROM team_boards WHERE id = ?`).get(boardId);
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const columns = db.prepare(`
      SELECT * FROM board_columns WHERE board_id = ? ORDER BY order_index
    `).all(boardId);

    const columnsWithCards = columns.map((col: any) => {
      const cards = db.prepare(`
        SELECT c.*, l.business_name as lead_name
        FROM board_cards c
        LEFT JOIN leads l ON c.lead_id = l.id
        WHERE c.column_id = ?
        ORDER BY c.order_index
      `).all(col.id);

      return { ...col, cards };
    });

    return NextResponse.json({
      success: true,
      board: { ...board, columns: columnsWithCards }
    });
  } catch (error) {
    console.error('Get board error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**File: `/src/app/api/team/cards/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { column_id, title, description, lead_id, priority, assigned_members } = await request.json();

    if (!column_id || !title) {
      return NextResponse.json({ error: 'column_id and title required' }, { status: 400 });
    }

    const db = getDb();
    const cardId = uuidv4();
    const now = new Date().toISOString();

    // Get max order_index
    const maxOrder = db.prepare(`
      SELECT MAX(order_index) as max FROM board_cards WHERE column_id = ?
    `).get(column_id) as { max: number } | undefined;
    const orderIndex = (maxOrder?.max || 0) + 1;

    db.prepare(`
      INSERT INTO board_cards (
        id, column_id, title, description, lead_id, priority,
        assigned_members, order_index, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      cardId, column_id, title, description || null, lead_id || null,
      priority || 'medium',
      assigned_members ? JSON.stringify(assigned_members) : null,
      orderIndex, now, now
    );

    return NextResponse.json({ success: true, card_id: cardId });
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { card_id, column_id, title, description, priority, order_index } = await request.json();

    if (!card_id) {
      return NextResponse.json({ error: 'card_id required' }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const values: any[] = [];

    if (column_id !== undefined) { updates.push('column_id = ?'); values.push(column_id); }
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }
    if (order_index !== undefined) { updates.push('order_index = ?'); values.push(order_index); }

    updates.push('updated_at = ?');
    values.push(now, card_id);

    db.prepare(`
      UPDATE board_cards SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### Create TeamBoard Component

**File: `/src/components/team/team-board.tsx`**

Use react-beautiful-dnd or @dnd-kit/core for drag-and-drop.

Install: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

```typescript
"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Board {
  id: string;
  name: string;
  columns: Column[];
}

interface Column {
  id: string;
  name: string;
  cards: Card[];
}

interface Card {
  id: string;
  title: string;
  description?: string;
  priority: string;
  lead_name?: string;
}

export function TeamBoard({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  const loadBoard = async () => {
    try {
      const res = await fetch(`/api/team/boards/${boardId}`);
      const data = await res.json();
      setBoard(data.board);
    } catch (error) {
      console.error('Load board error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Update card position/column via API
    await fetch('/api/team/cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        card_id: active.id,
        column_id: over.id, // Simplified - implement proper column detection
      }),
    });

    loadBoard(); // Reload to reflect changes
  };

  if (loading) return <div>Loading board...</div>;
  if (!board) return <div>Board not found</div>;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-slate-900/50 border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{column.name}</h3>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    className="p-3 rounded-xl bg-slate-800/50 border border-white/10 hover:border-cyan-500/40 transition-all cursor-move"
                  >
                    <div className="text-sm font-medium text-white mb-1">{card.title}</div>
                    {card.description && (
                      <div className="text-xs text-slate-400">{card.description}</div>
                    )}
                    {card.lead_name && (
                      <div className="text-xs text-cyan-400 mt-2">🎯 {card.lead_name}</div>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
```

#### Update Team Page

**File: `/src/app/(app)/team/page.tsx`**

Replace entire file with tabbed interface including board view.

```typescript
"use client";

import { useState } from "react";
import { Users, LayoutGrid, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamBoard } from "@/components/team/team-board";

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<"board" | "members" | "analytics">("board");
  const [boardId, setBoardId] = useState<string>("default-board-id"); // Load from API

  return (
    <div className="space-y-5">
      {/* Header with Tabs */}
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="h-6 w-6 text-purple-400" />
              Team Workspace
            </h1>
            <p className="text-sm text-slate-400 mt-1">Collaborate on leads and priorities</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab("board")}
              variant={activeTab === "board" ? "default" : "outline"}
              className="h-10"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </Button>
            <Button
              onClick={() => setActiveTab("members")}
              variant={activeTab === "members" ? "default" : "outline"}
              className="h-10"
            >
              <Users className="h-4 w-4 mr-2" />
              Members
            </Button>
            <Button
              onClick={() => setActiveTab("analytics")}
              variant={activeTab === "analytics" ? "default" : "outline"}
              className="h-10"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "board" && <TeamBoard boardId={boardId} />}
      {activeTab === "members" && <div>Members view (keep existing)</div>}
      {activeTab === "analytics" && <div>Team analytics view</div>}
    </div>
  );
}
```

## 🎯 TESTING CHECKLIST

1. **Call Flow**
   - [ ] Start call from lead table
   - [ ] View transcription in center
   - [ ] Toggle left/right panels
   - [ ] End call
   - [ ] See post-call analysis modal
   - [ ] Fill out outcome, quality, notes
   - [ ] Click "Get AI Analysis"
   - [ ] Add next actions
   - [ ] Save - verify data in database

2. **Team Boards**
   - [ ] Navigate to team page
   - [ ] Switch to board tab
   - [ ] Drag cards between columns
   - [ ] Add new card
   - [ ] Link card to lead
   - [ ] Verify persistence

3. **Analytics**
   - [ ] View call history
   - [ ] Filter by outcome
   - [ ] See talk ratio, duration
   - [ ] Export data

## 📝 PRODUCTION DEPLOYMENT

1. Set environment variables in production:
   - `ANTHROPIC_API_KEY`
   - `TWILIO_*` (for real calls)
   - `NEXT_PUBLIC_APP_URL`

2. Run database migrations (auto-runs on startup)

3. Test with real Twilio integration

4. Monitor call logs table for analytics data

---

**Status**: Database ✅ | Post-Call Modal ✅ | API Endpoints 🚧 | UI Integration 🚧 | Team Boards 🚧
