import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkle, Robot, ArrowRight, ArrowLeft, Bell, FileText, Path,
  ChartBar, WaveTriangle, CheckCircle, Play, Code,
  PaperPlaneRight, Cpu, Globe,
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'
import { IaCExportModal } from '../components/IaCExportModal'

// Steps the agent walks the user through
function buildSteps(persona) {
  const allServices = persona.applications.flatMap(a => a.services)
  const total = allServices.length
  const noAlarms = allServices.filter(s => !s.hasAlarms).length
  const noLogs = allServices.filter(s => !s.hasLogs).length
  const noTraces = allServices.filter(s => !s.hasTraces).length
  const alarmCount = Math.round(noAlarms * 2.6)
  const computeServices = allServices.filter(s => ['ECS Fargate', 'EKS', 'EC2'].includes(s.type))
  const needsAgent = computeServices.length > 0

  return [
    {
      id: 'welcome', icon: Robot, color: 'text-primary',
      title: 'Welcome',
      agentMessage: `I just scanned your account and found ${total} services across ${persona.applications.length} applications. Let me walk you through getting your monitoring set up.`,
      detail: `Here's what I found:\n${persona.applications.map(a => `• ${a.name} — ${a.services.length} services`).join('\n')}`,
      action: null, costImpact: 0,
    },
    ...(needsAgent ? [{
      id: 'cw-agent', icon: Cpu, color: 'text-cyan-400',
      title: 'Install CloudWatch Agent',
      agentMessage: `I found ${computeServices.length} compute services (ECS, EKS) that need the CloudWatch Agent. The agent unlocks memory, disk, and custom metrics that aren't available by default — without it, I can only create basic CPU alarms.`,
      detail: `What the agent adds:\n• Memory utilization (not available by default)\n• Disk usage and I/O\n• Network metrics (connections, packets)\n• Custom application metrics\n\nDeployment:\n${computeServices.filter(s => s.type === 'ECS Fargate').length > 0 ? `• ECS: sidecar container (rolling restart, ~5 min, zero downtime)\n` : ''}${computeServices.filter(s => s.type === 'EKS').length > 0 ? `• EKS: DaemonSet rollout (~3 min per cluster)\n` : ''}\nThis is reversible.`,
      action: { label: `Deploy agent on ${computeServices.length} services`, type: 'deploy' },
      costImpact: computeServices.length * 0.5,
    }] : []),
    {
      id: 'alarms', icon: Bell, color: 'text-red-400',
      title: 'Set up alarms',
      agentMessage: noAlarms > 0
        ? `${noAlarms} of your ${total} services have no alarms. ${needsAgent ? 'Now that the CloudWatch Agent is installed, I can create the full set including memory and disk.' : ''} I recommend ~${alarmCount} alarms total.`
        : 'All your services already have alarms configured.',
      detail: noAlarms > 0 ? `I'll create alarms like:\n• ECS/EKS: CPU > 90%, Memory > 85%\n• Lambda: Errors > 1%, Duration p99 > 10s\n• RDS/Aurora: CPU > 80%, Read latency > 20ms\n• API Gateway: 5xx > 1%, Latency p99 > 1s\n\nEach alarm costs $0.10/month.` : null,
      action: noAlarms > 0 ? { label: `Create ${alarmCount} alarms`, type: 'deploy' } : null,
      done: noAlarms === 0, costImpact: alarmCount * 0.10,
    },
    {
      id: 'logs', icon: FileText, color: 'text-green-400',
      title: 'Enable logging',
      agentMessage: noLogs > 0
        ? `${noLogs} services aren't sending logs to CloudWatch. I'll configure log delivery for each service type.`
        : 'All your services are already logging.',
      detail: noLogs > 0 ? `What I'll set up:\n• ECS: awslogs log driver (rolling redeploy)\n• EKS: Fluent Bit DaemonSet\n• API Gateway: access logging (no restart)\n• RDS/Aurora: slow query + error logs\n• CloudFront: standard logging` : null,
      action: noLogs > 0 ? { label: `Enable logs on ${noLogs} services`, type: 'deploy' } : null,
      done: noLogs === 0, costImpact: 28,
    },
    {
      id: 'traces', icon: Path, color: 'text-orange-400',
      title: 'Enable tracing',
      agentMessage: noTraces > 0
        ? `None of your services have distributed tracing. X-Ray will show you the full request path — essential for debugging latency issues.`
        : 'Tracing is already enabled.',
      detail: noTraces > 0 ? `I'll enable:\n• API Gateway: X-Ray tracing on stage\n• ECS: X-Ray daemon sidecar\n• EKS: ADOT collector DaemonSet\n• Lambda: active tracing (config toggle)\n\nRolling restarts for ECS/EKS (~5 min, zero downtime).` : null,
      action: noTraces > 0 ? { label: `Enable tracing on ${noTraces} services`, type: 'deploy' } : null,
      done: noTraces === 0, costImpact: 8,
    },
    {
      id: 'dashboard', icon: ChartBar, color: 'text-primary',
      title: 'Create a dashboard',
      agentMessage: 'I\'ll create a production overview dashboard with key metrics for all your services.',
      detail: 'Dashboard sections:\n• Top row: service health, active alarms, error trend\n• Compute: CPU/memory per service\n• Data: database connections, cache hit ratio\n• Traffic: API requests, latency, errors',
      action: { label: 'Create dashboard', type: 'deploy' }, costImpact: 3,
    },
    {
      id: 'anomaly', icon: WaveTriangle, color: 'text-purple-400',
      title: 'Enable anomaly detection',
      agentMessage: 'I have 14 days of metric history. I\'ll set up anomaly detection on your key metrics — it learns your patterns and alerts on deviations.',
      detail: 'Detectors:\n• API request count (traffic spikes/drops)\n• ECS/EKS CPU and memory (resource exhaustion)\n• Database latency (performance degradation)\n• Queue message age (processing delays)',
      action: { label: 'Enable anomaly detection', type: 'deploy' }, costImpact: 5,
    },
    {
      id: 'done', icon: CheckCircle, color: 'text-status-active',
      title: 'You\'re all set',
      agentMessage: 'Your monitoring is configured. Alarms, logs, tracing, dashboard, and anomaly detection are active. I\'ll keep watching and let you know if anything needs attention.',
      detail: null,
      action: { label: 'Go to your dashboard', type: 'navigate', path: '/day0' }, costImpact: 0,
    },
  ]
}

