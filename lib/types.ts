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
