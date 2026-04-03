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
          <span className="text-[11px] text-foreground-muted">Apple Watch + iPhone · Notification</span>
          <a href="#/" className="text-[11px] text-link">← Demos</a>
        </div>

        <div className="flex items-start gap-12">
        {/* Watch column */}
        <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-12">
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
                  <span className="text-[10px] font-bold tracking-wider uppercase text-white/70">
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
                  order-service is timing out
                </p>
                <p className="text-[10px] leading-[12px] text-orange-400/70 text-center italic mb-2">
                  AI: likely ECS memory exhaustion
                </p>

                {/* Quick glance stats */}
                <div className="flex justify-center gap-4 mb-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Impact</span>
                    <span className="text-[13px] font-semibold text-status-outage">2.4K</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">p99</span>
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
        </div>

        <p className="text-body-m text-foreground text-center max-w-[250px]">
          Click "View investigation in CloudWatch+" on the phone →
        </p>
        </div>

        {/* iPhone - realistic iOS lock screen */}
        <div className="relative">
          <div className="w-[390px] h-[844px] rounded-[44px] border-2 border-border bg-black overflow-hidden flex flex-col">
            {/* Dynamic Island */}
            <div className="flex justify-center pt-3"><div className="w-28 h-[26px] bg-black rounded-full" /></div>
            {/* Status bar */}
            <div className="flex items-center justify-between px-7 pt-1">
              <span className="text-[11px] text-white/70 font-medium">2:03</span>
              <div className="flex items-center gap-1">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="white" fillOpacity="0.7"><rect x="0" y="6" width="2.5" height="4" rx="0.5"/><rect x="3.5" y="4" width="2.5" height="6" rx="0.5"/><rect x="7" y="2" width="2.5" height="8" rx="0.5"/><rect x="10.5" y="0" width="2.5" height="10" rx="0.5"/></svg>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="1"><path d="M1 8.5C3.5 4 10.5 4 13 8.5"/><path d="M3 7C5 4.5 9 4.5 11 7"/><path d="M5 5.5C6.5 4.5 7.5 4.5 9 5.5"/><circle cx="7" cy="4" r="1" fill="white" fillOpacity="0.7" stroke="none"/></svg>
                <div className="w-[22px] h-[10px] rounded-[3px] border border-white/40 relative ml-0.5"><div className="absolute inset-[1.5px] right-[3px] bg-white/70 rounded-[1.5px]" /><div className="absolute right-[-2px] top-[2.5px] w-[1.5px] h-[5px] bg-white/40 rounded-r-full" /></div>
              </div>
            </div>
            {/* Date + Time */}
            <div className="text-center mt-16">
              <div className="text-[13px] text-white/70 font-medium">Thu Mar 26</div>
              <div className="text-[80px] font-bold text-white tracking-tight leading-none mt-[-2px]" style={{fontFamily:"SF Pro Display, -apple-system, sans-serif"}}>2:03</div>
            </div>
            {/* Notification */}
            <div className="mt-4" />
            <div onClick={() => navigate("/phone")} className="cursor-pointer">
            <div className="mx-4 mb-3 rounded-2xl bg-red-500/15 backdrop-blur-2xl overflow-hidden border border-red-500/20">
              <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                <div className="w-[28px] h-[28px] rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0"><svg width="11" height="12" viewBox="0 0 28 32" fill="none"><path d="M8 18C4 18 2 15 2 12.5C2 10 4 8 6.5 8C7 5 9.5 2 14 2C18.5 2 21 5 21.5 8C24 8.5 26 10.5 26 13C26 15.5 24 18 21 18" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" /><line x1="14" y1="10.5" x2="14" y2="15.5" stroke="white" strokeWidth="2" strokeLinecap="round" /><line x1="11.5" y1="13" x2="16.5" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg></div>
                <span className="text-[11px] text-white/90 font-semibold">CloudWatch</span>
                <span className="text-[9px] text-red-400 font-bold bg-red-500/20 px-1.5 py-0.5 rounded-full ml-1">CRITICAL</span>
                <span className="text-[10px] text-white/40 ml-auto">now</span>
              </div>
              <div className="px-4 pb-3.5">
                <p className="text-[15px] text-white font-bold leading-tight">order-service is timing out</p>
                <p className="text-[12px] text-red-300/80 mt-1.5 leading-snug font-medium">2,400 failed orders · p99 at 2.4s · ECS memory exhaustion</p>
                <p className="text-[10px] text-white/40 mt-1">Tap to investigate</p>
              </div>
            </div>
            </div>
            {/* Spacer */}
            <div className="flex-1" />
            {/* Bottom bar: flashlight + camera */}
            <div className="flex items-center justify-between px-14 pb-4 pt-1">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="white" fillOpacity="0.8"><path d="M9 2h6l1 7H8L9 2zM8 11h8v2a4 4 0 01-8 0v-2z"/></svg></div>
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="8" r="1"/></svg></div>
            </div>
            {/* Home indicator */}
            <div className="flex justify-center pb-2"><div className="w-28 h-1 rounded-full bg-white/30" /></div>
          </div>
        </div>

        </div>

      </div>
    </div>
  )
}
