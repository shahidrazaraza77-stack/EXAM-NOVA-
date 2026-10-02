"use client";

import React, { useState } from "react";
import { useAdmin, MockUser, RolePermission } from "@/context/AdminContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  Eye, 
  UserX, 
  UserCheck, 
  Edit3, 
  X,
  Shield,
  Check,
  Lock,
  Mail,
  User,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersView() {
  const { users, addUser, updateUser, deleteUser, rolePermissions, updateRolePermissions } = useAdmin();
  
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
  const [formRole, setFormRole] = useState<"Admin" | "Content Manager" | "Student">("Student");
  const [formStatus, setFormStatus] = useState<"Active" | "Disabled">("Active");

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;
    addUser({
      name: formName,
      email: formEmail,
      role: formRole,
      status: formStatus,
    });
    setModalType(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !formName || !formEmail) return;
    updateUser(selectedUser.id, {
      name: formName,
      email: formEmail,
      role: formRole,
      status: formStatus,
    });
    setModalType(null);
  };

  const handleToggleStatus = (user: MockUser) => {
    const nextStatus = user.status === "Active" ? "Disabled" : "Active";
    updateUser(user.id, { status: nextStatus });
  };

  // Helper colors
  const roleBadgeColors: Record<string, string> = {
    Admin: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30",
    "Content Manager": "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30",
    Student: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-350 border-zinc-200/50 dark:border-zinc-700/50"
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-900 gap-6">
        <button 
          onClick={() => setActiveTab("directory")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative cursor-pointer ${activeTab === "directory" ? "text-violet-650 dark:text-violet-400" : "text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100"}`}
        >
          User Directory
          {activeTab === "directory" && (
            <motion.div layoutId="userTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab("roles")}
          className={`pb-3 text-sm font-bold tracking-tight transition-all relative cursor-pointer ${activeTab === "roles" ? "text-violet-650 dark:text-violet-400" : "text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100"}`}
        >
          Role Permissions
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
                placeholder="Search name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
              />
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-zinc-400" />
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Content Manager">Content Manager</option>
                  <option value="Student">Student</option>
                </select>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
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
          <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last Active</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-sm">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                              {user.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100">{user.name}</span>
                              <span className="text-xs text-zinc-500 truncate max-w-[180px] sm:max-w-none">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${roleBadgeColors[user.role]}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                            user.status === "Active" 
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" 
                              : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-900/30"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-red-500"}`} />
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {user.lastActive}
                        </td>
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
                              title="Edit User"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                user.status === "Active" 
                                  ? "text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" 
                                  : "text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                              }`}
                              title={user.status === "Active" ? "Disable User" : "Enable User"}
                            >
                              {user.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
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
              <p className="font-bold">Role Hierarchy and Permission Matrix</p>
              <p className="mt-0.5">Below, configure client-side application permission sets. Changes apply immediately in mock logic dashboards.</p>
            </div>
          </div>

          <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Module / Scope</th>
                    <th className="px-6 py-4 text-purple-700 dark:text-purple-400">Admin</th>
                    <th className="px-6 py-4 text-blue-700 dark:text-blue-400">Content Manager</th>
                    <th className="px-6 py-4 text-zinc-650 dark:text-zinc-350">Student</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-sm">
                  {[
                    { key: "dashboard" as const, label: "Admin Dashboard Access" },
                    { key: "users" as const, label: "User Management (CRUD)" },
                    { key: "questions" as const, label: "Questions Management (CRUD)" },
                    { key: "companies" as const, label: "Company Hub Management (CRUD)" },
                    { key: "tests" as const, label: "Mock Placement Test Creation" },
                    { key: "content" as const, label: "Content Prep Library (Edit)" },
                    { key: "settings" as const, label: "Branding & Security Settings" }
                  ].map((row) => (
                    <tr key={row.key} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-250">
                        {row.label}
                      </td>
                      {rolePermissions.map((rp) => {
                        const val = rp[row.key];
                        return (
                          <td key={rp.role} className="px-6 py-4">
                            <select
                              value={val}
                              onChange={(e) => updateRolePermissions(rp.role, { [row.key]: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg text-xs bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-850 font-bold outline-none cursor-pointer"
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

      {/* CRUD MODALS */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-violet-500" />
                  {modalType === "add" && "Add New User"}
                  {modalType === "view" && "User Profile Details"}
                  {modalType === "edit" && "Edit User Profile"}
                </h3>
                <button 
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-450 dark:text-zinc-500 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              {modalType === "view" && selectedUser && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                      {selectedUser.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-lg leading-tight">{selectedUser.name}</h4>
                      <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-5 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Role Profile</p>
                      <p className="mt-1 font-bold text-zinc-800 dark:text-zinc-200">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</p>
                      <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        selectedUser.status === "Active" 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" 
                          : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-900/30"
                      }`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Activity</p>
                      <p className="mt-1 font-bold text-zinc-850 dark:text-zinc-300">{selectedUser.lastActive}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mock User ID</p>
                      <code className="mt-1 block font-mono text-xs font-bold text-zinc-500">{selectedUser.id}</code>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
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
              )}

              {/* Form Content */}
              {(modalType === "add" || modalType === "edit") && (
                <form onSubmit={modalType === "add" ? handleAddSubmit : handleEditSubmit}>
                  <div className="p-6 space-y-4">
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
                        className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
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
                        placeholder="johndoe@example.com"
                        className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Role input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Role Profile</label>
                        <select
                          value={formRole}
                          onChange={(e) => setFormRole(e.target.value as any)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all shadow-inner font-semibold"
                        >
                          <option value="Student">Student</option>
                          <option value="Content Manager">Content Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>

                      {/* Status input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Account Status</label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all shadow-inner font-semibold"
                        >
                          <option value="Active">Active</option>
                          <option value="Disabled">Disabled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                    <Button 
                      type="button" 
                      onClick={() => setModalType(null)} 
                      variant="secondary" 
                      className="text-xs h-9 px-4"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="text-xs h-9 px-4 gap-1"
                    >
                      <Check className="h-4 w-4" /> Save User
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
