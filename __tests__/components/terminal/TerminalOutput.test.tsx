/**
 * Unit tests for the TerminalOutput component at components/terminal/TerminalOutput.tsx.
 *
 * TerminalOutput is a simple presentational wrapper that renders its children inside
 * a div with aria-live="polite" for screen reader announcements. It returns null
 * when children is falsy (null, undefined, empty string, 0, false).
 *
 * These tests verify the null-guard behavior, content rendering, and accessibility
 * attributes.
 */

import { render, screen } from "@testing-library/react";
import { TerminalOutput } from "@/components/terminal/TerminalOutput";

// ---------------------------------------------------------------------------
// Null/undefined children -- returns null (no DOM output)
// ---------------------------------------------------------------------------
describe("TerminalOutput - null guard", () => {
  it("returns null when children is null", () => {
    const { container } = render(<TerminalOutput>{null}</TerminalOutput>);

    // Component should render nothing -- no child elements in the container
    expect(container.firstChild).toBeNull();
  });

  it("returns null when children is undefined", () => {
    const { container } = render(<TerminalOutput>{undefined}</TerminalOutput>);

    expect(container.firstChild).toBeNull();
  });

  it("returns null when children is an empty string", () => {
    const { container } = render(<TerminalOutput>{""}</TerminalOutput>);

    // Empty string is falsy, so the !children guard returns null
    expect(container.firstChild).toBeNull();
  });

  it("returns null when children is false", () => {
    const { container } = render(<TerminalOutput>{false}</TerminalOutput>);

    expect(container.firstChild).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Valid children rendering
// ---------------------------------------------------------------------------
describe("TerminalOutput - rendering valid children", () => {
  it("renders string children", () => {
    render(<TerminalOutput>{"Hello, terminal!"}</TerminalOutput>);

    expect(screen.getByText("Hello, terminal!")).toBeInTheDocument();
  });

  it("renders JSX children", () => {
    render(
      <TerminalOutput>
        <span data-testid="jsx-child">JSX content here</span>
      </TerminalOutput>
    );

    expect(screen.getByTestId("jsx-child")).toBeInTheDocument();
    expect(screen.getByText("JSX content here")).toBeInTheDocument();
  });

  it("renders number children (0 is falsy and returns null, but non-zero renders)", () => {
    // Non-zero number should render
    render(<TerminalOutput>{42}</TerminalOutput>);

    expect(screen.getByText("42")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Accessibility attributes
// ---------------------------------------------------------------------------
describe("TerminalOutput - accessibility", () => {
  it("has aria-live='polite' attribute on the wrapper div", () => {
    render(<TerminalOutput>{"accessible content"}</TerminalOutput>);

    const outputDiv = screen.getByText("accessible content").closest("div");
    expect(outputDiv).toHaveAttribute("aria-live", "polite");
  });

  it("wraps content in a div element", () => {
    render(<TerminalOutput>{"wrapped content"}</TerminalOutput>);

    const element = screen.getByText("wrapped content");
    // The text is directly inside the div with aria-live
    expect(element.tagName).toBe("DIV");
  });
});
