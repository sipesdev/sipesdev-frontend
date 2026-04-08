/**
 * Unit tests for the PromptPrefix component at components/terminal/PromptPrefix.tsx.
 *
 * PromptPrefix renders the terminal prompt in the format: michael@sipes.dev:~$
 * It is purely presentational and reads USER.shortName and USER.hostname from
 * lib/constants.ts. The entire prefix is aria-hidden since it is decorative
 * for the terminal aesthetic.
 *
 * These tests verify each visual segment of the prompt and the accessibility
 * attribute.
 */

import { render, screen } from "@testing-library/react";
import { PromptPrefix } from "@/components/terminal/PromptPrefix";
import { USER } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Content rendering
// ---------------------------------------------------------------------------
describe("PromptPrefix - content", () => {
  it("renders the user short name from USER.shortName constant", () => {
    render(<PromptPrefix />);

    expect(screen.getByText(USER.shortName)).toBeInTheDocument();
  });

  it("renders the hostname from USER.hostname constant", () => {
    render(<PromptPrefix />);

    expect(screen.getByText(USER.hostname)).toBeInTheDocument();
  });

  it("renders the ':~$ ' path/prompt suffix", () => {
    const { container } = render(<PromptPrefix />);

    // RTL normalizes whitespace in getByText, so we check via DOM directly.
    // The fourth child span of the root contains ":~$ " with a trailing space.
    const outerSpan = container.firstChild as HTMLElement;
    const suffixSpan = outerSpan.children[3] as HTMLElement;
    expect(suffixSpan.textContent).toBe(":~$ ");
  });

  it("renders '@' separator between name and hostname", () => {
    render(<PromptPrefix />);

    expect(screen.getByText("@")).toBeInTheDocument();
  });

  it("renders all parts in the correct order: shortName @ hostname :~$", () => {
    const { container } = render(<PromptPrefix />);

    // The outer span contains four child spans in order
    const outerSpan = container.firstChild as HTMLElement;
    const parts = outerSpan.children;

    expect(parts).toHaveLength(4);
    expect(parts[0].textContent).toBe(USER.shortName);
    expect(parts[1].textContent).toBe("@");
    expect(parts[2].textContent).toBe(USER.hostname);
    expect(parts[3].textContent).toBe(":~$ ");
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------
describe("PromptPrefix - accessibility", () => {
  it("has aria-hidden='true' attribute on the root span", () => {
    const { container } = render(<PromptPrefix />);

    const rootSpan = container.firstChild as HTMLElement;
    expect(rootSpan).toHaveAttribute("aria-hidden", "true");
  });
});
