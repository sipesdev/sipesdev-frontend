"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { HistoryEntry } from "@/lib/types";
import { executeCommand } from "@/lib/commands";
import { TerminalHistory } from "./TerminalHistory";
import { TerminalInput } from "./TerminalInput";
import { WelcomeBanner } from "@/components/output/WelcomeBanner";

import "@/lib/registerCommands";

export function Terminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const commandHistoryRef = useRef(commandHistory);
  commandHistoryRef.current = commandHistory;

  const processCommand = useCallback((input: string) => {
    const trimmed = input.trim();
    const lower = trimmed.toLowerCase();

    if (lower === "clear") {
      setHistory([]);
    } else if (lower === "history") {
      const historyOutput = commandHistoryRef.current
        .map((cmd, i) => `  ${i + 1}  ${cmd}`)
        .join("\n");
      setHistory((prev) => [
        ...prev,
        {
          id: nextId.current++,
          input: trimmed,
          output: historyOutput || "No commands in history.",
        },
      ]);
    } else {
      const output = executeCommand(input);
      setHistory((prev) => [
        ...prev,
        { id: nextId.current++, input: trimmed, output },
      ]);
    }

    if (trimmed) {
      setCommandHistory((prev) => [...prev, trimmed]);
    }
    setHistoryIndex(-1);
  }, []);

  useEffect(() => {
    setHistory([
      {
        id: nextId.current++,
        input: "",
        output: <WelcomeBanner onCommand={processCommand} />,
      },
    ]);
  }, [processCommand]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleClear = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div
      className="h-dvh overflow-y-auto bg-ctp-base p-4 text-sm sm:text-base"
      onClick={focusInput}
    >
      <TerminalHistory history={history} />
      <TerminalInput
        ref={inputRef}
        onSubmit={processCommand}
        commandHistory={commandHistory}
        historyIndex={historyIndex}
        onHistoryIndexChange={setHistoryIndex}
        onClear={handleClear}
      />
      <div ref={scrollRef} />
    </div>
  );
}
