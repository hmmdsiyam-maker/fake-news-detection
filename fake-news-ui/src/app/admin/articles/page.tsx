"use client";

import React, { useState } from "react";
import { Search, Plus, Edit, Trash2, Download, RotateCcw, BookOpen } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { BlogPost } from "@/types";
import { PaginationControl } from "@/components/PaginationControl";
import { ArticleModal } from "@/components/admin/ArticleModal";

export default function AdminArticlesPage() {
  const { blogs, deleteArticle, saveArticle, exportToCSV } = useAdmin();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogPost | null>(null);

  const filteredBlogs = blogs.filter(
    (b) =>
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.category.toLowerCase().includes(query.toLowerCase()) ||
      (b.author_name && b.author_name.toLowerCase().includes(query.toLowerCase()))
  );

  const paginatedArticles = filteredBlogs.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (article: BlogPost) => {
    setEditingArticle(article);
    setModalOpen(true);
  };

  const handleDelete = (articleId: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteArticle(articleId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title, Write Button & CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Research &amp; Case Study Articles</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Publish educational articles, misinformation investigations, and methodology write-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCSV(filteredBlogs, "veritas_articles.csv")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            title="Export articles to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title, category, or author..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-2xs"
          />
        </div>

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setPage(1);
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs transition-colors cursor-pointer self-start sm:self-auto"
            title="Reset search"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3.5 sm:p-4">Article</th>
                <th className="p-3.5 sm:p-4">Category</th>
                <th className="p-3.5 sm:p-4">Author</th>
                <th className="p-3.5 sm:p-4">Read Time</th>
                <th className="p-3.5 sm:p-4">Status</th>
                <th className="p-3.5 sm:p-4">Published</th>
                <th className="p-3.5 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-xs">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No research articles published yet. Click &quot;Write New Article&quot; to publish one.
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 sm:p-4 max-w-sm sm:max-w-md">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1" title={b.title}>
                        {b.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={b.excerpt}>
                        {b.excerpt}
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {b.category}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {b.author_name}
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-500 font-mono text-[11px]">
                      {b.read_time}
                    </td>
                    <td className="p-3.5 sm:p-4">
                      {b.featured ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Featured
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] text-slate-500 border border-slate-200 dark:border-slate-800">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono text-slate-400 text-[11px]">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3.5 sm:p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                          title="Edit article"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id, b.title)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationControl
          currentPage={page}
          totalItems={filteredBlogs.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[4, 8, 16, 24]}
        />
      </div>

      {/* Article Modal */}
      <ArticleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingArticle={editingArticle}
        onSave={saveArticle}
      />
    </div>
  );
}
