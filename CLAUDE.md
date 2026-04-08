# sipesdev-frontend

Terminal-style portfolio website for Michael Sipes, built with Next.js 16 and React 19.

## Quick Reference

```bash
npm run dev        # Start dev server
npm run build      # Static export build
npm run test:run   # Run all tests once
npm run test       # Run tests in watch mode
npm run lint       # ESLint
```

## Architecture

Single-page static-export Next.js app. The entire UI is a terminal emulator rendered by `<Terminal />`.

```
app/
  page.tsx              # Renders <Terminal />
  layout.tsx            # JetBrains Mono font, metadata
  globals.css           # Catppuccin Mocha theme via Tailwind @theme inline

components/
  terminal/             # Core terminal UI
    Terminal.tsx         # Main component — state, command processing, history
    TerminalInput.tsx    # Input with tab completion, arrow-key history, Ctrl+L/C
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

lib/
  commands.ts           # Command registry (registerCommand, executeCommand, getMatchingCommands)
  registerCommands.tsx   # All command registrations — add new commands here
  constants.ts          # USER, LINKS, PROJECTS, SKILLS, GITHUB_BADGES, ASCII_BANNER
  types.ts              # Command, HistoryEntry, Project interfaces
```

## Command System

Commands are registered via `registerCommand()` in `lib/registerCommands.tsx`. Each command has a `name`, `description`, optional `usage`, and an `execute(args) => ReactNode` function.

To add a new command:
1. If output is complex JSX, create a component in `components/output/`
2. Call `registerCommand({...})` in `lib/registerCommands.tsx`
3. For simple text output, return a string from `execute`

Special cases: `clear` and `history` are intercepted in `Terminal.tsx` before reaching the registry. Their registered `execute` functions are never called — they exist only so `help` lists them.

## Theming

Catppuccin Mocha palette is defined as Tailwind theme colors with `ctp-` prefix in `globals.css`. Always use these classes — never hardcode hex values.

Key color roles:
- Text: `ctp-text` / `ctp-subtext0` / `ctp-subtext1`
- Background: `ctp-base` / `ctp-mantle` / `ctp-crust`
- Surfaces: `ctp-surface0` / `ctp-surface1` / `ctp-surface2`
- Accents: `ctp-mauve` (headings), `ctp-green` (prompt/success), `ctp-blue` (links), `ctp-peach` (labels), `ctp-yellow` (highlights), `ctp-red` (errors)

## Testing

Vitest 4 + React Testing Library + jsdom. Globals enabled — `describe`, `it`, `expect`, `vi` need no imports. Tests mirror source structure under `__tests__/`.

Tests that exercise terminal commands must import `@/lib/registerCommands` to populate the registry.

## Static Export

`next.config.ts` sets `output: "export"` — `next build` produces static HTML in `out/`. No API routes, no server-side data fetching. `next/image` uses `unoptimized: true`.
