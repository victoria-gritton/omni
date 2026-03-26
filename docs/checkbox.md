---
inclusion: auto
name: checkbox-component
description: Checkbox component for boolean selections. Use when creating checkboxes, toggles, or multi-select options in forms.
---

# Checkbox Component

Import: `import { Checkbox } from '../design-system'`

## Props

| Prop | Type | Default |
|------|------|---------|
| `checked` | `boolean` | `false` |
| `indeterminate` | `boolean` | `false` |
| `onChange` | `function` | — |
| `disabled` | `boolean` | `false` |
| `label` | `string` | — |
| `description` | `string` | — |
| `isDark` | `boolean` | `true` |

## States

- Unchecked: `bg-input`, `border-input-border`
- Checked/Indeterminate: `bg-primary`, white check/minus icon
- Disabled: 50% opacity
- Focus: `shadow-ring-default`

## Code example

```jsx
<Checkbox isDark={isDark} label="Enable monitoring" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
<Checkbox isDark={isDark} label="Select all" indeterminate description="3 of 8 selected" />
```

## Rules

- Forwards refs via `forwardRef`
- Box is 16x16px (`w-4 h-4`) with `rounded-[4px]`
- Always provide a `label` for accessibility
