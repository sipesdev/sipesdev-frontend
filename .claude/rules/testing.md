# Testing Rules

## Framework & Environment

- **Test runner**: Vitest 4 with `jsdom` environment.
- **Globals enabled**: `describe`, `it`, `expect`, `vi`, `beforeAll`, `beforeEach`, `afterAll`, `afterEach` are available without imports.
- **Assertion matchers**: `@testing-library/jest-dom` matchers (e.g., `toBeInTheDocument`, `toHaveTextContent`, `toHaveFocus`) are globally available via the setup file at `__tests__/setup.ts`. Do not import them in individual test files.
- **Component rendering**: Use `@testing-library/react` (`render`, `screen`, `waitFor`, `within`).
- **User interactions**: Use `@testing-library/user-event` (`userEvent.setup()`) for simulating clicks, typing, and keyboard events. Prefer `userEvent` over `fireEvent` for realistic interaction simulation.
- **CSS is disabled**: `css: false` in vitest config. Do not write assertions against computed styles or CSS class presence for visual correctness. Assert behavior and DOM structure instead.

## File Organization

- All tests live in `__tests__/` at the project root, mirroring the source directory structure:
  - `__tests__/components/terminal/Terminal.test.tsx` tests `components/terminal/Terminal.tsx`
  - `__tests__/lib/commands.test.ts` tests `lib/commands.ts`
  - `__tests__/components/output/outputs.test.tsx` tests output components
- Test files use the `.test.ts` extension for pure logic and `.test.tsx` for anything rendering JSX.
- The setup file at `__tests__/setup.ts` imports `@testing-library/jest-dom` and is loaded automatically by vitest.

## Running Tests

- `vitest run` -- execute all tests once (CI mode).
- `vitest` -- watch mode for development.
- `npm run test` -- alias for `vitest` (watch mode).
- `npm run test:run` -- alias for `vitest run`.

## Command Registry in Tests

- The command registry (`lib/commands.ts`) starts empty. Commands are registered as a side effect of importing `@/lib/registerCommands`.
- **Any test that needs the command registry populated** (e.g., testing `executeCommand`, testing `Terminal` rendering, testing output components via commands) **must** import `@/lib/registerCommands` at the top of the test file or ensure the component under test does so.
- The `Terminal` component imports `@/lib/registerCommands` internally, so integration tests rendering `<Terminal />` get the registry populated automatically.

## Mocking Conventions

- **`next/image`**: Must be mocked in any test that renders components using `<Image>`. Replace with a plain `<img>` forwarding props:
  ```ts
  vi.mock("next/image", () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => <img {...props} />,
  }));
  ```
- **`scrollIntoView`**: jsdom does not implement this. Polyfill it in `beforeAll` when testing the Terminal component:
  ```ts
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });
  ```
- Do not mock the command registry, `executeCommand`, or `registerCommand` unless explicitly testing in isolation. Prefer integration-style tests that exercise the real registry.

## Test Structure & Style

- Use `describe` blocks to group related tests by feature or scenario (e.g., "Terminal - initial render", "Terminal - command execution").
- Each `it` block tests exactly one behavior or assertion.
- Use descriptive test names that state what is being tested and the expected outcome: `it("executes 'whoami' and displays 'michael'", ...)`.
- Include a JSDoc comment at the top of each test file explaining what module is under test and the scope of the tests.
- Use helper functions (e.g., `renderTerminal()`, `getInput()`) to reduce duplication across tests within a file.
- Use section comment dividers (`// ---`) to visually separate test groups.

## Path Aliases

- Use `@/*` path aliases in test imports, the same as in source code. The `vite-tsconfig-paths` plugin resolves them in the test environment.

## TypeScript Types in Tests

- `vitest/globals` and `@testing-library/jest-dom` types are declared in `tsconfig.json` under `compilerOptions.types`. No additional type imports needed for test globals.
