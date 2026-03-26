---
inclusion: manual
---

# Navigation Patterns

Reference this when building navigation, breadcrumbs, tabs, or wayfinding UI.

## Breadcrumb navigation

Always show breadcrumbs at the top of detail/drill-down pages:

```jsx
<Breadcrumbs isDark={isDark} items={[
  { label: 'Home', onClick: () => navigate('/'), icon: <HomeIcon className="w-3.5 h-3.5" /> },
  { label: 'Services', onClick: () => navigate('/services') },
  { label: 'pet-clinic-frontend' },
]} />
```

- Place above the page title with `mb-2` spacing
- Last item = current page (non-clickable)

## Tab navigation

```jsx
<Tabs tabs={tabList} value={activeTab} onValueChange={setActiveTab} variant="compressed" isDark={isDark}>
  <TabsContent value="overview">…</TabsContent>
</Tabs>
```

- `variant="compressed"` for artifact/panel tabs
- `variant="default"` for page-level tabs
- Closable tabs: provide `onClose` when tabs are dynamic

## When to use what

| Pattern | Use for |
|---------|---------|
| Breadcrumbs | Hierarchical drill-down (service → detail) |
| Tabs | Parallel views within same context |
| LeftNav icons | Top-level app sections |
| DropdownMenu | Contextual actions on an element |

## Spacing

- Breadcrumbs to page title: `mb-2`
- Tabs to content: `pb-2` (compressed), `pb-4` (default)
- LeftNav width: `w-14` standard, `w-12` minimal
