/**
 * Tests for lib/blog.ts — the POSTS metadata registry and getPost() lookup.
 * Also proves the `.md` raw-string import resolves to real file content under
 * the Vitest markdownRaw() plugin (mirrors Turbopack's `type: "raw"`).
 */
import { POSTS, getPost, formatDate } from "@/lib/blog";

describe("blog data", () => {
  it("exposes at least one post", () => {
    expect(POSTS.length).toBeGreaterThan(0);
  });

  it("has unique slugs", () => {
    const slugs = POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every post has non-empty required fields", () => {
    for (const post of POSTS) {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.summary).toBeTruthy();
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.hero).toMatch(/^\/blog\//);
      expect(post.tags.length).toBeGreaterThan(0);
    }
  });

  it("loads each post's markdown body as real content (not empty)", () => {
    for (const post of POSTS) {
      expect(post.body.length).toBeGreaterThan(500);
    }
  });

  it("includes the oculink-egpu post with expected body prose", () => {
    const post = getPost("oculink-egpu");
    expect(post).toBeDefined();
    expect(post!.body).toContain("expansion bay");
    expect(post!.body).toContain("OCuLink");
  });

  it("getPost returns undefined for an unknown slug", () => {
    expect(getPost("does-not-exist")).toBeUndefined();
  });

  it("stores dates as ISO but formats them as American MM-DD-YYYY", () => {
    for (const post of POSTS) {
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(formatDate("2026-07-06")).toBe("07-06-2026");
  });
});
