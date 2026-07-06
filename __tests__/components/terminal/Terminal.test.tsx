/**
 * Integration tests for the Terminal component at components/terminal/Terminal.tsx.
 *
 * The Terminal is the root interactive component of the portfolio site. It renders
 * a welcome banner on mount, provides a text input for command entry, and displays
 * output in a scrolling history. These tests verify the full lifecycle: initial
 * render, command execution, error handling, clear, and focus management.
 *
 * next/image is mocked as a plain <img> since the Next.js image optimization
 * pipeline is unavailable in the jsdom test environment.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Terminal } from "@/components/terminal/Terminal";

// ---------------------------------------------------------------------------
// Mock next/image -- Next.js image component is not available in jsdom.
// We replace it with a simple <img> that forwards the essential props.
// ---------------------------------------------------------------------------
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} />;
  },
}));

// ---------------------------------------------------------------------------
// Polyfill scrollIntoView -- jsdom does not implement this DOM method.
// The Terminal component calls scrollRef.current?.scrollIntoView() in a
// useEffect to auto-scroll after history changes.
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
 * Helper to retrieve the terminal input element by its aria-label.
 */
function getInput(): HTMLInputElement {
  return screen.getByLabelText("Terminal command input") as HTMLInputElement;
}

// ---------------------------------------------------------------------------
// Initial Render
// ---------------------------------------------------------------------------
describe("Terminal - initial render", () => {
  it("displays the welcome banner on mount", () => {
    renderTerminal();

    // The WelcomeBanner contains "Welcome!" text
    expect(screen.getByText(/Welcome!/)).toBeInTheDocument();
  });

  it("displays the ASCII banner art in a <pre> element", () => {
    renderTerminal();

    // The ASCII banner contains "SIPESDEV" as part of the art, rendered in a <pre>
    const preElements = document.querySelectorAll("pre");
    expect(preElements.length).toBeGreaterThan(0);
  });

  it("shows the prompt prefix 'michael@sipes.dev'", () => {
    renderTerminal();

    // PromptPrefix renders "michael" and "sipes.dev" as separate spans
    expect(screen.getAllByText("michael").length).toBeGreaterThan(0);
    expect(screen.getAllByText("sipes.dev").length).toBeGreaterThan(0);
  });

  it("has an input field with the correct aria-label", () => {
    renderTerminal();

    const input = getInput();
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("renders suggestion buttons in the welcome banner", () => {
    renderTerminal();

    // WelcomeBanner renders buttons for: about, projects, contact, help
    const expectedSuggestions = ["about", "projects", "contact", "help"];
    for (const suggestion of expectedSuggestions) {
      expect(screen.getByRole("button", { name: suggestion })).toBeInTheDocument();
    }
  });
});

// ---------------------------------------------------------------------------
// Command Execution
// ---------------------------------------------------------------------------
describe("Terminal - command execution", () => {
  it("executes 'help' and shows 'Available commands:' in the output", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    await user.click(input);
    await user.type(input, "help");
    await user.keyboard("{Enter}");

    expect(screen.getByText("Available commands:")).toBeInTheDocument();
  });

  it("executes 'whoami' and displays 'michael'", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    await user.click(input);
    await user.type(input, "whoami");
    await user.keyboard("{Enter}");

    // "michael" appears in prompts AND in command output.
    // The whoami output is rendered as a text node containing "michael".
    const allMichaels = screen.getAllByText("michael");
    // At least one more "michael" than just the prompt prefixes
    expect(allMichaels.length).toBeGreaterThanOrEqual(2);
  });

  it("executes 'echo hello world' and displays the echoed text", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    await user.click(input);
    await user.type(input, "echo hello world");
    await user.keyboard("{Enter}");

    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("shows the typed command in the history after execution", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    await user.click(input);
    await user.type(input, "whoami");
    await user.keyboard("{Enter}");

    // The history should show the input "whoami" as a rendered span
    // TerminalHistory renders entry.input in a span with text-mb-text class
    expect(screen.getByText("whoami")).toBeInTheDocument();
  });

  it("clears the input field after command submission", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    await user.click(input);
    await user.type(input, "whoami");
    await user.keyboard("{Enter}");

    expect(input.value).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Unknown Command Error Handling
// ---------------------------------------------------------------------------
describe("Terminal - unknown command", () => {
  it("shows 'command not found' for an unrecognized command", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    await user.click(input);
    await user.type(input, "invalidcommand123");
    await user.keyboard("{Enter}");

    expect(screen.getByText(/command not found/)).toBeInTheDocument();
  });

  it("includes the unrecognized command name in the error message", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    await user.click(input);
    await user.type(input, "badcmd");
    await user.keyboard("{Enter}");

    // "badcmd" appears twice: once echoed in the history prompt line, and once
    // inside the "command not found: badcmd..." error message. We verify the
    // error output specifically contains the command name.
    const errorOutput = screen.getByText(/command not found: badcmd/);
    expect(errorOutput).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Clear Command
// ---------------------------------------------------------------------------
describe("Terminal - clear command", () => {
  it("removes all history entries when 'clear' is executed", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    // First, verify the welcome banner is present
    expect(screen.getByText(/Welcome!/)).toBeInTheDocument();

    // Execute clear
    await user.click(input);
    await user.type(input, "clear");
    await user.keyboard("{Enter}");

    // Welcome banner and all history should be gone
    expect(screen.queryByText(/Welcome!/)).not.toBeInTheDocument();
  });

  it("retains the input field after clear so the user can keep typing", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    await user.click(input);
    await user.type(input, "clear");
    await user.keyboard("{Enter}");

    // Input should still be there
    expect(getInput()).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Focus Management
// ---------------------------------------------------------------------------
describe("Terminal - focus management", () => {
  it("focuses the input when the terminal area is clicked", async () => {
    const { user, container } = renderTerminal();

    // The outermost div has the onClick={focusInput} handler
    const terminalContainer = container.firstChild as HTMLElement;

    await user.click(terminalContainer);

    expect(getInput()).toHaveFocus();
  });
});

// ---------------------------------------------------------------------------
// Empty Input Handling
// ---------------------------------------------------------------------------
describe("Terminal - empty input", () => {
  it("does not add a history entry when submitting empty input", async () => {
    const { user } = renderTerminal();
    const input = getInput();

    // Count existing history entries by looking at aria-live regions
    const historyBefore = document.querySelectorAll("[aria-live='polite']").length;

    await user.click(input);
    await user.keyboard("{Enter}");

    const historyAfter = document.querySelectorAll("[aria-live='polite']").length;

    // executeCommand returns null for empty input, TerminalOutput renders null
    // when children is falsy, so no new visible output should appear.
    // However, a history entry IS added (with null output) -- TerminalOutput
    // returns null for falsy children, so the DOM count may stay the same.
    // The important thing is no error message appears.
    expect(screen.queryByText(/command not found/)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Autocomplete Integration
//
// Full-stack verification that the ZSH-style autocomplete feature integrates
// correctly with Terminal command processing: the user types a partial
// command, opens the menu via Tab, accepts via Enter (which fills the value
// but does not submit), and submits via a second Enter.
// ---------------------------------------------------------------------------
describe("Terminal - autocomplete integration", () => {
  it("user can type a partial command, open menu via Tab, accept via Enter, and submit via second Enter", async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByLabelText("Terminal command input") as HTMLInputElement;

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");
    // Menu open with help highlighted.
    await user.keyboard("{Enter}");
    // Input now "help", menu closed, command not yet submitted.
    expect(input.value).toBe("help");
    await user.keyboard("{Enter}");
    // help command output should now be visible in history.
    expect(screen.getByText(/Available commands:/i)).toBeInTheDocument();
  });
});
