/**
 * Unit tests for the TerminalHistory component at components/terminal/TerminalHistory.tsx.
 *
 * TerminalHistory renders a log of past terminal interactions. Each entry consists
 * of an optional prompt prefix + user input line followed by a TerminalOutput block.
 * Entries with empty input (like the initial welcome banner) skip the prompt line.
 *
 * These tests verify structural rendering, ARIA accessibility attributes, and
 * correct ordering of history entries.
 */

import { render, screen } from "@testing-library/react";
import { TerminalHistory } from "@/components/terminal/TerminalHistory";
import type { HistoryEntry } from "@/lib/types";

// ---------------------------------------------------------------------------
// Empty history
// ---------------------------------------------------------------------------
describe("TerminalHistory - empty history", () => {
  it("renders nothing visible when history is empty", () => {
    const { container } = render(<TerminalHistory history={[]} />);

    // The outer div with role="log" still renders, but it should have no child entries
    const logElement = screen.getByRole("log");
    expect(logElement).toBeInTheDocument();
    expect(logElement.children).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Entries with empty input (banner-style entries)
// ---------------------------------------------------------------------------
describe("TerminalHistory - entries with empty input", () => {
  it("renders output for entries with empty input", () => {
    const entries: HistoryEntry[] = [
      { id: 1, input: "", output: "Welcome to the terminal!" },
    ];

    render(<TerminalHistory history={entries} />);

    expect(screen.getByText("Welcome to the terminal!")).toBeInTheDocument();
  });

  it("does NOT render prompt prefix for entries with empty input", () => {
    const entries: HistoryEntry[] = [
      { id: 1, input: "", output: "System message" },
    ];

    const { container } = render(<TerminalHistory history={entries} />);

    // PromptPrefix renders with aria-hidden="true". For an empty-input entry,
    // there should be no prompt prefix at all.
    const promptPrefixes = container.querySelectorAll("[aria-hidden='true']");
    expect(promptPrefixes).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Entries with non-empty input
// ---------------------------------------------------------------------------
describe("TerminalHistory - entries with non-empty input", () => {
  it("renders the prompt prefix for entries with non-empty input", () => {
    const entries: HistoryEntry[] = [
      { id: 1, input: "whoami", output: "michael" },
    ];

    const { container } = render(<TerminalHistory history={entries} />);

    // PromptPrefix renders "michael" (shortName) and "sipes.dev" (hostname).
    // "michael" also appears as the command output, so use getAllByText.
    expect(screen.getAllByText("michael").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("sipes.dev")).toBeInTheDocument();

    // Verify the prompt prefix is rendered via the aria-hidden span
    const promptPrefix = container.querySelector("[aria-hidden='true']");
    expect(promptPrefix).not.toBeNull();
  });

  it("renders the user input text alongside the prompt prefix", () => {
    const entries: HistoryEntry[] = [
      { id: 1, input: "echo hello", output: "hello" },
    ];

    render(<TerminalHistory history={entries} />);

    expect(screen.getByText("echo hello")).toBeInTheDocument();
  });

  it("renders the output below the input line", () => {
    const entries: HistoryEntry[] = [
      { id: 1, input: "echo test output", output: "test output" },
    ];

    const { container } = render(<TerminalHistory history={entries} />);

    // The entry div contains the input line div followed by a TerminalOutput div
    const entryDiv = container.querySelector("[role='log']")!.firstChild as HTMLElement;
    const children = entryDiv.children;

    // First child: the input line (flex div with PromptPrefix + span)
    // Second child: the TerminalOutput div (aria-live="polite")
    expect(children.length).toBe(2);
    expect(children[1]).toHaveAttribute("aria-live", "polite");
    expect(children[1].textContent).toBe("test output");
  });
});

// ---------------------------------------------------------------------------
// Multiple entries
// ---------------------------------------------------------------------------
describe("TerminalHistory - multiple entries", () => {
  it("renders multiple history entries in order", () => {
    const entries: HistoryEntry[] = [
      { id: 1, input: "", output: "Welcome banner" },
      { id: 2, input: "help", output: "Available commands" },
      { id: 3, input: "whoami", output: "michael" },
    ];

    const { container } = render(<TerminalHistory history={entries} />);

    const logElement = screen.getByRole("log");
    const entryDivs = logElement.children;
    expect(entryDivs).toHaveLength(3);

    // Verify order by checking text content of each entry
    expect(entryDivs[0].textContent).toContain("Welcome banner");
    expect(entryDivs[1].textContent).toContain("help");
    expect(entryDivs[1].textContent).toContain("Available commands");
    expect(entryDivs[2].textContent).toContain("whoami");
  });
});

// ---------------------------------------------------------------------------
// Accessibility attributes
// ---------------------------------------------------------------------------
describe("TerminalHistory - accessibility", () => {
  it("has role='log' on the container", () => {
    render(<TerminalHistory history={[]} />);

    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("has aria-label='Terminal output' on the container", () => {
    render(<TerminalHistory history={[]} />);

    const logElement = screen.getByRole("log");
    expect(logElement).toHaveAttribute("aria-label", "Terminal output");
  });
});
