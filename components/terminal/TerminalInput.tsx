"use client";

import { forwardRef, useState, useCallback } from "react";
import { PromptPrefix } from "./PromptPrefix";
import { getMatchingCommands } from "@/lib/commands";

interface TerminalInputProps {
  onSubmit: (input: string) => void;
  commandHistory: string[];
  historyIndex: number;
  onHistoryIndexChange: (index: number) => void;
  onClear: () => void;
}

export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  function TerminalInput(
    { onSubmit, commandHistory, historyIndex, onHistoryIndexChange, onClear },
    ref
  ) {
    const [value, setValue] = useState("");
    const [tabIndex, setTabIndex] = useState(-1);
    const [tabMatches, setTabMatches] = useState<string[]>([]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSubmit(value);
          setValue("");
          setTabIndex(-1);
          setTabMatches([]);
          return;
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (commandHistory.length === 0) return;
          const newIndex =
            historyIndex === -1
              ? commandHistory.length - 1
              : Math.max(0, historyIndex - 1);
          onHistoryIndexChange(newIndex);
          setValue(commandHistory[newIndex]);
          return;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (historyIndex === -1) return;
          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
            onHistoryIndexChange(-1);
            setValue("");
          } else {
            onHistoryIndexChange(newIndex);
            setValue(commandHistory[newIndex]);
          }
          return;
        }

        if (e.key === "Tab") {
          e.preventDefault();
          const currentInput = value.trim();
          if (!currentInput) return;

          let matches = tabMatches;
          let currentTabIndex = tabIndex;

          if (currentTabIndex === -1 || matches.length === 0) {
            matches = getMatchingCommands(currentInput);
            setTabMatches(matches);
            currentTabIndex = -1;
          }

          if (matches.length === 0) return;

          const nextIndex = (currentTabIndex + 1) % matches.length;
          setTabIndex(nextIndex);
          setValue(matches[nextIndex]);
          return;
        }

        if (e.key === "l" && e.ctrlKey) {
          e.preventDefault();
          onClear();
          return;
        }

        if (e.key === "c" && e.ctrlKey) {
          e.preventDefault();
          setValue("");
          setTabIndex(-1);
          setTabMatches([]);
          return;
        }

        // Reset tab completion on any other key
        setTabIndex(-1);
        setTabMatches([]);
      },
      [
        value,
        onSubmit,
        commandHistory,
        historyIndex,
        onHistoryIndexChange,
        onClear,
        tabIndex,
        tabMatches,
      ]
    );

    return (
      <div className="flex items-center">
        <PromptPrefix />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-ctp-text caret-ctp-green outline-none min-w-0 text-base"
          aria-label="Terminal command input"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    );
  }
);
