import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Warning, CheckCircle, ArrowUp } from '@phosphor-icons/react'
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
        <div className="w-full flex items-center justify-between">
          <span className="text-[11px] text-foreground-muted">Apple Watch · 45mm</span>
          <a href="#/" className="text-[11px] text-link">← Demos</a>
        </div>

        {/* Watch bezel */}
        <div className="relative">
          {/* Outer bezel */}
          <div className="w-[210px] h-[256px] rounded-[52px] bg-[#1a1a1a] p-[6px] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]">
            {/* Screen */}
            <div className="w-full h-full rounded-[46px] bg-black overflow-hidden relative flex flex-col">

              {/* Red urgency glow at top */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-red-600/20 to-transparent pointer-events-none" />

              {/* Status bar */}
              <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-1">
                <span className="text-[10px] font-medium text-white/60">2:03</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="relative z-10 flex-1 px-4 pb-4 flex flex-col overflow-y-auto">

                {/* Brand + AI badge */}
                <div className="flex items-center justify-center gap-1.5 mt-1 mb-1.5">
                  <svg width="14" height="16" viewBox="0 0 28 32" fill="none">
                    <path d="M8 18C4 18 2 15 2 12.5C2 10 4 8 6.5 8C7 5 9.5 2 14 2C18.5 2 21 5 21.5 8C24 8.5 26 10.5 26 13C26 15.5 24 18 21 18" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" /><line x1="14" y1="10.5" x2="14" y2="15.5" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" /><line x1="11.5" y1="13" x2="16.5" y2="13" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
                    
                  </svg>
                  <span className="text-[9px] font-bold tracking-wider uppercase text-white/70">
                    CloudWatch<sup className="text-primary">+</sup>
                  </span>
                </div>

                {/* Alert icon + severity — big and bold */}
                <div className="flex flex-col items-center mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse" />
                    <Warning size={28} weight="fill" className="text-red-500 relative z-10 animate-[pulse_1.5s_ease-in-out_infinite]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-red-400 mt-1">
                    Critical
                  </span>
                </div>

                {/* AI-generated summary — the AI wrote this, no sparkle needed */}
                <p className="text-[12px] leading-[16px] text-white font-medium text-center mb-1">
                  payment-service is timing out
                </p>
                <p className="text-[9px] leading-[12px] text-orange-400/70 text-center italic mb-2">
                  AI: likely ECS memory exhaustion
                </p>

                {/* Quick glance stats */}
                <div className="flex justify-center gap-4 mb-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider">Impact</span>
                    <span className="text-[13px] font-semibold text-status-outage">2.4K</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider">p99</span>
                    <span className="text-[13px] font-semibold text-red-400">2.4s</span>
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Actions — stacked vertically like watchOS */}
                {!acknowledged ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleAcknowledge}
                      className="w-full h-10 rounded-full bg-[#0a84ff] text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 active:scale-95 active:brightness-75 transition-all"
                    >
                      <CheckCircle size={14} weight="bold" />
                      Acknowledge
                    </button>
                    <button
                      className="w-full h-10 rounded-full bg-red-600/80 text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 active:scale-95 active:brightness-75 transition-all"
                    >
                      <ArrowUp size={14} weight="bold" />
                      Escalate
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-10 rounded-full bg-green-600/20 flex items-center justify-center gap-1.5">
                    <CheckCircle size={14} className="text-green-400" weight="fill" />
                    <span className="text-[13px] text-green-400 font-semibold">Acknowledged</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Digital crown */}
          <div className="absolute right-[-4px] top-[72px] w-[4px] h-[28px] rounded-r-full bg-[#2a2a2a] shadow-[1px_0_4px_rgba(0,0,0,0.4)]" />
          {/* Side button */}
          <div className="absolute right-[-4px] top-[112px] w-[4px] h-[16px] rounded-r-full bg-[#2a2a2a] shadow-[1px_0_4px_rgba(0,0,0,0.4)]" />
        </div>

        {/* Hint */}
        <p className="text-body-s text-foreground-muted text-center max-w-[260px]">
          Tap "Acknowledge" to continue to phone
        </p>
      </div>
    </div>
  )
}
