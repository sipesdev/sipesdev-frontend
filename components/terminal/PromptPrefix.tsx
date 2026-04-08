import { USER } from "@/lib/constants";

export function PromptPrefix() {
  return (
    <span className="shrink-0 whitespace-pre" aria-hidden="true">
      <span className="text-ctp-green">{USER.shortName}</span>
      <span className="text-ctp-text">@</span>
      <span className="text-ctp-green">{USER.hostname}</span>
      <span className="text-ctp-blue">{":~$ "}</span>
    </span>
  );
}
