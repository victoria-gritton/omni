import { useState } from 'react'
import { CaretRight } from '@phosphor-icons/react'
import { incident } from '../data/incident'

const RESPONDERS = [
  { initials: 'MK', name: 'You (on-call)', status: 'acked', color: 'bg-emerald-700' },
  { initials: 'AK', name: 'Alex K.', status: 'notified', color: 'bg-purple-700' },
]

const MEMORY_POINTS = [45, 48, 52, 58, 65, 72, 78, 85, 90, 95, 97, 98, 98, 98]
const LATENCY_POINTS = [200, 210, 220, 280, 450, 800, 1200, 1800, 2100, 2400, 2400, 2400, 2400, 2400]
const ERROR_POINTS = [0, 0, 0, 0.1, 0.5, 2, 5, 8, 10, 12, 12.3, 12.3, 12.3, 12.3]

function Sparkline({ points, color, max, height = 40, width = 200 }) {
  const h = height, w = width, m = max || Math.max(...points)
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - (p / m) * h
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} fill="none">
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={color} fillOpacity="0.08" />
    </svg>
  )
}

function MetricCard({ label, value, unit, points, color, max, alert }) {
  return (
    <div className="glass-card p-3 flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-foreground-disabled uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-heading-l font-normal ${alert ? 'text-status-outage' : 'text-foreground'}`}>{value}</span>
        {unit && <span className="text-[11px] text-foreground-disabled">{unit}</span>}
      </div>
      <Sparkline points={points} color={color} max={max} height={32} />
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-foreground-disabled">1:47 AM</span>
        <span className="text-[9px] text-foreground-disabled">now</span>
      </div>
    </div>
  )
}

