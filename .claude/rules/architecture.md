# Architecture Rules

## Project Overview

This is a static-export Next.js 16 application with React 19 that renders a terminal-style personal portfolio as a single-page site.

## Static Export

- `next.config.ts` sets `output: "export"`, producing fully static HTML/CSS/JS.
- `next build` outputs to the `out/` directory. No Node.js server is needed at runtime.
- **No API routes.** Do not create files under `app/api/`.
- **No server-side data fetching.** Do not use `getServerSideProps`, `getStaticProps`, or server actions.
- `next/image` requires `unoptimized: true` (already configured) because the image optimization API is unavailable in static export.
- `trailingSlash: false` is set in `next.config.ts`.

## Page Structure

- **Single page**: `app/page.tsx` is the only page. It renders `<Terminal />`.
- **Layout**: `app/layout.tsx` loads JetBrains Mono font, applies global CSS, and sets metadata.
- **No additional routes.** The entire site is the terminal interface on the root page.

## Component Architecture

### Terminal Components (`components/terminal/`)

| Component          | Client? | Purpose                                          |
|--------------------|---------|--------------------------------------------------|
| `Terminal`         | Yes     | Root component. Manages history state, command processing, and input focus. |
| `TerminalInput`    | Yes     | Controlled input with ZSH-style autocomplete (inline ghost text + Tab-triggered menu), arrow-key command-history navigation, Right Arrow to accept ghost, Escape to dismiss menu, and Ctrl+L / Ctrl+C. |
| `TerminalHistory`  | No      | Renders the list of `HistoryEntry` objects.       |
| `TerminalOutput`   | No      | Renders a single history entry (prompt + output). |
| `PromptPrefix`     | No      | Renders the `michael@sipes.dev:~$` prompt string. |

### Output Components (`components/output/`)

| Component          | Client? | Purpose                                          |
|--------------------|---------|--------------------------------------------------|
| `WelcomeBanner`    | Yes     | ASCII art banner with suggestion buttons. Uses `onCommand` callback. |
| `AboutOutput`      | No      | Bio, profile image, and links.                   |
| `HelpOutput`       | No      | Lists all registered commands from the registry. |
| `ProjectsOutput`   | No      | Displays project cards from constants.            |
| `SkillsOutput`     | No      | Displays categorized skill badges.                |
| `ContactOutput`    | No      | Shows contact links (email, GitHub, LinkedIn).    |

## `"use client"` Directive

- Only add `"use client"` to components that use React hooks (`useState`, `useEffect`, `useRef`, `useCallback`, etc.) or browser-only APIs.
- Components that only receive props and render JSX do **not** need `"use client"`.
- Currently client components: `Terminal`, `TerminalInput`, `WelcomeBanner`.

## Module Organization

| Path               | Purpose                                         |
|--------------------|-------------------------------------------------|
| `app/`             | Next.js App Router pages and layout.            |
| `components/terminal/` | Core terminal UI components.               |
| `components/output/`   | Command output display components.          |
| `lib/commands.ts`  | Command registry (register, execute, query).     |
| `lib/registerCommands.tsx` | Registers all commands (side-effect import). |
| `lib/constants.ts` | Static data: USER, LINKS, PROJECTS, SKILLS, etc. |
| `lib/types.ts`     | TypeScript interfaces: Command, HistoryEntry, Project. |
| `__tests__/`       | Test files mirroring source structure.           |

## Path Alias

- `@/*` maps to the project root directory (configured in `tsconfig.json`).
- Use `@/components/...`, `@/lib/...`, etc. in all imports. Do not use relative paths that traverse above the current directory.

## TypeScript Configuration

- **Strict mode** is enabled.
- **JSX transform**: `react-jsx` (no need to import React in every file).
- **Module resolution**: `bundler`.
- **Target**: ES2017.

## Export Conventions

- **Pages and layouts** use `export default function`.
- **All other components** use named exports: `export function ComponentName`.
- **Do not use default exports** for components outside of `app/` pages/layouts.
- **Types and interfaces** use named exports from `lib/types.ts`.
- **Constants** use named `export const` from `lib/constants.ts`.
