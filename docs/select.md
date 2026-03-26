---
inclusion: auto
name: select-component
description: Select dropdown component. Use when creating select menus, option pickers, or dropdown selectors in forms.
---

# Select Component

Import: `import { Select } from '../design-system'`

## Props

| Prop | Type | Default |
|------|------|---------|
| `options` | `[{ value, label, icon? }]` | `[]` |
| `value` | `string` | (uncontrolled) |
| `onChange` | `function` | — |
| `placeholder` | `string` | `'Placeholder'` |
| `icon` | `ReactNode` | `null` (leading icon) |
| `disabled` | `boolean` | `false` |
| `isDark` | `boolean` | `true` |

## States

- Default: `border-input-border`, `bg-input`, `shadow-2xs`
- Focused/Open: `border-foreground-disabled`, `bg-input-2`, `shadow-ring-default`
- Disabled: 50% opacity

## Code example

```jsx
<Select
  isDark={isDark}
  placeholder="Select region"
  icon={<GlobeIcon className="w-4 h-4" />}
  options={[
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'eu-west-1', label: 'EU (Ireland)' },
  ]}
  value={region}
  onChange={setRegion}
/>
```

## Rules

- Select forwards refs via `forwardRef`
- Dropdown uses `rounded-lg`, `bg-background-surface-2`, `shadow-md`
- Supports both controlled and uncontrolled usage
