import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  House, MagnifyingGlass, Pulse, MagnifyingGlassPlus,
  CodeBlock, GearSix, Star, Clock, Sparkle, Bell, User
} from '@phosphor-icons/react'

const navItems = [
  { icon: House, label: 'Home', subtitle: 'Overview & recommendations', path: '/home' },
  { icon: MagnifyingGlass, label: 'Explore', subtitle: 'Unified search & discovery' },
  { icon: Pulse, label: 'Monitor', subtitle: 'Active monitoring & alerts', path: '/console' },
  { icon: MagnifyingGlassPlus, label: 'Investigate', subtitle: 'Deep-dive analysis' },
  { icon: CodeBlock, label: 'Query Studio', subtitle: 'SQL & PromQL queries' },
  { icon: GearSix, label: 'Configure', subtitle: 'Settings & resources' },
]

const favorites = [
  { label: 'Production Dashboard' },
  { label: 'Error Rate Alerts' },
]

const recents = [
  { label: 'Lambda Errors' },
  { label: 'API Gateway Metrics' },
]

export default function ConsoleLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="gradient-bg-dark" />
      <div className="content-layer h-full flex w-full">
        {/* Sidebar */}
        <nav className="w-56 border-r border-border-muted flex flex-col flex-shrink-0 overflow-y-auto">
          {/* Logo */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-2">
            <svg width="24" height="28" viewBox="0 0 28 32" fill="none" className="flex-shrink-0">
              <circle cx="14" cy="12" r="9.5" stroke="#475569" strokeWidth="3.5" />
              <rect x="3" y="25" width="22" height="4" rx="2" fill="#0ea5e9" />
            </svg>
            <span className="text-body-s font-semibold text-foreground">CloudWatch Omni</span>
          </div>

          {/* Navigation section */}
          <div className="px-3 pt-2">
            <span className="text-[9px] font-bold tracking-wider uppercase text-foreground-muted px-2 mb-2 block">
              Navigation
            </span>
            <div className="space-y-0.5">
              {navItems.map(({ icon: Icon, label, subtitle, path }) => {
                const active = path && location.pathname === path
                return (
                  <button
                    key={label}
                    onClick={() => path && navigate(path)}
                    className={`w-full text-left rounded-lg flex items-start gap-2.5 px-2 py-2 transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-background-surface-2'
                    }`}
                    aria-label={label}
                  >
                    <Icon size={18} className={`flex-shrink-0 mt-0.5 ${active ? 'text-primary' : 'text-foreground-muted'}`} />
                    <div>
                      <span className={`text-body-s font-medium block leading-tight ${active ? 'text-primary' : 'text-foreground'}`}>
                        {label}
                      </span>
                      <span className="text-[10px] text-foreground-muted leading-tight">{subtitle}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Favorites section */}
          <div className="px-3 pt-4">
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <Star size={10} className="text-foreground-muted" />
              <span className="text-[9px] font-bold tracking-wider uppercase text-foreground-muted">
                Favorites
              </span>
            </div>
            <div className="space-y-0.5">
              {favorites.map(({ label }) => (
                <button
                  key={label}
                  className="w-full text-left rounded-lg px-2 py-1.5 text-body-s text-foreground-secondary hover:bg-background-surface-2 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent section */}
          <div className="px-3 pt-4">
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <Clock size={10} className="text-foreground-muted" />
              <span className="text-[9px] font-bold tracking-wider uppercase text-foreground-muted">
                Recent
              </span>
            </div>
            <div className="space-y-0.5">
              {recents.map(({ label }) => (
                <button
                  key={label}
                  className="w-full text-left rounded-lg px-2 py-1.5 text-body-s text-foreground-secondary hover:bg-background-surface-2 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* AI-Powered Navigation card */}
          <div className="px-3 pb-4 pt-4">
            <div className="rounded-lg border border-primary/15 bg-primary/[0.04] p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkle size={14} className="text-primary" />
                <span className="text-body-s font-medium text-foreground">AI-Powered Navigation</span>
              </div>
              <span className="text-[10px] text-foreground-muted leading-relaxed">
                Ask the assistant to guide you to the right place
              </span>
            </div>
          </div>
        </nav>

        {/* Main content area */}
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
              <button className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><GearSix size={16} /></button>
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
