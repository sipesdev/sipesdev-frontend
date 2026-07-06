/**
 * Tests for BlogPostOutput — a single post rendered inline in the terminal,
 * including its shareable link and the unknown-slug error path.
 */
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { BlogPostOutput } from "@/components/output/BlogPostOutput";
import { getPost } from "@/lib/blog";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("BlogPostOutput", () => {
  it("renders a known post's title, markdown body, and shareable link", () => {
    const { container } = render(<BlogPostOutput slug="oculink-egpu" />);
    const post = getPost("oculink-egpu")!;

    expect(screen.getByText(post.title)).toBeInTheDocument();
    // Body is rendered through react-markdown (PostBody).
    expect(container.textContent).toContain("expansion bay");
    expect(container.textContent).toContain("OCuLink");
    // Date is displayed American MM-DD-YYYY, not ISO.
    expect(container.textContent).toContain("07-06-2026");

    const link = screen.getByRole("link", {
      name: "https://sipes.dev/blog/oculink-egpu",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://sipes.dev/blog/oculink-egpu"
    );
  });

  it("renders the post body as real HTML elements (headings, images)", () => {
    const { container } = render(<BlogPostOutput slug="oculink-egpu" />);
    expect(container.querySelectorAll("h2").length).toBeGreaterThan(0);
    expect(container.querySelectorAll("img").length).toBeGreaterThan(0);
  });

  it("shows a not-found message for an unknown slug", () => {
    render(<BlogPostOutput slug="does-not-exist" />);
    expect(screen.getByText(/no post with slug/)).toBeInTheDocument();
  });
});
