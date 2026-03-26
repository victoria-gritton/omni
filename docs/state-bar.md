---
inclusion: manual
name: state-bar-pattern
description: State transition bar pattern for showing alarm/resource state history over time.
---

# State Bar Pattern

Not a design system component yet — currently a module-level sub-component inside `ServicesOverview.jsx`. Will be promoted to a design system component if the pattern is reused elsewhere.

## Variants

| Variant | Context | Implementation |
|---------|---------|----------------|
| Compact | Alarm card thumbnails | Div-based, 12 equal segments, `gap-0.5` between segments |
| Detailed | Alarm detail view (future) | Chart.js-based, proportional-width spans aligned to metric chart x-axis |

## Compact variant spec

- Segments: 12 (fixed count, representing time buckets)
- Height: `h-1` (4px)
- Gap: `gap-0.5` (2px) between segments
- Ends: `rounded-l-full` on first segment, `rounded-r-full` on last segment
- Inner joints: flat (no border-radius)
- Colors:
  - OK: `bg-emerald-500`
  - Alarm: `bg-red-500`
  - Insufficient data: `bg-slate-600` (dark) / `bg-slate-300` (light)
- Margin: `mt-2` above

## Detailed variant spec (planned)

- Implementation: Chart.js horizontal bar or annotation layer
- Must share x-axis with metric line chart above it
- Proportional-width spans based on actual state duration
- Same color mapping as compact variant
- Label: "STATE HISTORY (LAST Xh)" above the bar

## When to promote to design system component

Promote if any of these happen:
1. StateBar is needed outside of `ServicesOverview` (e.g., in a different page or widget)
2. The detailed variant is built and shares enough API surface with compact to warrant a unified component
3. A third context needs the same pattern

## Current location

`src/design-system/src/components/ServicesOverview.jsx` — `StateBar` and `getStateSegments` functions
