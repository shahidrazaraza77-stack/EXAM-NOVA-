"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { GamificationPanel } from "@/components/gamification/GamificationPanel";
import { useGamification } from "@/context/GamificationContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  LayoutDashboard, FileText, Video, Brain, Code2, Building2,
  Milestone, BarChart3, Settings, Search, Bell, User, LogOut,
  Menu, X, ChevronLeft, ChevronRight, GraduationCap, Flame,
  Zap, ChevronDown, ShieldCheck, Loader2, Eye, History, Mic, Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

// ─── Sidebar Nav Item ───────────────────────────────────────────────
function SidebarNavItem({
  item, isCollapsed, isActive, onClick,
}: {
  item: NavItem; isCollapsed: boolean; isActive: boolean; onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <li title={isCollapsed ? item.label : undefined}>
      <Link
        href={item.href}
        onClick={onClick}
        className={[
          "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group outline-none",
          isCollapsed ? "justify-center" : "",
          isActive
            ? "aurora-nav-active"
            : "hover:bg-[var(--aurora-card-hover)] text-[var(--aurora-text-secondary)] hover:text-[var(--aurora-text)]",
        ].join(" ")}
        style={isActive ? { color: "var(--aurora-primary)" } : {}}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          className="h-4 w-4 shrink-0 transition-colors duration-200"
          style={{ color: isActive ? "var(--aurora-primary)" : "var(--aurora-text-muted)" }}
        />
        {!isCollapsed && (
          <span className="truncate leading-none">
            {item.label}
          </span>
        )}
        {!isCollapsed && item.badge && (
          <span className="ml-auto aurora-badge aurora-badge-primary text-[10px] py-0.5 px-1.5">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

// ─── Sidebar Content ─────────────────────────────────────────────────
function SidebarContent({
  navGroups, isCollapsed, onLinkClick, user, onLogout,
}: {
  navGroups: NavGroup[]; isCollapsed: boolean; onLinkClick: () => void; user: any; onLogout: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const isActive = useCallback((item: NavItem) => {
    const [itemPath, itemQuery] = item.href.split("?");
    const itemParams = new URLSearchParams(itemQuery || "");
    const itemTab = itemParams.get("tab");
    if (itemTab) return pathname === itemPath && currentTab === itemTab;
    if (item.href === "/dashboard") return pathname === item.href;
    return pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
  }, [pathname, currentTab]);

  return (
    <div
      className="flex flex-col h-full overflow-hidden border-r"
      style={{
        background: "var(--aurora-surface)",
        borderColor: "var(--aurora-border)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div
        className={["flex items-center shrink-0 py-4 h-[60px] border-b", isCollapsed ? "justify-center px-3" : "px-4"].join(" ")}
        style={{ borderColor: "var(--aurora-border)" }}
      >
        <Link href="/" className="flex items-center gap-2.5 group min-w-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: "var(--aurora-border-strong)" }}>
            <img src="/logo.jpg" className="w-full h-full object-cover" alt="ExamNova" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-base tracking-tight truncate select-none" style={{ color: "var(--aurora-text)" }}>
              Exam<span style={{ color: "var(--aurora-primary)" }}>Nova</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-none py-4 px-2 space-y-5">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-0.5">
            {!isCollapsed && (
              <span
                className="block text-[10px] font-semibold uppercase tracking-widest px-3 pb-1.5"
                style={{ color: "var(--aurora-text-muted)" }}
              >
                {group.groupName}
              </span>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.href + item.label}
                  item={item}
                  isCollapsed={isCollapsed}
                  isActive={isActive(item)}
                  onClick={onLinkClick}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="shrink-0 p-3 border-t" style={{ borderColor: "var(--aurora-border)" }}>
        {!isCollapsed ? (
          <div
            className="flex items-center gap-3 px-2 py-2 rounded-xl transition-colors cursor-pointer"
            style={{ background: "var(--aurora-card)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
              style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-accent, #00D4FF))" }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "EN"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate leading-none mb-0.5" style={{ color: "var(--aurora-text)" }}>
                {user?.name || "Student"}
              </div>
              <div className="text-[10px] truncate leading-none" style={{ color: "var(--aurora-text-muted)" }}>
                {user?.role === "admin" ? "Admin" : user?.role === "recruiter" ? "Recruiter" : "Student"}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white mx-auto select-none"
            style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-accent, #00D4FF))" }}
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "EN"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Breadcrumbs ─────────────────────────────────────────────────────
function Breadcrumbs({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const segments = pathname.replace("/dashboard", "").split("/").filter(Boolean);
  if (segments.length === 0) return <span>Dashboard</span>;
  const base = segments.map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).join(" › ");
  const tab = searchParams.get("tab");
  if (tab) return <span>{`${base} › ${tab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`}</span>;
  return <span>{base}</span>;
}

// ─── Main Layout ──────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showGamificationPanel, setShowGamificationPanel] = useState(false);
  const { state: gState } = useGamification();

  useEffect(() => {
    if (!loading && !user) {
      console.log("[AUTH] DashboardLayout: No authenticated user found after initialization. Redirecting to login...");
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored) setIsCollapsed(stored === "true");
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebar_collapsed", String(next));
  };

  const handleLinkClick = () => setIsMobileOpen(false);

  const navGroups: NavGroup[] = user?.role === "recruiter"
    ? [
        { groupName: "Recruiter", items: [{ label: "Overview", href: "/dashboard/recruiter", icon: LayoutDashboard }] },
        { groupName: "Opportunities", items: [
          { label: "Manage Listings", href: "/dashboard/recruiter/listings", icon: FileText },
          { label: "Applicants", href: "/dashboard/recruiter/applicants", icon: User },
          { label: "Campus Drives", href: "/dashboard/recruiter/drives", icon: Milestone },
        ]},
        { groupName: "Account", items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }] },
      ]
    : [
        { groupName: "Overview", items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
        { groupName: "AI Tools", items: [
          { label: "Resume Builder", href: "/dashboard/resume-builder", icon: FileText, badge: "AI" },
          { label: "Resume Preview", href: "/dashboard/resume-preview", icon: Eye, badge: "LIVE" },
          { label: "Resume History", href: "/dashboard/resume-history", icon: History },
          { label: "Interview Coach", href: "/dashboard/interview-coach", icon: Video, badge: "AI" },
          { label: "SpeakWise AI", href: "/dashboard/speakwise", icon: Mic, badge: "VOICE" },
        ]},
        { groupName: "Preparation", items: [
          { label: "Aptitude", href: "/dashboard/aptitude", icon: Brain },
          { label: "Coding", href: "/dashboard/coding", icon: Code2 },
          { label: "Company Hub", href: "/dashboard/company-hub", icon: Building2 },
        ]},
        { groupName: "Placement", items: [
          { label: "Mock Placement", href: "/dashboard/mock-placement", icon: Milestone },
          { label: "Jobs & Internships", href: "/dashboard/marketplace/jobs", icon: GraduationCap },
          { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
          { label: "Rewards & Badges", href: "/dashboard/gamification", icon: Trophy, badge: "XP" },
          { label: "AI Alerts", href: "/dashboard/notifications", icon: Bell },
        ]},
        { groupName: "Account", items: [
          { label: "Settings", href: "/dashboard/settings", icon: Settings },
          ...(user?.role === "admin" ? [{ label: "Admin Panel", href: "/admin", icon: ShieldCheck, badge: "ADMIN" }] : []),
        ]},
      ];

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center" style={{ background: "var(--aurora-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--aurora-primary)", borderTopColor: "transparent" }} />
          <p className="text-xs font-medium" style={{ color: "var(--aurora-text-muted)" }}>Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="h-screen w-screen flex overflow-hidden bg-[#F8FAFF] dark:bg-[#060816] text-[#111827] dark:text-white transition-colors duration-300 relative font-sans"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 12%, rgba(124, 92, 255, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(255, 46, 139, 0.10) 0%, transparent 50%),
          radial-gradient(circle at 88% 22%, rgba(0, 217, 255, 0.10) 0%, transparent 45%)
        `
      }}
    >
      {/* ─── HOLOGRAPHIC NEURAL GRID OVERLAY & AMBIENT AURORA BLOOMS (MATCHING HERO) ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* SVG Mesh Grid */}
        <div 
          className="absolute inset-0 opacity-[0.20] dark:opacity-[0.14]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(124, 92, 255, 0.10) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(124, 92, 255, 0.10) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px"
          }}
        />

        {/* Aurora Volumetric Light Blobs */}
        <div className="absolute top-[-120px] left-[15%] w-[650px] h-[650px] rounded-full bg-[#7C5CFF]/15 dark:bg-[#7C5CFF]/22 blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-120px] left-[5%] w-[700px] h-[700px] rounded-full bg-[#FF2E8B]/15 dark:bg-[#FF2E8B]/22 blur-[180px] animate-pulse" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[30%] right-[8%] w-[600px] h-[600px] rounded-full bg-[#00D9FF]/15 dark:bg-[#00D9FF]/22 blur-[160px]" />
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:block shrink-0 h-full z-20 transition-all duration-300 relative" style={{ width: isCollapsed ? 64 : 240 }}>
        <Suspense fallback={<div className="h-full" style={{ background: "var(--aurora-surface)" }} />}>
          <SidebarContent navGroups={navGroups} isCollapsed={isCollapsed} onLinkClick={handleLinkClick} user={user} onLogout={logout} />
        </Suspense>
      </aside>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-64 shadow-2xl lg:hidden"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg z-50 cursor-pointer transition-colors"
                style={{ background: "var(--aurora-card)", color: "var(--aurora-text-secondary)" }}
              >
                <X className="w-4 h-4" />
              </button>
              <Suspense fallback={<div className="h-full" style={{ background: "var(--aurora-surface)" }} />}>
                <SidebarContent navGroups={navGroups} isCollapsed={false} onLinkClick={handleLinkClick} user={user} onLogout={logout} />
              </Suspense>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">

        {/* ── Top Navigation ── */}
        <header
          className="shrink-0 sticky top-0 z-30 flex items-center gap-4 px-4 sm:px-6 h-[60px] border-b"
          style={{
            background: "var(--aurora-surface)",
            backdropFilter: "blur(20px)",
            borderColor: "var(--aurora-border)",
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl cursor-pointer transition-colors"
            style={{ background: "var(--aurora-card)", color: "var(--aurora-text-secondary)" }}
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Sidebar collapse toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg cursor-pointer transition-colors"
            style={{ color: "var(--aurora-text-muted)" }}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs min-w-0">
            <span style={{ color: "var(--aurora-text-muted)" }}>ExamNova</span>
            <span style={{ color: "var(--aurora-border-strong, var(--aurora-text-muted))" }}>›</span>
            <span className="font-medium truncate" style={{ color: "var(--aurora-text-secondary)" }}>
              <Suspense fallback={<span>Loading...</span>}>
                <Breadcrumbs pathname={pathname} />
              </Suspense>
            </span>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--aurora-text-muted)" }} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full text-xs py-2 pl-9 pr-12 rounded-xl outline-none transition-all"
              style={{
                background: "var(--aurora-card)",
                border: "1px solid var(--aurora-border)",
                color: "var(--aurora-text)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--aurora-primary)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--aurora-border)"; }}
            />
            <kbd
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: "var(--aurora-surface)", color: "var(--aurora-text-muted)", border: "1px solid var(--aurora-border)" }}
            >
              ⌘K
            </kbd>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {gState.practiceStreak > 0 && (
              <button
                onClick={() => setShowGamificationPanel(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all text-xs font-semibold border"
                style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", borderColor: "rgba(245,158,11,0.2)" }}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                {gState.practiceStreak}d streak
              </button>
            )}
            {(gState.totalXP ?? 0) > 0 && (
              <button
                onClick={() => setShowGamificationPanel(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all text-xs font-semibold border"
                style={{ background: "rgba(var(--aurora-primary-rgb, 109,93,246),0.1)", color: "var(--aurora-primary)", borderColor: "rgba(var(--aurora-primary-rgb, 109,93,246),0.2)" }}
              >
                <Zap className="w-3.5 h-3.5" />
                {gState.totalXP} XP
              </button>
            )}

            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <NotificationDropdown />

            {/* Profile menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 cursor-pointer rounded-xl px-2 py-1.5 transition-colors"
                style={{ color: "var(--aurora-text-secondary)" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
                  style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-accent, #00D4FF))" }}
                >
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "EN"}
                </div>
                <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 rounded-2xl z-50 overflow-hidden bg-white/95 dark:bg-zinc-900/95 border border-purple-500/20 dark:border-white/15 shadow-2xl backdrop-blur-2xl"
                      style={{ top: "100%" }}
                    >
                      <div className="p-4 border-b border-purple-500/10 dark:border-white/10">
                        <div className="text-sm font-black text-zinc-900 dark:text-white truncate">{user?.name || "Student"}</div>
                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{user?.email || ""}</div>
                      </div>
                      <div className="p-2">
                        {[
                          { href: "/dashboard/settings", icon: User, label: "My Profile" },
                          { href: "/dashboard/settings", icon: Settings, label: "Settings" },
                        ].map(({ href, icon: Icon, label }) => (
                          <Link
                            key={label}
                            href={href}
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-zinc-800 dark:text-zinc-100 hover:text-[#7C5CFF] dark:hover:text-[#00D9FF] hover:bg-purple-50 dark:hover:bg-zinc-800/80 transition-all"
                          >
                            <Icon className="w-4 h-4 text-[#7C5CFF] dark:text-[#00D9FF]" />
                            {label}
                          </Link>
                        ))}
                        <div className="my-1.5 h-px bg-purple-500/10 dark:bg-white/10" />
                        <button
                          onClick={() => { logout(); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left cursor-pointer transition-all border-none"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-transparent">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--aurora-primary)" }} />
              <p className="text-xs font-medium" style={{ color: "var(--aurora-text-muted)" }}>Loading page...</p>
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>

      <GamificationPanel open={showGamificationPanel} onClose={() => setShowGamificationPanel(false)} />
    </div>
  );
}
