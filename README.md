# sipesdev-frontend

My personal portfolio website, built with Next.js 16, React 19, and Tailwind CSS 4. The entire UI is an interactive terminal emulator, themed with a custom **matte-black** palette, plus a small Markdown-powered blog.

## Tech Stack

- **Framework:** Next.js 16 (static export)
- **UI:** React 19, Tailwind CSS 4
- **Font:** [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (self-hosted, SIL OFL 1.1)
- **Theme:** Matte Black — a single custom palette (`#121212` background, `#e68e0d` orange accent, `#7aa2f7` links), defined as `mb-*` tokens in `app/globals.css`
- **Blog:** Markdown rendered with [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
- **Testing:** Vitest 4 + React Testing Library + jsdom for unit/component; Playwright for mobile-viewport regression
- **Language:** TypeScript (strict mode)

## Getting Started

Requires **Node 20.9+** (Next 16).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the terminal.

## Scripts

| Command                | Description                                       |
|------------------------|---------------------------------------------------|
| `npm run dev`          | Start development server                          |
| `npm run build`        | Static export build to `out/`                     |
| `npm run lint`         | Run ESLint                                         |
| `npm run test`         | Run Vitest tests in watch mode                     |
| `npm run test:run`     | Run all Vitest tests once                          |
| `npm run test:e2e`     | Run Playwright mobile-viewport specs               |
| `npm run test:e2e:ui`  | Playwright UI mode for iterating on a failing spec |
| `npm run generate:blog`| Compile `content/blog/*.md` → `lib/generated/blog-content.ts` (runs automatically before `dev`/`build`/`test`) |

## Project Structure

```
app/
  page.tsx                  # Home — renders <Terminal />
  layout.tsx                # JetBrains Mono font, site metadata (metadataBase, OG)
  globals.css               # Matte-black theme via Tailwind @theme
  blog/
    page.tsx                # /blog index
    [slug]/page.tsx         # Static per-post article page (SEO + shareable URL)
  sitemap.ts                # Static sitemap.xml
  robots.ts                 # Static robots.txt

components/
  terminal/                 # Core terminal UI
    Terminal.tsx             # Main component — state, command processing, history
    TerminalInput.tsx        # Input with ZSH-style autocomplete, arrow-key history, Ctrl+L/C
    TerminalOutput.tsx       # Output wrapper with aria-live
    TerminalHistory.tsx      # Renders past command/output pairs
    PromptPrefix.tsx         # "michael@sipes.dev:~$ " prompt display
  output/                   # Command output components
    WelcomeBanner.tsx        # ASCII banner + suggestion buttons (incl. "blog")
    AboutOutput.tsx          # Profile image + links
    HelpOutput.tsx           # Lists all registered commands
    ProjectsOutput.tsx       # Tabular project listing
    SkillsOutput.tsx         # Skills by category
    ContactOutput.tsx        # Contact links
    BlogOutput.tsx           # `blog` — lists all posts
    BlogPostOutput.tsx       # `blog <slug>` — renders one post inline
    PostBody.tsx             # Shared react-markdown renderer (matte-black styled)
  blog/
    CopyLinkButton.tsx       # Copy a post's URL (client island on the article page)

lib/
  commands.ts               # Command registry (register, execute, query)
  registerCommands.tsx       # All command registrations
  constants.ts              # Static data (user, links, projects, skills, banner, SITE_URL)
  blog.ts                   # POSTS metadata array + getPost()
  types.ts                  # TypeScript interfaces (incl. Post)

content/
  blog/<slug>.md            # Post bodies (authoring source)
public/
  blog/<slug>/              # Post images
scripts/
  generate-blog-content.mjs # Compiles the .md bodies into a TS module

__tests__/                  # Tests mirroring source structure
```

## Command System

Commands are registered via `registerCommand()` in `lib/registerCommands.tsx`. Type `help` in the terminal to see all of them. Notable: `blog` lists posts, `blog <slug>` opens one inline.

## Blog

Posts live as Markdown in `content/blog/` and render two ways: inline in the terminal (`blog` / `blog <slug>`) and as standalone static pages at `/blog/<slug>` — real, crawlable URLs with per-post `<title>`, canonical link, and Open Graph tags, so a post can be shared and indexed.

### Add a post

1. **Write the body** — create `content/blog/<slug>.md` (plain Markdown, no frontmatter). Reference images as `/blog/<slug>/<name>.jpg`.
2. **Add images** — put the files in `public/blog/<slug>/`.
3. **Register metadata** — add an entry to the `POSTS` array in `lib/blog.ts`:

   ```ts
   {
     slug: "<slug>",                 // must match the .md filename and image folder
     title: "…",
     date: "YYYY-MM-DD",             // ISO — shown as MM-DD-YYYY
     summary: "…",                   // list blurb + OG/meta description
     tags: ["…"],
     hero: "/blog/<slug>/hero.jpg",  // OG image
     body: POST_BODIES["<slug>"],    // compiled body (see below)
   }
   ```

4. **Run `npm run dev`** (or `build`). A pre-hook compiles every `content/blog/*.md` into `lib/generated/blog-content.ts` (the `POST_BODIES` map). **Edit the `.md`, never the generated file.**

The `blog` command, the `blog` welcome-banner button, the `/blog` index, the `/blog/<slug>` page, and `sitemap.xml` all pick up the new post automatically.

## Static Export

The site is statically exported (`output: "export"` in `next.config.ts`). Running `npm run build` produces a fully static site in `out/` — no Node.js server at runtime. Blog pages are pre-rendered to HTML via `generateStaticParams`, so their content and meta tags are in the static files.

## Credits & Licenses

- **JetBrains Mono** — © 2020 The JetBrains Mono Project Authors. Self-hosted from `app/fonts/JetBrainsMono-Regular.woff2` and licensed under the [SIL Open Font License, Version 1.1](app/fonts/OFL.txt). The font is loaded via `next/font/local` rather than `next/font/google` because the Google Fonts subset omits the Unicode block (U+2580–U+259F) and box-drawing (U+2500–U+257F) glyphs used by the SIPESDEV ASCII banner.
