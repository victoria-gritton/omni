# Design System for AI — Getting Started

This project uses a structured instruction system that enables AI coding agents to make consistent, on-brand design decisions without a designer in the loop.

## How it works

Design decisions are encoded once by humans, then consumed mechanically by AI in every session. Three layers work together:

1. **Closed token layer** — A fixed set of design tokens (colors, spacing, radius, shadows, motion) plus visualization color palettes (categorical, sequential, diverging). AI picks from this set instead of inventing values.
2. **Structured spec files** — Markdown instructions AI reads at session start. Covers foundations (tokens, typography, icons, viz colors), components, and composition patterns.
3. **Automated enforcement** — Audit scripts and hooks that catch violations and keep specs current.

## For engineers (building UI with AI)

**You don't need to do anything special.** The system works automatically:

- Kiro loads the token and rules specs into every session
- When you work on JSX/TSX files, typography specs load automatically
- When you ask about cards, buttons, tables, etc., component specs load automatically
- If you need page layout or data display guidance, type `#page-layout` or `#data-display` in chat

**Just describe what you want in natural language.** The AI will:
- Translate vague requests ("make it more rounded") to the nearest token
- Map raw pixel values ("make it 12px") to token equivalents
- Ask you when a value doesn't fit any existing token
- Never hardcode visual values

## For designers (tweaking visuals through AI)

**Prompt naturally.** Say things like:
- "Make the card corners softer"
- "The heading text should be more subtle"
- "Add more space between the cards"
- "Use a lighter background for the input"

The AI translates your intent to tokens automatically. If you give a specific value like "use #3B82F6", it maps it to the nearest semantic token or asks if you want to add a new one.

**Changes feed back automatically.** When you modify a component or token through AI, the steering specs update themselves to reflect the change. Next session, everyone gets the updated instructions.

## For maintainers (evolving the system)

### File structure

```
.kiro/steering/
  00-design-tokens.md          ← Always loaded. Closed token set + viz palettes.
  01-ui-rules.md               ← Always loaded. Core rules.
  02-icons.md                  ← Always loaded. Phosphor icon guidelines.
  typography.md                ← Loaded when working on JSX/TSX/CSS.
  components/
    breadcrumbs.md             ← Auto-loaded when AI detects breadcrumb work
    button.md                  ← Auto-loaded when AI detects button work
    card.md                    ← Auto-loaded when AI detects card work
    checkbox.md                ← Auto-loaded when AI detects checkbox work
    dropdown-menu.md           ← Auto-loaded when AI detects dropdown work
    input.md                   ← Auto-loaded when AI detects input work
    popover.md                 ← Auto-loaded when AI detects popover work
    segmented-control.md       ← Auto-loaded when AI detects segmented control work
    select.md                  ← Auto-loaded when AI detects select work
    table.md                   ← Auto-loaded when AI detects table work
    tabs.md                    ← Auto-loaded when AI detects tabs work
    tooltip.md                 ← Auto-loaded when AI detects tooltip work
    widget.md                  ← Auto-loaded when AI detects widget work
  patterns/
    data-display.md            ← Manual: type #data-display in chat
    form-patterns.md           ← Manual: type #form-patterns in chat
    navigation-patterns.md     ← Manual: type #navigation-patterns in chat
    page-layout.md             ← Manual: type #page-layout in chat
    state-bar.md               ← Manual: type #state-bar in chat

scripts/
  token-audit.js               ← Scans JSX for hardcoded values
  steering-health.js           ← Validates spec system health
  test-design-system.js        ← 38-test suite for the whole system
```

### Adding a new component spec

1. Create `.kiro/steering/components/{name}.md`
2. Add front matter: `inclusion: auto`, `name: {name}-component`, `description: ...`
3. Include sections: Import, Variants (when to use each), Props, Code example, Rules
4. Keep under 80 lines
5. Run `npm run audit:steering` to verify

Or just create the component file in `src/design-system/src/components/ui/` — the `auto-spec-new-component` hook generates a spec automatically.

### Adding a new token

1. Add the CSS variable to `src/design-system/tokens.cjs`
2. Add the Tailwind mapping to `tailwind.config.js`
3. The `sync-specs-after-edit` hook updates `00-design-tokens.md` automatically
4. Run `npm run audit:tokens` to verify

### Commands

```bash
npm run audit:tokens        # Check for hardcoded values in JSX
npm run audit:steering      # Check steering file health
npm run audit               # Run both
npm run test:design-system  # Run the full 38-test validation suite
```

### Enforcement hooks

| Hook | Trigger | What it does |
|------|---------|-------------|
| Design System Gate | Before any JSX/TSX write | Checks token compliance, component reuse, icon/heading rules |
| Token Audit on Save | JSX/TSX file saved | Catches hardcoded values |
| Sync Specs After Edit | Design system source file written | Updates steering specs to match code |
| Auto-Generate Component Spec | New component file created | Creates spec from template |

Context optimization notes:
- Design System Gate fires on all writes but skips non-JSX files (single-sentence prompt to minimize token cost)
- Sync Specs uses toolTypes regex to only fire on design system source files, not all writes
- The old Check Component Reuse hook was removed (merged into Design System Gate)

### Line limits (enforced by health check)

- Always-on files: 120 lines max
- Auto-inclusion component specs: 80 lines max
- Manual pattern specs: 200 lines max

### Key principle

**Be prescriptive, not descriptive.** Don't write "use appropriate spacing." Write "use `gap-3` (12px) between cards." AI can follow a lookup table. It cannot exercise taste.
