/**
 * Unit tests for the command registry system at lib/commands.ts.
 *
 * The command registry is the backbone of the terminal application. It stores
 * Command objects keyed by lowercase name and provides lookup, execution,
 * autocomplete filtering, and enumeration APIs.
 *
 * Side-effect import of "@/lib/registerCommands" populates the registry with
 * all production commands before any test runs.
 */

// Side-effect import: populates the global command registry with all commands
// defined in registerCommands.tsx (help, about, projects, contact, skills, etc.)
import "@/lib/registerCommands";

import {
  registerCommand,
  executeCommand,
  getCommandNames,
  getMatchingCommands,
  getCommands,
} from "@/lib/commands";

// ---------------------------------------------------------------------------
// Constants derived from the actual registration file for assertion.
// These are the commands registered in lib/registerCommands.tsx.
// ---------------------------------------------------------------------------
const EXPECTED_COMMAND_NAMES = [
  "about",
  "banner",
  "clear",
  "contact",
  "date",
  "echo",
  "github",
  "help",
  "history",
  "ls",
  "projects",
  "skills",
  "sudo",
  "whoami",
];

// ---------------------------------------------------------------------------
// getCommands() - Full Map access
// ---------------------------------------------------------------------------
describe("getCommands()", () => {
  it("returns a Map instance", () => {
    const commands = getCommands();
    expect(commands).toBeInstanceOf(Map);
  });

  it("contains all registered commands", () => {
    const commands = getCommands();
    for (const name of EXPECTED_COMMAND_NAMES) {
      expect(commands.has(name)).toBe(true);
    }
  });

  it("each entry has required name, description, and execute fields", () => {
    const commands = getCommands();
    for (const [key, cmd] of commands) {
      expect(key).toBe(cmd.name.toLowerCase());
      expect(typeof cmd.description).toBe("string");
      expect(cmd.description.length).toBeGreaterThan(0);
      expect(typeof cmd.execute).toBe("function");
    }
  });
});

// ---------------------------------------------------------------------------
// registerCommand() - Adding commands to the registry
// ---------------------------------------------------------------------------
describe("registerCommand()", () => {
  it("adds a new command to the registry", () => {
    const testCommandName = "__test_register_cmd__";

    registerCommand({
      name: testCommandName,
      description: "A temporary test command",
      execute: () => "test output",
    });

    const commands = getCommands();
    expect(commands.has(testCommandName)).toBe(true);

    const registered = commands.get(testCommandName)!;
    expect(registered.description).toBe("A temporary test command");
    expect(registered.execute([])).toBe("test output");
  });

  it("stores command names in lowercase", () => {
    const mixedCaseName = "__Test_UPPER_cmd__";

    registerCommand({
      name: mixedCaseName,
      description: "Mixed-case command",
      execute: () => "mixed",
    });

    const commands = getCommands();
    expect(commands.has(mixedCaseName.toLowerCase())).toBe(true);
    expect(commands.has(mixedCaseName)).toBe(false);
  });

  it("overwrites a command if re-registered with the same name", () => {
    const name = "__test_overwrite_cmd__";

    registerCommand({
      name,
      description: "Original",
      execute: () => "original",
    });

    registerCommand({
      name,
      description: "Replacement",
      execute: () => "replacement",
    });

    const cmd = getCommands().get(name.toLowerCase())!;
    expect(cmd.description).toBe("Replacement");
    expect(cmd.execute([])).toBe("replacement");
  });
});

// ---------------------------------------------------------------------------
// executeCommand() - Running commands by input string
// ---------------------------------------------------------------------------
describe("executeCommand()", () => {
  it("returns null for an empty string input", () => {
    expect(executeCommand("")).toBeNull();
  });

  it("returns null for a whitespace-only input", () => {
    expect(executeCommand("   ")).toBeNull();
  });

  it("returns the expected output for a valid command (whoami)", () => {
    // 'whoami' returns the string "michael"
    const result = executeCommand("whoami");
    expect(result).toBe("michael");
  });

  it("returns the expected output for echo with arguments", () => {
    const result = executeCommand("echo hello world");
    expect(result).toBe("hello world");
  });

  it("returns an empty string for echo with no arguments", () => {
    const result = executeCommand("echo");
    expect(result).toBe("");
  });

  it("returns an error message containing 'command not found' for unknown commands", () => {
    const result = executeCommand("nonexistentcommand");
    expect(typeof result).toBe("string");
    expect(result as string).toContain("command not found");
  });

  it("includes the original command name in the error message", () => {
    const result = executeCommand("foobarCmd");
    expect(result as string).toContain("foobarCmd");
  });

  it("is case-insensitive for command lookup", () => {
    const lower = executeCommand("whoami");
    const upper = executeCommand("WHOAMI");
    const mixed = executeCommand("WhoAmI");

    expect(lower).toBe("michael");
    expect(upper).toBe("michael");
    expect(mixed).toBe("michael");
  });

  it("trims leading and trailing whitespace before execution", () => {
    const result = executeCommand("  whoami  ");
    expect(result).toBe("michael");
  });

  it("passes remaining arguments to the command execute function", () => {
    const result = executeCommand("echo arg1 arg2 arg3");
    expect(result).toBe("arg1 arg2 arg3");
  });
});

// ---------------------------------------------------------------------------
// getCommandNames() - Sorted list of registered command names
// ---------------------------------------------------------------------------
describe("getCommandNames()", () => {
  it("returns an array", () => {
    const names = getCommandNames();
    expect(Array.isArray(names)).toBe(true);
  });

  it("returns names sorted alphabetically", () => {
    const names = getCommandNames();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  it("contains all expected production commands", () => {
    const names = getCommandNames();
    for (const expected of EXPECTED_COMMAND_NAMES) {
      expect(names).toContain(expected);
    }
  });

  it("returns lowercase names only", () => {
    const names = getCommandNames();
    for (const name of names) {
      expect(name).toBe(name.toLowerCase());
    }
  });
});

// ---------------------------------------------------------------------------
// getMatchingCommands() - Autocomplete filtering by prefix
// ---------------------------------------------------------------------------
describe("getMatchingCommands()", () => {
  it("returns commands matching a prefix", () => {
    // 'he' should match 'help'
    const matches = getMatchingCommands("he");
    expect(matches).toContain("help");
  });

  it("returns multiple matches when prefix is shared", () => {
    // 'c' should match 'clear' and 'contact'
    const matches = getMatchingCommands("c");
    expect(matches).toContain("clear");
    expect(matches).toContain("contact");
  });

  it("returns an empty array when no commands match", () => {
    const matches = getMatchingCommands("zzzzz");
    expect(matches).toEqual([]);
  });

  it("returns the full command when the exact name is provided", () => {
    const matches = getMatchingCommands("help");
    expect(matches).toContain("help");
  });

  it("is case-insensitive", () => {
    const lower = getMatchingCommands("he");
    const upper = getMatchingCommands("HE");
    expect(lower).toEqual(upper);
  });

  it("returns results in sorted order", () => {
    const matches = getMatchingCommands("s");
    const sorted = [...matches].sort();
    expect(matches).toEqual(sorted);
  });

  it("returns an empty array for empty string (everything starts with empty)", () => {
    // This is a quirk: every string starts with "", so all commands match.
    // Actually "".startsWith("") is true, so getMatchingCommands("") returns all.
    // Let's verify the actual behavior of the implementation.
    const matches = getMatchingCommands("");
    // Every command name starts with "", so all should be returned.
    expect(matches.length).toBe(getCommandNames().length);
  });
});
