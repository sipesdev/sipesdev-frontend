# Command System Rules

## Architecture Overview

The terminal command system consists of three parts:

1. **Registry** (`lib/commands.ts`) -- A `Map<string, Command>` with functions to register, execute, and query commands.
2. **Registration** (`lib/registerCommands.tsx`) -- Side-effect module that calls `registerCommand()` for every available command.
3. **Output components** (`components/output/`) -- Dedicated React components for commands with complex JSX output.

## Command Interface

Defined in `lib/types.ts`:

```ts
interface Command {
  name: string;          // Lowercase command name (used as the registry key)
  description: string;   // Short description shown in help output
  usage?: string;        // Optional usage string (e.g., "echo <text>")
  execute: (args: string[]) => ReactNode;  // Returns JSX or a string
}
```

## Adding a New Command

1. **Register the command** in `lib/registerCommands.tsx` by calling `registerCommand()` with a `Command` object.
2. **For simple output** (plain text), return a string directly from `execute`:
   ```tsx
   registerCommand({
     name: "whoami",
     description: "Print current user",
     execute: () => "michael",
   });
   ```
3. **For complex output** (multi-line, styled, interactive), create a dedicated component in `components/output/` and return it from `execute`:
   ```tsx
   registerCommand({
     name: "about",
     description: "Learn about me",
     execute: () => <AboutOutput />,
   });
   ```
4. **Use named exports** for output components, not default exports.
5. **If the command accepts arguments**, declare `usage` and use the `args` parameter:
   ```tsx
   registerCommand({
     name: "echo",
     description: "Echo text back",
     usage: "echo <text>",
     execute: (args) => args.join(" ") || "",
   });
   ```

## Registry API

- `registerCommand(command: Command)` -- Adds a command. Name is lowercased as the key.
- `executeCommand(input: string)` -- Parses input, looks up command, calls `execute(args)`. Returns `"command not found: ..."` for unknown commands. Returns `null` for empty input.
- `getCommandNames()` -- Returns sorted array of all registered command names.
- `getMatchingCommands(partial: string)` -- Returns command names that start with the given prefix (used for tab completion).
- `getCommands()` -- Returns the full `Map<string, Command>` (used by `HelpOutput`).

## Special-Cased Commands

The following commands are **registered** in `lib/registerCommands.tsx` (so they appear in help output) but their `execute` functions are **never called**. Their behavior is handled directly in `Terminal.tsx`:

- **`clear`** -- Calls `setHistory([])` to wipe all terminal history.
- **`history`** -- Reads from `commandHistory` state and formats it as numbered lines.

Do not put meaningful logic in the `execute` function of these commands. Their registered `execute` returns `null` as a placeholder.

## Data & Constants

- Static data (user info, links, projects, skills, badges, ASCII banner) lives in `lib/constants.ts`.
- Output components import from `lib/constants.ts` for display data.
- When adding new commands that display static data, add the data to `lib/constants.ts` and import it in the component or registration.

## Naming Conventions

- Command names are lowercase, single words (e.g., `help`, `about`, `whoami`).
- Output component names follow the pattern `{CommandName}Output` (e.g., `HelpOutput`, `AboutOutput`, `ProjectsOutput`).
- Output component files match the component name (e.g., `components/output/HelpOutput.tsx`).
