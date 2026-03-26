---
inclusion: auto
name: button-component
description: Button component with variants and sizes. Use when creating buttons, actions, CTAs, or clickable controls.
---

# Button Component

Import: `import { Button } from '../design-system'`

## Variants — when to use each

| Variant | Use for |
|---------|---------|
| `default` | Primary actions (submit, save, create). Gradient sky background. |
| `secondary` | Secondary actions (cancel, back). Muted background. |
| `destructive` | Dangerous actions (delete, remove). Red background. |
| `outline` | Tertiary actions, toolbar buttons. Border with surface background. |
| `ghost` | Inline actions, minimal emphasis. Transparent background. |
| `link` | Navigation-style actions. Looks like a text link. |

## Sizes

| Size | Dimensions | Use for |
|------|-----------|---------|
| `default` | h-8, px-4 | Standard buttons |
| `sm` | h-6, px-3 | Compact UI, toolbars |
| `icon` | h-8, w-8 | Icon-only buttons (standard) |
| `icon-sm` | h-6, w-6 | Icon-only buttons (compact) |

## Props

| Prop | Type | Default |
|------|------|---------|
| `variant` | `string` | `'default'` |
| `size` | `string` | `'default'` |
| `isDark` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` |
| `leftIcon` | `ReactNode` | `null` |
| `rightIcon` | `ReactNode` | `null` |

## Code example

```jsx
<Button isDark={isDark} variant="default" leftIcon={<PlusIcon className="w-4 h-4" />}>
  Create Service
</Button>

<Button isDark={isDark} variant="outline" size="sm">Cancel</Button>

<Button isDark={isDark} variant="ghost" size="icon">
  <Cog6ToothIcon className="w-4 h-4" />
</Button>
```

## Rules

- Icon-only buttons MUST be wrapped in `<Tooltip>` for accessibility
- Button uses `rounded-lg` — do not override border radius
- Button forwards refs via `forwardRef`
