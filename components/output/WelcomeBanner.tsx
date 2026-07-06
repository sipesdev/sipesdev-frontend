"use client";

import { ASCII_BANNER, USER } from "@/lib/constants";

interface WelcomeBannerProps {
  onCommand?: (command: string) => void;
}

export function WelcomeBanner({ onCommand }: WelcomeBannerProps) {
  const suggestions = ["about", "projects", "blog", "skills", "contact", "help"];

  return (
    <div>
      <pre className="text-mb-accent text-[0.375rem] sm:text-sm leading-tight overflow-x-auto">
        {ASCII_BANNER}
      </pre>
      <div className="mt-3 text-mb-text">
        Welcome! I&apos;m {USER.name}. {USER.bio}
      </div>
      <div className="mt-1 text-mb-subtext0">
        Type{" "}
        <span className="text-mb-accent">&apos;help&apos;</span> to see
        available commands.
      </div>
      {onCommand && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((cmd) => (
            <button
              key={cmd}
              onClick={() => onCommand(cmd)}
              className="px-3 py-1 text-sm rounded border border-mb-surface1 text-mb-blue hover:bg-mb-surface0 hover:text-mb-blue-bright transition-colors cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
