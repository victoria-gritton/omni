import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkle, Robot, ArrowRight, ArrowLeft, Bell, FileText, Path,
  ChartBar, WaveTriangle, CheckCircle, Play, Code,
  Cpu, CheckSquare, Square, Globe, PaperPlaneRight,
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'
import { IaCExportModal } from '../components/IaCExportModal'
import { AgentDrawer } from '../components/Drawer'

// Generate selectable items per step from persona services
function buildStepItems(persona) {
  const allServices = persona.applications.flatMap(a => a.services)
  const computeServices = allServices.filter(s => ['ECS Fargate', 'EKS', 'EC2'].includes(s.type))

  const alarmTypes = { 'ECS Fargate': ['CPU > 90%', 'Memory > 85%'], 'EKS': ['Pod restarts > 5/hr', 'Node CPU > 85%', 'Node memory > 85%'], 'Lambda': ['Errors > 1%', 'Duration p99 > 10s'], 'RDS PostgreSQL': ['CPU > 80%', 'Read latency > 20ms'], 'Aurora PostgreSQL': ['CPU > 80%', 'Replica lag > 100ms'], 'DynamoDB': ['Throttled requests > 0'], 'ElastiCache Redis': ['CPU > 75%'], 'API Gateway': ['5xx > 1%', 'Latency p99 > 1s'], 'CloudFront': ['5xx > 1%'], 'SNS + SQS': ['Message age > 300s'], 'S3': ['4xx > 5%'] }

  return {
    'cw-agent': computeServices.map(s => ({ id: `cwa-${s.name}`, label: s.name, detail: `${s.type} · ${s.type === 'EKS' ? 'DaemonSet' : 'Sidecar'}`, cost: 0.50 })),
    'alarms': allServices.filter(s => !s.hasAlarms).flatMap(s => (alarmTypes[s.type] || ['Health alarm']).map((a, i) => ({ id: `alarm-${s.name}-${i}`, label: `${s.name} — ${a}`, detail: s.type, cost: 0.10 }))),
    'logs': allServices.filter(s => !s.hasLogs).map(s => ({ id: `log-${s.name}`, label: s.name, detail: s.type, cost: s.type === 'EKS' ? 5 : s.type === 'ECS Fargate' ? 3 : 1.5 })),
    'traces': allServices.filter(s => !s.hasTraces).map(s => ({ id: `trace-${s.name}`, label: s.name, detail: s.type, cost: s.type === 'EKS' ? 1.5 : 0.5 })),
    'dashboard': [{ id: 'dash-overview', label: 'Production overview', detail: 'Health, errors, latency, throughput', cost: 3 }],
    'anomaly': [
      { id: 'anom-traffic', label: 'API request count', detail: 'Traffic spikes/drops', cost: 1 },
      { id: 'anom-cpu', label: 'Compute CPU/memory', detail: 'Resource exhaustion', cost: 1 },
      { id: 'anom-db', label: 'Database latency', detail: 'Performance degradation', cost: 1 },
      { id: 'anom-lambda', label: 'Lambda duration', detail: 'Cold starts, slowdowns', cost: 1 },
      { id: 'anom-queue', label: 'Queue message age', detail: 'Processing delays', cost: 1 },
    ],
  }
}

