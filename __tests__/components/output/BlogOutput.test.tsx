/**
 * Tests for BlogOutput — the `blog` list view rendered in the terminal.
 * next/link is mocked to a plain anchor (no app-router context in jsdom).
 */
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { BlogOutput } from "@/components/output/BlogOutput";
import { POSTS } from "@/lib/blog";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("BlogOutput", () => {
  it("lists every post with a link to its /blog/<slug> page", () => {
    render(<BlogOutput />);
    for (const post of POSTS) {
      const link = screen.getByRole("link", { name: post.title });
      expect(link).toHaveAttribute("href", `/blog/${post.slug}`);
    }
  });

  it("shows each post's summary and tags", () => {
    render(<BlogOutput />);
    for (const post of POSTS) {
      expect(screen.getByText(post.summary)).toBeInTheDocument();
      for (const tag of post.tags) {
        expect(screen.getAllByText(tag).length).toBeGreaterThan(0);
      }
    }
  });
});
