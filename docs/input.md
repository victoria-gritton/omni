---
inclusion: auto
name: input-component
description: Input component for forms. Use when creating text inputs, password fields, file uploads, or form fields.
---

# Input Component

Import: `import { Input } from '../design-system'`

## Variants

| Variant | Use for |
|---------|---------|
| `default` | Standard text input |
| `password` | Password field with show/hide toggle |
| `file` | File upload with "Choose file" button |

## Props

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'default' \| 'password' \| 'file'` | `'default'` |
| `isDark` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `error` | `boolean` | `false` |
| `placeholder` | `string` | `'Placeholder'` |
| `value` | `string` | (uncontrolled) |
| `onChange` | `function` | — |
| `leadingIcon` | `ReactNode` | — |
| `trailingSlot` | `ReactNode` | — |

## States

- Default: `border-input-border` (dark) / `border-slate-300` (light)
- Focused: `border-foreground-disabled` + focus ring shadow
- Error: `border-destructive` + red focus ring
- Disabled: 50% opacity, `cursor-not-allowed`

## Design tokens used

- Height: `h-8` (32px)
- Padding: `px-3 py-1`
- Background: `bg-input` (dark) / `bg-black/[0.03]` (light)
- Border radius: `rounded-lg`
- Text: `text-xs font-medium`

## Code example

```jsx
<Input isDark={isDark} placeholder="Service name" />
<Input isDark={isDark} variant="password" placeholder="API key" />
<Input isDark={isDark} error placeholder="Required field" />
<Input isDark={isDark} placeholder="Search..." leadingIcon={<MagnifyingGlassIcon className="w-4 h-4" />} />
<Input isDark={isDark} placeholder="Query..." leadingIcon={<SparklesIcon className="w-4 h-4" />} trailingSlot={<><button aria-label="Run"><PlayIcon className="w-4 h-4" /></button></>} />
```

## Rules

- Input forwards refs via `forwardRef`
- Supports both controlled and uncontrolled usage
- Always provide a meaningful `placeholder`
