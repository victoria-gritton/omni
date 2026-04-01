import { useState } from 'react'
import {
  Robot, ShieldCheck, CheckCircle, Warning, Eye, Lightning,
  Lock, ChartBar, Clock, Bell, CaretRight, CaretDown, CaretUp,
  ThumbsUp, ThumbsDown, Sparkle, Funnel, ArrowClockwise,
  Cpu, HardDrives, Database, Timer, TrendUp, Pulse,
  Gear, ListChecks, Brain, ClockCounterClockwise
} from '@phosphor-icons/react'
import { useChatPanel } from '../components/ConsoleLayout'

/* ── Agents data ── */
const agents = [
  { id: 'payment-01', name: 'Payment-Agent-01', service: 'PaymentService', infra: 'ECS', status: 'active', monitoring: ['Memory', 'Latency', 'Error rate', 'Transaction volume'], autoActions: 4, approvalActions: 3, readOnly: 3, rulesActive: 3,
    metrics: { memory: '680 MB / 800 MB', latency: '42ms p99', errorRate: '0.3%', tps: '340 TPS' },
    patterns: ['Payment latency spikes correlate with DynamoDB throttling', 'Weekend traffic increases 35-42% consistently'],
    rules: [
      { type: 'global', rule: "Don't start batch jobs between 2-7 PM", active: true },
      { type: 'global', rule: 'Auto-scale DynamoDB during traffic spikes', active: true },
      { type: 'custom', rule: 'Flag if memory > 85% for 5 minutes', active: true },
    ],
  },
  { id: 'catalog-01', name: 'Catalog-Agent-01', service: 'ProductCatalog', infra: 'EKS', status: 'active', monitoring: ['CPU', 'Cache hit rate', 'Search latency'], autoActions: 3, approvalActions: 2, readOnly: 2, rulesActive: 2,
    metrics: { cpu: '45%', cacheHit: '92%', latency: '28ms p99' },
    patterns: ['Cache hit rate drops during deployments (expected)', 'Search latency correlates with catalog size updates'],
    rules: [
      { type: 'global', rule: "Don't start batch jobs between 2-7 PM", active: true },
      { type: 'custom', rule: 'Ignore cache drops during deployments', active: true },
    ],
  },
  { id: 'auth-01', name: 'Auth-Agent-01', service: 'UserAuth', infra: 'Lambda', status: 'active', monitoring: ['Cold starts', 'Timeout rate', 'Concurrent executions'], autoActions: 2, approvalActions: 3, readOnly: 2, rulesActive: 3,
    metrics: { coldStarts: '12/hr', timeoutRate: '0.1%', concurrency: '45/150' },
    patterns: ['Cold starts spike after deployments for ~15 minutes', 'Connection pool exhaustion precedes timeout spikes by 2 min'],
    rules: [
      { type: 'global', rule: "Don't start batch jobs between 2-7 PM", active: true },
      { type: 'global', rule: 'Auto-scale DynamoDB during traffic spikes', active: true },
      { type: 'custom', rule: 'Alert if connection pool > 80%', active: true },
    ],
  },
  { id: 'analytics-01', name: 'Analytics-Agent-01', service: 'BusinessAnalytics', infra: 'EMR', status: 'active', monitoring: ['Job duration', 'Resource utilization', 'Queue depth'], autoActions: 2, approvalActions: 2, readOnly: 3, rulesActive: 4,
    metrics: { jobDuration: '45 min avg', utilization: '62%', queueDepth: '3 jobs' },
    patterns: ['Batch jobs conflict with peak hours (2-7 PM)', 'EMR cluster startup averages 8 minutes'],
    rules: [
      { type: 'global', rule: "Don't start batch jobs between 2-7 PM", active: true },
      { type: 'custom', rule: 'Flag if job duration > 2 hours', active: true },
      { type: 'custom', rule: 'Auto-throttle if CPU > 85% for 10 min', active: true },
      { type: 'custom', rule: 'Alert if queue depth > 50 jobs', active: true },
    ],
  },
  { id: 'order-01', name: 'Order-Agent-01', service: 'OrderProcessing', infra: 'EC2', status: 'learning', monitoring: ['Queue depth', 'Processing time', 'Error rate'], autoActions: 1, approvalActions: 3, readOnly: 3, rulesActive: 2,
    metrics: { queueDepth: '12 jobs', processingTime: '2.3s avg', errorRate: '0.5%' },
    patterns: ['Friday afternoon volume 25% higher than weekday average'],
    rules: [
      { type: 'global', rule: "Don't start batch jobs between 2-7 PM", active: true },
      { type: 'custom', rule: 'In prod: require approval for > 10% fleet', active: true },
    ],
  },
]

