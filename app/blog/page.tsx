import type { Metadata } from "next";
import Link from "next/link";
import { POSTS, formatDate } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing on hardware, dotfiles, Arch Linux, and building with Claude Code.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default function BlogIndexPage() {
  const posts = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="h-dvh overflow-y-auto bg-mb-bg text-mb-text">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <Link
          href="/"
          className="text-mb-blue hover:text-mb-blue-bright hover:underline text-sm"
        >
          ← back to terminal
        </Link>
        <h1 className="mt-6 mb-8 text-mb-accent text-3xl font-bold">Blog</h1>

        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article key={post.slug} className="flex flex-col gap-2">
              <Link
                href={`/blog/${post.slug}`}
                className="text-mb-bright text-xl font-semibold hover:text-mb-accent"
              >
                {post.title}
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-sm text-mb-subtext0">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-mb-surface0 text-mb-accent2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-mb-subtext1">{post.summary}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-mb-blue hover:text-mb-blue-bright hover:underline text-sm"
              >
                Read →
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
