# Playwright mobile-viewport regression suite

This directory contains Playwright specs that run against real browser engines to catch mobile-viewport layout bugs that `jsdom` (used by the Vitest suite) cannot reproduce.

## Scope

Playwright here is **scoped to mobile-viewport regressions only**. Unit and component tests live in `__tests__/` under Vitest + React Testing Library and stay there. Do not migrate existing Vitest tests to Playwright.

## Running

```bash
npm run test:e2e        # headless run across all projects
npm run test:e2e:ui     # Playwright UI mode for iterating on a failing spec
```

The config boots `npm run dev` automatically via `webServer` and reuses an existing dev server when one is already running. Browser projects: `Pixel 7` (Chromium emulation) and `iPhone 13` (WebKit emulation).

First-time setup requires the browser binaries:

```bash
npx playwright install chromium webkit
```

## Reproducing mobile bugs on a real device

Emulation catches most viewport issues, but for anything touching touch behavior, real URL-bar chrome, or iOS-specific quirks, test on hardware:

1. `npm run dev` on the desktop.
2. Enable **Wireless debugging** on the Android device (Settings → Developer options) and pair it: `adb pair <ip>:<port>` then `adb connect <ip>:<port>`.
3. Tunnel the dev port through the ADB connection: `adb reverse tcp:3000 tcp:3000`.
4. On the phone, open Brave/Chrome and navigate to `http://localhost:3000` — it resolves through the reverse tunnel.
5. On the desktop, open `brave://inspect/#devices` (or `chrome://inspect/#devices`) and click **inspect** next to the phone's tab to attach full DevTools to the live device.

## Writing new specs

- Specs go in `e2e/*.spec.ts`.
- Prefer role-based or structural locators over CSS classes (which change).
- When asserting layout, use `getBoundingClientRect()` via `locator.evaluate()` — `toBeInViewport()` with `ratio: 1` will fail on elements wider than a narrow mobile viewport even when they're correctly positioned.
