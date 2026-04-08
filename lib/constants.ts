import type { Project } from "./types";

export const USER = {
  name: "Michael Sipes Jr",
  shortName: "michael",
  hostname: "sipes.dev",
  bio: "A passionate full-stack engineer that specializes in building scalable software applications.",
  profileImage: "/profile-picture.jpg",
};

export const LINKS = {
  github: "https://github.com/sipesdev",
  linkedin: "https://www.linkedin.com/in/sipesdev/",
  email: "michael@sipes.dev",
};

export const GITHUB_BADGES = ["Public Sponsor", "Pull Shark"];

export const PROJECTS: Project[] = [
  {
    name: "PHIRedaction",
    description: "PHI redaction tooling",
    languages: ["TypeScript", "C#"],
    url: "https://github.com/sipesdev/PHIRedaction",
  },
  {
    name: "OpenMediaDownloaderSolution",
    description: "Media downloader solution",
    languages: ["C#"],
    url: "https://github.com/sipesdev/OpenMediaDownloaderSolution",
  },
];

export const SKILLS = {
  Languages: ["C#", "Python", "TypeScript", "Javascript", "PHP", "HTML5/CSS3", "Swift", "Bash", "PowerShell"],
  Databases: ["Azure SQL Server", "Microsoft SQL Server", "MySQL", "SQLite", "Cosmos DB", "NoSQL"],
  Frameworks: [".NET", "Blazor", "Dotnet MAUI", "React", "Next.js", "Composer", "Yii2", "jQuery", "Android SDK", "Jupyter"],
  Cloud: ["Microsoft Azure", "Azure Data Factory", "Azure DevOps", "AWS", "Docker", "Microsoft Fabric", "Databricks"],
  DevOps: ["Git", "GitHub Actions", "XUnit", "Vitest", "Azure DevOps Pipelines"],
  Artificial_Intelligence: ["Azure OpenAI", "OpenAI SDK", "Claude", "RAG Pipelines", "TensorFlow", "PyTorch", "Model Context Protocol (MCP)"],
};

export const ASCII_BANNER = `
 ███████╗██╗██████╗ ███████╗███████╗██████╗ ███████╗██╗   ██╗
 ██╔════╝██║██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝██║   ██║
 ███████╗██║██████╔╝█████╗  ███████╗██║  ██║█████╗  ██║   ██║
 ╚════██║██║██╔═══╝ ██╔══╝  ╚════██║██║  ██║██╔══╝  ╚██╗ ██╔╝
 ███████║██║██║     ███████╗███████║██████╔╝███████╗ ╚████╔╝
 ╚══════╝╚═╝╚═╝     ╚══════╝╚══════╝╚═════╝ ╚══════╝  ╚═══╝`;
