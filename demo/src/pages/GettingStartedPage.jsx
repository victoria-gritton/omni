import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkle, Robot, ArrowRight, ArrowLeft, Bell, FileText, Path,
  ChartBar, WaveTriangle, CheckCircle, Play, Code, CaretRight,
  PaperPlaneRight, X, Download, Cpu,
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
      id: 'welcome',
      icon: Robot,
      color: 'text-primary',
      title: 'Welcome to CloudWatch Omni',
      agentMessage: `I just scanned your account and found ${total} services across ${persona.applications.length} applications. Let me walk you through getting your monitoring set up.`,
      detail: `Here's what I found:\n${persona.applications.map(a => `• ${a.name} — ${a.services.length} services`).join('\n')}`,
      action: null,
    },
    ...(needsAgent ? [{
      id: 'cw-agent',
      icon: Cpu,
      color: 'text-cyan-400',
      title: 'Install CloudWatch Agent',
      agentMessage: `I found ${computeServices.length} compute services (ECS, EKS) that need the CloudWatch Agent. The agent unlocks memory, disk, and custom metrics that aren't available by default — without it, I can only create basic CPU alarms.`,
      detail: `What the agent adds:\n• Memory utilization (not available by default)\n• Disk usage and I/O\n• Network metrics (connections, packets)\n• Custom application metrics\n\nDeployment:\n${computeServices.filter(s => s.type === 'ECS Fargate').length > 0 ? `• ECS: sidecar container (rolling restart, ~5 min, zero downtime)\n` : ''}${computeServices.filter(s => s.type === 'EKS').length > 0 ? `• EKS: DaemonSet rollout (~3 min per cluster)\n` : ''}\nThis is reversible — you can remove the agent at any time.`,
      action: { label: `Deploy agent on ${computeServices.length} services`, type: 'deploy' },
    }] : []),
    {
      id: 'alarms',
      icon: Bell,
      color: 'text-red-400',
      title: 'Set up alarms',
      agentMessage: noAlarms > 0
        ? `${noAlarms} of your ${total} services have no alarms. ${needsAgent ? 'Now that the CloudWatch Agent is installed, I can create the full set of alarms including memory and disk — not just CPU.' : 'I recommend creating ~' + alarmCount + ' alarms based on your service types.'} I recommend ~${alarmCount} alarms total.`
        : 'All your services already have alarms configured.',
      detail: noAlarms > 0 ? `I'll create alarms like:\n• ECS/EKS: CPU > 90%, Memory > 85%\n• Lambda: Errors > 1%, Duration p99 > 10s\n• RDS/Aurora: CPU > 80%, Read latency > 20ms\n• API Gateway: 5xx > 1%, Latency p99 > 1s\n\nEach alarm costs $0.10/month.` : null,
      action: noAlarms > 0 ? { label: `Create ${alarmCount} alarms`, type: 'deploy' } : null,
      done: noAlarms === 0,
    },
    {
      id: 'logs',
      icon: FileText,
      color: 'text-green-400',
      title: 'Enable logging',
      agentMessage: noLogs > 0
        ? `${noLogs} services aren't sending logs to CloudWatch. I'll configure log delivery for each service type — container logs for ECS, pod logs for EKS, access logs for API Gateway, slow query logs for databases.`
        : 'All your services are already logging.',
      detail: noLogs > 0 ? `What I'll set up:\n• ECS: awslogs log driver (rolling redeploy)\n• EKS: Fluent Bit DaemonSet\n• API Gateway: access logging (no restart)\n• RDS/Aurora: slow query + error logs\n• CloudFront: standard logging` : null,
      action: noLogs > 0 ? { label: `Enable logs on ${noLogs} services`, type: 'deploy' } : null,
      done: noLogs === 0,
    },
    {
      id: 'traces',
      icon: Path,
      color: 'text-orange-400',
      title: 'Enable tracing',
      agentMessage: noTraces > 0
        ? `None of your services have distributed tracing. X-Ray tracing will show you the full request path — from API Gateway through your compute services to databases. Essential for debugging latency issues.`
        : 'Tracing is already enabled.',
      detail: noTraces > 0 ? `I'll enable:\n• API Gateway: X-Ray tracing on stage\n• ECS: X-Ray daemon sidecar\n• EKS: ADOT collector DaemonSet\n• Lambda: active tracing (config toggle)\n\nThis involves rolling restarts for ECS/EKS services (~5 min, zero downtime).` : null,
      action: noTraces > 0 ? { label: `Enable tracing on ${noTraces} services`, type: 'deploy' } : null,
      done: noTraces === 0,
    },
    {
      id: 'dashboard',
      icon: ChartBar,
      color: 'text-primary',
      title: 'Create a dashboard',
      agentMessage: 'I\'ll create a production overview dashboard with key metrics for all your services — health summary, error rates, latency percentiles, and throughput.',
      detail: 'Dashboard sections:\n• Top row: service health, active alarms, error trend\n• Compute: CPU/memory per service\n• Data: database connections, cache hit ratio\n• Traffic: API requests, latency, errors',
      action: { label: 'Create dashboard', type: 'deploy' },
    },
    {
      id: 'anomaly',
      icon: WaveTriangle,
      color: 'text-purple-400',
      title: 'Enable anomaly detection',
      agentMessage: 'I have 14 days of metric history to work with. I\'ll set up anomaly detection on your key metrics — it learns your traffic patterns and alerts when something deviates from the norm.',
      detail: 'Detectors I\'ll create:\n• API request count (traffic spikes/drops)\n• ECS/EKS CPU and memory (resource exhaustion)\n• Database latency (performance degradation)\n• Queue message age (processing delays)',
      action: { label: 'Enable anomaly detection', type: 'deploy' },
    },
    {
      id: 'done',
      icon: CheckCircle,
      color: 'text-status-active',
      title: 'You\'re all set',
      agentMessage: 'Your monitoring is configured. You now have alarms, logs, tracing, a dashboard, and anomaly detection across all your services. I\'ll keep watching for issues and let you know if anything needs attention.',
      detail: null,
      action: { label: 'Go to your dashboard', type: 'navigate', path: '/day0' },
    },
  ]
}

