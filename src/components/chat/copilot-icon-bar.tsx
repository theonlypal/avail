/**
 * Icon-only sidebar shown when Copilot is collapsed
 *
 * Features:
 * - Minimal width (48px)
 * - Sparkles icon with message count badge
 * - Tooltip on hover
 * - Expands sidebar on click
 */

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CopilotIconBarProps {
  messageCount?: number;
  onExpand: () => void;
}

export function CopilotIconBar({ messageCount = 0, onExpand }: CopilotIconBarProps) {
  return (
    <aside
      className="hidden h-full w-12 flex-shrink-0 border-l border-border/60 bg-card/70 backdrop-blur xl:flex xl:flex-col items-center py-4"
      role="complementary"
      aria-label="Collapsed Leadly Copilot"
    >
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onExpand}
              className="relative h-10 w-10 rounded-lg hover:bg-primary/10 transition-all"
              aria-label="Expand Leadly Copilot"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              {messageCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
                  aria-label={`${messageCount} unread messages`}
                >
                  {messageCount > 9 ? '9+' : messageCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            <p className="font-semibold">Leadly Copilot</p>
            <p className="text-muted-foreground">Click to expand (⌘K)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </aside>
  );
}
