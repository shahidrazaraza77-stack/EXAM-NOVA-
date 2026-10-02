"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, Announcement } from "@/context/AdminContext";
import {
  Plus,
  Search,
  Megaphone,
  Edit3,
  Trash2,
  X,
  Users,
  Calendar,
  Clock,
} from "lucide-react";

const audienceOptions = ["All", "Students", "Admins", "Premium"] as const;

export default function AnnouncementsView() {
  const { announcements, addAnnouncement, editAnnouncement, deleteAnnouncement } = useAdmin();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    targetAudience: "All" as "All" | "Students" | "Admins" | "Premium",
    startDate: "",
    endDate: "",
    status: "Active" as "Active" | "Scheduled" | "Expired",
  });

  const filtered = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", message: "", targetAudience: "All", startDate: new Date().toISOString().split("T")[0], endDate: "", status: "Active" });
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({ title: a.title, message: a.message, targetAudience: a.targetAudience, startDate: a.startDate, endDate: a.endDate, status: a.status });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      editAnnouncement(editing.id, form);
    } else {
      addAnnouncement(form);
    }
    setShowModal(false);
  };

  const statusColors: Record<string, string> = {
    Active: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    Scheduled: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    Expired: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
  };

  const audienceIcons: Record<string, React.ReactNode> = {
    All: <Users className="h-3.5 w-3.5" />,
    Students: <Users className="h-3.5 w-3.5" />,
    Admins: <Users className="h-3.5 w-3.5" />,
    Premium: <Users className="h-3.5 w-3.5" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Megaphone className="h-6 w-6 text-violet-500" />
            Announcements
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Create and manage platform-wide announcements</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 aurora-gradient-primary text-white text-sm font-medium rounded-xl transition-all cursor-pointer">
          <Plus className="h-4 w-4" /> New Announcement
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input type="text" placeholder="Search announcements..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Scheduled", "Expired"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterStatus === s ? "bg-violet-600 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((announcement) => (
            <motion.div key={announcement.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 transition-all hover:shadow-md hover:border-violet-200 dark:hover:border-violet-900/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{announcement.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[announcement.status]}`}>
                        {announcement.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2">{announcement.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">{audienceIcons[announcement.targetAudience]} {announcement.targetAudience}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {announcement.startDate} - {announcement.endDate}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {announcement.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(announcement)} className="p-2 rounded-lg text-zinc-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 cursor-pointer transition-colors"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => { if (confirm("Delete this announcement?")) deleteAnnouncement(announcement.id); }} className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Megaphone className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-500 font-medium">No announcements found</p>
            <p className="text-sm text-zinc-400 mt-1">Create your first announcement</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {editing ? "Edit Announcement" : "New Announcement"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Message</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Target Audience</label>
                    <select value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value as any })}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer">
                      {audienceOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer">
                      <option value="Active">Active</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Start Date</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">End Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2.5 rounded-xl aurora-gradient-primary text-white text-sm font-medium cursor-pointer transition-all">
                    {editing ? "Update" : "Publish"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
