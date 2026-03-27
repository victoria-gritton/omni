import { useState, useEffect } from 'react'
import {
  CheckCircle, Warning, Sparkle, ChartBar, Bell, Clock,
  CaretDown, CaretUp, ArrowRight, Copy, Play,
  Lightning, ShieldCheck, Coffee, ArrowClockwise,
  Microphone, WarningCircle, Globe, Link as LinkIcon
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

/* ── Prompt pill ── */
function PromptPill({ text }) {
  return (
    <button className="px-3 py-1.5 rounded-full border border-primary/20 text-body-s text-primary hover:bg-primary/5 hover:border-primary/40 transition-all whitespace-nowrap">
      {text}
    </button>
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

/* ── Live event row ── */
function LiveEvent({ type, source, title, detail, time, link }) {
  const typeConfig = {
    alarm: { bg: 'bg-status-outage/10', border: 'border-status-outage/20', text: 'text-status-outage', label: 'ALARM', icon: Warning },
    fault: { bg: 'bg-status-outage/10', border: 'border-status-outage/20', text: 'text-status-outage', label: 'SERVICE FAULT', icon: WarningCircle },
    canary: { bg: 'bg-status-active/10', border: 'border-status-active/20', text: 'text-status-active', label: 'CANARY', icon: CheckCircle },
  }
  const c = typeConfig[type]
  const Icon = c.icon
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-muted last:border-0">
      <div className={`w-7 h-7 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={14} className={c.text} weight="fill" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[9px] font-bold tracking-wider ${c.text}`}>{c.label}</span>
          <span className="text-[10px] text-foreground-muted">{source}</span>
        </div>
        <span className="text-body-s text-foreground font-medium block">{title}</span>
        <span className="text-body-s text-foreground-muted">{detail}</span>
        {link && <span className="text-body-s text-link block mt-0.5 cursor-pointer">{link}</span>}
      </div>
      <span className="text-[10px] text-foreground-muted flex-shrink-0">{time}</span>
    </div>
  )
}

/* ── Service topology node ── */
function TopoNode({ name, status, x, y }) {
  const colors = {
    healthy: { fill: '#0a0e1a', stroke: '#22c55e', text: '#22c55e' },
    warning: { fill: '#0a0e1a', stroke: '#f59e0b', text: '#f59e0b' },
    critical: { fill: '#0a0e1a', stroke: '#ef4444', text: '#ef4444' },
  }
  const c = colors[status]
  return (
    <g>
      <circle cx={x} cy={y} r="24" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      <circle cx={x} cy={y} r="4" fill={c.stroke} fillOpacity="0.3" />
      <text x={x} y={y + 38} textAnchor="middle" fill="white" fillOpacity="0.7" fontSize="9" fontFamily="DM Sans">{name}</text>
    </g>
  )
}

/* ── Service topology map ── */
function ServiceTopology() {
  const nodes = [
    { name: 'API Gateway', status: 'healthy', x: 200, y: 50 },
    { name: 'Auth', status: 'healthy', x: 60, y: 130 },
    { name: 'Payment', status: 'warning', x: 200, y: 130 },
    { name: 'Order', status: 'healthy', x: 340, y: 130 },
    { name: 'Checkout', status: 'healthy', x: 120, y: 220 },
    { name: 'Inventory', status: 'healthy', x: 280, y: 220 },
    { name: 'DynamoDB', status: 'healthy', x: 200, y: 310 },
  ]
  const edges = [
    [0, 1], [0, 2], [0, 3],
    [2, 4], [2, 5],
    [4, 6], [5, 6], [3, 5],
  ]
  return (
    <svg viewBox="0 0 400 360" className="w-full">
      {edges.map(([from, to], i) => {
        const a = nodes[from], b = nodes[to]
        const isWarning = a.status === 'warning' || b.status === 'warning'
        return (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={isWarning ? '#f59e0b' : '#22c55e'} strokeWidth="1" strokeOpacity="0.25"
            strokeDasharray={isWarning ? '4 3' : 'none'}
          >
            {isWarning && (
              <animate attributeName="strokeDashoffset" values="0;-7" dur="1s" repeatCount="indefinite" />
            )}
          </line>
        )
      })}
      {nodes.map((n, i) => <TopoNode key={i} {...n} />)}
    </svg>
  )
}

/* ── Memory chart (SVG sparkline) ── */
function MemoryChart({ data, threshold }) {
  const width = 480, height = 160
  const padding = { top: 10, right: 10, bottom: 24, left: 44 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const max = 800, min = 400

  const points = data.map((v, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW
    const y = padding.top + chartH - ((v - min) / (max - min)) * chartH
    return { x, y, v }
  })
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = linePath + ` L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`
  const thresholdY = padding.top + chartH - ((threshold - min) / (max - min)) * chartH
  const yLabels = [400, 500, 600, 700, 800]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id="mem-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yLabels.map(v => {
        const y = padding.top + chartH - ((v - min) / (max - min)) * chartH
        return (
          <g key={v}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(51,65,85,0.2)" strokeWidth="0.5" />
            <text x={padding.left - 6} y={y + 3} textAnchor="end" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">{v} MB</text>
          </g>
        )
      })}
      <line x1={padding.left} y1={thresholdY} x2={width - padding.right} y2={thresholdY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.6" />
      <text x={width - padding.right + 2} y={thresholdY - 4} fill="#ef4444" fontSize="8" fontFamily="DM Sans" opacity="0.8">700 MB alarm</text>
      <path d={areaPath} fill="url(#mem-fill)" />
      <path d={linePath} fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="#0ea5e9" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="6" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity="0.4">
        <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x={padding.left} y={height - 4} fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">11:30 AM</text>
      <text x={padding.left + chartW / 2} y={height - 4} textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">1:00 PM</text>
      <text x={width - padding.right} y={height - 4} textAnchor="end" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">2:30 PM</text>
    </svg>
  )
}

