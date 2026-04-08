import { PROJECTS } from "@/lib/constants";

export function ProjectsOutput() {
  const nameWidth = Math.max(...PROJECTS.map((p) => p.name.length));
  const langWidth = Math.max(
    ...PROJECTS.map((p) => p.languages.join(", ").length)
  );

  return (
    <div>
      <div className="text-ctp-mauve mb-2">Projects</div>
      <div className="flex gap-4 mb-1 text-ctp-subtext0">
        <span style={{ width: `${nameWidth}ch` }} className="shrink-0">
          NAME
        </span>
        <span style={{ width: `${langWidth}ch` }} className="shrink-0">
          LANGUAGE
        </span>
        <span>DESCRIPTION</span>
      </div>
      <div className="text-ctp-surface2 mb-1">
        {"─".repeat(nameWidth + langWidth + 30)}
      </div>
      {PROJECTS.map((project) => (
        <div key={project.name} className="flex gap-4">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ctp-green hover:text-ctp-teal hover:underline shrink-0"
            style={{ width: `${nameWidth}ch` }}
          >
            {project.name}
          </a>
          <span
            className="text-ctp-yellow shrink-0"
            style={{ width: `${langWidth}ch` }}
          >
            {project.languages.join(", ")}
          </span>
          <span className="text-ctp-subtext1">{project.description}</span>
        </div>
      ))}
    </div>
  );
}
