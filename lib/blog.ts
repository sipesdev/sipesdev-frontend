import type { Post } from "./types";
// Post bodies come from a generated module compiled from content/blog/*.md by
// scripts/generate-blog-content.mjs (run via the pre{build,dev,test} npm hooks).
// This is bundler-agnostic — a plain .ts import that works in Turbopack and Vitest.
import { POST_BODIES } from "./generated/blog-content";

export const POSTS: Post[] = [
  {
    slug: "oculink-egpu",
    title: "Docking an RTX 3080 Ti to a Framework 16 over OCuLink",
    date: "2026-07-06",
    summary:
      "Running a desktop RTX 3080 Ti as an eGPU on a Framework 16 over a raw OCuLink PCIe link — boot-time detection, GPU-primary switching, and the matte-black Arch/Hyprland setup around it, all wired up with Claude Code.",
    tags: ["egpu", "hardware", "arch linux"],
    hero: "/blog/oculink-egpu/hero.jpg",
    body: POST_BODIES["oculink-egpu"],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug);
}

// Display dates in American MM-DD-YYYY. The stored `date` stays ISO (YYYY-MM-DD)
// so <time dateTime>, OpenGraph publishedTime, and the sitemap stay machine-readable.
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}-${day}-${year}`;
}
