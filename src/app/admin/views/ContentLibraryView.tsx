"use client";

import React, { useState } from "react";
import { useAdmin, ContentItem } from "@/context/AdminContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  X,
  Check,
  Library,
  BookOpen,
  User,
  Clock,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = ["Articles", "Preparation Guides", "Interview Tips", "Company Insights"];

export default function ContentLibraryView() {
  const { contentItems, addContentItem, editContentItem, deleteContentItem } = useAdmin();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal states
  const [modalType, setModalType] = useState<"preview" | "edit" | "add" | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<"Articles" | "Preparation Guides" | "Interview Tips" | "Company Insights">("Articles");
  const [formAuthor, setFormAuthor] = useState("");
  const [formReadTime, setFormReadTime] = useState("");
  const [formStatus, setFormStatus] = useState<"Published" | "Draft">("Published");
  const [formContent, setFormContent] = useState("");

  // Filter list
  const filteredItems = contentItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = activeSection === "All" || item.category === activeSection;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesSection && matchesStatus;
  });

  const openAddModal = () => {
    setFormTitle("");
    setFormCategory("Articles");
    setFormAuthor("Shahid Afridi");
    setFormReadTime("5 min");
    setFormStatus("Published");
    setFormContent("");
    setModalType("add");
  };

  const openEditModal = (item: ContentItem) => {
    setSelectedItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormAuthor(item.author);
    setFormReadTime(item.readTime);
    setFormStatus(item.status);
    setFormContent(item.content || "Placeholder content for reading this guide or article.");
    setModalType("edit");
  };

  const openPreviewModal = (item: ContentItem) => {
    setSelectedItem(item);
    setModalType("preview");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAuthor) return;

    addContentItem({
      title: formTitle,
      category: formCategory,
      author: formAuthor,
      readTime: formReadTime,
      status: formStatus,
      content: formContent || "Ideal guide content placeholder."
    });
    setModalType(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !formTitle || !formAuthor) return;

    editContentItem(selectedItem.id, {
      title: formTitle,
      category: formCategory,
      author: formAuthor,
      readTime: formReadTime,
      status: formStatus,
      content: formContent
    });
    setModalType(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this content item?")) {
      deleteContentItem(id);
    }
  };

  const statusBadgeColors = {
    Published: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    Draft: "bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/50"
  };

  const categoryBadgeColors = {
    Articles: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-450",
    "Preparation Guides": "bg-purple-50 text-purple-705 dark:bg-purple-955/20 dark:text-purple-400",
    "Interview Tips": "bg-amber-50 text-amber-705 dark:bg-amber-955/20 dark:text-amber-400",
    "Company Insights": "bg-rose-50 text-rose-705 dark:bg-rose-955/20 dark:text-rose-400"
  };

  return (
    <div className="space-y-6">
      {/* Category Selection Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-fit max-w-full">
        <button
          onClick={() => setActiveSection("All")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === "All"
              ? "bg-white dark:bg-zinc-950 text-violet-650 dark:text-violet-400 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          All Library
        </button>
        {SECTIONS.map((sec) => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === sec
                ? "bg-white dark:bg-zinc-950 text-violet-655 dark:text-violet-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center relative w-full md:w-80">
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search content title or author..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <Button onClick={openAddModal} variant="primary" size="sm" className="h-10 px-4 gap-1.5 ml-auto md:ml-0">
            <Plus className="h-4 w-4" /> Add Content
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Read Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-sm">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-150 truncate">
                          {item.title}
                        </span>
                        <span className="text-xs text-zinc-450 mt-0.5 flex items-center gap-1">
                          <User className="h-3 w-3" /> {item.author}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${categoryBadgeColors[item.category] || "bg-zinc-100"}`}>
                        {item.category.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-zinc-505 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        {item.readTime}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusBadgeColors[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-450">
                      {item.lastUpdated}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openPreviewModal(item)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-650 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Preview Content"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-655 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Edit Content"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                          title="Delete Content"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-505">
                    No articles or guides listed matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Library className="h-5 w-5 text-violet-500" />
                  {modalType === "add" && "Create New Content"}
                  {modalType === "edit" && "Edit Content Layout"}
                  {modalType === "preview" && "Content Library Preview"}
                </h3>
                <button 
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-450 dark:text-zinc-550 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Preview Content */}
              {modalType === "preview" && selectedItem && (
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${categoryBadgeColors[selectedItem.category] || "bg-zinc-100"}`}>
                      {selectedItem.category}
                    </span>
                    <div className="flex gap-4 text-xs text-zinc-500 font-bold">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> By {selectedItem.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {selectedItem.readTime}</span>
                      <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {selectedItem.lastUpdated}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-xl leading-tight">
                      {selectedItem.title}
                    </h4>

                    {/* Rich text reading pane */}
                    <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-905/30 border border-zinc-150 dark:border-zinc-850/60 text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed space-y-3 font-medium">
                      {selectedItem.content ? (
                        selectedItem.content.split("\n\n").map((para, i) => (
                          <p key={i}>{para}</p>
                        ))
                      ) : (
                        <p>This is a complete mock demonstration of the content repository. You can add long text formats inside the CRUD forms and view their reading-pane splits in real time here.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button onClick={() => setModalType(null)} variant="secondary" className="text-xs h-9 px-4">
                      Close Reading Pane
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Content */}
              {(modalType === "add" || modalType === "edit") && (
                <form onSubmit={modalType === "add" ? handleAddSubmit : handleEditSubmit}>
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                    {/* Content Title */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Content Title</label>
                      <input 
                        type="text" 
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. 5 Coding Patterns You Must Know"
                        className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Library Category</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as any)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          <option value="Articles">Articles</option>
                          <option value="Preparation Guides">Preparation Guides</option>
                          <option value="Interview Tips">Interview Tips</option>
                          <option value="Company Insights">Company Insights</option>
                        </select>
                      </div>

                      {/* Author */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Author Tag</label>
                        <input 
                          type="text" 
                          required
                          value={formAuthor}
                          onChange={(e) => setFormAuthor(e.target.value)}
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Read Time */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Estimated Read Time</label>
                        <input 
                          type="text" 
                          required
                          value={formReadTime}
                          onChange={(e) => setFormReadTime(e.target.value)}
                          placeholder="e.g. 5 min, 12 min"
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        />
                      </div>

                      {/* Status */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Publication Status</label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    {/* Content Textarea */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-violet-500" /> Body Content Text
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder="Write or paste your article markdown / text copy here..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-855 text-zinc-900 dark:text-zinc-150 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-955 transition-all shadow-inner resize-none leading-relaxed"
                      />
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
                      <Check className="h-4 w-4" /> Save Content
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