/* ── Typing animation ── */
function TypedText({ text, speed = 20, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(interval); setDone(true); onDone?.() }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])
  return <span>{displayed}{!done && <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse" />}</span>
}

const promptPills = [
  "What's the health of my services?",
  "Show me all active alarms",
  "Which services have the highest error rates?",
  "Show me my service dependency map",
  "Find services with elevated latency",
  "Show me recent errors in my logs",
  "List my dashboards",
  "How are my containers doing?",
  "Top invoked Lambda functions and performance",
  "Check my database instances health",
]

const liveEvents = [
  { type: 'alarm', source: 'DynamoDB', title: 'DynamoDB UsersTable ReadThrottles', detail: 'ReadThrottleEvents is 847 (threshold: 0)', time: 'just now' },
  { type: 'fault', source: 'Lambda', title: 'PaymentService — 12.3% fault rate', detail: '847 faults out of 6,891 requests', time: '2m ago' },
  { type: 'alarm', source: 'ApiGateway', title: 'API Gateway 5xx Errors', detail: '5XXError is 5.2% (threshold: 1%)', time: '4m ago', link: 'Correlated with upstream incident' },
  { type: 'canary', source: 'Synthetics', title: 'Checkout canary passing', detail: 'All 5 steps completed in 2.3s', time: '6m ago' },
]

const healthItems = [
  { color: 'bg-status-active', text: '12 services monitored — all core paths operational' },
  { color: 'bg-status-blocked', text: '2 active situations requiring attention' },
  { color: 'bg-status-outage', text: 'Users Table — elevated read latency, auto-scaling in progress' },
  { color: 'bg-status-outage', text: 'Analytics DB — connection pool at 85%, monitoring closely' },
  { color: 'bg-status-active', text: 'API Gateway p99 latency 23% lower than yesterday' },
  { color: 'bg-status-active', text: '12M requests/hr across all services — within normal range' },
]

