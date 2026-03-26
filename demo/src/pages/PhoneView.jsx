import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Warning, WarningCircle, CheckCircle, ArrowRight,
  Lightning, ArrowClockwise, Sparkle, CaretDown, CaretUp
} from '@phosphor-icons/react'
import { incident } from '../data/incident'

function StatusBadge({ status }) {
  const config = {
    critical: { bg: 'bg-status-outage/10', border: 'border-status-outage/20', text: 'text-status-outage', label: 'Critical' },
    degraded: { bg: 'bg-status-blocked/10', border: 'border-status-blocked/20', text: 'text-status-blocked', label: 'Degraded' },
    healthy: { bg: 'bg-status-active/10', border: 'border-status-active/20', text: 'text-status-active', label: 'Healthy' },
  }
  const c = config[status]
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${c.bg} border ${c.border} ${c.text}`}>
      {c.label}
    </span>
  )
}

function TimelineItem({ item, isLast }) {
  const isAlert = item.type === 'alert'
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-2 h-2 rounded-full mt-1.5 ${isAlert ? 'bg-status-outage' : 'bg-primary'}`} />
        {!isLast && <div className="w-px flex-1 bg-border-muted mt-1" />}
      </div>
      <div className="pb-4">
        <span className="text-[10px] text-foreground-muted block">{item.time}</span>
        <span className="text-[12px] text-foreground leading-tight">{item.event}</span>
      </div>
    </div>
  )
}

function ReasoningStep({ step }) {
  const icon = step.status === 'found'
    ? <WarningCircle size={14} className="text-status-blocked" />
    : <CheckCircle size={14} className="text-status-active" />
  return (
    <div className="flex items-start gap-2 py-2 border-b border-border-muted last:border-0">
      <div className="mt-0.5">{icon}</div>
      <div>
        <span className="text-[12px] text-foreground block">{step.action}</span>
        <span className="text-[11px] text-foreground-muted">{step.result}</span>
      </div>
    </div>
  )
}

export default function PhoneView() {
  const navigate = useNavigate()
  const [showReasoning, setShowReasoning] = useState(false)
  const [remediating, setRemediating] = useState(null)

  function handleRemediate(id) {
    setRemediating(id)
    setTimeout(() => navigate('/console'), 1200)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="gradient-bg-dark" />
      <div className="content-layer flex flex-col items-center gap-6">
        {/* Label */}
        <span className="text-[9px] font-bold tracking-wider uppercase text-foreground-muted">
          iPhone · 2:05 AM
        </span>

        {/* Phone frame */}
        <div className="w-[390px] min-h-[700px] rounded-[44px] border-2 border-border bg-background overflow-hidden flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-8 pt-4 pb-2">
            <span className="text-[12px] text-foreground-muted font-semibold">2:05 AM</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-status-outage animate-pulse" />
              <span className="text-[10px] text-status-outage font-semibold">{incident.id}</span>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4">
            {/* Incident header */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Warning size={16} className="text-status-outage" />
                <span className="text-[9px] font-bold tracking-wider uppercase text-status-outage">
                  Critical Incident
                </span>
              </div>
              <h1 className="text-heading-l font-normal text-foreground">
                {incident.title}
              </h1>
            </div>

            {/* AI Brief */}
            <div className="ai-glass-card p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <Sparkle size={14} className="text-primary" />
                <span className="text-[9px] font-bold tracking-wider uppercase text-primary">
                  AI Analysis
                </span>
              </div>
              <p className="text-body-s text-foreground leading-relaxed">
                <span className="text-foreground font-semibold">Best guess:</span>{' '}
                {incident.brief.hypothesis}. Memory started spiking at 1:47am.
                Nothing was deployed in the last 6 hours. Incoming traffic looks normal.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-foreground-muted">Confidence:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-active/10 border border-status-active/20 text-[10px] font-semibold text-status-active">
                  High
                </span>
              </div>
            </div>

            {/* Blast radius */}
            <div className="glass-card p-4">
              <h3 className="text-heading-s font-normal text-foreground mb-3">
                Blast Radius
              </h3>
              <div className="space-y-2">
                {incident.services.map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between py-1.5 border-b border-border-muted last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        svc.status === 'critical' ? 'bg-status-outage' :
                        svc.status === 'degraded' ? 'bg-status-blocked' : 'bg-status-active'
                      }`} />
                      <span className="text-body-s text-foreground">{svc.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-foreground-muted">{svc.latency}</span>
                      <StatusBadge status={svc.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Reasoning (expandable) */}
            <div className="glass-card p-4">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkle size={14} className="text-primary" />
                  <span className="text-heading-s font-normal text-foreground">
                    How the AI figured this out
                  </span>
                </div>
                {showReasoning
                  ? <CaretUp size={14} className="text-foreground-muted" />
                  : <CaretDown size={14} className="text-foreground-muted" />
                }
              </button>
              {showReasoning && (
                <div className="mt-3">
                  {incident.reasoning.map((step) => (
                    <ReasoningStep key={step.step} step={step} />
                  ))}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="glass-card p-4">
              <h3 className="text-heading-s font-normal text-foreground mb-3">
                Timeline
              </h3>
              {incident.timeline.map((item, i) => (
                <TimelineItem key={i} item={item} isLast={i === incident.timeline.length - 1} />
              ))}
            </div>

            {/* Remediation actions */}
            <div className="glass-card p-4">
              <h3 className="text-heading-s font-normal text-foreground mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {incident.remediations.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRemediate(r.id)}
                    disabled={remediating !== null}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-hover ${
                      remediating === r.id
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-background-surface-1/50 border-border-muted hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lightning size={14} className="text-primary" />
                        <span className="text-body-s text-foreground font-semibold">{r.label}</span>
                      </div>
                      {remediating === r.id ? (
                        <ArrowClockwise size={14} className="text-primary animate-spin" />
                      ) : (
                        <ArrowRight size={14} className="text-foreground-muted" />
                      )}
                    </div>
                    <p className="text-[11px] text-foreground-muted mt-1 ml-5">{r.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Open console link */}
            <button
              onClick={() => navigate('/console')}
              className="w-full py-3 rounded-lg border border-border-muted text-body-s text-foreground-secondary hover:text-foreground hover:border-primary/30 transition-all duration-hover flex items-center justify-center gap-2"
            >
              Open full console
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
