# Styling Rules

## Theme: Matte Black

This project uses a single **matte-black** palette exclusively. All colors are defined as `--color-mb-*` CSS custom properties inside a Tailwind `@theme inline` block in `app/globals.css`. Use Tailwind utility classes with the `mb-` prefix (e.g. `text-mb-accent`, `bg-mb-bg`, `border-mb-surface1`). **Never hardcode hex color values anywhere in components or styles.**

The palette is one ramp: `#121212` background up through `#1e1e1e` surfaces, `#bebebe` text, a `#e68e0d` orange accent, and a `#7aa2f7` blue reserved for links.

## Color Palette Reference

| Purpose                             | Tailwind Class(es)                                    |
|-------------------------------------|-------------------------------------------------------|
| Body text                           | `text-mb-text`                                        |
| Emphasized / bright text            | `text-mb-bright`                                      |
| Page background                     | `bg-mb-bg`                                            |
| Headings / prompt / success accent  | `text-mb-accent`                                      |
| Labels / highlights                 | `text-mb-accent2`                                     |
| Links (default)                     | `text-mb-blue`                                        |
| Links (hover)                       | `hover:text-mb-blue-bright hover:underline`           |
| Errors                              | `text-mb-danger`                                      |
| Muted text (descending)             | `text-mb-subtext1` > `text-mb-subtext0` > `text-mb-overlay1` > `text-mb-overlay0` |
| Surface backgrounds (light to dark) | `bg-mb-surface2` > `bg-mb-surface1` > `bg-mb-surface0` |
| Deep background / prompt bar        | `bg-mb-bar`                                           |

### Role Notes

- `mb-accent` (`#e68e0d`) is the primary orange: headings, the shell prompt, name/success emphasis. It replaces the old `ctp-mauve`/`ctp-green` roles.
- `mb-accent2` (`#f59e0b`) is the lighter orange: row labels, badges, language columns, secondary highlights.
- `mb-blue` (`#7aa2f7`) is for links only; `mb-blue-bright` (`#a9c1ff`) is the hover state.
- `mb-magenta` (`#c678dd`) is a rare accent — use sparingly.
- `mb-danger` (`#b91c1c`) is errors only.

## Link Styling

All external links must use this exact pattern:

```tsx
<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  className="text-mb-blue hover:text-mb-blue-bright hover:underline"
>
```

- Always include `target="_blank"` and `rel="noopener noreferrer"` for external links.
- The hover state transitions from `mb-blue` to `mb-blue-bright` with underline.

## Font

- The entire site uses **JetBrains Mono** as a monospace font — including the standalone blog pages, for a consistent terminal identity.
- Self-hosted via `next/font/local` in `app/layout.tsx` from `app/fonts/JetBrainsMono-Regular.woff2` and exposed as the CSS variable `--font-jetbrains` (placed on `<html>` so the variable resolves at `:root`, where Tailwind's `--font-mono` references it).
- Self-hosting is required because Google Fonts ships only the Latin subset, while the SIPESDEV ASCII banner uses Unicode block (U+2580–U+259F) and box-drawing (U+2500–U+257F) glyphs that fall back to a different font with mismatched widths under the Google subset.
- Tailwind's `--font-mono` is set to `var(--font-jetbrains), monospace` in the `@theme inline` block.
- Use `font-mono` Tailwind class when needed (already applied to `<body>`).
- Never use sans-serif or serif fonts.
- The font file is licensed under the SIL Open Font License 1.1; the license text lives at `app/fonts/OFL.txt` and the README credits JetBrains.

## Selection Styling

Text selection uses `mb-surface2` background with `mb-bright` foreground, defined globally in `app/globals.css` via `::selection`.

## Spacing & Layout Conventions

- Terminal container uses `p-4` padding.
- Text size is responsive: `text-sm sm:text-base`.
- Use `gap-*` and `flex` / `flex-wrap` for horizontal layouts (e.g., skill badges, section lists).
- Badge-like elements use `px-2 py-0.5 text-sm rounded bg-mb-surface0`.

## Viewport Heights

Use `h-dvh` / `min-h-dvh` for full-viewport containers. **Never use `h-screen` / `min-h-screen`.**

On mobile browsers `100vh` resolves to the *large* viewport (URL-bar-collapsed) and exceeds the visible area when the URL bar is showing. The browser compensates by scrolling the document body, which can push content above the viewport — and with `body { overflow: hidden }` set globally, users cannot scroll to recover it. `100dvh` tracks the current visible viewport and updates as browser chrome expands/collapses. `dvh` is Baseline Widely Available (Chrome 108+, Safari 15.4+, Firefox 101+) and needs no fallback for this project's audience.

Because `body { overflow: hidden }` is global (for the reason above), any page whose content must scroll — notably the standalone blog article pages — provides its **own** scroll container: an `h-dvh overflow-y-auto` (or `min-h-dvh`) wrapper, mirroring how the terminal root scrolls internally.

## Adding New Colors

If a new matte-black role token is needed, add it to the `@theme inline` block in `app/globals.css` following the existing pattern:

```css
--color-mb-rolename: #hexvalue;
```

Keep additions within the matte-black system — greys along the `#121212` → `#eaeaea` ramp, plus the established orange (`mb-accent`/`mb-accent2`), blue (`mb-blue`/`mb-blue-bright`), `mb-magenta`, and `mb-danger` accents. Do not introduce colors from other palettes.
