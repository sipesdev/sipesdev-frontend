# Styling Rules

## Theme: Catppuccin Mocha

This project uses the Catppuccin Mocha color palette exclusively. All colors are defined as `--color-ctp-*` CSS custom properties inside a Tailwind `@theme inline` block in `app/globals.css`. Use Tailwind utility classes with the `ctp-` prefix. **Never hardcode hex color values anywhere in components or styles.**

## Color Palette Reference

| Purpose                      | Tailwind Class(es)                              |
|------------------------------|--------------------------------------------------|
| Body text                    | `text-ctp-text`                                  |
| Page background              | `bg-ctp-base`                                    |
| Headings / accents           | `text-ctp-mauve`                                 |
| Links (default)              | `text-ctp-blue`                                  |
| Links (hover)                | `hover:text-ctp-lavender hover:underline`        |
| Success / prompt highlight   | `text-ctp-green`                                 |
| Labels / categories          | `text-ctp-peach`                                 |
| Warnings                     | `text-ctp-yellow`                                |
| Errors                       | `text-ctp-red`                                   |
| Muted text (descending)      | `text-ctp-subtext1` > `text-ctp-subtext0` > `text-ctp-overlay1` > `text-ctp-overlay0` |
| Surface backgrounds (light to dark) | `bg-ctp-surface0` > `bg-ctp-surface1` > `bg-ctp-surface2` |
| Deep backgrounds             | `bg-ctp-mantle`, `bg-ctp-crust`                  |

### Additional Accent Colors

These are available for specific use cases but should be used sparingly:

- `ctp-rosewater`, `ctp-flamingo`, `ctp-pink` -- warm accents
- `ctp-maroon` -- secondary error/danger
- `ctp-teal`, `ctp-sky`, `ctp-sapphire` -- cool accents

## Link Styling

All external links must use this exact pattern:

```tsx
<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  className="text-ctp-blue hover:text-ctp-lavender hover:underline"
>
```

- Always include `target="_blank"` and `rel="noopener noreferrer"` for external links.
- The hover state transitions from `ctp-blue` to `ctp-lavender` with underline.

## Font

- The entire site uses **JetBrains Mono** as a monospace font.
- Loaded via `next/font/google` in `app/layout.tsx` and exposed as CSS variable `--font-jetbrains`.
- Tailwind's `--font-mono` is set to `var(--font-jetbrains), monospace` in the theme.
- Use `font-mono` Tailwind class when needed (already applied to `<body>`).
- Never use sans-serif or serif fonts.

## Selection Styling

Text selection uses `ctp-surface2` background with `ctp-text` foreground, defined globally in `app/globals.css` via `::selection`.

## Spacing & Layout Conventions

- Terminal container uses `p-4` padding.
- Text size is responsive: `text-sm sm:text-base`.
- Use `gap-*` and `flex` / `flex-wrap` for horizontal layouts (e.g., skill badges, section lists).
- Badge-like elements use `px-2 py-0.5 text-sm rounded bg-ctp-surface0`.

## Adding New Colors

If a new Catppuccin Mocha color is needed (all 26 palette colors are already defined), add it to the `@theme inline` block in `app/globals.css` following the existing pattern:

```css
--color-ctp-colorname: #hexvalue;
```

Do not add colors outside the Catppuccin Mocha palette.
