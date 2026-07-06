import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost, formatDate } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
import { PostBody } from "@/components/output/PostBody";
import { CopyLinkButton } from "@/components/blog/CopyLinkButton";

// Pre-render one static HTML page per post (required for `output: export`).
export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.summary,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      images: [{ url: post.hero, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [post.hero],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <div className="h-dvh overflow-y-auto bg-mb-bg text-mb-text">
      <article className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <Link
          href="/"
          className="text-mb-blue hover:text-mb-blue-bright hover:underline text-sm"
        >
          ← back to terminal
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap gap-2 mb-3 text-sm">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-mb-surface0 text-mb-accent2"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-mb-bright text-3xl font-bold leading-tight text-balance">
            {post.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-mb-subtext0">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="text-mb-overlay0">·</span>
            <CopyLinkButton url={url} />
          </div>
        </header>

        <PostBody body={post.body} />

        <footer className="mt-12 pt-6 border-t border-mb-surface1 text-sm">
          <Link
            href="/"
            className="text-mb-blue hover:text-mb-blue-bright hover:underline"
          >
            michael@sipes.dev:~$ cd ~
          </Link>
        </footer>
      </article>
    </div>
  );
}
