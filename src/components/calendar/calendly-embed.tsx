"use client";

import { useEffect, useRef } from "react";

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
    customAnswers?: Record<string, string>;
  };
  onEventScheduled?: (event: any) => void;
  styles?: {
    height?: string;
    minWidth?: string;
  };
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: any) => void;
    };
  }
}

export function CalendlyEmbed({
  url,
  prefill,
  onEventScheduled,
  styles = { height: "700px", minWidth: "320px" },
}: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Listen for Calendly events
    const handleMessage = (e: MessageEvent) => {
      if (e.data.event === "calendly.event_scheduled") {
        onEventScheduled?.(e.data.payload);
      }
    };

    window.addEventListener("message", handleMessage);

    // Load Calendly script if not already loaded
    if (!scriptLoadedRef.current && !document.querySelector('script[src*="calendly"]')) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.onload = () => {
        scriptLoadedRef.current = true;
        initWidget();
      };
      document.body.appendChild(script);
    } else {
      // Script already loaded, just init widget
      setTimeout(initWidget, 100);
    }

    function initWidget() {
      if (window.Calendly && containerRef.current) {
        // Build prefill params
        const prefillData: Record<string, string> = {};
        if (prefill?.name) prefillData.name = prefill.name;
        if (prefill?.email) prefillData.email = prefill.email;
        if (prefill?.phone) prefillData.a1 = prefill.phone; // Custom question 1

        window.Calendly.initInlineWidget({
          url: url,
          parentElement: containerRef.current,
          prefill: prefillData,
        });
      }
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [url, prefill, onEventScheduled]);

  return (
    <div
      ref={containerRef}
      className="calendly-inline-widget w-full rounded-xl overflow-hidden"
      style={{
        minWidth: styles.minWidth,
        height: styles.height,
      }}
    />
  );
}

// Simple booking button that opens Calendly popup
interface CalendlyButtonProps {
  url: string;
  text?: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  className?: string;
}

export function CalendlyButton({
  url,
  text = "Schedule a Meeting",
  prefill,
  className,
}: CalendlyButtonProps) {
  useEffect(() => {
    // Load Calendly script for popup
    if (!document.querySelector('script[src*="calendly"]')) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Load Calendly CSS
    if (!document.querySelector('link[href*="calendly"]')) {
      const link = document.createElement("link");
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const handleClick = () => {
    const calendly = (window as any).Calendly;
    if (calendly) {
      const prefillData: Record<string, string> = {};
      if (prefill?.name) prefillData.name = prefill.name;
      if (prefill?.email) prefillData.email = prefill.email;

      calendly.initPopupWidget({
        url: url,
        prefill: prefillData,
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className || "px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all"}
    >
      {text}
    </button>
  );
}
