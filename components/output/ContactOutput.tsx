import { LINKS } from "@/lib/constants";

export function ContactOutput() {
  return (
    <div>
      <div className="text-ctp-mauve mb-2">Contact</div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-4">
          <span className="text-ctp-peach w-20 shrink-0">Email</span>
          <a
            href={`mailto:${LINKS.email}`}
            className="text-ctp-blue hover:text-ctp-lavender hover:underline"
          >
            {LINKS.email}
          </a>
        </div>
        <div className="flex gap-4">
          <span className="text-ctp-peach w-20 shrink-0">LinkedIn</span>
          <a
            href={LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ctp-blue hover:text-ctp-lavender hover:underline"
          >
            linkedin.com/in/sipesdev
          </a>
        </div>
        <div className="flex gap-4">
          <span className="text-ctp-peach w-20 shrink-0">GitHub</span>
          <a
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ctp-blue hover:text-ctp-lavender hover:underline"
          >
            github.com/sipesdev
          </a>
        </div>
      </div>
    </div>
  );
}
