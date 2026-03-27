import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassPlus, MagnifyingGlass, Sparkle, Lightning,
  Clock, Warning, WarningCircle, CheckCircle, CaretRight
} from '@phosphor-icons/react'

const activeInvestigations = [
  { id: 'INC-2847', title: 'payment-service is timing out', status: 'in-progress', started: '35 min ago', findings: 3, severity: 'high', path: '/console' },
  { id: 'INV-1023', title: 'Lambda cold start increase after deploy', status: 'in-progress', started: '2h ago', findings: 5, severity: 'medium' },
  { id: 'INV-1021', title: 'DynamoDB throttling in order-service', status: 'resolved', started: 'Yesterday', findings: 7, severity: 'high' },
]

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
        <h3 className="text-heading-s font-normal text-foreground mb-3">Investigations ({activeInvestigations.length})</h3>
        <div className="space-y-0">
          {activeInvestigations.map((inv) => (
            <div key={inv.id} onClick={() => inv.path && navigate(inv.path)} className="flex items-center gap-3 py-3 border-b border-border-muted last:border-0 cursor-pointer hover:bg-background-surface-2/50 -mx-2 px-2 rounded-lg transition-colors">
              {inv.status === 'resolved'
                ? <CheckCircle size={16} className="text-status-active flex-shrink-0" />
                : inv.severity === 'high'
                  ? <WarningCircle size={16} className="text-status-outage flex-shrink-0" />
                  : <Warning size={16} className="text-status-blocked flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-body-s text-foreground font-medium">{inv.title}</span>
                  <span className="text-[10px] text-foreground-muted px-1.5 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">{inv.id}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-foreground-muted flex items-center gap-1"><Clock size={10} /> {inv.started}</span>
                  <span className="text-[10px] text-foreground-muted">{inv.findings} findings</span>
                </div>
              </div>
              <CaretRight size={14} className="text-foreground-disabled flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
