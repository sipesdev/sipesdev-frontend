/**
 * Unit tests for the TerminalInput component at components/terminal/TerminalInput.tsx.
 *
 * TerminalInput is a controlled input with forwardRef that handles complex keyboard
 * interactions: command submission on Enter, command history navigation via ArrowUp/
 * ArrowDown, tab-completion of registered commands, Ctrl+L to clear, and Ctrl+C to
 * cancel current input.
 *
 * The command registry must be populated (via side-effect import of registerCommands)
 * for tab-completion tests to work, since the component calls getMatchingCommands()
 * from lib/commands.ts internally.
 */

// Side-effect import: populates the global command registry for tab-completion tests
import "@/lib/registerCommands";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TerminalInput } from "@/components/terminal/TerminalInput";
import { createRef } from "react";

// ---------------------------------------------------------------------------
// Default props factory
// ---------------------------------------------------------------------------

/**
 * Creates a default set of props for TerminalInput using vi.fn() mocks.
 * Each test can override individual props as needed.
 */
function createDefaultProps(overrides: Partial<Parameters<typeof TerminalInput>[0]> = {}) {
  return {
    onSubmit: vi.fn(),
    commandHistory: [] as string[],
    historyIndex: -1,
    onHistoryIndexChange: vi.fn(),
    onClear: vi.fn(),
    ...overrides,
  };
}

/**
 * Helper to render TerminalInput with sensible defaults and return
 * the user-event instance alongside the props for assertion.
 */
function renderInput(overrides: Partial<Parameters<typeof TerminalInput>[0]> = {}) {
  const props = createDefaultProps(overrides);
  const user = userEvent.setup();
  const result = render(<TerminalInput {...props} />);
  return { user, props, ...result };
}

/**
 * Convenience accessor for the input element by its aria-label.
 */
function getInput(): HTMLInputElement {
  return screen.getByLabelText("Terminal command input") as HTMLInputElement;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
describe("TerminalInput - rendering", () => {
  it("renders an input element with aria-label 'Terminal command input'", () => {
    renderInput();

    const input = getInput();
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("renders the PromptPrefix component (michael@sipes.dev:~$)", () => {
    const { container } = renderInput();

    // PromptPrefix renders USER.shortName and USER.hostname as separate spans
    expect(screen.getByText("michael")).toBeInTheDocument();
    expect(screen.getByText("sipes.dev")).toBeInTheDocument();

    // RTL normalizes whitespace, so verify ":~$ " via the DOM directly
    const promptPrefix = container.querySelector("[aria-hidden='true']");
    expect(promptPrefix).not.toBeNull();
    const suffixSpan = promptPrefix!.children[3] as HTMLElement;
    expect(suffixSpan.textContent).toBe(":~$ ");
  });

  it("receives focus automatically on mount (autoFocus behavior)", () => {
    renderInput();

    const input = getInput();
    // React's autoFocus prop causes the input to receive focus on mount.
    // In jsdom with React 19, this is handled programmatically rather than
    // via an HTML attribute, so we verify the input has focus.
    expect(input).toHaveFocus();
  });
});

// ---------------------------------------------------------------------------
// Enter key - submission
// ---------------------------------------------------------------------------
describe("TerminalInput - Enter key submission", () => {
  it("calls onSubmit with the typed text when Enter is pressed", async () => {
    const { user, props } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "help");
    await user.keyboard("{Enter}");

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).toHaveBeenCalledWith("help");
  });

  it("clears the input value after Enter is pressed", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "whoami");
    await user.keyboard("{Enter}");

    expect(input.value).toBe("");
  });

  it("calls onSubmit with empty string when Enter is pressed on empty input", async () => {
    const { user, props } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.keyboard("{Enter}");

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).toHaveBeenCalledWith("");
  });
});

