"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  Brain, 
  Code as CodeIcon, 
  Building2, 
  FileText, 
  BarChart3, 
  Settings as SettingsIcon,
  Map,
  Bell,
  Activity,
  Menu,
  X,
  Search,
  LogOut,
  ChevronRight,
  Sparkles,
  Trophy,
  Mic,
  ArrowLeft
} from "lucide-react";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { mfaService } from "@/services/mfa.service";

interface SidebarItem {
  name: string;
  id: string;
  icon: React.ComponentType<any>;
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { name: "Users", id: "users", icon: UsersIcon },
  { name: "Aptitude Bank", id: "aptitude", icon: Brain },
  { name: "Coding Bank", id: "coding", icon: CodeIcon },
  { name: "Interview Bank", id: "interview-bank", icon: Mic },
  { name: "Companies", id: "companies", icon: Building2 },
  { name: "Mock Placements", id: "mock-tests", icon: FileText },
  { name: "Roadmaps", id: "roadmaps", icon: Map },
  { name: "AI Content Center", id: "ai-content-center", icon: Sparkles },
  { name: "Gamification", id: "gamification", icon: Trophy },
  { name: "Notifications", id: "notifications", icon: Bell },
  { name: "Admin Logs", id: "activity-logs", icon: Activity },
  { name: "Analytics", id: "analytics", icon: BarChart3 },
  { name: "Settings", id: "settings", icon: SettingsIcon },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { settings, announcements } = useAdmin();
  const activeAnnouncements = announcements.filter(a => a.status === "Active").length;
  
  const currentTab = searchParams.get("tab") || "dashboard";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Authentication, Strict Role, and Admin MFA Route Guards
  useEffect(() => {
    if (!auth.loading) {
      if (!auth.user) {
        router.push("/login?redirect=/admin");
        return;
      } 
      // Strict role check: only admin and content_manager permitted
      if (auth.user.role !== "admin" && auth.user.role !== "content_manager") {
        router.push("/dashboard");
        return;
      }
      // Admin MFA enforcement: verify AAL2 step-up
      if (auth.user.role === "admin") {
        mfaService.getMfaStatus().then((status) => {
          if (status.isEnabled && status.currentLevel === "aal1") {
            router.push("/mfa-verify?redirect=/admin");
          }
        }).catch((err) => {
          console.warn("[ADMIN_LAYOUT] MFA check warning:", err);
        });
      }
    }
  }, [auth.loading, auth.user, router]);

  // Scroll handler for header shadowing (throttled with rAF & passive for 60fps)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabChange = (tabId: string) => {
    router.push(`/admin?tab=${tabId}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    auth.logout();
  };

  const handleExitAdmin = () => {
    const exitDestination = auth.user?.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
    router.push(exitDestination);
  };

  if (auth.loading || !auth.user || (auth.user.role !== "admin" && auth.user.role !== "content_manager")) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-medium text-zinc-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  const currentUser = auth.user;

  return (
    <div className="h-screen w-screen flex bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/50 backdrop-blur-md h-full shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-900 gap-2.5">
          <div className="h-9 w-9 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center">
            <img src="/logo.jpg" alt="ExamNova Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-950 dark:text-zinc-50 tracking-tight leading-none text-base">
              {settings.siteName || "ExamNova"}
            </span>
            <span className="text-xs text-zinc-500 font-medium mt-0.5">Admin Portal</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1 scrollbar-thin">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center px-4 h-11 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/10 scale-[1.02]"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 mr-3 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 space-y-2.5">
          <button
            onClick={handleExitAdmin}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-white bg-zinc-100 hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 dark:bg-zinc-800/80 dark:hover:from-violet-600 dark:hover:to-indigo-600 border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm transition-all duration-200 cursor-pointer group active:scale-[0.98]"
            title="Exit Admin Panel and navigate back to user dashboard"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform text-zinc-500 group-hover:text-white dark:text-zinc-400" />
            <span>Exit to Dashboard</span>
          </button>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{currentUser.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-950 shadow-2xl z-50 transform transition-transform animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center">
                  <img src="/logo.jpg" alt="ExamNova Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">{settings.siteName || "ExamNova"}</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center px-4 h-11 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 mr-3" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 space-y-2.5">
              <button
                onClick={handleExitAdmin}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-white bg-zinc-100 hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 dark:bg-zinc-800/80 dark:hover:from-violet-600 dark:hover:to-indigo-600 border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm transition-all duration-200 cursor-pointer group active:scale-[0.98]"
                title="Exit Admin Panel and navigate back to user dashboard"
              >
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform text-zinc-500 group-hover:text-white dark:text-zinc-400" />
                <span>Exit to Dashboard</span>
              </button>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                  {currentUser.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{currentUser.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Header Bar */}
        <header className={`shrink-0 z-10 h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 border-b border-zinc-200 dark:border-zinc-900/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-all duration-200 ${scrolled ? "shadow-sm border-zinc-200 dark:border-zinc-900" : ""}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 capitalize tracking-tight flex items-center gap-2">
              <span className="text-zinc-400 dark:text-zinc-600 font-normal">Admin /</span>
              {sidebarItems.find(item => item.id === currentTab)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick search input */}
            <div className="hidden sm:flex items-center relative w-44 md:w-64">
              <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full pl-9 pr-4 py-1.5 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-xs text-zinc-900 dark:text-zinc-100 outline-none border border-transparent focus:border-zinc-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-950 transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 rounded-xl bg-aurora-surface hover:bg-aurora-card-hover text-aurora-text-secondary cursor-pointer transition-colors relative">
              <Bell className="h-4.5 w-4.5" />
              {activeAnnouncements > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-[18px] flex items-center justify-center px-1 rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                  {activeAnnouncements}
                </span>
              )}
            </button>

            {/* Exit Admin Button in Header */}
            <button
              onClick={handleExitAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all duration-200 cursor-pointer group active:scale-95"
              title="Exit Admin Panel and return to dashboard"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Exit Admin</span>
              <span className="sm:hidden">Exit</span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Content Shell with Explicit Scrolling */}
        <main 
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 10)}
          className="flex-1 overflow-y-auto w-full scrollbar-thin focus:outline-none"
          tabIndex={0}
        >
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"><div className="h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <AdminProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminProvider>
    </Suspense>
  );
}
