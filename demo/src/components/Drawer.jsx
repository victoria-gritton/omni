import { useState, useEffect, useRef } from 'react'
import { X, Sparkle, PaperPlaneRight, Code, Play, CaretRight, CaretDown, CheckSquare, Square, User } from '@phosphor-icons/react'
import { LineChart, mockTimeSeries } from './Chart'
import { AlarmConfigModal } from './AlarmConfigModal'

// Mock follow-up responses keyed by question substring
const mockResponses = {
  'thresholds': [
    { type: 'text', content: 'I set thresholds based on 14 days of baseline data from your auto-collected metrics. For example, your API Gateway averages 0.2% error rate, so I set the alarm at 1% — 5× the baseline, which avoids false positives while catching real issues.' },
    { type: 'chart', label: 'API Gateway error rate baseline (14d)', base: 0.2, variance: 0.15, color: '#f87171', unit: '%', threshold: 1, thresholdLabel: 'Recommended: 1%' },
    { type: 'finding', severity: 'info', title: 'Thresholds are customizable', content: 'Click "Edit" on any alarm item to adjust the threshold, period, and evaluation settings before deploying.' },
  ],
  'critical': [
    { type: 'text', content: 'These services are critical because they directly handle customer requests or store customer data. If your API Gateway goes down, no requests reach your backend. If your database has issues, you risk data loss or corruption.' },
    { type: 'finding', severity: 'critical', title: 'Impact of no monitoring', content: 'Without alarms on these services, an outage could run for hours before anyone notices. Your customers will see errors, and you\'ll have no alert to trigger your incident response.' },
  ],
  'skip': [
    { type: 'text', content: 'If you skip these, you\'ll still have auto-collected metrics in CloudWatch — but nobody will be watching them. You\'d need to manually check dashboards to spot issues, which doesn\'t scale and doesn\'t work at 3 AM.' },
    { type: 'finding', severity: 'warning', title: 'Risk assessment', content: 'For critical services: high risk. For recommended/optional: lower risk, but you lose proactive detection of degradation patterns.' },
  ],
  'cloudformation': [
    { type: 'text', content: 'Here\'s a preview of the CloudFormation template. The full template will be generated when you click "Export as code" with your selected items.' },
    { type: 'finding', severity: 'info', title: 'Template includes', content: 'AWS::CloudWatch::Alarm resources with metric, threshold, period, evaluation periods, comparison operator, and missing data treatment. Ready to deploy via CloudFormation or integrate into your CI/CD pipeline.' },
  ],
  'prioritize': [
    { type: 'text', content: 'Start with your customer-facing entry points (API Gateway) and data stores (RDS, DynamoDB). These have the highest blast radius. Then move to compute (ECS, Lambda) — they\'re important but failures are usually more visible and recoverable.' },
    { type: 'steps', steps: [
      { action: '1. API Gateway + Database alarms', result: 'Catches outages and data issues immediately', status: 'found' },
      { action: '2. Compute service alarms (ECS, Lambda)', result: 'Catches CPU spikes, memory pressure, errors', status: 'found' },
      { action: '3. Supporting services (cache, queue)', result: 'Catches degradation before it cascades', status: 'clear' },
      { action: '4. Edge services (CDN, S3)', result: 'Nice to have, lower blast radius', status: 'clear' },
    ]},
  ],
  'logs': [
    { type: 'text', content: 'I recommend Standard class for services you actively debug (ECS, Lambda, API Gateway) and Infrequent Access for audit/compliance logs. JSON format enables structured queries in Logs Insights.' },
    { type: 'finding', severity: 'info', title: 'Cost optimization', content: 'Standard class: $0.50/GB ingestion. Infrequent Access: $0.25/GB. For most teams, a mix of both saves 30-40% without losing query capability on critical logs.' },
  ],
  'tracing': [
    { type: 'text', content: 'X-Ray tracing shows you the full request path across services. I recommend starting with 10% sampling rate and reservoir mode — this guarantees you always capture traces during low-traffic periods while keeping costs manageable.' },
    { type: 'chart', label: 'Expected trace volume at 10% sampling', base: 1200, variance: 400, color: '#8b5cf6', unit: ' traces/min' },
  ],
  'rolling-restart': [
    { type: 'text', content: 'Rolling restarts replace tasks one at a time, so there\'s always capacity serving traffic. For ECS Fargate, each task takes ~30 seconds to drain and ~60 seconds to start. With 6 services, the full rollout takes about 5 minutes.' },
    { type: 'finding', severity: 'info', title: 'Zero downtime', content: 'ECS rolling updates maintain the desired task count throughout. Your load balancer drains connections from old tasks before terminating them. No customer-visible impact.' },
  ],
  'agent-config': [
    { type: 'text', content: 'The CloudWatch Agent config is tailored per workload type. For payment-processing workloads, it collects CPU, memory, disk, network, plus custom metrics like transaction latency, queue depth, and error count.' },
    { type: 'finding', severity: 'info', title: 'Collection interval', content: 'Default: 60 seconds for standard metrics, 10 seconds for high-resolution. You can customize per-metric. High-resolution costs more but gives faster alerting.' },
    { type: 'steps', steps: [
      { action: 'web-server workload', result: 'CPU, memory, disk, network, request count, active connections', status: 'clear' },
      { action: 'payment-processing workload', result: 'CPU, memory, disk, network, transaction latency, queue depth, error count', status: 'clear' },
      { action: 'analytics workload', result: 'CPU, memory, disk I/O, query duration, shuffle bytes', status: 'clear' },
    ]},
  ],
  'dashboard-widgets': [
    { type: 'text', content: 'The overview dashboard will include widgets for service health status, active alarm count, error rate trends, latency percentiles, and throughput. Each widget auto-refreshes and links to detailed views.' },
    { type: 'steps', steps: [
      { action: 'Top row: Health summary', result: 'Service status grid, alarm count, overall health indicator', status: 'clear' },
      { action: 'Middle: Key metrics', result: 'Error rate trend, latency p50/p95/p99, request throughput', status: 'clear' },
      { action: 'Bottom: Per-service breakdown', result: 'CPU/memory per service, database connections, cache hit ratio', status: 'clear' },
    ]},
    { type: 'finding', severity: 'info', title: 'Fully customizable', content: 'You can rearrange widgets, add custom metrics, and change time ranges after creation. The layout is saved per-user.' },
  ],
  'error-logs': [
    { type: 'text', content: 'Here are the most recent error patterns from your services:' },
    { type: 'steps', steps: [
      { action: 'ConnectionTimeout — upstream dependency', result: '12 occurrences in the last hour. External payment provider responding slowly.', status: 'found' },
      { action: 'ValidationError — malformed request', result: '5 occurrences. Missing required field in partner API requests.', status: 'found' },
      { action: 'OutOfMemoryError — container killed', result: '2 occurrences. ECS task hit memory limit and was OOM-killed.', status: 'found' },
    ]},
    { type: 'finding', severity: 'warning', title: 'Top issue: ConnectionTimeout', content: 'The upstream payment provider is responding slowly, causing cascading timeouts. Consider adding a circuit breaker or increasing timeout thresholds.' },
  ],
  'spike-analysis': [
    { type: 'text', content: 'I analyzed the spike and correlated it with other signals:' },
    { type: 'chart', label: 'Latency spike detail (3:30-4:00 AM)', base: 180, variance: 150, color: '#8b5cf6', unit: 'ms', threshold: 500, thresholdLabel: 'SLA 500ms' },
    { type: 'steps', steps: [
      { action: 'Checked database connections at 3:42 AM', result: 'Connection pool hit 95% capacity — queries queued', status: 'found' },
      { action: 'Checked batch job schedule', result: 'Nightly analytics batch job runs at 3:30 AM — causes DB contention', status: 'found' },
      { action: 'Checked recovery', result: 'Batch job completed at 3:55 AM, latency returned to normal', status: 'clear' },
    ]},
    { type: 'finding', severity: 'info', title: 'Root cause: batch job contention', content: 'The nightly analytics batch job saturates the database connection pool. Consider running it against a read replica or scheduling it during lower-traffic hours.' },
  ],
  'slo-setup': [
    { type: 'text', content: 'I can create SLOs using Application Signals. You\'ll need to define a target (e.g., 99.9% availability) and a measurement window (e.g., 30-day rolling). I\'ll set up burn-rate alerting so you know when you\'re consuming error budget too fast.' },
    { type: 'finding', severity: 'info', title: 'Recommended SLO structure', content: 'Availability SLO: 99.9% over 30 days. Latency SLO: p99 < 500ms. Burn-rate alerts at 2× (slow burn) and 10× (fast burn) thresholds.' },
  ],
  'anomaly-detection': [
    { type: 'text', content: 'Anomaly detection uses machine learning to establish a baseline from your historical metrics. It creates a band of expected values and alerts when the metric goes outside that band — catching issues that static thresholds would miss.' },
    { type: 'chart', label: 'Example: request count with anomaly band', base: 5000, variance: 1500, color: '#0ea5e9', unit: ' req/min' },
    { type: 'finding', severity: 'info', title: 'Best for variable metrics', content: 'Anomaly detection works best for metrics with predictable patterns (diurnal traffic, weekly cycles). For metrics with stable baselines, static thresholds are simpler and cheaper.' },
  ],
  'data-drift': [
    { type: 'text', content: 'I checked for data drift indicators on your ML model:' },
    { type: 'steps', steps: [
      { action: 'Compared input feature distributions', result: 'Feature "transaction_amount" distribution shifted 15% from training data', status: 'found' },
      { action: 'Checked prediction confidence', result: 'Average confidence dropped from 0.92 to 0.84 over the past 2 weeks', status: 'found' },
      { action: 'Checked model age', result: 'Model last retrained 6 weeks ago — approaching staleness threshold', status: 'found' },
    ]},
    { type: 'finding', severity: 'warning', title: 'Data drift detected', content: 'Input distributions have shifted significantly. The model is likely making less accurate predictions. Consider retraining with recent data.' },
  ],
  'slow-queries': [
    { type: 'text', content: 'Here are the top slow queries from your database:' },
    { type: 'steps', steps: [
      { action: 'SELECT * FROM transactions WHERE status = "pending" — 2.4s avg', result: 'Missing index on status column. Adding index would reduce to ~50ms.', status: 'found' },
      { action: 'JOIN accounts ON transactions.account_id — 1.8s avg', result: 'Full table scan on accounts. Consider adding a covering index.', status: 'found' },
      { action: 'Aggregate report query — 4.2s avg', result: 'Runs every 5 minutes. Consider materialized view or read replica.', status: 'found' },
    ]},
    { type: 'finding', severity: 'warning', title: 'Missing indexes causing slow queries', content: 'Two queries are doing full table scans. Adding indexes on the status and account_id columns would significantly reduce latency.' },
  ],
  'upstream-timeout': [
    { type: 'text', content: 'I traced the timeout to the external payment provider:' },
    { type: 'chart', label: 'Payment provider response time (24h)', base: 200, variance: 300, color: '#f87171', unit: 'ms', threshold: 2000, thresholdLabel: 'Timeout: 2s' },
    { type: 'finding', severity: 'warning', title: 'External dependency degradation', content: 'The payment provider\'s p99 response time spiked to 1.8s (normally 200ms). This is outside your control, but you can add a circuit breaker to fail fast and protect your services.' },
  ],
  'compare-week': [
    { type: 'text', content: 'Here\'s a week-over-week comparison:' },
    { type: 'chart', label: 'This week vs last week', base: 50, variance: 15, color: '#0ea5e9', unit: '' },
    { type: 'finding', severity: 'info', title: 'Trending stable', content: 'Metrics are within 5% of last week\'s values. No significant changes detected. The slight increase on Wednesday correlates with a marketing campaign.' },
  ],
  'default': [
    { type: 'text', content: 'That\'s a great question. Based on your current setup, I\'d recommend starting with the critical items first — they have the highest impact on your reliability posture. Once those are deployed, we can look at the next tier together.' },
  ],
}

