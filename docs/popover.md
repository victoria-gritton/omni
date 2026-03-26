---
inclusion: auto
name: popover-component
description: Popover component for floating content panels. Use when creating popovers, floating panels, or non-modal dialogs.
---

# Popover Component

Import: `import { Popover, PopoverTrigger, PopoverContent } from '../design-system'`

## Anatomy

```
Popover (isDark, open?, onOpenChange?)
  PopoverTrigger (asChild?)
  PopoverContent (align, sideOffset, animate?)
```

## Props

- `Popover`: `isDark`, `open` (controlled), `onOpenChange`
- `PopoverTrigger`: `asChild` (boolean) — wraps child with click handler
- `PopoverContent`: `align` ('start'|'end'), `sideOffset` (px, default 8), `animate` (boolean)

## Code example

```jsx
<Popover isDark={isDark}>
  <PopoverTrigger asChild>
    <Button isDark={isDark} variant="outline" size="sm">Options</Button>
  </PopoverTrigger>
  <PopoverContent align="end" animate>
    <div className="p-3">Popover content</div>
  </PopoverContent>
</Popover>
```

## Rules

- Content uses `rounded-xl`, `bg-background-surface-2`, `shadow-md`
- Closes on outside click automatically
- Supports both controlled and uncontrolled modes