// ---------------------------------------------------------------------------
// ArrowUp - history navigation backward
// ---------------------------------------------------------------------------
describe("TerminalInput - ArrowUp history navigation", () => {
  it("navigates to the last command in history when ArrowUp is pressed", async () => {
    const { user, props } = renderInput({
      commandHistory: ["help", "about"],
      historyIndex: -1,
    });
    const input = getInput();

    await user.click(input);
    await user.keyboard("{ArrowUp}");

    // Should navigate to the last item (index 1 = "about")
    expect(props.onHistoryIndexChange).toHaveBeenCalledWith(1);
    expect(input.value).toBe("about");
  });

  it("navigates to previous command on subsequent ArrowUp presses", async () => {
    const { user, props } = renderInput({
      commandHistory: ["help", "about"],
      historyIndex: 1,
    });
    const input = getInput();

    await user.click(input);
    await user.keyboard("{ArrowUp}");

    // historyIndex was 1, so next ArrowUp should go to Math.max(0, 1-1) = 0
    expect(props.onHistoryIndexChange).toHaveBeenCalledWith(0);
    expect(input.value).toBe("help");
  });

  it("does nothing when ArrowUp is pressed with empty command history", async () => {
    const { user, props } = renderInput({
      commandHistory: [],
      historyIndex: -1,
    });
    const input = getInput();

    await user.click(input);
    await user.keyboard("{ArrowUp}");

    expect(props.onHistoryIndexChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// ArrowDown - history navigation forward
// ---------------------------------------------------------------------------
describe("TerminalInput - ArrowDown history navigation", () => {
  it("navigates forward through history when ArrowDown is pressed", async () => {
    const { user, props } = renderInput({
      commandHistory: ["help", "about", "projects"],
      historyIndex: 0,
    });
    const input = getInput();

    await user.click(input);
    await user.keyboard("{ArrowDown}");

    // historyIndex was 0, so ArrowDown should go to 1
    expect(props.onHistoryIndexChange).toHaveBeenCalledWith(1);
    expect(input.value).toBe("about");
  });

  it("clears input and sets historyIndex to -1 when navigating past the end", async () => {
    const { user, props } = renderInput({
      commandHistory: ["help", "about"],
      historyIndex: 1,
    });
    const input = getInput();

    await user.click(input);
    await user.keyboard("{ArrowDown}");

    // historyIndex was 1 (last item), newIndex would be 2 >= length(2), so reset
    expect(props.onHistoryIndexChange).toHaveBeenCalledWith(-1);
    expect(input.value).toBe("");
  });

  it("does nothing when ArrowDown is pressed and historyIndex is already -1", async () => {
    const { user, props } = renderInput({
      commandHistory: ["help", "about"],
      historyIndex: -1,
    });
    const input = getInput();

    await user.click(input);
    await user.keyboard("{ArrowDown}");

    expect(props.onHistoryIndexChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tab - autocomplete
// ---------------------------------------------------------------------------
describe("TerminalInput - Tab autocomplete", () => {
  it("completes a partial command on Tab press (e.g., 'he' -> 'help')", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "he");
    await user.keyboard("{Tab}");

    expect(input.value).toBe("help");
  });

  it("cycles to the next match on subsequent Tab presses", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    // 'h' matches 'help' and 'history' (sorted alphabetically)
    // First Tab should select the first match
    expect(input.value).toBe("help");

    await user.keyboard("{Tab}");

    // Second Tab should cycle to the next match
    expect(input.value).toBe("history");
  });

  it("does nothing when Tab is pressed on empty input", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.keyboard("{Tab}");

    expect(input.value).toBe("");
  });

  it("does nothing when Tab is pressed and no commands match", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "zzzzz");
    await user.keyboard("{Tab}");

    expect(input.value).toBe("zzzzz");
  });
});

// ---------------------------------------------------------------------------
// Ctrl+L - clear
// ---------------------------------------------------------------------------
describe("TerminalInput - Ctrl+L clear", () => {
  it("calls onClear when Ctrl+L is pressed", async () => {
    const { user, props } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.keyboard("{Control>}l{/Control}");

    expect(props.onClear).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Ctrl+C - cancel
// ---------------------------------------------------------------------------
describe("TerminalInput - Ctrl+C cancel", () => {
  it("clears the input text when Ctrl+C is pressed", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "some partial command");
    await user.keyboard("{Control>}c{/Control}");

    expect(input.value).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Ref forwarding
// ---------------------------------------------------------------------------
describe("TerminalInput - ref forwarding", () => {
  it("forwards ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();
    const props = createDefaultProps();

    render(<TerminalInput ref={ref} {...props} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current).toBe(getInput());
  });
});
