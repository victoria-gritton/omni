import { useState, useEffect, useRef } from 'react'
import {
  WarningCircle, CheckCircle, Lightning,
  ArrowClockwise, Copy, Play, CaretDown, CaretUp,
  FileText, Sparkle
} from '@phosphor-icons/react'
import { incident } from '../data/incident'

const PROGRESS_STEPS = [
  { tasks: '1/4', memory: '72%', latency: '1,800ms', services: [] },
  { tasks: '2/4', memory: '58%', latency: '800ms', services: ['Checkout'] },
  { tasks: '3/4', memory: '41%', latency: '350ms', services: ['Checkout', 'Order'] },
  { tasks: '4/4', memory: '34%', latency: '210ms', services: ['Checkout', 'Order', 'Inventory'] },
]

function DependencyMap({ resolved }) {
  const paymentStroke = resolved ? '#22c55e' : '#ef4444'
  const degradedStroke = resolved ? '#22c55e' : '#f59e0b'
  const lineStroke = resolved ? '#22c55e' : '#ef4444'
  const lineStroke2 = resolved ? '#22c55e' : '#f59e0b'
  return (
    <svg viewBox="0 0 280 180" className="w-full transition-all duration-1000" fill="none">
      <line x1="140" y1="42" x2="50" y2="110" stroke={lineStroke} strokeWidth="1.5" strokeOpacity="0.4">{!resolved && <animate attributeName="strokeDasharray" values="0 4 4 0;4 4" dur="1.5s" repeatCount="indefinite" />}</line>
      <line x1="140" y1="46" x2="140" y2="100" stroke={lineStroke2} strokeWidth="1" strokeOpacity="0.3" strokeDasharray={resolved ? undefined : '3 3'}>{!resolved && <animate attributeName="strokeDashoffset" values="0;-6" dur="1s" repeatCount="indefinite" />}</line>
      <line x1="140" y1="42" x2="230" y2="110" stroke={lineStroke2} strokeWidth="1" strokeOpacity="0.3" strokeDasharray={resolved ? undefined : '3 3'}>{!resolved && <animate attributeName="strokeDashoffset" values="0;-6" dur="1s" repeatCount="indefinite" />}</line>
      <circle cx="140" cy="30" r="22" fill="#0a0e1a" stroke={paymentStroke} strokeWidth="2">{!resolved && <animate attributeName="strokeOpacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />}</circle>
      {!resolved && <circle cx="140" cy="30" r="24" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeOpacity="0.2"><animate attributeName="r" values="24;28;24" dur="2s" repeatCount="indefinite" /><animate attributeName="strokeOpacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" /></circle>}
      <text x="140" y="34" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="monospace">{resolved ? '210ms' : '2.4s'}</text>
      {!resolved && <><circle cx="158" cy="14" r="7" fill="#ef4444" /><text x="158" y="17.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">3</text></>}
      {resolved && <g transform="translate(151, 7)"><circle cx="7" cy="7" r="7" fill="#22c55e" /><path d="M4.5 7.5L6.5 9.5L10 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
      <text x="140" y="62" textAnchor="middle" fill="white" fillOpacity="0.8" fontSize="9" fontWeight="500">Payment</text>
      <circle cx="50" cy="115" r="18" fill="#0a0e1a" stroke={degradedStroke} strokeWidth="1.5" />
      <text x="50" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">{resolved ? '150ms' : '1.8s'}</text>
      <circle cx="65" cy="101" r="3.5" fill={resolved ? '#22c55e' : '#f59e0b'} />
      <text x="50" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Checkout</text>
      <circle cx="140" cy="115" r="18" fill="#0a0e1a" stroke={degradedStroke} strokeWidth="1.5" />
      <text x="140" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">{resolved ? '120ms' : '900ms'}</text>
      <circle cx="155" cy="101" r="3.5" fill={resolved ? '#22c55e' : '#f59e0b'} />
      <text x="140" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Order</text>
      <circle cx="230" cy="115" r="18" fill="#0a0e1a" stroke={degradedStroke} strokeWidth="1.5" />
      <text x="230" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">{resolved ? '80ms' : '600ms'}</text>
      <circle cx="245" cy="101" r="3.5" fill={resolved ? '#22c55e' : '#f59e0b'} />
      <text x="230" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Inventory</text>
      <circle cx="260" cy="30" r="12" fill="#0a0e1a" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.5" />
      <text x="260" y="34" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">3</text>
      <circle cx="269" cy="22" r="3" fill="#22c55e" fillOpacity="0.8" />
      <text x="260" y="50" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="8">Healthy</text>
    </svg>
  )
}

function QueryCard({ query }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(query.query)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="glass-card p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-heading-xs font-normal text-foreground">{query.label}</span>
        <div className="flex gap-1">
          <button onClick={handleCopy} className="p-1 rounded-lg hover:bg-background-surface-2 transition-colors" aria-label="Copy query">
            {copied ? <CheckCircle size={14} className="text-status-active" /> : <Copy size={14} className="text-foreground-muted" />}
          </button>
          <button className="p-1 rounded-lg hover:bg-primary/10 transition-colors" aria-label="Run query"><Play size={14} className="text-primary" /></button>
        </div>
      </div>
      <pre className="text-pre font-mono bg-background-surface-2/40 rounded-lg p-2 text-foreground-secondary overflow-x-auto">{query.query}</pre>
    </div>
  )
}

export default function ConsoleView() {
  const [showReasoning, setShowReasoning] = useState(true)
  const [phase, setPhase] = useState('idle')
  const [stepIndex, setStepIndex] = useState(0)
  const [postMortem, setPostMortem] = useState(false)
  const timerRef = useRef(null)

  function handleRemediate() { setPhase('progress'); setStepIndex(0) }

  useEffect(() => {
    if (phase !== 'progress') return
    if (stepIndex >= PROGRESS_STEPS.length) { setPhase('done'); return }
    timerRef.current = setTimeout(() => setStepIndex(i => i + 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [phase, stepIndex])

  const step = PROGRESS_STEPS[Math.min(stepIndex, PROGRESS_STEPS.length - 1)]
  const resolved = phase === 'done'

  return (
    <div className="flex-1 relative overflow-hidden">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-[22px] leading-[28px] font-normal tracking-tighter text-foreground mb-1">{incident.title}</h1>
          <p className="text-body-m text-foreground-secondary mb-4">{incident.summary}</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <div className="lg:col-span-2 space-y-2">
              {/* AI Brief + Runbook */}
              <div className="ai-glass-card p-3 space-y-2">
                <span className="text-body-s font-semibold text-orange-400">AI analysis</span>
                <p className="text-body-m text-foreground leading-relaxed">{incident.brief.hypothesis}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-body-s text-foreground-muted">Confidence</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-active/10 border border-status-active/20 text-[10px] font-semibold text-status-active">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body-s text-foreground-muted">Root cause</span>
                    <span className="text-body-s text-foreground">{incident.brief.rootCauseType}</span>
                  </div>
                </div>
                <div className="border-t border-border-muted pt-2 mt-1">
                  <span className="text-heading-xs font-normal text-link block mb-1">Matches your runbook</span>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-1.5 py-0.5 rounded-full bg-background-surface-2 text-[10px] text-foreground-muted font-mono">OOM restart → increase memory</span>
                  </div>
                  <p className="text-body-s text-foreground-muted mb-2">Restart ECS tasks with 1 GB memory (up from 512 MB), one task at a time. No downtime.</p>

                  {phase === 'idle' && (
                    <div className="flex justify-end">
                      <button onClick={handleRemediate} className="inline-flex items-center justify-center h-8 px-4 gap-2 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all">
                        <Lightning size={14} />Approve &amp; Execute
                      </button>
                    </div>
                  )}
                  {phase === 'progress' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ArrowClockwise size={14} className="text-primary animate-spin" />
                        <span className="text-body-s font-semibold text-foreground">Restarting {step.tasks} tasks...</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="px-2 py-1.5 rounded-lg bg-background-surface-2/50 text-center">
                          <span className="text-[10px] text-foreground-muted block">Memory</span>
                          <span className="text-body-s font-semibold text-foreground font-mono">{step.memory}</span>
                        </div>
                        <div className="px-2 py-1.5 rounded-lg bg-background-surface-2/50 text-center">
                          <span className="text-[10px] text-foreground-muted block">p99</span>
                          <span className="text-body-s font-semibold text-foreground font-mono">{step.latency}</span>
                        </div>
                        <div className="px-2 py-1.5 rounded-lg bg-background-surface-2/50 text-center">
                          <span className="text-[10px] text-foreground-muted block">Recovered</span>
                          <span className="text-body-s font-semibold text-status-active">{step.services.length}/3</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {phase === 'done' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 h-8 px-3 rounded-lg bg-status-active/10 border border-status-active/20 w-fit">
                        <CheckCircle size={14} className="text-status-active" weight="fill" />
                        <span className="text-body-s text-status-active font-medium">All clear · 4/4 tasks healthy · p99 210ms</span>
                      </div>
                      {!postMortem && (
                        <div className="flex justify-end">
                          <button onClick={() => setPostMortem(true)} className="inline-flex items-center justify-center h-8 px-4 gap-2 rounded-lg bg-background-surface-1 border border-border-muted text-body-s font-medium text-foreground-secondary hover:bg-background-surface-2 transition-all">
                            <FileText size={14} />Generate Post-Mortem
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Post-mortem */}
              {postMortem && (
                <div className="ai-glass-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkle size={16} className="text-orange-400" />
                    <span className="text-heading-s font-normal text-foreground">Post-mortem draft</span>
                  </div>
                  <div className="space-y-2 text-body-s text-foreground-secondary">
                    <div><span className="text-foreground font-semibold block mb-0.5">Incident</span><p>{incident.id} — {incident.title}</p></div>
                    <div><span className="text-foreground font-semibold block mb-0.5">Timeline</span><p>1:47 AM — Memory crossed 90%. 1:52 AM — First OOM kill. 1:55 AM — Restart loop. 2:03 AM — Critical alert. 2:05 AM — AI matched runbook. 2:06 AM — Tasks restarted with 1 GB.</p></div>
                    <div><span className="text-foreground font-semibold block mb-0.5">Root cause</span><p>ECS task memory limit (512 MB) insufficient for payment-service-east-2 workload. OOM restart loop caused cascading latency to 3 downstream services.</p></div>
                    <div><span className="text-foreground font-semibold block mb-0.5">Action items</span><p>1. Increase default memory to 1 GB. 2. Add memory alarm at 80%. 3. Review memory trends weekly.</p></div>
                  </div>
                </div>
              )}

              {/* Suggested Queries */}
              <div>
                <h3 className="text-heading-s font-normal text-foreground mb-2">Suggested queries</h3>
                <div className="space-y-2">{incident.suggestedQueries.map((q, i) => <QueryCard key={i} query={q} />)}</div>
              </div>

              {/* AI Reasoning */}
              <div className="glass-card p-3">
                <button onClick={() => setShowReasoning(!showReasoning)} className="flex items-center justify-between w-full mb-2">
                  <span className="text-heading-s font-normal text-foreground">How AI reached this conclusion</span>
                  {showReasoning ? <CaretUp size={14} className="text-foreground-muted" /> : <CaretDown size={14} className="text-foreground-muted" />}
                </button>
                {showReasoning && (
                  <div className="space-y-0">
                    {incident.reasoning.map((s) => (
                      <div key={s.step} className="flex items-start gap-3 py-2 border-b border-border-muted last:border-0">
                        <div className="mt-0.5">{s.status === 'found' ? <WarningCircle size={16} className="text-status-blocked" /> : <CheckCircle size={16} className="text-status-active" />}</div>
                        <div>
                          <span className="text-body-s text-foreground font-semibold block">{s.action}</span>
                          <span className="text-body-s text-foreground-muted">{s.result}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-2">
              <div className="glass-card p-3">
                <h3 className="text-heading-s font-normal text-foreground mb-2">Service map</h3>
                <DependencyMap resolved={resolved} />
              </div>
              <div className="glass-card p-3">
                <h3 className="text-heading-s font-normal text-foreground mb-2">Timeline</h3>
                {[...incident.timeline, ...(resolved ? [{ time: '2:06 AM', event: 'Fix applied — 4/4 tasks restarted with 1 GB memory', type: 'fix' }] : [])].map((item, i, arr) => {
                  const isAlert = item.type === 'alert'
                  const isFix = item.type === 'fix'
                  const isLast = i === arr.length - 1
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${isFix ? 'bg-status-active' : isAlert ? 'bg-status-outage' : 'bg-primary'}`} />
                        {!isLast && <div className="w-px flex-1 bg-border-muted mt-1" />}
                      </div>
                      <div className="pb-3">
                        <span className="text-[10px] text-foreground-muted block">{item.time}</span>
                        <span className={`text-body-s ${isFix ? 'text-status-active font-semibold' : 'text-foreground'}`}>{item.event}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
