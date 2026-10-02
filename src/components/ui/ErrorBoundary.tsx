"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 transition-colors">
          <div className="max-w-md w-full p-8 rounded-3xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Something went wrong</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                An unexpected error occurred in this view. Please try reloading the page or returning back to the home screen.
              </p>
              {this.state.error && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150 dark:border-zinc-800 text-[10px] font-mono text-zinc-650 dark:text-zinc-450 text-left overflow-auto max-h-24 scrollbar-thin">
                  {this.state.error.message || "Unknown rendering exception"}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="outline" size="sm" className="gap-1.5 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                Reload Page
              </Button>
              <Button onClick={() => window.location.href = "/"} size="sm" className="gap-1.5 text-xs">
                <Home className="w-3.5 h-3.5" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
