import Link from "next/link";
import { getPost, formatDate } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
import { PostBody } from "./PostBody";

interface BlogPostOutputProps {
  slug: string;
}

export function BlogPostOutput({ slug }: BlogPostOutputProps) {
  const post = getPost(slug);

  if (!post) {
    return (
      <div className="text-mb-danger">
        blog: no post with slug &apos;{slug}&apos;. Type &apos;blog&apos; to list
        posts.
      </div>
    );
  }

  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-mb-accent text-lg font-bold">{post.title}</div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mb-overlay1">{formatDate(post.date)}</span>
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded bg-mb-surface0 text-mb-accent2"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="text-mb-subtext0 text-sm break-all mt-1">
        Shareable link:{" "}
        <a
          href={url}
          className="text-mb-blue hover:text-mb-blue-bright hover:underline"
        >
          {url}
        </a>
      </div>

      <PostBody body={post.body} />

      <div className="text-mb-subtext0 text-sm mt-3">
        Open as a page:{" "}
        <Link
          href={`/blog/${post.slug}`}
          className="text-mb-blue hover:text-mb-blue-bright hover:underline"
        >
          /blog/{post.slug}
        </Link>
      </div>
    </div>
  );
}
