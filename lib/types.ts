import type { ReactNode } from "react";

export interface Command {
  name: string;
  description: string;
  usage?: string;
  execute: (args: string[]) => ReactNode;
}

export interface HistoryEntry {
  id: number;
  input: string;
  output: ReactNode;
}

export interface Project {
  name: string;
  description: string;
  languages: string[];
  url: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO date, e.g. "2026-07-06"
  summary: string;
  tags: string[];
  hero: string; // root-relative path, e.g. "/blog/matte-black/hero.jpg"
  body: string; // raw markdown, imported from content/blog/<slug>.md
}
