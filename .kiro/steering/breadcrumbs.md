---
inclusion: auto
name: breadcrumbs-component
description: Breadcrumbs navigation component. Use when showing page hierarchy, navigation trails, or location context.
---

# Breadcrumbs Component

Import: `import { Breadcrumbs } from '../design-system'`

## Props

| Prop | Type | Default |
|------|------|---------|
| `items` | `[{ label, onClick?, icon? }]` | `[]` |
| `isDark` | `boolean` | `true` |

## Code example

```jsx
<Breadcrumbs isDark={isDark} items={[
  { label: 'Home', onClick: () => navigate('/'), icon: <HomeIcon className="w-3.5 h-3.5" /> },
  { label: 'Services', onClick: () => navigate('/services') },
  { label: 'pet-clinic-frontend' },
]} />
```

## Rules

- Last item is current page (non-clickable, `text-foreground`)
- Other items are clickable links (`text-link`)
- Separator is `/` in `text-foreground-muted`
- Uses `<nav aria-label="Breadcrumb">` for accessibility
- Font: `text-xs`
