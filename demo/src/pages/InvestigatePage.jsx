import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlass, Sparkle, Clock, CaretRight, ShareNetwork, Trash
} from '@phosphor-icons/react'

const activeInvestigations = [
  { id: 'INC-2847', title: 'order-service is timing out', severity: 'critical', started: '35 min ago', findings: 3, path: '/console', acknowledgedBy: [{ initials: 'MK', name: 'You', color: 'bg-emerald-700' }, { initials: 'AK', name: 'Alex K.', color: 'bg-purple-700' }] },
  { id: 'INC-3102', title: 'Payments service down', severity: 'critical', started: '20 min ago', findings: 2, path: '/devops-console', acknowledgedBy: [{ initials: 'SR', name: 'Sam R.', color: 'bg-sky-700' }] },
  { id: 'INV-1023', title: 'Lambda cold start increase after deploy', severity: 'warning', started: '2h ago', findings: 5, acknowledgedBy: [] },
  { id: 'INV-1021', title: 'DynamoDB throttling in order-service', severity: 'warning', started: 'Yesterday', findings: 7, acknowledgedBy: [] },
]

const SEVERITY_DOT = {
  critical: 'bg-status-outage',
  warning: 'bg-status-blocked',
  info: 'bg-primary',
}

const aiSuggestions = [
  { title: 'Correlate checkout errors with DB latency', description: 'I noticed checkout-service 5xx errors spike when DynamoDB read latency exceeds 50ms. Want me to build a correlation view?' },
  { title: 'Compare pre/post deploy metrics', description: 'payment-service was deployed 4 hours ago. I can compare key metrics before and after to identify regressions.' },
]

export default function InvestigatePage() {
  const navigate = useNavigate()
  return (
    <div className="px-6 py-6">
      <h1 className="text-[22px] leading-[28px] font-normal tracking-tighter text-foreground mb-1">Investigate</h1>
      <p className="text-body-m text-foreground-muted mb-4">Deep-dive analysis and AI-assisted troubleshooting</p>

      <div className="relative mb-4">
        <div className="flex items-center gap-2 h-10 rounded-xl bg-background-surface-1 border border-border-muted px-4 focus-within:border-primary/40 transition-colors">
          <input type="text" placeholder="Describe what you're seeing — e.g., Why are checkout errors increasing since 2pm?" className="flex-1 bg-transparent text-body-m text-foreground placeholder:text-foreground-disabled focus:outline-none" />
          <MagnifyingGlass size={16} className="text-foreground-muted flex-shrink-0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {aiSuggestions.map((s) => (
          <div key={s.title} className="glass-card p-4 cursor-pointer hover:border-primary/20 transition-colors" style={{ borderColor: 'rgba(51,65,85,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkle size={12} className="text-primary" />
              <span className="text-body-s font-medium text-foreground">{s.title}</span>
            </div>
            <p className="text-body-s text-foreground-muted">{s.description}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-heading-m font-normal text-foreground">Investigations ({activeInvestigations.length})</h3>
        </div>

        {/* Search bar — full width */}
        <div className="flex items-center gap-2 h-8 rounded-lg bg-background-surface-2 border border-border-muted px-3 mb-3">
          <MagnifyingGlass size={12} className="text-foreground-muted flex-shrink-0" />
          <input type="text" placeholder="Search investigations..." className="flex-1 bg-transparent text-body-s text-foreground placeholder:text-foreground-disabled focus:outline-none" />
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.5fr)_minmax(0,1fr)_minmax(0,0.5fr)] gap-2.5 px-2 pb-2 border-b border-border-muted">
          <span className="text-[10px] font-bold tracking-wider uppercase text-foreground-muted">Investigation</span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-foreground-muted">Incident</span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-foreground-muted">Triggered</span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-foreground-muted">Findings</span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-foreground-muted">Acknowledged by</span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-foreground-muted text-right">Actions</span>
        </div>

        {/* Rows */}
        <div className="space-y-0">
          {activeInvestigations.map((inv) => (
            <div key={inv.id} onClick={() => inv.path && navigate(inv.path)} className="grid grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.5fr)_minmax(0,1fr)_minmax(0,0.5fr)] gap-2.5 items-center py-3 px-2 border-b border-border-muted last:border-0 cursor-pointer hover:bg-background-surface-2/50 rounded-lg transition-colors">
              {/* Investigation */}
              <div className="min-w-0 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[inv.severity] || SEVERITY_DOT.info}`} />
                <span className="text-body-s text-foreground font-medium truncate">{inv.title}</span>
              </div>

              {/* Incident */}
              <span className="text-[11px] text-foreground-muted font-mono">{inv.id}</span>

              {/* Triggered */}
              <span className="text-[11px] text-foreground-muted flex items-center gap-1">
                <Clock size={10} className="flex-shrink-0" /> {inv.started}
              </span>

              {/* Findings */}
              <span className="text-[11px] text-foreground-muted">{inv.findings}</span>

              {/* Acknowledged by */}
              <div>
                {inv.acknowledgedBy.length > 0 ? (
                  <div className="flex -space-x-1.5">
                    {inv.acknowledgedBy.map((a) => (
                      <div key={a.initials} title={a.name} className={`w-6 h-6 rounded-full ${a.color} flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-background`}>
                        {a.initials}
                      </div>
                    ))}
                  </div>
                ) : (
                  <button onClick={(e) => e.stopPropagation()} className="text-[11px] text-link hover:underline">
                    Acknowledge
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted transition-colors" aria-label="Share">
                  <ShareNetwork size={14} />
                </button>
                <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted hover:text-status-outage transition-colors" aria-label="Delete">
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
