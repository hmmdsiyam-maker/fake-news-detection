"use client";

import React, { useState } from "react";
import {
  History,
  Trash2,
  X,
  Search,
  RefreshCw,
  Database,
  Filter
} from "lucide-react";
import { HistoryItem, UserProfile } from "@/types";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  currentUser: UserProfile | null;
  loading: boolean;
  isDark?: boolean;
  onSearch: (query: string, verdict: string) => void;
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  currentUser,
  loading,
  onSearch,
  onRestore,
  onDelete,
  onClearAll
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("all");

  if (!isOpen) return null;

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    onSearch(q, verdictFilter);
  };

  const handleVerdictChange = (v: string) => {
    setVerdictFilter(v);
    onSearch(searchQuery, v);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl relative transition-colors duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Personal Search History
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-normal">
                  ({history.length} records)
                </span>
              </h3>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Archived in PostgreSQL for @{currentUser?.username}
              </div>
            </div>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2 my-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search headline or content..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 text-xs">
            <Filter className="w-3 h-3 text-slate-500 ml-1" />
            <select
              value={verdictFilter}
              onChange={(e) => handleVerdictChange(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 text-xs focus:outline-none pr-1 cursor-pointer"
            >
              <option value="all">All Results</option>
              <option value="Real News">Real Only</option>
              <option value="Fake News">Fake Only</option>
            </select>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto my-2 space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>Retrieving query history from database...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs space-y-2">
              <Database className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
              <div>No search history found matching query.</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                Run an analysis while signed in to automatically record searches.
              </div>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                        item.label === 0
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                      }`}
                    >
                      {item.prediction}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {Number(item.confidence).toFixed(2)}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      &bull; {item.latency_ms}ms
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      &bull; {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {item.headline || "Untitled Article"}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.content_preview}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => onRestore(item)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                    title="Load into active console"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            Table: <code className="font-mono text-slate-700 dark:text-slate-300">prediction_history</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
