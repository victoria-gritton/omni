import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, ChartBar, Sparkle, TrendUp, TrendDown,
  Globe, Cpu, Database, Lightning, Gauge,
  CaretRight, CaretDown, MagnifyingGlass, CheckCircle,
  Minus, ShieldCheck, Warning,
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'
import { AgentDrawer } from '../components/Drawer'

const statusDots = { healthy: 'bg-green-400', warning: 'bg-orange-400', critical: 'bg-red-400', 'at-risk': 'bg-orange-400' }
const sevColors = { critical: 'text-red-400 bg-red-400/10', high: 'text-orange-400 bg-orange-400/10', medium: 'text-primary bg-primary/10', low: 'text-foreground-muted bg-foreground-muted/10' }
const typeIcons = { 'EKS': Cpu, 'Aurora PostgreSQL': Database, 'DynamoDB': Database, 'ElastiCache Redis': Lightning, 'ECS Fargate': Cpu }

// Simulated agent flags per application
const agentFlags = {
  'Payments Platform': [{ text: 'transactions-db CPU 76% — approaching threshold', severity: 'warning' }, { text: 'fraud-model latency p99 at 290ms (SLA: 300ms)', severity: 'warning' }],
  'Trading Engine': [{ text: 'MSK consumer lag up 40% from yesterday', severity: 'warning' }],
  'Core Services': [],
  'Compliance & Analytics': [{ text: 'analytics-cluster underutilized — CPU 22%', severity: 'info' }],
}