// ─── Left Sidebar: Step List ──────────────────────────────────────
function StepSidebar({ steps, currentStep, completedSteps, onStepClick }) {
  return (
    <div className="w-56 flex-shrink-0">
      <h3 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3 px-3">Setup Guide</h3>
      <div className="flex flex-col gap-0.5">
        {steps.map((step, i) => {
          const isActive = i === currentStep
          const isDone = completedSteps.has(step.id)
          const Icon = step.icon
          const stepNum = step.id === 'welcome' ? null : step.id === 'done' ? null : i
          return (
            <button key={step.id} onClick={() => onStepClick(i)} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all w-full ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-background-surface-2/30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-status-active/20 text-status-active' : isActive ? 'bg-primary/20 text-primary' : 'bg-background-surface-1 text-foreground-disabled'}`}>
                {isDone ? <CheckCircle size={12} weight="fill" /> : <Icon size={11} />}
              </div>
              <div className="flex-1 min-w-0">
                {stepNum && <span className={`text-[8px] ${isActive ? 'text-primary' : 'text-foreground-disabled'}`}>Step {stepNum}</span>}
                <p className={`text-[11px] leading-tight ${isActive ? 'text-primary font-medium' : isDone ? 'text-foreground-muted line-through' : 'text-foreground-muted'}`}>{step.title}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Right Sidebar: Cost + Summary ────────────────────────────────
function RightSidebar({ steps, completedSteps, cost, persona }) {
  const allServices = persona.applications.flatMap(a => a.services)
  const completedCost = steps.filter(s => completedSteps.has(s.id)).reduce((sum, s) => sum + (s.costImpact || 0), 0)
  const totalProjectedCost = steps.filter(s => s.action?.type === 'deploy').reduce((sum, s) => sum + (s.costImpact || 0), 0)
  const completedCount = [...completedSteps].filter(id => id !== 'welcome' && id !== 'done').length
  const actionSteps = steps.filter(s => s.action?.type === 'deploy')

  return (
    <div className="w-64 flex-shrink-0 flex flex-col gap-4">
      {/* Progress summary */}
      <div className="glass-card p-4">
        <h3 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3">Progress</h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-heading-m font-semibold text-foreground">{completedCount}</span>
          <span className="text-body-s text-foreground-muted">/ {actionSteps.length} steps</span>
        </div>
        <div className="w-full h-2 rounded-full bg-border-muted/30 overflow-hidden mb-3">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${actionSteps.length > 0 ? (completedCount / actionSteps.length) * 100 : 0}%` }} />
        </div>
        <div className="flex flex-col gap-1.5">
          {actionSteps.map(s => (
            <div key={s.id} className="flex items-center gap-2">
              {completedSteps.has(s.id) ? <CheckCircle size={10} weight="fill" className="text-status-active" /> : <div className="w-2.5 h-2.5 rounded-full bg-border-muted/30" />}
              <span className={`text-[10px] ${completedSteps.has(s.id) ? 'text-foreground-muted line-through' : 'text-foreground'}`}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cost */}
      <div className="glass-card p-4">
        <h3 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3">CloudWatch Cost</h3>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[10px] text-foreground-muted">Current</span>
          <span className="text-body-s font-semibold text-foreground">${cost.current.total.toLocaleString()}/mo</span>
        </div>
        {completedCount > 0 && (
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[10px] text-foreground-muted">Added so far</span>
            <span className="text-body-s font-semibold text-status-degraded">+${completedCost.toFixed(0)}/mo</span>
          </div>
        )}
        <div className="flex items-baseline justify-between pt-2 border-t border-border-muted/20 mt-2">
          <span className="text-[10px] text-foreground-muted">After full setup</span>
          <span className="text-body-s font-semibold text-foreground">${(cost.current.total + totalProjectedCost).toFixed(0)}/mo</span>
        </div>
      </div>

      {/* Observability posture */}
      <div className="glass-card p-4">
        <h3 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3">Posture</h3>
        {[
          { label: 'Alarms', have: allServices.filter(s => s.hasAlarms).length, total: allServices.length, color: 'bg-red-400' },
          { label: 'Logs', have: allServices.filter(s => s.hasLogs).length, total: allServices.length, color: 'bg-green-400' },
          { label: 'Traces', have: allServices.filter(s => s.hasTraces).length, total: allServices.length, color: 'bg-orange-400' },
        ].map(b => (
          <div key={b.label} className="mb-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-foreground-muted">{b.label}</span>
              <span className="text-[10px] text-foreground">{b.have}/{b.total}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-border-muted/30 overflow-hidden">
              <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.total > 0 ? (b.have / b.total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function GettingStartedPage() {
  const navigate = useNavigate()
  const { persona } = usePersona()
  const steps = buildSteps(persona)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [deploying, setDeploying] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const contentRef = useRef(null)

  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const canProceed = step.done || completedSteps.has(step.id) || !step.action || step.id === 'welcome'

  const handleDeploy = () => {
    setDeploying(true)
    setTimeout(() => {
      setDeploying(false)
      setCompletedSteps(prev => new Set(prev).add(step.id))
    }, 2000)
  }

  const handleNext = () => {
    if (step.id === 'welcome' || step.done) {
      setCompletedSteps(prev => new Set(prev).add(step.id))
    }
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => { if (currentStep > 0) setCurrentStep(currentStep - 1) }

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      <button onClick={() => navigate('/day0')} className="text-[11px] text-primary hover:text-primary-hover mb-4 flex items-center gap-1"><ArrowLeft size={10} /> Back to home</button>

      <div className="mb-6">
        <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">Getting Started</h1>
        <p className="text-body-s text-foreground-muted mt-0.5">Step {currentStep + 1} of {steps.length} · {[...completedSteps].filter(id => id !== 'welcome' && id !== 'done').length} completed</p>
      </div>

      {/* Step indicator — horizontal */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {steps.map((s, i) => {
          const isActive = i === currentStep
          const isDone = completedSteps.has(s.id)
          const Icon = s.icon
          return (
            <button key={s.id} onClick={() => setCurrentStep(i)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] whitespace-nowrap transition-all flex-shrink-0 ${isActive ? 'bg-primary/10 text-primary border border-primary/20 font-medium' : isDone ? 'text-status-active' : 'text-foreground-disabled hover:text-foreground-muted'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-status-active/20' : isActive ? 'bg-primary/20' : 'bg-background-surface-1'}`}>
                {isDone ? <CheckCircle size={10} weight="fill" /> : <Icon size={9} />}
              </div>
              {s.title}
            </button>
          )
        })}
      </div>

      {/* Main grid: content + right sidebar */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div ref={contentRef}>
          {/* Agent conversation */}
          <div className="flex gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Sparkle size={18} weight="fill" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-body-m font-semibold text-foreground">{step.title}</span>
                {completedSteps.has(step.id) && <CheckCircle size={14} weight="fill" className="text-status-active" />}
              </div>
              <p className="text-body-s text-foreground-muted leading-relaxed mb-4">{step.agentMessage}</p>

              {step.detail && (
                <div className="glass-card p-4 mb-4">
                  <pre className="text-[11px] text-foreground-muted whitespace-pre-wrap leading-relaxed">{step.detail}</pre>
                </div>
              )}

              {step.action && !completedSteps.has(step.id) && !step.done && (
                <div className="flex items-center gap-3 mb-4">
                  {step.action.type === 'deploy' && (
                    <>
                      <button onClick={handleDeploy} disabled={deploying} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium transition-colors disabled:opacity-50">
                        {deploying ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deploying...</> : <><Play size={14} /> {step.action.label}</>}
                      </button>
                      <button onClick={() => setShowExport(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-background-surface-1 border border-border-muted text-body-s text-foreground hover:bg-background-surface-2 transition-colors">
                        <Code size={14} /> Export as code
                      </button>
                    </>
                  )}
                  {step.action.type === 'navigate' && (
                    <button onClick={() => navigate(step.action.path)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium transition-colors">
                      {step.action.label} <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              )}

              {(completedSteps.has(step.id) || step.done) && step.action?.type === 'deploy' && (
                <div className="flex items-center gap-2 mb-4 text-status-active">
                  <CheckCircle size={16} weight="fill" />
                  <span className="text-body-s font-medium">Done</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border-muted/20">
                <button onClick={handleBack} disabled={isFirst} className={`flex items-center gap-1 text-body-s ${isFirst ? 'text-foreground-disabled' : 'text-foreground-muted hover:text-foreground'}`}>
                  <ArrowLeft size={14} /> Back
                </button>
                {!isLast && (
                  <button onClick={handleNext} className="flex items-center gap-1 text-body-s text-primary hover:text-primary-hover font-medium">
                    {canProceed ? 'Next' : 'Skip'} <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <RightSidebar steps={steps} completedSteps={completedSteps} cost={persona.cost} persona={persona} />
      </div>

      {showExport && <IaCExportModal onClose={() => setShowExport(false)} title={step.title} subtitle={step.agentMessage.substring(0, 60) + '...'} />}
    </div>
  )
}
