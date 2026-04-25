"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
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
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuMatches, setMenuMatches] = useState<string[]>([]);
    const [menuIndex, setMenuIndex] = useState(0);
    // cursorAtEnd gates ghost rendering (cheap, allowed to lag a frame on caret moves).
    // ArrowRight acceptance reads selectionStart from the DOM directly to avoid acting on stale state.
    const [cursorAtEnd, setCursorAtEnd] = useState(true);
    const internalRef = useRef<HTMLInputElement>(null);

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref]
    );

    const ghostMatch = useMemo(() => {
      if (!value) return null;
      if (value !== value.toLowerCase()) return null;
      if (/\s/.test(value)) return null;
      if (!cursorAtEnd) return null;
      if (menuOpen) return null;
      const matches = getMatchingCommands(value);
      if (matches.length === 0) return null;
      const first = matches[0];
      if (first === value) return null;
      return first;
    }, [value, cursorAtEnd, menuOpen]);

    const ghostSuffix = ghostMatch ? ghostMatch.slice(value.length) : "";

    const closeMenu = useCallback(() => {
      setMenuOpen(false);
      setMenuMatches([]);
      setMenuIndex(0);
    }, []);

    const handleSelectionChange = useCallback(
      (e: React.SyntheticEvent<HTMLInputElement>) => {
        const t = e.currentTarget;
        setCursorAtEnd(
          t.selectionStart === t.value.length &&
            t.selectionEnd === t.value.length
        );
      },
      []
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        setCursorAtEnd(true);

        if (menuOpen) {
          const trimmed = newValue.trim();
          const matches = trimmed ? getMatchingCommands(trimmed) : [];
          if (matches.length < 2) {
            closeMenu();
          } else {
            setMenuMatches(matches);
            setMenuIndex(0);
          }
        }
      },
      [menuOpen, closeMenu]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (menuOpen) {
            const selected = menuMatches[menuIndex];
            if (selected !== undefined) {
              setValue(selected);
            }
            closeMenu();
            return;
          }
          onSubmit(value);
          setValue("");
          closeMenu();
          return;
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (menuOpen) {
            if (menuMatches.length === 0) return;
            setMenuIndex(
              (menuIndex - 1 + menuMatches.length) % menuMatches.length
            );
            return;
          }
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
          if (menuOpen) {
            if (menuMatches.length === 0) return;
            setMenuIndex((menuIndex + 1) % menuMatches.length);
            return;
          }
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

        if (e.key === "ArrowRight") {
          const input = internalRef.current;
          if (
            ghostMatch &&
            input &&
            input.selectionStart === value.length &&
            input.selectionEnd === value.length
          ) {
            e.preventDefault();
            setValue(ghostMatch);
          }
          return;
        }

        if (e.key === "Tab") {
          e.preventDefault();
          const trimmed = value.trim();
          if (!trimmed) return;

          if (menuOpen) {
            if (menuMatches.length === 0) return;
            const dir = e.shiftKey ? -1 : 1;
            setMenuIndex(
              (menuIndex + dir + menuMatches.length) % menuMatches.length
            );
            return;
          }

          const matches = getMatchingCommands(trimmed);
          if (matches.length === 0) return;
          if (matches.length === 1) {
            setValue(matches[0]);
            return;
          }
          setMenuMatches(matches);
          setMenuIndex(0);
          setMenuOpen(true);
          return;
        }

        if (e.key === "Escape") {
          if (menuOpen) {
            e.preventDefault();
            closeMenu();
          }
          return;
        }

        if (e.key === "l" && e.ctrlKey) {
          e.preventDefault();
          closeMenu();
          onClear();
          return;
        }

        if (e.key === "c" && e.ctrlKey) {
          e.preventDefault();
          setValue("");
          closeMenu();
          return;
        }
      },
      [
        value,
        onSubmit,
        commandHistory,
        historyIndex,
        onHistoryIndexChange,
        onClear,
        menuOpen,
        menuMatches,
        menuIndex,
        ghostMatch,
        closeMenu,
      ]
    );

    return (
      <div className="flex flex-col">
        <div className="flex items-center">
          <PromptPrefix />
          <input
            ref={setRefs}
            type="text"
            value={value}
            // Content-sized width so the ghost text sits flush after the typed
            // characters. Relies on JetBrains Mono being loaded (1ch == 1 glyph).
            style={{ width: `${Math.max(value.length, 1)}ch` }}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelectionChange}
            onClick={handleSelectionChange}
            className="bg-transparent text-ctp-text caret-ctp-green outline-none"
            aria-label="Terminal command input"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {ghostSuffix && !menuOpen && (
            <span
              data-testid="ghost-suffix"
              className="text-ctp-overlay1 whitespace-pre pointer-events-none"
              aria-hidden="true"
            >
              {ghostSuffix}
            </span>
          )}
        </div>
        {menuOpen && (
          <ul
            className="pl-2 list-none"
            data-testid="autocomplete-menu"
            aria-live="polite"
          >
            {menuMatches.map((cmd, i) => (
              <li
                key={cmd}
                data-testid="menu-item"
                data-selected={i === menuIndex ? "true" : "false"}
                className={
                  i === menuIndex
                    ? "text-ctp-mauve whitespace-pre"
                    : "text-ctp-subtext0 whitespace-pre"
                }
                onMouseDown={(e) => {
                  e.preventDefault();
                  setValue(cmd);
                  closeMenu();
                  internalRef.current?.focus();
                }}
              >
                {i === menuIndex ? `> ${cmd}` : `  ${cmd}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
