"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { BlogPost } from "@/types";

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingArticle: BlogPost | null;
  onSave: (form: any, id?: number | null) => Promise<boolean>;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  editingArticle,
  onSave
}) => {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "AI Research",
    excerpt: "",
    content: "",
    author_name: "Veritas Research Team",
    author_role: "Lead Researcher",
    read_time: "5 min read",
    tags: "",
    featured: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingArticle) {
      setForm({
        title: editingArticle.title,
        slug: editingArticle.slug,
        category: editingArticle.category,
        excerpt: editingArticle.excerpt,
        content: editingArticle.content,
        author_name: editingArticle.author_name,
        author_role: editingArticle.author_role,
        read_time: editingArticle.read_time,
        tags: editingArticle.tags || "",
        featured: editingArticle.featured
      });
    } else {
      setForm({
        title: "",
        slug: "",
        category: "AI Research",
        excerpt: "",
        content: "",
        author_name: "Veritas Research Team",
        author_role: "Lead Researcher",
        read_time: "5 min read",
        tags: "",
        featured: false
      });
    }
  }, [editingArticle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await onSave(form, editingArticle?.id);
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            {editingArticle ? "Edit Research Article" : "Write New Research Article"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              Article Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Reverse-Engineering Clickbait: How Machine Learning Analyzes Headlines"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                URL Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto-generated-if-empty"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="AI Research">AI Research</option>
                <option value="OSINT">OSINT</option>
                <option value="Methodology">Methodology</option>
                <option value="Case Study">Case Study</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              Short Excerpt / Summary
            </label>
            <textarea
              required
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="A concise summary of the research..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              Full Article Content (Markdown)
            </label>
            <textarea
              required
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="## Heading&#10;&#10;Write the markdown article body here..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Author Name
              </label>
              <input
                type="text"
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Estimated Read Time
              </label>
              <input
                type="text"
                value={form.read_time}
                onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : editingArticle ? "Update Article" : "Publish Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
