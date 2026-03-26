---
inclusion: fileMatch
fileMatchPattern: "**/*.jsx,**/*.tsx"
---

# Core UI Rules

These rules are non-negotiable. Every UI change must follow them.

## 1. Theming: isDark prop, not dark: variant

This project uses an `isDark` prop for theming. Never use Tailwind's `dark:` variant.

```jsx
// ✅ Correct
<div className={isDark ? 'text-foreground' : 'text-gray-900'}>

// ❌ Wrong
<div className="dark:text-white text-gray-900">
```

## 2. Import from the design system barrel

```jsx
import { Button, Card, Input, Select, Table, Tooltip, cn } from '../design-system'
```

Never import directly from `src/design-system/src/components/ui/...` in page files.

## 3. Never hardcode visual values

No raw hex colors, no pixel values for spacing, no arbitrary shadows. Use tokens from `00-design-tokens.md`. If a token doesn't exist for what you need, flag it — don't invent one.

## 4. Component composition

- Accept `className` prop on every component, merge with `cn()` utility
- Accept `isDark` prop on every component that renders visible UI
- Use semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`

## 5. Typography

- All headings (h1-h6): `font-normal` (weight 400). Never bold headings.
- Font family: DM Sans (sans), JetBrains Mono (mono)
- Use the type scale: `text-display-l`, `text-heading-xl/l/m/s/xs`, `text-body-m/s`, `text-code`, `text-pre`
- Micro sizes (`text-[10px]`, `text-[9px]`, `text-[8px]`) are allowed for compact labels

## 6. Icons

Use Phosphor Icons (`@phosphor-icons/react`). See `02-icons.md` for full guidelines including weight rules, sizing table, consistency map, and prohibited patterns. Quick summary: default weight `regular`, `bold` for checkbox only, `fill` for active/selected states only, `duotone`/`thin`/`light` banned. Size via `size={N}` prop: 12, 14, 16, 20, 24. Color via `className`. No emoji, no inline SVG, no other icon libraries.

## 7. Corner radius convention

- Cards, containers, panels: `rounded-xl`
- Inputs, buttons, selects, dropdowns: `rounded-lg`
- Pills, badges, tags: `rounded-full`

## 8. Define sub-components at module level

Never define React components inside another component's render body. This causes remount on every re-render, breaking focus, animations, and state.

```jsx
// ✅ Correct — defined at module level
function IconButton({ isDark }) { return <button>...</button> }

function ParentComponent({ isDark }) {
  return <IconButton isDark={isDark} />
}

// ❌ Wrong — defined inside render
function ParentComponent({ isDark }) {
  const IconButton = () => <button>...</button>  // remounts every render
  return <IconButton />
}
```

## 9. Tooltip for icon buttons

Always wrap icon-only buttons with `<Tooltip>`. Never use the native `title` attribute.

## 10. Component reuse — always use existing components

Before creating any new interactive UI element, check this registry. If an existing component handles the pattern, use it. If it almost fits, propose a new variant on the existing component rather than building a new one.

| Need | Use this component | Variant/config |
|------|-------------------|----------------|
| Tab switching between views | `Tabs` | `default` (page-level), `compressed` (in-card/panel) |
| Content container | `Card` | `glass`, `metric`, `widget`, `popover`, `flat`, `placeholder`, `outlined` |
| Action button | `Button` | `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` |
| Text input | `Input` | `default`, `password`, `file`, with optional `leadingIcon` and `trailingSlot` |
| Option picker | `Select` | single select with optional leading icon |
| Boolean toggle | `Checkbox` | with optional `label` and `description` |
| View mode switcher | `SegmentedControl` | icon-only, icon+label, dot+label, `fullWidth`, `allowDeselect` |
| Context menu / actions | `DropdownMenu` | with sub-menus via `DropdownMenuSub` |
| Floating panel | `Popover` | controlled or uncontrolled, with `animate` |
| Hover hint | `Tooltip` | `top`, `bottom`, `left`, `right` placement |
| Page hierarchy | `Breadcrumbs` | with icons and click handlers |
| Vertical nav sidebar | Settings nav pattern in `src/pages/SettingsPage.jsx` | grouped sections with label + icon + active state — extract to component if reused |
| Data table | `Table` | composable: Header, Body, Row, Head, Cell |
| Data grid (sortable/filterable) | `AgGridTable` | AG Grid wrapper with themed dark/light |
| Dashboard tile | `Widget` | with WidgetHeader, WidgetBody, loading/error/empty states |
| Donut/pie chart | `DonutChart` | SVG-based with legend |

**Only create a new component if:**
1. No existing component can handle the pattern, even with a new variant
2. You've explicitly confirmed with the user that a new component is needed
3. The new component will be added to the design system barrel (`index.js`) and get a steering spec

**Token derivation rule — new components must trace their styling to an existing component:**
When building a new component, identify the closest existing sibling component (e.g., SegmentedControl → Button, Select → Input) and derive tokens directly from a specific variant of that component. Document which variant you're deriving from in the steering spec. "Close enough" semantic tokens are not acceptable — every bg, text, border, hover, active, and focus class must be traceable to the source variant's exact token strings. If no sibling component applies, derive from the token scale in `00-design-tokens.md` and document why.

**When using a design system component, never override its internal behavior via className at the call site.** If the component doesn't support what you need (wrapping, density, sizing, layout), extend the component's API with a new prop. The component owns its rendering — consumers configure it through props, not class overrides. This applies equally to building new elements inline: if a component exists for the pattern, use it; if its API falls short, extend it; if no component exists, ask the user before building one.

## 12. No nested widgets

Widgets must not contain other widgets. If a layout needs multiple content areas within a section, use nested sections (each with their own section header, actions, and scope). Widgets are leaf-level containers — they hold content, not other widgets.

```jsx
// ✅ Correct — nested section inside a parent section
<section> {/* Parent section */}
  <NtAlarmChartWidget />       {/* Widget (leaf) */}
  <section>                    {/* Nested section with its own header */}
    <h3>Service overview</h3>
    <MetricsGrid />
  </section>
</section>

// ❌ Wrong — widget containing another widget
<Widget>
  <Widget>...</Widget>
</Widget>
```

## 13. File references

- Token definitions: #[[file:src/design-system/tokens.cjs]]
- Tailwind config: #[[file:tailwind.config.js]]
- Design system exports: #[[file:src/design-system/index.js]]
- Preset CSS: #[[file:src/design-system/preset.css]]

## 14. No internal scroll on widgets

Widgets must never scroll internally. Never apply `overflow-y-auto`, `overflow-auto`, or `overflow-scroll` to a Widget or WidgetBody. The parent page or panel owns scrolling — widgets grow to their natural content height and the page scrolls as a whole.

```jsx
// ✅ Correct — widget grows, page scrolls
<Widget isDark>
  <WidgetHeader title="Insights" />
  <WidgetBody>…tall content…</WidgetBody>
</Widget>

// ❌ Wrong — widget scrolls internally
<WidgetBody className="overflow-y-auto h-[400px]">
  …tall content…
</WidgetBody>
```