/* ── Activity log data ── */
const activityLog = [
  { time: '3:45 PM', agent: 'Payment-Agent-01', action: 'Auto-scaled ECS tasks from 8 → 14', reason: 'Predicted 40% traffic increase based on weekend pattern', outcome: 'success', detail: 'Latency stayed under 200ms (target met)', impact: 'Prevented potential customer checkout delays' },
  { time: '2:15 PM', agent: 'Analytics-Agent-01', action: 'Delayed batch job start by 3 hours', reason: 'Detected peak customer traffic (scheduling rule triggered)', outcome: 'success', detail: 'Job completed at 7:30 PM without impacting transactions', feedback: 'confirmed' },
  { time: '11:20 AM', agent: 'Order-Agent-01', action: 'Recommended increasing EC2 instance size', reason: 'Processing time trending upward over 7 days', outcome: 'pending', detail: 'Pending Sarah\'s review', confidence: 78 },
  { time: '9:05 AM', agent: 'Catalog-Agent-01', action: 'Flagged cache hit rate drop (85% → 62%)', reason: 'Threshold rule triggered', outcome: 'false-positive', detail: 'Cache was intentionally cleared during deployment', feedback: 'dismissed' },
]

/* ── Learnings data ── */
const learnings = [
  { agent: 'Payment-Agent-01', insight: 'Payment containers need 40% memory headroom for weekend traffic', confidence: 92, incidents: 8, status: 'confirmed' },
  { agent: 'Payment-Agent-01', insight: 'DynamoDB throttling precedes payment errors by 3-5 minutes', confidence: 85, incidents: 12, status: 'confirmed' },
  { agent: 'Analytics-Agent-01', insight: 'BusinessAnalytics batch jobs conflict with peak hours (2-7 PM)', confidence: 95, incidents: 15, status: 'confirmed' },
  { agent: 'Analytics-Agent-01', insight: 'EMR cluster startup time averages 8 minutes — factor into scheduling', confidence: 88, incidents: 20, status: 'confirmed' },
  { agent: 'Order-Agent-01', insight: 'Queue depth > 30 indicates upstream API slowness, not capacity issue', confidence: 72, incidents: 5, status: 'review' },
  { agent: 'Order-Agent-01', insight: 'Friday afternoon order volume 25% higher than weekday average', confidence: 90, incidents: 0, status: 'removed' },
]

/* ── Permission data for Payment-Agent-01 ── */
const permissions = {
  autoExecute: [
    'Scale ECS containers (2-20 tasks)',
    'Adjust DynamoDB read/write capacity (within 50% of baseline)',
    'Clear Redis cache on high memory',
    'Send alerts to #payments-oncall Slack channel',
  ],
  requiresApproval: [
    'Scale beyond 20 ECS tasks (cost threshold)',
    'Modify database connection pool settings',
    'Restart services during business hours (9 AM - 6 PM)',
  ],
  readOnly: [
    'Code deployment rollbacks',
    'Database schema changes',
    'Security group modifications',
  ],
}

/* ── Behavior rules for Analytics-Agent-01 ── */
const behaviorRules = {
  timeBased: [
    { rule: "Don't start batch jobs between 2-7 PM (peak customer traffic)", active: true },
    { rule: 'Prioritize weekend analytics jobs (lower customer load)', active: true },
  ],
  threshold: [
    { rule: 'Flag if job duration > 2 hours (normal: 45 min)', active: true },
    { rule: 'Auto-throttle if EMR cluster CPU > 85% for 10 minutes', active: true },
    { rule: 'Alert if queue depth > 50 jobs (indicates backlog)', active: true },
  ],
  escalation: [
    { severity: 'Low', path: 'Slack notification to #data-eng' },
    { severity: 'Medium', path: 'PagerDuty to on-call engineer' },
    { severity: 'High', path: 'Auto-execute + notify Sarah directly' },
  ],
  contextAware: [
    { rule: 'In staging: auto-execute all actions (safe to experiment)', active: true },
    { rule: 'In prod: require approval for actions affecting > 10% of fleet', active: true },
  ],
}

