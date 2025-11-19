/**
 * Custom hook for managing collapsible sidebar state
 *
 * Features:
 * - Persistent state via localStorage
 * - Keyboard shortcut support (Cmd+K / Ctrl+K)
 * - Clean API for sidebar components
 *
 * @example
 * const { isCollapsed, toggle, expand, collapse } = useSidebarCollapse()
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'leadly-copilot-collapsed';
const KEYBOARD_SHORTCUT = 'k';

interface UseSidebarCollapseReturn {
  isCollapsed: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
}

export function useSidebarCollapse(): UseSidebarCollapseReturn {
  // Initialize from localStorage, default to expanded (false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch (error) {
      console.warn('[LeadlyAI] Failed to read sidebar state from localStorage:', error);
      return false;
    }
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    } catch (error) {
      console.warn('[LeadlyAI] Failed to persist sidebar state to localStorage:', error);
    }
  }, [isCollapsed]);

  // Toggle function
  const toggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Expand function
  const expand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  // Collapse function
  const collapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  // Keyboard shortcut handler (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === KEYBOARD_SHORTCUT) {
        event.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggle]);

  return {
    isCollapsed,
    toggle,
    expand,
    collapse,
  };
}

/**
 * Hook for monitoring sidebar collapse state without controlling it
 * Useful for components that need to react to sidebar state but shouldn't control it
 */
export function useSidebarCollapseState(): boolean {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setIsCollapsed(stored === 'true');
      } catch (error) {
        console.warn('[LeadlyAI] Failed to sync sidebar state:', error);
      }
    };

    // Listen for storage changes (for cross-tab synchronization)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return isCollapsed;
}