function getResponse(question) {
  const q = question.toLowerCase()
  // Specific matches first (longer phrases before shorter keywords)
  if (q.includes('error log') || q.includes('full error') || q.includes('show me the error')) return mockResponses['error-logs']
  if (q.includes('slow quer')) return mockResponses['slow-queries']
  if (q.includes('upstream') || q.includes('timing out')) return mockResponses['upstream-timeout']
  if (q.includes('data drift') || q.includes('drift')) return mockResponses['data-drift']
  if (q.includes('spike') || q.includes('3:42') || q.includes('caused the')) return mockResponses['spike-analysis']
  if (q.includes('rolling restart') || q.includes('downtime') || q.includes('affect my running')) return mockResponses['rolling-restart']
  if (q.includes('agent config') || q.includes('workload') || q.includes('collection interval') || q.includes('what metrics will')) return mockResponses['agent-config']
  if (q.includes('widget') || q.includes('overview dashboard') || q.includes('customize the layout') || q.includes('preview')) return mockResponses['dashboard-widgets']
  if (q.includes('slo') || q.includes('latency slo') || q.includes('service level')) return mockResponses['slo-setup']
  if (q.includes('anomaly') || q.includes('anomaly detection')) return mockResponses['anomaly-detection']
  if (q.includes('compare') || q.includes('last week') || q.includes('last month') || q.includes('previous')) return mockResponses['compare-week']
  // General keyword matches
  if (q.includes('threshold')) return mockResponses['thresholds']
  if (q.includes('critical') || q.includes('why is this')) return mockResponses['critical']
  if (q.includes('skip') || q.includes('what happens if i skip')) return mockResponses['skip']
  if (q.includes('cloudformation') || q.includes('template') || q.includes('terraform')) return mockResponses['cloudformation']
  if (q.includes('prioritize') || q.includes('should i prioritize')) return mockResponses['prioritize']
  if (q.includes('log') && (q.includes('class') || q.includes('retention') || q.includes('volume') || q.includes('infrequent'))) return mockResponses['logs']
  if (q.includes('trac') || q.includes('x-ray') || q.includes('sampling')) return mockResponses['tracing']
  if (q.includes('stale') || q.includes('recreate') || q.includes('audit')) return mockResponses['skip']
  return mockResponses['default']
}


