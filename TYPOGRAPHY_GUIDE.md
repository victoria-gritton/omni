# Typography Guide — SSO Rhythm

> **Canonical source of truth for typography is `.kiro/steering/typography.md`.**
> This file is kept as a human-readable reference. If conflicts exist, the steering file wins.

## Font Families

- **Sans-serif (Body & Display)**: DM Sans
- **Monospace (Code)**: JetBrains Mono

### CSS Variables
```css
--font-sans: "DM Sans", "Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif;
--font-display: "DM Sans", "Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif;
--font-mono: JetBrains Mono, monospace;
```

> Note: `font-serif` (Merriweather) is defined in the Tailwind config as a fallback but is not part of the active type system. Do not use it for new UI work.

## Type Scale

| Token | Size | Line Height | Use |
|-------|------|-------------|-----|
| `text-display-l` | 42px | 48px | Hero sections, decorative |
| `text-heading-xl` | 24px | 30px | Page titles, H1 |
| `text-heading-l` | 18px | 22px | Section headers, H2 |
| `text-heading-m` | 16px | 20px | Subsection headers, H3 |
| `text-heading-s` | 14px | 18px | Card titles, H4 |
| `text-heading-xs` | 12px | 16px | Widget titles, H5 |
| `text-body-m` | 14px | 24px | Body text, descriptions |
| `text-body-s` | 12px | 20px | Captions, metadata |
| `text-code` | 12px | 16px | Inline code |
| `text-pre` | 14px | 20px | Code blocks |

## Font Weights

| Class | Weight | Use |
|-------|--------|-----|
| `font-normal` | 400 | All headings (H1–H6), body text |
| `font-medium` | 500 | Labels, emphasis, buttons |
| `font-semibold` | 600 | Strong emphasis (sparingly, never on headings) |

## Text Colors

Use semantic tokens from the design system. See `.kiro/steering/00-design-tokens.md` for the full mapping.

- Primary: `text-foreground` (dark) / `text-gray-900` (light)
- Secondary: `text-foreground-secondary` (dark) / `text-gray-700` (light)
- Muted: `text-foreground-muted` (dark) / `text-gray-500` (light)
- Link: `text-link` (dark) / `text-blue-600` (light)

## Micro Sizes (exceptions to the scale)

- `text-[10px]` — Compact labels, service map nodes
- `text-[9px]` — Category labels (with `tracking-wider`), status badges
- `text-[8px]` — Smallest labels in service map metric captions

## Accessibility

- Body text (14px): Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio
- Use semantic HTML and proper heading hierarchy
- Provide text alternatives for icon-only buttons

## Charts & Visualizations

- Axis labels: 12px / font-weight 600 — axis titles (e.g., "Time", "Latency")
- Axis values: 12px / font-weight 400 — tick values (e.g., "10:00", "200ms")
- Legend text: 12px / font-weight 400 — series names in chart legends
