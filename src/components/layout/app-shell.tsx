"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { ChatSidebar } from "@/components/chat/sidebar";
import { CopilotIconBar } from "@/components/chat/copilot-icon-bar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { isCollapsed, toggle, expand } = useSidebarCollapse();

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Sidebar />
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetTrigger asChild className="lg:hidden absolute left-4 top-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
            {/* Show icon bar when collapsed, full sidebar when expanded */}
            {isCollapsed ? (
              <CopilotIconBar onExpand={expand} />
            ) : (
              <ChatSidebar isCollapsed={isCollapsed} onToggle={toggle} />
            )}
          </div>
        </div>
      </div>
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetTrigger asChild className="fixed bottom-6 right-6 z-40 xl:hidden">
          <Button size="lg" className="rounded-full shadow-lg shadow-cyan-500/25 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            AVAIL Copilot
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
          <ChatSidebar variant="sheet" />
        </SheetContent>
      </Sheet>
    </div>
  );
}
