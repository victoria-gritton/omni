# Rhythm Design System

## Structure

```
src/design-system/
  index.js                          ← barrel export (public API)
  preset.css                        ← design tokens (CSS custom properties)
  tokens.cjs                        ← token definitions (JS)
  plugin.cjs                        ← Tailwind plugin
  docs/                             ← documentation
  src/components/
    ui/                             ← core UI primitives
      badge.jsx
      breadcrumbs.jsx
      button.jsx
      card.jsx
      checkbox.jsx
      donut-chart.jsx
      dropdown-menu.jsx
      input.jsx
      popover.jsx
      segmented-control.jsx
      select.jsx
      table.jsx
      tabs.jsx
      tooltip.jsx
      widget.jsx
      components/                   ← composite sub-components
        data-table.jsx              ← AG Grid wrapper
      lib/
        utils.js                    ← cn(), formatters
    shadcn-io/                      ← AI-specific components
      chat-input.jsx
```

## Usage

```jsx
import { Button, Input, Select, Card, Widget, cn, formatNumber } from '../design-system'
```

## Theming

Components use an `isDark` prop for theme switching. CSS custom properties in `preset.css` provide token values for custom styling.

## Foundations

The components page (`/components/`) documents four foundation areas:

- **Overview** — Package info, install, setup, what's included
- **Typography** — Font families (DM Sans, JetBrains Mono), type scale, weights, text colors
- **Design Tokens** — Colors, status, radius (see `00-design-tokens.md`)
- **Visualization Colors** — Categorical (10), sequential (8), diverging (10) palettes derived from Cloudscape
