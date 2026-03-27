import { useState } from 'react'
import {
  PaperPlaneRight, ShieldCheck, ChartBar, Crosshair, Link as LinkIcon,
  Lightning, Warning, TrendUp, CurrencyDollar, Bell,
  CheckCircle, Clock, ArrowRight, Sparkle, Robot,
  CircleNotch, Eye, WaveTriangle, Database, Globe,
} from '@phosphor-icons/react'
import { persona } from '../data/persona'

const insightIcons = {
  'coverage-gap': ShieldCheck,
  anomaly: WaveTriangle,
  recommendation: Eye,
  cost: CurrencyDollar,
}

const insightColors = {
  warning: 'text-status-degraded',
  info: 'text-primary',
}

const workflowIcons = {
  shield: ShieldCheck,
  chart: ChartBar,
  target: Crosshair,
  link: LinkIcon,
}

function CoverageRing({ value, label, color }) {
  const pct = Math.round(value * 100)
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (value * circ)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(51,65,85,0.3)" strokeWidth="5" />
        <circle
          cx="34" cy="34" r={r} fill="none"
          stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 34 34)"
        />
        <text x="34" y="36" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">{pct}%</text>
      </svg>
      <span className="text-[11px] text-foreground-muted">{label}</span>
    </div>
  )
}

function InsightCard({ insight }) {
  const Icon = insightIcons[insight.type] || Lightning
  const colorClass = insightColors[insight.severity] || 'text-foreground-muted'

  return (
    <div className="glass-card p-3 flex gap-3 items-start hover:border-primary/20 transition-colors">
      <div className={`mt-0.5 ${colorClass}`}>
        <Icon size={16} weight="fill" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-s font-medium text-foreground">{insight.title}</p>
        <p className="text-[11px] text-foreground-muted mt-0.5 leading-relaxed">{insight.description}</p>
      </div>
      <button className="flex-shrink-0 text-[11px] text-primary hover:text-primary-hover whitespace-nowrap px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors">
        {insight.action}
      </button>
    </div>
  )
}

function WorkflowCard({ workflow }) {
  const Icon = workflowIcons[workflow.icon] || Lightning

  return (
    <button className="glass-card p-4 text-left hover:border-primary/30 transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
          <Icon size={16} />
        </div>
      </div>
      <p className="text-body-s font-medium text-foreground">{workflow.title}</p>
      <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">{workflow.description}</p>
      <div className="flex items-center gap-1 mt-2 text-[11px] text-foreground-disabled">
        <Clock size={10} />
        <span>{workflow.estimatedTime}</span>
      </div>
    </button>
  )
}

function ActivityItem({ item, isLast }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex flex-col items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5" />
        {!isLast && <div className="w-px flex-1 bg-border-muted mt-1" />}
      </div>
      <div className={`${isLast ? '' : 'pb-3'}`}>
        <p className="text-[11px] text-foreground-muted">{item.action}</p>
        <p className="text-[10px] text-foreground-disabled mt-0.5">{item.time}</p>
      </div>
    </div>
  )
}

export default function Day0Page() {
  const [input, setInput] = useState('')
  const { user, application, coverage, agentInsights, workflows, agentActivity, services } = persona

  const firstName = user.name.split(' ')[0]
  const hour = 8 // mock morning
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkle size={16} className="text-primary" weight="fill" />
          <span className="text-[11px] text-primary font-medium">Agent active</span>
        </div>
        <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">
          {greeting}, {firstName}
        </h1>
        <p className="text-body-m text-foreground-muted mt-1">
          {application.name} — {coverage.totalServices} services across {application.regions.length} regions
        </p>
      </div>

      {/* Agent chat input */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute left-3 top-3 text-primary">
            <Robot size={18} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the agent — e.g. 'Set up alarms for all my services' or 'Why is checkout slow?'"
            className="w-full h-12 rounded-xl bg-background-surface-1 border border-border-muted pl-10 pr-12 text-body-m text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40 transition-colors"
          />
          <button className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
            <PaperPlaneRight size={16} />
          </button>
        </div>
      </div>

      {/* Main grid: left (insights + workflows) / right (coverage + activity) */}
      <div className="grid grid-cols-[1fr_320px] gap-6">

        {/* Left column */}
        <div className="flex flex-col gap-6">

          {/* Observability coverage */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-body-m font-semibold text-foreground">Observability Coverage</h2>
              <span className="text-[11px] text-foreground-disabled">{coverage.totalServices} services discovered</span>
            </div>
            <div className="flex items-center gap-8">
              <CoverageRing value={coverage.alarmCoverage} label="Alarms" color="#f59e0b" />
              <CoverageRing value={coverage.logCoverage} label="Logs" color="#22c55e" />
              <CoverageRing value={coverage.traceCoverage} label="Traces" color="#8b5cf6" />
              <div className="flex-1 pl-6 border-l border-border-muted">
                <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                  <div>
                    <span className="text-[11px] text-foreground-disabled">With alarms</span>
                    <p className="text-body-s font-medium text-foreground">{coverage.withAlarms} / {coverage.totalServices}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-foreground-disabled">With dashboards</span>
                    <p className="text-body-s font-medium text-foreground">{coverage.withDashboards} / {coverage.totalServices}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-foreground-disabled">With logs</span>
                    <p className="text-body-s font-medium text-foreground">{coverage.withLogs} / {coverage.totalServices}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-foreground-disabled">With traces</span>
                    <p className="text-body-s font-medium text-foreground">{coverage.withTraces} / {coverage.totalServices}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent insights */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-body-m font-semibold text-foreground">Agent Insights</h2>
              <span className="text-[11px] text-foreground-disabled">{agentInsights.length} findings</span>
            </div>
            <div className="flex flex-col gap-2">
              {agentInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>

          {/* One-click workflows */}
          <div>
            <h2 className="text-body-m font-semibold text-foreground mb-3">One-Click Workflows</h2>
            <div className="grid grid-cols-2 gap-3">
              {workflows.map((wf) => (
                <WorkflowCard key={wf.id} workflow={wf} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column — agent activity */}
        <div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Robot size={16} className="text-primary" />
              <h2 className="text-body-s font-semibold text-foreground">Agent Activity</h2>
            </div>
            <div className="flex flex-col">
              {agentActivity.map((item, i) => (
                <ActivityItem key={i} item={item} isLast={i === agentActivity.length - 1} />
              ))}
            </div>
          </div>

          {/* Quick service list */}
          <div className="glass-card p-4 mt-4">
            <h2 className="text-body-s font-semibold text-foreground mb-3">Services</h2>
            <div className="flex flex-col gap-1.5">
              {services.slice(0, 8).map((svc) => (
                <div key={svc.name} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${svc.status === 'healthy' ? 'bg-status-active' : 'bg-status-outage'}`} />
                    <span className="text-[11px] text-foreground">{svc.name}</span>
                  </div>
                  <span className="text-[10px] text-foreground-disabled">{svc.type}</span>
                </div>
              ))}
              <button className="text-[11px] text-primary hover:text-primary-hover mt-1 text-left">
                View all {services.length} services →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
