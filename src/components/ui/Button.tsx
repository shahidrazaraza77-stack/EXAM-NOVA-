"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl select-none cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1F] disabled:pointer-events-none disabled:opacity-40 whitespace-nowrap";

    const variants: Record<string, string> = {
      primary:
        "bg-aurora-primary hover:bg-aurora-primary-hover text-white shadow-lg shadow-aurora-primary/25 focus-visible:ring-aurora-primary",
      secondary:
        "bg-aurora-card hover:bg-aurora-card-hover text-aurora-text-secondary hover:text-aurora-text border border-aurora-border focus-visible:ring-aurora-primary",
      ghost:
        "bg-transparent hover:bg-aurora-card text-aurora-text-secondary hover:text-aurora-text focus-visible:ring-aurora-primary",
      outline:
        "bg-transparent border border-aurora-border hover:border-aurora-border-strong hover:bg-aurora-surface text-aurora-text-secondary hover:text-aurora-text focus-visible:ring-aurora-primary",
      danger:
        "bg-aurora-danger hover:bg-aurora-danger-hover text-white shadow-lg shadow-aurora-danger/20 focus-visible:ring-aurora-danger",
      link:
        "bg-transparent text-aurora-primary hover:text-aurora-primary-hover underline-offset-4 hover:underline p-0 h-auto shadow-none focus-visible:ring-aurora-primary",
    };

    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-6 text-sm",
    };

    return (
      <motion.button
        whileHover={{ scale: disabled || isLoading ? 1 : 1.015 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.975 }}
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {isLoading ? (
          <svg
            className="h-3.5 w-3.5 animate-spin text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
