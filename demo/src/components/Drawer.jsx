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
  'root-cause': [
    { type: 'text', content: 'I ran a root cause analysis across correlated signals:' },
    { type: 'steps', steps: [
      { action: 'Checked recent deployments', result: 'No deployments in the last 24 hours — not a code change', status: 'clear' },
      { action: 'Analyzed traffic patterns', result: 'Traffic is within normal range — not a load issue', status: 'clear' },
      { action: 'Checked upstream dependencies', result: 'External payment provider response time elevated — likely root cause', status: 'found' },
      { action: 'Checked infrastructure', result: 'Database connection pool at 78% — contributing factor', status: 'found' },
    ]},
    { type: 'finding', severity: 'warning', title: 'Two contributing factors identified', content: 'The primary issue is elevated response times from the external payment provider. This is compounded by the database connection pool approaching capacity. The combination is causing cascading latency.' },
  ],
  'service-map': [
    { type: 'text', content: 'Here\'s the service dependency map based on your infrastructure:' },
    { type: 'finding', severity: 'info', title: 'Service topology', content: 'API Gateway → ECS/EKS compute services → databases (RDS, DynamoDB) with caching (ElastiCache) and async messaging (SQS/SNS/Kinesis/MSK) on the side.' },
    { type: 'text', content: 'To get a real-time interactive service map with health overlays, enable X-Ray tracing. Application Signals will then auto-generate the map from trace data.' },
  ],
  'create-alarm': [
    { type: 'text', content: 'I can create alarms for the uncovered services. Here\'s what I recommend:' },
    { type: 'finding', severity: 'info', title: 'Recommended approach', content: 'I\'ll create 2-3 alarms per service based on the service type: CPU/memory for compute, latency/errors for APIs, connections/latency for databases. Each alarm is $0.10/month.' },
    { type: 'text', content: 'Go to the Observability Gaps page to select specific services and configure alarm thresholds before deploying.' },
  ],
  'circuit-breaker': [
    { type: 'text', content: 'A circuit breaker pattern would help here. When the upstream dependency starts timing out, the circuit breaker trips and returns a fast failure instead of waiting for the timeout.' },
    { type: 'steps', steps: [
      { action: 'Configure failure threshold', result: 'Trip after 5 consecutive failures or 50% error rate in 30 seconds', status: 'clear' },
      { action: 'Set recovery timeout', result: 'Half-open after 30 seconds, allow 1 test request through', status: 'clear' },
      { action: 'Add fallback response', result: 'Return cached response or graceful degradation message', status: 'clear' },
    ]},
    { type: 'finding', severity: 'info', title: 'CloudWatch alarm for circuit breaker', content: 'I can create an alarm that monitors the circuit breaker state — alerting when it trips so your team knows the dependency is degraded.' },
  ],
  'endpoint-breakdown': [
    { type: 'text', content: 'Here\'s the traffic breakdown by endpoint:' },
    { type: 'steps', steps: [
      { action: '/api/v2/payments — 42% of traffic', result: '~3,500 req/min, p99 latency 180ms', status: 'clear' },
      { action: '/api/v2/accounts — 28% of traffic', result: '~2,300 req/min, p99 latency 95ms', status: 'clear' },
      { action: '/api/v2/transactions — 18% of traffic', result: '~1,500 req/min, p99 latency 210ms', status: 'found' },
      { action: '/api/v2/auth — 12% of traffic', result: '~1,000 req/min, p99 latency 45ms', status: 'clear' },
    ]},
    { type: 'finding', severity: 'info', title: '/transactions has highest latency', content: 'The transactions endpoint has the highest p99 latency at 210ms. This correlates with the database connection pool pressure we identified earlier.' },
  ],
  'capacity-projection': [
    { type: 'text', content: 'Based on your current growth rate and resource utilization:' },
    { type: 'steps', steps: [
      { action: 'Current utilization', result: 'CPU 42%, Memory 58%, Connections 24/100', status: 'clear' },
      { action: 'Growth rate', result: '~8% month-over-month traffic increase', status: 'clear' },
      { action: 'Projected capacity limit', result: 'At current growth, you\'ll hit 80% memory in ~4 months', status: 'found' },
    ]},
    { type: 'finding', severity: 'warning', title: 'Plan scaling in ~3 months', content: 'Memory will be the first bottleneck. Consider scaling up instance size or adding horizontal capacity before hitting 80%.' },
  ],
  'scaling-advice': [
    { type: 'text', content: 'Based on your current utilization and traffic patterns:' },
    { type: 'finding', severity: 'info', title: 'Scaling recommendation', content: 'Your current capacity has healthy headroom. CPU at 42% and memory at 58% means you can handle ~70% more traffic before needing to scale. I\'d recommend setting up auto-scaling policies rather than scaling up now.' },
    { type: 'text', content: 'For ECS: set target tracking on CPU at 70%. For EKS: configure Horizontal Pod Autoscaler with CPU target 60%. This gives you automatic scaling without over-provisioning.' },
  ],
  'cold-starts': [
    { type: 'text', content: 'Here\'s the cold start analysis for your Lambda functions:' },
    { type: 'steps', steps: [
      { action: 'transaction-processor — 6% cold starts', result: 'High invocation rate keeps containers warm. Cold starts only during scale-up events.', status: 'clear' },
      { action: 'fraud-scorer — 12% cold starts', result: 'Bursty traffic pattern causes frequent cold starts. Provisioned concurrency would help.', status: 'found' },
      { action: 'report-generator — 45% cold starts', result: 'Low frequency (batch job). Cold starts expected and acceptable for this use case.', status: 'clear' },
    ]},
    { type: 'finding', severity: 'info', title: 'Provisioned concurrency recommended for fraud-scorer', content: 'Setting 5 provisioned instances would eliminate most cold starts for the fraud-scorer function. Estimated cost: ~$15/month.' },
  ],
  'budget-burn': [
    { type: 'text', content: 'I analyzed the error budget consumption pattern:' },
    { type: 'chart', label: 'Error budget remaining (30d)', base: 65, variance: 8, color: '#f87171', unit: '%' },
    { type: 'steps', steps: [
      { action: 'Burn rate analysis', result: 'Current burn rate: 2.3× — consuming budget 2.3× faster than sustainable', status: 'found' },
      { action: 'Top contributor', result: 'Intermittent 5xx errors from upstream dependency account for 68% of budget consumption', status: 'found' },
      { action: 'Time to breach', result: 'At current rate, you\'ll breach the SLO in ~3 days', status: 'found' },
    ]},
    { type: 'finding', severity: 'warning', title: 'Action needed within 3 days', content: 'The upstream dependency issues are burning your error budget fast. Fix the dependency or add a circuit breaker to stop the bleeding.' },
  ],
  'slo-risk': [
    { type: 'text', content: 'Here\'s what could put this SLO at risk:' },
    { type: 'steps', steps: [
      { action: 'Upstream dependency failure', result: 'If the payment provider degrades, your error rate spikes immediately', status: 'found' },
      { action: 'Database capacity', result: 'Connection pool at 78% — a traffic spike could cause queuing and latency breaches', status: 'found' },
      { action: 'Deployment risk', result: 'A bad deploy without canary testing could burn the entire error budget in minutes', status: 'found' },
    ]},
    { type: 'finding', severity: 'info', title: 'Mitigation recommendations', content: 'Set up burn-rate alerts at 2× and 10× thresholds. Add circuit breakers for external dependencies. Use canary deployments to limit blast radius.' },
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
  if (q.includes('agent config') || q.includes('collection interval') || q.includes('what metrics will')) return mockResponses['agent-config']
  if (q.includes('widget') || q.includes('overview dashboard') || q.includes('customize the layout') || q.includes('show me a preview')) return mockResponses['dashboard-widgets']
  if (q.includes('circuit breaker')) return mockResponses['circuit-breaker']
  if (q.includes('endpoint') || q.includes('by endpoint') || q.includes('traffic breakdown')) return mockResponses['endpoint-breakdown']
  if (q.includes('capacity') || q.includes('project capacity') || q.includes('sized correctly')) return mockResponses['capacity-projection']
  if (q.includes('scale up') || q.includes('scale out') || q.includes('scaling correctly') || q.includes('add more consumer')) return mockResponses['scaling-advice']
  if (q.includes('cold start') || q.includes('provisioned concurrency')) return mockResponses['cold-starts']
  if (q.includes('budget') || q.includes('burning') || q.includes('burn')) return mockResponses['budget-burn']
  if (q.includes('at risk') || q.includes('put this at risk') || q.includes('what would')) return mockResponses['slo-risk']
  if (q.includes('service map') || q.includes('dependency map') || q.includes('topology') || q.includes('connected service')) return mockResponses['service-map']
  if (q.includes('create alarm') || q.includes('uncovered service') || q.includes('create an alarm')) return mockResponses['create-alarm']
  if (q.includes('causing') || q.includes('root cause') || q.includes('what\'s wrong') || q.includes('issues in')) return mockResponses['root-cause']
  if (q.includes('normal for') || q.includes('time of day') || q.includes('expected') || q.includes('typical')) return mockResponses['compare-week']
  if (q.includes('slo') || q.includes('latency slo') || q.includes('service level') || q.includes('error breakdown')) return mockResponses['slo-setup']
  if (q.includes('anomaly') || q.includes('anomaly detection')) return mockResponses['anomaly-detection']
  if (q.includes('compare') || q.includes('last week') || q.includes('last month') || q.includes('previous') || q.includes('model version') || q.includes('past week') || q.includes('trend over') || q.includes('trend')) return mockResponses['compare-week']
  if (q.includes('hot partition') || q.includes('hot key') || q.includes('frequently accessed')) return mockResponses['capacity-projection']
  if (q.includes('split') || q.includes('fan-out') || q.includes('shard')) return mockResponses['scaling-advice']
  if (q.includes('workload')) return mockResponses['agent-config']
  // General keyword matches
  if (q.includes('threshold') || q.includes('adjust')) return mockResponses['thresholds']
  if (q.includes('critical') || q.includes('why is this')) return mockResponses['critical']
  if (q.includes('skip') || q.includes('what happens if i skip')) return mockResponses['skip']
  if (q.includes('cloudformation') || q.includes('template') || q.includes('terraform')) return mockResponses['cloudformation']
  if (q.includes('prioritize') || q.includes('should i prioritize')) return mockResponses['prioritize']
  if (q.includes('log') && (q.includes('class') || q.includes('retention') || q.includes('volume') || q.includes('infrequent'))) return mockResponses['logs']
  if (q.includes('trac') || q.includes('x-ray') || q.includes('sampling')) return mockResponses['tracing']
  if (q.includes('stale') || q.includes('recreate') || q.includes('audit')) return mockResponses['skip']
  if (q.includes('raw data') || q.includes('show me') && !q.includes('service') && !q.includes('error') && !q.includes('broker')) return mockResponses['endpoint-breakdown']
  if (q.includes('blast radius')) return mockResponses['root-cause']
  if (q.includes('save') || q.includes('cost') || q.includes('expensive') || q.includes('how much')) return mockResponses['logs']
  if (q.includes('query') || q.includes('which log')) return mockResponses['logs']
  if (q.includes('switch back') || q.includes('standard')) return mockResponses['logs']
  if (q.includes('dlq') || q.includes('dead letter') || q.includes('failed message')) return mockResponses['error-logs']
  if (q.includes('memory leak') || q.includes('which service has')) return mockResponses['root-cause']
  if (q.includes('topic') || q.includes('broker health') || q.includes('broker')) return mockResponses['capacity-projection']
  if (q.includes('peak')) return mockResponses['compare-week']
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
    const hasSeparator = parts.length > 1
    const service = hasSeparator ? parts[0].trim() : ''
    const metric = hasSeparator ? parts[1].trim() : action

    const userMsg = { type: 'user', content: hasSeparator ? `Tell me more about ${metric} on ${service}` : `Tell me more about: ${action}` }

    // Build contextual explanation based on the step content
    const explanations = []

    // Opening text
    if (hasSeparator) {
      explanations.push({ type: 'text', content: `Here's a deeper look at ${metric} for ${service}:` })
    } else {
      explanations.push({ type: 'text', content: `Let me break down what "${action}" means for your system:` })
    }

    // Chart with smart defaults based on result content
    let base = 50, variance = 20, unit = '', color = '#0ea5e9', threshold = null, thresholdLabel = ''
    if (result.includes('%')) { base = parseFloat(result) || 50; variance = base * 0.3; unit = '%'; color = '#f87171'; const m = result.match(/Threshold:\s*([\d.]+)/); if (m) { threshold = +m[1]; thresholdLabel = `Threshold ${m[1]}%` } }
    else if (result.includes('ms')) { base = parseFloat(result) || 180; variance = base * 0.3; unit = 'ms'; color = '#8b5cf6'; const m = result.match(/Threshold:\s*([\d.]+)/); if (m) { threshold = +m[1]; thresholdLabel = `Threshold ${m[1]}ms` } }
    else { base = 12; variance = 5; color = '#22c55e' }

    const chartLabel = hasSeparator ? `${service} — ${metric} (24h)` : `${action} (24h)`
    explanations.push({ type: 'chart', label: chartLabel, base, variance, color, unit, threshold, thresholdLabel })

    // Contextual finding based on step status and content
    if (step.status === 'found') {
      explanations.push({ type: 'finding', severity: 'warning', title: result, content: getStepExplanation(action, result) })
    } else {
      explanations.push({ type: 'finding', severity: 'info', title: result, content: 'This check came back clean — no issues detected in this area.' })
    }

    // Actionable next step
    if (step.status === 'found') {
      explanations.push({ type: 'text', content: getStepRecommendation(action, result) })
    }

    setExtraMessages(prev => [...prev, userMsg, ...explanations])
  }

  // Generate contextual explanations for drill-down findings
  function getStepExplanation(action, result) {
    const a = action.toLowerCase()
    const r = result.toLowerCase()
    if (a.includes('deployment') || a.includes('deploy')) return 'Deployments are a common root cause for metric changes. Since no recent deployments were found, the issue is likely environmental — traffic patterns, dependency changes, or resource exhaustion.'
    if (a.includes('burn rate') || a.includes('budget')) return 'The error budget burn rate measures how fast you\'re consuming your allowed error margin. A rate above 1× means you\'re burning faster than sustainable. At 2×+, you need to act within days to avoid breaching your SLO.'
    if (a.includes('contributing error') || a.includes('5xx')) return 'These errors are directly consuming your error budget. Each 5xx response counts against your availability SLO. The intermittent pattern suggests a flaky upstream dependency rather than a systemic issue.'
    if (a.includes('traffic') || a.includes('load')) return 'Traffic analysis helps distinguish between load-induced issues and code/infrastructure problems. Normal traffic with degraded performance points to a capacity or dependency issue.'
    if (a.includes('connection') || a.includes('pool')) return 'Database connection pool saturation causes queries to queue, increasing latency for all services that depend on this database. This is often the hidden bottleneck behind latency spikes.'
    if (a.includes('batch') || a.includes('job')) return 'Batch jobs can compete with real-time traffic for shared resources like database connections and CPU. Consider running batch workloads against read replicas or during off-peak hours.'
    if (a.includes('memory') || a.includes('mem')) return 'A gradual memory increase without corresponding traffic growth often indicates a memory leak — objects being allocated but not garbage collected. This will eventually cause OOM kills.'
    if (a.includes('cpu')) return 'CPU utilization at this level leaves headroom for traffic spikes. However, sustained high CPU can increase latency as the scheduler contends for cycles.'
    if (a.includes('restart') || a.includes('pod')) return 'Pod restarts indicate containers are crashing or being OOM-killed. Frequent restarts degrade availability and can cause request failures during the restart window.'
    if (a.includes('disk')) return 'Disk usage at this level needs monitoring. When disk fills up, databases crash, logs stop writing, and services fail in unpredictable ways. This is one of the most common causes of outages.'
    if (a.includes('lag') || a.includes('consumer')) return 'Consumer lag means your processing pipeline is falling behind the incoming data rate. This can cause stale data, delayed processing, and eventually data loss if the retention period is exceeded.'
    if (a.includes('shard') || a.includes('partition')) return 'Hot shards/partitions create bottlenecks where one shard handles disproportionate traffic while others are underutilized. This limits your effective throughput to the capacity of the hottest shard.'
    if (a.includes('confidence') || a.includes('model') || a.includes('feature')) return 'Changes in input data distributions cause ML models to make predictions on data that differs from their training set. This leads to degraded accuracy and potentially incorrect decisions.'
    if (r.includes('no recent') || r.includes('no deploy')) return 'Ruling out deployments is an important first step. Since no code changes were made, the issue is likely environmental — a dependency change, traffic pattern shift, or gradual resource exhaustion.'
    return 'This finding provides important context for understanding the current state of your system. Combined with other signals, it helps narrow down the root cause.'
  }

  // Generate actionable recommendations for drill-down findings
  function getStepRecommendation(action, result) {
    const a = action.toLowerCase()
    if (a.includes('burn rate') || a.includes('budget')) return 'I recommend setting up burn-rate alerts at 2× (slow burn, page within hours) and 10× (fast burn, page immediately). This gives you early warning before the SLO breaches.'
    if (a.includes('5xx') || a.includes('error')) return 'Consider adding a circuit breaker to fail fast when the upstream is degraded. This preserves your error budget by returning graceful failures instead of waiting for timeouts.'
    if (a.includes('connection') || a.includes('pool')) return 'You can increase the connection pool size, add connection pooling middleware (like PgBouncer for PostgreSQL), or optimize long-running queries that hold connections.'
    if (a.includes('memory') || a.includes('mem')) return 'I recommend creating a memory utilization alarm at 80% to catch this before it causes OOM kills. Also consider profiling the application to identify the leak source.'
    if (a.includes('disk')) return 'Set up a disk usage alarm at 80%. Consider enabling log rotation, increasing storage, or moving old data to cheaper storage tiers.'
    if (a.includes('lag') || a.includes('consumer')) return 'You can add more consumers to increase processing throughput, or optimize your consumer code to process messages faster. Also check if any messages are causing processing delays.'
    if (a.includes('shard') || a.includes('partition')) return 'Consider splitting the hot shard, using a more distributed partition key, or enabling enhanced fan-out for dedicated throughput per consumer.'
    if (a.includes('restart') || a.includes('pod')) return 'Check the pod logs for OOM kill events or crash stack traces. You may need to increase memory limits or fix the underlying crash cause.'
    return 'I can help you set up monitoring for this. Would you like me to create an alarm or add this to a dashboard?'
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
