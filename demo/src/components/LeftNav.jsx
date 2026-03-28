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
          <path d="M8 18C4 18 2 15 2 12.5C2 10 4 8 6.5 8C7 5 9.5 2 14 2C18.5 2 21 5 21.5 8C24 8.5 26 10.5 26 13C26 15.5 24 18 21 18" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" /><line x1="14" y1="10.5" x2="14" y2="15.5" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" /><line x1="11.5" y1="13" x2="16.5" y2="13" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
          
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
