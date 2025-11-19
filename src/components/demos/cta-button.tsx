"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
  icon?: React.ReactNode;
}

export function CTAButton({
  children,
  onClick,
  variant = "default",
  size = "lg",
  className,
  icon
}: CTAButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default action - show alert for now
      alert("Ready to get started? Call us at (555) 123-4567 or visit avail.com/contact");
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn(
        "font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
        variant === "default" && "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
        className
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
}
