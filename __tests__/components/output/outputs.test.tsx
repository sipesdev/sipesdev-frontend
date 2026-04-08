/**
 * Tests for all output components used by the terminal.
 *
 * Each output component is rendered in isolation and asserted against the
 * real data from lib/constants.ts. No mocking of data -- we test with the
 * actual content the user will see in production.
 *
 * Components that depend on the command registry (HelpOutput) require
 * the side-effect import of "@/lib/registerCommands" to populate the map.
 *
 * next/image is mocked as a plain <img> for the AboutOutput component.
 */

// Side-effect import: populates the command registry for HelpOutput
import "@/lib/registerCommands";

import { render, screen } from "@testing-library/react";
import { WelcomeBanner } from "@/components/output/WelcomeBanner";
import { HelpOutput } from "@/components/output/HelpOutput";
import { AboutOutput } from "@/components/output/AboutOutput";
import { ProjectsOutput } from "@/components/output/ProjectsOutput";
import { ContactOutput } from "@/components/output/ContactOutput";
import { SkillsOutput } from "@/components/output/SkillsOutput";
import { ASCII_BANNER, USER, LINKS, PROJECTS, SKILLS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Mock next/image -- Next.js image component is not available in jsdom.
// ---------------------------------------------------------------------------
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} />;
  },
}));

// ===========================================================================
// WelcomeBanner
// ===========================================================================
describe("WelcomeBanner", () => {
  it("renders the ASCII banner art in a <pre> element", () => {
    render(<WelcomeBanner />);

    const preElement = document.querySelector("pre");
    expect(preElement).not.toBeNull();
    // The pre should contain the ASCII art text content
    expect(preElement!.textContent).toContain(ASCII_BANNER);
  });

  it("renders the 'Welcome!' greeting with the user name", () => {
    render(<WelcomeBanner />);

    // The component renders: "Welcome! I'm {USER.name}. {USER.bio}"
    expect(screen.getByText(/Welcome!/)).toBeInTheDocument();
  });

  it("renders the user bio text 'I create things.'", () => {
    render(<WelcomeBanner />);

    expect(screen.getByText(/I create things\./)).toBeInTheDocument();
  });

  it("renders the help instruction text", () => {
    render(<WelcomeBanner />);

    expect(screen.getByText(/help/)).toBeInTheDocument();
    expect(screen.getByText(/available commands/i)).toBeInTheDocument();
  });

  it("renders suggestion buttons when onCommand prop is provided", () => {
    const mockOnCommand = vi.fn();
    render(<WelcomeBanner onCommand={mockOnCommand} />);

    const expectedSuggestions = ["about", "projects", "contact", "help"];
    for (const suggestion of expectedSuggestions) {
      expect(screen.getByRole("button", { name: suggestion })).toBeInTheDocument();
    }
  });

  it("does not render suggestion buttons when onCommand prop is omitted", () => {
    render(<WelcomeBanner />);

    // Without onCommand, no buttons should be rendered
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("calls onCommand with the correct command when a suggestion is clicked", async () => {
    const mockOnCommand = vi.fn();
    render(<WelcomeBanner onCommand={mockOnCommand} />);

    const aboutButton = screen.getByRole("button", { name: "about" });
    aboutButton.click();

    expect(mockOnCommand).toHaveBeenCalledTimes(1);
    expect(mockOnCommand).toHaveBeenCalledWith("about");
  });
});

// ===========================================================================
// HelpOutput
// ===========================================================================
describe("HelpOutput", () => {
  it("renders the 'Available commands:' heading", () => {
    render(<HelpOutput />);

    expect(screen.getByText("Available commands:")).toBeInTheDocument();
  });

  it("renders all registered command names", () => {
    render(<HelpOutput />);

    const expectedCommands = [
      "about",
      "help",
      "projects",
      "contact",
      "skills",
      "github",
      "banner",
      "echo",
      "whoami",
      "date",
      "ls",
      "sudo",
      "clear",
      "history",
    ];

    for (const cmd of expectedCommands) {
      expect(screen.getByText(cmd)).toBeInTheDocument();
    }
  });

  it("renders descriptions for each command", () => {
    render(<HelpOutput />);

    // Spot-check a few descriptions from registerCommands.tsx
    expect(screen.getByText(/Show available commands/)).toBeInTheDocument();
    expect(screen.getByText(/Learn about me/)).toBeInTheDocument();
    expect(screen.getByText(/View my projects/)).toBeInTheDocument();
  });

  it("renders usage hints for commands that have them", () => {
    render(<HelpOutput />);

    // 'echo' has usage: "echo <text>"
    expect(screen.getByText(/echo <text>/)).toBeInTheDocument();
  });
});

// ===========================================================================
// AboutOutput
// ===========================================================================
describe("AboutOutput", () => {
  it("renders the user name 'Michael Sipes'", () => {
    render(<AboutOutput />);

    expect(screen.getByText(USER.name)).toBeInTheDocument();
  });

  it("renders the user bio 'I create things.'", () => {
    render(<AboutOutput />);

    expect(screen.getByText(USER.bio)).toBeInTheDocument();
  });

  it("renders the profile image with correct src and alt", () => {
    render(<AboutOutput />);

    const image = screen.getByAltText(USER.name) as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toContain(USER.profileImage);
  });

  it("renders a link to the GitHub profile", () => {
    render(<AboutOutput />);

    const githubLink = screen.getByText("github.com/sipesdev") as HTMLAnchorElement;
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.href).toBe(LINKS.github);
    expect(githubLink.target).toBe("_blank");
  });

  it("renders a link to the LinkedIn profile", () => {
    render(<AboutOutput />);

    const linkedinLink = screen.getByText("linkedin.com/in/sipesdev") as HTMLAnchorElement;
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink.href).toBe(LINKS.linkedin);
    expect(linkedinLink.target).toBe("_blank");
  });

  it("renders a mailto link for email", () => {
    render(<AboutOutput />);

    const emailLink = screen.getByText(LINKS.email) as HTMLAnchorElement;
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.href).toBe(`mailto:${LINKS.email}`);
  });
});

