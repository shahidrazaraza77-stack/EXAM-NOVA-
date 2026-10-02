"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-aurora-text-secondary uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-aurora-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={id}
            ref={ref}
            className={cn(
              // Base
              "block w-full rounded-xl border bg-aurora-surface px-4 py-2.5 text-sm text-aurora-text",
              "placeholder-aurora-text-muted",
              // Border
              "border-aurora-border",
              // Focus
              "focus:outline-none focus:border-aurora-primary focus:ring-2 focus:ring-aurora-primary/20",
              // Hover
              "hover:border-aurora-border-strong",
              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-40",
              // Transition
              "transition-all duration-200",
              // Icon padding
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              // Error state
              error && "border-aurora-danger/50 focus:border-aurora-danger focus:ring-aurora-danger/20",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-aurora-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-aurora-danger font-medium flex items-center gap-1">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-aurora-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
