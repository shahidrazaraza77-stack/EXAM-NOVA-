"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface DashboardPageShellProps {
  icon: React.ComponentType<any>;
  iconGradient?: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  headerActions?: ReactNode;
  children: ReactNode;
}

export default function DashboardPageShell({
  icon: Icon,
  iconGradient = "from-[#6D5DF6] to-[#4F46E5]",
  iconColor = "var(--aurora-primary)",
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  headerActions,
  children,
}: DashboardPageShellProps) {
  return (
    <div className="min-h-screen w-full" style={{ background: "var(--aurora-bg)" }}>
      {/* Ambient accent blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.07]"
          style={{ background: "var(--aurora-primary)" }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full blur-[120px] opacity-[0.05]"
          style={{ background: "var(--aurora-accent, var(--aurora-primary))" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div
              className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl shrink-0 bg-gradient-to-br ${iconGradient}`}
              style={{ boxShadow: `0 8px 32px color-mix(in srgb, var(--aurora-primary) 30%, transparent)` }}
            >
              <Icon className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--aurora-text)" }}>
                {title}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--aurora-text-secondary)" }}>
                {subtitle}
              </p>
            </div>
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 shrink-0">{headerActions}</div>
          )}
        </motion.div>

        {/* ── Layout: sidebar + content ── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar Nav */}
          <motion.nav
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="lg:w-52 shrink-0"
          >
            <div
              className="lg:sticky lg:top-6 rounded-2xl p-2 border backdrop-blur-xl"
              style={{
                background: "var(--aurora-card)",
                borderColor: "var(--aurora-border)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap border-none cursor-pointer text-left w-full"
                      style={{
                        color: isActive ? "#fff" : "var(--aurora-text-secondary)",
                        background: "transparent",
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId={`nav-active-${title.replace(/\s/g, "")}`}
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, var(--aurora-primary), var(--aurora-gradient-to, var(--aurora-primary)))`,
                            boxShadow: `0 4px 20px color-mix(in srgb, var(--aurora-primary) 30%, transparent)`,
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <TabIcon
                        className="w-4 h-4 shrink-0 relative z-10 transition-colors"
                        style={{ color: isActive ? "#fff" : "var(--aurora-text-muted)" }}
                      />
                      <span
                        className="hidden lg:inline relative z-10 truncate"
                        style={{ color: isActive ? "#fff" : "var(--aurora-text-secondary)" }}
                      >
                        {tab.label}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 ml-auto hidden lg:block relative z-10 opacity-70 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
