---
inclusion: auto
name: table-component
description: Table component for data display. Use when creating tables, data grids, lists, or tabular data layouts.
---

# Table Component

Import: `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption } from '../design-system'`

## Anatomy

```
Table
  TableHeader
    TableRow
      TableHead (column headers)
  TableBody
    TableRow
      TableCell (data cells)
  TableFooter (optional)
  TableCaption (optional)
```

## Props (all sub-components)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `isDark` | `boolean` | `true` | Pass to every sub-component |
| `className` | `string` | `''` | Additional classes |
| `align` | `'left' \| 'right'` | `'left'` | TableHead and TableCell only |
| `bold` | `boolean` | `false` | TableCell only |

## Design tokens used

- Header height: 40px (`h-10`)
- Cell height: 52px (`h-[52px]`)
- Cell padding: `px-2`
- Min column width: 85px (`min-w-[85px]`)
- Font: `text-xs tracking-[-0.12px]`
- Head text: `text-foreground-muted` (dark) / `text-slate-500` (light), `font-bold`
- Cell text: `text-foreground` (dark) / `text-gray-900` (light)
- Row border: `border-border-muted` (dark) / `border-slate-200` (light)

## Code example

```jsx
<Card variant="glass" isDark={isDark} className="p-4">
  <h5 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>
    Services (8)
  </h5>
  <Table isDark={isDark}>
    <TableHeader isDark={isDark}>
      <TableRow isDark={isDark}>
        <TableHead isDark={isDark}>Name</TableHead>
        <TableHead isDark={isDark} align="right">Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody isDark={isDark}>
      {items.map((item, i) => (
        <TableRow key={i} isDark={isDark}>
          <TableCell isDark={isDark}>
            <span className={isDark ? 'text-link' : 'text-blue-600'}>{item.name}</span>
          </TableCell>
          <TableCell isDark={isDark} align="right">{item.status}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Card>
```

## Rules

- Always wrap Table in a Card
- Always pass `isDark` to every sub-component
- Use `text-link` / `text-blue-600` for clickable cell values
- Table title goes above the Table as an h5, not inside TableCaption
