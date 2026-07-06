import { USER } from "@/lib/constants";

export function PromptPrefix() {
  return (
    <span className="shrink-0 whitespace-pre" aria-hidden="true">
      <span className="text-mb-accent">{USER.shortName}</span>
      <span className="text-mb-text">@</span>
      <span className="text-mb-accent">{USER.hostname}</span>
      <span className="text-mb-blue">{":~$ "}</span>
    </span>
  );
}
