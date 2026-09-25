"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowRight, Clock, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { api } from "@/lib/api";
import { BLOG_POSTS } from "@/constants/blogData";

interface BlogPostItem {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  date: string;
  read_time: string;
  tags?: string;
  featured?: boolean;
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "AI Research", "OSINT", "Methodology"];

  useEffect(() => {
    api.getBlogs()
      .then((res) => {
        if (res.posts && res.posts.length > 0) {
          setPosts(res.posts);
        } else {
          // Fallback to static
          setPosts(
            BLOG_POSTS.map((b, idx) => ({
              id: idx + 1,
              slug: b.slug,
              title: b.title,
              excerpt: b.excerpt,
              category: b.category,
              author_name: b.author.name,
              author_role: b.author.role,
              author_avatar: b.author.avatar,
              date: b.date,
              read_time: b.readTime,
              featured: b.featured
            }))
          );
        }
      })
      .catch(() => {
        setPosts(
          BLOG_POSTS.map((b, idx) => ({
            id: idx + 1,
            slug: b.slug,
            title: b.title,
            excerpt: b.excerpt,
            category: b.category,
            author_name: b.author.name,
            author_role: b.author.role,
            author_avatar: b.author.avatar,
            date: b.date,
            read_time: b.readTime,
            featured: b.featured
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts.find((p) => p.featured) || posts[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Editorial Header */}
        <div className="space-y-3 max-w-2xl">
          <div className="text-xs font-semibold uppercase font-mono text-indigo-600 dark:text-indigo-400">
            Research &amp; Field Dispatches
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            The Veritas Journal
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Technical investigations into automated influence operations, high-dimensional NLP classification, and information integrity.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-10 animate-pulse">
            {/* Featured Post Skeleton */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-36 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="space-y-2.5 max-w-2xl">
                <div className="w-3/4 h-7 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-full h-4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-4/5 h-4 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-28 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-16 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-20 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

            {/* Filter Bar Skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-12 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="w-24 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="w-16 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="w-full sm:w-64 h-7 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Articles Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="w-16 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-4/5 h-5 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="w-full h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="w-3/4 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="w-24 h-3 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="w-12 h-3 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Investigation</span>
                </div>

                <div className="space-y-3 max-w-2xl">
                  <Link href={`/blog/${featuredPost.slug}`} className="group block">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{featuredPost.author_name}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {featuredPost.read_time}
                    </span>
                    <span>&bull;</span>
                    <span>{featuredPost.date}</span>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
                    >
                      <span>Read Full Investigation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Categories & Search Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-[11px] uppercase">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        {post.read_time}
                      </span>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="group block">
                      <h3 className="font-bold text-base tracking-tight leading-snug text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{post.author_name}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition-colors"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
