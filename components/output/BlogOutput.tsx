import Link from "next/link";
import { POSTS, formatDate } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";

const host = SITE_URL.replace(/^https?:\/\//, "");

export function BlogOutput() {
  return (
    <div>
      <div className="text-mb-accent mb-2">Blog</div>
      <div className="text-mb-subtext0 mb-3">
        {POSTS.length} post{POSTS.length === 1 ? "" : "s"}. Type{" "}
        <span className="text-mb-accent2">blog &lt;slug&gt;</span> to read one
        here, or open its page to share it.
      </div>
      <div className="flex flex-col gap-4">
        {POSTS.map((post) => (
          <div key={post.slug} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <Link
                href={`/blog/${post.slug}`}
                className="text-mb-accent hover:text-mb-accent2 hover:underline"
              >
                {post.title}
              </Link>
              <span className="text-mb-overlay1 text-sm">
                {formatDate(post.date)}
              </span>
            </div>
            <div className="text-mb-subtext1">{post.summary}</div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-mb-surface0 text-mb-accent2"
                >
                  {tag}
                </span>
              ))}
              <span className="text-mb-subtext0 break-all">
                {host}/blog/{post.slug}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
