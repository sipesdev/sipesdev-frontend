# sipesdev-frontend

My personal portfolio website, built with Next.js 16, React 19, and Tailwind CSS 4. The entire UI is an interactive terminal emulator themed with the Catppuccin Mocha color palette.

## Tech Stack

- **Framework:** Next.js 16 (static export)
- **UI:** React 19, Tailwind CSS 4
- **Font:** JetBrains Mono
- **Theme:** Catppuccin Mocha
- **Testing:** Vitest 4 + React Testing Library + jsdom for unit/component; Playwright for mobile-viewport regression
- **Language:** TypeScript (strict mode)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the terminal.

## Scripts

| Command            | Description                  |
|--------------------|------------------------------|
| `npm run dev`      | Start development server     |
| `npm run build`    | Static export build to `out/`|
| `npm run lint`     | Run ESLint                   |
| `npm run test`     | Run Vitest tests in watch mode |
| `npm run test:run` | Run all Vitest tests once    |
| `npm run test:e2e` | Run Playwright mobile-viewport specs |
| `npm run test:e2e:ui` | Playwright UI mode for iterating on a failing spec |

## Project Structure

```
app/
  page.tsx                  # Single page — renders <Terminal />
  layout.tsx                # JetBrains Mono font, metadata
  globals.css               # Catppuccin Mocha theme via Tailwind @theme

components/
  terminal/                 # Core terminal UI
    Terminal.tsx             # Main component — state, command processing, history
    TerminalInput.tsx        # Input with tab completion, arrow-key history, Ctrl+L/C
    TerminalOutput.tsx       # Output wrapper with aria-live
    TerminalHistory.tsx      # Renders past command/output pairs
    PromptPrefix.tsx         # "michael@sipes.dev:~$ " prompt display
  output/                   # Command output components
    WelcomeBanner.tsx        # ASCII art banner + suggestion buttons
    AboutOutput.tsx          # Profile image + links
    HelpOutput.tsx           # Lists all registered commands
    ProjectsOutput.tsx       # Tabular project listing
    SkillsOutput.tsx         # Skills by category
    ContactOutput.tsx        # Contact links

lib/
  commands.ts               # Command registry (register, execute, query)
  registerCommands.tsx       # All command registrations
  constants.ts              # Static data (user, links, projects, skills, banner)
  types.ts                  # TypeScript interfaces

__tests__/                  # Tests mirroring source structure
```

## Command System

The terminal supports commands registered via `registerCommand()` in `lib/registerCommands.tsx`. Type `help` in the terminal to see all available commands.

## Static Export

The site is statically exported (`output: "export"` in `next.config.ts`). Running `npm run build` produces a fully static site in the `out/` directory — no Node.js server required at runtime.
