---
inclusion: auto
name: segmented-control-component
description: Segmented control for switching between mutually exclusive view modes. Use for icon toggle groups, viz mode pickers, view switchers, or status filters.
---

# SegmentedControl Component

Import: `import { SegmentedControl } from '../design-system'`

## Props

| Prop | Type | Default |
|------|------|---------|
| `options` | `Array<{ id, label, Icon?, dot? }>` | `[]` |
| `value` | `string \| null` | — |
| `onChange` | `(id: string \| null) => void` | — |
| `isDark` | `boolean` | `true` |
| `size` | `'default' \| 'sm'` | `'default'` |
| `fullWidth` | `boolean` | `false` |
| `allowDeselect` | `boolean` | `false` |
| `className` | `string` | — |

## Sizing

- `default` — `h-8` container, `h-7` buttons. Matches Input and Button default height.
- `sm` — `h-6` container, `h-5` buttons. Matches Button sm height.

## Width

- Default: wraps content (inline-flex)
- `fullWidth`: stretches to parent width, options share equal width (flex-1)

## Content modes

- Icon only: `{ id, label, Icon }` — fixed-size square buttons (auto-detected)
- Icon + label: `{ id, label, Icon }` with `fullWidth` — flexible width
- Label only: `{ id, label }` — flexible width
- Dot + label: `{ id, label, dot: '#hex' }` — colored dot before label

## Design tokens

- Container: `bg-white/[0.04] border border-white/[0.06]` (dark) / `bg-black/[0.03] border border-black/[0.06]` (light)
- Active: `bg-white/10 text-foreground` (dark) / `bg-white text-gray-900 shadow-sm` (light)
- Inactive: `text-foreground-secondary` (dark) / `text-gray-600` (light)
- Dimmed (allowDeselect, unselected): `text-foreground-disabled opacity-40`
- Focus: `shadow-[0_0_0_3px_rgba(115,115,115,0.5)]`
- Transition: `transition-all duration-200`

## Code examples

```jsx
{/* Icon-only viz picker */}
<SegmentedControl
  options={[
    { id: 'line', label: 'Line', Icon: PresentationChart },
    { id: 'table', label: 'Table', Icon: TableIcon },
  ]}
  value={mode}
  onChange={setMode}
  isDark={isDark}
/>

{/* Status filter with dots (deselectable) */}
<SegmentedControl
  options={[
    { id: 'healthy', label: 'Healthy', dot: '#22c55e' },
    { id: 'warning', label: 'Warning', dot: '#eab308' },
    { id: 'critical', label: 'Critical', dot: '#ef4444' },
  ]}
  value={filter}
  onChange={setFilter}
  isDark={isDark}
  size="sm"
  allowDeselect
/>

{/* View mode toggle (full width) */}
<SegmentedControl
  options={[
    { id: 'agents', label: 'Agents', Icon: Cpu },
    { id: 'apps', label: 'Apps', Icon: Globe },
  ]}
  value={mode}
  onChange={setMode}
  isDark={isDark}
  size="sm"
  fullWidth
/>
```

## Rules

- Uses `role="radiogroup"` / `role="radio"` with `aria-checked`
- Each option needs `label` for `aria-label` even if icon-only
- One unified visual style — no variant prop needed
- Use `allowDeselect` for filter-style controls where no selection is valid
- Use `fullWidth` for toggles that should fill their parent container
