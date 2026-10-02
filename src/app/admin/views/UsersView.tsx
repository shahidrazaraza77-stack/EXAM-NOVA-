"use client";

import React, { useState } from "react";
import { useAdmin, MockUser } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  UserX, 
  UserCheck, 
  Edit3, 
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Check,
  Mail,
  User,
  Copy,
  Trash2,
  Loader2,
  AlertCircle,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersView() {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    toggleAdminRole, 
    rolePermissions, 
    updateRolePermissions 
  } = useAdmin();
  const auth = useAuth();
  const currentUserRole = auth.user?.role || "student";
  const isMasterManager = currentUserRole === "content_manager";

  const [activeTab, setActiveTab] = useState<"directory" | "roles">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal states
  const [modalType, setModalType] = useState<"view" | "edit" | "add" | null>(null);
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"Admin" | "Content Manager" | "Student" | "Recruiter">("Student");
  const [formStatus, setFormStatus] = useState<"Active" | "Disabled">("Active");

  // Action status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openAddModal = () => {
    setFormName("");
    setFormEmail("");
    setFormRole("Student");
    setFormStatus("Active");
    setModalType("add");
  };

  const openViewModal = (user: MockUser) => {
    setSelectedUser(user);
    setModalType("view");
  };

  const openEditModal = (user: MockUser) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setModalType("edit");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;
    setIsSubmitting(true);
    try {
      await addUser({
        name: formName,
        email: formEmail,
        role: formRole,
        status: formStatus,
      });
      showToast("success", `User ${formName} created successfully.`);
      setModalType(null);
    } catch (err: any) {
      showToast("error", err.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !formName || !formEmail) return;
    setIsSubmitting(true);
    try {
      await updateUser(selectedUser.id, {
        name: formName,
        email: formEmail,
        role: formRole,
        status: formStatus,
      });
      showToast("success", `User ${formName} updated successfully.`);
      setModalType(null);
    } catch (err: any) {
      showToast("error", err.message || "Failed to update user profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAdmin = async (user: MockUser) => {
    if (user.role === "Content Manager") {
      showToast("error", "Content Manager holds master authority and cannot have their role modified.");
      return;
    }
    setActionLoadingId(user.id);
    try {
      const willBeAdmin = user.role !== "Admin";
      await toggleAdminRole(user.id, user.role);
      showToast(
        "success", 
        willBeAdmin 
          ? `Granted Admin power to ${user.name}!` 
          : `Removed Admin power from ${user.name}. Reverted to Student.`
      );
    } catch (err: any) {
      showToast("error", err.message || "Failed to update user role");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (user: MockUser) => {
    setActionLoadingId(user.id);
    try {
      const nextStatus = user.status === "Active" ? "Disabled" : "Active";
      await updateUser(user.id, { status: nextStatus });
      showToast("success", `Account for ${user.name} is now ${nextStatus}.`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to update account status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (user: MockUser) => {
    if (user.role === "Content Manager") {
      showToast("error", "Content Manager account cannot be deleted.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user ${user.name}? This action cannot be undone.`)) {
      return;
    }
    setActionLoadingId(user.id);
    try {
      await deleteUser(user.id);
      showToast("success", `User ${user.name} was successfully deleted.`);
      if (selectedUser?.id === user.id) {
        setModalType(null);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper badge renderer
  const renderRoleBadge = (role: string) => {
    if (role === "Content Manager") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
          <Crown className="h-3.5 w-3.5 text-amber-500" />
          Content Manager (Master)
        </span>
      );
    }
    if (role === "Admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
          <ShieldCheck className="h-3.5 w-3.5 text-violet-500" />
          Admin
        </span>
      );
    }
    if (role === "Recruiter") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
          Recruiter
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
        <GraduationCap className="h-3.5 w-3.5 text-zinc-500" />
        Student
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={`p-4 rounded-xl border flex items-center justify-between shadow-lg ${
              toastMessage.type === "success" 
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {toastMessage.type === "success" ? (
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span className="text-sm font-semibold">{toastMessage.text}</span>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Authority Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-indigo-500/10 border border-amber-500/20 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                Content Manager Authority Control
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Master Power
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Content Manager holds master authority. You can grant Admin powers to any user or revoke Admin power with a single click.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Your Active Role:
          </span>
          {renderRoleBadge(currentUserRole === "content_manager" ? "Content Manager" : currentUserRole === "admin" ? "Admin" : "Student")}
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <button 
          onClick={() => setActiveTab("directory")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative cursor-pointer ${
            activeTab === "directory" ? "text-violet-600 dark:text-violet-400" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          User Directory ({users.length})
          {activeTab === "directory" && (
            <motion.div layoutId="userTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab("roles")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative cursor-pointer ${
            activeTab === "roles" ? "text-violet-600 dark:text-violet-400" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Role Permissions Matrix
          {activeTab === "roles" && (
            <motion.div layoutId="userTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400" />
          )}
        </button>
      </div>

      {activeTab === "directory" ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex items-center relative w-full sm:w-80">
              <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search name, email, or user ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-sm"
              />
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-zinc-400" />
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-sm font-medium"
                >
                  <option value="All">All Roles</option>
                  <option value="Content Manager">Content Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="Student">Student</option>
                  <option value="Recruiter">Recruiter</option>
                </select>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-sm font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <Button onClick={openAddModal} variant="primary" size="sm" className="h-10 px-4 gap-1.5 ml-auto sm:ml-0">
                <UserPlus className="h-4 w-4" /> Add User
              </Button>
            </div>
          </div>

          {/* Table Card */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="px-6 py-4">User & User ID</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Admin Power Action</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors">
                        {/* User & User ID */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm uppercase shadow-sm shrink-0">
                              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2) || "U"}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                {user.name}
                                {user.role === "Content Manager" && (
                                  <span title="Project Master">
                                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-zinc-500 truncate max-w-[200px] sm:max-w-none">{user.email}</span>
                              
                              {/* User ID copyable pill */}
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                  ID: {user.id.slice(0, 8)}...{user.id.slice(-4)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(user.id, user.id)}
                                  className="text-zinc-400 hover:text-violet-500 p-0.5 rounded cursor-pointer transition-colors"
                                  title="Copy full User ID"
                                >
                                  {copiedId === user.id ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          {renderRoleBadge(user.role)}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                            user.status === "Active" 
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" 
                              : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800/40"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-red-500"}`} />
                            {user.status}
                          </span>
                        </td>

                        {/* Admin Power Action Button */}
                        <td className="px-6 py-4">
                          {user.role === "Content Manager" ? (
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Crown className="h-3.5 w-3.5" /> Master Authority
                            </span>
                          ) : user.role === "Admin" ? (
                            <button
                              onClick={() => handleToggleAdmin(user)}
                              disabled={actionLoadingId === user.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/50 transition-all cursor-pointer disabled:opacity-50"
                              title="Click to remove Admin role and demote to Student"
                            >
                              {actionLoadingId === user.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                              )}
                              Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleAdmin(user)}
                              disabled={actionLoadingId === user.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 border border-violet-200 dark:border-violet-800/50 transition-all cursor-pointer disabled:opacity-50"
                              title="Click to grant Admin power to this user"
                            >
                              {actionLoadingId === user.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ShieldCheck className="h-3.5 w-3.5 text-violet-500" />
                              )}
                              Make Admin
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => openViewModal(user)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => openEditModal(user)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Edit User Profile"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(user)}
                              disabled={actionLoadingId === user.id}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                user.status === "Active" 
                                  ? "text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" 
                                  : "text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                              }`}
                              title={user.status === "Active" ? "Disable Account" : "Enable Account"}
                            >
                              {user.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            {user.role !== "Content Manager" && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={actionLoadingId === user.id}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-zinc-500">
                        No users found matching your search and filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        /* Role Permissions View */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex gap-3 text-xs text-blue-700 dark:text-blue-400">
            <Shield className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Role Hierarchy & Permissions Matrix</p>
              <p className="mt-0.5">
                <strong>Content Manager</strong> holds master administrator authority over ExamNova. 
                Admins possess operational rights. Content Managers can grant or revoke Admin roles at will.
              </p>
            </div>
          </div>

          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Module / Scope</th>
                    <th className="px-6 py-4 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Crown className="h-4 w-4" /> Content Manager (Master)
                    </th>
                    <th className="px-6 py-4 text-violet-600 dark:text-violet-400">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" /> Admin
                      </span>
                    </th>
                    <th className="px-6 py-4 text-zinc-600 dark:text-zinc-400">Student</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                  {[
                    { key: "dashboard" as const, label: "Admin Dashboard Access" },
                    { key: "users" as const, label: "User Management (Grant/Revoke Admin, Edit)" },
                    { key: "questions" as const, label: "Questions Management (Aptitude/Coding)" },
                    { key: "companies" as const, label: "Company Hub Management (CRUD)" },
                    { key: "tests" as const, label: "Mock Placement Test Creation" },
                    { key: "content" as const, label: "Content Prep Library (Edit)" },
                    { key: "settings" as const, label: "Branding & Security Settings" }
                  ].map((row) => (
                    <tr key={row.key} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-200">
                        {row.label}
                      </td>
                      {rolePermissions.map((rp) => {
                        const val = rp[row.key];
                        return (
                          <td key={rp.role} className="px-6 py-4">
                            <select
                              value={val}
                              onChange={(e) => updateRolePermissions(rp.role, { [row.key]: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg text-xs bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 font-bold outline-none cursor-pointer"
                            >
                              <option value="Full">Full (Read/Write)</option>
                              <option value="View">View Only</option>
                              <option value="None">None (Restricted)</option>
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setModalType(null)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="shrink-0 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-violet-500" />
                  {modalType === "add" && "Add New User"}
                  {modalType === "view" && "User Profile Details"}
                  {modalType === "edit" && "Edit User Details & Role"}
                </h3>
                <button 
                  onClick={() => !isSubmitting && setModalType(null)}
                  disabled={isSubmitting}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* View Modal Content */}
              {modalType === "view" && selectedUser && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                      {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2) || "U"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-lg leading-tight flex items-center gap-2">
                        {selectedUser.name}
                        {selectedUser.role === "Content Manager" && (
                          <Crown className="h-4 w-4 text-amber-500" />
                        )}
                      </h4>
                      <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                    </div>
                  </div>

                  {/* ID & Details Grid */}
                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-5 text-sm">
                    <div className="col-span-2 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
                      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                        <span>User UUID / System ID</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedUser.id, "view-modal-id")}
                          className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer text-xs font-semibold"
                        >
                          {copiedId === "view-modal-id" ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy ID
                            </>
                          )}
                        </button>
                      </p>
                      <code className="mt-1 block font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300 break-all select-all">
                        {selectedUser.id}
                      </code>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Role Profile</p>
                      <div className="mt-1.5">
                        {renderRoleBadge(selectedUser.role)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Account Status</p>
                      <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        selectedUser.status === "Active" 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30" 
                          : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900/30"
                      }`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Activity</p>
                      <p className="mt-1 font-bold text-zinc-800 dark:text-zinc-300">{selectedUser.lastActive}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Authority Level</p>
                      <p className="mt-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {selectedUser.role === "Content Manager" 
                          ? "Master Authority" 
                          : selectedUser.role === "Admin" 
                          ? "Platform Admin" 
                          : "Standard User"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    {selectedUser.role !== "Content Manager" && (
                      <Button
                        type="button"
                        variant={selectedUser.role === "Admin" ? "secondary" : "primary"}
                        size="sm"
                        onClick={async () => {
                          await handleToggleAdmin(selectedUser);
                          setModalType(null);
                        }}
                        className="text-xs h-9 px-4 gap-1.5"
                      >
                        {selectedUser.role === "Admin" ? (
                          <>
                            <ShieldAlert className="h-3.5 w-3.5 text-red-500" /> Remove Admin Power
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" /> Grant Admin Power
                          </>
                        )}
                      </Button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <Button 
                        onClick={() => openEditModal(selectedUser)} 
                        variant="primary" 
                        className="gap-1.5 text-xs h-9 px-4"
                      >
                        <Edit3 className="h-4 w-4" /> Edit Profile
                      </Button>
                      <Button onClick={() => setModalType(null)} variant="secondary" className="text-xs h-9 px-4">
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Content (Add or Edit) */}
              {(modalType === "add" || modalType === "edit") && (
                <form onSubmit={modalType === "add" ? handleAddSubmit : handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                    {/* If editing, show User ID */}
                    {modalType === "edit" && selectedUser && (
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          <span>User ID (UUID)</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedUser.id, "form-id")}
                            className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer text-xs"
                          >
                            {copiedId === "form-id" ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" /> Copy ID
                              </>
                            )}
                          </button>
                        </div>
                        <code className="mt-1 block font-mono text-xs text-zinc-700 dark:text-zinc-300 break-all select-all">
                          {selectedUser.id}
                        </code>
                      </div>
                    )}

                    {/* Name input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Full Name
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner"
                      />
                    </div>

                    {/* Email input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Email Address
                      </label>
                      <input 
                        type="email" 
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Role input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Role Profile</label>
                        <select
                          value={formRole}
                          onChange={(e) => setFormRole(e.target.value as any)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          <option value="Student">Student (Standard)</option>
                          <option value="Admin">Admin (Platform Administrator)</option>
                          <option 
                            value="Content Manager" 
                            disabled={!isMasterManager}
                          >
                            Content Manager (Project Master) {!isMasterManager ? "- Requires CM" : ""}
                          </option>
                          <option value="Recruiter">Recruiter (Hiring)</option>
                        </select>
                      </div>

                      {/* Status input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Account Status</label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          <option value="Active">Active</option>
                          <option value="Disabled">Disabled</option>
                        </select>
                      </div>
                    </div>

                    {/* Role Notice */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <Crown className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <span className="font-bold">Manager Authority Rule:</span> Content Manager holds master authority in this project to grant Admin powers or remove them.
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="shrink-0 px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                    <Button 
                      type="button" 
                      onClick={() => setModalType(null)} 
                      variant="secondary" 
                      disabled={isSubmitting}
                      className="text-xs h-9 px-4"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={isSubmitting}
                      className="text-xs h-9 px-4 gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" /> Save User
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
