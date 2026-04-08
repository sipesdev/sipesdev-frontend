import type { ReactNode } from "react";
import type { Command } from "./types";

const commandRegistry = new Map<string, Command>();

export function registerCommand(command: Command): void {
  commandRegistry.set(command.name.toLowerCase(), command);
}

export function executeCommand(input: string): ReactNode {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);

  const command = commandRegistry.get(name);
  if (!command) {
    return `command not found: ${parts[0]}. Type 'help' for available commands.`;
  }

  return command.execute(args);
}

export function getCommandNames(): string[] {
  return Array.from(commandRegistry.keys()).sort();
}

export function getMatchingCommands(partial: string): string[] {
  const lower = partial.toLowerCase();
  return getCommandNames().filter((name) => name.startsWith(lower));
}

export function getCommands(): Map<string, Command> {
  return commandRegistry;
}