// ─── Health at a Glance ───────────────────────────────────────────
function HealthGlance({ applications, activeAlarms, slos }) {
  const allServices = applications.flatMap(a => a.services)
  const alarming = activeAlarms.filter(a => a.state === 'ALARM').length
  const sloAtRisk = slos.filter(s => s.status === 'at-risk').length
  const sloHealthy = slos.filter(s => s.status === 'healthy').length
  const overallStatus = alarming > 0 && activeAlarms.some(a => a.severity === 'critical') ? 'critical' : alarming > 0 ? 'warning' : 'healthy'

  // Simulated top services data
  const topServices = [
    { name: 'transactions-db', metric: 'Latency', value: '24ms', trend: 'up', status: 'warning' },
    { name: 'public-api', metric: 'Availability', value: '99.97%', trend: 'stable', status: 'healthy' },
    { name: 'payments-cluster', metric: '5xx rate', value: '0.3%', trend: 'up', status: 'warning' },
  ]

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${overallStatus === 'critical' ? 'bg-red-400/20' : overallStatus === 'warning' ? 'bg-orange-400/20' : 'bg-green-400/20'}`}>
            <div className={`w-4 h-4 rounded-full ${statusDots[overallStatus]}`} style={overallStatus !== 'healthy' ? { animation: 'pulse 2s ease-in-out infinite' } : undefined} />
          </div>
          <div>
            <p className="text-body-m font-semibold text-foreground">{overallStatus === 'healthy' ? 'All systems healthy' : overallStatus === 'warning' ? 'Attention needed' : 'Critical issues detected'}</p>
            <p className="text-[11px] text-foreground-muted">{allServices.length} services · {applications.length} applications</p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-6">
          <div className="text-center"><p className={`text-heading-m font-semibold ${alarming > 0 ? 'text-red-400' : 'text-status-active'}`}>{alarming}</p><p className="text-[9px] text-foreground-disabled">Active alarms</p></div>
          <div className="text-center"><p className={`text-heading-m font-semibold ${sloAtRisk > 0 ? 'text-status-degraded' : 'text-status-active'}`}>{sloHealthy}/{slos.length}</p><p className="text-[9px] text-foreground-disabled">SLOs on target</p></div>
          <div className="text-center"><p className="text-heading-m font-semibold text-foreground">{allServices.length}</p><p className="text-[9px] text-foreground-disabled">Services</p></div>
        </div>
      </div>

      {/* Top services by key metrics */}
      <div className="flex gap-3 pt-3 border-t border-border-muted/20">
        <p className="text-[9px] text-foreground-disabled uppercase tracking-wider self-center mr-1">Top services</p>
        {topServices.map(svc => (
          <div key={svc.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/30 border border-border-muted/20">
            <div className={`w-1.5 h-1.5 rounded-full ${statusDots[svc.status]}`} />
            <span className="text-[10px] text-foreground">{svc.name}</span>
            <span className="text-[9px] text-foreground-muted">{svc.metric}:</span>
            <span className={`text-[10px] font-medium ${svc.status === 'warning' ? 'text-status-degraded' : 'text-foreground'}`}>{svc.value}</span>
            {svc.trend === 'up' && <TrendUp size={10} className="text-status-degraded" />}
            {svc.trend === 'down' && <TrendDown size={10} className="text-status-active" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Applications Card (with agent flags) ─────────────────────────
function ApplicationsCard({ applications, onInvestigate }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5"><Globe size={14} className="text-primary" /><span className="text-[11px] font-medium text-foreground">Applications</span></div>
        <span className="text-[9px] text-foreground-disabled">{applications.length} apps</span>
      </div>
      <div className="flex flex-col gap-1">
        {applications.map(app => {
          const svcCount = app.services.length
          const alarmed = app.services.filter(s => s.hasAlarms).length
          const flags = agentFlags[app.name] || []
          const hasWarning = flags.some(f => f.severity === 'warning')
          return (
            <button key={app.id} onClick={() => onInvestigate('app', { app, flags: agentFlags[app.name] || [] })} className="flex items-start gap-2.5 py-2 px-2 rounded-lg hover:bg-primary/5 transition-colors text-left group">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${hasWarning ? 'bg-orange-400' : 'bg-green-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-medium text-foreground">{app.name}</p>
                  <span className="text-[9px] text-foreground-disabled">{svcCount} services</span>
                </div>
                {flags.length > 0 ? (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {flags.map((f, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Sparkle size={8} className={f.severity === 'warning' ? 'text-status-degraded' : 'text-primary'} weight="fill" />
                        <span className={`text-[9px] ${f.severity === 'warning' ? 'text-status-degraded' : 'text-primary'}`}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] text-foreground-muted mt-0.5">All services healthy</p>
                )}
              </div>
              <CaretRight size={10} className="text-foreground-disabled group-hover:text-primary mt-1" />
            </button>
          )
        })}
      </div>
    </div>
  )
}


// ─── Infrastructure Card (grouped by type) ────────────────────────
function InfrastructureCard({ infraHealth, onInvestigate }) {
  const [activeType, setActiveType] = useState('all')
  const byType = {}
  for (const r of infraHealth) { if (!byType[r.type]) byType[r.type] = []; byType[r.type].push(r) }
  const typeOrder = ['EKS', 'Aurora PostgreSQL', 'DynamoDB', 'ElastiCache Redis', 'ECS Fargate']
  const sortedTypes = Object.keys(byType).sort((a, b) => (typeOrder.indexOf(a) === -1 ? 99 : typeOrder.indexOf(a)) - (typeOrder.indexOf(b) === -1 ? 99 : typeOrder.indexOf(b)))
  const typeLabels = { 'EKS': 'EKS', 'Aurora PostgreSQL': 'Aurora', 'DynamoDB': 'DynamoDB', 'ElastiCache Redis': 'Redis', 'ECS Fargate': 'ECS' }

  const statusOrder = { critical: 0, warning: 1, healthy: 2 }
  const filtered = (activeType === 'all' ? infraHealth : (byType[activeType] || [])).sort((a, b) => (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2))

  return (
    <div className="glass-card p-4 flex flex-col" style={{ maxHeight: 320 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5"><Cpu size={14} className="text-cyan-400" /><span className="text-[11px] font-medium text-foreground">Infrastructure</span></div>
        <span className="text-[9px] text-foreground-disabled">{infraHealth.length} resources</span>
      </div>
      {/* Type tabs */}
      <div className="flex gap-1 mb-2 flex-shrink-0">
        <button onClick={() => setActiveType('all')} className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${activeType === 'all' ? 'bg-primary/15 text-primary' : 'text-foreground-disabled hover:text-foreground-muted'}`}>All</button>
        {sortedTypes.map(type => {
          const hasCritical = byType[type].some(r => r.status === 'critical')
          const hasWarning = byType[type].some(r => r.status === 'warning')
          const textColor = activeType === type ? 'bg-primary/15 text-primary' : hasCritical ? 'text-red-400 hover:text-red-300' : hasWarning ? 'text-orange-400 hover:text-orange-300' : 'text-foreground-disabled hover:text-foreground-muted'
          return <button key={type} onClick={() => setActiveType(type)} className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${textColor}`}>{typeLabels[type] || type}</button>
        })}
      </div>
      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 -mr-1 pr-1">
        {filtered.map(r => {
          const Icon = typeIcons[r.type] || Cpu
          return (
            <button key={r.name} onClick={() => onInvestigate('infra', { resource: r })} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-primary/5 transition-colors text-left group w-full flex-shrink-0">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDots[r.status] || 'bg-foreground-muted'}`} />
              <Icon size={10} className="text-foreground-disabled flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground">{r.name}</p>
                <p className="text-[9px] text-foreground-muted">{r.note}</p>
              </div>
              <CaretRight size={10} className="text-foreground-disabled group-hover:text-primary" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Alarms Card ──────────────────────────────────────────────────
function AlarmsCard({ activeAlarms, onInvestigate }) {
  const [acked, setAcked] = useState(new Set())
  const [snoozed, setSnoozed] = useState(new Set()) // id → label
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(null) // alarm id or null

  const snoozeOptions = [
    { label: '15 minutes', value: '15m' },
    { label: '1 hour', value: '1h' },
    { label: '4 hours', value: '4h' },
    { label: '1 day', value: '1d' },
    { label: 'Until resolved', value: 'resolved' },
  ]

  const visibleAlarms = [...activeAlarms].filter(a => !snoozed.has(a.id))
  const alarming = visibleAlarms.filter(a => a.state === 'ALARM' && !acked.has(a.id))
  const ok = visibleAlarms.filter(a => a.state === 'OK' || acked.has(a.id))

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5"><Bell size={14} className="text-red-400" /><span className="text-[11px] font-medium text-foreground">Alarms</span></div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">{alarming.length} active</span>
          <span className="text-[9px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">{ok.length} OK</span>
          {snoozed.size > 0 && <span className="text-[9px] text-foreground-muted bg-foreground-muted/10 px-1.5 py-0.5 rounded">{snoozed.size} snoozed</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {visibleAlarms.sort((a, b) => {
          if (acked.has(a.id) && !acked.has(b.id)) return 1
          if (!acked.has(a.id) && acked.has(b.id)) return -1
          return ({ critical: 0, high: 1, medium: 2, low: 3 }[a.severity] ?? 3) - ({ critical: 0, high: 1, medium: 2, low: 3 }[b.severity] ?? 3)
        }).map(alarm => {
          const isAcked = acked.has(alarm.id)
          return (
            <div key={alarm.id} className={`flex items-start gap-2.5 py-2 px-2 rounded-lg hover:bg-primary/5 transition-all text-left group ${isAcked ? 'opacity-50' : ''}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${isAcked ? 'bg-green-400' : alarm.state === 'ALARM' ? statusDots[alarm.severity === 'critical' ? 'critical' : 'warning'] : 'bg-green-400'}`} />
              <button onClick={() => onInvestigate('alarm', { alarm })} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] px-1 py-0 rounded font-medium ${sevColors[alarm.severity]}`}>{alarm.severity}</span>
                  <p className={`text-[11px] font-medium truncate ${isAcked ? 'text-foreground-muted line-through' : 'text-foreground'}`}>{alarm.name}</p>
                  {isAcked && <span className="text-[8px] text-status-active">acknowledged</span>}
                </div>
                <p className="text-[9px] text-foreground-muted">{alarm.resource} · {alarm.metric}: {alarm.value}</p>
                {!isAcked && <div className="flex items-center gap-2 mt-0.5"><span className="text-[8px] text-foreground-disabled">{alarm.triggered}</span><span className="text-[8px] text-primary flex items-center gap-0.5"><Sparkle size={7} weight="fill" /> {alarm.recommendation}</span></div>}
              </button>
              <div className="flex items-center gap-1.5 flex-shrink-0 relative opacity-0 group-hover:opacity-100 transition-opacity">
                {!isAcked && <button onClick={(e) => { e.stopPropagation(); setAcked(p => new Set(p).add(alarm.id)) }} className="text-[8px] text-foreground-muted hover:text-status-active h-5 px-1.5 rounded bg-background-surface-1 border border-border-muted hover:border-status-active/30 transition-colors">Acknowledge</button>}
                <button onClick={(e) => { e.stopPropagation(); setSnoozeMenuOpen(snoozeMenuOpen === alarm.id ? null : alarm.id) }} className="text-[8px] text-foreground-muted hover:text-foreground h-5 px-1.5 rounded bg-background-surface-1 border border-border-muted transition-colors">Snooze</button>
                {snoozeMenuOpen === alarm.id && (
                  <div className="absolute right-0 top-full mt-1 w-32 rounded-lg bg-[#0c1120] border border-border-muted shadow-xl z-20 py-1" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                    <p className="text-[8px] text-foreground-disabled px-2.5 py-1 uppercase tracking-wider">Snooze for</p>
                    {snoozeOptions.map(opt => (
                      <button key={opt.value} onClick={(e) => { e.stopPropagation(); setSnoozed(p => new Set(p).add(alarm.id)); setSnoozeMenuOpen(null) }} className="w-full text-left px-2.5 py-1.5 text-[9px] text-foreground-muted hover:text-foreground hover:bg-primary/10 transition-colors">{opt.label}</button>
                    ))}
                  </div>
                )}
                <MagnifyingGlass size={10} className="text-primary cursor-pointer" onClick={() => onInvestigate('alarm', { alarm })} />
              </div>
            </div>
          )
        })}
      </div>
      {snoozed.size > 0 && (
        <button onClick={() => setSnoozed(new Set())} className="text-[9px] text-foreground-disabled hover:text-foreground-muted mt-2 px-2">Show {snoozed.size} snoozed alarm{snoozed.size > 1 ? 's' : ''}</button>
      )}
    </div>
  )
}


// ─── SLOs Card (healthy dimmed) ───────────────────────────────────
function SLOsCard({ slos, onInvestigate }) {
  const trendIcons = { up: TrendUp, down: TrendDown, stable: Minus }
  const trendColors = { up: 'text-status-active', down: 'text-red-400', stable: 'text-foreground-muted' }
  const [showHealthy, setShowHealthy] = useState(false)
  const atRisk = slos.filter(s => s.status === 'at-risk')
  const healthy = slos.filter(s => s.status === 'healthy')

  const renderSlo = (slo, dimmed = false) => {
    const TrendIcon = trendIcons[slo.trend] || Minus
    const isAtRisk = slo.status === 'at-risk'
    return (
      <button key={slo.id} onClick={() => onInvestigate('slo', { slo })} className={`flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-primary/5 transition-colors text-left group ${isAtRisk ? 'bg-status-degraded/5' : ''} ${dimmed ? 'opacity-50' : ''}`}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isAtRisk ? 'bg-orange-400' : 'bg-green-400'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-medium text-foreground">{slo.name}</p>
            {isAtRisk && <span className="text-[8px] text-status-degraded bg-status-degraded/10 px-1 py-0 rounded">at risk</span>}
          </div>
          <p className="text-[9px] text-foreground-muted">{slo.service} · Target: {slo.target}% · Current: {slo.current}%</p>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendIcon size={12} className={trendColors[slo.trend]} />
          <span className="text-[10px] text-foreground-muted">{slo.current}%</span>
        </div>
        <CaretRight size={10} className="text-foreground-disabled group-hover:text-primary" />
      </button>
    )
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5"><Gauge size={14} className="text-purple-400" /><span className="text-[11px] font-medium text-foreground">SLOs</span></div>
        <span className="text-[9px] text-foreground-disabled">{healthy.length}/{slos.length} on target</span>
      </div>
      <div className="flex flex-col gap-1">
        {/* At-risk SLOs always visible */}
        {atRisk.map(slo => renderSlo(slo))}

        {/* Healthy SLOs — collapsed by default */}
        {healthy.length > 0 && (
          <>
            <button onClick={() => setShowHealthy(!showHealthy)} className="flex items-center gap-1.5 py-1.5 px-2 text-[9px] text-foreground-disabled hover:text-foreground-muted transition-colors">
              {showHealthy ? <CaretDown size={10} /> : <CaretRight size={10} />}
              {healthy.length} healthy SLO{healthy.length > 1 ? 's' : ''}
            </button>
            {showHealthy && healthy.map(slo => renderSlo(slo, true))}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Dashboards Section ───────────────────────────────────────────
function DashboardsSection({ dashboards }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5"><ChartBar size={14} className="text-primary" /><span className="text-[11px] font-medium text-foreground">My Dashboards</span></div>
        <button className="text-[9px] text-primary hover:text-primary-hover">+ Create dashboard</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {dashboards.map(d => (
          <button key={d.id} className={`p-3 rounded-lg border text-left hover:border-primary/30 transition-colors ${d.stale ? 'border-status-degraded/20 bg-status-degraded/5' : 'border-border-muted/20 hover:bg-primary/5'}`}>
            <p className="text-[11px] font-medium text-foreground">{d.name}</p>
            <p className="text-[9px] text-foreground-muted">{d.widgets} widgets · {d.lastViewed}</p>
            {d.stale && <span className="text-[8px] text-status-degraded">Stale — last updated 4 months ago</span>}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
        <Sparkle size={10} className="text-primary" weight="fill" />
        <span className="text-[9px] text-foreground-muted">You have 3 services with no dashboard coverage</span>
      </div>
    </div>
  )
}

// ─── Build contextual investigations for Monitor page ─────────────
function buildMonitorInvestigation(type, context, persona) {
  if (type === 'app') {
    const { app, flags } = context
    const svcCount = app.services.length
    const alarmed = app.services.filter(s => s.hasAlarms).length
    const hasFlags = flags.length > 0
    return {
      title: app.name,
      subtitle: `${svcCount} services · ${alarmed} with alarms`,
      messages: [
        { type: 'text', content: hasFlags ? `I'm seeing some issues with ${app.name} that need attention.` : `${app.name} is looking healthy. All services are operating normally.` },
        ...flags.map(f => ({ type: 'finding', severity: f.severity === 'warning' ? 'warning' : 'info', title: f.text, content: `Detected on ${app.name}` })),
        ...(alarmed < svcCount ? [{ type: 'finding', severity: 'warning', title: `${svcCount - alarmed} services without alarms`, content: 'These services have no alarm coverage. Issues could go undetected.' }] : []),
        { type: 'chart', label: `${app.name} — Error rate (24h)`, base: 0.3, variance: 0.4, color: '#f87171', unit: '%', threshold: 1, thresholdLabel: 'Alert: 1%' },
        { type: 'chart', label: `${app.name} — Latency p99 (24h)`, base: 120, variance: 50, color: '#8b5cf6', unit: 'ms', threshold: 500, thresholdLabel: 'SLA: 500ms' },
      ],
      followUps: [`What's causing the issues in ${app.name}?`, `Show me the service map`, `Which services should I prioritize?`, `Create alarms for uncovered services`],
    }
  }

  if (type === 'infra') {
    const { resource: r } = context
    const metricMap = { 'EKS': { base: 55, unit: '%', metric: 'CPU', color: '#0ea5e9' }, 'Aurora PostgreSQL': { base: 45, unit: '%', metric: 'CPU', color: '#22c55e' }, 'DynamoDB': { base: 120, unit: ' RCU', metric: 'Read capacity', color: '#60a5fa' }, 'ElastiCache Redis': { base: 92, unit: '%', metric: 'Hit ratio', color: '#facc15' }, 'ECS Fargate': { base: 35, unit: '%', metric: 'CPU', color: '#0ea5e9' } }
    const m = metricMap[r.type] || { base: 50, unit: '%', metric: 'Utilization', color: '#0ea5e9' }
    const isWarning = r.status === 'warning'
    return {
      title: r.name,
      subtitle: `${r.type} · ${r.app}`,
      messages: [
        { type: 'text', content: isWarning ? `${r.name} needs attention. Here's what I found:` : `${r.name} is operating normally. Here's the current state:` },
        { type: 'finding', severity: isWarning ? 'warning' : 'info', title: r.note, content: `${r.type} resource in ${r.app}` },
        { type: 'chart', label: `${r.name} — ${m.metric} (24h)`, base: m.base, variance: m.base * 0.3, color: m.color, unit: m.unit },
        ...(isWarning ? [{ type: 'text', content: 'I recommend investigating the root cause. This could indicate a capacity issue or a workload change.' }] : []),
      ],
      followUps: [`What's the trend over the past week?`, `Show me connected services`, `Create an alarm for ${r.name}`, `Is this normal for this time of day?`],
    }
  }

  if (type === 'alarm') {
    const { alarm: a } = context
    const isActive = a.state === 'ALARM'
    const chartBase = a.value.includes('%') ? parseFloat(a.value) : a.value.includes('ms') ? parseFloat(a.value) : 50
    const chartUnit = a.value.includes('%') ? '%' : a.value.includes('ms') ? 'ms' : ''
    const thresholdVal = parseFloat(a.threshold)
    return {
      title: `Alarm: ${a.name}`,
      subtitle: `${a.resource} · ${a.metric}`,
      messages: [
        { type: 'text', content: isActive ? `This alarm is currently firing. Here's my analysis:` : `This alarm recently resolved. Here's what happened:` },
        { type: 'chart', label: `${a.resource} — ${a.metric} (24h)`, base: chartBase * 0.8, variance: chartBase * 0.3, color: isActive ? '#f87171' : '#22c55e', unit: chartUnit, threshold: thresholdVal, thresholdLabel: `Threshold: ${a.threshold}` },
        { type: 'finding', severity: isActive ? 'critical' : 'info', title: isActive ? `${a.metric}: ${a.value} (threshold: ${a.threshold})` : 'Resolved', content: a.recommendation },
        { type: 'steps', steps: [
          { action: 'Checked deployment history', result: 'No recent deployments', status: 'clear' },
          { action: `Analyzed ${a.metric} trend`, result: isActive ? `Trending toward threshold over the past hour` : 'Brief spike, now back to normal', status: isActive ? 'found' : 'clear' },
          { action: 'Checked correlated metrics', result: isActive ? 'Connection count also elevated' : 'No correlated anomalies', status: isActive ? 'found' : 'clear' },
        ]},
        ...(isActive ? [] : []),
      ],
      followUps: [`What caused this?`, `Show me the error logs`, `Should I adjust the threshold?`, `What's the blast radius?`],
    }
  }

  if (type === 'slo') {
    const { slo: s } = context
    const atRisk = s.status === 'at-risk'
    const errorBudget = ((s.current - s.target) / (100 - s.target) * 100).toFixed(1)
    return {
      title: `SLO: ${s.name}`,
      subtitle: `${s.service} · ${s.window}`,
      messages: [
        { type: 'text', content: atRisk ? `This SLO is at risk of breaching. Error budget is running low.` : `This SLO is healthy and within target.` },
        { type: 'chart', label: `${s.name} — Attainment (30d)`, base: s.current, variance: 0.05, color: atRisk ? '#f87171' : '#22c55e', unit: '%', threshold: s.target, thresholdLabel: `Target: ${s.target}%` },
        { type: 'finding', severity: atRisk ? 'warning' : 'info', title: `Current: ${s.current}% · Target: ${s.target}%`, content: atRisk ? `Error budget at ${errorBudget}%. At current burn rate, you'll breach in ~3 days.` : `Error budget at ${errorBudget}%. Comfortable margin.` },
        ...(atRisk ? [
          { type: 'steps', steps: [
            { action: 'Analyzed error budget burn rate', result: 'Accelerating over the past 48 hours', status: 'found' },
            { action: 'Identified contributing errors', result: 'Intermittent 5xx from upstream dependency', status: 'found' },
            { action: 'Checked recent changes', result: 'No deployments in the window', status: 'clear' },
          ]},
        ] : []),
      ],
      followUps: [atRisk ? `What's burning the error budget?` : `What would put this at risk?`, `Show me the error breakdown`, `Compare with last month`, `Set up an alert at 50% budget consumed`],
    }
  }

  // Fallback
  return { title: 'Investigation', subtitle: 'Analyzing...', messages: [{ type: 'text', content: 'Looking into this...' }], followUps: ['Tell me more'] }
}

// ─── Main Monitor Page ────────────────────────────────────────────
export default function MonitorPage() {
  const navigate = useNavigate()
  const { persona } = usePersona()
  const { applications, slos, activeAlarms, infraHealth, dashboards } = persona
  const [drawerInvestigation, setDrawerInvestigation] = useState(null)

  if (!slos || !activeAlarms) {
    return (
      <div className="px-6 py-6 flex flex-col items-center justify-center min-h-[60vh]">
        <ShieldCheck size={48} className="text-foreground-disabled mb-4" />
        <h2 className="text-body-m font-semibold text-foreground mb-2">No monitoring data yet</h2>
        <p className="text-[11px] text-foreground-muted mb-4">Set up alarms, SLOs, and dashboards first.</p>
        <button onClick={() => navigate('/gaps')} className="text-[11px] text-primary hover:text-primary-hover">Go to Observability Gaps →</button>
      </div>
    )
  }

  const openInvestigation = (type, context) => {
    const inv = buildMonitorInvestigation(type, context, persona)
    setDrawerInvestigation(inv)
  }

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">Monitor</h1>
          <p className="text-body-s text-foreground-muted mt-0.5">System health at a glance</p>
        </div>
        <div className="flex items-center gap-2"><Sparkle size={14} className="text-primary" weight="fill" /><span className="text-[11px] text-primary font-medium">Agent active</span></div>
      </div>

      <HealthGlance applications={applications} activeAlarms={activeAlarms} slos={slos} />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ApplicationsCard applications={applications} onInvestigate={openInvestigation} />
        <InfrastructureCard infraHealth={infraHealth} onInvestigate={openInvestigation} />
        <AlarmsCard activeAlarms={activeAlarms} onInvestigate={openInvestigation} />
        <SLOsCard slos={slos} onInvestigate={openInvestigation} />
      </div>

      <DashboardsSection dashboards={dashboards} />

      {drawerInvestigation && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" style={{ animation: 'fadeIn 0.2s ease-out' }} onClick={() => setDrawerInvestigation(null)} />
          <AgentDrawer investigation={drawerInvestigation} onClose={() => setDrawerInvestigation(null)} />
        </>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}
