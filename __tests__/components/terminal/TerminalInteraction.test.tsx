/**
 * Advanced interaction tests for the full Terminal component.
 *
 * These tests go beyond the basic Terminal.test.tsx coverage to verify more
 * complex user interaction flows: suggestion button clicks, multi-command
 * sequences, history navigation within the full Terminal, Ctrl+L clear
 * shortcut, and the "history" command output.
 *
 * next/image is mocked as a plain <img> since Next.js image optimization
 * is unavailable in the jsdom test environment.
 *
 * Element.prototype.scrollIntoView is polyfilled because the Terminal
 * component calls scrollRef.current?.scrollIntoView() in a useEffect.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Terminal } from "@/components/terminal/Terminal";
import { USER } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Mock next/image
// ---------------------------------------------------------------------------
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} />;
  },
}));

// ---------------------------------------------------------------------------
// Polyfill scrollIntoView
// ---------------------------------------------------------------------------
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// ---------------------------------------------------------------------------
// Rendering helper
// ---------------------------------------------------------------------------
function renderTerminal() {
  const user = userEvent.setup();
  const result = render(<Terminal />);
  return { user, ...result };
}

/**
 * Retrieve the terminal input element by its aria-label.
 */
function getInput(): HTMLInputElement {
  return screen.getByLabelText("Terminal command input") as HTMLInputElement;
}

// ---------------------------------------------------------------------------
// Suggestion button interaction
// ---------------------------------------------------------------------------
describe("Terminal interaction - suggestion buttons", () => {
  it("clicking 'projects' suggestion button executes the command and shows Projects heading", async () => {
    const { user } = renderTerminal();

    const projectsButton = screen.getByRole("button", { name: "projects" });
    await user.click(projectsButton);

    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("clicking 'about' suggestion button shows the AboutOutput content", async () => {
    const { user } = renderTerminal();

    const aboutButton = screen.getByRole("button", { name: "about" });
    await user.click(aboutButton);

    expect(screen.getByText(USER.name)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Multiple commands in sequence
// ---------------------------------------------------------------------------
describe("Terminal interaction - multiple commands", () => {
  it("multiple commands show their outputs in correct order in history", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    // Execute first command
    await user.click(input);
    await user.type(input, "whoami");
    await user.keyboard("{Enter}");

    // Execute second command
    await user.type(input, "echo test");
    await user.keyboard("{Enter}");

    // Both commands should appear in the history
    expect(screen.getByText("whoami")).toBeInTheDocument();
    expect(screen.getByText("echo test")).toBeInTheDocument();
    expect(screen.getByText("test")).toBeInTheDocument();
  });

  it("unknown command followed by valid command both appear in history", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    // Execute unknown command
    await user.click(input);
    await user.type(input, "badcmd");
    await user.keyboard("{Enter}");

    // Execute valid command
    await user.type(input, "whoami");
    await user.keyboard("{Enter}");

    // Both appear in history
    expect(screen.getByText(/command not found: badcmd/)).toBeInTheDocument();
    // "whoami" appears as both an echoed input and in prompt prefixes
    const michaelElements = screen.getAllByText("michael");
    expect(michaelElements.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// ArrowUp history navigation in full Terminal
// ---------------------------------------------------------------------------
describe("Terminal interaction - ArrowUp history navigation", () => {
  it("ArrowUp after a command populates input with the last command", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    await user.click(input);
    await user.type(input, "whoami");
    await user.keyboard("{Enter}");

    // Input should be cleared after submission
    expect(input.value).toBe("");

    // Press ArrowUp to recall the last command
    await user.keyboard("{ArrowUp}");

    expect(input.value).toBe("whoami");
  });

  it("ArrowUp cycles through multiple previous commands", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    await user.click(input);
    await user.type(input, "help");
    await user.keyboard("{Enter}");

    await user.type(input, "about");
    await user.keyboard("{Enter}");

    // First ArrowUp should show "about" (most recent)
    await user.keyboard("{ArrowUp}");
    expect(input.value).toBe("about");

    // Second ArrowUp should show "help" (previous)
    await user.keyboard("{ArrowUp}");
    expect(input.value).toBe("help");
  });
});

// ---------------------------------------------------------------------------
// Ctrl+L clear shortcut
// ---------------------------------------------------------------------------
describe("Terminal interaction - Ctrl+L clear", () => {
  it("Ctrl+L clears the terminal history", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    // Verify welcome banner is present
    expect(screen.getByText(/Welcome!/)).toBeInTheDocument();

    // Press Ctrl+L to clear
    await user.click(input);
    await user.keyboard("{Control>}l{/Control}");

    // Welcome banner should be gone
    expect(screen.queryByText(/Welcome!/)).not.toBeInTheDocument();

    // Input should still be present
    expect(getInput()).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Banner command after clear
// ---------------------------------------------------------------------------
describe("Terminal interaction - banner after clear", () => {
  it("running 'banner' after 'clear' re-shows the welcome banner", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    // Clear the terminal
    await user.click(input);
    await user.type(input, "clear");
    await user.keyboard("{Enter}");

    // Welcome should be gone
    expect(screen.queryByText(/Welcome!/)).not.toBeInTheDocument();

    // Run banner to re-show
    await user.type(input, "banner");
    await user.keyboard("{Enter}");

    // Welcome should be back
    expect(screen.getByText(/Welcome!/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// History command
// ---------------------------------------------------------------------------
describe("Terminal interaction - history command", () => {
  it("'history' command shows previously typed commands", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    // Execute some commands first
    await user.click(input);
    await user.type(input, "whoami");
    await user.keyboard("{Enter}");

    await user.type(input, "echo test");
    await user.keyboard("{Enter}");

    // Now run history
    await user.type(input, "history");
    await user.keyboard("{Enter}");

    // The history output should contain the previously typed commands.
    // They appear as "  1  whoami" and "  2  echo test" in the output.
    // "whoami" and "echo test" also appear in the history entries themselves,
    // so we use getAllByText and verify there are multiple matches.
    const whoamiMatches = screen.getAllByText(/whoami/);
    expect(whoamiMatches.length).toBeGreaterThanOrEqual(2);
    const echoTestMatches = screen.getAllByText(/echo test/);
    expect(echoTestMatches.length).toBeGreaterThanOrEqual(2);
  });

  it("'history' with no prior commands shows 'No commands in history.'", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    // Run history as the very first command -- commandHistory is empty at this point
    // Wait, actually the history command itself gets the commandHistory state at the
    // time it runs. Since commandHistory is checked BEFORE adding "history" to it,
    // but actually in Terminal.tsx, for the "history" command, it reads commandHistory
    // and THEN adds "history" to it. So on the very first command, commandHistory is [].
    await user.click(input);
    await user.type(input, "history");
    await user.keyboard("{Enter}");

    expect(screen.getByText("No commands in history.")).toBeInTheDocument();
  });
});
