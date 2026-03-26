---
inclusion: fileMatch
fileMatchPattern: "**/*.jsx,**/*.tsx,**/*.css"
---

# Typography Scale Reference

Loaded automatically when working on JSX/TSX/CSS files. For core rules (font weights, font families, theming), see `01-ui-rules.md`.

## Type Scale

| Token | Size | Line Height | Use |
|-------|------|-------------|-----|
| `text-display-l` | 42px | 48px | Hero sections, decorative elements |
| `text-heading-xl` | 24px | 30px | Page titles, H1 |
| `text-heading-l` | 18px | 22px | Section headers, H2 |
| `text-heading-m` | 16px | 20px | Subsection headers, H3, card/panel titles |
| `text-heading-s` | 14px | 18px | Card titles, H4 |
| `text-heading-xs` | 12px | 16px | Small headers, H5, widget titles |
| `text-body-m` | 14px | 24px | Primary body text, descriptions, chat messages |
| `text-body-s` | 12px | 20px | Secondary text, captions, metadata, timestamps |
| `text-code` | 12px | 16px | Inline code (`font-mono`) |
| `text-pre` | 14px | 20px | Code blocks (`font-mono`) |

## Micro Sizes (exceptions to the scale)

- `text-[10px]` — Compact labels, service map nodes
- `text-[9px]` — Category labels (with `tracking-wider`), status badges
- `text-[8px]` — Smallest labels in service map metric captions

## Metric / Data Values

- Large metric: `text-3xl font-semibold` — primary stat values
- Medium metric: `text-xl font-bold` — insight card values
- Metric unit: `text-xs` — units after values (e.g., "/mo", "faster")
- Change indicator: `text-xs` with status color (`text-status-active`, `text-status-blocked`, `text-status-outage`)

## Charts & Visualizations

- Axis labels: `text-body-s font-semibold` (12px / 600) — axis titles (e.g., "Time", "Latency")
- Axis values: `text-body-s font-normal` (12px / 400) — tick values (e.g., "10:00", "200ms")
- Legend text: `text-body-s font-normal` (12px / 400) — series names in chart legends

## Letter Spacing

- `tracking-tighter` — Page titles (H1)
- `tracking-wider` — Uppercase category labels

## Code Blocks

```jsx
// Inline code
<code className="text-code font-mono">value</code>

// Code block container
<pre className={`text-pre font-mono ${isDark ? 'bg-background-surface-2/40' : 'bg-gray-100'} rounded-lg p-3`}>
  {code}
</pre>
```

## Usage Examples

```jsx
// Page title
<h1 className={`text-heading-xl font-normal tracking-tighter ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
  Dashboard
</h1>

// Card section title
<h5 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>
  Services (8)
</h5>

// Category label
<span className={`text-[9px] font-bold tracking-wider uppercase ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>
  CRITICAL ALERT
</span>
```