/* ── Main Coffee Flow ── */
export default function CoffeeView() {
  const [act, setAct] = useState(0)
  const [showServices, setShowServices] = useState(false)
  const [aiTypingDone, setAiTypingDone] = useState(false)
  const [settingUp, setSettingUp] = useState(false)
  const [setupDone, setSetupDone] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [confirmTypingDone, setConfirmTypingDone] = useState(false)

  useEffect(() => { if (act === 1) { const t = setTimeout(() => setShowChart(true), 600); return () => clearTimeout(t) } }, [act])
  useEffect(() => { if (showChart) { const t = setTimeout(() => setShowSuggestion(true), 800); return () => clearTimeout(t) } }, [showChart])

  function handleSetup() {
    setSettingUp(true)
    setTimeout(() => { setSettingUp(false); setSetupDone(true) }, 2000)
  }

  const iconMap = { chart: ChartBar, bell: Bell, clock: Clock }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <h1 className="text-display-l font-normal tracking-tighter text-primary mb-1">
          CloudWatch Expanse
        </h1>
        <p className="text-body-m text-foreground-muted mb-6">{coffee.greeting.replace('Good afternoon, ', 'Good afternoon, ')}</p>

        <ActIndicator current={act} total={4} />

        {/* ═══════ ACT 1 ═══════ */}
        {act === 0 && (
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
              <div className="flex items-center gap-2 h-12 rounded-xl bg-background-surface-1 border border-border-muted px-4 focus-within:border-primary/40 transition-colors">
                <Sparkle size={16} className="text-primary flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Ask a question about your system"
                  className="flex-1 bg-transparent text-body-m text-foreground placeholder:text-foreground-disabled focus:outline-none"
                />
                <Microphone size={16} className="text-foreground-muted flex-shrink-0" />
              </div>
            </div>

            {/* Prompt pills */}
            <div className="flex flex-wrap gap-2">
              {promptPills.map(p => <PromptPill key={p} text={p} />)}
            </div>

            {/* Proactive Recommendation — full width */}
            <div className="ai-glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkle size={18} className="text-primary" />
                </div>
                <h3 className="text-heading-m font-normal text-foreground">Proactive Recommendation</h3>
              </div>
              <p className="text-body-m text-foreground-secondary leading-relaxed mb-2">
                <span className="text-foreground font-medium">Weekend traffic spike expected</span> (40-60% increase based on historical patterns). Your payment processing containers don't have memory monitoring configured.
              </p>
              <p className="text-body-s text-foreground-secondary mb-1">
                <span className="text-status-outage font-medium">Risk:</span> Potential out-of-memory (OOM) issues could disrupt customer transactions.
              </p>
              <p className="text-body-s text-foreground-secondary mb-4">
                <span className="text-primary font-medium">Recommendation:</span> Set up container memory monitoring with automated alerts.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setAct(1)}
                  className="h-8 px-4 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center gap-2"
                >
                  <Lightning size={14} />
                  Set up monitoring
                </button>
                <button className="h-8 px-4 rounded-lg border border-primary/20 text-body-s text-primary hover:bg-primary/5 transition-colors">
                  Tell me more
                </button>
              </div>
            </div>

            {/* Health Briefing + Live Updates side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Health Briefing */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-heading-m font-normal text-foreground">Health Briefing</h3>
                </div>
                <p className="text-body-s text-foreground-muted mb-3">Real-time overview of your infrastructure</p>
                <div className="space-y-2">
                  {healthItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color} mt-1.5 flex-shrink-0`} />
                      <span className="text-body-s text-foreground-secondary">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Updates */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-heading-m font-normal text-foreground">Live Updates</h3>
                  <span className="text-[10px] text-foreground-muted">updated 4:48:42 PM</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-status-active" />
                  <span className="text-body-s text-foreground-muted">LIVE — 7 EVENTS</span>
                </div>
                <div className="space-y-0">
                  {liveEvents.map((e, i) => <LiveEvent key={i} {...e} />)}
                </div>
              </div>
            </div>

            {/* Service Topology */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-heading-m font-normal text-foreground">Service Topology</h3>
                  <p className="text-body-s text-foreground-muted">Real-time dependency map of your services</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-status-active" />
                    <span className="text-[10px] text-foreground-muted">Healthy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-status-blocked" />
                    <span className="text-[10px] text-foreground-muted">Warning</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-status-outage" />
                    <span className="text-[10px] text-foreground-muted">Critical</span>
                  </div>
                </div>
              </div>
              <ServiceTopology />
            </div>
          </div>
        )}

        {/* ═══════ ACT 2: Metric Discovery ═══════ */}
        {act === 1 && (
          <div className="space-y-3">
            <div className="ai-glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkle size={14} className="text-primary" />
                <span className="text-body-s font-semibold text-primary">AI assistant</span>
              </div>
              <p className="text-body-m text-foreground leading-relaxed">
                <TypedText text="I found your payment-processing-prod cluster. Here's the current memory usage across your containers — the top container is at 680 MB, which is 85% of the 800 MB limit." speed={18} onDone={() => setAiTypingDone(true)} />
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-heading-xs font-normal text-foreground">Metric query</span>
                <span className="text-[10px] text-foreground-muted px-2 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">{coffee.metricQuery.language}</span>
              </div>
              <pre className="text-pre font-mono bg-background-surface-2/40 rounded-lg p-3 text-foreground-secondary overflow-x-auto mb-2">{coffee.metricQuery.query}</pre>
              <span className="text-[10px] text-foreground-muted">{coffee.metricQuery.timeRange}</span>
            </div>
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
                  <button onClick={() => setAct(0)} className="h-8 px-4 rounded-lg border border-border-muted text-body-s text-foreground-secondary hover:bg-background-surface-2 transition-colors">Not now</button>
                  <button onClick={() => { setAct(2); handleSetup() }} className="h-8 px-4 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center gap-2">
                    <CheckCircle size={14} /> Yes, set it up
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ ACT 3: Setup ═══════ */}
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
                <div className="glass-card p-4">
                  <h3 className="text-heading-s font-normal text-foreground mb-3">Setup complete</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Dashboard created', desc: `"${coffee.setup.dashboard.name}" with memory usage widget` },
                      { title: 'Alarm configured', desc: `"${coffee.setup.alarm.name}" — triggers at ${coffee.setup.alarm.threshold} for ${coffee.setup.alarm.evaluationPeriods} × ${coffee.setup.alarm.period}` },
                      { title: 'Notifications active', desc: `${coffee.setup.notification.type} → ${coffee.setup.notification.channel}` },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-3 py-2 ${i < 2 ? 'border-b border-border-muted' : ''}`}>
                        <CheckCircle size={16} className="text-status-active mt-0.5" weight="fill" />
                        <div>
                          <span className="text-body-s text-foreground font-medium block">{item.title}</span>
                          <span className="text-body-s text-foreground-muted">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ai-glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkle size={14} className="text-primary" />
                    <span className="text-body-s font-semibold text-primary">AI assistant</span>
                  </div>
                  <p className="text-body-m text-foreground leading-relaxed">
                    <TypedText text={coffee.setup.confirmationMessage} speed={15} onDone={() => setConfirmTypingDone(true)} />
                  </p>
                </div>
                {confirmTypingDone && (
                  <div className="flex justify-end" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <button onClick={() => setAct(3)} className="h-8 px-4 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center gap-2">
                      Back to homepage <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════ ACT 4: Updated Homepage ═══════ */}
        {act === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 space-y-3">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-heading-m font-normal text-foreground">Health Briefing</h3>
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
                <div className="glass-card p-4">
                  <h3 className="text-heading-m font-normal text-foreground mb-3">Live Updates</h3>
                  <div className="flex items-center gap-2 py-2">
                    <CheckCircle size={14} className="text-status-active" />
                    <span className="text-body-s text-foreground-muted">{coffee.updatedState.liveUpdates}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="glass-card p-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                  <h3 className="text-heading-s font-normal text-foreground mb-3">Quick access</h3>
                  {coffee.updatedState.quickAccess.map(item => (
                    <div key={item.name} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-background-surface-2 transition-colors cursor-pointer">
                      <ChartBar size={16} className="text-primary" />
                      <div className="flex-1">
                        <span className="text-body-s text-foreground block">{item.name}</span>
                        <span className="text-[10px] text-foreground-muted">{item.type}</span>
                      </div>
                      {item.isNew && <span className="text-[9px] font-semibold text-primary px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">NEW</span>}
                    </div>
                  ))}
                </div>
                <div className="ai-glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkle size={14} className="text-primary" />
                    <span className="text-body-s font-semibold text-primary">Weekend readiness</span>
                  </div>
                  <div className="space-y-2">
                    {['Memory monitoring active', 'Alarm threshold set at 87.5%', 'Team notifications configured'].map(t => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckCircle size={12} className="text-status-active" weight="fill" />
                        <span className="text-body-s text-foreground-secondary">{t}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-body-s text-foreground-muted mt-3">You're covered for the weekend. Enjoy it.</p>
                </div>
                <button
                  onClick={() => { setAct(0); setShowServices(false); setAiTypingDone(false); setSettingUp(false); setSetupDone(false); setShowChart(false); setShowSuggestion(false); setConfirmTypingDone(false) }}
                  className="w-full h-8 rounded-lg border border-border-muted text-body-s text-foreground-muted hover:bg-background-surface-2 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowClockwise size={14} /> Restart demo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  )
}
