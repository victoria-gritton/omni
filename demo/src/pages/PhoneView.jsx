import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Warning, CaretRight } from '@phosphor-icons/react'
import { incident } from '../data/incident'

const RESPONDERS = [
  { initials: 'MK', name: 'You (on-call)', status: 'acked', color: 'bg-emerald-700' },
  { initials: 'AK', name: 'Alex K.', status: 'notified', color: 'bg-purple-700' },
]

const ALERT_TIMELINE = [
  { time: '2:03 AM', event: 'Alarm fired', type: 'alert' },
  { time: '2:03 AM', event: 'MK notified (push + watch)', type: 'notify' },
  { time: '2:03 AM', event: 'AK notified (push)', type: 'notify' },
  { time: '2:04 AM', event: 'MK acknowledged from watch', type: 'ack' },
]

export default function PhoneView() {
  const navigate = useNavigate()
  const [showTimeline, setShowTimeline] = useState(true)
  const [showLogs, setShowLogs] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center py-8 animate-[slideUp_0.4s_ease-out]">
      <div className="gradient-bg-dark" />
      <div className="content-layer flex flex-col items-center gap-6">
        <div className="w-full flex items-center justify-between">
          <span className="text-[11px] text-foreground-muted">iPhone · 2:05 AM</span>
          <a href="#/" className="text-[11px] text-link">← Demos</a>
        </div>

        <div className="w-[390px] h-[844px] rounded-[44px] border-2 border-border bg-background overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-8 pt-4 pb-2">
            <span className="text-[12px] text-foreground-muted font-semibold">2:05 AM</span>
            <div className="flex items-center gap-1.5">
              <svg width="10" height="12" viewBox="0 0 28 32" fill="none">
                <path d="M8 18C4 18 2 15 2 12.5C2 10 4 8 6.5 8C7 5 9.5 2 14 2C18.5 2 21 5 21.5 8C24 8.5 26 10.5 26 13C26 15.5 24 18 21 18" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="14" y1="10.5" x2="14" y2="15.5" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="11.5" y1="13" x2="16.5" y2="13" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-[11px] text-foreground-disabled">CloudWatch<sup className="text-primary">+</sup></span>
            </div>
          </div>

          <div className="flex-1 px-5 pb-4 flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <Warning size={18} weight="fill" className="text-status-outage" />
              <div>
                <span className="text-[12px] text-status-outage">Critical · {incident.id}</span>
                <h1 className="text-[17px] leading-[22px] font-semibold text-foreground">{incident.title}</h1>
              </div>
            </div>

            {/* AI Summary */}
            <div className="ai-glass-card p-3 mb-3">
              <p className="text-[13px] leading-[19px] text-foreground">
                <span className="text-orange-400 text-[12px] font-semibold mr-1">AI</span>
                Memory exhaustion — 6 OOM kills, ~2,400 failed orders, no deploys in 6h. Tasks stuck in restart loop at 512 MB limit.
              </p>
            </div>

            {/* Key numbers */}
            <div className="flex justify-between gap-2 mb-3">
              <div className="flex-1 rounded-lg bg-background-surface-1 border border-border-muted p-2.5 text-center">
                <span className="text-[10px] text-foreground-disabled uppercase tracking-wider block">Impact</span>
                <span className="text-[16px] font-semibold text-foreground">2.4K</span>
                <span className="text-[10px] text-foreground-disabled block">failed orders</span>
              </div>
              <div className="flex-1 rounded-lg bg-background-surface-1 border border-border-muted p-2.5 text-center">
                <span className="text-[10px] text-foreground-disabled uppercase tracking-wider block">p99</span>
                <span className="text-[16px] font-semibold text-foreground">2.4s</span>
                <span className="text-[10px] text-foreground-disabled block">baseline 200ms</span>
              </div>
              <div className="flex-1 rounded-lg bg-background-surface-1 border border-border-muted p-2.5 text-center">
                <span className="text-[10px] text-foreground-disabled uppercase tracking-wider block">Memory</span>
                <span className="text-[16px] font-semibold text-status-outage">98%</span>
                <span className="text-[10px] text-foreground-disabled block">512 MB limit</span>
              </div>
            </div>

            {/* Log context — collapsed */}
            <details open={showLogs} onToggle={(e) => setShowLogs(e.target.open)} className="mb-3">
              <summary className="text-[11px] text-foreground-muted cursor-pointer hover:text-foreground-secondary transition-colors flex items-center gap-1">
                <CaretRight size={10} className={`transition-transform ${showLogs ? 'rotate-90' : ''}`} />
                Logs: 6 OOM kills since 1:47 AM
              </summary>
              <div className="rounded-lg bg-background-surface-2 border border-border-muted p-2 mt-1.5 overflow-x-auto">
                {incident.logSnapshot.lines.slice(0, 4).map((line, i) => (
                  <div key={i} className="flex gap-2 text-[10px] font-mono leading-[14px]">
                    <span className="text-foreground-disabled flex-shrink-0">{line.ts}</span>
                    <span className={`flex-shrink-0 ${line.level === 'ERROR' ? 'text-status-outage' : 'text-status-blocked'}`}>{line.level}</span>
                    <span className="text-foreground-muted truncate">{line.msg}</span>
                  </div>
                ))}
              </div>
            </details>

            {/* Agent action — pre-authorized, needs approval */}
            <div className="mb-3">
              <div className="px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20 mb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-status-active" />
                  <span className="text-[10px] text-status-active">Pre-authorized action</span>
                </div>
                <span className="text-[13px] text-foreground font-medium block">Scale memory from 512 MB → 1 GB</span>
                <span className="text-[10px] text-foreground-muted block mt-0.5">Rolling restart, no downtime · matches your ECS scaling policy</span>
                <button className="w-full h-9 mt-2.5 rounded-lg bg-background-surface-1 border border-border-muted text-body-s font-medium text-foreground flex items-center justify-center">
                  Approve agent action
                </button>
              </div>
              <button onClick={() => navigate('/console')} className="w-full h-10 rounded-lg bg-background-surface-1 border border-border-muted text-body-s font-medium text-foreground flex items-center justify-center">
                View investigation in CloudWatch+
              </button>
            </div>

            {/* Responders */}
            <div className="mb-3">
              <span className="text-[10px] text-foreground-disabled uppercase tracking-wider block mb-1.5">Responders</span>
              <div className="flex gap-2">
                {RESPONDERS.map((r) => (
                  <div key={r.initials} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background-surface-1 border border-border-muted">
                    <div className={`w-5 h-5 rounded-full ${r.color} flex items-center justify-center text-[10px] font-bold text-white`}>{r.initials}</div>
                    <div>
                      <span className="text-[10px] text-foreground-secondary block leading-tight">{r.name}</span>
                      {r.status === 'acked'
                        ? <span className="text-[10px] text-status-active">Acknowledged</span>
                        : <button className="text-[10px] text-status-outage hover:underline">Escalate</button>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert timeline */}
            <details open={showTimeline} onToggle={(e) => setShowTimeline(e.target.open)} className="mb-3">
              <summary className="text-[10px] text-foreground-disabled uppercase tracking-wider cursor-pointer hover:text-foreground-muted transition-colors flex items-center gap-1">
                <CaretRight size={8} className={`transition-transform ${showTimeline ? 'rotate-90' : ''}`} />
                Alert timeline
              </summary>
              <div className="mt-1.5 space-y-0">
                {ALERT_TIMELINE.map((item, i) => (
                  <div key={i} className="flex gap-2 py-1">
                    <span className="text-[10px] text-foreground-disabled w-14 flex-shrink-0 font-mono">{item.time}</span>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${
                      item.type === 'alert' ? 'bg-status-outage' : item.type === 'ack' ? 'bg-status-active' : 'bg-foreground-disabled'
                    }`} />
                    <span className="text-[10px] text-foreground-muted">{item.event}</span>
                  </div>
                ))}
              </div>
            </details>

            <div className="flex-1" />
          </div>
        </div>

        <p className="text-body-m text-foreground text-center max-w-[500px]">
          Click "View investigation in CloudWatch+" on the phone to continue →
        </p>
      </div>
    </div>
  )
}