const tabs = [
  { id: 'watching', label: 'Watching', icon: Eye },
  { id: 'permissions', label: 'Permissions', icon: Lock },
  { id: 'rules', label: 'Rules', icon: Gear },
  { id: 'activity', label: 'Activity', icon: ClockCounterClockwise },
  { id: 'learning', label: 'Learning', icon: Brain },
]

/* ── Fleet Overview — only actionable items ── */
function FleetOverview() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-3">
      {/* Proactive Alerts */}
      <div className="rounded-xl border border-status-blocked/20 bg-status-blocked/[0.03] p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkle size={14} className="text-primary" />
          <span className="text-body-m font-medium text-foreground">Proactive Alerts</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 rounded-lg border border-status-blocked/15 bg-status-blocked/[0.04]">
            <Warning size={12} className="text-status-blocked mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-body-m text-foreground block">PaymentService agent predicts memory spike in 45 min</span>
              <span className="text-[10px] text-foreground-muted">Based on weekend traffic pattern — 40% increase expected</span>
            </div>
            <button className="h-6 px-2 rounded-lg bg-primary/10 text-[10px] font-medium text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex-shrink-0">Auto-Scale Now</button>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-lg border border-border-muted">
            <CheckCircle size={12} className="text-status-active mt-0.5 flex-shrink-0" weight="fill" />
            <div className="flex-1">
              <span className="text-body-m text-foreground block">OrderProcessing agent prevented batch job conflict at 2:15 PM</span>
              <span className="text-[10px] text-foreground-muted">Scheduling rule triggered — job delayed to 7 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-primary" />
          <span className="text-body-m font-medium text-foreground">Pending Approvals</span>
          <span className="text-[10px] text-primary px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 ml-auto">2 waiting</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 rounded-lg border border-border-muted">
            <Lock size={12} className="text-foreground-muted mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-body-m text-foreground block">Scale PaymentService beyond 20 tasks</span>
              <span className="text-[10px] text-foreground-muted">Payment-Agent-01 · Cost threshold exceeded · 89% confidence</span>
            </div>
            <button className="h-6 px-2 rounded-lg bg-primary/10 text-[10px] font-medium text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex-shrink-0">Approve</button>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-lg border border-border-muted">
            <Lock size={12} className="text-foreground-muted mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-body-m text-foreground block">Increase EC2 instance size for OrderProcessing</span>
              <span className="text-[10px] text-foreground-muted">Order-Agent-01 · Processing time trending up · 78% confidence</span>
            </div>
            <button className="h-6 px-2 rounded-lg bg-primary/10 text-[10px] font-medium text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex-shrink-0">Approve</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Agent row (expandable) ── */