function groupByService(items) {
  const groups = {}
  for (const item of items) {
    const sep = item.name.indexOf(' — ')
    const svc = sep > -1 ? item.name.substring(0, sep) : 'Other'
    if (!groups[svc]) groups[svc] = []
    groups[svc].push({ ...item, shortName: sep > -1 ? item.name.substring(sep + 3) : item.name })
  }
  return groups
}

export function AgentDrawer({ investigation, onClose, onExportCode }) {
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [expanded, setExpanded] = useState(new Set())
  const [configOpen, setConfigOpen] = useState(new Set())
  const [alarmConfigItem, setAlarmConfigItem] = useState(null)
  const [extraMessages, setExtraMessages] = useState([])
  const scrollRef = useRef(null)

  useEffect(() => {
    if (investigation?.selectableItems) {
      setSelected(new Set(investigation.selectableItems.filter(i => i.defaultOn).map(i => i.id)))
      setExpanded(new Set())
    } else {
      setSelected(new Set())
    }
    setExtraMessages([])
  }, [investigation])

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (scrollRef.current && extraMessages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100)
    }
  }, [extraMessages.length])

  if (!investigation) return null

  const items = investigation.selectableItems || []
  const hasSelectable = items.length > 0
  const groups = hasSelectable ? groupByService(items) : {}
  const serviceNames = Object.keys(groups)
  const needsGrouping = serviceNames.length > 1 && items.length > 6
  const selectedItems = items.filter(i => selected.has(i.id))
  const totalCost = selectedItems.reduce((s, i) => s + (i.cost || 0), 0)

  const toggle = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleGroup = (svc) => { const grp = groups[svc]; setSelected(prev => { const n = new Set(prev); const allIn = grp.every(i => n.has(i.id)); grp.forEach(i => allIn ? n.delete(i.id) : n.add(i.id)); return n }) }
  const toggleExpand = (svc) => setExpanded(prev => { const n = new Set(prev); n.has(svc) ? n.delete(svc) : n.add(svc); return n })
  const selectAll = () => { if (selected.size === items.length) setSelected(new Set()); else setSelected(new Set(items.map(i => i.id))) }

  const handleFollowUp = (question) => {
    // Add user message
    const userMsg = { type: 'user', content: question }
    const response = getResponse(question)
    setExtraMessages(prev => [...prev, userMsg, ...response])
  }

  const handleDrillDown = (step) => {
    const action = step.action || ''
    const result = step.result || ''
    const parts = action.split(' — ')
    const service = parts[0]?.trim() || 'this service'
    const metric = parts[1]?.trim() || action

    const userMsg = { type: 'user', content: `Tell me more about ${metric} on ${service}` }

    let base = 50, variance = 20, unit = '', color = '#0ea5e9', threshold = null, thresholdLabel = ''
    if (result.includes('%')) { base = 0.3; variance = 0.4; unit = '%'; color = '#f87171'; const m = result.match(/Threshold:\s*([\d.]+)/); if (m) { threshold = +m[1]; thresholdLabel = `Threshold ${m[1]}%` } }
    else if (result.includes('ms') || result.includes('s')) { base = 180; variance = 80; unit = 'ms'; color = '#8b5cf6'; const m = result.match(/Threshold:\s*([\d.]+)/); if (m) { threshold = +m[1]; thresholdLabel = `Threshold ${m[1]}ms` } }
    else { base = 12; variance = 5; color = '#22c55e' }

    setExtraMessages(prev => [...prev, userMsg,
      { type: 'text', content: `Here's the detail on ${metric} for ${service}. Showing the last 24 hours with the recommended threshold.` },
      { type: 'chart', label: `${service} — ${metric} (24h)`, base, variance, color, unit, threshold, thresholdLabel },
      { type: 'finding', severity: threshold ? 'info' : 'warning', title: `Why this ${threshold ? 'threshold' : 'metric'}`, content: threshold ? `The ${threshold}${unit} threshold is ~5× the current baseline — avoids false positives while catching real issues. Adjust via the Edit button.` : `This uses anomaly detection based on your historical patterns rather than a static threshold.` },
      { type: 'text', content: 'You can edit the configuration from the gap card, or ask me to adjust it here.' },
    ])
  }

  const handleSend = () => {
    if (!input.trim()) return
    handleFollowUp(input.trim())
    setInput('')
  }

  const allMessages = [...investigation.messages, ...extraMessages]

  return (
    <div className="fixed inset-y-0 left-14 w-[480px] z-50 flex flex-col bg-[#0c1120] border-r border-border-muted shadow-2xl animate-drawerIn" style={{ animation: 'drawerSlideIn 0.3s ease-out' }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-muted flex-shrink-0">
        <div className="flex items-center gap-2"><Sparkle size={16} className="text-primary" weight="fill" /><span className="text-body-s font-semibold text-foreground">Agent Investigation</span></div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><X size={16} /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        <h3 className="text-body-m font-semibold text-foreground mb-1">{investigation.title}</h3>
        <p className="text-[11px] text-foreground-muted mb-4">{investigation.subtitle}</p>

        {allMessages.map((msg, i) => (
          <div key={i} className="mb-4">
            {msg.type === 'user' && (
              <div className="flex gap-3 justify-end mb-1">
                <div className="bg-primary/10 border border-primary/20 rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                  <p className="text-[12px] text-foreground">{msg.content}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-foreground-muted/20 flex items-center justify-center flex-shrink-0 mt-0.5"><User size={10} className="text-foreground-muted" /></div>
              </div>
            )}
            {msg.type === 'text' && <div className="flex gap-3"><div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5"><Sparkle size={10} className="text-primary" weight="fill" /></div><p className="text-[12px] text-foreground leading-relaxed">{msg.content}</p></div>}
            {msg.type === 'chart' && <div className="glass-card p-3 my-2"><p className="text-[9px] text-foreground-disabled mb-2">{msg.label}</p><LineChart data={mockTimeSeries(24, msg.base || 50, msg.variance || 20)} color={msg.color || '#0ea5e9'} height={64} unit={msg.unit || ''} thresholdValue={msg.threshold} thresholdLabel={msg.thresholdLabel} /></div>}
            {msg.type === 'finding' && <div className={`rounded-lg p-3 my-2 border-l-2 ${msg.severity === 'critical' ? 'border-l-red-400 bg-red-400/5' : msg.severity === 'warning' ? 'border-l-status-degraded bg-status-degraded/5' : 'border-l-primary bg-primary/5'}`}><p className="text-[11px] font-medium text-foreground">{msg.title}</p><p className="text-[10px] text-foreground-muted mt-1">{msg.content}</p></div>}
            {msg.type === 'actions' && !hasSelectable && <div className="flex gap-2 my-3"><button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-medium"><Play size={12} /> Apply now</button><button onClick={() => onExportCode?.()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-[11px] text-foreground hover:bg-background-surface-2"><Code size={12} /> Export as code</button></div>}
            {msg.type === 'steps' && <div className="my-2">{msg.steps.map((step, si) => <button key={si} onClick={() => handleDrillDown(step)} className="flex gap-2 py-1.5 w-full text-left hover:bg-primary/5 rounded px-1 -mx-1 transition-colors cursor-pointer group"><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 ${step.status === 'found' ? 'bg-red-400/20 text-red-400' : 'bg-status-active/20 text-status-active'}`}>{si + 1}</div><div className="flex-1"><p className="text-[11px] text-foreground">{step.action}</p><p className="text-[10px] text-foreground-muted">{step.result}</p></div><CaretRight size={10} className="text-foreground-disabled group-hover:text-primary mt-1 flex-shrink-0" /></button>)}</div>}

            {msg.type === 'selectable' && hasSelectable && (
              <div className="my-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-foreground-disabled uppercase tracking-wider">{selected.size} of {items.length} selected</p>
                  <button onClick={selectAll} className="text-[9px] text-primary hover:text-primary-hover">{selected.size === items.length ? 'Deselect all' : 'Select all'}</button>
                </div>
                {needsGrouping ? (
                  <div className="flex flex-col gap-1">
                    {serviceNames.map(svc => {
                      const grp = groups[svc]; const grpSelected = grp.filter(i => selected.has(i.id)).length; const allIn = grpSelected === grp.length; const someIn = grpSelected > 0 && !allIn; const isExpanded = expanded.has(svc); const grpCost = grp.filter(i => selected.has(i.id)).reduce((s, i) => s + i.cost, 0)
                      return (
                        <div key={svc} className="rounded-lg border border-border-muted/20 overflow-hidden">
                          <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-background-surface-2/30 cursor-pointer" onClick={() => toggleExpand(svc)}>
                            <button onClick={(e) => { e.stopPropagation(); toggleGroup(svc) }} className="flex-shrink-0">{allIn ? <CheckSquare size={14} weight="fill" className="text-primary" /> : someIn ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} className="text-foreground-disabled" />}</button>
                            {isExpanded ? <CaretDown size={10} className="text-foreground-muted" /> : <CaretRight size={10} className="text-foreground-muted" />}
                            <span className="text-[11px] font-medium text-foreground flex-1">{svc}</span>
                            <span className="text-[9px] text-foreground-disabled">{grpSelected}/{grp.length}</span>
                            {grpCost !== 0 && <span className="text-[9px] text-foreground-muted">{grpCost >= 0 ? '+' : ''}${grpCost.toFixed(2)}</span>}
                          </div>
                          {isExpanded && (<div className="border-t border-border-muted/10 bg-background/20">{grp.map(item => (<div key={item.id}><div onClick={() => toggle(item.id)} className={`flex items-center gap-2 py-1.5 px-3 pl-9 cursor-pointer transition-colors ${selected.has(item.id) ? 'bg-primary/5' : 'hover:bg-background-surface-2/30'}`}>{selected.has(item.id) ? <CheckSquare size={12} weight="fill" className="text-primary flex-shrink-0" /> : <Square size={12} className="text-foreground-disabled flex-shrink-0" />}<span className="text-[10px] text-foreground flex-1">{item.shortName}</span>{item.config && <button onClick={(e) => { e.stopPropagation(); setAlarmConfigItem(item) }} className="text-[9px] text-primary hover:text-primary-hover">Edit</button>}<span className="text-[9px] text-foreground-muted">${item.cost.toFixed(2)}</span></div></div>))}</div>)}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {items.map(item => (<div key={item.id}><div onClick={() => toggle(item.id)} className={`flex items-center gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-colors ${selected.has(item.id) ? 'bg-primary/5 border border-primary/20' : 'border border-transparent hover:bg-background-surface-2/50'}`}>{selected.has(item.id) ? <CheckSquare size={14} weight="fill" className="text-primary flex-shrink-0" /> : <Square size={14} className="text-foreground-disabled flex-shrink-0" />}<div className="flex-1 min-w-0"><p className="text-[11px] text-foreground">{item.name}</p>{item.description && <p className="text-[9px] text-foreground-muted">{item.description}</p>}</div>{item.config && <button onClick={(e) => { e.stopPropagation(); setAlarmConfigItem(item) }} className="text-[9px] text-primary hover:text-primary-hover">Edit</button>}<span className="text-[10px] text-foreground-muted flex-shrink-0">{item.cost >= 0 ? '+' : ''}${item.cost.toFixed(2)}/mo</span></div></div>))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {investigation.followUps && (
          <div className="mt-2"><p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-2">Follow up</p><div className="flex flex-col gap-1">{investigation.followUps.map((q, i) => <button key={i} onClick={() => handleFollowUp(q)} className="flex items-center gap-2 text-[11px] text-primary hover:text-primary-hover text-left py-1 hover:bg-primary/5 rounded px-2 -mx-2"><CaretRight size={10} /> {q}</button>)}</div></div>
        )}
      </div>

      {/* Sticky action bar */}
      {hasSelectable && selected.size > 0 && (
        <div className="flex-shrink-0 border-t border-border-muted bg-[#0c1120] px-5 py-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] text-foreground-muted">{selected.size} of {items.length} selected</span>
            <div className="text-right"><span className="text-[10px] text-foreground-disabled">Estimated cost</span><p className="text-body-s font-semibold text-foreground">{totalCost >= 0 ? '+' : ''}${totalCost.toFixed(2)}<span className="text-[10px] text-foreground-muted font-normal">/mo</span></p></div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-medium transition-colors"><Play size={12} /> Apply now</button>
            <button onClick={() => onExportCode?.(selectedItems)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-background-surface-1 border border-border-muted text-[11px] text-foreground hover:bg-background-surface-2 transition-colors"><Code size={12} /> Export as code</button>
          </div>
        </div>
      )}

      {/* Chat input */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-border-muted">
        <div className="relative">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a follow-up..." className="w-full h-10 rounded-lg bg-background-surface-1 border border-border-muted px-3 pr-10 text-[12px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40" />
          <button onClick={handleSend} className="absolute right-2 top-2 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20"><PaperPlaneRight size={12} /></button>
        </div>
      </div>

      {alarmConfigItem && <AlarmConfigModal item={alarmConfigItem} onClose={() => setAlarmConfigItem(null)} onSave={() => setAlarmConfigItem(null)} />}
      <style>{`
        @keyframes drawerSlideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
