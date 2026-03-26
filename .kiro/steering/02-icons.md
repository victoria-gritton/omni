---
inclusion: fileMatch
fileMatchPattern: "**/*.jsx,**/*.tsx"
---

# Icon Usage Guidelines — Phosphor Icons

This project uses [Phosphor Icons](https://phosphoricons.com/) as the sole icon library. Package: `@phosphor-icons/react`.

## 1. Package & Import Rules

```jsx
// ✅ Named imports only
import { ArrowRight, Warning, ChatTeardropDots } from '@phosphor-icons/react';

// ❌ Never wildcard
import * as Icons from '@phosphor-icons/react';

// ❌ Never use the deprecated package
import { X } from 'phosphor-react';
```

- No `<Icon>` wrapper component — use Phosphor components directly.
- No other icon libraries (Heroicons, Lucide, FontAwesome, etc.).
- No emoji as icon substitutes in UI.
- No inline SVG image assets for UI icons.

## 2. Weight (Variant) Rules

| Weight | Status | Usage |
|--------|--------|-------|
| `regular` | ✅ Default | All general UI icons. No explicit prop needed. |
| `bold` | ✅ Allowed | Checkbox Check/Minus icons only. |
| `fill` | ✅ Allowed | Active/selected state indicators only (e.g., filled star for favorited, filled bookmark for saved). |
| `duotone` | 🚫 Banned | Replace with `regular`. |
| `thin` | 🚫 Banned | Do not use. |
| `light` | 🚫 Banned | Do not use. |

If no `weight` prop is specified, Phosphor defaults to `regular`. Only add the prop when you need `bold` or `fill`.

## 3. Sizing Rules

| Context | Size | Example |
|---------|------|---------|
| Compact labels, metadata | `size={12}` | Inline status dots |
| Small inline icons | `size={14}` | Table cell icons, breadcrumb separators |
| Default UI icons | `size={16}` | Nav items, input icons, most buttons |
| Medium emphasis | `size={20}` | Card headers, section titles |
| Large / hero icons | `size={24}` | Page headers, empty states |

Button size mapping:
- `size="sm"` buttons → `size={14}` icons
- `size="default"` buttons → `size={16}` icons
- `size="lg"` buttons → `size={20}` icons

Always use the `size` prop on the component. Never size icons via CSS `width`/`height`.

## 4. Color & Theming

Icons inherit `currentColor` by default. Apply color through the parent element or via `className`:

```jsx
// ✅ Inherit from parent
<span className="text-foreground-secondary"><Gear size={16} /></span>

// ✅ Direct className
<Gear size={16} className="text-foreground-muted" />

// ❌ Never hardcode color
<Gear size={16} color="#64748b" />
<Gear size={16} style={{ color: '#64748b' }} />
```

Use semantic color tokens: `text-foreground`, `text-foreground-secondary`, `text-foreground-muted`, `text-foreground-disabled`.

## 5. Accessibility

Decorative icons (next to visible text label):
```jsx
<button><ArrowRight size={16} /> Continue</button>
```
No extra attributes needed — the text provides the label.

Semantic icons (no visible text):
```jsx
<button aria-label="Settings"><Gear size={16} /></button>
```
Always wrap icon-only buttons with `<Tooltip>` (see UI Rules #9).

## 6. Consistency Map

Use the same icon for the same concept everywhere. Do not improvise alternatives.

| Concept | Icon | Notes |
|---------|------|-------|
| Chat / AI prompt | `ChatTeardropDots` | |
| Settings / config | `Gear` | |
| Search | `MagnifyingGlass` | |
| Close / dismiss | `X` | |
| Add / create | `Plus` | |
| Delete / remove | `Trash` | |
| Edit | `PencilSimple` | |
| Copy | `Copy` | |
| Download | `DownloadSimple` | |
| Upload | `UploadSimple` | |
| Filter | `Funnel` | |
| Sort ascending | `SortAscending` | |
| Sort descending | `SortDescending` | |
| Expand / collapse | `CaretDown` / `CaretUp` | |
| Navigate forward | `CaretRight` | |
| Navigate back | `CaretLeft` | |
| External link | `ArrowSquareOut` | |
| Refresh / reload | `ArrowClockwise` | |
| Info | `Info` | |
| Warning | `Warning` | |
| Error / danger | `WarningCircle` | |
| Success / check | `CheckCircle` | |
| User / profile | `User` | |
| Notification / bell | `Bell` | |
| Calendar / date | `Calendar` | |
| Clock / time | `Clock` | |
| Drag handle | `DotsSixVertical` | |
| More actions | `DotsThree` | Horizontal dots |
| Pin | `PushPin` | |
| Bookmark | `BookmarkSimple` | |
| Eye / visibility | `Eye` / `EyeSlash` | |
| Lock / unlock | `Lock` / `LockOpen` | |
| Link | `Link` | |
| Code | `Code` | |
| Terminal | `Terminal` | |
| Folder | `Folder` | |
| File | `File` | |
| Image | `Image` | |
| Chart / analytics | `ChartBar` | |
| Cloud | `Cloud` | |
| Database | `Database` | |
| Key / API key | `Key` | |
| Shield / security | `Shield` | |
| Lightning / quick action | `Lightning` | |
| Sparkle / AI | `Sparkle` | |
| Arrow right (flow) | `ArrowRight` | |
| Checkbox check | `Check` | `weight="bold"` |
| Checkbox indeterminate | `Minus` | `weight="bold"` |

If you need an icon not on this list, any Phosphor icon is allowed — but once chosen for a concept, use it consistently everywhere.

## 7. Prohibited Patterns

```jsx
// ❌ Don't use SVG paths directly
<svg viewBox="0 0 24 24"><path d="M12..." /></svg>

// ❌ Don't override SVG internals
<Gear size={16} className="[&>path]:stroke-red-500" />

// ❌ Don't mix icon libraries
import { HiOutlineCog } from 'react-icons/hi';

// ❌ Don't use emoji as icons
<span>⚙️</span>

// ❌ Don't use banned weights
<Gear weight="duotone" />
<Gear weight="thin" />
<Gear weight="light" />
```
