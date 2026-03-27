import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Warning, CheckCircle, ArrowRight, Lightning, ArrowClockwise
} from '@phosphor-icons/react'
import { incident } from '../data/incident'

const PROGRESS_STEPS = [
  { tasks: '1/4', memory: '72%', latency: '1,800ms', services: [] },
  { tasks: '2/4', memory: '58%', latency: '800ms', services: ['Checkout'] },
  { tasks: '3/4', memory: '41%', latency: '350ms', services: ['Checkout', 'Order'] },
  { tasks: '4/4', memory: '34%', latency: '210ms', services: ['Checkout', 'Order', 'Inventory'] },
]

export default function PhoneView() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('idle') // idle | progress | done
  const [stepIndex, setStepIndex] = useState(0)
  const timerRef = useRef(null)

  function handleRestart() {
    setPhase('progress')
    setStepIndex(0)
  }

  useEffect(() => {
    if (phase !== 'progress') return
    if (stepIndex >= PROGRESS_STEPS.length) {
      setPhase('done')
      return
    }
    timerRef.current = setTimeout(() => setStepIndex(i => i + 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [phase, stepIndex])

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="gradient-bg-dark" />
      <div className="content-layer flex flex-col items-center gap-6">
        <div className="w-full flex items-center justify-between">
          <span className="text-[11px] text-foreground-muted">iPhone · 2:05 AM</span>
          <a href="#/" className="text-[11px] text-link">← Demos</a>
        </div>

        {/* Phone frame */}
        <div className="w-[390px] h-[844px] rounded-[44px] border-2 border-border bg-black overflow-hidden flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-8 pt-4 pb-2">
            <span className="text-[12px] text-white/60 font-semibold">2:05 AM</span>
            <div className="flex items-center gap-1.5">
              <svg width="10" height="12" viewBox="0 0 28 32" fill="none">
                <circle cx="14" cy="12" r="9.5" stroke="#475569" strokeWidth="3.5" />
                <rect x="3" y="25" width="22" height="4" rx="2" fill="#0ea5e9" />
              </svg>
              <span className="text-[11px] text-white/40">CloudWatch Omni</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-5 pb-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <Warning size={18} weight="fill" className="text-red-500" />
              <div>
                <span className="text-[12px] text-red-400">
                  Critical · {incident.id}
                </span>
                <h1 className="text-[17px] leading-[22px] font-semibold text-white">
                  payment-service is timing out
                </h1>
              </div>
            </div>

            {/* AI Brief + CTAs together */}
            <div className="ai-glass-card p-3 mb-3">
              <p className="text-[13px] leading-[19px] text-white/90">
                <span className="text-orange-400 text-[12px] font-semibold mr-1">AI</span>
                ECS tasks on payment-service-east-2 hit memory limits. Tasks are being killed and restarting in a loop. ~2,400 failed checkouts in the last 10 minutes. No deploys in 6h.
              </p>
              <div className="flex items-center gap-2 mt-2 mb-3">
                <span className="text-[10px] text-white/40">Confidence</span>
                <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">High</span>
                <span className="text-[10px] text-white/40 ml-2">Root cause</span>
                <span className="text-[10px] font-semibold text-white/70">ECS memory exhaustion</span>
              </div>

              {/* Sources */}
              <div className="border-t border-white/10 pt-2 mb-3">
                <span className="text-[10px] text-white/40 block mb-1.5">Sources</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    <span className="text-[10px] text-white/60">Memory at 98%</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    <span className="text-[10px] text-white/60">6 out-of-memory kills</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5">
                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-white/60">p99 latency 2,400ms</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5">
                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-white/60">342 timeout errors</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 pt-3">
                <span className="text-[12px] font-semibold text-sky-400/80 block mb-1">
                  Matches your runbook
                </span>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-white/50 font-mono">
                    OOM restart → increase memory
                  </div>
                </div>
                <p className="text-[12px] leading-[17px] text-white/50 mb-3">
                  Restart ECS tasks with 1 GB memory (up from 512 MB), one task at a time. No downtime.
                </p>

                {phase === 'idle' && (
                  <button
                    onClick={handleRestart}
                    className="w-full h-9 rounded-lg bg-[#0a84ff] text-[13px] font-semibold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <Lightning size={14} weight="fill" />
                    Approve &amp; Execute
                  </button>
                )}

                {phase === 'progress' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowClockwise size={14} className="text-sky-400 animate-spin" />
                      <span className="text-[13px] font-semibold text-white">
                        Restarting {PROGRESS_STEPS[Math.min(stepIndex, PROGRESS_STEPS.length - 1)].tasks} tasks...
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="px-2 py-1.5 rounded bg-white/5 text-center">
                        <span className="text-[9px] text-white/40 block">Memory</span>
                        <span className="text-[11px] font-semibold text-white/80 font-mono">
                          {PROGRESS_STEPS[Math.min(stepIndex, PROGRESS_STEPS.length - 1)].memory}
                        </span>
                      </div>
                      <div className="px-2 py-1.5 rounded bg-white/5 text-center">
                        <span className="text-[9px] text-white/40 block">p99</span>
                        <span className="text-[11px] font-semibold text-white/80 font-mono">
                          {PROGRESS_STEPS[Math.min(stepIndex, PROGRESS_STEPS.length - 1)].latency}
                        </span>
                      </div>
                      <div className="px-2 py-1.5 rounded bg-white/5 text-center">
                        <span className="text-[9px] text-white/40 block">Recovered</span>
                        <span className="text-[11px] font-semibold text-green-400">
                          {PROGRESS_STEPS[Math.min(stepIndex, PROGRESS_STEPS.length - 1)].services.length}/3
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {phase === 'done' && (
                  <div className="space-y-2">
                    <div className="w-full h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center gap-2">
                      <CheckCircle size={14} className="text-green-400" weight="fill" />
                      <span className="text-[13px] text-green-400 font-semibold">All clear</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <span className="text-[10px] text-white/60">4/4 tasks healthy</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <span className="text-[10px] text-white/60">Memory 34%</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <span className="text-[10px] text-white/60">p99 210ms</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <span className="text-[10px] text-white/60">3/3 services recovered</span>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => navigate('/console')}
                  className="w-full mt-2 text-[11px] text-sky-400 flex items-center justify-center"
                >
                  Investigate in console
                </button>
              </div>
            </div>

            {/* Blast radius — mini service map */}
            <div className="glass-card p-3 mb-3">
              <span className="text-[12px] font-semibold text-white/40 block mb-2">
                Blast radius
              </span>
              <svg viewBox="0 0 340 140" className="w-full" fill="none">
                <line x1="170" y1="38" x2="60" y2="90" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.4">
                  <animate attributeName="strokeDasharray" values="0 4 4 0;4 4" dur="1.5s" repeatCount="indefinite" />
                </line>
                <line x1="170" y1="42" x2="170" y2="82" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3">
                  <animate attributeName="strokeDashoffset" values="0;-6" dur="1s" repeatCount="indefinite" />
                </line>
                <line x1="170" y1="38" x2="280" y2="90" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3">
                  <animate attributeName="strokeDashoffset" values="0;-6" dur="1s" repeatCount="indefinite" />
                </line>
                <circle cx="170" cy="28" r="20" fill="#0a0e1a" stroke="#ef4444" strokeWidth="2">
                  <animate attributeName="strokeOpacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="170" cy="28" r="22" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeOpacity="0.2">
                  <animate attributeName="r" values="22;26;22" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="strokeOpacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="170" y="32" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">2.4s</text>
                <circle cx="186" cy="14" r="6" fill="#ef4444" />
                <text x="186" y="17" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">3</text>
                <text x="170" y="56" textAnchor="middle" fill="white" fillOpacity="0.8" fontSize="8" fontWeight="500">Payment</text>
                <circle cx="60" cy="95" r="16" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="60" y="99" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="monospace">1.8s</text>
                <circle cx="73" cy="83" r="3" fill="#f59e0b" />
                <text x="60" y="120" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="7">Checkout</text>
                <circle cx="170" cy="95" r="16" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="170" y="99" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="monospace">900ms</text>
                <circle cx="183" cy="83" r="3" fill="#f59e0b" />
                <text x="170" y="120" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="7">Order</text>
                <circle cx="280" cy="95" r="16" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="280" y="99" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="monospace">600ms</text>
                <circle cx="293" cy="83" r="3" fill="#f59e0b" />
                <text x="280" y="120" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="7">Inventory</text>
                <circle cx="320" cy="28" r="10" fill="#0a0e1a" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.5" />
                <text x="320" y="32" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="600">3</text>
                <circle cx="328" cy="21" r="2.5" fill="#22c55e" fillOpacity="0.8" />
                <text x="320" y="46" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="7">Healthy</text>
              </svg>
            </div>

            {/* Spacer */}
            <div className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}
