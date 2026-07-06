/**
 * Integration tests for the `blog` command routed through the real registry
 * (executeCommand). Importing @/lib/registerCommands populates the registry.
 */
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import "@/lib/registerCommands";
import { executeCommand, getCommandNames } from "@/lib/commands";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("blog command", () => {
  it("is registered so it appears in help", () => {
    expect(getCommandNames()).toContain("blog");
  });

  it("'blog' with no args renders the post list", () => {
    render(<>{executeCommand("blog")}</>);
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Docking an RTX 3080 Ti/ })
    ).toBeInTheDocument();
  });

  it("'blog oculink-egpu' renders that post inline", () => {
    const { container } = render(<>{executeCommand("blog oculink-egpu")}</>);
    expect(container.textContent).toContain("expansion bay");
  });

  it("'blog <unknown>' renders a not-found message", () => {
    render(<>{executeCommand("blog nope-not-real")}</>);
    expect(screen.getByText(/no post with slug/)).toBeInTheDocument();
  });
});
