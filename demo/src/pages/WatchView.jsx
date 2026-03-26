import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Warning, CheckCircle } from '@phosphor-icons/react'
import { incident } from '../data/incident'

export default function WatchView() {
  const navigate = useNavigate()
  const [acknowledged, setAcknowledged] = useState(false)

  function handleAcknowledge() {
    setAcknowledged(true)
    setTimeout(() => navigate('/phone'), 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="gradient-bg-dark" />
      <div className="content-layer flex flex-col items-center gap-6">
        {/* Label */}
        <span className="text-[9px] font-bold tracking-wider uppercase text-foreground-muted">
          Apple Watch · 2:03 AM
        </span>

        {/* Watch frame */}
        <div className="relative w-[198px] h-[242px] rounded-[40px] border-2 border-border bg-background overflow-hidden flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-[9px] text-foreground-muted">2:03</span>
            <div className="w-1.5 h-1.5 rounded-full bg-status-outage animate-pulse" />
          </div>

          {/* Content */}
          <div className="flex-1 px-4 pb-3 flex flex-col">
            {/* Severity badge */}
            <div className="flex items-center gap-1.5 mb-2">
              <Warning size={12} className="text-status-outage" />
              <span className="text-[9px] font-bold tracking-wider uppercase text-status-outage">
                Critical
              </span>
            </div>

            {/* Summary */}
            <p className="text-[11px] leading-[15px] text-foreground mb-1.5">
              {incident.summary}
            </p>

            {/* Quick stats */}
            <div className="flex gap-3 mb-3">
              <div>
                <span className="text-[8px] text-foreground-muted block">Blast</span>
                <span className="text-[11px] font-semibold text-foreground">3 svc</span>
              </div>
              <div>
                <span className="text-[8px] text-foreground-muted block">Type</span>
                <span className="text-[11px] font-semibold text-foreground">Infra</span>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            {!acknowledged ? (
              <div className="flex gap-2">
                <button
                  onClick={handleAcknowledge}
                  className="flex-1 h-8 rounded-lg bg-primary text-[11px] font-semibold text-white flex items-center justify-center gap-1 active:scale-95 transition-transform"
                >
                  <CheckCircle size={12} weight="bold" />
                  Got it
                </button>
                <button
                  className="flex-1 h-8 rounded-lg bg-status-outage/20 border border-status-outage/30 text-[11px] font-semibold text-status-outage flex items-center justify-center active:scale-95 transition-transform"
                >
                  Escalate
                </button>
              </div>
            ) : (
              <div className="h-8 rounded-lg bg-status-active/10 border border-status-active/20 flex items-center justify-center gap-1.5">
                <CheckCircle size={12} className="text-status-active" weight="bold" />
                <span className="text-[11px] text-status-active font-semibold">Acknowledged</span>
              </div>
            )}
          </div>
        </div>

        {/* Hint */}
        <p className="text-body-s text-foreground-muted text-center max-w-[240px]">
          Tap "Got it" to acknowledge and continue to phone
        </p>
      </div>
    </div>
  )
}