function AgentRow({ agent, expanded, onToggle, agentState, onStateChange }) {
  const stateConfig = {
    active: { dot: 'bg-status-active', label: 'Active', labelColor: 'text-status-active' },
    paused: { dot: 'bg-status-blocked', label: 'Paused', labelColor: 'text-status-blocked' },
    learning: { dot: 'bg-primary', label: 'Learning', labelColor: 'text-primary' },
    disabled: { dot: 'bg-foreground-disabled', label: 'Disabled', labelColor: 'text-foreground-disabled' },
  }
  const currentState = agentState || agent.status
  const sc = stateConfig[currentState]
  return (
    <>
      <tr className="border-b border-border-muted/50 last:border-0 hover:bg-background-surface-2/30 transition-colors whitespace-nowrap">
        <td className="px-3 py-2">
          <select
            value={currentState}
            onChange={(e) => onStateChange(agent.id, e.target.value)}
            className={`h-5 px-1.5 rounded text-[10px] font-medium bg-background-surface-2 border border-border-muted ${sc.labelColor} focus:outline-none cursor-pointer`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath d='M1.5 3L4 5.5L6.5 3' stroke='%2394a3b8' stroke-width='1.2' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', paddingRight: '16px' }}
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="learning">Learning</option>
            <option value="disabled">Disabled</option>
          </select>
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} flex-shrink-0`} />
            <span className="text-body-m text-foreground font-medium">{agent.name}</span>
          </div>
        </td>
        <td className="px-3 py-2 text-body-m text-foreground-secondary">{agent.service} ({agent.infra})</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {agent.monitoring.map(m => (
              <span key={m} className="text-body-m text-foreground-muted px-1.5 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">{m}</span>
            ))}
          </div>
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-body-m text-primary">{agent.autoActions} auto</span>
            <span className="text-body-m text-foreground-muted">{agent.approvalActions} approval</span>
            <span className="text-body-m text-foreground-disabled">{agent.readOnly} read-only</span>
          </div>
        </td>
        <td className="px-3 py-2 text-body-m text-foreground-muted">{agent.rulesActive} rules</td>
        <td className="px-3 py-2">
          <button onClick={onToggle} className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors">
            Details {expanded ? <CaretUp size={10} /> : <CaretDown size={10} />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="px-3 pb-3">
            <div className="grid grid-cols-3 gap-3 pt-2" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          <div>
            <span className="text-body-m font-bold tracking-wider uppercase text-foreground-disabled block mb-1.5">Current Metrics</span>
            <div className="space-y-1">
              {Object.entries(agent.metrics).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-body-m text-foreground-muted">{key}</span>
                  <span className="text-body-m text-foreground font-mono">{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-body-m font-bold tracking-wider uppercase text-foreground-disabled block mb-1.5">Learned Patterns</span>
            <div className="space-y-1">
              {agent.patterns.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Brain size={9} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-body-m text-foreground-secondary">{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-body-m font-bold tracking-wider uppercase text-foreground-disabled block mb-1.5">Active Rules</span>
            <div className="space-y-1">
              {agent.rules.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <div className={`w-2.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${r.active ? 'bg-status-active' : 'bg-foreground-disabled'}`} />
                  <div>
                    <span className="text-body-m text-foreground-secondary block">{r.rule}</span>
                    <span className="text-[10px] text-foreground-disabled">{r.type === 'global' ? 'Global rule' : 'Custom rule'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* ── Watching Tab ── */
function WatchingTab({ agentStates, onStateChange }) {
  const [expandedAgent, setExpandedAgent] = useState(null)
  return (
    <div>
      {/* Bulk action */}
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => agents.forEach(a => onStateChange(a.id, 'paused'))} className="h-6 px-2.5 rounded-lg text-[10px] text-foreground-secondary border border-border-muted hover:bg-background-surface-2 transition-colors">
          Pause all agents
        </button>
        <button onClick={() => agents.forEach(a => onStateChange(a.id, 'active'))} className="h-6 px-2.5 rounded-lg text-[10px] text-foreground-secondary border border-border-muted hover:bg-background-surface-2 transition-colors">
          Resume all
        </button>
      </div>
      <div className="rounded-xl border border-border-muted overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-background-surface-1/30 border-b border-border-muted text-body-m font-bold tracking-wider uppercase text-foreground-disabled whitespace-nowrap">
              <th className="text-left px-3 py-2">State</th>
              <th className="text-left px-3 py-2">Agent</th>
              <th className="text-left px-3 py-2">Service</th>
              <th className="text-left px-3 py-2">Monitoring</th>
              <th className="text-left px-3 py-2">Permissions</th>
              <th className="text-left px-3 py-2">Guardrails</th>
              <th className="text-left px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <AgentRow key={agent.id} agent={agent} expanded={expandedAgent === agent.id} onToggle={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)} agentState={agentStates[agent.id]} onStateChange={onStateChange} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Permissions — Kanban columns with drag handles ── */
function PermissionsTab({ permState, onMoveAction, selectedAgent, onSelectAgent }) {
  const columns = [
    { key: 'autoExecute', label: 'Auto-Execute', icon: CheckCircle, iconClass: 'text-primary', desc: 'No approval needed' },
    { key: 'requiresApproval', label: 'Requires Approval', icon: Lock, iconClass: 'text-foreground-muted', desc: 'Sarah must approve' },
    { key: 'readOnly', label: 'Read-Only', icon: ChartBar, iconClass: 'text-foreground-disabled', desc: 'Recommend only' },
  ]

  function handleDragStart(e, action, fromColumn) {
    e.dataTransfer.setData('action', action)
    e.dataTransfer.setData('from', fromColumn)
  }

  function handleDrop(e, toColumn) {
    e.preventDefault()
    const action = e.dataTransfer.getData('action')
    const fromColumn = e.dataTransfer.getData('from')
    if (fromColumn !== toColumn) onMoveAction(action, fromColumn, toColumn)
  }

  function handleDragOver(e) { e.preventDefault() }

  return (
    <div>
      {/* Agent selector */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-body-m text-foreground-muted">Showing permissions for:</span>
        <select
          value={selectedAgent}
          onChange={(e) => onSelectAgent(e.target.value)}
          className="h-7 px-2 rounded-lg bg-background-surface-1 border border-border-muted text-body-m text-foreground focus:outline-none cursor-pointer"
        >
          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-3 gap-3">
        {columns.map(col => {
          const Icon = col.icon
          return (
            <div
              key={col.key}
              onDrop={(e) => handleDrop(e, col.key)}
              onDragOver={handleDragOver}
              className="rounded-xl border border-border-muted p-3 min-h-[200px]"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} className={col.iconClass} weight={col.key === 'autoExecute' ? 'fill' : 'regular'} />
                <span className="text-body-m font-medium text-foreground">{col.label}</span>
                <span className="text-[10px] text-foreground-disabled ml-auto">{permState[col.key].length}</span>
              </div>
              <span className="text-[10px] text-foreground-disabled block mb-2">{col.desc}</span>
              <div className="space-y-1.5">
                {permState[col.key].map((action) => (
                  <div
                    key={action}
                    draggable
                    onDragStart={(e) => handleDragStart(e, action, col.key)}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border-muted bg-background-surface-1/30 hover:bg-background-surface-2/50 cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 flex-shrink-0 opacity-40">
                      <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-foreground-muted" /><div className="w-1 h-1 rounded-full bg-foreground-muted" /></div>
                      <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-foreground-muted" /><div className="w-1 h-1 rounded-full bg-foreground-muted" /></div>
                      <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-foreground-muted" /><div className="w-1 h-1 rounded-full bg-foreground-muted" /></div>
                    </div>
                    <span className="text-body-m text-foreground-secondary">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Rules Tab ── */
function RulesTab() {
  return (
    <div className="space-y-2">
      {/* Agent selector + context — at top */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/[0.04] border border-primary/10">
        <Sparkle size={9} className="text-primary flex-shrink-0" />
        <span className="text-body-m text-foreground-secondary whitespace-nowrap">Showing rules for</span>
        <select className="h-6 px-1.5 rounded bg-background-surface-2 border border-border-muted text-body-m text-foreground font-medium focus:outline-none cursor-pointer">
          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

        <div className="rounded-lg border border-border-muted p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock size={10} className="text-foreground-muted" />
            <span className="text-body-m font-medium text-foreground">Time-Based</span>
          </div>
          <div className="space-y-1">
            {behaviorRules.timeBased.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-1.5 rounded-full ${r.active ? 'bg-status-active' : 'bg-foreground-disabled'}`} />
                <span className="text-body-m text-foreground-secondary">{r.rule}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border-muted p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendUp size={10} className="text-foreground-muted" />
            <span className="text-body-m font-medium text-foreground">Thresholds</span>
          </div>
          <div className="space-y-1">
            {behaviorRules.threshold.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-1.5 rounded-full ${r.active ? 'bg-status-active' : 'bg-foreground-disabled'}`} />
                <span className="text-body-m text-foreground-secondary">{r.rule}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border-muted p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Bell size={10} className="text-foreground-muted" />
            <span className="text-body-m font-medium text-foreground">Escalation</span>
          </div>
          <div className="space-y-1">
            {behaviorRules.escalation.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className={`text-body-m font-medium px-1 py-0.5 rounded-full border ${r.severity === 'High' ? 'text-status-outage bg-status-outage/10 border-status-outage/20' : r.severity === 'Medium' ? 'text-status-blocked bg-status-blocked/10 border-status-blocked/20' : 'text-foreground-muted bg-background-surface-2 border-border-muted'}`}>{r.severity}</span>
                <span className="text-body-m text-foreground-secondary">{r.path}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border-muted p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkle size={10} className="text-primary" />
            <span className="text-body-m font-medium text-foreground">Context-Aware</span>
          </div>
          <div className="space-y-1">
            {behaviorRules.contextAware.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-1.5 rounded-full ${r.active ? 'bg-status-active' : 'bg-foreground-disabled'}`} />
                <span className="text-body-m text-foreground-secondary">{r.rule}</span>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}

