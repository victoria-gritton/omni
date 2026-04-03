import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkle, Robot, ArrowRight, ArrowLeft, Bell, FileText, Path,
  ChartBar, WaveTriangle, CheckCircle, Play, Code,
  Cpu, CheckSquare, Square, Globe, PaperPlaneRight, Info, CaretRight,
  Package, Broadcast, PencilSimple, Warning, ShieldWarning,
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'
import { IaCExportModal } from '../components/IaCExportModal'
import { AlarmConfigModal } from '../components/AlarmConfigModal'
import { LogConfigModal } from '../components/LogConfigModal'
import { AgentDrawer } from '../components/Drawer'
import { serviceSeverity } from '../data/recommendations'

// Generate selectable items per step from persona services
const alarmsByType = {
  'API Gateway': [
    { id: 'alarm-5xx', name: '5xx Error Rate > 1%', shortName: '5xx Error Rate', metric: '5XXError', threshold: '1%', severity: 'critical', reason: 'Customer-facing errors directly impact user experience and revenue.', config: { metric: '5XXError', threshold: 1, unit: '%', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' } },
    { id: 'alarm-latency', name: 'Latency p99 > 1s', shortName: 'Latency p99', metric: 'Latency', threshold: '1000ms', severity: 'warning', reason: 'High latency degrades user experience and can cascade to downstream timeouts.', config: { metric: 'Latency', threshold: 1000, unit: 'ms', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'missing' } },
  ],
  'ECS Fargate': [
    { id: 'alarm-cpu', name: 'CPU > 90%', shortName: 'CPU Utilization', metric: 'CPUUtilization', threshold: '90%', severity: 'critical', reason: 'Sustained high CPU causes request queuing, increased latency, and potential task failures.', config: { metric: 'CPUUtilization', threshold: 90, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' } },
    { id: 'alarm-mem', name: 'Memory > 85%', shortName: 'Memory Utilization', metric: 'MemoryUtilization', threshold: '85%', severity: 'critical', reason: 'Memory exhaustion triggers OOM kills, causing task restarts and dropped requests.', config: { metric: 'MemoryUtilization', threshold: 85, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' } },
  ],
  'Lambda': [
    { id: 'alarm-errors', name: 'Error rate > 1%', shortName: 'Error Rate', metric: 'Errors', threshold: '1%', severity: 'critical', reason: 'Lambda errors mean failed business logic — orders not processed, events lost.', config: { metric: 'Errors', threshold: 1, unit: '%', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' } },
    { id: 'alarm-duration', name: 'Duration p99 > 10s', shortName: 'Duration p99', metric: 'Duration', threshold: '10s', severity: 'warning', reason: 'Long-running invocations risk timeout and increase cost. May indicate cold starts or downstream issues.', config: { metric: 'Duration', threshold: 10000, unit: 'ms', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'missing' } },
  ],
  'RDS PostgreSQL': [
    { id: 'alarm-cpu', name: 'CPU > 80%', shortName: 'CPU Utilization', metric: 'CPUUtilization', threshold: '80%', severity: 'critical', reason: 'Database CPU saturation causes query queuing and application-wide slowdowns.', config: { metric: 'CPUUtilization', threshold: 80, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' } },
    { id: 'alarm-latency', name: 'Read latency > 20ms', shortName: 'Read Latency', metric: 'ReadLatency', threshold: '20ms', severity: 'warning', reason: 'Elevated read latency slows every query-dependent request path.', config: { metric: 'ReadLatency', threshold: 0.02, unit: 's', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'missing' } },
  ],
  'Aurora PostgreSQL': [
    { id: 'alarm-cpu', name: 'CPU > 80%', shortName: 'CPU Utilization', metric: 'CPUUtilization', threshold: '80%', severity: 'critical', reason: 'Database CPU saturation causes query queuing and application-wide slowdowns.', config: { metric: 'CPUUtilization', threshold: 80, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' } },
    { id: 'alarm-replica-lag', name: 'Replica lag > 100ms', shortName: 'Replica Lag', metric: 'AuroraReplicaLag', threshold: '100ms', severity: 'warning', reason: 'High replica lag means read replicas serve stale data — dangerous for consistency-sensitive reads.', config: { metric: 'AuroraReplicaLag', threshold: 100, unit: 'ms', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' } },
  ],
  'DynamoDB': [
    { id: 'alarm-throttle', name: 'Throttled requests > 0', shortName: 'Throttled Requests', metric: 'ThrottledRequests', threshold: '0', severity: 'critical', reason: 'Throttling means DynamoDB is rejecting requests — data writes may be lost.', config: { metric: 'ThrottledRequests', threshold: 0, unit: 'count', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' } },
  ],
  'ElastiCache Redis': [
    { id: 'alarm-cpu', name: 'CPU > 75%', shortName: 'CPU Utilization', metric: 'CPUUtilization', threshold: '75%', severity: 'warning', reason: 'Redis is single-threaded — high CPU means cache operations are queuing.', config: { metric: 'CPUUtilization', threshold: 75, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' } },
  ],
  'CloudFront': [
    { id: 'alarm-5xx', name: '5xx error rate > 1%', shortName: '5xx Error Rate', metric: '5xxErrorRate', threshold: '1%', severity: 'warning', reason: 'CDN errors affect all users globally — often indicates origin issues.', config: { metric: '5xxErrorRate', threshold: 1, unit: '%', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' } },
  ],
  'SNS + SQS': [
    { id: 'alarm-age', name: 'Message age > 300s', shortName: 'Message Age', metric: 'ApproximateAgeOfOldestMessage', threshold: '300s', severity: 'warning', reason: 'Old messages mean consumers are falling behind — events are being processed late.', config: { metric: 'ApproximateAgeOfOldestMessage', threshold: 300, unit: 's', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' } },
  ],
  'S3': [
    { id: 'alarm-4xx', name: '4xx error rate > 5%', shortName: '4xx Error Rate', metric: '4xxErrors', threshold: '5%', severity: 'warning', reason: 'High 4xx rates indicate misconfigured clients or permission issues.', config: { metric: '4xxErrors', threshold: 5, unit: '%', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' } },
  ],
  'EKS': [
    { id: 'alarm-pod-restarts', name: 'Pod restarts > 5/hr', shortName: 'Pod Restarts', metric: 'pod_restart_count', threshold: '5/hr', severity: 'critical', reason: 'Frequent restarts indicate crash loops — the service is unstable and losing in-flight requests.', config: { metric: 'pod_restart_count', threshold: 5, unit: '/hr', period: 3600, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' } },
    { id: 'alarm-node-cpu', name: 'Node CPU > 85%', shortName: 'Node CPU', metric: 'node_cpu_utilization', threshold: '85%', severity: 'critical', reason: 'Node CPU saturation causes pod evictions and scheduling failures.', config: { metric: 'node_cpu_utilization', threshold: 85, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' } },
    { id: 'alarm-node-mem', name: 'Node memory > 85%', shortName: 'Node Memory', metric: 'node_memory_utilization', threshold: '85%', severity: 'warning', reason: 'High node memory triggers OOM kills on pods, starting with lowest-priority workloads.', config: { metric: 'node_memory_utilization', threshold: 85, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' } },
  ],
}

const logsByServiceType = {
  'API Gateway': [{ id: 'log-access', name: 'Access logs', description: 'Request/response logging with caller identity, latency, and status codes.', reason: 'Without access logs, you can\'t trace which API calls failed or identify abusive callers.', volume: '~2 GB/mo', logClass: 'standard' }],
  'ECS Fargate': [{ id: 'log-container', name: 'Container logs', description: 'stdout/stderr from each container via awslogs driver.', reason: 'Container logs are your primary debugging tool — stack traces, error messages, and application output all live here.', volume: '~5 GB/mo per service', logClass: 'standard' }],
  'Lambda': [{ id: 'log-function', name: 'Function logs', description: 'Invocation logs with START/END/REPORT lines and your console output.', reason: 'Lambda auto-creates log groups, but without proper retention and class settings you\'ll overpay for storage.', volume: '~1 GB/mo', logClass: 'standard' }],
  'RDS PostgreSQL': [
    { id: 'log-slow', name: 'Slow query log', description: 'Queries exceeding the configured duration threshold.', reason: 'Slow queries are the #1 cause of database-related outages. You need these to identify and optimize problematic queries.', volume: '~500 MB/mo', logClass: 'standard' },
    { id: 'log-error', name: 'Error log', description: 'Connection failures, deadlocks, and internal errors.', reason: 'Error logs catch connection storms, authentication failures, and replication issues before they cascade.', volume: '~200 MB/mo', logClass: 'infrequent' },
  ],
  'Aurora PostgreSQL': [
    { id: 'log-slow', name: 'Slow query log', description: 'Queries exceeding the configured duration threshold.', reason: 'Slow queries are the #1 cause of database-related outages. You need these to identify and optimize problematic queries.', volume: '~500 MB/mo', logClass: 'standard' },
    { id: 'log-audit', name: 'Audit log', description: 'pgAudit records for compliance — who accessed what data and when.', reason: 'Required for SOC2/PCI compliance. Tracks all data access operations with user identity.', volume: '~1 GB/mo', logClass: 'infrequent' },
  ],
  'CloudFront': [{ id: 'log-access', name: 'Access logs', description: 'Edge request logs with viewer IP, URI, status, and cache hit/miss.', reason: 'CDN logs help identify cache misses, geographic traffic patterns, and origin errors.', volume: '~3 GB/mo', logClass: 'infrequent' }],
  'DynamoDB': [{ id: 'log-cloudtrail', name: 'CloudTrail data events', description: 'Read/write API calls with caller identity and request parameters.', reason: 'Tracks who modified what data — essential for audit trails and investigating data corruption.', volume: '~1 GB/mo', logClass: 'infrequent' }],
  'ElastiCache Redis': [{ id: 'log-slow', name: 'Slow log', description: 'Commands exceeding the configured latency threshold.', reason: 'Redis is single-threaded — one slow command blocks everything. Slow logs help you find the culprit.', volume: '~200 MB/mo', logClass: 'standard' }],
  'EKS': [{ id: 'log-pods', name: 'Pod logs', description: 'Fluent Bit DaemonSet collects stdout/stderr from all pods.', reason: 'Pod logs are essential for debugging crashes, tracking deployments, and investigating errors across your cluster.', volume: '~10 GB/mo', logClass: 'standard' }],
  'SageMaker': [{ id: 'log-inference', name: 'Inference logs', description: 'Model input/output logging for debugging and monitoring.', reason: 'Inference logs help detect data drift, debug prediction errors, and audit model behavior.', volume: '~2 GB/mo', logClass: 'infrequent' }],
  'SNS + SQS': [{ id: 'log-delivery', name: 'Delivery logs', description: 'Message delivery status and failure reasons.', reason: 'Without delivery logs, failed messages disappear silently — you won\'t know events were lost.', volume: '~500 MB/mo', logClass: 'infrequent' }],
  'S3': [{ id: 'log-access', name: 'Access logs', description: 'Bucket access records with requester, operation, and response status.', reason: 'S3 access logs help detect unauthorized access attempts and track data retrieval patterns.', volume: '~1 GB/mo', logClass: 'infrequent' }],
  'Kinesis': [{ id: 'log-monitoring', name: 'Enhanced monitoring', description: 'Shard-level metrics and consumer lag tracking.', reason: 'Shard-level logs help identify hot partitions and consumer processing bottlenecks.', volume: '~500 MB/mo', logClass: 'standard' }],
  'MSK': [{ id: 'log-broker', name: 'Broker logs', description: 'Kafka broker logs with partition assignments and replication status.', reason: 'Broker logs are critical for diagnosing replication lag, partition reassignment issues, and consumer group problems.', volume: '~3 GB/mo', logClass: 'standard' }],
}

function buildStepItems(persona) {
  const allServices = persona.applications.flatMap(a => a.services)
  const computeServices = allServices.filter(s => ['ECS Fargate', 'EKS', 'EC2'].includes(s.type))

  return {
    'cw-agent': computeServices.map(s => ({ id: `cwa-${s.name}`, label: s.name, detail: `${s.type} · ${s.type === 'EKS' ? 'Add-on' : 'Sidecar'}`, cost: 0.50 })),
    'alarms': allServices.filter(s => !s.hasAlarms).flatMap(s => (alarmsByType[s.type] || [{ id: 'alarm-health', name: 'Health alarm', shortName: 'Health', metric: 'HealthCheck', threshold: '1', severity: 'warning', reason: 'Basic health monitoring.', config: { metric: 'HealthCheck', threshold: 1, unit: '', period: 300, evalPeriods: 1, comparison: 'LessThanThreshold', missingData: 'breaching' } }]).map((a) => ({
      id: `alarm-${s.name}-${a.id}`, label: `${s.name} — ${a.name}`, shortName: a.shortName || a.name, detail: s.type, cost: 0.10,
      service: s.name, serviceType: s.type, severity: a.severity, reason: a.reason, metric: a.metric, threshold: a.threshold, config: a.config,
    }))),
    'logs': allServices.filter(s => !s.hasLogs).flatMap(s => (logsByServiceType[s.type] || [{ id: 'log-default', name: 'Application logs', description: 'Enable log delivery to CloudWatch Logs.', reason: 'Logs are essential for debugging and audit.', volume: '~1 GB/mo', logClass: 'standard' }]).map((l) => ({
      id: `log-${s.name}-${l.id}`, label: `${s.name} — ${l.name}`, logName: l.name, detail: s.type,
      cost: l.logClass === 'infrequent' ? 1.5 : s.type === 'EKS' ? 5 : s.type === 'ECS Fargate' ? 3 : 1.5,
      service: s.name, serviceType: s.type, description: l.description, reason: l.reason, volume: l.volume, logClass: l.logClass,
    }))),
  }
}

function buildSteps(persona) {
  const allServices = persona.applications.flatMap(a => a.services)
  const total = allServices.length
  const noAlarms = allServices.filter(s => !s.hasAlarms).length
  const noLogs = allServices.filter(s => !s.hasLogs).length
  const noTraces = allServices.filter(s => !s.hasTraces).length
  const computeServices = allServices.filter(s => ['ECS Fargate', 'EKS', 'EC2'].includes(s.type))
  const ecsServices = allServices.filter(s => s.type === 'ECS Fargate')
  const eksServices = allServices.filter(s => s.type === 'EKS')
  const needsAgent = computeServices.length > 0
  const hasEcs = ecsServices.length > 0
  const hasEks = eksServices.length > 0

  // Recommended next steps shown on the final screen
  const nextSteps = [
    ...(hasEcs ? [{ icon: Package, title: 'Enable Container Insights', description: 'Cluster-level metrics for ECS services. No restarts needed.', path: '/gaps' }] : []),
    ...(needsAgent ? [{ icon: Broadcast, title: 'Enable Application Signals', description: `Auto-instrumented APM: service map, latency breakdown, SLO support.${hasEcs ? ' Requires ADOT init container for ECS.' : ''}`, path: '/gaps' }] : []),
    ...(noTraces > 0 ? [{ icon: Path, title: 'Enable X-Ray tracing', description: `Distributed tracing for ${noTraces} services. Shows full request paths.`, path: '/gaps' }] : []),
    { icon: ChartBar, title: 'Create a dashboard', description: 'Production overview with health, errors, latency, throughput.', path: '/gaps' },
    { icon: WaveTriangle, title: 'Enable anomaly detection', description: 'ML-based baseline detection on key metrics.', path: '/gaps' },
  ]

  return {
    steps: [
      { id: 'welcome', icon: Robot, title: 'Welcome', agentMessage: `I found ${total} services across ${persona.applications.length} applications. Let me walk you through the essentials.`, detail: persona.applications.map(a => `• ${a.name} — ${a.services.length} services`).join('\n') },
      ...(needsAgent ? [{
        id: 'cw-agent', icon: Cpu, title: 'Install CloudWatch Agent',
        agentMessage: `${computeServices.length} compute services need the CW Agent. It collects enhanced metrics (memory, disk, network) and provides custom metrics endpoints.${hasEks ? ' For EKS, the Observability Add-on bundles the agent with additional capabilities.' : ''}`,
      }] : []),
      ...(noAlarms > 0 ? [{ id: 'alarms', icon: Bell, title: 'Set up alarms', agentMessage: `${noAlarms} services have no alarms. Select which alarms you want — I've pre-selected the recommended ones.` }] : []),
      ...(noLogs > 0 ? [{ id: 'logs', icon: FileText, title: 'Enable logging', agentMessage: `${noLogs} services need log delivery. Select which to enable.` }] : []),
      { id: 'done', icon: CheckCircle, title: 'Essentials complete', agentMessage: 'Your data is flowing — alarms and logs are active. I can generate a production dashboard based on what you just set up. Here are recommended next steps to deepen your observability.' },
    ],
    nextSteps,
  }
}

// ─── Right Sidebar ────────────────────────────────────────────────
function RightSidebar({ stepItems, selections, deployedSteps, cost }) {
  const categories = [
    { id: 'cw-agent', icon: Cpu, label: 'CW Agent', color: 'text-cyan-400' },
    { id: 'alarms', icon: Bell, label: 'Alarms', color: 'text-red-400' },
    { id: 'logs', icon: FileText, label: 'Logs', color: 'text-green-400' },
  ]

  const rows = categories.map(cat => {
    const items = stepItems[cat.id] || []
    if (items.length === 0) return null
    const deployed = deployedSteps.has(cat.id)
    const deployedCount = deployed ? items.filter(i => selections.has(i.id)).length : 0
    return { ...cat, total: items.length, deployedCount, deployed }
  }).filter(Boolean)

  const totalDeployed = rows.reduce((s, r) => s + r.deployedCount, 0)
  const totalRecommended = rows.reduce((s, r) => s + r.total, 0)
  const deployedCost = Object.entries(stepItems).flatMap(([stepId, items]) => deployedSteps.has(stepId) ? items.filter(i => selections.has(i.id)) : []).reduce((s, i) => s + (i.cost || 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-4">
        <h3 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3">Deployed</h3>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-heading-m font-semibold text-foreground">{totalDeployed}</span>
          <span className="text-body-s text-foreground-muted">/ {totalRecommended} recommended</span>
        </div>
        <div className="flex flex-col gap-2">
          {rows.map(r => {
            const Icon = r.icon
            return (
              <div key={r.id} className="flex items-center gap-2.5">
                <Icon size={12} className={r.deployed ? 'text-status-active' : r.color} />
                <span className="text-[11px] flex-1 text-foreground">{r.label}</span>
                <span className={`text-[11px] font-medium ${r.deployed ? 'text-status-active' : 'text-foreground-disabled'}`}>
                  {r.deployed ? `${r.deployedCount} ✓` : `0 / ${r.total}`}
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
          <span className="text-[10px] text-foreground-muted">After deployment</span>
          <span className="text-body-s font-semibold text-foreground">${(cost.current.total + deployedCost).toFixed(0)}/mo</span>
        </div>
        {deployedCost > 0 && <p className="text-[9px] text-foreground-disabled mt-1">+${deployedCost.toFixed(2)}/mo for {totalDeployed} resources</p>}
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
  const { steps, nextSteps } = buildSteps(persona)
  const stepItems = buildStepItems(persona)
  const allServices = persona.applications.flatMap(a => a.services)
  const [currentStep, setCurrentStep] = useState(0)
  const [deployedSteps, setDeployedSteps] = useState(new Set())
  const [deploying, setDeploying] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [drawerInvestigation, setDrawerInvestigation] = useState(null)
  const [agentInput, setAgentInput] = useState('')
  const [showCustomize, setShowCustomize] = useState(false)
  const [editingAlarm, setEditingAlarm] = useState(null)
  const [editingLog, setEditingLog] = useState(null)
  const [alarmFilter, setAlarmFilter] = useState({ critical: true, warning: true })
  const [alarmServiceFilter, setAlarmServiceFilter] = useState('all')
  const [expandedServices, setExpandedServices] = useState(new Set())
  const [logServiceFilter, setLogServiceFilter] = useState('all')
  const [capabilities, setCapabilities] = useState({
    'container-insights': true, 'app-signals': true, 'fluent-bit': true, 'prometheus': true,
    'ecs-metrics': true, 'ecs-app-signals': true, 'ecs-container-insights': true,
  })
  const toggleCap = (id) => setCapabilities(prev => ({ ...prev, [id]: !prev[id] }))
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
      // Auto-advance to next step after a brief pause to show success
      setTimeout(() => {
        setCurrentStep(prev => {
          const maxStep = steps.length - 1
          return prev < maxStep ? prev + 1 : prev
        })
      }, 800)
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
              <button onClick={() => setCurrentStep(i)} className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? 'bg-status-active/20 text-status-active' : isActive ? 'bg-primary/20 text-primary' : 'bg-background-surface-1 text-foreground-disabled'}`}>
                  {isDone ? <CheckCircle size={12} weight="fill" /> : <Icon size={11} />}
                </div>
                <span className={`text-[10px] whitespace-nowrap transition-colors ${isActive ? 'text-primary font-medium' : isDone ? 'text-status-active' : 'text-foreground-disabled'}`}>{s.title}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-6 h-0.5 flex-shrink-0 transition-colors ${isDone ? 'bg-status-active/40' : 'bg-border-muted/30'}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div ref={contentRef} key={step.id} style={{ animation: 'fadeIn 0.25s ease-out' }}>
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

            const openHelp = (title, messages, followUps) => {
              setDrawerInvestigation({ title, subtitle: 'CloudWatch Agent', messages, followUps })
            }

            const capHelp = {
              'container-insights': () => openHelp('Container Insights (Enhanced)', [
                { type: 'text', content: 'Enhanced Container Insights collects granular metrics at the cluster, node, pod, and container level — including CPU, memory, network, disk, and filesystem usage.' },
                { type: 'finding', severity: 'info', title: 'Auto-detects accelerators', content: 'Automatically discovers NVIDIA GPUs, AWS Trainium, Inferentia, and Elastic Fabric Adapters. GPU metrics appear in dashboards without extra configuration.' },
                { type: 'text', content: 'Enhanced mode is billed per observation rather than per metric stored. This is typically more cost-effective for large clusters.' },
              ], ['What metrics are collected?', 'How does pricing work?', 'Can I use basic mode instead?']),
              'app-signals': () => openHelp('Application Signals', [
                { type: 'text', content: 'Application Signals auto-instruments your applications using OpenTelemetry. It generates a real-time service map, tracks latency per operation, and enables SLO creation.' },
                { type: 'finding', severity: 'info', title: 'Supported languages', content: 'Java, Python, Node.js, and .NET are auto-instrumented. No code changes needed — the agent injects instrumentation at runtime.' },
                { type: 'text', content: 'For EKS, instrumentation is per-namespace. For ECS, it requires an ADOT SDK init container per task definition.' },
              ], ['Which namespaces should I instrument?', 'Does this add latency?', 'How do I create SLOs from this?']),
              'fluent-bit': () => openHelp('Fluent Bit Log Collection', [
                { type: 'text', content: 'Fluent Bit runs as a DaemonSet and collects pod logs from all namespaces by default. Logs are shipped to CloudWatch Logs with automatic log group creation.' },
                { type: 'finding', severity: 'info', title: 'Log class selection', content: 'Standard class for active debugging ($0.50/GB). Infrequent Access for audit/compliance logs ($0.25/GB). You can configure per-namespace.' },
              ], ['Which log class should I use?', 'Can I exclude certain namespaces?', 'How much will logs cost?']),
              'prometheus': () => openHelp('Prometheus Metric Scraping', [
                { type: 'text', content: 'The agent auto-discovers Prometheus exporters from common workloads: NGINX, Java/JMX, App Mesh, Memcached, HAProxy.' },
                { type: 'finding', severity: 'info', title: 'Custom metrics', content: 'For your own application metrics, add the annotation prometheus.io/scrape: "true" to your pod spec. The agent will discover and scrape them automatically.' },
              ], ['How do I expose custom Prometheus metrics?', 'What workloads are auto-discovered?', 'How are Prometheus metrics priced?']),
              'ecs-metrics': () => openHelp('ECS Enhanced Metrics', [
                { type: 'text', content: 'The CW Agent sidecar collects memory utilization, disk usage, and network metrics that ECS doesn\'t publish by default. It also exposes StatsD and EMF endpoints for custom application metrics.' },
                { type: 'finding', severity: 'info', title: 'StatsD & EMF', content: 'Your application can push custom metrics to the agent via StatsD (UDP port 8125) or Embedded Metric Format (TCP port 25888). These appear as CloudWatch custom metrics.' },
              ], ['What metrics does the sidecar collect?', 'How do I send custom metrics?', 'What\'s the memory overhead?']),
              'ecs-app-signals': () => openHelp('Application Signals on ECS', [
                { type: 'text', content: 'Unlike EKS where it\'s automatic, Application Signals on ECS requires manual setup: an ADOT SDK init container is added to each task definition, along with environment variables for service name and cluster.' },
                { type: 'finding', severity: 'warning', title: 'Task definition changes required', content: 'I\'ll generate the updated task definitions with the init container and environment variables. You review and deploy through your IaC pipeline.' },
                { type: 'text', content: 'Once deployed, you get the same capabilities as EKS: service map, latency breakdown, error tracking, and SLO support.' },
              ], ['Show me the task definition changes', 'Can I enable it for just one service first?', 'Does the init container add startup latency?']),
              'ecs-container-insights': () => openHelp('Container Insights on ECS', [
                { type: 'text', content: 'Container Insights for ECS is enabled at the cluster level — it\'s a separate setting from the CW Agent sidecar. Once enabled, it collects task and service-level metrics.' },
                { type: 'finding', severity: 'info', title: 'No restarts needed', content: 'Enabling Container Insights is a cluster configuration change. It takes effect immediately without restarting any tasks.' },
              ], ['What metrics does it collect?', 'Is it the same as EKS Container Insights?', 'How much does it cost?']),
              'ecs-logs': () => openHelp('ECS Log Configuration', [
                { type: 'text', content: 'ECS logs use the awslogs log driver configured in the task definition — this is separate from the CW Agent. Each container in the task definition specifies its log group and stream prefix.' },
                { type: 'finding', severity: 'info', title: 'Configured in the logging step', content: 'I\'ll set up the awslogs log driver when we get to the logging step. The CW Agent sidecar handles metrics, not logs.' },
              ], ['Why are logs separate from the agent?', 'Can I use the agent for logs instead?']),
            }

            return (
            <div className="ml-14 mb-4">
              {/* What the agent collects */}
              <div className="glass-card p-4 mb-4">
                <p className="text-[9px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3">What the agent collects</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-cyan-400/5 border border-cyan-400/20 p-3 hover:border-cyan-400/40 cursor-pointer transition-colors" onClick={() => setDrawerInvestigation({ title: 'Memory & Disk Metrics', subtitle: 'CloudWatch Agent', messages: [{ type: 'text', content: 'Without the agent, ECS/EKS only reports CPU utilization. The agent adds memory utilization, disk usage, and disk I/O — critical for detecting OOM kills and disk pressure before they cause outages.' }, { type: 'finding', severity: 'info', title: 'Key metrics', content: 'mem_used_percent, mem_available_percent, disk_used_percent, disk_io_read_bytes, disk_io_write_bytes' }], followUps: ['What happens without memory metrics?', 'Can I set alarms on these?'] })}>
                    <p className="text-[10px] text-cyan-400 font-medium mb-1">Memory & Disk</p>
                    <p className="text-[9px] text-foreground-muted">MemoryUtilization, DiskUsage, DiskIO — not available without the agent</p>
                    <p className="text-[9px] text-primary mt-1.5">Learn more →</p>
                  </div>
                  <div className="rounded-lg bg-cyan-400/5 border border-cyan-400/20 p-3 hover:border-cyan-400/40 cursor-pointer transition-colors" onClick={() => setDrawerInvestigation({ title: 'Network Metrics', subtitle: 'CloudWatch Agent', messages: [{ type: 'text', content: 'The agent collects TCP connections, packets sent/received, and bytes in/out per container. This helps detect network saturation, connection leaks, and connectivity issues.' }, { type: 'finding', severity: 'info', title: 'Key metrics', content: 'bytes_sent, bytes_recv, packets_sent, packets_recv, tcp_established, tcp_time_wait' }], followUps: ['When would I need network metrics?', 'Can I detect connection leaks?'] })}>
                    <p className="text-[10px] text-cyan-400 font-medium mb-1">Network</p>
                    <p className="text-[9px] text-foreground-muted">TCP connections, packets, bytes — per-container granularity</p>
                    <p className="text-[9px] text-primary mt-1.5">Learn more →</p>
                  </div>
                  <div className="rounded-lg bg-cyan-400/5 border border-cyan-400/20 p-3 hover:border-cyan-400/40 cursor-pointer transition-colors" onClick={() => setDrawerInvestigation({ title: 'Custom Metrics', subtitle: 'CloudWatch Agent', messages: [{ type: 'text', content: 'The agent exposes two endpoints for your application to push custom metrics: StatsD (UDP 8125) for simple counters/gauges/timers, and Embedded Metric Format (TCP 25888) for structured metrics with dimensions.' }, { type: 'finding', severity: 'info', title: 'How to use', content: 'Your app sends metrics to localhost:8125 (StatsD) or localhost:25888 (EMF). The agent aggregates and publishes them to CloudWatch as custom metrics.' }], followUps: ['Show me a StatsD example', 'What\'s EMF?', 'How much do custom metrics cost?'] })}>
                    <p className="text-[10px] text-cyan-400 font-medium mb-1">Custom Metrics</p>
                    <p className="text-[9px] text-foreground-muted">StatsD (UDP 8125) and EMF (TCP 25888) endpoints for your app metrics</p>
                    <p className="text-[9px] text-primary mt-1.5">Learn more →</p>
                  </div>
                </div>
              </div>

              {/* EKS section */}
              {hasEks && (
                <div className="glass-card p-4 mb-3 border-l-2 border-l-cyan-400/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[11px] font-medium text-foreground">EKS — CloudWatch Observability Add-on</p>
                      <p className="text-[9px] text-foreground-muted">Installs the CW Agent as a DaemonSet. Also bundles Container Insights, App Signals, and Fluent Bit — configured in their own steps.</p>
                    </div>
                    <span className="text-[9px] text-foreground-disabled">{eksServices.length} cluster{eksServices.length > 1 ? 's' : ''} · ~3 min each</span>
                  </div>

                  <div className="rounded-lg bg-background/40 border border-border-muted/20 p-2.5 mb-3 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => setDrawerInvestigation({ title: 'CW Agent on EKS', subtitle: 'CloudWatch Observability Add-on', messages: [{ type: 'text', content: 'The Observability Add-on installs the CW Agent as a DaemonSet on every node. It collects memory, disk, and network metrics per pod and container — metrics that EKS doesn\'t publish by default.' }, { type: 'finding', severity: 'info', title: 'Prometheus auto-discovery', content: 'The agent auto-discovers Prometheus exporters from common workloads (NGINX, Java/JMX, App Mesh). For custom app metrics, add the prometheus.io/scrape annotation to your pods.' }, { type: 'finding', severity: 'info', title: 'Custom metrics endpoints', content: 'StatsD (UDP 8125) and EMF (TCP 25888) endpoints are available on each node for your applications to push custom metrics.' }, { type: 'text', content: 'The add-on also bundles Container Insights, Application Signals, and Fluent Bit — those are configured in their own steps after the essentials.' }], followUps: ['What metrics does the agent collect?', 'How does Prometheus auto-discovery work?', 'What\'s the memory overhead per node?', 'Can I customize the collection interval?'] })}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[9px] text-foreground-disabled">What the agent collects on EKS:</p>
                    </div>
                    <p className="text-[9px] text-foreground-muted">Memory, disk, network per pod/container. Prometheus auto-discovery. StatsD/EMF custom metrics endpoint.</p>
                    <p className="text-[9px] text-primary mt-1.5">Learn more →</p>
                  </div>

                  <p className="text-[9px] text-foreground-disabled uppercase tracking-wider font-semibold mb-1.5">Select clusters</p>
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
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[11px] font-medium text-foreground">ECS — Sidecar per service</p>
                      <p className="text-[9px] text-foreground-muted">CW Agent sidecar added to each task definition. Collects enhanced metrics and provides custom metrics endpoint.</p>
                    </div>
                    <span className="text-[9px] text-foreground-disabled">{ecsServices.length} service{ecsServices.length > 1 ? 's' : ''} · ~5 min total</span>
                  </div>

                  <div className="rounded-lg bg-background/40 border border-border-muted/20 p-2.5 mb-3 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => setDrawerInvestigation({ title: 'CW Agent on ECS', subtitle: 'Sidecar deployment', messages: [{ type: 'text', content: 'The CW Agent runs as a sidecar container in each task definition. It collects memory, disk, and network metrics per container — metrics that ECS Fargate doesn\'t publish by default.' }, { type: 'finding', severity: 'info', title: 'Custom metrics endpoints', content: 'Your application can push custom metrics to the agent via StatsD (UDP 8125) or Embedded Metric Format (TCP 25888). These appear as CloudWatch custom metrics with your chosen dimensions.' }, { type: 'finding', severity: 'info', title: 'Application Signals receiver', content: 'The agent also acts as the OTLP receiver for Application Signals. When you enable App Signals later, the ADOT init container sends traces and metrics to the agent sidecar.' }, { type: 'text', content: 'The sidecar adds ~50-100MB memory overhead per task. Rolling restart deploys one task at a time — zero downtime.' }], followUps: ['What\'s the memory overhead?', 'How do I send custom metrics from my app?', 'Can I use the daemon strategy instead?', 'Will this affect my task CPU limits?'] })}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[9px] text-foreground-disabled">What the agent collects on ECS:</p>
                    </div>
                    <p className="text-[9px] text-foreground-muted">Memory, disk, network per container. StatsD/EMF endpoints for custom metrics. Also acts as the receiver for Application Signals.</p>
                    <p className="text-[9px] text-primary mt-1.5">Learn more →</p>
                  </div>

                  <p className="text-[9px] text-foreground-disabled uppercase tracking-wider font-semibold mb-1.5">Select services</p>
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

              {/* Config preview */}
              <button onClick={() => setShowCustomize(!showCustomize)} className="flex items-center gap-1.5 text-[9px] text-primary hover:text-primary-hover mb-3">
                <CaretRight size={10} className={`transition-transform ${showCustomize ? 'rotate-90' : ''}`} />
                Configuration preview
              </button>
              {showCustomize && (
                <div className="rounded-lg bg-background/40 border border-border-muted/20 p-3 mb-3 overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] text-foreground-disabled">amazon-cloudwatch-agent.json</p>
                    <span className="text-[8px] text-foreground-disabled">Customizable after deployment</span>
                  </div>
                  <pre className="text-[9px] text-foreground-muted leading-relaxed">{JSON.stringify({
                    metrics: {
                      namespace: "CWAgent",
                      metrics_collected: {
                        mem: { measurement: ["mem_used_percent", "mem_available_percent"] },
                        disk: { measurement: ["disk_used_percent"], resources: ["*"] },
                        net: { measurement: ["bytes_sent", "bytes_recv", "packets_sent", "packets_recv"] },
                        statsd: { service_address: ":8125", metrics_collection_interval: 60 },
                      },
                      append_dimensions: { "ClusterName": "${ECS_CLUSTER}", "ServiceName": "${ECS_SERVICE}" },
                      aggregation_dimensions: [["ClusterName", "ServiceName"]],
                    },
                    logs: {
                      metrics_collected: {
                        emf: { service_address: "tcp://0.0.0.0:25888" }
                      }
                    }
                  }, null, 2)}</pre>
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

          {/* Alarm step — collapsible grouped content with filter */}
          {step.id === 'alarms' && (() => {
            const alarmItems = currentItems
            const selectedCount = alarmItems.filter(i => selections.has(i.id)).length

            // Unique service types for dropdown
            const serviceTypes = [...new Set(alarmItems.map(i => i.serviceType))]

            // Service-filtered subset (before severity filter)
            const serviceFiltered = alarmServiceFilter === 'all' ? alarmItems : alarmItems.filter(i => i.serviceType === alarmServiceFilter)
            const criticalCount = serviceFiltered.filter(i => i.severity === 'critical').length
            const warningCount = serviceFiltered.filter(i => i.severity === 'warning').length

            const filtered = serviceFiltered.filter(i => alarmFilter[i.severity])

            const filteredSelectedCount = filtered.filter(i => selections.has(i.id)).length
            const toggleFiltered = () => {
              const allFilteredSelected = filtered.every(i => selections.has(i.id))
              setSelections(prev => {
                const n = new Set(prev)
                filtered.forEach(i => allFilteredSelected ? n.delete(i.id) : n.add(i.id))
                return n
              })
            }

            // Group by service
            const byService = {}
            filtered.forEach(item => {
              if (!byService[item.service]) byService[item.service] = { type: item.serviceType, items: [] }
              byService[item.service].items.push(item)
            })
            const serviceEntries = Object.entries(byService)

            // Auto-expand critical services on first render
            const isCriticalService = (type) => {
              const sev = serviceSeverity[type] || 'medium'
              return sev === 'critical' || sev === 'high'
            }

            const toggleExpand = (name) => {
              setExpandedServices(prev => {
                const n = new Set(prev)
                n.has(name) ? n.delete(name) : n.add(name)
                return n
              })
            }

            // On first visit, auto-expand all services
            if (expandedServices.size === 0 && serviceEntries.length > 0) {
              const autoExpand = new Set(serviceEntries.map(([name]) => name))
              setTimeout(() => setExpandedServices(autoExpand), 0)
            }

            const openAlarmHelp = (item) => {
              setDrawerInvestigation({
                title: `Why: ${item.shortName}`,
                subtitle: `${item.service} · ${item.serviceType}`,
                messages: [
                  { type: 'text', content: item.reason },
                  { type: 'finding', severity: item.severity === 'critical' ? 'error' : 'warning', title: `${item.metric} ${item.config.comparison === 'GreaterThanThreshold' ? '>' : '<'} ${item.threshold}`, content: `Evaluated every ${item.config.period / 60} min over ${item.config.evalPeriods} datapoint${item.config.evalPeriods > 1 ? 's' : ''}. Missing data treated as ${item.config.missingData}.` },
                  { type: 'text', content: item.severity === 'critical' ? 'This is a critical alarm — it detects conditions that can cause outages or data loss. Strongly recommended.' : 'This is a warning-level alarm — it catches degradation before it becomes critical. Recommended for production.' },
                ],
                followUps: ['What happens if I skip this alarm?', 'Can I adjust the threshold?', 'Show me the CloudFormation template'],
              })
            }

            return (
              <div className="ml-14 mb-4">
                {/* Summary + filter */}
                <div className="glass-card p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] text-foreground-disabled uppercase tracking-wider font-semibold">Recommended alarms</p>
                    <span className="text-[10px] text-foreground-muted">{selectedCount} of {alarmItems.length} selected</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <select value={alarmServiceFilter} onChange={(e) => setAlarmServiceFilter(e.target.value)} className="h-7 rounded-lg bg-background-surface-1 border border-border-muted px-2 text-[10px] text-foreground focus:outline-none focus:border-primary/40">
                      <option value="all">All services</option>
                      {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="w-px h-4 bg-border-muted/30" />
                    <button onClick={() => setAlarmFilter(prev => ({ ...prev, critical: !prev.critical }))} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] transition-colors ${alarmFilter.critical ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 'bg-background-surface-1 text-foreground-disabled border border-border-muted hover:border-foreground-muted/30 line-through'}`}>
                      <ShieldWarning size={11} /> Critical ({criticalCount})
                    </button>
                    <button onClick={() => setAlarmFilter(prev => ({ ...prev, warning: !prev.warning }))} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] transition-colors ${alarmFilter.warning ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-background-surface-1 text-foreground-disabled border border-border-muted hover:border-foreground-muted/30 line-through'}`}>
                      <Warning size={11} /> Warning ({warningCount})
                    </button>
                    {!isDeployed && (
                      <button onClick={toggleFiltered} className="ml-auto text-[9px] text-primary hover:text-primary-hover">
                        {filteredSelectedCount === filtered.length ? 'Deselect all' : 'Select all'}
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-foreground-disabled">
                    {serviceEntries.length} service{serviceEntries.length !== 1 ? 's' : ''} shown
                  </p>
                  {deployedSteps.has('cw-agent') && (
                    <p className="text-[9px] text-status-active mt-2">✓ CW Agent deployed — additional memory and disk alarms available in Gap Analysis</p>
                  )}
                  {!deployedSteps.has('cw-agent') && steps.some(s => s.id === 'cw-agent') && (
                    <p className="text-[9px] text-foreground-disabled mt-2">After the CW Agent is active, additional alarms for memory, disk, and network will be available in Gap Analysis.</p>
                  )}
                </div>

                {/* Grouped by service — collapsible */}
                {serviceEntries.map(([serviceName, group]) => {
                  const svcSeverity = serviceSeverity[group.type] || 'medium'
                  const borderColor = svcSeverity === 'critical' ? 'border-l-red-400/50' : svcSeverity === 'high' ? 'border-l-amber-400/50' : 'border-l-foreground-disabled/30'
                  const svcSelected = group.items.filter(i => selections.has(i.id)).length
                  const allSvcSelected = svcSelected === group.items.length
                  const svcCritical = group.items.filter(i => i.severity === 'critical').length
                  const svcWarning = group.items.filter(i => i.severity === 'warning').length
                  const isExpanded = expandedServices.has(serviceName)

                  const toggleService = (e) => {
                    e.stopPropagation()
                    setSelections(prev => {
                      const n = new Set(prev)
                      if (allSvcSelected) { group.items.forEach(i => n.delete(i.id)) } else { group.items.forEach(i => n.add(i.id)) }
                      return n
                    })
                  }

                  return (
                    <div key={serviceName} className={`glass-card mb-3 border-l-2 ${borderColor} overflow-hidden`}>
                      {/* Collapsed header — always visible */}
                      <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-primary/3 transition-colors" onClick={() => toggleExpand(serviceName)}>
                        {!isDeployed && (
                          <button onClick={toggleService} className="flex-shrink-0">
                            {allSvcSelected ? <CheckSquare size={14} weight="fill" className="text-primary" /> : <Square size={14} className="text-foreground-disabled" />}
                          </button>
                        )}
                        <CaretRight size={10} className={`text-foreground-disabled transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                        <span className="text-[11px] font-medium text-foreground">{serviceName}</span>
                        <span className="text-[9px] text-foreground-disabled">{group.type}</span>
                        <div className="flex items-center gap-2 ml-auto">
                          {svcCritical > 0 && <span className="flex items-center gap-0.5 text-[9px] text-red-400"><ShieldWarning size={10} />{svcCritical}</span>}
                          {svcWarning > 0 && <span className="flex items-center gap-0.5 text-[9px] text-amber-400"><Warning size={10} />{svcWarning}</span>}
                          <span className="text-[9px] text-foreground-disabled">{svcSelected}/{group.items.length}</span>
                        </div>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0">
                          <div className="flex flex-col gap-0.5 ml-7">
                            {group.items.map(item => {
                              const isSelected = selections.has(item.id)
                              const isCritical = item.severity === 'critical'
                              return (
                                <div key={item.id} className={`py-2 px-2 rounded-lg transition-colors ${isDeployed ? 'opacity-50' : 'hover:bg-primary/5'} ${isSelected ? 'bg-primary/5' : ''}`}>
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => !isDeployed && toggleItem(item.id)} className="flex-shrink-0">
                                      {isSelected ? <CheckSquare size={13} weight="fill" className={isDeployed ? 'text-status-active' : 'text-primary'} /> : <Square size={13} className="text-foreground-disabled" />}
                                    </button>
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCritical ? 'bg-red-400' : 'bg-amber-400'}`} />
                                    <span className="text-[10px] text-foreground font-medium">{item.shortName}</span>
                                    <button onClick={() => setEditingAlarm(item)} className="text-[9px] text-primary hover:text-primary-hover">Edit</button>
                                    <span className="flex-1" />
                                    <button onClick={() => openAlarmHelp(item)} className="text-[9px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5 flex-shrink-0" title="Why this alarm?"><Sparkle size={9} weight="fill" /> Why?</button>
                                    <span className="text-[9px] text-foreground-muted flex-shrink-0">${item.cost.toFixed(2)}/mo</span>
                                  </div>
                                  <p className="text-[9px] text-foreground-disabled ml-[30px] mt-0.5">{item.metric} {item.config.comparison === 'GreaterThanThreshold' ? '>' : '<'} {item.threshold} · {item.config.period / 60}min period · {item.config.evalPeriods} datapoint{item.config.evalPeriods > 1 ? 's' : ''}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Log step — rich grouped content */}
          {step.id === 'logs' && (() => {
            const logItems = currentItems
            const selectedCount = logItems.filter(i => selections.has(i.id)).length

            // Service type filter
            const logServiceTypes = [...new Set(logItems.map(i => i.serviceType))]
            const serviceFiltered = logServiceFilter === 'all' ? logItems : logItems.filter(i => i.serviceType === logServiceFilter)

            const filteredSelectedCount = serviceFiltered.filter(i => selections.has(i.id)).length
            const toggleFilteredLogs = () => {
              const allSelected = serviceFiltered.every(i => selections.has(i.id))
              setSelections(prev => {
                const n = new Set(prev)
                serviceFiltered.forEach(i => allSelected ? n.delete(i.id) : n.add(i.id))
                return n
              })
            }

            // Group by service
            const byService = {}
            serviceFiltered.forEach(item => {
              if (!byService[item.service]) byService[item.service] = { type: item.serviceType, items: [] }
              byService[item.service].items.push(item)
            })
            const serviceEntries = Object.entries(byService)

            const openLogHelp = (item) => {
              setDrawerInvestigation({
                title: item.logName,
                subtitle: `${item.service} · ${item.serviceType}`,
                messages: [
                  { type: 'text', content: item.reason },
                  { type: 'finding', severity: 'info', title: 'Log details', content: `${item.description}\n\nEstimated volume: ${item.volume}` },
                  { type: 'text', content: item.logClass === 'infrequent' ? 'Recommended log class: Infrequent Access ($0.25/GB) — best for audit/compliance logs you rarely query.' : 'Recommended log class: Standard ($0.50/GB) — best for active debugging and real-time monitoring.' },
                ],
                followUps: ['What log class should I use?', 'How much will this cost?', 'Can I set retention policies?'],
              })
            }

            return (
              <div className="ml-14 mb-4">
                {/* Summary + filter */}
                <div className="glass-card p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] text-foreground-disabled uppercase tracking-wider font-semibold">Log delivery</p>
                    <span className="text-[10px] text-foreground-muted">{selectedCount} of {logItems.length} selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={logServiceFilter} onChange={(e) => setLogServiceFilter(e.target.value)} className="h-7 rounded-lg bg-background-surface-1 border border-border-muted px-2 text-[10px] text-foreground focus:outline-none focus:border-primary/40">
                      <option value="all">All services ({logItems.length})</option>
                      {logServiceTypes.map(t => <option key={t} value={t}>{t} ({logItems.filter(i => i.serviceType === t).length})</option>)}
                    </select>
                    {!isDeployed && (
                      <button onClick={toggleFilteredLogs} className="ml-auto text-[9px] text-primary hover:text-primary-hover">
                        {filteredSelectedCount === serviceFiltered.length ? 'Deselect all' : 'Select all'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Grouped by service */}
                {serviceEntries.map(([serviceName, group]) => {
                  const svcSelected = group.items.filter(i => selections.has(i.id)).length
                  const allSvcSelected = svcSelected === group.items.length
                  const toggleService = (e) => {
                    e.stopPropagation()
                    setSelections(prev => {
                      const n = new Set(prev)
                      if (allSvcSelected) { group.items.forEach(i => n.delete(i.id)) } else { group.items.forEach(i => n.add(i.id)) }
                      return n
                    })
                  }

                  return (
                    <div key={serviceName} className="glass-card p-4 mb-3 border-l-2 border-l-green-400/50">
                      <div className="flex items-center gap-2 mb-2">
                        {!isDeployed && (
                          <button onClick={toggleService} className="flex-shrink-0">
                            {allSvcSelected ? <CheckSquare size={14} weight="fill" className="text-primary" /> : <Square size={14} className="text-foreground-disabled" />}
                          </button>
                        )}
                        <span className="text-[11px] font-medium text-foreground">{serviceName}</span>
                        <span className="text-[9px] text-foreground-disabled">{group.type}</span>
                        <span className="text-[9px] text-foreground-disabled ml-auto">{svcSelected}/{group.items.length}</span>
                      </div>

                      <div className="flex flex-col gap-0.5 ml-5">
                        {group.items.map(item => {
                          const isSelected = selections.has(item.id)
                          return (
                            <div key={item.id} className={`py-2 px-2 rounded-lg transition-colors ${isDeployed ? 'opacity-50' : 'hover:bg-primary/5'} ${isSelected ? 'bg-primary/5' : ''}`}>
                              <div className="flex items-center gap-2">
                                <button onClick={() => !isDeployed && toggleItem(item.id)} className="flex-shrink-0">
                                  {isSelected ? <CheckSquare size={13} weight="fill" className={isDeployed ? 'text-status-active' : 'text-primary'} /> : <Square size={13} className="text-foreground-disabled" />}
                                </button>
                                <FileText size={11} className="text-green-400 flex-shrink-0" />
                                <span className="text-[10px] text-foreground font-medium">{item.logName}</span>
                                <button onClick={() => setEditingLog(item)} className="text-[9px] text-primary hover:text-primary-hover">Edit</button>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${item.logClass === 'infrequent' ? 'bg-amber-400/10 text-amber-400' : 'bg-green-400/10 text-green-400'}`}>
                                  {item.logClass === 'infrequent' ? 'IA' : 'Standard'}
                                </span>
                                <span className="flex-1" />
                                <button onClick={() => openLogHelp(item)} className="text-[9px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5 flex-shrink-0"><Sparkle size={9} weight="fill" /> Why?</button>
                                <span className="text-[9px] text-foreground-muted flex-shrink-0">${item.cost.toFixed(2)}/mo</span>
                              </div>
                              <p className="text-[9px] text-foreground-disabled ml-[30px] mt-0.5">{item.description} · Est. {item.volume}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Selectable items (not for welcome, cw-agent, alarms, or logs which have custom content) */}
          {hasItems && step.id !== 'cw-agent' && step.id !== 'alarms' && step.id !== 'logs' && (
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
              <div className="mb-4">
                {/* Dashboard generation CTA */}
                <div className="ai-glass-card p-4 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Sparkle size={14} weight="fill" className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-foreground mb-1">Generate a production dashboard?</p>
                      <p className="text-[9px] text-foreground-muted mb-3">Based on your setup, I can create a dashboard with health overview, error rates, latency, and throughput for all your services.</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDrawerInvestigation({ title: 'Dashboard Generation', subtitle: 'Based on your setup', messages: [{ type: 'text', content: 'I\'ll create a CloudWatch dashboard with widgets for each application you set up. It includes health status, error rates, latency percentiles, throughput, and alarm status — all based on the alarms and logs you just configured.' }, { type: 'finding', severity: 'info', title: 'What\'s included', content: 'Per-application sections with: service health grid, error rate charts, latency p50/p90/p99, throughput over time, active alarm summary, and log error counts.' }], followUps: ['Show me a preview', 'Can I customize the layout?', 'How much does a dashboard cost?'] })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[10px] font-medium transition-colors">
                          <ChartBar size={12} /> Generate dashboard
                        </button>
                        <button onClick={() => setShowExport(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-surface-1 border border-border-muted text-[10px] text-foreground hover:bg-background-surface-2 transition-colors">
                          <Code size={12} /> Export as code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended next steps */}
                <p className="text-[9px] text-foreground-disabled uppercase tracking-wider font-semibold mb-3">Recommended next steps</p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {nextSteps.map((ns, i) => {
                    const Icon = ns.icon
                    return (
                      <button key={i} onClick={() => navigate(ns.path)} className="glass-card p-3 text-left hover:border-primary/30 transition-all group">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={12} className="text-primary" />
                          <span className="text-[10px] font-medium text-foreground">{ns.title}</span>
                        </div>
                        <p className="text-[9px] text-foreground-muted">{ns.description}</p>
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => navigate('/day0')} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium transition-colors">
                  Back to home <ArrowRight size={14} />
                </button>
              </div>
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

      {editingAlarm && <AlarmConfigModal item={{ name: `${editingAlarm.service} — ${editingAlarm.shortName}`, shortName: editingAlarm.shortName, service: editingAlarm.service, config: editingAlarm.config }} onClose={() => setEditingAlarm(null)} onSave={() => setEditingAlarm(null)} />}

      {editingLog && <LogConfigModal item={{ name: editingLog.logName, service: editingLog.service }} onClose={() => setEditingLog(null)} onSave={() => setEditingLog(null)} />}
    </div>
  )
}
