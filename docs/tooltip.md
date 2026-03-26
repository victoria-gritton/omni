---
inclusion: auto
name: tooltip-component
description: Tooltip component for hover hints. Use when adding tooltips, hover labels, or contextual hints to icon buttons or UI elements.
---

# Tooltip Component

Import: `import { Tooltip } from '../design-system'`

## Props

| Prop | Type | Default |
|------|------|---------|
| `content` | `string` | — (required) |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` |
| `delay` | `number` (ms) | `300` |
| `isDark` | `boolean` | `true` |

## Code example

```jsx
<Tooltip content="Settings" isDark={isDark}>
  <button><Cog6ToothIcon className="w-4 h-4" /></button>
</Tooltip>
```

## Rules

- ALWAYS wrap icon-only buttons with Tooltip
- Never use native `title` attribute — use this component instead
- Tooltip uses inverted colors for contrast (light bg on dark, dark bg on light)
- Child must accept `ref`, `onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur`
