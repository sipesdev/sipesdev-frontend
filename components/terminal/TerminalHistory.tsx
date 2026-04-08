import type { HistoryEntry } from "@/lib/types";
import { PromptPrefix } from "./PromptPrefix";
import { TerminalOutput } from "./TerminalOutput";

interface TerminalHistoryProps {
  history: HistoryEntry[];
}

export function TerminalHistory({ history }: TerminalHistoryProps) {
  return (
    <div className="flex flex-col" role="log" aria-label="Terminal output">
      {history.map((entry) => (
        <div key={entry.id}>
          {entry.input !== "" && (
            <div className="flex items-center">
              <PromptPrefix />
              <span className="text-ctp-text">{entry.input}</span>
            </div>
          )}
          <TerminalOutput>{entry.output}</TerminalOutput>
        </div>
      ))}
    </div>
  );
}
