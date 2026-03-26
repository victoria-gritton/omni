---
inclusion: manual
---

# Form Patterns

Reference this when building forms, settings panels, or data entry interfaces.

## Standard form layout

```jsx
<Card variant="glass" isDark={isDark} className="p-6 space-y-4">
  <h4 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
    Form Title
  </h4>
  <div className="space-y-3">
    <div>
      <label className={`text-body-s font-medium mb-1 block ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>
        Field Label
      </label>
      <Input isDark={isDark} placeholder="Enter value" />
    </div>
    <div>
      <label className={`text-body-s font-medium mb-1 block ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>
        Region
      </label>
      <Select isDark={isDark} options={regions} placeholder="Select region" />
    </div>
  </div>
  <div className="flex justify-end gap-2 pt-2">
    <Button isDark={isDark} variant="outline">Cancel</Button>
    <Button isDark={isDark} variant="default">Save</Button>
  </div>
</Card>
```

## Field spacing

- Between fields: `space-y-3` (12px)
- Label to input: `mb-1` (4px)
- Form sections: `space-y-4` (16px)
- Action buttons: `pt-2` gap from last field, `gap-2` between buttons

## Labels

- Font: `text-body-s font-medium`
- Color: `text-foreground-secondary` (dark) / `text-gray-700` (light)
- Always use `<label>` elements

## Validation

- Error state: pass `error` prop to Input/Select
- Error message below field: `text-body-s text-destructive mt-1`
- Required indicator: append `*` to label text

## Button placement

- Primary action (submit/save) on the right
- Secondary action (cancel/back) to its left
- Use `flex justify-end gap-2`
