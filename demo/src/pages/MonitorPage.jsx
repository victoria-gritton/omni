import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, ChartBar, Sparkle, Warning, TrendUp, TrendDown,
  Globe, Cpu, Database, Lightning, Gauge, Path,
  CaretRight, CaretDown, MagnifyingGlass, CheckCircle,
  PaperPlaneRight, ArrowSquareOut, Minus, Plus,
  ShieldCheck, Clock, Eye, EyeSlash,
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'
import { LineChart, mockTimeSeries } from '../components/Chart'
import { AgentDrawer } from '../components/Drawer'
import { getInvestigation } from '../data/investigations'

const statusColors = { healthy: 'text-status-active', warning: 'text-status-degraded', critical: 'text-red-400', 'at-risk': 'text-status-degraded' }
const statusDots = { healthy: 'bg-status-active', warning: 'bg-status-degraded', critical: 'bg-red-400', 'at-risk': 'bg-status-degraded' }
const sevColors = { critical: 'text-red-400 bg-red-400/10', high: 'text-orange-400 bg-orange-400/10', medium: 'text-primary bg-primary/10', low: 'text-foreground-muted bg-foreground-muted/10' }


// ─── Health at a Glance ───────────────────────────────────────────
function HealthGlance({ applications, activeAlarms, slos }) {
  const allServices = applications.flatMap(a => a.services)
  const alarming = activeAlarms.filter(a => a.state === 'ALARM').length
  const sloAtRisk = slos.filter(s => s.status === 'at-risk').length
  const sloHealthy = slos.filter(s => s.status === 'healthy').length

  const overallStatus = alarming > 0 && activeAlarms.some(a => a.severity === 'critical') ? 'critical' : alarming > 0 ? 'warning' : 'healthy'

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center gap-4">
        {/* Overall pulse */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${overallStatus === 'critical' ? 'bg-red-400/20' : overallStatus === 'warning' ? 'bg-status-degraded/20' : 'bg-status-active/20'}`}>
            <div className={`w-4 h-4 rounded-full ${statusDots[overallStatus]}`} style={overallStatus !== 'healthy' ? { animation: 'pulse 2s ease-in-out infinite' } : undefined} />
          </div>
          <div>
            <p className="text-body-m font-semibold text-foreground">{overallStatus === 'healthy' ? 'All systems healthy' : overallStatus === 'warning' ? 'Attention needed' : 'Critical issues detected'}</p>
            <p className="text-[11px] text-foreground-muted">{allServices.length} services · {applications.length} applications</p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Quick stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className={`text-heading-m font-semibold ${alarming > 0 ? 'text-red-400' : 'text-status-active'}`}>{alarming}</p>
            <p className="text-[9px] text-foreground-disabled">Active alarms</p>
          </div>
          <div className="text-center">
            <p className={`text-heading-m font-semibold ${sloAtRisk > 0 ? 'text-status-degraded' : 'text-status-active'}`}>{sloHealthy}/{slos.length}</p>
            <p className="text-[9px] text-foreground-disabled">SLOs on target</p>
          </div>
          <div className="text-center">
            <p className="text-heading-m font-semibold text-foreground">{allServices.length}</p>
            <p className="text-[9px] text-foreground-disabled">Services</p>
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── Applications Card ────────────────────────────────────────────
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
          const hasIssue = alarmed < svcCount
          return (
            <button key={app.id} onClick={() => onInvestigate('alarms', { appName: app.name, services: app.services })} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-primary/5 transition-colors text-left group">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasIssue ? 'bg-status-degraded' : 'bg-status-active'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground">{app.name}</p>
                <p className="text-[9px] text-foreground-muted">{svcCount} services · {alarmed} alarmed</p>
              </div>
              {hasIssue && <span className="text-[8px] text-status-degraded bg-status-degraded/10 px-1.5 py-0.5 rounded">{svcCount - alarmed} gaps</span>}
              <CaretRight size={10} className="text-foreground-disabled group-hover:text-primary" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Infrastructure Card ──────────────────────────────────────────
function InfrastructureCard({ infraHealth, onInvestigate }) {
  const typeIcons = { 'EKS': Cpu, 'Aurora PostgreSQL': Database, 'DynamoDB': Database, 'ElastiCache Redis': Lightning, 'ECS Fargate': Cpu }
  const byType = {}
  for (const r of infraHealth) { if (!byType[r.type]) byType[r.type] = []; byType[r.type].push(r) }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5"><Cpu size={14} className="text-cyan-400" /><span className="text-[11px] font-medium text-foreground">Infrastructure</span></div>
        <span className="text-[9px] text-foreground-disabled">{infraHealth.length} resources</span>
      </div>
      <div className="flex flex-col gap-1">
        {infraHealth.map(r => {
          const Icon = typeIcons[r.type] || Cpu
          return (
            <button key={r.name} onClick={() => onInvestigate('db-connections', { service: r.name, label: r.name })} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-primary/5 transition-colors text-left group">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDots[r.status]}`} />
              <Icon size={12} className="text-foreground-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground">{r.name}</p>
                <p className="text-[9px] text-foreground-muted">{r.type} · {r.note}</p>
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
  const alarming = activeAlarms.filter(a => a.state === 'ALARM')
  const ok = activeAlarms.filter(a => a.state === 'OK')

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5"><Bell size={14} className="text-red-400" /><span className="text-[11px] font-medium text-foreground">Alarms</span></div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">{alarming.length} active</span>
          <span className="text-[9px] text-status-active bg-status-active/10 px-1.5 py-0.5 rounded">{ok.length} OK</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {activeAlarms.sort((a, b) => {
          const sev = { critical: 0, high: 1, medium: 2, low: 3 }
          return (sev[a.severity] ?? 3) - (sev[b.severity] ?? 3)
        }).map(alarm => (
          <button key={alarm.id} onClick={() => onInvestigate('error-rate', { service: alarm.resource, label: alarm.name })} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-primary/5 transition-colors text-left group">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${alarm.state === 'ALARM' ? statusDots[alarm.severity === 'critical' ? 'critical' : 'warning'] : 'bg-status-active'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[8px] px-1 py-0 rounded font-medium ${sevColors[alarm.severity]}`}>{alarm.severity}</span>
                <p className="text-[11px] font-medium text-foreground truncate">{alarm.name}</p>
              </div>
              <p className="text-[9px] text-foreground-muted">{alarm.resource} · {alarm.metric}: {alarm.value} (threshold: {alarm.threshold})</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[8px] text-foreground-disabled">{alarm.triggered}</span>
                <span className="text-[8px] text-primary">💡 {alarm.recommendation}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] text-foreground-disabled">Ack</span>
              <span className="text-[8px] text-foreground-disabled">Snooze</span>
              <MagnifyingGlass size={10} className="text-primary" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── SLOs Card ────────────────────────────────────────────────────
function SLOsCard({ slos, onInvestigate }) {
  const trendIcons = { up: TrendUp, down: TrendDown, stable: Minus }
  const trendColors = { up: 'text-status-active', down: 'text-red-400', stable: 'text-foreground-muted' }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5"><Gauge size={14} className="text-purple-400" /><span className="text-[11px] font-medium text-foreground">SLOs</span></div>
        <span className="text-[9px] text-foreground-disabled">{slos.filter(s => s.status === 'healthy').length}/{slos.length} on target</span>
      </div>
      <div className="flex flex-col gap-1">
        {slos.sort((a, b) => (a.status === 'at-risk' ? -1 : 1)).map(slo => {
          const TrendIcon = trendIcons[slo.trend] || Minus
          const atRisk = slo.status === 'at-risk'
          const errorBudgetPct = ((slo.current - slo.target) / (100 - slo.target)) * 100
          return (
            <button key={slo.id} onClick={() => onInvestigate('latency-waterfall', { appName: slo.service, label: slo.name })} className={`flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-primary/5 transition-colors text-left group ${atRisk ? 'bg-status-degraded/5' : ''}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${atRisk ? 'bg-status-degraded' : 'bg-status-active'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-medium text-foreground">{slo.name}</p>
                  {atRisk && <span className="text-[8px] text-status-degraded bg-status-degraded/10 px-1 py-0 rounded">at risk</span>}
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
        })}
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
      {dashboards.some(d => !d.stale) && (
        <div className="flex items-center gap-2 mt-3 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <Sparkle size={10} className="text-primary" weight="fill" />
          <span className="text-[9px] text-foreground-muted">You have 3 services with no dashboard coverage</span>
        </div>
      )}
    </div>
  )
}

// ─── Main Monitor Page ────────────────────────────────────────────
export default function MonitorPage() {
  const navigate = useNavigate()
  const { persona } = usePersona()
  const { applications, slos, activeAlarms, infraHealth, dashboards } = persona

  const [drawerInvestigation, setDrawerInvestigation] = useState(null)

  // Only James has monitor data
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

  const openInvestigation = (widgetType, context) => {
    setDrawerInvestigation(getInvestigation(widgetType, { ...context, services: applications.flatMap(a => a.services) }))
  }

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">Monitor</h1>
          <p className="text-body-s text-foreground-muted mt-0.5">System health at a glance</p>
        </div>
        <div className="flex items-center gap-2"><Sparkle size={14} className="text-primary" weight="fill" /><span className="text-[11px] text-primary font-medium">Agent active</span></div>
      </div>

      {/* Health at a glance */}
      <HealthGlance applications={applications} activeAlarms={activeAlarms} slos={slos} />

      {/* Main 2x2 grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <ApplicationsCard applications={applications} onInvestigate={openInvestigation} />
        <InfrastructureCard infraHealth={infraHealth} onInvestigate={openInvestigation} />
        <AlarmsCard activeAlarms={activeAlarms} onInvestigate={openInvestigation} />
        <SLOsCard slos={slos} onInvestigate={openInvestigation} />
      </div>

      {/* Dashboards */}
      <DashboardsSection dashboards={dashboards} />

      {/* Agent Drawer */}
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
