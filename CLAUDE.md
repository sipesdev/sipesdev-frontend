# sipesdev-frontend

Terminal-style portfolio website for Michael Sipes, built with Next.js 16 and React 19.

## Quick Reference

```bash
npm run dev          # Start dev server
npm run build        # Static export build
npm run test:run     # Run all Vitest tests once
npm run test         # Vitest watch mode
npm run test:e2e     # Playwright mobile-viewport specs
npm run test:e2e:ui  # Playwright UI mode
npm run lint         # ESLint
```

## Architecture

Single-page static-export Next.js app. The entire UI is a terminal emulator rendered by `<Terminal />`.

```
app/
  page.tsx              # Renders <Terminal />
  layout.tsx            # JetBrains Mono font, metadata
  globals.css           # Matte-black theme via Tailwind @theme inline
  blog/
    page.tsx            # /blog index (lists posts)
    [slug]/page.tsx     # Static per-post article page (SEO + shareable URL)
  sitemap.ts            # Static sitemap.xml (home + blog URLs)
  robots.ts             # Static robots.txt

components/
  terminal/             # Core terminal UI
    Terminal.tsx         # Main component — state, command processing, history
    TerminalInput.tsx    # Input with ZSH-style autocomplete (ghost text + Tab menu), arrow-key history, Ctrl+L/C
    TerminalOutput.tsx   # Output wrapper with aria-live
    TerminalHistory.tsx  # Renders past command/output pairs
    PromptPrefix.tsx     # "michael@sipes.dev:~$ " prompt display
  output/               # Command output components
    WelcomeBanner.tsx    # ASCII art banner + suggestion buttons
    AboutOutput.tsx      # Profile image + links
    HelpOutput.tsx       # Lists all registered commands
    ProjectsOutput.tsx   # Tabular project listing
    SkillsOutput.tsx     # Skills by category
    ContactOutput.tsx    # Contact links
    BlogOutput.tsx       # Lists all posts (blog command)
    BlogPostOutput.tsx   # Renders one post inline (blog <slug>)
    PostBody.tsx         # Shared react-markdown renderer (matte-black styled)
  blog/                 # Blog-page-only client bits
    CopyLinkButton.tsx   # Copy a post URL to clipboard

lib/
  commands.ts           # Command registry (registerCommand, executeCommand, getMatchingCommands)
  registerCommands.tsx   # All command registrations — add new commands here
  constants.ts          # USER, LINKS, PROJECTS, SKILLS, GITHUB_BADGES, ASCII_BANNER
  blog.ts               # POSTS metadata array + getPost(); imports .md bodies
  types.ts              # Command, HistoryEntry, Project, Post interfaces

content/
  blog/                 # Post bodies as .md files (imported as raw strings)
public/
  blog/<slug>/          # Post images, referenced as /blog/<slug>/*.jpg
```

## Command System

Commands are registered via `registerCommand()` in `lib/registerCommands.tsx`. Each command has a `name`, `description`, optional `usage`, and an `execute(args) => ReactNode` function.

To add a new command:
1. If output is complex JSX, create a component in `components/output/`
2. Call `registerCommand({...})` in `lib/registerCommands.tsx`
3. For simple text output, return a string from `execute`

Special cases: `clear` and `history` are intercepted in `Terminal.tsx` before reaching the registry. Their registered `execute` functions are never called — they exist only so `help` lists them.

## Blog

Posts render both inline in the terminal (`blog` lists them, `blog <slug>` opens one) and as standalone static pages at `/blog/<slug>` — real, crawlable URLs for sharing and SEO. The `.md` files are the source of truth; a prebuild step compiles them into a TypeScript module.

### Adding a post

1. **Write the body** — `content/blog/<slug>.md`, plain Markdown, no frontmatter. Reference images as `/blog/<slug>/<name>.jpg`.
2. **Add images** — drop the files in `public/blog/<slug>/`.
3. **Register metadata** — add an entry to the `POSTS` array in `lib/blog.ts`:

   ```ts
   {
     slug: "<slug>",                 // must match the .md filename and image folder
     title: "…",
     date: "YYYY-MM-DD",             // ISO — shown as MM-DD-YYYY via formatDate()
     summary: "…",                   // shown in the list + used as the OG/meta description
     tags: ["…"],
     hero: "/blog/<slug>/hero.jpg",  // OG image
     body: POST_BODIES["<slug>"],    // compiled body — see step 4
   }
   ```

4. **Run it** — `npm run dev` (or `build` / `test`). A `pre*` hook runs `scripts/generate-blog-content.mjs`, which compiles every `content/blog/*.md` into `lib/generated/blog-content.ts` (the `POST_BODIES` map — gitignored). **Never edit the generated file; edit the `.md`.**

Everything else picks up the new post automatically: the `blog` command list, the welcome-banner `blog` button, the `/blog` index, the `/blog/<slug>` page (`generateStaticParams` + `generateMetadata` for OG/canonical tags), and `sitemap.xml`.

Rendering for both surfaces goes through `components/output/PostBody.tsx` (react-markdown + remark-gfm, styled with `mb-*` classes).

> **Why a build step instead of importing the `.md` directly?** Compiling the bodies to a plain `.ts` module keeps content loading bundler-agnostic — the same import resolves identically in the Next (Turbopack) build and in Vitest, with no bundler-specific `.md` loader config to keep in sync.

## Theming

A single matte-black palette is defined as Tailwind theme colors with the `mb-` prefix in `globals.css`. Always use these classes — never hardcode hex values. See `.claude/rules/styling.md` for the full palette.

Key color roles:
- Text: `mb-text` / `mb-bright` / `mb-subtext0` / `mb-subtext1`
- Background: `mb-bg` / `mb-bar`
- Surfaces: `mb-surface0` / `mb-surface1` / `mb-surface2`
- Accents: `mb-accent` (#e68e0d orange — headings/prompt/success), `mb-accent2` (labels/highlights), `mb-blue` (links, hover `mb-blue-bright`), `mb-danger` (errors)

## Testing

**Vitest 4 + React Testing Library + jsdom** for unit and component tests. Globals enabled — `describe`, `it`, `expect`, `vi` need no imports. Tests mirror source structure under `__tests__/`.

Tests that exercise terminal commands must import `@/lib/registerCommands` to populate the registry.

**Playwright** (`e2e/`) is scoped to mobile-viewport regression only — it catches layout bugs that jsdom cannot reproduce (e.g., `100vh` vs mobile URL-bar interactions). Do not migrate existing Vitest tests to Playwright. See `e2e/README.md` for the real-device debug workflow (`adb reverse` + `brave://inspect`).

## Static Export

`next.config.ts` sets `output: "export"` — `next build` produces static HTML in `out/`. No API routes, no server-side data fetching. `next/image` uses `unoptimized: true`.
