import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/10 max-w-sm w-full mx-auto my-6">
      <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 dark:text-zinc-600 mb-4 border border-zinc-200/30 dark:border-zinc-800/40">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1 leading-snug">{title}</h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed mb-5 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