function ServiceRow({ name, status, latency, baseline }) {
  const isHealthy = status === 'healthy'
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border-muted last:border-0">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        status === 'critical' ? 'bg-status-outage' : status === 'degraded' ? 'bg-status-blocked' : 'bg-status-active'
      }`} />
      <span className="text-body-s text-foreground flex-1">{name}</span>
      <span className={`text-[11px] font-mono ${isHealthy ? 'text-foreground-muted' : 'text-status-outage'}`}>{latency}</span>
      <span className="text-[10px] text-foreground-disabled">/ {baseline}</span>
      <CaretRight size={12} className="text-foreground-disabled" />
    </div>
  )
}

export default function ConsoleView() {
  const [showLogs, setShowLogs] = useState(false)
  const [slackPosted, setSlackPosted] = useState(false)

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">{incident.title}</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-status-active/10 border border-status-active/20 text-[10px] font-semibold text-status-active">Ack by MK</span>
        </div>
        <p className="text-[11px] text-foreground-muted">INC-2847 · Alarm: <span className="text-foreground-secondary">order-service-memory-high</span> · Acknowledged 2:04 AM</p>

        <div className="mt-4">
          {/* Main content — full width now */}
          <div className="space-y-3">
            {/* Agent Summary — matches Maryam's pattern */}
            <div className="ai-glass-card p-4">
              <span className="text-body-s font-semibold text-orange-400">Agent Summary</span>
              <p className="text-body-m text-foreground leading-relaxed mt-2">
                ECS tasks on order-service-east-2 hit their <strong>512 MB memory limit</strong>. Tasks have been OOM-killed 6 times since 1:52 AM and are stuck in a restart loop. <strong>~2,400 orders failed</strong> in the last 10 minutes. No deploys in 6 hours — the workload outgrew the allocation.
              </p>

              {/* Impact numbers inline */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center p-2 rounded-lg bg-background-surface-2/30">
                  <div className="text-lg font-bold text-foreground">2.4K</div>
                  <div className="text-[9px] text-foreground-muted">Failed Orders</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-background-surface-2/30">
                  <div className="text-lg font-bold text-foreground">16 min</div>
                  <div className="text-[9px] text-foreground-muted">Duration</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-background-surface-2/30">
                  <div className="text-lg font-bold text-foreground">0</div>
                  <div className="text-[9px] text-foreground-muted">Data Loss</div>
                </div>
              </div>

              {/* Recommended action — above logs */}
              <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-body-s font-semibold text-primary block">Recommended action</span>
                    <span className="text-body-s text-foreground-muted">Scale ECS task memory from 512 MB → 1 GB (rolling restart, no downtime)</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button className="inline-flex items-center h-9 px-5 rounded-lg bg-primary text-primary-foreground text-body-s font-semibold hover:bg-primary/80 transition-all">
                      Approve agent action
                    </button>
                    <button className="inline-flex items-center h-9 px-5 rounded-lg bg-background-surface-2 border border-border-muted text-foreground text-body-s font-semibold hover:bg-background-surface-2/80 transition-all">
                      Do it manually
                    </button>
                  </div>
                </div>
              </div>

              {/* Log summary */}
              <div className="mt-3 pt-3 border-t border-border-muted">
                <span className="text-body-s text-foreground font-medium">From logs</span>
                <p className="text-body-s text-foreground-muted mt-1">6 OOM kills since 1:47 AM. Memory hitting 512 MB limit every ~5 min. Restart loop. No deploys in 6h.</p>
                <details open={showLogs} onToggle={(e) => setShowLogs(e.target.open)} className="mt-1.5">
                  <summary className="text-[11px] text-foreground-muted cursor-pointer hover:text-foreground-secondary transition-colors flex items-center gap-1">
                    <CaretRight size={10} className={`transition-transform ${showLogs ? 'rotate-90' : ''}`} />
                    Raw logs · {incident.logSnapshot.logGroup} ({incident.logSnapshot.lines.length} lines)
                  </summary>
                  <div className="rounded-lg bg-background-surface-2/40 border border-border-muted p-3 mt-2 overflow-x-auto">
                    {incident.logSnapshot.lines.map((line, i) => (
                      <div key={i} className="flex gap-3 text-[11px] font-mono leading-[18px]">
                        <span className="text-foreground-disabled flex-shrink-0">{line.ts}</span>
                        <span className={`flex-shrink-0 w-12 ${line.level === 'ERROR' ? 'text-status-outage' : 'text-status-blocked'}`}>{line.level}</span>
                        <span className="text-foreground-secondary">{line.msg}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>

            </div>

            {/* Live metric charts — underneath */}
            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Memory" value="98%" points={MEMORY_POINTS} color="#ef4444" max={100} alert />
              <MetricCard label="p99 Latency" value="2.4s" points={LATENCY_POINTS} color="#f59e0b" max={3000} alert />
              <MetricCard label="Error Rate" value="12.3%" points={ERROR_POINTS} color="#ef4444" max={15} alert />
            </div>

            {/* Responders + Related side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4">
                <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-3">Responders</h3>
                <div className="space-y-2">
                  {RESPONDERS.map((r) => (
                    <div key={r.initials} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${r.color} flex items-center justify-center text-[9px] font-bold text-white`}>{r.initials}</div>
                      <div>
                        <span className="text-body-s text-foreground block leading-tight">{r.name}</span>
                        {r.status === 'acked'
                          ? <span className="text-[9px] text-status-active">Acknowledged</span>
                          : <button className="text-[9px] text-status-outage hover:underline">Escalate</button>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-4">
                <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-3">Related</h3>
                <div className="space-y-1.5">
                  <div className="px-2 py-1.5 rounded-lg hover:bg-background-surface-2/30 text-body-s text-foreground-secondary hover:text-foreground cursor-pointer transition-colors">Slack thread</div>
                  <div className="px-2 py-1.5 rounded-lg hover:bg-background-surface-2/30 text-body-s text-foreground-secondary hover:text-foreground cursor-pointer transition-colors">ECS task definition</div>
                  <div className="px-2 py-1.5 rounded-lg hover:bg-background-surface-2/30 text-body-s text-foreground-secondary hover:text-foreground cursor-pointer transition-colors">CloudWatch alarm</div>
                </div>
              </div>
            </div>

            {/* Affected Services */}
            <div className="glass-card p-4">
              <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-2">Affected Services</h3>
              {incident.services.filter(s => s.status !== 'healthy').map((s) => (
                <ServiceRow key={s.name} {...s} />
              ))}
              <div className="pt-2 mt-1">
                <span className="text-[10px] text-foreground-disabled">{incident.services.filter(s => s.status === 'healthy').length} healthy services not shown</span>
              </div>
            </div>

            {/* What AI checked */}
            <div className="glass-card p-4">
              <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-3">What AI checked</h3>
              <div className="space-y-2 text-body-s">
                {incident.reasoning.map((step) => (
                  <div key={step.step} className="flex gap-2">
                    <span className={`font-bold w-4 ${step.status === 'found' ? 'text-status-blocked' : 'text-status-active'}`}>{step.step}</span>
                    <span className="text-foreground"><strong>{step.action}</strong> — {step.result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
