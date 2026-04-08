import Image from "next/image";
import { USER, LINKS } from "@/lib/constants";

export function AboutOutput() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <Image
          src={USER.profileImage}
          alt={USER.name}
          width={120}
          height={120}
          className="rounded-lg"
        />
        <div className="flex flex-col gap-1">
          <div className="text-ctp-mauve text-lg">{USER.name}</div>
          <div className="text-ctp-text">{USER.bio}</div>
        </div>
      </div>
      <div className="flex flex-col gap-1 mt-1">
        <a
          href={LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ctp-blue hover:text-ctp-lavender hover:underline"
        >
          github.com/sipesdev
        </a>
        <a
          href={LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ctp-blue hover:text-ctp-lavender hover:underline"
        >
          linkedin.com/in/sipesdev
        </a>
        <a
          href={`mailto:${LINKS.email}`}
          className="text-ctp-blue hover:text-ctp-lavender hover:underline"
        >
          {LINKS.email}
        </a>
      </div>
    </div>
  );
}
