---
inclusion: manual
---

# Page Layout Patterns

Reference this when building new pages or major page sections.

## Standard page structure

```jsx
<div className="h-screen overflow-hidden flex flex-col">
  {/* Animated gradient background */}
  <div className="animated-gradient-bg" style={{ opacity: isDark ? 0.85 : 0.4 }} />

  <div className="content-layer flex flex-col h-full">
    {/* Global header */}
    <AppHeader isDark={isDark} />

    {/* Page content — scrollable */}
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Page title */}
        <h1 className={`text-heading-xl font-normal ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
          Page Title
        </h1>

        {/* Content sections */}
        <div className="space-y-3 mt-4">
          {/* Cards, tables, widgets */}
        </div>
      </div>
    </main>
  </div>
</div>
```

## Grid layouts

- 3-column card grid: `grid grid-cols-1 lg:grid-cols-3 gap-3`
- 2-column split: `grid grid-cols-1 lg:grid-cols-2 gap-3`
- Full-width sections: single Card spanning full width

## Spacing between sections

- Between cards in a grid: `gap-3` (12px)
- Between vertical sections: `space-y-3` (12px)
- Page padding: `px-6 py-6`
- Inside cards: `p-4` standard, `p-3` compact

## Section titles inside cards

```jsx
<h5 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>
  Section Title (count)
</h5>
```

## Canvas page with tabs

The CanvasPage uses artifact tabs across the top of a chat panel. Each tab renders a different content view. To add a new tab:

1. Add entry to `artifactTabs` state array in CanvasPage.jsx
2. Create the content component in `src/design-system/src/components/`
3. Add conditional render in the tab content area
4. Export from `src/design-system/index.js` if it's a reusable component
