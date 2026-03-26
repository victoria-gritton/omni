---
inclusion: auto
name: widget-component
description: Widget component for dashboard tiles. Use when creating configurable dashboard widgets, metric displays, or data panels with headers and actions.
---

# Widget Component

Import: `import { Widget, WidgetHeader, WidgetBody, WidgetFooter, WidgetLoading, WidgetError, WidgetEmpty } from '../design-system'`

## When to use Widget vs Card

- Use **Widget** for dashboard tiles that have a structured header with title, actions, and optional scope controls
- Use **Card** for simpler content containers without the widget chrome

## Anatomy

```
Widget (variant="widget"|"glass"|"metric"|"transparent"|...)
  WidgetHeader (title, subtitle, actions, scope controls)
  WidgetBody (main content area)
  WidgetFooter (optional footer actions)
```

Widget accepts any Card variant via the `variant` prop (defaults to `"widget"`). Use `"transparent"` for borderless containers that reveal a subtle background on hover.

## State sub-components

| Component | Use for |
|-----------|---------|
| `WidgetLoading` | Skeleton placeholder while data loads. Props: `rows` (default 3) |
| `WidgetError` | Error state with retry. Props: `message`, `onRetry` |
| `WidgetEmpty` | Empty state. Props: `message`, `icon` |

## Code example

```jsx
<Widget variant="glass" isDark={isDark}>
  <WidgetHeader
    isDark={isDark}
    title="Request Latency"
    subtitle="p99 over 24h"
    actions={<Button isDark={isDark} variant="ghost" size="icon-sm">...</Button>}
    onDragStart={(e) => handleDragStart(e, widgetId)}
  />
  <WidgetBody>
    {loading ? <WidgetLoading rows={4} /> : <MyChart data={data} />}
  </WidgetBody>
</Widget>
```

## Drag handle

When `onDragStart` is passed to `WidgetHeader`, a `DotsSixVertical` (size 14) icon appears to the left of the title on hover. The icon element has `draggable` set and fires `onDragStart` when dragged. Fades in/out with the widget hover state.

| State | Dark | Light | Cursor |
|-------|------|-------|--------|
| Rest | `text-foreground-disabled` | `text-gray-400` | default |
| Hover | `text-foreground-muted` | `text-gray-500` | `cursor-grab` |
| Active (dragging) | — | — | `cursor-grabbing` |

Transitions use `duration-hover` (80ms) + `ease-spring-smooth`.
