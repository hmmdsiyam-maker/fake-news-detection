import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { BLOG_POSTS } from "@/constants/blogData";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getPostData(slug: string) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/v1/blogs/${slug}`, {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      const data = await res.json();
      return {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        author: {
          name: data.author_name || "Veritas Research",
          role: data.author_role || "Lead Researcher",
          avatar: data.author_avatar || ""
        },
        date: data.date,
        readTime: data.read_time,
        tags: data.tags ? data.tags.split(",") : []
      };
    }
  } catch {
    // fallback
  }

  const staticPost = BLOG_POSTS.find((p) => p.slug === slug);
  return staticPost || null;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase font-mono text-[11px]">{post.category}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
            <span>&bull;</span>
            <span>{post.date}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-slate-900 dark:text-slate-50">
            {post.title}
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 pt-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{post.author.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{post.author.role}</div>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base font-sans">
          {post.content.split("\n\n").map((block: string, idx: number) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith("## ")) {
              return (
                <h2 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3 tracking-tight">
                  {trimmed.replace("## ", "")}
                </h2>
              );
            }

            if (trimmed.startsWith("### ")) {
              return (
                <h3 key={idx} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-6 mb-2 tracking-tight">
                  {trimmed.replace("### ", "")}
                </h3>
              );
            }

            if (trimmed.startsWith("```")) {
              const code = trimmed.replace(/```[a-z]*\n?/g, "");
              return (
                <pre key={idx} className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto my-4">
                  <code>{code}</code>
                </pre>
              );
            }

            if (trimmed.startsWith("$$")) {
              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center font-mono text-slate-800 dark:text-slate-200 text-xs my-3">
                  {trimmed.replace(/\$\$/g, "")}
                </div>
              );
            }

            return (
              <p key={idx} className="leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </article>

        {/* Related Articles */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Related Investigations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-colors group block space-y-2"
              >
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-[11px] uppercase">{related.category}</div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {related.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{related.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