/* ── Activity Tab ── */
function ActivityTab() {
  const outcomeStyle = {
    success: { color: 'text-status-active', label: 'Success' },
    pending: { color: 'text-status-blocked', label: 'Pending' },
    'false-positive': { color: 'text-foreground-muted', label: 'False positive' },
  }
  return (
    <div className="rounded-xl border border-border-muted overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-background-surface-1/30 border-b border-border-muted text-body-m font-bold tracking-wider uppercase text-foreground-disabled">
            <th className="text-left px-3 py-2 w-20">Time</th>
            <th className="text-left px-3 py-2 w-40">Agent</th>
            <th className="text-left px-3 py-2">Action</th>
            <th className="text-left px-3 py-2">Reason</th>
            <th className="text-left px-3 py-2 w-24">Outcome</th>
            <th className="text-left px-3 py-2 w-24">Feedback</th>
          </tr>
        </thead>
        <tbody>
          {activityLog.map((entry, i) => {
            const oc = outcomeStyle[entry.outcome]
            return (
              <tr key={i} className="border-b border-border-muted/50 last:border-0 hover:bg-background-surface-2/30 transition-colors">
                <td className="px-3 py-2 text-body-m text-foreground-muted font-mono align-top">{entry.time}</td>
                <td className="px-3 py-2 text-body-m text-primary font-medium align-top">{entry.agent}</td>
                <td className="px-3 py-2 text-body-m text-foreground align-top">{entry.action}</td>
                <td className="px-3 py-2 text-body-m text-foreground-muted align-top">{entry.reason}</td>
                <td className="px-3 py-2 align-top">
                  <span className={`text-body-m px-1.5 py-0.5 rounded-full border ${oc.color} ${oc.color.replace('text-', 'bg-')}/10 ${oc.color.replace('text-', 'border-')}/20`}>{oc.label}</span>
                </td>
                <td className="px-3 py-2 align-top">
                  {entry.feedback === 'confirmed' && (
                    <div className="flex items-center gap-1"><ThumbsUp size={10} className="text-status-active" /><span className="text-body-m text-status-active">Confirmed</span></div>
                  )}
                  {entry.feedback === 'dismissed' && (
                    <div className="flex items-center gap-1"><ThumbsDown size={10} className="text-foreground-muted" /><span className="text-body-m text-foreground-muted">Dismissed</span></div>
                  )}
                  {entry.confidence && (
                    <span className="text-body-m text-foreground-disabled">{entry.confidence}% conf.</span>
                  )}
                  {!entry.feedback && !entry.confidence && <span className="text-body-m text-foreground-disabled">—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ── Learning Tab ── */
function LearningTab() {
  const statusConfig = {
    confirmed: { icon: CheckCircle, color: 'text-status-active', label: 'Confirmed' },
    review: { icon: Clock, color: 'text-status-blocked', label: 'Under review' },
    removed: { icon: Warning, color: 'text-foreground-disabled', label: 'Removed' },
  }
  return (
    <div className="rounded-xl border border-border-muted overflow-hidden">
      {learnings.map((item, i) => {
        const sc = statusConfig[item.status]
        const Icon = sc.icon
        return (
          <div key={i} className={`flex items-start gap-3 p-3 border-b border-border-muted/50 last:border-0 ${item.status === 'removed' ? 'opacity-50' : ''}`}>
            <Brain size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-body-m text-primary font-medium">{item.agent}</span>
                <span className={`text-body-m px-1.5 py-0.5 rounded-full border ${sc.color} ${sc.color.replace('text-', 'bg-')}/10 ${sc.color.replace('text-', 'border-')}/20`}>{sc.label}</span>
              </div>
              <span className="text-body-m text-foreground block">{item.insight}</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-body-m text-foreground-muted">Confidence: {item.confidence}%</span>
                {item.incidents > 0 && <span className="text-body-m text-foreground-disabled">Learned from {item.incidents} incidents</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {item.status !== 'removed' && (
                <>
                  <button className="p-1 rounded hover:bg-background-surface-2 transition-colors"><ThumbsUp size={10} className="text-foreground-muted" /></button>
                  <button className="p-1 rounded hover:bg-background-surface-2 transition-colors"><ThumbsDown size={10} className="text-foreground-muted" /></button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Section wrapper ── */
function Section({ icon: Icon, title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-border-muted p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-0.5">
        <Icon size={14} className="text-primary" />
        <h2 className="text-heading-s font-normal text-foreground">{title}</h2>
      </div>
      <p className="text-body-m text-foreground-muted mb-3">{subtitle}</p>
      {children}
    </div>
  )
}

/* ── Main Page ── */
export default function AgentManagementPage() {
  const [agentStates, setAgentStates] = useState({})
  const [selectedAgent, setSelectedAgent] = useState('payment-01')
  const [showRulesPanel, setShowRulesPanel] = useState(false)
  const [permStates, setPermStates] = useState({
    'payment-01': { autoExecute: [...permissions.autoExecute], requiresApproval: [...permissions.requiresApproval], readOnly: [...permissions.readOnly] },
  })

  function handleStateChange(agentId, newState) {
    setAgentStates(prev => ({ ...prev, [agentId]: newState }))
  }

  function handleMoveAction(action, fromColumn, toColumn) {
    setPermStates(prev => {
      const agentPerms = prev[selectedAgent] || { autoExecute: [...permissions.autoExecute], requiresApproval: [...permissions.requiresApproval], readOnly: [...permissions.readOnly] }
      return {
        ...prev,
        [selectedAgent]: {
          ...agentPerms,
          [fromColumn]: agentPerms[fromColumn].filter(a => a !== action),
          [toColumn]: [...agentPerms[toColumn], action],
        }
      }
    })
  }

  const currentPermState = permStates[selectedAgent] || { autoExecute: [...permissions.autoExecute], requiresApproval: [...permissions.requiresApproval], readOnly: [...permissions.readOnly] }
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-6 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Robot size={20} className="text-primary" />
            <h1 className="text-[20px] font-normal text-foreground">Agent Management</h1>
            <div className="w-px h-5 bg-border-muted" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-status-active" />
              <span className="text-[11px] text-foreground-muted">Trust Score: <span className="text-foreground">87%</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Robot size={12} className="text-foreground-muted" />
              <span className="text-[11px] text-foreground-muted">5 agents · 4 active · 1 learning</span>
            </div>
          </div>
          <button onClick={() => setShowRulesPanel(true)} className="h-7 px-3 rounded-lg bg-background-surface-1 border border-border-muted text-[11px] text-foreground-secondary hover:bg-background-surface-2 transition-colors flex items-center gap-1.5">
            <Gear size={12} /> Manage Rules
          </button>
        </div>

        {/* Fleet Overview */}
        <FleetOverview />

        {/* Row 1: Watching (full width) */}
        <div className="mb-3">
          <Section icon={Eye} title="What Agents Are Watching" subtitle="Services, metrics, and patterns each agent monitors. Change agent state to pause, learn, or disable.">
            <WatchingTab agentStates={agentStates} onStateChange={handleStateChange} />
          </Section>
        </div>

        {/* Row 2: Permissions (3/4) + Learning (1/4) */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="col-span-3 space-y-3">
            <Section icon={Lock} title="Agent Permissions" subtitle="Drag actions between columns to change permission levels.">
              <PermissionsTab permState={currentPermState} onMoveAction={handleMoveAction} selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
            </Section>
            <Section icon={ClockCounterClockwise} title="Activity Log" subtitle="What agents have done recently — actions taken, outcomes, and your feedback">
              <ActivityTab />
            </Section>
          </div>
          <Section icon={Brain} title="Agent Learning" subtitle="Patterns agents have learned from past incidents — confirm, review, or remove">
            <LearningTab />
          </Section>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

      {/* Rules Panel Overlay */}
      {showRulesPanel && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowRulesPanel(false)} />
          <div className="relative w-[400px] h-full bg-background border-l border-border-muted overflow-y-auto p-5" style={{ animation: 'slideIn 0.2s ease-out' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gear size={16} className="text-primary" />
                <h2 className="text-heading-s font-normal text-foreground">Global Rules</h2>
              </div>
              <button onClick={() => setShowRulesPanel(false)} className="p-1.5 rounded-lg hover:bg-background-surface-2 transition-colors text-foreground-muted">✕</button>
            </div>
            <p className="text-body-m text-foreground-muted mb-4">These rules apply across all agents. Individual agents can have additional custom rules.</p>
            <RulesTab />
          </div>
        </div>
      )}
    </main>
  )
}