function buildSteps(persona) {
  const allServices = persona.applications.flatMap(a => a.services)
  const total = allServices.length
  const noAlarms = allServices.filter(s => !s.hasAlarms).length
  const noLogs = allServices.filter(s => !s.hasLogs).length
  const noTraces = allServices.filter(s => !s.hasTraces).length
  const computeServices = allServices.filter(s => ['ECS Fargate', 'EKS', 'EC2'].includes(s.type))
  const needsAgent = computeServices.length > 0

  return [
    { id: 'welcome', icon: Robot, title: 'Welcome', agentMessage: `I found ${total} services across ${persona.applications.length} applications. Let me walk you through setting up monitoring.`, detail: persona.applications.map(a => `• ${a.name} — ${a.services.length} services`).join('\n') },
    ...(needsAgent ? [{ id: 'cw-agent', icon: Cpu, title: 'Install CloudWatch Agent', agentMessage: `${computeServices.length} compute services need the CW Agent for memory, disk, and custom metrics. Without it, I can only create basic CPU alarms.`, detail: `Deployment:\n${computeServices.filter(s => s.type === 'ECS Fargate').length > 0 ? '• ECS: sidecar (rolling restart, ~5 min)\n' : ''}${computeServices.filter(s => s.type === 'EKS').length > 0 ? '• EKS: DaemonSet (~3 min per cluster)\n' : ''}Reversible.` }] : []),
    { id: 'alarms', icon: Bell, title: 'Set up alarms', agentMessage: noAlarms > 0 ? `${noAlarms} services have no alarms. Select which alarms you want — I've pre-selected the recommended ones.` : 'All services have alarms.', skip: noAlarms === 0 },
    { id: 'logs', icon: FileText, title: 'Enable logging', agentMessage: noLogs > 0 ? `${noLogs} services need log delivery. Select which to enable.` : 'All services are logging.', skip: noLogs === 0 },
    { id: 'traces', icon: Path, title: 'Enable tracing', agentMessage: noTraces > 0 ? `No services have tracing. X-Ray shows the full request path — select which to enable.` : 'Tracing is enabled.', skip: noTraces === 0 },
    { id: 'dashboard', icon: ChartBar, title: 'Create a dashboard', agentMessage: 'I\'ll create a production overview dashboard with key metrics.' },
    { id: 'anomaly', icon: WaveTriangle, title: 'Anomaly detection', agentMessage: 'Select which anomaly detectors to enable — they learn your patterns and alert on deviations.' },
    { id: 'done', icon: CheckCircle, title: 'You\'re all set', agentMessage: 'Your monitoring is configured based on your selections. I\'ll keep watching and let you know if anything needs attention.' },
  ]
}

