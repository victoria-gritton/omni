---
inclusion: auto
name: dropdown-menu-component
description: Dropdown menu for contextual actions. Use when creating context menus, action menus, or option lists triggered by a button.
---

# DropdownMenu Component

Import: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuShortcut } from '../design-system'`

## Anatomy

```
DropdownMenu (isDark)
  DropdownMenuTrigger → button/element
  DropdownMenuContent (align: 'start'|'end')
    DropdownMenuLabel
    DropdownMenuItem (onSelect, shortcut, disabled)
    DropdownMenuSeparator
    DropdownMenuSub
      DropdownMenuSubTrigger
      DropdownMenuSubContent
```

## Props

- `DropdownMenu`: `isDark` (boolean)
- `DropdownMenuContent`: `align` ('start'|'end'), `className`
- `DropdownMenuItem`: `onSelect` (function), `shortcut` (string), `disabled` (boolean)

## Code example

```jsx
<DropdownMenu isDark={isDark}>
  <DropdownMenuTrigger>
    <Button isDark={isDark} variant="ghost" size="icon"><EllipsisIcon /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuItem onSelect={handleEdit}>Edit</DropdownMenuItem>
    <DropdownMenuItem onSelect={handleDelete}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Rules

- Content uses `rounded-lg`, `bg-background-surface-2`, `shadow-dropdown-light`
- Items use `rounded-md` with `hover:bg-white/5` (dark)
- Animated entry with opacity + translateY + scale