function StepIndicator({ steps, currentStep, completedSteps }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((step, i) => {
        const isActive = i === currentStep
        const isDone = completedSteps.has(step.id)
        const Icon = step.icon
        return (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isDone ? 'bg-status-active/20 text-status-active' :
              isActive ? 'bg-primary/20 text-primary ring-2 ring-primary/30' :
              'bg-background-surface-1 text-foreground-disabled'
            }`}>
              {isDone ? <CheckCircle size={16} weight="fill" /> : <Icon size={14} />}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 rounded-full ${isDone ? 'bg-status-active/40' : 'bg-border-muted/30'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function GettingStartedPage() {
  const navigate = useNavigate()
  const { persona } = usePersona()
  const steps = buildSteps(persona)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [deploying, setDeploying] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const scrollRef = useRef(null)

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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto" ref={scrollRef}>
      <button onClick={() => navigate('/day0')} className="text-[11px] text-primary hover:text-primary-hover mb-4 flex items-center gap-1"><ArrowLeft size={10} /> Back to home</button>

      <StepIndicator steps={steps} currentStep={currentStep} completedSteps={completedSteps} />

      {/* Agent conversation */}
      <div className="flex gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
          <Sparkle size={18} weight="fill" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-body-s font-semibold text-foreground">{step.title}</span>
            {completedSteps.has(step.id) && <CheckCircle size={14} weight="fill" className="text-status-active" />}
          </div>
          <p className="text-body-s text-foreground-muted leading-relaxed">{step.agentMessage}</p>

          {step.detail && (
            <div className="glass-card p-4 mt-4">
              <pre className="text-[11px] text-foreground-muted whitespace-pre-wrap leading-relaxed">{step.detail}</pre>
            </div>
          )}

          {/* Action buttons */}
          {step.action && !completedSteps.has(step.id) && !step.done && (
            <div className="flex items-center gap-3 mt-5">
              {step.action.type === 'deploy' && (
                <>
                  <button onClick={handleDeploy} disabled={deploying} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium transition-colors disabled:opacity-50">
                    {deploying ? (
                      <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deploying...</>
                    ) : (
                      <><Play size={14} /> {step.action.label}</>
                    )}
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

          {/* Completed state */}
          {(completedSteps.has(step.id) || step.done) && step.action?.type === 'deploy' && (
            <div className="flex items-center gap-2 mt-4 text-status-active">
              <CheckCircle size={16} weight="fill" />
              <span className="text-body-s font-medium">Done</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border-muted/20">
        <button onClick={handleBack} disabled={isFirst} className={`flex items-center gap-1 text-body-s ${isFirst ? 'text-foreground-disabled' : 'text-foreground-muted hover:text-foreground'}`}>
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-[10px] text-foreground-disabled">Step {currentStep + 1} of {steps.length}</span>
        {!isLast ? (
          <button onClick={handleNext} className="flex items-center gap-1 text-body-s text-primary hover:text-primary-hover font-medium">
            {canProceed ? 'Next' : 'Skip'} <ArrowRight size={14} />
          </button>
        ) : (
          <div />
        )}
      </div>

      {showExport && <IaCExportModal onClose={() => setShowExport(false)} title={step.title} subtitle={step.agentMessage.substring(0, 60) + '...'} />}
    </div>
  )
}
