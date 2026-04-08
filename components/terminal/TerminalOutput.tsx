import type { ReactNode } from "react";

interface TerminalOutputProps {
  children: ReactNode;
}

export function TerminalOutput({ children }: TerminalOutputProps) {
  if (!children) return null;
  return (
    <div className="whitespace-pre-wrap break-words py-1" aria-live="polite">
      {children}
    </div>
  );
}
