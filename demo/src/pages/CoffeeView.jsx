import { useState, useEffect } from 'react'
import {
  CheckCircle, Warning, Sparkle, ChartBar, Bell, Clock,
  CaretDown, CaretUp, ArrowRight, Copy, Play,
  Lightning, ShieldCheck, Coffee, Sun, ArrowClockwise,
  ChatTeardropDots, PaperPlaneRight, Hash
} from '@phosphor-icons/react'
import { coffee } from '../data/coffee'

/* ── Act indicator ── */
function ActIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
            i < current ? 'bg-status-active/20 text-status-active border border-status-active/30' :
            i === current ? 'bg-primary/20 text-primary border border-primary/30' :
            'bg-background-surface-2 text-foreground-disabled border border-border-muted'
          }`}>
            {i < current ? <CheckCircle size={12} weight="fill" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-8 h-px ${i < current ? 'bg-status-active/30' : 'bg-border-muted'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Health service row ── */
function ServiceRow({ service }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-status-active" />
        <span className="text-body-s text-foreground">{service.name}</span>
      </div>
      <span className="text-[10px] text-foreground-muted">{service.region}</span>
    </div>
  )
}

/* ── Memory chart (SVG sparkline) ── */
function MemoryChart({ data, threshold }) {
  const width = 480
  const height = 160
  const padding = { top: 10, right: 10, bottom: 24, left: 44 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const max = 800 // container limit
  const min = 400

  const points = data.map((v, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW
    const y = padding.top + chartH - ((v - min) / (max - min)) * chartH
    return { x, y, v }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = linePath + ` L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`

  const thresholdY = padding.top + chartH - ((threshold - min) / (max - min)) * chartH

  // Y-axis labels
  const yLabels = [400, 500, 600, 700, 800]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id="mem-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map(v => {
        const y = padding.top + chartH - ((v - min) / (max - min)) * chartH
        return (
          <g key={v}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(51,65,85,0.2)" strokeWidth="0.5" />
            <text x={padding.left - 6} y={y + 3} textAnchor="end" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">{v} MB</text>
          </g>
        )
      })}

      {/* Threshold line */}
      <line x1={padding.left} y1={thresholdY} x2={width - padding.right} y2={thresholdY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.6" />
      <text x={width - padding.right + 2} y={thresholdY - 4} fill="#ef4444" fontSize="8" fontFamily="DM Sans" opacity="0.8">700 MB alarm</text>

      {/* Area + line */}
      <path d={areaPath} fill="url(#mem-fill)" />
      <path d={linePath} fill="none" stroke="#0ea5e9" strokeWidth="1.5" />

      {/* Current value dot */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="#0ea5e9" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="6" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity="0.4">
        <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* X-axis labels */}
      <text x={padding.left} y={height - 4} fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">11:30 AM</text>
      <text x={padding.left + chartW / 2} y={height - 4} textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">1:00 PM</text>
      <text x={width - padding.right} y={height - 4} textAnchor="end" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">2:30 PM</text>
    </svg>
  )
}

/* ── Typing animation for AI messages ── */
function TypedText({ text, speed = 20, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
        onDone?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse" />}
    </span>
  )
}

/* ── Main Coffee Flow ── */
export default function CoffeeView() {
  const [act, setAct] = useState(0) // 0-3 for acts 1-4
  const [showServices, setShowServices] = useState(false)
  const [aiTypingDone, setAiTypingDone] = useState(false)
  const [settingUp, setSettingUp] = useState(false)
  const [setupDone, setSetupDone] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [confirmTypingDone, setConfirmTypingDone] = useState(false)

  // Act 2: show chart after a brief delay
  useEffect(() => {
    if (act === 1) {
      const t = setTimeout(() => setShowChart(true), 600)
      return () => clearTimeout(t)
    }
  }, [act])

  // Act 2: show suggestion after chart appears
  useEffect(() => {
    if (showChart) {
      const t = setTimeout(() => setShowSuggestion(true), 800)
      return () => clearTimeout(t)
    }
  }, [showChart])

  function handleSetup() {
    setSettingUp(true)
    setTimeout(() => {
      setSettingUp(false)
      setSetupDone(true)
      // Auto-advance to act 3 after confirmation types
    }, 2000)
  }

  function advanceToAct4() {
    setAct(3)
  }

  const iconMap = {
    chart: ChartBar,
    bell: Bell,
    clock: Clock,
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <Coffee size={24} className="text-foreground-muted" />
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">
            {coffee.greeting}
          </h1>
        </div>
        <p className="text-body-m text-foreground-muted mb-6">{coffee.timestamp}</p>

        <ActIndicator current={act} total={4} />

        {/* ═══════ ACT 1: Homepage with AI recommendation ═══════ */}
        {act === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left: Health briefing */}
            <div className="lg:col-span-2 space-y-3">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-heading-s font-normal text-foreground">Health briefing</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-status-active" />
                    <span className="text-body-s text-status-active">{coffee.healthBriefing.summary}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={16} className="text-status-active" />
                  <span className="text-body-s text-foreground-secondary">
                    {coffee.healthBriefing.servicesMonitored} services monitored
                  </span>
                  <button
                    onClick={() => setShowServices(!showServices)}
                    className="ml-auto text-body-s text-link flex items-center gap-1"
                  >
                    {showServices ? 'Hide' : 'Show all'}
                    {showServices ? <CaretUp size={12} /> : <CaretDown size={12} />}
                  </button>
                </div>
                {showServices && (
                  <div className="border-t border-border-muted pt-2 space-y-0">
                    {coffee.healthBriefing.services.map(s => (
                      <ServiceRow key={s.name} service={s} />
                    ))}
                  </div>
                )}
              </div>

              {/* Live Updates */}
              <div className="glass-card p-4">
                <h3 className="text-heading-s font-normal text-foreground mb-3">Live updates</h3>
                <div className="flex items-center gap-2 py-2">
                  <CheckCircle size={14} className="text-status-active" />
                  <span className="text-body-s text-foreground-muted">No active alarms — all quiet</span>
                </div>
              </div>
            </div>

            {/* Right: AI recommendation */}
            <div className="space-y-3">
              <div className="ai-glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkle size={14} className="text-primary" />
                  <span className="text-body-s font-semibold text-primary">AI recommendation</span>
                </div>
                <h4 className="text-heading-xs font-normal text-foreground mb-2">
                  {coffee.recommendation.title}
                </h4>
                <p className="text-body-s text-foreground-secondary leading-relaxed mb-4">
                  {coffee.recommendation.description}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <Warning size={12} className="text-status-blocked" />
                  <span className="text-[10px] text-status-blocked font-semibold">Monitoring gap</span>
                  <span className="text-[10px] text-foreground-muted ml-auto">Confidence: High</span>
                </div>
                <button
                  onClick={() => setAct(1)}
                  className="w-full h-8 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  <Lightning size={14} />
                  Set up monitoring
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ ACT 2: Metric Discovery ═══════ */}
        {act === 1 && (
          <div className="space-y-3">
            {/* AI message */}
            <div className="ai-glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkle size={14} className="text-primary" />
                <span className="text-body-s font-semibold text-primary">AI assistant</span>
              </div>
              <p className="text-body-m text-foreground leading-relaxed">
                <TypedText
                  text="I found your payment-processing-prod cluster. Here's the current memory usage across your containers — the top container is at 680 MB, which is 85% of the 800 MB limit."
                  speed={18}
                  onDone={() => setAiTypingDone(true)}
                />
              </p>
            </div>

            {/* Query card */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-heading-xs font-normal text-foreground">Metric query</span>
                <span className="text-[10px] text-foreground-muted px-2 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">
                  {coffee.metricQuery.language}
                </span>
              </div>
              <pre className="text-pre font-mono bg-background-surface-2/40 rounded-lg p-3 text-foreground-secondary overflow-x-auto mb-2">
                {coffee.metricQuery.query}
              </pre>
              <span className="text-[10px] text-foreground-muted">{coffee.metricQuery.timeRange}</span>
            </div>

            {/* Chart */}
            {showChart && (
              <div className="glass-card p-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-heading-s font-normal text-foreground">Container Memory Usage</h3>
                  <span className="text-body-s text-foreground-muted">payment-processing-prod</span>
                </div>
                <MemoryChart data={coffee.memoryChartData} threshold={700} />
                <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-status-blocked/[0.06] border border-status-blocked/[0.15]">
                  <Warning size={14} className="text-status-blocked" />
                  <span className="text-body-s text-status-blocked">{coffee.metricQuery.highlight}</span>
                </div>
              </div>
            )}

            {/* AI suggestion */}
            {showSuggestion && (
              <div className="ai-glass-card p-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkle size={14} className="text-primary" />
                  <span className="text-body-s font-semibold text-primary">Recommended setup</span>
                </div>
                <p className="text-body-s text-foreground-secondary mb-3">{coffee.aiSuggestion.message}</p>
                <div className="space-y-2 mb-4">
                  {coffee.aiSuggestion.items.map((item) => {
                    const Icon = iconMap[item.icon]
                    return (
                      <div key={item.label} className="flex items-center gap-3 py-1.5">
                        <Icon size={14} className="text-foreground-muted" />
                        <span className="text-body-s text-foreground-muted w-32">{item.label}</span>
                        <span className="text-body-s text-foreground font-medium">{item.value}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-body-s text-foreground-muted mb-4">{coffee.aiSuggestion.footer}</p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setAct(0)}
                    className="h-8 px-4 rounded-lg border border-border-muted text-body-s text-foreground-secondary hover:bg-background-surface-2 transition-colors"
                  >
                    Not now
                  </button>
                  <button
                    onClick={() => { setAct(2); handleSetup() }}
                    className="h-8 px-4 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center gap-2"
                  >
                    <CheckCircle size={14} />
                    Yes, set it up
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ ACT 3: Setup + Confirmation ═══════ */}
        {act === 2 && (
          <div className="space-y-3">
            {settingUp && (
              <div className="ai-glass-card p-4 flex items-center gap-3">
                <ArrowClockwise size={16} className="text-primary animate-spin" />
                <div>
                  <span className="text-body-s font-semibold text-primary block">Setting up monitoring...</span>
                  <span className="text-body-s text-foreground-muted">Creating dashboard, alarm, and notifications</span>
                </div>
              </div>
            )}

            {setupDone && (
              <>
                {/* Confirmation items */}
                <div className="glass-card p-4">
                  <h3 className="text-heading-s font-normal text-foreground mb-3">Setup complete</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 py-2 border-b border-border-muted">
                      <CheckCircle size={16} className="text-status-active mt-0.5" weight="fill" />
                      <div>
                        <span className="text-body-s text-foreground font-medium block">Dashboard created</span>
                        <span className="text-body-s text-foreground-muted">"{coffee.setup.dashboard.name}" with memory usage widget</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 py-2 border-b border-border-muted">
                      <CheckCircle size={16} className="text-status-active mt-0.5" weight="fill" />
                      <div>
                        <span className="text-body-s text-foreground font-medium block">Alarm configured</span>
                        <span className="text-body-s text-foreground-muted">
                          "{coffee.setup.alarm.name}" — triggers at {coffee.setup.alarm.threshold} for {coffee.setup.alarm.evaluationPeriods} × {coffee.setup.alarm.period}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 py-2">
                      <CheckCircle size={16} className="text-status-active mt-0.5" weight="fill" />
                      <div>
                        <span className="text-body-s text-foreground font-medium block">Notifications active</span>
                        <span className="text-body-s text-foreground-muted">
                          {coffee.setup.notification.type} → {coffee.setup.notification.channel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI confirmation message */}
                <div className="ai-glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkle size={14} className="text-primary" />
                    <span className="text-body-s font-semibold text-primary">AI assistant</span>
                  </div>
                  <p className="text-body-m text-foreground leading-relaxed">
                    <TypedText
                      text={coffee.setup.confirmationMessage}
                      speed={15}
                      onDone={() => setConfirmTypingDone(true)}
                    />
                  </p>
                </div>

                {confirmTypingDone && (
                  <div className="flex justify-end" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <button
                      onClick={advanceToAct4}
                      className="h-8 px-4 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center gap-2"
                    >
                      Back to homepage
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════ ACT 4: Updated Homepage ═══════ */}
        {act === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              {/* Health briefing — updated */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-heading-s font-normal text-foreground">Health briefing</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-status-active" />
                    <span className="text-body-s text-status-active">{coffee.healthBriefing.summary}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-status-active" />
                  <span className="text-body-s text-foreground-secondary">
                    {coffee.healthBriefing.servicesMonitored} services monitored · {coffee.updatedState.healthBriefing}
                  </span>
                </div>
              </div>

              {/* Live Updates — updated */}
              <div className="glass-card p-4">
                <h3 className="text-heading-s font-normal text-foreground mb-3">Live updates</h3>
                <div className="flex items-center gap-2 py-2">
                  <CheckCircle size={14} className="text-status-active" />
                  <span className="text-body-s text-foreground-muted">{coffee.updatedState.liveUpdates}</span>
                </div>
              </div>
            </div>

            {/* Right: Quick access + AI summary */}
            <div className="space-y-3">
              {/* New dashboard card */}
              <div className="glass-card p-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-heading-s font-normal text-foreground">Quick access</h3>
                </div>
                {coffee.updatedState.quickAccess.map(item => (
                  <div key={item.name} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-background-surface-2 transition-colors cursor-pointer">
                    <ChartBar size={16} className="text-primary" />
                    <div className="flex-1">
                      <span className="text-body-s text-foreground block">{item.name}</span>
                      <span className="text-[10px] text-foreground-muted">{item.type}</span>
                    </div>
                    {item.isNew && (
                      <span className="text-[9px] font-semibold text-primary px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">NEW</span>
                    )}
                  </div>
                ))}
              </div>

              {/* AI summary */}
              <div className="ai-glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkle size={14} className="text-primary" />
                  <span className="text-body-s font-semibold text-primary">Weekend readiness</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-status-active" weight="fill" />
                    <span className="text-body-s text-foreground-secondary">Memory monitoring active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-status-active" weight="fill" />
                    <span className="text-body-s text-foreground-secondary">Alarm threshold set at 87.5%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-status-active" weight="fill" />
                    <span className="text-body-s text-foreground-secondary">Team notifications configured</span>
                  </div>
                </div>
                <p className="text-body-s text-foreground-muted mt-3">You're covered for the weekend. Enjoy it.</p>
              </div>

              {/* Restart demo */}
              <button
                onClick={() => {
                  setAct(0)
                  setShowServices(false)
                  setAiTypingDone(false)
                  setSettingUp(false)
                  setSetupDone(false)
                  setShowChart(false)
                  setShowSuggestion(false)
                  setConfirmTypingDone(false)
                }}
                className="w-full h-8 rounded-lg border border-border-muted text-body-s text-foreground-muted hover:bg-background-surface-2 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowClockwise size={14} />
                Restart demo
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
