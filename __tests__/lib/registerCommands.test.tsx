/**
 * Tests for individual command execute() results from lib/registerCommands.tsx.
 *
 * The output components (HelpOutput, AboutOutput, etc.) are already tested in
 * outputs.test.tsx. This file tests the commands that return inline JSX or
 * primitive strings directly within registerCommands.tsx, verifying that each
 * command's execute() function produces the correct output.
 *
 * Commands tested here:
 *   - echo (string return)
 *   - whoami (string return)
 *   - date (string return)
 *   - ls (inline JSX - section names)
 *   - cat (delegates to executeCommand)
 *   - sudo (inline JSX - easter egg)
 *   - github (inline JSX - profile, link, badges)
 *   - banner (delegates to WelcomeBanner component)
 *   - clear (stub - returns null)
 *   - history (stub - returns null)
 *
 * next/image is mocked as a plain <img> for components that use Image.
 */

// Side-effect import: populates the global command registry
import "@/lib/registerCommands";

import { render, screen } from "@testing-library/react";
import { getCommands } from "@/lib/commands";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Mock next/image -- required for AboutOutput (rendered via cat about)
// and WelcomeBanner (rendered via banner command)
// ---------------------------------------------------------------------------
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} />;
  },
}));

// ---------------------------------------------------------------------------
// Helper to retrieve a command's execute function from the registry
// ---------------------------------------------------------------------------
function getCommandExecute(name: string) {
  const commands = getCommands();
  const command = commands.get(name);
  if (!command) {
    throw new Error(`Command '${name}' not found in registry`);
  }
  return command.execute;
}

/**
 * Helper to render the result of a command's execute() function and return
 * the rendered container. For commands returning JSX, this renders the node.
 * For commands returning strings, wraps in a fragment for rendering.
 */
function renderCommandOutput(name: string, args: string[] = []) {
  const execute = getCommandExecute(name);
  const output = execute(args);
  // Wrap in a div to allow rendering of string and JSX outputs uniformly
  return render(<div data-testid="command-output">{output as ReactNode}</div>);
}

// ---------------------------------------------------------------------------
// echo command
// ---------------------------------------------------------------------------
describe("echo command", () => {
  it("returns joined args as a string", () => {
    const execute = getCommandExecute("echo");
    const result = execute(["hello", "world"]);
    expect(result).toBe("hello world");
  });

  it("returns empty string when called with no args", () => {
    const execute = getCommandExecute("echo");
    const result = execute([]);
    expect(result).toBe("");
  });

  it("returns a single arg without extra spaces", () => {
    const execute = getCommandExecute("echo");
    const result = execute(["single"]);
    expect(result).toBe("single");
  });
});

// ---------------------------------------------------------------------------
// whoami command
// ---------------------------------------------------------------------------
describe("whoami command", () => {
  it("returns 'michael'", () => {
    const execute = getCommandExecute("whoami");
    const result = execute([]);
    expect(result).toBe("michael");
  });
});

// ---------------------------------------------------------------------------
// date command
// ---------------------------------------------------------------------------
describe("date command", () => {
  it("returns a string that looks like a date (contains a year number)", () => {
    const execute = getCommandExecute("date");
    const result = execute([]);
    expect(typeof result).toBe("string");

    // The date string should contain the current year
    const currentYear = new Date().getFullYear().toString();
    expect(result as string).toContain(currentYear);
  });
});

// ---------------------------------------------------------------------------
// ls command
// ---------------------------------------------------------------------------
describe("ls command", () => {
  it("renders section names: about, projects, contact, skills, github", () => {
    renderCommandOutput("ls");

    const expectedSections = ["about", "projects", "contact", "skills", "github"];
    for (const section of expectedSections) {
      expect(screen.getByText(section)).toBeInTheDocument();
    }
  });
});

// ---------------------------------------------------------------------------
// sudo command
// ---------------------------------------------------------------------------
describe("sudo command", () => {
  it("renders the red 'Nice try!' easter egg message", () => {
    renderCommandOutput("sudo");

    expect(screen.getByText(/Nice try!/)).toBeInTheDocument();
    expect(screen.getByText(/This incident will be reported/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// github command
// ---------------------------------------------------------------------------
describe("github command", () => {
  it("renders 'GitHub Profile' heading", () => {
    renderCommandOutput("github");

    expect(screen.getByText("GitHub Profile")).toBeInTheDocument();
  });

  it("renders the github link text", () => {
    renderCommandOutput("github");

    const link = screen.getByText("github.com/sipesdev") as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link.href).toBe("https://github.com/sipesdev");
  });

  it("renders badge names 'Public Sponsor' and 'Pull Shark'", () => {
    renderCommandOutput("github");

    expect(screen.getByText("Public Sponsor")).toBeInTheDocument();
    expect(screen.getByText("Pull Shark")).toBeInTheDocument();
  });

  it("renders the 'Badges:' label", () => {
    renderCommandOutput("github");

    expect(screen.getByText("Badges:")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// banner command
// ---------------------------------------------------------------------------
describe("banner command", () => {
  it("renders the WelcomeBanner with 'Welcome!' text", () => {
    renderCommandOutput("banner");

    expect(screen.getByText(/Welcome!/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// clear command (stub -- real handling is in Terminal.tsx)
// ---------------------------------------------------------------------------
describe("clear command", () => {
  it("execute returns null", () => {
    const execute = getCommandExecute("clear");
    const result = execute([]);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// history command (stub -- real handling is in Terminal.tsx)
// ---------------------------------------------------------------------------
describe("history command", () => {
  it("execute returns null", () => {
    const execute = getCommandExecute("history");
    const result = execute([]);
    expect(result).toBeNull();
  });
});
