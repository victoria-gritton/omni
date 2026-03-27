import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PaperPlaneRight, Bell, ChartBar, Sparkle, Robot, ArrowRight, Play,
  WaveTriangle, Cpu, FileText, Path, Package, Broadcast,
  CheckCircle, CircleNotch, Globe, Gauge, Lightning,
  Download, Rocket, Info, CaretRight,
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'

// ─── Sparkline ────────────────────────────────────────────────────
function Sparkline({ color = '#0ea5e9', height = 24, points = 12 }) {
  const data = useRef(Array.from({ length: points }, () => 20 + Math.random() * 60)).current
  const max = Math.max(...data)
  const w = 100
  const path = data.map((v, i) => `${(i / (points - 1)) * w},${height - (v / max) * height}`).join(' ')
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="overflow-visible">
      <polyline points={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Simulation ───────────────────────────────────────────────────
const simConfig = {
  'cw-agent': { steps: 6, label: (n, t) => `Deploying to service ${n} of ${t}...`, done: 'Agent deployed' },
  'alarms': { steps: 42, label: (n, t) => `Creating alarm ${n} of ${t}...`, done: 'Alarms created' },
  'dashboard': { steps: 4, label: (n, t) => `Adding widget ${n} of ${t}...`, done: 'Dashboard created' },
  'logs': { steps: 6, label: (n, t) => `Enabling logs on ${n} of ${t}...`, done: 'Logs enabled' },
  'traces': { steps: 3, label: (n, t) => `Enabling tracing on ${n} of ${t}...`, done: 'Tracing enabled' },
  'anomaly': { steps: 5, label: (n, t) => `Configuring detector ${n} of ${t}...`, done: 'Anomaly detection enabled' },
  'service-map': { steps: 3, label: (n, t) => `Mapping dependencies ${n} of ${t}...`, done: 'Service map generated' },
  'slos': { steps: 3, label: (n, t) => `Creating SLO ${n} of ${t}...`, done: 'SLOs configured' },
  'container-insights': { steps: 3, label: (n, t) => `Updating cluster ${n} of ${t}...`, done: 'Container Insights enabled' },
}

function useSimulation() {
  const [states, setStates] = useState({})
  const [progress, setProgress] = useState({})
  const timers = useRef({})
  const run = useCallback((id) => {
    const config = simConfig[id]
    if (!config) return
    setStates(s => ({ ...s, [id]: 'running' }))
    setProgress(p => ({ ...p, [id]: 0 }))
    let step = 0
    timers.current[id] = setInterval(() => {
      step++
      if (step >= config.steps) {
        clearInterval(timers.current[id])
        setStates(s => ({ ...s, [id]: 'done' }))
        setProgress(p => ({ ...p, [id]: config.steps }))
      } else {
        setProgress(p => ({ ...p, [id]: step }))
      }
    }, 80)
  }, [])
  useEffect(() => () => Object.values(timers.current).forEach(clearInterval), [])
  return { states, progress, run }
}

// ─── CW Agent Banner ──────────────────────────────────────────────
function AgentBanner({ state, progress, onInstall }) {
  if (state === 'done') {
    return (
      <div className="glass-card p-4 border-l-2 border-l-status-active/50 flex items-center gap-3 animate-fadeIn">
        <CheckCircle size={20} weight="fill" className="text-status-active" />
        <div className="flex-1">
          <p className="text-body-s font-medium text-foreground">CloudWatch Agent installed</p>
          <p className="text-[11px] text-foreground-muted">Collecting memory, disk, and custom metrics from all services.</p>
        </div>
      </div>
    )
  }

  if (state === 'running') {
    const config = simConfig['cw-agent']
    const step = progress['cw-agent'] || 0
    return (
      <div className="ai-glass-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <CircleNotch size={20} className="text-primary animate-spin" />
          <div className="flex-1">
            <p className="text-body-s font-medium text-foreground">Installing CloudWatch Agent...</p>
            <p className="text-[11px] text-foreground-muted">{config.label(step, config.steps)}</p>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full bg-border-muted/30 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${(step / config.steps) * 100}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="ai-glass-card p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
          <Download size={22} />
        </div>
        <div className="flex-1">
          <h2 className="text-body-m font-semibold text-foreground">Install CloudWatch Agent</h2>
          <p className="text-[11px] text-foreground-muted mt-1">
            The CloudWatch Agent unlocks memory, disk, and custom metrics for your services. This is the foundation for full observability.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={onInstall}
              className="h-8 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium flex items-center gap-2 transition-colors"
            >
              <Rocket size={14} />
              Install now
            </button>
            <span className="text-[10px] text-foreground-disabled">Deploys as sidecar/DaemonSet. Zero downtime. ~2 min.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Empty State Widget ───────────────────────────────────────────
function EmptyWidget({ icon: Icon, title, description, actionLabel, color, state, progress, simId, onAction, requiresAgent, agentInstalled }) {
  const config = simConfig[simId]
  const needsAgent = requiresAgent && !agentInstalled

  if (state === 'done') return null

  if (state === 'running') {
    const step = progress[simId] || 0
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <CircleNotch size={16} className="text-primary animate-spin" />
          <h3 className="text-body-s font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-[11px] text-foreground-muted mb-2">{config?.label(step, config.steps)}</p>
        <div className="w-full h-1 rounded-full bg-border-muted/30 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${(step / config.steps) * 100}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-4 border border-dashed border-border-muted/50">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={color} style={{ opacity: 0.5 }} />
        <h3 className="text-body-s font-semibold text-foreground/50">{title}</h3>
        {needsAgent && (
          <span className="text-[8px] text-status-degraded bg-status-degraded/10 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
            <Cpu size={8} /> Requires CW Agent
          </span>
        )}
      </div>
      <p className="text-[11px] text-foreground-disabled mb-3">{description}</p>
      <button
        onClick={onAction}
        className={`h-7 px-3 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
          needsAgent
            ? 'bg-foreground-muted/10 text-foreground-disabled cursor-not-allowed'
            : 'bg-primary/10 hover:bg-primary/20 text-primary'
        }`}
        disabled={needsAgent}
      >
        <Sparkle size={12} weight="fill" />
        {needsAgent ? 'Install CW Agent first' : actionLabel}
      </button>
    </div>
  )
}

// ─── Filled Widgets (shown after setup) ───────────────────────────

function FilledAlarmWidget({ data }) {
  const d = data.alarms
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Bell size={16} className="text-status-active" /><h3 className="text-body-s font-semibold text-foreground">Alarms</h3></div>
        <span className="text-[10px] text-foreground-disabled">{d.total} configured</span>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 rounded-lg bg-status-active/10 p-2 text-center"><p className="text-body-l font-semibold text-status-active">{d.ok}</p><p className="text-[9px] text-foreground-muted">OK</p></div>
        <div className="flex-1 rounded-lg bg-status-degraded/10 p-2 text-center"><p className="text-body-l font-semibold text-status-degraded">{d.alarm}</p><p className="text-[9px] text-foreground-muted">In alarm</p></div>
        <div className="flex-1 rounded-lg bg-foreground-muted/10 p-2 text-center"><p className="text-body-l font-semibold text-foreground-muted">{d.insufficient}</p><p className="text-[9px] text-foreground-muted">Insufficient</p></div>
      </div>
      <p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-1.5">Closest to threshold</p>
      {d.nearThreshold.slice(0, 3).map(a => (
        <div key={a.name} className="flex items-center gap-2 py-1">
          <span className="text-[10px] text-foreground w-28 truncate">{a.name}</span>
          <div className="flex-1 h-1.5 rounded-full bg-border-muted/30 overflow-hidden"><div className="h-full rounded-full bg-status-degraded/60" style={{ width: `${(a.value / a.threshold) * 100}%` }} /></div>
          <span className="text-[9px] text-foreground-muted w-16 text-right">{a.value}/{a.threshold}{a.unit}</span>
        </div>
      ))}
    </div>
  )
}

function FilledDashboardWidget({ data }) {
  const metrics = data.dashboard.metrics
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><ChartBar size={16} className="text-primary" /><h3 className="text-body-s font-semibold text-foreground">Production Dashboard</h3></div>
        <span className="text-[10px] text-primary cursor-pointer hover:text-primary-hover">Open →</span>
      </div>
      <div className={`grid gap-2 ${metrics.length > 4 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {metrics.map(m => (
          <div key={m.name} className="rounded-lg bg-background/40 border border-border-muted/30 p-2">
            <p className="text-[9px] text-foreground-muted mb-1">{m.name}</p>
            <Sparkline color={m.color} height={20} />
          </div>
        ))}
      </div>
    </div>
  )
}

function FilledLogsWidget({ data }) {
  const d = data.logs
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><FileText size={16} className="text-green-400" /><h3 className="text-body-s font-semibold text-foreground">Logs</h3></div>
        <span className="text-[10px] text-foreground-disabled">{d.total} services</span>
      </div>
      <div className="flex gap-2 mb-2 text-[9px]">
        <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Standard: {d.standard}</span>
        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">IA: {d.ia}</span>
      </div>
      <p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-1">Top by volume</p>
      {d.topByVolume.slice(0, 3).map(g => (
        <div key={g.name} className="flex items-center justify-between py-0.5">
          <span className="text-[10px] text-foreground">{g.name}</span>
          <span className="text-[9px] text-foreground-muted">{g.volume}</span>
        </div>
      ))}
    </div>
  )
}

function FilledTracesWidget({ data }) {
  const latency = data.traces.latency
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Path size={16} className="text-orange-400" /><h3 className="text-body-s font-semibold text-foreground">Traces</h3></div>
        <span className="text-[10px] text-foreground-disabled">X-Ray active</span>
      </div>
      <p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-1.5">Critical path latency</p>
      <div className="flex gap-3">
        {latency.map(p => (
          <div key={p.label} className="flex-1 text-center"><p className="text-body-s font-semibold text-foreground">{p.value}</p><p className="text-[9px] text-foreground-muted">{p.label}</p></div>
        ))}
      </div>
      <div className="mt-2"><Sparkline color="#fb923c" height={16} /></div>
    </div>
  )
}

function FilledAnomalyWidget({ data }) {
  const detectors = data.anomaly.detectors
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><WaveTriangle size={16} className="text-purple-400" /><h3 className="text-body-s font-semibold text-foreground">Anomaly Detection</h3></div>
        <span className="text-[10px] text-foreground-disabled">{detectors.length} active</span>
      </div>
      {detectors.slice(0, 5).map(d => (
        <div key={d.metric} className="flex items-center gap-2 py-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-status-active" />
          <span className="text-[10px] text-foreground flex-1">{d.metric}</span>
          <span className="text-[9px] text-foreground-disabled">{d.distance} from band</span>
        </div>
      ))}
    </div>
  )
}

function FilledServiceMapWidget() {
  const nodes = ['API GW', 'Checkout', 'Payment', 'Orders DB', 'Inventory', 'Cache']
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Globe size={16} className="text-cyan-400" /><h3 className="text-body-s font-semibold text-foreground">Service Map</h3></div>
        <span className="text-[10px] text-cyan-400 cursor-pointer hover:text-cyan-300">Open full map →</span>
      </div>
      <div className="flex items-center justify-center gap-1 py-2">
        {nodes.map((n, i) => (
          <div key={n} className="flex items-center gap-1">
            <div className="px-2 py-1 rounded bg-background/60 border border-border-muted/30 text-[8px] text-foreground-muted">{n}</div>
            {i < nodes.length - 1 && <div className="w-3 h-px bg-cyan-400/40" />}
          </div>
        ))}
      </div>
    </div>
  )
}

function FilledSLOWidget() {
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Gauge size={16} className="text-emerald-400" /><h3 className="text-body-s font-semibold text-foreground">SLOs</h3></div>
        <span className="text-[10px] text-foreground-disabled">3 objectives</span>
      </div>
      {[
        { name: 'Checkout availability', target: '99.9%', current: '99.94%', ok: true },
        { name: 'Payment latency p99', target: '< 500ms', current: '320ms', ok: true },
        { name: 'API error rate', target: '< 0.5%', current: '0.12%', ok: true },
      ].map(s => (
        <div key={s.name} className="flex items-center gap-2 py-1">
          <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-status-active' : 'bg-status-outage'}`} />
          <span className="text-[10px] text-foreground flex-1">{s.name}</span>
          <span className="text-[9px] text-foreground-muted">{s.current}</span>
          <span className="text-[9px] text-foreground-disabled">/ {s.target}</span>
        </div>
      ))}
    </div>
  )
}