// ===========================================================================
// ProjectsOutput
// ===========================================================================
describe("ProjectsOutput", () => {
  it("renders the 'Projects' heading", () => {
    render(<ProjectsOutput />);

    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders column headers: NAME, LANGUAGE, DESCRIPTION", () => {
    render(<ProjectsOutput />);

    expect(screen.getByText("NAME")).toBeInTheDocument();
    expect(screen.getByText("LANGUAGE")).toBeInTheDocument();
    expect(screen.getByText("DESCRIPTION")).toBeInTheDocument();
  });

  it("renders all project names as links", () => {
    render(<ProjectsOutput />);

    for (const project of PROJECTS) {
      const link = screen.getByText(project.name) as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(project.url);
    }
  });

  it("renders project descriptions", () => {
    render(<ProjectsOutput />);

    for (const project of PROJECTS) {
      expect(screen.getByText(project.description)).toBeInTheDocument();
    }
  });

  it("renders language tags for each project", () => {
    render(<ProjectsOutput />);

    // Each project's languages are joined with ", "
    for (const project of PROJECTS) {
      const languageString = project.languages.join(", ");
      expect(screen.getByText(languageString)).toBeInTheDocument();
    }
  });

  it("renders the specific project names from constants", () => {
    render(<ProjectsOutput />);

    for (const project of PROJECTS) {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    }
  });
});

// ===========================================================================
// ContactOutput
// ===========================================================================
describe("ContactOutput", () => {
  it("renders the 'Contact' heading", () => {
    render(<ContactOutput />);

    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders the 'Email' label", () => {
    render(<ContactOutput />);

    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders the 'LinkedIn' label", () => {
    render(<ContactOutput />);

    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });

  it("renders the 'GitHub' label", () => {
    render(<ContactOutput />);

    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("renders a mailto link with the correct email address", () => {
    render(<ContactOutput />);

    const emailLink = screen.getByText(LINKS.email) as HTMLAnchorElement;
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.href).toBe(`mailto:${LINKS.email}`);
  });

  it("renders a link to the LinkedIn profile with correct URL", () => {
    render(<ContactOutput />);

    const linkedinLink = screen.getByText("linkedin.com/in/sipesdev") as HTMLAnchorElement;
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink.href).toBe(LINKS.linkedin);
  });

  it("renders a link to the GitHub profile with correct URL", () => {
    render(<ContactOutput />);

    const githubLink = screen.getByText("github.com/sipesdev") as HTMLAnchorElement;
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.href).toBe(LINKS.github);
  });

  it("opens LinkedIn and GitHub links in a new tab", () => {
    render(<ContactOutput />);

    const linkedinLink = screen.getByText("linkedin.com/in/sipesdev") as HTMLAnchorElement;
    expect(linkedinLink.target).toBe("_blank");
    expect(linkedinLink.rel).toContain("noopener");

    const githubLink = screen.getByText("github.com/sipesdev") as HTMLAnchorElement;
    expect(githubLink.target).toBe("_blank");
    expect(githubLink.rel).toContain("noopener");
  });
});

// ===========================================================================
// SkillsOutput
// ===========================================================================
describe("SkillsOutput", () => {
  it("renders the 'Skills' heading", () => {
    render(<SkillsOutput />);

    expect(screen.getByText("Skills")).toBeInTheDocument();
  });

  it("renders all skill category names", () => {
    render(<SkillsOutput />);

    for (const category of Object.keys(SKILLS)) {
      const label = category.replace(/_/g, " ");
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders individual skill items for Languages", () => {
    render(<SkillsOutput />);

    for (const skill of SKILLS.Languages) {
      expect(screen.getByText(skill)).toBeInTheDocument();
    }
  });

  it("renders individual skill items for Frameworks", () => {
    render(<SkillsOutput />);

    for (const skill of SKILLS.Frameworks) {
      expect(screen.getByText(skill)).toBeInTheDocument();
    }
  });

  it("renders individual skill items for DevOps", () => {
    render(<SkillsOutput />);

    for (const skill of SKILLS.DevOps) {
      expect(screen.getByText(skill)).toBeInTheDocument();
    }
  });

  it("renders pipe separators between skills within a category", () => {
    const { container } = render(<SkillsOutput />);

    // The SkillsOutput component renders " | " as separators
    expect(container.textContent).toContain("|");
  });
});
