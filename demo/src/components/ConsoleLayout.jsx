import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { House, Atom, Bell, ChartBar, Globe, TrendUp, Database, Gear, Lifebuoy, MagnifyingGlass, User } from '@phosphor-icons/react'

const navItems = [
  { icon: House, label: 'Home', path: '/home' },
  { icon: Atom, label: 'Agents' },
  { icon: Bell, label: 'Alarms', path: '/console' },
  { icon: ChartBar, label: 'Dashboards' },
  { icon: Globe, label: 'Application Map' },
  { icon: TrendUp, label: 'Metrics' },
  { icon: Database, label: 'Logs' },
  { icon: Gear, label: 'Settings' },
  { icon: Lifebuoy, label: 'Getting Started' },
]

export default function ConsoleLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="gradient-bg-dark" />
      <div className="content-layer h-full flex w-full">
        <nav className={`${expanded ? 'w-48' : 'w-14'} border-r border-border-muted flex flex-col py-3 gap-1 flex-shrink-0 transition-all duration-200`}>
          <div className={`mb-4 cursor-pointer flex items-center gap-2 ${expanded ? 'px-3' : 'justify-center'}`} onClick={() => setExpanded(!expanded)}>
            <svg width="28" height="32" viewBox="0 0 28 32" fill="none" className="flex-shrink-0">
              <circle cx="14" cy="12" r="9.5" stroke="#475569" strokeWidth="3.5" />
              <rect x="3" y="25" width="22" height="4" rx="2" fill="#0ea5e9" />
            </svg>
            {expanded && <span className="text-body-s font-semibold text-foreground">CloudWatch Omni</span>}
          </div>
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = path && location.pathname === path
            return (
              <button
                key={label}
                onClick={() => path && navigate(path)}
                className={`relative group h-10 rounded-lg flex items-center gap-2 transition-colors ${expanded ? 'px-3 mx-2' : 'w-10 justify-center mx-auto'} ${active ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:text-foreground hover:bg-background-surface-2'}`}
                aria-label={label}
              >
                <Icon size={20} className="flex-shrink-0" />
                {expanded && <span className="text-body-s whitespace-nowrap">{label}</span>}
                {!expanded && (
                  <span className="absolute left-12 px-2 py-1 rounded-md bg-background-surface-2 border border-border-muted text-[11px] text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 border-b border-border-muted px-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 bg-background-surface-1 rounded-lg px-3 py-1.5 w-80">
              <MagnifyingGlass size={14} className="text-foreground-muted" />
              <span className="text-body-s text-foreground-disabled">Search services, metrics, traces...</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#/" className="text-body-s text-link">← Demos</a>
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
