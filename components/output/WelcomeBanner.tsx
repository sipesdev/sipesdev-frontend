"use client";

import { ASCII_BANNER, USER } from "@/lib/constants";

interface WelcomeBannerProps {
  onCommand?: (command: string) => void;
}

export function WelcomeBanner({ onCommand }: WelcomeBannerProps) {
  const suggestions = ["about", "projects", "skills", "contact", "help"];

  return (
    <div>
      <pre className="text-ctp-mauve text-[0.6rem] sm:text-sm leading-tight overflow-x-auto">
        {ASCII_BANNER}
      </pre>
      <div className="mt-3 text-ctp-text">
        Welcome! I&apos;m {USER.name}. {USER.bio}
      </div>
      <div className="mt-1 text-ctp-subtext0">
        Type{" "}
        <span className="text-ctp-green">&apos;help&apos;</span> to see
        available commands.
      </div>
      {onCommand && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((cmd) => (
            <button
              key={cmd}
              onClick={() => onCommand(cmd)}
              className="px-3 py-1 text-sm rounded border border-ctp-surface1 text-ctp-blue hover:bg-ctp-surface0 hover:text-ctp-lavender transition-colors cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
