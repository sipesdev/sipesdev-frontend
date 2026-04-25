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

  it("submits the typed value verbatim and does NOT implicitly accept the ghost suggestion", async () => {
    const { user, props } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "ec");
    // Ghost text suggests "ho" (full match: "echo"), but Enter must submit
    // exactly what the user typed, not the ghost suggestion.
    await user.keyboard("{Enter}");

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).toHaveBeenCalledWith("ec");
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

  it("opens menu and cycles highlight on subsequent Tab presses", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    // 'h' matches 'help' and 'history' (sorted alphabetically).
    // With 2+ matches, Tab opens a menu and leaves the input value unchanged
    // (still showing the user's typed prefix). The first match is highlighted.
    expect(input.value).toBe("h");
    let selectedItem = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selectedItem).not.toBeNull();
    expect(selectedItem!.textContent).toContain("help");

    await user.keyboard("{Tab}");

    // Second Tab should cycle the highlight to the next match (history),
    // again without modifying input.value.
    expect(input.value).toBe("h");
    selectedItem = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selectedItem).not.toBeNull();
    expect(selectedItem!.textContent).toContain("history");
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

// ---------------------------------------------------------------------------
// Ghost text suggestion
//
// The ghost text is a ZSH-style inline suffix rendered immediately after the
// user's typed prefix. It shows the completion of the alphabetically first
// matching registered command. It is purely visual and hidden from assistive
// technology (aria-hidden="true"). It is suppressed in a number of scenarios
// detailed by the tests below.
// ---------------------------------------------------------------------------
describe("TerminalInput - ghost text suggestion", () => {
  it("renders ghost text suffix matching the alphabetically first command when typing a unique prefix", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "ec");

    // Only 'echo' matches. The ghost should be the suffix 'ho'.
    const ghost = screen.getByTestId("ghost-suffix");
    expect(ghost).toBeInTheDocument();
    expect(ghost.textContent).toBe("ho");
  });

  it("renders ghost text matching the first alphabetical command when multiple commands match the prefix", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");

    // 'h' matches 'help' and 'history'. 'help' sorts first, so the ghost
    // suffix is 'elp'.
    const ghost = screen.getByTestId("ghost-suffix");
    expect(ghost).toBeInTheDocument();
    expect(ghost.textContent).toBe("elp");
  });

  it("does not render ghost text when input is empty", () => {
    renderInput();

    expect(screen.queryByTestId("ghost-suffix")).toBeNull();
  });

  it("does not render ghost text when no commands match the prefix", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "zzz");

    expect(screen.queryByTestId("ghost-suffix")).toBeNull();
  });

  it("does not render ghost text when the input exactly equals a registered command name", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "help");

    expect(screen.queryByTestId("ghost-suffix")).toBeNull();
  });

  it("does not render ghost text when the input contains uppercase characters", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "He");

    // Mixed-case suppression rule: any uppercase letter disables the ghost.
    expect(screen.queryByTestId("ghost-suffix")).toBeNull();
  });

  it("does not render ghost text when the input contains whitespace", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "echo hello");

    // Autocomplete only applies to the command name itself, not arguments.
    expect(screen.queryByTestId("ghost-suffix")).toBeNull();
  });

  it("does not render ghost text when the autocomplete menu is open", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");

    // Ghost visible before Tab.
    expect(screen.getByTestId("ghost-suffix")).toBeInTheDocument();

    await user.keyboard("{Tab}");

    // After Tab opens the menu, the ghost is hidden to avoid conflicting UI.
    expect(screen.getByTestId("autocomplete-menu")).toBeInTheDocument();
    expect(screen.queryByTestId("ghost-suffix")).toBeNull();
  });

  it("does not render ghost text when the cursor is moved away from the end of the input", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "ec");

    expect(screen.getByTestId("ghost-suffix")).toBeInTheDocument();

    // Move the cursor back one position; ghost should disappear because it
    // only shows when the cursor is at the end of the input.
    await user.keyboard("{ArrowLeft}");
    expect(screen.queryByTestId("ghost-suffix")).toBeNull();

    // Return to the end; ghost should reappear.
    await user.keyboard("{End}");
    expect(screen.getByTestId("ghost-suffix")).toBeInTheDocument();
  });

  it("marks the ghost text element as aria-hidden for screen readers", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "ec");

    const ghost = screen.getByTestId("ghost-suffix");
    expect(ghost).toHaveAttribute("aria-hidden", "true");
  });
});

