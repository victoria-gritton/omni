import { useState } from 'react'
import {
  Lightning, CheckCircle, ArrowClockwise, CaretRight
} from '@phosphor-icons/react'
import { incident } from '../data/incident'

const RESPONDERS = [
  { initials: 'MK', name: 'You (on-call)', status: 'acked', color: 'bg-emerald-700' },
  { initials: 'AK', name: 'Alex K.', status: 'notified', color: 'bg-purple-700' },
]

// Mock sparkline points for mini charts
const MEMORY_POINTS = [45, 48, 52, 58, 65, 72, 78, 85, 90, 95, 97, 98, 98, 98]
const LATENCY_POINTS = [200, 210, 220, 280, 450, 800, 1200, 1800, 2100, 2400, 2400, 2400, 2400, 2400]
const ERROR_POINTS = [0, 0, 0, 0.1, 0.5, 2, 5, 8, 10, 12, 12.3, 12.3, 12.3, 12.3]

function Sparkline({ points, color, max, height = 40, width = 200 }) {
  const h = height
  const w = width
  const m = max || Math.max(...points)
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
        {alert && <div className="w-1.5 h-1.5 rounded-full bg-status-outage animate-pulse" />}
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

function DependencyMap() {
  return (
    <svg viewBox="0 0 280 180" className="w-full" fill="none">
      <line x1="140" y1="42" x2="50" y2="110" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.4">
        <animate attributeName="strokeDasharray" values="0 4 4 0;4 4" dur="1.5s" repeatCount="indefinite" />
      </line>
      <line x1="140" y1="46" x2="140" y2="100" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
      <line x1="140" y1="42" x2="230" y2="110" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
      <circle cx="140" cy="30" r="22" fill="#0a0e1a" stroke="#ef4444" strokeWidth="2">
        <animate attributeName="strokeOpacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="140" y="34" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="monospace">2.4s</text>
      <circle cx="158" cy="14" r="7" fill="#ef4444" />
      <text x="158" y="17.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">3</text>
      <text x="140" y="62" textAnchor="middle" fill="white" fillOpacity="0.8" fontSize="9" fontWeight="500">Payment</text>
      <circle cx="50" cy="115" r="18" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="50" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">1.8s</text>
      <text x="50" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Checkout</text>
      <circle cx="140" cy="115" r="18" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="140" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">900ms</text>
      <text x="140" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Order</text>
      <circle cx="230" cy="115" r="18" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="230" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">600ms</text>
      <text x="230" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Inventory</text>
      <circle cx="260" cy="30" r="12" fill="#0a0e1a" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.5" />
      <text x="260" y="34" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">3</text>
      <text x="260" y="50" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="8">Healthy</text>
    </svg>
  )
}

export default function ConsoleView() {
  const [fixing, setFixing] = useState(false)
  const [fixed, setFixed] = useState(false)

  function handleFix() {
    setFixing(true)
    setTimeout(() => { setFixing(false); setFixed(true) }, 2500)
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-6 py-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">{incident.title}</h1>
            <p className="text-[11px] text-foreground-disabled mt-1">INC-2847 · Acknowledged 2:04 AM · Investigating</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            {!fixed ? (
              <button
                onClick={handleFix}
                disabled={fixing}
                className="inline-flex items-center h-8 px-4 rounded-lg bg-primary text-body-s font-medium text-primary-foreground gap-2 hover:bg-slate-200 active:bg-slate-300 transition-all disabled:opacity-70"
              >
                {fixing ? (
                  <><ArrowClockwise size={14} className="animate-spin" /> Restarting...</>
                ) : (
                  <>Scale ECS memory</>
                )}
              </button>
            ) : (
              <div className="inline-flex items-center h-8 px-4 rounded-lg bg-status-active/10 border border-status-active/20 gap-2">
                <CheckCircle size={14} className="text-status-active" weight="fill" />
                <span className="text-body-s text-status-active font-medium">Resolved</span>
              </div>
            )}
            {RESPONDERS.map((r) => (
              <div key={r.initials} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background-surface-1 border border-border-muted">
                <div className={`w-5 h-5 rounded-full ${r.color} flex items-center justify-center text-[8px] font-bold text-white`}>{r.initials}</div>
                <div>
                  <span className="text-[10px] text-foreground-secondary block leading-tight">{r.name}</span>
                  {r.status === 'acked'
                    ? <span className="text-[8px] text-status-active">Acknowledged</span>
                    : <button className="text-[8px] text-status-outage hover:underline">Escalate</button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live metrics — this is what the phone can't show */}
        <div className="flex gap-3 mb-4">
          <MetricCard label="Memory" value="98%" points={MEMORY_POINTS} color="#ef4444" max={100} alert />
          <MetricCard label="p99 Latency" value="2.4s" points={LATENCY_POINTS} color="#f59e0b" max={3000} alert />
          <MetricCard label="Error Rate" value="12.3%" points={ERROR_POINTS} color="#ef4444" max={15} alert />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-3">
            {/* Action panel — the reason you opened your laptop */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-heading-s font-normal text-foreground">Recommended action</h3>
                <span className="text-[10px] text-foreground-disabled">AI confidence: High</span>
              </div>

              <div className="rounded-lg bg-background-surface-2/40 border border-border-muted p-3 mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-body-s text-foreground font-medium">Scale ECS task memory: 512 MB → 1 GB</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-foreground-disabled block">Method</span>
                    <span className="text-foreground-secondary">Rolling restart</span>
                  </div>
                  <div>
                    <span className="text-foreground-disabled block">Downtime</span>
                    <span className="text-status-active">None</span>
                  </div>
                  <div>
                    <span className="text-foreground-disabled block">Tasks affected</span>
                    <span className="text-foreground-secondary">4 tasks</span>
                  </div>
                  <div>
                    <span className="text-foreground-disabled block">Rollback</span>
                    <span className="text-foreground-secondary">Automatic if health check fails</span>
                  </div>
                  <div>
                    <span className="text-foreground-disabled block">ETA</span>
                    <span className="text-foreground-secondary">~3 minutes</span>
                  </div>
                  <div>
                    <span className="text-foreground-disabled block">Risk</span>
                    <span className="text-status-active">Low</span>
                  </div>
                </div>
              </div>

              {/* Log summary — inside the action panel, above the button */}
              <div className="mb-3">
                <span className="text-body-s text-foreground font-medium block mb-1">From logs</span>
                <p className="text-body-s text-foreground-secondary mb-1.5">
                  6 OOM kills since 1:47 AM. Memory hitting 512 MB limit every ~5 min. Restart loop. No deploys in 6h.
                </p>
                <details>
                  <summary className="text-[11px] text-foreground-muted cursor-pointer hover:text-foreground-secondary transition-colors flex items-center gap-1">
                    <CaretRight size={10} />
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

            {/* Affected services — clickable, not just text */}
            <div className="glass-card p-4">
              <h3 className="text-heading-s font-normal text-foreground mb-2">Affected services</h3>
              {incident.services.filter(s => s.status !== 'healthy').map((s) => (
                <ServiceRow key={s.name} {...s} />
              ))}
              <div className="pt-2 mt-1">
                <span className="text-[10px] text-foreground-disabled">{incident.services.filter(s => s.status === 'healthy').length} healthy services not shown</span>
              </div>
            </div>

            {/* AI investigation steps */}
            <div className="glass-card p-4">
              <h3 className="text-heading-s font-normal text-foreground mb-3">What AI checked</h3>
              <div className="space-y-0">
                {incident.reasoning.map((step) => (
                  <div key={step.step} className="flex items-start gap-3 py-2.5 border-b border-border-muted last:border-0">
                    <div className="mt-0.5">
                      {step.status === 'found'
                        ? <div className="w-2 h-2 rounded-full bg-status-blocked mt-1" />
                        : <div className="w-2 h-2 rounded-full bg-status-active mt-1" />
                      }
                    </div>
                    <div>
                      <span className="text-body-s text-foreground font-medium block">{step.action}</span>
                      <span className="text-body-s text-foreground-muted">{step.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Log summary + raw logs moved into action panel above */}
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div className="glass-card p-4">
              <h3 className="text-heading-s font-normal text-foreground mb-2">Service map</h3>
              <DependencyMap />
            </div>

            <div className="glass-card p-4">
              <h3 className="text-heading-s font-normal text-foreground mb-3">Timeline</h3>
              {incident.timeline.map((item, i) => {
                const isAlert = item.type === 'alert'
                const isLast = i === incident.timeline.length - 1
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${isAlert ? 'bg-status-outage' : 'bg-primary'}`} />
                      {!isLast && <div className="w-px flex-1 bg-border-muted mt-1" />}
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] text-foreground-muted block">{item.time}</span>
                      <span className="text-body-s text-foreground">{item.event}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
