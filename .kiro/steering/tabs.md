---
inclusion: auto
name: tabs-component
description: Tabs component for switching between views. Use when creating tab bars, view switchers, or segmented navigation.
---

# Tabs Component

Import: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '../design-system'`

## Variants

| Variant | Use for |
|---------|---------|
| `default` | Standard tabs — text-sm, px-3 py-2.5 |
| `compressed` | Compact tabs — text-xs, px-2 py-1.5 |

## Code example — two usage modes

Data-driven (recommended):
```jsx
<Tabs tabs={[{ id: 'one', label: 'Tab One', icon: SomeIcon }]} value={tab} onValueChange={setTab} variant="compressed" isDark={isDark} onClose={handleClose}>
  <TabsContent value="one">…</TabsContent>
</Tabs>
```

Composable (manual):
```jsx
<Tabs value={tab} onValueChange={setTab} variant="compressed">
  <TabsList isDark={isDark}>
    <TabsTrigger value="one">One</TabsTrigger>
  </TabsList>
  <TabsContent value="one">…</TabsContent>
</Tabs>
```

## Props

- `Tabs`: `tabs`, `value`, `onValueChange`, `isDark`, `variant`, `onAdd`, `onClose`, `leftSlot`, `rightSlot`
- `TabsTrigger`: `value`, `icon`, `onClose`

## Rules

- Active tab has muted underline; hover shows gradient glow underline
- Tabs support closable tabs when `onClose` provided and more than 1 tab
- Uses framer-motion for enter/exit animations

## Use cases — when to use Tabs (flex range)

| Scenario | Variant | Config |
|----------|---------|--------|
| Page-level navigation (Overview / Logs / Traces) | `default` | No close buttons, no icons needed |
| Artifact tabs in chat panel | `compressed` | With icons, closable, `onAdd` for new tabs |
| In-card view switching (Logs / Patterns) | `compressed` | No close, no add, no icons — minimal |
| Filter tabs (All / Errors / Warnings) | `compressed` | No close, no add |
| Settings sections | `default` | With icons, no close |

**Do NOT build a custom tab switcher.** If you need tabs inside a Card, use `<Tabs variant="compressed">` — it already handles compact sizing. If you need a pattern Tabs can't handle (e.g., vertical tabs, icon-only tabs), propose a new variant on the Tabs component rather than creating a separate component.