// ---------------------------------------------------------------------------
// Right Arrow accepts ghost suggestion
//
// When the ghost is showing and the caret is at the end, the Right Arrow key
// accepts the suggestion by replacing the input value with the canonical
// lowercase command name. Otherwise, default caret behavior applies.
// ---------------------------------------------------------------------------
describe("TerminalInput - Right Arrow accepts ghost", () => {
  it("accepts the ghost suggestion and replaces input with the canonical command name", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "ec");
    await user.keyboard("{ArrowRight}");

    expect(input.value).toBe("echo");
  });

  it("does nothing on Right Arrow when no ghost is showing", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "zzz");
    await user.keyboard("{ArrowRight}");

    expect(input.value).toBe("zzz");
  });

  it("does nothing on Right Arrow when input is empty", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.keyboard("{ArrowRight}");

    expect(input.value).toBe("");
  });

  it("does nothing on Right Arrow when cursor is not at the end of the input", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "ec");
    // Move cursor off the end; now a Right Arrow should simply move the
    // caret back to the end rather than accept the ghost suggestion.
    await user.keyboard("{ArrowLeft}");
    await user.keyboard("{ArrowRight}");

    expect(input.value).toBe("ec");
  });
});

// ---------------------------------------------------------------------------
// Tab opens autocomplete menu
//
// With 2+ matches, Tab opens a menu of candidates. With exactly 1 match,
// Tab completes inline without opening a menu. With 0 matches or empty input,
// Tab is a no-op (already covered in the earlier Tab autocomplete section).
// ---------------------------------------------------------------------------
describe("TerminalInput - Tab opens autocomplete menu", () => {
  it("does not change the input value when Tab is pressed with multiple matches", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    // The user's typed prefix should remain — the menu is the UI, not the
    // value.
    expect(input.value).toBe("h");
  });

  it("renders the menu container with data-testid='autocomplete-menu' when Tab is pressed with multiple matches", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    expect(screen.getByTestId("autocomplete-menu")).toBeInTheDocument();
  });

  it("renders all matching commands as menu items when the menu opens", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    const items = screen.getAllByTestId("menu-item");
    expect(items).toHaveLength(2);
    const itemTexts = items.map((item) => item.textContent ?? "");
    expect(itemTexts.some((text) => text.includes("help"))).toBe(true);
    expect(itemTexts.some((text) => text.includes("history"))).toBe(true);
  });

  it("highlights the first match (data-selected='true') when the menu opens", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    const selected = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("help");
  });

  it("renders non-selected items with data-selected='false'", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    const items = screen.getAllByTestId("menu-item");
    const selectedCount = items.filter(
      (item) => item.getAttribute("data-selected") === "true"
    ).length;
    const unselectedCount = items.filter(
      (item) => item.getAttribute("data-selected") === "false"
    ).length;

    expect(selectedCount).toBe(1);
    expect(unselectedCount).toBe(items.length - 1);
  });

  it("completes the input inline without opening a menu when Tab matches exactly one command", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "wh");
    await user.keyboard("{Tab}");

    expect(input.value).toBe("whoami");
    expect(screen.queryByTestId("autocomplete-menu")).toBeNull();
  });

  it("sets the menu container's aria-live to 'polite'", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    const menu = screen.getByTestId("autocomplete-menu");
    expect(menu).toHaveAttribute("aria-live", "polite");
  });
});

// ---------------------------------------------------------------------------
// Menu navigation via Tab and Shift+Tab
// ---------------------------------------------------------------------------
describe("TerminalInput - menu navigation via Tab", () => {
  it("moves the highlight to the next item when Tab is pressed while menu is open", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}"); // Opens menu, 'help' highlighted.
    await user.keyboard("{Tab}"); // Moves to 'history'.

    const selected = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("history");
  });

  it("wraps to the first item when Tab is pressed past the last match", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}"); // help
    await user.keyboard("{Tab}"); // history
    await user.keyboard("{Tab}"); // wraps to help

    const selected = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("help");
  });

  it("moves the highlight to the previous item on Shift+Tab", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}"); // help
    await user.keyboard("{Tab}"); // history
    await user.keyboard("{Shift>}{Tab}{/Shift}"); // back to help

    const selected = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("help");
  });

  it("wraps to the last item when Shift+Tab is pressed before the first match", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}"); // help
    await user.keyboard("{Shift>}{Tab}{/Shift}"); // wraps to history

    const selected = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("history");
  });
});

