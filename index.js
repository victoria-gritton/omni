/**
 * SSO Rhythm — Public API
 *
 * Install:
 *   npm install @sso/rhythm
 *
 * Usage:
 *   import { Button, Card, cn } from '@sso/rhythm'
 *
 * Tailwind plugin (in tailwind.config.js):
 *   plugins: [require('@sso/rhythm/plugin')]
 *
 * Tokens (JS access):
 *   const tokens = require('@sso/rhythm/tokens')
 *
 * Preset CSS (in your entry CSS):
 *   @import '@sso/rhythm/preset.css';
 */

// ── Utilities ──
export { cn, formatNumber, formatDuration, formatPercent } from './src/components/ui/lib/utils'

// ── UI Primitives (alphabetical) ──
export { default as Badge } from './src/components/ui/badge'
export { default as Breadcrumbs } from './src/components/ui/breadcrumbs'
export { default as Button } from './src/components/ui/button'
export { default as Card, cardStyles, cardStylesFull } from './src/components/ui/card'
export { default as Checkbox } from './src/components/ui/checkbox'
export { default as CssOrb } from './src/components/ui/css-orb'
export { default as DonutChart } from './src/components/ui/donut-chart'
export { default as ParticleOrb } from './src/components/ui/particle-orb'
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './src/components/ui/dropdown-menu'
export { default as Input } from './src/components/ui/input'
export { default as SegmentedControl } from './src/components/ui/segmented-control'
export { Popover, PopoverTrigger, PopoverContent } from './src/components/ui/popover'
export { default as Select } from './src/components/ui/select'
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './src/components/ui/table'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './src/components/ui/tabs'
export { default as Tooltip } from './src/components/ui/tooltip'
export {
  Widget,
  WidgetHeader,
  WidgetBody,
  WidgetFooter,
  WidgetLoading,
  WidgetError,
  WidgetEmpty,
} from './src/components/ui/widget'

// ── Layout Components ──
export { default as AppHeader } from './src/components/AppHeader'

// ── Onboarding ──
export { default as GettingStartedChecklist } from './src/components/GettingStartedChecklist'

// ── Composite Components ──
export { default as AgGridTable } from './src/components/ui/components/data-table'

// ── AI Components (shadcn-io) ──
export { default as ChatInput } from './src/components/shadcn-io/chat-input'
