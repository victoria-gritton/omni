---
inclusion: auto
name: card-component
description: Card component with glassmorphic variants. Use when creating cards, panels, containers, content wrappers, or any boxed UI element.
---

# Card Component

Import: `import { Card, cardStyles, cardStylesFull } from '../design-system'`

## Variants — when to use each

| Variant | Use for | Visual |
|---------|---------|--------|
| `glass` | Default content containers, data sections, forms | Blur + border + shadow, flat background |
| `ai-glass` | AI-generated or agent-driven content containers | Blur + gradient overlay + border + shadow + hover glow |
| `metric` | Compact stat/KPI cards, small data displays | Lighter blur, subtle gradient |
| `widget` | Minimal containers, configurable dashboard tiles | Border only, no shadow, allows overflow |
| `popover` | Dropdowns, floating menus, tooltips | Heavy blur + elevated shadow |
| `flat` | Subtle content sections, grouped areas | Surface-1 background, no border, no shadow |
| `placeholder` | Empty states, "add new" zones | Dashed border, no background |
| `transparent` | Borderless containers that reveal on hover | Muted border, no background, subtle bg on hover |
| `outlined` | Structured containers, form sections, grouped content | Solid border, no background, no elevation |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'glass' \| 'ai-glass' \| 'metric' \| 'widget' \| 'popover' \| 'flat' \| 'placeholder' \| 'outlined' \| 'transparent'` | `'glass'` | Visual style |
| `isDark` | `boolean` | `true` | Theme mode |
| `className` | `string` | `''` | Additional classes |
| `style` | `object` | `{}` | Additional inline styles (merged with variant styles) |

## Dark mode hover effect

In dark mode, `ai-glass` and `metric` variants render a gradient glow line at the top edge on hover (sky → rose). This is built-in — do not recreate it. The `glass`, `flat`, `placeholder`, and `outlined` variants do not render this glow.

## Code example

```jsx
<Card variant="glass" isDark={isDark} className="p-4">
  <h4 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
    Section Title
  </h4>
  <p className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>
    Description text
  </p>
</Card>
```

## Spacing inside cards

- Standard padding: `p-4` (16px)
- Compact cards: `p-3` (12px)
- Spacious cards: `p-6` (24px)
- Gap between card children: `space-y-3` or `space-y-4`
- Gap between cards in a grid: `gap-3`

## Card does NOT forward refs

Card renders a `<div>`. If you need a ref, wrap it: `<div ref={myRef}><Card>...</Card></div>`