// ---------------------------------------------------------------------------
// Menu navigation via arrow keys
// ---------------------------------------------------------------------------
describe("TerminalInput - menu navigation via arrow keys", () => {
  it("moves the highlight to the next item on ArrowDown when the menu is open", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");
    await user.keyboard("{ArrowDown}");

    const selected = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("history");
  });

  it("moves the highlight to the previous item on ArrowUp when the menu is open", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");
    await user.keyboard("{ArrowDown}"); // history
    await user.keyboard("{ArrowUp}"); // back to help

    const selected = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("help");
  });

  it("wraps the highlight when ArrowDown is pressed past the last item", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");
    await user.keyboard("{ArrowDown}"); // history
    await user.keyboard("{ArrowDown}"); // wraps to help

    const selected = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("help");
  });

  it("wraps the highlight when ArrowUp is pressed before the first item", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");
    await user.keyboard("{ArrowUp}"); // wraps to history

    const selected = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("history");
  });

  it("does not call onHistoryIndexChange on ArrowUp when the menu is open", async () => {
    const { user, props } = renderInput({
      commandHistory: ["help", "about"],
      historyIndex: -1,
    });
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}"); // Opens menu.
    await user.keyboard("{ArrowUp}");

    expect(props.onHistoryIndexChange).not.toHaveBeenCalled();
  });

  it("does not call onHistoryIndexChange on ArrowDown when the menu is open", async () => {
    const { user, props } = renderInput({
      commandHistory: ["help", "about"],
      historyIndex: 0,
    });
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}"); // Opens menu.
    await user.keyboard("{ArrowDown}");

    expect(props.onHistoryIndexChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Menu acceptance and dismissal
// ---------------------------------------------------------------------------
describe("TerminalInput - menu acceptance and dismissal", () => {
  it("Enter sets the input value to the highlighted command and does not submit", async () => {
    const { user, props } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}"); // help highlighted
    await user.keyboard("{Enter}");

    expect(input.value).toBe("help");
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("Enter closes the menu after acceptance", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");
    await user.keyboard("{Enter}");

    expect(screen.queryByTestId("autocomplete-menu")).toBeNull();
  });

  it("a second Enter after acceptance submits the chosen command", async () => {
    const { user, props } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}"); // Opens menu, help highlighted.
    await user.keyboard("{Enter}"); // Accepts "help" into the input, closes menu.
    await user.keyboard("{Enter}"); // Submits the input.

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).toHaveBeenCalledWith("help");
  });

  it("Escape closes the menu without changing the input value", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");
    await user.keyboard("{Escape}");

    expect(input.value).toBe("h");
    expect(screen.queryByTestId("autocomplete-menu")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Menu reactivity to typing
//
// The menu must react when the user continues typing while it is open:
// narrowing to 0 or 1 match closes it, and narrowing while keeping 2+ matches
// updates the item list and resets the highlight to index 0.
// ---------------------------------------------------------------------------
describe("TerminalInput - menu reactivity to typing", () => {
  it("closes the menu when typing narrows matches to zero", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}"); // Open menu with help, history.
    await user.type(input, "z"); // "hz" -> no matches.

    expect(screen.queryByTestId("autocomplete-menu")).toBeNull();
  });

  it("closes the menu when typing narrows matches to one", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}"); // Open menu with help, history.
    await user.type(input, "e"); // "he" -> only 'help' matches.

    expect(screen.queryByTestId("autocomplete-menu")).toBeNull();
  });

  it("resets the highlight to the first item after typing re-opens the menu", async () => {
    const { user } = renderInput();
    const input = getInput();

    // Open the menu on 's' (matches skills, sudo) and advance the highlight.
    await user.click(input);
    await user.type(input, "s");
    await user.keyboard("{Tab}"); // skills highlighted
    await user.keyboard("{ArrowDown}"); // sudo highlighted

    // Clear input so the menu closes, then re-open it.
    await user.keyboard("{Backspace}");
    expect(screen.queryByTestId("autocomplete-menu")).toBeNull();

    await user.type(input, "s");
    await user.keyboard("{Tab}");

    const selected = document.querySelector("[data-testid='menu-item'][data-selected='true']");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("skills");
  });
});

// ---------------------------------------------------------------------------
// Menu mouse interaction
// ---------------------------------------------------------------------------
describe("TerminalInput - menu mouse interaction", () => {
  it("clicking a menu item sets the input value to that command's name", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    const items = screen.getAllByTestId("menu-item");
    const historyItem = items.find((item) => item.textContent?.includes("history"));
    expect(historyItem).toBeDefined();

    await user.click(historyItem!);

    expect(input.value).toBe("history");
  });

  it("clicking a menu item closes the menu", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    const items = screen.getAllByTestId("menu-item");
    await user.click(items[0]);

    expect(screen.queryByTestId("autocomplete-menu")).toBeNull();
  });

  it("clicking a menu item keeps focus on the input", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");

    const items = screen.getAllByTestId("menu-item");
    await user.click(items[0]);

    expect(getInput()).toHaveFocus();
  });
});

// ---------------------------------------------------------------------------
// Menu reset on Ctrl+C and Ctrl+L
// ---------------------------------------------------------------------------
describe("TerminalInput - menu reset on Ctrl+C and Ctrl+L", () => {
  it("Ctrl+C closes the menu in addition to clearing the input", async () => {
    const { user } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");
    await user.keyboard("{Control>}c{/Control}");

    expect(input.value).toBe("");
    expect(screen.queryByTestId("autocomplete-menu")).toBeNull();
  });

  it("Ctrl+L closes the menu in addition to calling onClear", async () => {
    const { user, props } = renderInput();
    const input = getInput();

    await user.click(input);
    await user.type(input, "h");
    await user.keyboard("{Tab}");
    await user.keyboard("{Control>}l{/Control}");

    expect(props.onClear).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("autocomplete-menu")).toBeNull();
  });
});
