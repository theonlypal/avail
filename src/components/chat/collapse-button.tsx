/**
 * Collapse/Expand button for the AI Copilot sidebar
 *
 * Features:
 * - Smooth rotation animation (180° flip)
 * - Accessible with ARIA labels
 * - Tooltip showing keyboard shortcut
 * - Professional styling
 */

import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function CollapseButton({ isCollapsed, onToggle }: CollapseButtonProps) {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  const shortcut = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 rounded-md hover:bg-muted/80 transition-all"
            aria-label={isCollapsed ? 'Expand Copilot sidebar' : 'Collapse Copilot sidebar'}
            aria-expanded={!isCollapsed}
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform duration-200 ease-in-out ${
                isCollapsed ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs">
          <p>{isCollapsed ? 'Expand' : 'Collapse'} Copilot</p>
          <p className="text-muted-foreground">{shortcut}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
