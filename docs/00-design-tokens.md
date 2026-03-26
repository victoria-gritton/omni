---
inclusion: fileMatch
fileMatchPattern: "**/*.jsx,**/*.tsx"
---

# Design Tokens — Closed Set

You MUST use these tokens. Never invent colors, spacing, or shadow values.

## Colors (Tailwind utilities)

| Role | Dark class | Light class |
|------|-----------|-------------|
| Page background | `bg-background` | `bg-white` |
| Surface level 1 | `bg-background-surface-1` | `bg-slate-50` |
| Surface level 2 | `bg-background-surface-2` | `bg-slate-100` |
| Primary text | `text-foreground` | `text-gray-900` |
| Secondary text | `text-foreground-secondary` | `text-gray-700` |
| Muted text | `text-foreground-muted` | `text-gray-500` |
| Disabled text | `text-foreground-disabled` | `text-gray-400` |
| Link text | `text-link` | `text-blue-600` |
| Border | `border-border` | `border-slate-300` |
| Border (muted) | `border-border-muted` | `border-slate-200` |
| Input background | `bg-input` | `bg-black/[0.03]` |
| Input border | `border-input-border` | `border-slate-300` |
| Primary action | `bg-primary` | `bg-primary` |
| Destructive | `bg-destructive` | `bg-red-600` |

## Status colors (same in both modes)

- Success: `text-status-active` / `bg-status-active`
- Warning: `text-status-blocked` / `bg-status-blocked`
- Danger: `text-status-outage` / `bg-status-outage`
- Active: `text-status-active` / `bg-status-active`
- Inactive: `text-status-inactive` / `bg-status-inactive`

## Spacing (Tailwind defaults)

Use only these values for padding, margin, and gap:
`0.5` (2px), `1` (4px), `1.5` (6px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px)

## Border radius

- Cards/containers: `rounded-xl` (12px)
- Inputs/buttons/dropdowns: `rounded-lg` (8px)
- Pills/badges: `rounded-full`
- Never use `rounded-3xl` on new components

## Shadows

Use token-based shadows only: `shadow-2xs`, `shadow-xs`, `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-glass`, `shadow-glass-light`, `shadow-metric-light`, `shadow-dropdown-light`

## Focus rings

- Default focus: `shadow-ring-default`
- Error focus: `shadow-ring-error`

## Button glow

- Dark mode primary button: `shadow-button-glow-dark`
- Light mode primary button: `shadow-button-glow-light`

## Motion

- Panel transitions: `duration-panel` (160ms) + `ease-spring-smooth`
- Hover effects: `duration-hover` (80ms) + `ease-spring-smooth`
- Spring animations: `duration-spring` (300ms) + `ease-spring-bounce`

## Glass effects

- Card glass: `backdrop-blur-[20px]` with `var(--glass-bg)` background
- Panel glass: `backdrop-blur-[24px]`
- Metric glass: `backdrop-blur-[16px]`
- Glass border: `border-border-muted` (resolves to `rgba(51, 65, 85, 0.2)`)
- Glass shadow: `shadow-glass`

## Background gradients

Defined in `preset.css`. Use as full-page fixed backgrounds behind the content layer.

- Dark mode: `.gradient-bg-dark` — deep navy base with blue/violet/indigo radial accents at 15% opacity
- Light mode: `.gradient-bg-light` — white base with blue/violet/indigo radial accents at 20–24% opacity

## Visualization color palettes

Three palettes for charts and data viz, derived from Cloudscape. Each has light/dark variants. Tokens are defined as `--viz-*` CSS vars in `tokens.cjs`.

**Categorical (10 colors)** — Use for distinct series in bar/line/pie charts.
Order: indigo, mint, purple (#A669E2), blue, cyan, magenta, orange, rose, amber, amber-dark.
CSS vars: `--viz-cat-1` through `--viz-cat-10` (dark), `--viz-cat-N-light` (light).

**Sequential (8 steps)** — Use for heatmaps, choropleth, intensity scales. Blue→indigo gradient.
CSS vars: `--viz-seq-1-light` / `--viz-seq-1-dark` through `--viz-seq-8-*`.

**Diverging (10 steps)** — Use for deviation from a midpoint (e.g., above/below threshold). Cool (indigo/blue) → warm (amber/orange/red).
CSS vars: `--viz-div-1-light` / `--viz-div-1-dark` through `--viz-div-10-*`.

**Rules:**
- Always use categorical palette for multi-series charts (never pick random colors)
- Use sequential for single-variable intensity
- Use diverging only when data has a meaningful midpoint
- Never mix palettes within a single chart
