import { useNavigate } from 'react-router-dom'
import { House, TrendUp, Stack, Globe, ChartBar, Triangle, Database, Gear, Bell, User, MagnifyingGlass } from '@phosphor-icons/react'

const navItems = [
  { icon: House, label: 'Home', path: '/home' },
  { icon: TrendUp, label: 'Signals' },
  { icon: Stack, label: 'Services' },
  { icon: Globe, label: 'Map' },
  { icon: ChartBar, label: 'Metrics' },
  { icon: Triangle, label: 'Alarms', active: true },
  { icon: Database, label: 'Logs' },
  { icon: Gear, label: 'Settings' },
]

export default function ConsoleLayout({ children }) {
  const navigate = useNavigate()
  return (
    <div className="h-screen flex overflow-hidden">
      <div className="gradient-bg-dark" />
      <div className="content-layer h-full flex w-full">
        <nav className="w-14 border-r border-border-muted flex flex-col items-center py-3 gap-1 flex-shrink-0">
          <div className="mb-4 cursor-pointer" onClick={() => navigate('/home')}>
            <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
              <rect x="2" y="0" width="24" height="24" rx="12" stroke="#475569" strokeWidth="3.5" fill="none">
                <animate attributeName="rx" values="12;6;12" dur="6s" repeatCount="indefinite" />
              </rect>
              <rect x="3" y="25" width="22" height="4" rx="2" fill="#0ea5e9">
                <animate attributeName="width" values="22;16;22" dur="6s" repeatCount="indefinite" />
                <animate attributeName="x" values="3;6;3" dur="6s" repeatCount="indefinite" />
              </rect>
            </svg>
          </div>
          {navItems.map(({ icon: Icon, label, active, path }) => (
            <button
              key={label}
              onClick={() => path && navigate(path)}
              className={`relative group w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:text-foreground hover:bg-background-surface-2'}`}
              aria-label={label}
            >
              <Icon size={20} />
              <span className="absolute left-12 px-2 py-1 rounded-md bg-background-surface-2 border border-border-muted text-[11px] text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {label}
              </span>
            </button>
          ))}
        </nav>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 border-b border-border-muted px-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 bg-background-surface-1 rounded-lg px-3 py-1.5 w-80">
              <MagnifyingGlass size={14} className="text-foreground-muted" />
              <span className="text-body-s text-foreground-disabled">Search services, metrics, traces...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-status-active" />
                <span className="text-body-s text-foreground-muted">Live</span>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><Gear size={16} /></button>
              <button className="relative p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted">
                <Bell size={16} /><div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-outage" />
              </button>
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
