import { registerCommand } from "./commands";
import { HelpOutput } from "@/components/output/HelpOutput";
import { AboutOutput } from "@/components/output/AboutOutput";
import { ProjectsOutput } from "@/components/output/ProjectsOutput";
import { ContactOutput } from "@/components/output/ContactOutput";
import { SkillsOutput } from "@/components/output/SkillsOutput";
import { WelcomeBanner } from "@/components/output/WelcomeBanner";
import { BlogOutput } from "@/components/output/BlogOutput";
import { BlogPostOutput } from "@/components/output/BlogPostOutput";
import { GITHUB_BADGES, LINKS } from "./constants";

registerCommand({
  name: "help",
  description: "Show available commands",
  execute: () => <HelpOutput />,
});

registerCommand({
  name: "about",
  description: "Learn about me",
  execute: () => <AboutOutput />,
});

registerCommand({
  name: "projects",
  description: "View my projects",
  execute: () => <ProjectsOutput />,
});

registerCommand({
  name: "blog",
  description: "Read my blog posts",
  usage: "blog [slug]",
  execute: (args) =>
    args[0] ? <BlogPostOutput slug={args[0]} /> : <BlogOutput />,
});

registerCommand({
  name: "contact",
  description: "Get in touch",
  execute: () => <ContactOutput />,
});

registerCommand({
  name: "skills",
  description: "View my tech stack",
  execute: () => <SkillsOutput />,
});

registerCommand({
  name: "github",
  description: "View GitHub profile & badges",
  execute: () => (
    <div>
      <div className="text-mb-accent mb-2">GitHub Profile</div>
      <a
        href={LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
        className="text-mb-blue hover:text-mb-blue-bright hover:underline"
      >
        github.com/sipesdev
      </a>
      <div className="mt-2 text-mb-subtext0">Badges:</div>
      <div className="flex gap-2 mt-1">
        {GITHUB_BADGES.map((badge) => (
          <span
            key={badge}
            className="px-2 py-0.5 text-sm rounded bg-mb-surface0 text-mb-accent2"
          >
            {badge}
          </span>
        ))}
      </div>
      <div className="mt-2 text-mb-overlay1">
        Run &apos;projects&apos; for repository details.
      </div>
    </div>
  ),
});

registerCommand({
  name: "banner",
  description: "Show the welcome banner",
  execute: () => <WelcomeBanner />,
});

registerCommand({
  name: "echo",
  description: "Echo text back",
  usage: "echo <text>",
  execute: (args) => args.join(" ") || "",
});

registerCommand({
  name: "whoami",
  description: "Print current user",
  execute: () => "michael",
});

registerCommand({
  name: "date",
  description: "Print current date/time",
  execute: () => new Date().toString(),
});

registerCommand({
  name: "ls",
  description: "List available sections",
  execute: () => (
    <div className="flex flex-wrap gap-4">
      {["about", "projects", "contact", "skills", "github"].map((item) => (
        <span key={item} className="text-mb-blue">
          {item}
        </span>
      ))}
    </div>
  ),
});

registerCommand({
  name: "sudo",
  description: "Nice try...",
  execute: () => (
    <span className="text-mb-danger">
      [sudo] password for michael: Nice try! This incident will be reported.
    </span>
  ),
});

// These are handled specially in Terminal.tsx but registered here
// so they appear in the help output
registerCommand({
  name: "clear",
  description: "Clear the terminal",
  execute: () => null,
});

registerCommand({
  name: "history",
  description: "Show command history",
  execute: () => null,
});