function FilledContainerInsightsWidget({ data }) {
  const clusters = data.containerInsights.clusters
  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Package size={16} className="text-teal-400" /><h3 className="text-body-s font-semibold text-foreground">Container Insights</h3></div>
        <span className="text-[10px] text-foreground-disabled">{clusters.length} clusters</span>
      </div>
      <div className="flex gap-2">
        {clusters.map(c => (
          <div key={c.name} className="flex-1 rounded-lg bg-background/40 border border-border-muted/30 p-2 text-center">
            <p className="text-body-s font-semibold text-foreground">{c.tasks}</p>
            <p className="text-[9px] text-foreground-muted">{c.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Playground Card ──────────────────────────────────────────────
function PlaygroundCard() {
  const navigate = useNavigate()
  return (
    <div className="glass-card p-4 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => navigate('/watch')}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
          <Rocket size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-body-s font-semibold text-foreground">Explore CloudWatch Playground</h3>
          <p className="text-[11px] text-foreground-muted mt-0.5">See what CloudWatch can do with sample data — dashboards, alarms, traces, and AI-powered troubleshooting.</p>
          <span className="text-[11px] text-purple-400 mt-2 inline-flex items-center gap-1">
            Try the 2AM SRE demo <CaretRight size={10} />
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────

const widgetConfig = [
  { id: 'alarms', icon: Bell, title: 'Alarms', color: 'text-status-active', description: 'No alarms configured yet. The agent can create recommended alarms based on your infrastructure.', actionLabel: 'Auto-configure alarms', requiresAgent: false },
  { id: 'dashboard', icon: ChartBar, title: 'Dashboard', color: 'text-primary', description: 'No dashboards yet. The agent can generate a production overview with key metrics.', actionLabel: 'Generate dashboard', requiresAgent: false },
  { id: 'logs', icon: FileText, title: 'Logs', color: 'text-green-400', description: 'Most services aren\'t sending logs to CloudWatch yet. Enable log delivery to start querying.', actionLabel: 'Enable logging', requiresAgent: false },
  { id: 'traces', icon: Path, title: 'Traces', color: 'text-orange-400', description: 'No distributed tracing enabled. X-Ray tracing shows the full request path across services.', actionLabel: 'Enable tracing', requiresAgent: false },
  { id: 'service-map', icon: Globe, title: 'Service Map', color: 'text-cyan-400', description: 'See how your services connect. Enable tracing first to generate the dependency map.', actionLabel: 'Generate service map', requiresAgent: false },
  { id: 'anomaly', icon: WaveTriangle, title: 'Anomaly Detection', color: 'text-purple-400', description: 'CloudWatch has 14 days of metric history. Enable anomaly detection to catch unusual patterns.', actionLabel: 'Enable anomaly detection', requiresAgent: false },
  { id: 'slos', icon: Gauge, title: 'SLOs', color: 'text-emerald-400', description: 'Define Service Level Objectives for your critical path. Requires Application Signals.', actionLabel: 'Define SLOs', requiresAgent: true },
  { id: 'container-insights', icon: Package, title: 'Container Insights', color: 'text-teal-400', description: 'Cluster, node, and pod-level metrics for your ECS/EKS workloads.', actionLabel: 'Enable Container Insights', requiresAgent: true },
]

const filledWidgets = {
  alarms: FilledAlarmWidget,
  dashboard: FilledDashboardWidget,
  logs: FilledLogsWidget,
  traces: FilledTracesWidget,
  'service-map': FilledServiceMapWidget,
  anomaly: FilledAnomalyWidget,
  slos: FilledSLOWidget,
  'container-insights': FilledContainerInsightsWidget,
}

export default function Day0Page() {
  const [input, setInput] = useState('')
  const navigate = useNavigate()
  const { persona } = usePersona()
  const { user, application, coverage, services } = persona
  const { states, progress, run } = useSimulation()

  const firstName = user.name.split(' ')[0]

  const agentInstalled = states['cw-agent'] === 'done'

  return (
    <div className="px-6 py-6">
      <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">
        Home
      </h1>
      <div className="mb-6" />

      <div className="max-w-5xl mx-auto">

        {/* Agent chat input */}
        <div className="relative mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your services, metrics, or alarms..."
            className="w-full h-12 rounded-xl bg-background-surface-1 border border-border-muted px-4 pr-12 text-body-m text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40 transition-colors"
          />
          <button className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
            <PaperPlaneRight size={16} />
          </button>
        </div>

        {/* Welcome + discovery summary */}
        <div className="glass-card p-4 mb-4 flex items-center gap-3">
          <Sparkle size={16} className="text-primary" weight="fill" />
          <p className="text-body-s text-foreground">
            Welcome, {firstName}. I found <span className="text-primary font-medium">{coverage.totalServices} services</span> across <span className="text-primary font-medium">{application.regions.length} regions</span>.
            {coverage.withAlarms === 0 ? ' No monitoring is configured yet — let\'s get started.' : ` You have partial monitoring — ${coverage.withAlarms} services with alarms.`}
          </p>
        </div>

        {/* CW Agent Banner — first priority */}
        <div className="mb-4">
          <AgentBanner
            state={states['cw-agent'] || 'idle'}
            progress={progress}
            onInstall={() => run('cw-agent')}
          />
        </div>

        {/* Playground card */}
        <div className="mb-6">
          <PlaygroundCard />
        </div>

        {/* Widget grid — empty states that fill in as user configures */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {widgetConfig.map(w => {
            const isDone = states[w.id] === 'done'
            const FilledWidget = filledWidgets[w.id]

            if (isDone && FilledWidget) {
              return <FilledWidget key={w.id} data={persona.widgetData} />
            }

            return (
              <EmptyWidget
                key={w.id}
                icon={w.icon}
                title={w.title}
                description={w.description}
                actionLabel={w.actionLabel}
                color={w.color}
                state={states[w.id] || 'idle'}
                progress={progress}
                simId={w.id}
                onAction={() => run(w.id)}
                requiresAgent={w.requiresAgent}
                agentInstalled={agentInstalled}
              />
            )
          })}
        </div>

        {/* Discovered services */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-body-s font-semibold text-foreground">Discovered Services</h3>
            <span className="text-[10px] text-foreground-disabled">{services.length} services</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {services.slice(0, 10).map(svc => (
              <div key={svc.name} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground-disabled" />
                  <span className="text-[11px] text-foreground">{svc.name}</span>
                </div>
                <span className="text-[10px] text-foreground-disabled">{svc.type}</span>
              </div>
            ))}
          </div>
          {services.length > 10 && (
            <button className="text-[11px] text-primary hover:text-primary-hover mt-2 text-left">
              View all {services.length} services →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