// ─── Right Sidebar ────────────────────────────────────────────────
function RightSidebar({ stepItems, selections, deployedSteps, cost }) {
  const categories = [
    { id: 'cw-agent', icon: Cpu, label: 'CW Agent', color: 'text-cyan-400' },
    { id: 'alarms', icon: Bell, label: 'Alarms', color: 'text-red-400' },
    { id: 'logs', icon: FileText, label: 'Logs', color: 'text-green-400' },
    { id: 'traces', icon: Path, label: 'Traces', color: 'text-orange-400' },
    { id: 'dashboard', icon: ChartBar, label: 'Dashboards', color: 'text-primary' },
    { id: 'anomaly', icon: WaveTriangle, label: 'Anomaly', color: 'text-purple-400' },
  ]

  const rows = categories.map(cat => {
    const items = stepItems[cat.id] || []
    if (items.length === 0) return null
    const selected = items.filter(i => selections.has(i.id)).length
    const deployed = deployedSteps.has(cat.id)
    return { ...cat, total: items.length, selected, deployed }
  }).filter(Boolean)

  const totalSelected = rows.reduce((s, r) => s + r.selected, 0)
  const totalRecommended = rows.reduce((s, r) => s + r.total, 0)
  const selectedCost = Object.entries(stepItems).flatMap(([, items]) => items).filter(i => selections.has(i.id)).reduce((s, i) => s + (i.cost || 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-4">
        <h3 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3">Your Selections</h3>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-heading-m font-semibold text-foreground">{totalSelected}</span>
          <span className="text-body-s text-foreground-muted">/ {totalRecommended} recommended</span>
        </div>
        <div className="flex flex-col gap-2">
          {rows.map(r => {
            const Icon = r.icon
            return (
              <div key={r.id} className="flex items-center gap-2.5">
                <Icon size={12} className={r.deployed ? 'text-status-active' : r.color} />
                <span className="text-[11px] flex-1 text-foreground">{r.label}</span>
                <span className={`text-[11px] font-medium ${r.deployed ? 'text-status-active' : r.selected === 0 ? 'text-foreground-disabled' : 'text-foreground'}`}>
                  {r.deployed ? `${r.selected} ✓` : `${r.selected} / ${r.total}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3">Estimated Cost</h3>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[10px] text-foreground-muted">Current</span>
          <span className="text-body-s font-semibold text-foreground">${cost.current.total.toLocaleString()}/mo</span>
        </div>
        <div className="flex items-baseline justify-between pt-2 border-t border-border-muted/20 mt-2">
          <span className="text-[10px] text-foreground-muted">With selections</span>
          <span className="text-body-s font-semibold text-foreground">${(cost.current.total + selectedCost).toFixed(0)}/mo</span>
        </div>
        {selectedCost > 0 && <p className="text-[9px] text-foreground-disabled mt-1">+${selectedCost.toFixed(2)}/mo for {totalSelected} resources</p>}
      </div>
    </div>
  )
}

// ─── Item List (selectable per step) ──────────────────────────────
function ItemList({ items, selections, onToggle, onToggleAll, deployed }) {
  if (!items || items.length === 0) return null
  const selectedCount = items.filter(i => selections.has(i.id)).length
  const allSelected = selectedCount === items.length

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-foreground-disabled">{selectedCount} of {items.length} selected</span>
        {!deployed && <button onClick={onToggleAll} className="text-[9px] text-primary hover:text-primary-hover">{allSelected ? 'Deselect all' : 'Select all'}</button>}
      </div>
      <div className="flex flex-col gap-0.5 max-h-[240px] overflow-y-auto">
        {items.map(item => {
          const isSelected = selections.has(item.id)
          return (
            <div key={item.id} onClick={() => !deployed && onToggle(item.id)} className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-colors ${deployed ? 'opacity-50' : 'cursor-pointer hover:bg-primary/5'} ${isSelected ? 'bg-primary/5' : ''}`}>
              {isSelected ? <CheckSquare size={14} weight="fill" className={deployed ? 'text-status-active' : 'text-primary'} /> : <Square size={14} className="text-foreground-disabled" />}
              <span className="text-[11px] text-foreground flex-1">{item.label}</span>
              <span className="text-[9px] text-foreground-disabled">{item.detail}</span>
              <span className="text-[9px] text-foreground-muted">${item.cost.toFixed(2)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function GettingStartedPage() {
  const navigate = useNavigate()
  const { persona } = usePersona()
  const steps = buildSteps(persona)
  const stepItems = buildStepItems(persona)
  const allServices = persona.applications.flatMap(a => a.services)
  const [currentStep, setCurrentStep] = useState(0)
  const [deployedSteps, setDeployedSteps] = useState(new Set())
  const [deploying, setDeploying] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [drawerInvestigation, setDrawerInvestigation] = useState(null)
  const [agentInput, setAgentInput] = useState('')
  const contentRef = useRef(null)

  // Selections: empty by default, items get selected as user reaches each step
  const [selections, setSelections] = useState(new Set())
  const [stepsVisited, setStepsVisited] = useState(new Set(['welcome']))

  const step = steps[currentStep]
  const currentItems = stepItems[step.id] || []
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const hasItems = currentItems.length > 0
  const selectedInStep = currentItems.filter(i => selections.has(i.id)).length
  const isDeployed = deployedSteps.has(step.id)

  const toggleItem = (id) => setSelections(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => {
    const allSelected = currentItems.every(i => selections.has(i.id))
    setSelections(prev => { const n = new Set(prev); currentItems.forEach(i => allSelected ? n.delete(i.id) : n.add(i.id)); return n })
  }

  const handleDeploy = () => {
    setDeploying(true)
    setTimeout(() => {
      setDeploying(false)
      setDeployedSteps(prev => new Set(prev).add(step.id))
    }, 2000)
  }

  const handleNext = () => {
    if (step.id === 'welcome' || step.skip) setDeployedSteps(prev => new Set(prev).add(step.id))
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => { if (currentStep > 0) setCurrentStep(currentStep - 1) }

  useEffect(() => { contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }, [currentStep])

  // Auto-select all items when visiting a step for the first time
  useEffect(() => {
    if (!stepsVisited.has(step.id) && currentItems.length > 0) {
      setStepsVisited(prev => new Set(prev).add(step.id))
      setSelections(prev => {
        const n = new Set(prev)
        currentItems.forEach(i => n.add(i.id))
        return n
      })
    } else if (!stepsVisited.has(step.id)) {
      setStepsVisited(prev => new Set(prev).add(step.id))
    }
  }, [currentStep])

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      <button onClick={() => navigate('/day0')} className="text-[11px] text-primary hover:text-primary-hover mb-4 flex items-center gap-1"><ArrowLeft size={10} /> Back to home</button>

      <div className="mb-6">
        <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">Getting Started</h1>
        <p className="text-body-s text-foreground-muted mt-0.5">Step {currentStep + 1} of {steps.length}</p>
      </div>

      {/* Step indicator — timeline */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => {
          const isActive = i === currentStep
          const isDone = deployedSteps.has(s.id)
          const Icon = s.icon
          return (
            <div key={s.id} className="flex items-center flex-shrink-0">
              <button onClick={() => setCurrentStep(i)} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-primary/10 border border-primary/20' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-status-active/20 text-status-active' : isActive ? 'bg-primary/20 text-primary' : 'bg-background-surface-1 text-foreground-disabled'}`}>
                  {isDone ? <CheckCircle size={12} weight="fill" /> : <Icon size={11} />}
                </div>
                <span className={`text-[10px] whitespace-nowrap ${isActive ? 'text-primary font-medium' : isDone ? 'text-status-active' : 'text-foreground-disabled'}`}>{s.title}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-6 h-0.5 flex-shrink-0 ${isDone ? 'bg-status-active/40' : 'bg-border-muted/30'}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div ref={contentRef}>
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Sparkle size={18} weight="fill" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-body-m font-semibold text-foreground">{step.title}</span>
                {isDeployed && <CheckCircle size={14} weight="fill" className="text-status-active" />}
              </div>
              <p className="text-body-s text-foreground-muted leading-relaxed">{step.agentMessage}</p>
            </div>
          </div>

          {step.id === 'welcome' && (
            <div className="ml-14 mb-4">
              {/* Application cards */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {persona.applications.map(app => {
                  const types = [...new Set(app.services.map(s => s.type))]
                  return (
                    <div key={app.id} className="glass-card p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe size={14} className="text-primary" />
                        <span className="text-[11px] font-medium text-foreground">{app.name}</span>
                        <span className="text-[9px] text-foreground-disabled ml-auto">{app.services.length} services</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {app.services.map(s => (
                          <div key={s.name} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-foreground-disabled flex-shrink-0" />
                            <span className="text-[10px] text-foreground">{s.name}</span>
                            <span className="text-[8px] text-foreground-disabled ml-auto">{s.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Current posture */}
              <div className="glass-card p-4 mb-4">
                <h4 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3">Current Observability</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Alarms', have: allServices.filter(s => s.hasAlarms).length, total: allServices.length, color: 'text-red-400', bg: 'bg-red-400' },
                    { label: 'Logs', have: allServices.filter(s => s.hasLogs).length, total: allServices.length, color: 'text-green-400', bg: 'bg-green-400' },
                    { label: 'Traces', have: allServices.filter(s => s.hasTraces).length, total: allServices.length, color: 'text-orange-400', bg: 'bg-orange-400' },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className={`text-heading-m font-semibold ${m.have === 0 ? 'text-foreground-disabled' : m.color}`}>{m.have}</span>
                        <span className="text-[10px] text-foreground-muted">/ {m.total}</span>
                      </div>
                      <p className="text-[10px] text-foreground-muted mb-1">{m.label}</p>
                      <div className="w-full h-1.5 rounded-full bg-border-muted/30 overflow-hidden">
                        <div className={`h-full rounded-full ${m.bg}`} style={{ width: `${m.total > 0 ? (m.have / m.total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service map */}
              <div className="ai-glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={12} className="text-primary" />
                  <span className="text-[10px] text-primary font-medium">Discovered Service Map</span>
                </div>
                <div className="flex flex-col gap-2">
                  {persona.applications.map((app, ai) => {
                    const svcs = app.services
                    return (
                      <div key={app.id}>
                        <p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-1.5">{app.name}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {svcs.map((s, si) => (
                            <div key={s.name} className="flex items-center">
                              <div className="px-2 py-1 rounded bg-background-surface-1 border border-border-muted/30 text-[9px] text-foreground">{s.name}</div>
                              {si < svcs.length - 1 && <div className="w-3 h-px bg-border-muted/40" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step.id !== 'welcome' && step.id !== 'cw-agent' && step.detail && (
            <div className="glass-card p-4 mb-4 ml-14">
              <pre className="text-[11px] text-foreground-muted whitespace-pre-wrap leading-relaxed">{step.detail}</pre>
            </div>
          )}

          {/* CW Agent step — rich content */}
          {step.id === 'cw-agent' && (() => {
            const eksServices = currentItems.filter(i => i.detail.includes('DaemonSet'))
            const ecsServices = currentItems.filter(i => !i.detail.includes('DaemonSet'))
            const hasEks = eksServices.length > 0
            const hasEcs = ecsServices.length > 0

            return (
            <div className="ml-14 mb-4">
              {/* What the agent unlocks — capabilities grid */}
              <div className="glass-card p-4 mb-4">
                <p className="text-[9px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3">What the agent enables</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-cyan-400/5 border border-cyan-400/20 p-3">
                    <p className="text-[10px] text-cyan-400 font-medium mb-1">Enhanced Metrics</p>
                    <p className="text-[9px] text-foreground-muted">Memory, disk, network, custom app metrics — not available without the agent</p>
                  </div>
                  <div className="rounded-lg bg-purple-400/5 border border-purple-400/20 p-3">
                    <p className="text-[10px] text-purple-400 font-medium mb-1">Application Signals</p>
                    <p className="text-[9px] text-foreground-muted">Auto-instrumented APM: service map, latency breakdown, error tracking, SLO-ready</p>
                  </div>
                  <div className="rounded-lg bg-green-400/5 border border-green-400/20 p-3">
                    <p className="text-[10px] text-green-400 font-medium mb-1">Container Insights</p>
                    <p className="text-[9px] text-foreground-muted">Cluster, node, pod, container-level metrics with enhanced observability</p>
                  </div>
                  <div className="rounded-lg bg-orange-400/5 border border-orange-400/20 p-3">
                    <p className="text-[10px] text-orange-400 font-medium mb-1">Prometheus Metrics</p>
                    <p className="text-[9px] text-foreground-muted">Auto-discovers and scrapes Prometheus endpoints from your workloads</p>
                  </div>
                </div>
              </div>

              {/* EKS section */}
              {hasEks && (
                <div className="glass-card p-4 mb-3 border-l-2 border-l-cyan-400/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[11px] font-medium text-foreground">EKS — CloudWatch Observability Add-on</p>
                      <p className="text-[9px] text-foreground-muted">Single add-on install per cluster. Enables all capabilities at once.</p>
                    </div>
                    <span className="text-[9px] text-foreground-disabled">{eksServices.length} cluster{eksServices.length > 1 ? 's' : ''} · ~3 min each</span>
                  </div>

                  {/* What's included */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {['Container Insights', 'Application Signals', 'Fluent Bit logs', 'Prometheus scraping'].map(cap => (
                      <span key={cap} className="text-[8px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">{cap}</span>
                    ))}
                  </div>

                  {/* Auto-instrumentation languages detected */}
                  <div className="rounded-lg bg-background/40 border border-border-muted/20 p-2.5 mb-3">
                    <p className="text-[9px] text-foreground-disabled mb-1.5">Auto-instrumentation (detected languages)</p>
                    <div className="flex gap-2">
                      {['Java', 'Python', 'Node.js'].map(lang => (
                        <span key={lang} className="text-[9px] px-2 py-0.5 rounded bg-purple-400/10 text-purple-400 border border-purple-400/20">{lang}</span>
                      ))}
                    </div>
                  </div>

                  {/* Cluster selection */}
                  <div className="flex flex-col gap-0.5">
                    {eksServices.map(item => {
                      const isSelected = selections.has(item.id)
                      return (
                        <div key={item.id} onClick={() => !isDeployed && toggleItem(item.id)} className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-colors ${isDeployed ? 'opacity-50' : 'cursor-pointer hover:bg-primary/5'} ${isSelected ? 'bg-primary/5' : ''}`}>
                          {isSelected ? <CheckSquare size={14} weight="fill" className={isDeployed ? 'text-status-active' : 'text-primary'} /> : <Square size={14} className="text-foreground-disabled" />}
                          <span className="text-[11px] text-foreground flex-1">{item.label}</span>
                          <span className="text-[9px] text-foreground-muted">${item.cost.toFixed(2)}/mo</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ECS section */}
              {hasEcs && (
                <div className="glass-card p-4 mb-3 border-l-2 border-l-primary/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[11px] font-medium text-foreground">ECS — Sidecar per service</p>
                      <p className="text-[9px] text-foreground-muted">CW Agent added to each task definition. Supports Fargate + EC2.</p>
                    </div>
                    <span className="text-[9px] text-foreground-disabled">{ecsServices.length} service{ecsServices.length > 1 ? 's' : ''} · ~5 min total</span>
                  </div>

                  {/* What's included */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {['Enhanced metrics', 'Application Signals', 'StatsD/EMF support'].map(cap => (
                      <span key={cap} className="text-[8px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{cap}</span>
                    ))}
                  </div>

                  {/* Auto-instrumentation */}
                  <div className="rounded-lg bg-background/40 border border-border-muted/20 p-2.5 mb-3">
                    <p className="text-[9px] text-foreground-disabled mb-1.5">Application Signals auto-instrumentation</p>
                    <p className="text-[9px] text-foreground-muted">ADOT SDK init container added per task. Service names auto-detected from task definition.</p>
                  </div>

                  {/* Service selection */}
                  <div className="flex flex-col gap-0.5">
                    {ecsServices.map(item => {
                      const isSelected = selections.has(item.id)
                      return (
                        <div key={item.id} onClick={() => !isDeployed && toggleItem(item.id)} className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-colors ${isDeployed ? 'opacity-50' : 'cursor-pointer hover:bg-primary/5'} ${isSelected ? 'bg-primary/5' : ''}`}>
                          {isSelected ? <CheckSquare size={14} weight="fill" className={isDeployed ? 'text-status-active' : 'text-primary'} /> : <Square size={14} className="text-foreground-disabled" />}
                          <span className="text-[11px] text-foreground flex-1">{item.label}</span>
                          <span className="text-[9px] text-foreground-muted">${item.cost.toFixed(2)}/mo</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Impact summary */}
              <div className="rounded-lg bg-status-degraded/5 border border-status-degraded/20 p-3">
                <p className="text-[10px] text-status-degraded font-medium mb-1">⚡ Infrastructure impact</p>
                <p className="text-[10px] text-foreground-muted">
                  {hasEks && 'EKS: add-on install, no pod restarts needed. '}
                  {hasEcs && 'ECS: rolling restart per service (one task at a time, zero downtime). '}
                  Fully reversible.
                </p>
              </div>
            </div>
            )
          })()}

          {/* Selectable items (not for welcome or cw-agent which have custom content) */}
          {hasItems && step.id !== 'cw-agent' && (
            <div className="ml-14">
              <ItemList items={currentItems} selections={selections} onToggle={toggleItem} onToggleAll={toggleAll} deployed={isDeployed} />
            </div>
          )}

          {/* Actions */}
          <div className="ml-14">
            {hasItems && !isDeployed && !step.skip && selectedInStep > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <button onClick={handleDeploy} disabled={deploying} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium transition-colors disabled:opacity-50">
                  {deploying ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deploying {selectedInStep} items...</> : <><Play size={14} /> Deploy {selectedInStep} selected</>}
                </button>
                <button onClick={() => setShowExport(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-background-surface-1 border border-border-muted text-body-s text-foreground hover:bg-background-surface-2 transition-colors">
                  <Code size={14} /> Export as code
                </button>
              </div>
            )}

            {isDeployed && hasItems && (
              <div className="flex items-center gap-2 mb-4 text-status-active">
                <CheckCircle size={16} weight="fill" />
                <span className="text-body-s font-medium">{selectedInStep} items deployed</span>
              </div>
            )}

            {step.id === 'done' && (
              <button onClick={() => navigate('/day0')} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium transition-colors mb-4">
                Go to your dashboard <ArrowRight size={14} />
              </button>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border-muted/20">
              <button onClick={handleBack} disabled={isFirst} className={`flex items-center gap-1 text-body-s ${isFirst ? 'text-foreground-disabled' : 'text-foreground-muted hover:text-foreground'}`}>
                <ArrowLeft size={14} /> Back
              </button>
              {!isLast && (
                <button onClick={handleNext} className="flex items-center gap-1 text-body-s text-primary hover:text-primary-hover font-medium">
                  {isDeployed || step.skip || step.id === 'welcome' || (hasItems && selectedInStep === 0) ? 'Next' : 'Skip'} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <RightSidebar stepItems={stepItems} selections={selections} deployedSteps={deployedSteps} cost={persona.cost} />
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3"><Robot size={16} className="text-primary" /><h3 className="text-body-s font-semibold text-foreground">Ask the agent</h3></div>
            <div className="relative">
              <input type="text" value={agentInput} onChange={(e) => setAgentInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && agentInput.trim()) { setDrawerInvestigation({ title: 'Agent', subtitle: 'Getting Started', messages: [{ type: 'text', content: `You asked: "${agentInput}". I'm here to help with your setup.` }], followUps: ['What thresholds are you recommending?', 'Which services are most critical?', 'Show me the CloudFormation template'] }); setAgentInput('') } }} placeholder="e.g. 'Why these alarms?'" className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 pr-9 text-[12px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40" />
              <button onClick={() => { if (agentInput.trim()) { setDrawerInvestigation({ title: 'Agent', subtitle: 'Getting Started', messages: [{ type: 'text', content: `You asked: "${agentInput}". I'm here to help with your setup.` }], followUps: ['What thresholds are you recommending?', 'Which services are most critical?', 'Show me the CloudFormation template'] }); setAgentInput('') } }} className="absolute right-1.5 top-1.5 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20"><PaperPlaneRight size={12} /></button>
            </div>
          </div>
        </div>
      </div>

      {drawerInvestigation && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" style={{ animation: 'fadeIn 0.2s ease-out' }} onClick={() => setDrawerInvestigation(null)} />
          <AgentDrawer investigation={drawerInvestigation} onClose={() => setDrawerInvestigation(null)} onExportCode={() => setShowExport(true)} />
        </>
      )}

      {showExport && <IaCExportModal onClose={() => setShowExport(false)} title={step.title} subtitle={`${selectedInStep} items selected`} />}
    </div>
  )
}
