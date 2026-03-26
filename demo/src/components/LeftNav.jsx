import { SquaresFour, TrendUp, Stack, Globe, ChartBar, Triangle, Database, Gear } from '@phosphor-icons/react'

const items = [
  { icon: SquaresFour, label: 'Overview' },
  { icon: TrendUp, label: 'Signals' },
  { icon: Stack, label: 'Services' },
  { icon: Globe, label: 'Map' },
  { icon: ChartBar, label: 'Metrics' },
  { icon: Triangle, label: 'Alarms', active: true },
  { icon: Database, label: 'Logs' },
  { icon: Gear, label: 'Settings' },
]

export default function LeftNav() {
  return (
    <nav className="w-14 border-r border-border-muted flex flex-col items-center py-3 gap-1 flex-shrink-0 bg-background">
      <div className="mb-4">
        <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
          <circle cx="14" cy="12" r="9.5" stroke="#475569" strokeWidth="3.5" />
          <rect x="3" y="25" width="22" height="4" rx="2" fill="#0ea5e9" />
        </svg>
      </div>
      {items.map(({ icon: Icon, label, active }) => (
        <button key={label} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:text-foreground hover:bg-background-surface-2'}`} aria-label={label}>
          <Icon size={20} />
        </button>
      ))}
    </nav>
  )
}
