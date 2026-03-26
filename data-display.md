---
inclusion: manual
---

# Data Display Patterns

Reference this when building dashboards, metric displays, or data-heavy views.

## Metric card pattern

```jsx
<Card variant="metric" isDark={isDark} className="p-4">
  <span className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>
    Metric Label
  </span>
  <div className="flex items-baseline gap-2 mt-1">
    <span className={`text-3xl font-semibold ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
      165.6K
    </span>
    <span className="text-xs text-status-active">+12.3%</span>
  </div>
</Card>
```

## Status indicators

Use tinted backgrounds with matching borders for status containers:

```jsx
// Success
className="bg-status-active/[0.06] border border-status-active/[0.15] rounded-lg p-2"

// Warning
className="bg-status-blocked/[0.06] border border-status-blocked/[0.15] rounded-lg p-2"

// Danger
className="bg-status-outage/[0.08] border border-status-outage/[0.2] rounded-lg p-2"
```

## Donut chart pattern

Use the `DonutChart` component from the design system for SLI/status breakdowns. Place inside a Card with a legend below.

## Table with card wrapper

Every data table should be wrapped in a Card with a title:

```jsx
<Card variant="glass" isDark={isDark} className="p-4">
  <h5 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>
    Table Title (count)
  </h5>
  <Table isDark={isDark}>...</Table>
</Card>
```

## Empty states

For tables with no data, show a single row with muted text:

```jsx
<TableRow isDark={isDark}>
  <TableCell isDark={isDark} className="h-20">
    <span className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>
      No data found
    </span>
  </TableCell>
</TableRow>
```

## Chart color palette

Use chart tokens in order: `chart-1` through `chart-12`. These are defined as CSS variables and mapped in Tailwind config.

## Chart area fills

Use SVG `linearGradient` with `stopOpacity` for area fills under chart lines. This approach works with CSS variable token colors (hex concatenation like `${color}30` does NOT work with CSS variables).

```jsx
<svg viewBox="0 0 160 56">
  <defs>
    <linearGradient id={`fill-${index}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={chartColor} stopOpacity="0.18" />
      <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
    </linearGradient>
  </defs>
  {/* Area fill — fades from 18% opacity to transparent */}
  <path d={areaPath} fill={`url(#fill-${index})`} />
  {/* Line — full opacity */}
  <path d={linePath} fill="none" stroke={chartColor} strokeWidth="1.5" />
</svg>
```

Never use `fill={`${color}15`}` — this breaks with CSS variables and produces black fills.
