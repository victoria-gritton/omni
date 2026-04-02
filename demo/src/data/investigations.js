// Pre-built agent investigations per widget type
// Investigations with selectableItems get the sticky cost/action bar in the drawer

const alarmConfigs = {
  'API Gateway': [{ name: '5xx Error Rate > 1%', cost: 0.10, metric: '5XXError', threshold: 1, unit: '%', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }, { name: 'Latency p99 > 1s', cost: 0.10, metric: 'Latency', threshold: 1000, unit: 'ms', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'missing' }, { name: 'Request count anomaly', cost: 0.10, metric: 'Count', threshold: null, unit: 'requests', period: 300, evalPeriods: 2, comparison: 'LessThanLowerOrGreaterThanUpperThreshold', missingData: 'breaching' }],
  'ECS Fargate': [{ name: 'CPU > 90%', cost: 0.10, metric: 'CPUUtilization', threshold: 90, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }, { name: 'Memory > 85%', cost: 0.10, metric: 'MemoryUtilization', threshold: 85, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }, { name: 'Task count < desired', cost: 0.10, metric: 'RunningTaskCount', threshold: null, unit: 'tasks', period: 60, evalPeriods: 3, comparison: 'LessThanThreshold', missingData: 'breaching' }],
  'Lambda': [{ name: 'Error rate > 1%', cost: 0.10, metric: 'Errors', threshold: 1, unit: '%', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }, { name: 'Duration p99 > 10s', cost: 0.10, metric: 'Duration', threshold: 10000, unit: 'ms', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'missing' }, { name: 'Throttles > 0', cost: 0.10, metric: 'Throttles', threshold: 0, unit: 'count', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }],
  'RDS PostgreSQL': [{ name: 'CPU > 80%', cost: 0.10, metric: 'CPUUtilization', threshold: 80, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }, { name: 'Freeable memory < 500MB', cost: 0.10, metric: 'FreeableMemory', threshold: 500000000, unit: 'bytes', period: 300, evalPeriods: 2, comparison: 'LessThanThreshold', missingData: 'breaching' }, { name: 'Read latency > 20ms', cost: 0.10, metric: 'ReadLatency', threshold: 0.02, unit: 's', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'missing' }],
  'Aurora PostgreSQL': [{ name: 'CPU > 80%', cost: 0.10, metric: 'CPUUtilization', threshold: 80, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }, { name: 'Replica lag > 100ms', cost: 0.10, metric: 'AuroraReplicaLag', threshold: 100, unit: 'ms', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }, { name: 'Deadlocks > 0', cost: 0.10, metric: 'Deadlocks', threshold: 0, unit: 'count', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }],
  'DynamoDB': [{ name: 'Throttled requests > 0', cost: 0.10, metric: 'ThrottledRequests', threshold: 0, unit: 'count', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }, { name: 'System errors > 0', cost: 0.10, metric: 'SystemErrors', threshold: 0, unit: 'count', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }],
  'ElastiCache Redis': [{ name: 'CPU > 75%', cost: 0.10, metric: 'CPUUtilization', threshold: 75, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }, { name: 'Engine CPU > 80%', cost: 0.10, metric: 'EngineCPUUtilization', threshold: 80, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }],
  'CloudFront': [{ name: '5xx error rate > 1%', cost: 0.10, metric: '5xxErrorRate', threshold: 1, unit: '%', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }, { name: 'Origin latency > 2s', cost: 0.10, metric: 'OriginLatency', threshold: 2000, unit: 'ms', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'missing' }],
  'SNS + SQS': [{ name: 'Message age > 300s', cost: 0.10, metric: 'ApproximateAgeOfOldestMessage', threshold: 300, unit: 's', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }, { name: 'Publish count anomaly', cost: 0.10, metric: 'NumberOfMessagesPublished', threshold: null, unit: 'count', period: 300, evalPeriods: 2, comparison: 'LessThanLowerOrGreaterThanUpperThreshold', missingData: 'breaching' }],
  'S3': [{ name: '4xx error rate > 5%', cost: 0.10, metric: '4xxErrors', threshold: 5, unit: '%', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }],
  'EKS': [{ name: 'Pod restart rate > 5/hr', cost: 0.10, metric: 'pod_restart_count', threshold: 5, unit: '/hr', period: 3600, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }, { name: 'Node CPU > 85%', cost: 0.10, metric: 'node_cpu_utilization', threshold: 85, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }, { name: 'Pending pods > 0', cost: 0.10, metric: 'pending_pods', threshold: 0, unit: 'count', period: 300, evalPeriods: 3, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }],
  'SageMaker': [{ name: 'Model latency p99 > 300ms', cost: 0.10, metric: 'ModelLatency', threshold: 300, unit: 'ms', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'missing' }, { name: 'Invocation 5xx > 0', cost: 0.10, metric: 'Invocation5XXErrors', threshold: 0, unit: 'count', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }],
  'Kinesis': [{ name: 'Iterator age > 60s', cost: 0.10, metric: 'GetRecords.IteratorAgeMilliseconds', threshold: 60000, unit: 'ms', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }, { name: 'Throughput exceeded', cost: 0.10, metric: 'ReadProvisionedThroughputExceeded', threshold: 0, unit: 'count', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }],
  'MSK': [{ name: 'Consumer lag > 1000', cost: 0.10, metric: 'EstimatedMaxTimeLag', threshold: 1000, unit: 'ms', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }, { name: 'Disk usage > 85%', cost: 0.10, metric: 'KafkaDataLogsDiskUsed', threshold: 85, unit: '%', period: 300, evalPeriods: 2, comparison: 'GreaterThanThreshold', missingData: 'breaching' }],
  'Bedrock Agent': [{ name: 'Invocation latency > 5s', cost: 0.10, metric: 'InvocationLatency', threshold: 5000, unit: 'ms', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'missing' }, { name: 'Invocation errors > 0', cost: 0.10, metric: 'InvocationErrors', threshold: 0, unit: 'count', period: 300, evalPeriods: 1, comparison: 'GreaterThanThreshold', missingData: 'notBreaching' }],
}

const logConfigs = {
  'API Gateway': { name: 'Access logs', impact: 'Config update, no downtime', cost: 2.00 },
  'ECS Fargate': { name: 'Container logs (awslogs)', impact: 'Task redeploy required', cost: 3.00 },
  'Lambda': { name: 'Function logs', impact: 'Already auto-created', cost: 0 },
  'RDS PostgreSQL': { name: 'Slow query + error logs', impact: 'Parameter group update', cost: 1.50 },
  'Aurora PostgreSQL': { name: 'Audit + slow query logs', impact: 'Parameter group update', cost: 2.00 },
  'CloudFront': { name: 'Access logs', impact: 'Config update, no downtime', cost: 1.00 },
  'DynamoDB': { name: 'CloudTrail data events', impact: 'Config update', cost: 1.50 },
  'ElastiCache Redis': { name: 'Slow log', impact: 'Config update', cost: 0.50 },
  'EKS': { name: 'Pod logs (Fluent Bit)', impact: 'DaemonSet deployment', cost: 5.00 },
  'SageMaker': { name: 'Inference logs', impact: 'Config update', cost: 1.00 },
}

const traceConfigs = {
  'API Gateway': { method: 'X-Ray tracing on stage', impact: 'Config update, no downtime', cost: 0.50 },
  'ECS Fargate': { method: 'X-Ray daemon sidecar', impact: 'Rolling restart (~2 min)', cost: 0.80 },
  'EKS': { method: 'ADOT collector DaemonSet', impact: 'DaemonSet rollout (~3 min)', cost: 1.50 },
  'Lambda': { method: 'Active tracing', impact: 'Config toggle, instant', cost: 0.25 },
  'SageMaker': { method: 'Inference tracing', impact: 'Config update, no restart', cost: 0.40 },
}

export function getInvestigation(widgetType, context = {}) {
  const svcs = context.services || []
  const appName = context.appName || 'your services'

  const investigations = {
    // ─── Alarms (selectable per-service) ────────────────────────────
    'alarms': (() => {
      const noAlarms = svcs.filter(s => !s.hasAlarms)
      const items = noAlarms.flatMap(s => {
        const cfgs = alarmConfigs[s.type] || [{ name: 'Basic health alarm', cost: 0.10 }]
        return cfgs.map((c, i) => ({ id: `alarm-${s.name}-${i}`, name: `${s.name} — ${c.name}`, description: s.type, cost: c.cost, defaultOn: true, config: { metric: c.metric, threshold: c.threshold, unit: c.unit, period: c.period, evalPeriods: c.evalPeriods, comparison: c.comparison, missingData: c.missingData } }))
      })
      return {
        title: 'Create Recommended Alarms',
        subtitle: `${items.length} alarms for ${noAlarms.length} services in ${appName}`,
        messages: [
          { type: 'text', content: `I recommend creating ${items.length} alarms for the ${noAlarms.length} services that currently have no alarm coverage. Each alarm is $0.10/month.` },
          { type: 'finding', severity: noAlarms.length > 0 ? 'critical' : 'info', title: noAlarms.length > 0 ? `${noAlarms.length} services unmonitored` : 'All services have alarms', content: noAlarms.length > 0 ? `${noAlarms.map(s => s.name).slice(0, 4).join(', ')}${noAlarms.length > 4 ? ` and ${noAlarms.length - 4} more` : ''} have no alarms.` : 'All services are covered.' },
          { type: 'selectable' },
        ],
        selectableItems: items,
        followUps: ['What thresholds are you recommending?', 'Which services are most critical?', 'Show me the CloudFormation template'],
      }
    })(),

    // ─── Logs (selectable per-service) ──────────────────────────────
    'enable-logs': (() => {
      const noLogs = svcs.filter(s => !s.hasLogs)
      const items = noLogs.map(s => {
        const cfg = logConfigs[s.type] || { name: 'CloudWatch Logs', impact: 'Config update', cost: 1.00 }
        return { id: `log-${s.name}`, name: `${s.name} — ${cfg.name}`, description: cfg.impact, cost: cfg.cost, defaultOn: true }
      }).filter(i => i.cost > 0)
      return {
        title: 'Enable Log Delivery',
        subtitle: `${items.length} services need log configuration in ${appName}`,
        messages: [
          { type: 'text', content: `I'll configure log delivery for ${items.length} services in ${appName}. Each service type has a different logging mechanism:` },
          { type: 'finding', severity: 'high', title: `${items.length} services need log delivery`, content: 'Without logs, you cannot debug issues, audit access, or investigate incidents on these services.' },
          { type: 'selectable' },
        ],
        selectableItems: items,
        followUps: ['Which log class should I use?', 'How much log volume should I expect?', 'Can I set retention policies?', 'Show me the Terraform template'],
      }
    })(),

    // ─── Tracing (selectable per-service) ───────────────────────────
    'enable-tracing': (() => {
      const noTraces = svcs.filter(s => !s.hasTraces)
      const items = noTraces.map((s, i) => {
        const cfg = traceConfigs[s.type] || { method: 'X-Ray tracing', impact: 'Config update', cost: 0.30 }
        return { id: `trace-${s.name}`, name: `${s.name} — ${cfg.method}`, description: cfg.impact, cost: cfg.cost, defaultOn: i < 4 }
      })
      return {
        title: 'Enable Distributed Tracing',
        subtitle: `${items.length} services to trace in ${appName}`,
        messages: [
          { type: 'text', content: `I'll set up X-Ray distributed tracing for ${appName}. Select which services to trace:` },
          { type: 'finding', severity: 'info', title: 'What you\'ll get', content: 'End-to-end request tracing, service dependency map with health status, latency breakdown per hop, and error correlation.' },
          { type: 'selectable' },
        ],
        selectableItems: items,
        followUps: ['Which services are most critical to trace first?', 'Will the rolling restart cause downtime?', `Can I trace only the ${appName} flow?`, 'Show me the CloudFormation template'],
      }
    })(),

    // ─── Install CW Agent ──────────────────────────────────────────
    'install-cw-agent': (() => {
      const agent = context.cwAgent || { notInstalled: [], summary: {} }
      const deployMethods = {
        'ECS Fargate': { method: 'Sidecar container', impact: 'Rolling restart', costPerUnit: 0.50 },
        'EKS': { method: 'DaemonSet', impact: 'DaemonSet rollout (~3 min)', costPerUnit: 2.00 },
        'EC2': { method: 'SSM Run Command', impact: 'No restart needed', costPerUnit: 0.30 },
      }
      const workloadConfigs = {
        'web-server': 'CPU, memory, disk, network, request count, active connections',
        'payment-processing': 'CPU, memory, disk, network, transaction latency, queue depth, error count',
        'trading-engine': 'CPU, memory, disk, network, order latency, throughput, position count',
        'auth': 'CPU, memory, login attempts, token generation rate, failed auth count',
        'worker': 'CPU, memory, queue depth, processing time, batch size',
        'analytics': 'CPU, memory, disk I/O, query duration, shuffle bytes',
        'compliance': 'CPU, memory, audit event count, scan duration, policy violations',
      }
      const items = agent.notInstalled.map(svc => {
        const dm = deployMethods[svc.type] || deployMethods['EC2']
        const wc = workloadConfigs[svc.workload] || 'CPU, memory, disk, network'
        const units = svc.tasks || svc.pods || 1
        return {
          id: `cwa-${svc.name}`,
          name: `${svc.name} — ${dm.method}`,
          description: `${svc.type} · ${units} ${svc.pods ? 'pods' : 'instances'} · ${dm.impact}`,
          cost: dm.costPerUnit,
          defaultOn: true,
          workload: svc.workload,
          config: wc,
        }
      })
      return {
        title: 'Install CloudWatch Agent',
        subtitle: `Deploy CW Agent on ${items.length} compute resources`,
        messages: [
          { type: 'text', content: `The CloudWatch Agent unlocks memory, disk, and custom metrics that aren't available by default. I've detected ${items.length} compute resources that need it.` },
          { type: 'finding', severity: 'info', title: 'What you\'ll get', content: 'Memory utilization, disk usage, network metrics, and custom application metrics. Required for Container Insights enhanced observability and Application Signals.' },
          { type: 'finding', severity: 'info', title: 'Pre-configured for your workloads', content: 'Each service gets a config template based on its detected workload type. You can customize after deployment.' },
          { type: 'selectable' },
        ],
        selectableItems: items,
        followUps: [
          'Show me the agent config for payment-processing workloads',
          'What metrics will each workload type collect?',
          'Can I customize the collection interval?',
          'Will this affect my running services?',
        ],
      }
    })(),

    // ─── Create Dashboards ──────────────────────────────────────────
    'create-dashboards': (() => {
      const svcNames = svcs.slice(0, 3).map(s => s.name).join(', ')
      const items = [
        { id: 'dash-overview', name: `${appName} — Overview`, description: `Health summary for ${svcs.length} services: alarms, errors, latency`, cost: 3.00, defaultOn: true },
        { id: 'dash-latency', name: `${appName} — Latency`, description: `p50/p95/p99 breakdown for ${svcNames}`, cost: 3.00, defaultOn: false },
        { id: 'dash-errors', name: `${appName} — Errors`, description: `Error rates, top errors, trends across ${svcs.length} services`, cost: 3.00, defaultOn: false },
      ]
      return {
        title: 'Create Dashboards',
        subtitle: `Recommended dashboards for ${appName}`,
        messages: [
          { type: 'text', content: `I can create custom dashboards for ${appName}. Each dashboard costs $3/month. Select which ones you need:` },
          { type: 'selectable' },
        ],
        selectableItems: items,
        followUps: ['What widgets will be on the overview dashboard?', 'Can I customize the layout later?', 'Show me a preview'],
      }
    })(),

    // ─── Clean Up Stale Alarms (savings) ────────────────────────────
    'cleanup-stale': (() => {
      const items = [
        { id: 'stale-1', name: 'legacy-auth-cpu-alarm — Orphaned', description: 'Resource was decommissioned 3 months ago', cost: -0.10, defaultOn: true },
        { id: 'stale-2', name: 'payment-5xx-rate-old — Outdated threshold', description: 'Threshold set to 10%, should be 1% based on current traffic', cost: -0.10, defaultOn: true },
        { id: 'stale-3', name: 'checkout-cpu-v2 — Duplicate', description: 'Same metric as checkout-cpu-alarm, created by different team', cost: -0.10, defaultOn: true },
        { id: 'stale-4', name: 'staging-db-connections — Wrong account', description: 'Staging alarm deployed to production account', cost: -0.10, defaultOn: true },
      ]
      return {
        title: 'Clean Up Stale Alarms',
        subtitle: 'Remove orphaned and misconfigured alarms',
        messages: [
          { type: 'text', content: 'I found alarms that are orphaned, duplicated, or misconfigured. Removing them reduces noise and saves costs.' },
          { type: 'finding', severity: 'warning', title: 'Stale alarms generate noise', content: 'These alarms fire on deleted resources or have outdated thresholds, masking real issues.' },
          { type: 'selectable' },
        ],
        selectableItems: items,
        followUps: ['Are there more stale alarms?', 'What if I need to recreate one?', 'Show me the full audit'],
      }
    })(),

    // ─── Optimize Log Classes (savings) ─────────────────────────────
    'optimize-logs': (() => {
      const loggingSvcs = svcs.filter(s => s.hasLogs)
      // Only offer optimization if there are services with significant log volume
      // Lambda auto-created log groups on free tier don't count
      const optimizable = loggingSvcs.filter(s => s.type !== 'Lambda')
      const items = optimizable.map(s => ({
        id: `logopt-${s.name}`, name: `${s.name} — Move to Infrequent Access`, description: 'Low query frequency, suitable for IA class', cost: -2.00, defaultOn: false,
      }))
      if (items.length === 0) {
        return {
          title: 'Optimize Log Classes',
          subtitle: 'No optimization opportunities found',
          messages: [
            { type: 'text', content: 'I checked your log groups but there\'s nothing to optimize right now. Your Lambda log groups are on free tier and have minimal volume.' },
            { type: 'finding', severity: 'info', title: 'No action needed', content: 'Once you enable logging on more services and have significant log volume, I\'ll identify opportunities to move low-query logs to Infrequent Access class.' },
          ],
          selectableItems: [],
          followUps: ['What is Infrequent Access class?', 'How much could I save later?'],
        }
      }
      return {
        title: 'Optimize Log Classes',
        subtitle: `${items.length} log groups can be optimized`,
        messages: [
          { type: 'text', content: 'Some log groups are rarely queried and could save costs on Infrequent Access class. Standard class is better for logs you actively monitor.' },
          { type: 'finding', severity: 'info', title: 'Infrequent Access saves ~60%', content: 'IA class costs $0.25/GB vs $0.50/GB for Standard. Query costs are higher but offset by lower ingestion costs for rarely-queried logs.' },
          { type: 'selectable' },
        ],
        selectableItems: items,
        followUps: ['Which logs do I query most?', 'Can I switch back to Standard later?', 'What about retention policies?'],
      }
    })(),

    // ─── Insight (analysis + specific action CTA) ─────────────────
    'insight': (() => {
      const label = context.label || context.title || 'Metric insight'
      const svcName = context.service || appName
      return {
        title: label,
        subtitle: `Analysis for ${svcName}`,
        messages: [
          { type: 'text', content: `I noticed something worth investigating on ${svcName}. Here's what I found:` },
          { type: 'chart', label: `${label} (24h)`, base: context.base || 65, variance: context.variance || 25, color: context.color || '#0ea5e9', unit: context.unit || '' },
          { type: 'steps', steps: [
            { action: `Analyzed ${label} trend`, result: 'Detected a pattern that deviates from the baseline', status: 'found' },
            { action: 'Checked correlated metrics', result: 'No matching deployment or config change', status: 'clear' },
            { action: 'Evaluated blast radius', result: svcName !== appName ? `Could affect downstream services dependent on ${svcName}` : 'Could affect availability if trend continues', status: 'found' },
          ]},
          { type: 'finding', severity: 'warning', title: 'Proactive action recommended', content: `This metric is trending in a direction that could become problematic. Consider creating an alarm for ${svcName} to catch it early.` },
          { type: 'actions' },
        ],
        followUps: [`Create an alarm for ${label}`, 'Show me the raw data', 'What could be causing this?', 'Compare with last week'],
      }
    })(),

    // ─── Non-selectable investigations (analysis only) ──────────────
    'error-rate': {
      title: 'Error Rate Investigation',
      subtitle: `Analyzing errors across ${appName}`,
      messages: [
        { type: 'text', content: 'I looked at error patterns across your services over the last 24 hours.' },
        { type: 'chart', label: 'Error rate trend (24h)', base: 0.8, variance: 1.5, color: '#f87171', unit: '%', threshold: 1, thresholdLabel: 'Alert threshold 1%' },
        { type: 'steps', steps: [
          { action: 'Checked deployment history', result: 'No deployments in the last 12 hours', status: 'clear' },
          { action: 'Analyzed error patterns', result: 'Errors are intermittent — likely transient network issues', status: 'clear' },
          { action: 'Reviewed error logs', result: 'Top error: ConnectionTimeout to external provider', status: 'found' },
        ]},
        { type: 'finding', severity: 'warning', title: 'Intermittent 3rd-party timeouts', content: 'Errors correlate with timeouts to an external dependency. Consider adding a circuit breaker.' },
        { type: 'actions' },
      ],
      followUps: ['Show me the error logs', 'Create a circuit breaker alarm', 'Compare with last week'],
    },

    'latency-waterfall': {
      title: 'Latency Analysis',
      subtitle: `End-to-end latency for ${appName}`,
      messages: [
        { type: 'text', content: 'I traced the request flow and measured latency at each hop.' },
        { type: 'chart', label: 'p99 latency trend (24h)', base: 180, variance: 60, color: '#8b5cf6', unit: 'ms', threshold: 500, thresholdLabel: 'SLA 500ms' },
        { type: 'finding', severity: 'info', title: 'Latency within SLA', content: 'p99 is 210ms, within the 500ms SLA. Brief spike to 480ms at 3:42 AM correlated with DB connection pool saturation.' },
      ],
      followUps: ['What caused the 3:42 AM spike?', 'Enable X-Ray tracing', 'Set up a latency SLO'],
    },

    'throughput': {
      title: 'Throughput Analysis',
      subtitle: context.label || 'Request throughput',
      messages: [
        { type: 'text', content: 'I analyzed your traffic patterns over the last 24 hours.' },
        { type: 'chart', label: 'Requests per minute (24h)', base: 5000, variance: 2000, color: '#0ea5e9', unit: ' req/min' },
        { type: 'finding', severity: 'info', title: 'Normal traffic pattern', content: 'Traffic follows a typical diurnal pattern. No anomalies detected.' },
      ],
      followUps: ['Set up anomaly detection', 'What was peak traffic this week?', 'Show me traffic by endpoint'],
    },

    'db-connections': {
      title: 'Database Connection Analysis',
      subtitle: context.service || 'Database health',
      messages: [
        { type: 'text', content: `I analyzed the connection pool for ${context.service || 'your database'}.` },
        { type: 'chart', label: 'Active connections (24h)', base: 24, variance: 8, color: '#22c55e', unit: ' conn', threshold: 80, thresholdLabel: 'Max 100' },
        { type: 'finding', severity: 'info', title: 'Connection pool healthy', content: 'Current utilization is 24%. If traffic doubles (~3 months at current growth), you may hit limits.' },
      ],
      followUps: ['Create a connection pool alarm', 'Show me slow queries', 'Project capacity needs'],
    },

    'model-latency': {
      title: 'ML Model Analysis',
      subtitle: context.label || 'Model performance',
      messages: [
        { type: 'text', content: 'I analyzed the inference performance of your ML model.' },
        { type: 'chart', label: 'Model latency p99 (24h)', base: 120, variance: 60, color: '#ec4899', unit: 'ms', threshold: 300, thresholdLabel: 'SLA 300ms' },
        { type: 'finding', severity: 'warning', title: 'Approaching SLA threshold', content: 'p99 at 290ms, SLA is 300ms. Trending upward — possible data drift.' },
        { type: 'actions' },
      ],
      followUps: ['Is there data drift?', 'Create a latency SLO', 'Compare with previous model version'],
    },

    'top-errors': {
      title: 'Error Investigation',
      subtitle: 'Recent errors across services',
      messages: [
        { type: 'text', content: 'I analyzed recent error patterns across your services.' },
        { type: 'steps', steps: [
          { action: 'Grouped errors by root cause', result: '3 distinct error patterns identified', status: 'found' },
          { action: 'Checked ConnectionTimeout errors', result: '12 occurrences — upstream dependency timeout', status: 'found' },
          { action: 'Checked ValidationError', result: '5 occurrences — missing field in partner API requests', status: 'found' },
        ]},
        { type: 'finding', severity: 'warning', title: 'ConnectionTimeout is the top issue', content: 'Upstream dependency responding slowly, causing cascading timeouts.' },
        { type: 'actions' },
      ],
      followUps: ['Show me the full error logs', 'Which upstream is timing out?', 'Create an alarm for this pattern'],
    },

    'cache-hit': {
      title: 'Cache Performance Analysis',
      subtitle: context.label || `ElastiCache health for ${appName}`,
      messages: [
        { type: 'text', content: `I analyzed the cache hit ratio and performance for ${appName}.` },
        { type: 'chart', label: 'Cache hit ratio (24h)', base: 94, variance: 4, color: '#facc15', unit: '%', threshold: 85, thresholdLabel: 'Min acceptable 85%' },
        { type: 'finding', severity: 'info', title: 'Cache hit ratio is healthy at 94%', content: 'Your cache is effectively reducing database load. A drop below 85% would indicate cache invalidation issues or a change in access patterns.' },
        { type: 'steps', steps: [
          { action: 'Checked eviction rate', result: 'Low evictions — cache size is adequate', status: 'clear' },
          { action: 'Analyzed key distribution', result: 'Hot keys are well-distributed across shards', status: 'clear' },
          { action: 'Checked memory utilization', result: 'Redis memory at 62% — healthy headroom', status: 'clear' },
        ]},
      ],
      followUps: ['What are the most frequently accessed keys?', 'Create an alarm for cache hit ratio', 'Show me eviction trends', 'Is my cache sized correctly?'],
    },

    'lambda-stats': {
      title: 'Lambda Function Analysis',
      subtitle: context.service || `Lambda health for ${appName}`,
      messages: [
        { type: 'text', content: `I analyzed the Lambda functions in ${appName} — invocations, errors, duration, and cold starts.` },
        { type: 'chart', label: 'Invocations (24h)', base: 3200, variance: 1500, color: '#0ea5e9', unit: ' inv/min' },
        { type: 'chart', label: 'Duration p99 (24h)', base: 450, variance: 200, color: '#8b5cf6', unit: 'ms', threshold: 10000, thresholdLabel: 'Timeout 10s' },
        { type: 'steps', steps: [
          { action: 'Checked error rate', result: 'Error rate 0.12% — within normal range', status: 'clear' },
          { action: 'Analyzed cold starts', result: '~8% of invocations are cold starts — consider provisioned concurrency if latency-sensitive', status: 'found' },
          { action: 'Checked throttling', result: 'No throttling events in the last 7 days', status: 'clear' },
          { action: 'Reviewed memory utilization', result: 'Average 68% of allocated memory — well-sized', status: 'clear' },
        ]},
        { type: 'finding', severity: 'info', title: 'Functions are healthy', content: 'No errors or throttling. Cold start rate of 8% is typical for on-demand invocations. Consider provisioned concurrency for latency-critical functions.' },
      ],
      followUps: ['Which functions have the most cold starts?', 'Should I enable provisioned concurrency?', 'Show me error logs', 'Create alarms for these functions'],
    },

    'dynamo-capacity': {
      title: 'DynamoDB Capacity Analysis',
      subtitle: context.service || `DynamoDB health for ${appName}`,
      messages: [
        { type: 'text', content: `I analyzed the read/write capacity and throttling for your DynamoDB tables in ${appName}.` },
        { type: 'chart', label: 'Consumed read capacity (24h)', base: 120, variance: 60, color: '#60a5fa', unit: ' RCU' },
        { type: 'chart', label: 'Consumed write capacity (24h)', base: 45, variance: 25, color: '#f59e0b', unit: ' WCU' },
        { type: 'steps', steps: [
          { action: 'Checked throttled requests', result: 'Zero throttled requests in the last 7 days', status: 'clear' },
          { action: 'Analyzed capacity mode', result: 'On-demand mode — auto-scales with traffic', status: 'clear' },
          { action: 'Checked hot partitions', result: 'No partition-level throttling detected', status: 'clear' },
        ]},
        { type: 'finding', severity: 'info', title: 'DynamoDB is healthy', content: 'No throttling, capacity is auto-scaling appropriately. Read/write patterns are consistent with expected traffic.' },
      ],
      followUps: ['Are there any hot partition keys?', 'Should I switch to provisioned capacity?', 'Show me the most expensive queries', 'Create a throttling alarm'],
    },

    'queue-depth': {
      title: 'Queue Depth Analysis',
      subtitle: context.service || `SQS health for ${appName}`,
      messages: [
        { type: 'text', content: `I analyzed the queue depth and message processing for ${appName}.` },
        { type: 'chart', label: 'Queue depth (24h)', base: 45, variance: 30, color: '#f97316', unit: ' msgs', threshold: 1000, thresholdLabel: 'Alert: 1000 msgs' },
        { type: 'steps', steps: [
          { action: 'Checked message age', result: 'Oldest message is 12 seconds — well within limits', status: 'clear' },
          { action: 'Analyzed consumer throughput', result: 'Consumers processing at 98% of incoming rate', status: 'clear' },
          { action: 'Checked dead letter queue', result: '3 messages in DLQ in the last 24 hours — investigate', status: 'found' },
        ]},
        { type: 'finding', severity: 'warning', title: '3 messages in dead letter queue', content: 'These messages failed processing after max retries. Could indicate a bug in the consumer or malformed messages from a producer.' },
        { type: 'actions' },
      ],
      followUps: ['Show me the DLQ messages', 'What caused the failures?', 'Create an alarm for queue depth', 'Is my consumer scaling correctly?'],
    },

    'resource-util': {
      title: 'Resource Utilization Analysis',
      subtitle: `Compute health for ${appName}`,
      messages: [
        { type: 'text', content: `I analyzed CPU and memory utilization across compute resources in ${appName}.` },
        { type: 'chart', label: 'CPU utilization (24h)', base: 42, variance: 18, color: '#0ea5e9', unit: '%', threshold: 90, thresholdLabel: 'Alert: 90%' },
        { type: 'chart', label: 'Memory utilization (24h)', base: 58, variance: 12, color: '#8b5cf6', unit: '%', threshold: 85, thresholdLabel: 'Alert: 85%' },
        { type: 'steps', steps: [
          { action: 'Checked peak utilization', result: 'CPU peaked at 67% during business hours — healthy headroom', status: 'clear' },
          { action: 'Analyzed memory trend', result: 'Memory slowly trending up (+2% over 7 days) — possible memory leak', status: 'found' },
          { action: 'Checked scaling events', result: 'No auto-scaling events triggered — current capacity is sufficient', status: 'clear' },
        ]},
        { type: 'finding', severity: 'warning', title: 'Memory trending upward', content: 'Memory utilization has increased 2% over the past week without a corresponding traffic increase. This could indicate a slow memory leak. Monitor closely.' },
      ],
      followUps: ['Which service has the memory leak?', 'Show me per-service breakdown', 'Create a memory alarm', 'Should I scale up?'],
    },

    'stream-lag': {
      title: 'Kinesis Stream Analysis',
      subtitle: context.label || `Stream health for ${appName}`,
      messages: [
        { type: 'text', content: `I analyzed the Kinesis stream performance and consumer lag for ${appName}.` },
        { type: 'chart', label: 'Iterator age (24h)', base: 800, variance: 600, color: '#f97316', unit: 'ms', threshold: 60000, thresholdLabel: 'Alert: 60s' },
        { type: 'steps', steps: [
          { action: 'Checked iterator age', result: 'Average 800ms — well within the 60s threshold', status: 'clear' },
          { action: 'Analyzed throughput', result: 'Incoming: 2,400 records/sec, Processing: 2,380 records/sec — keeping up', status: 'clear' },
          { action: 'Checked shard utilization', result: 'Shard 3 at 78% capacity — approaching limit', status: 'found' },
        ]},
        { type: 'finding', severity: 'warning', title: 'Shard 3 approaching capacity', content: 'One shard is at 78% throughput capacity. If traffic increases, you may need to split this shard or enable enhanced fan-out.' },
      ],
      followUps: ['Should I split the hot shard?', 'Enable enhanced fan-out', 'Show me per-shard metrics', 'Create a throughput alarm'],
    },

    'consumer-lag': {
      title: 'MSK Consumer Lag Analysis',
      subtitle: context.label || `Kafka health for ${appName}`,
      messages: [
        { type: 'text', content: `I analyzed the MSK consumer group lag and broker health for ${appName}.` },
        { type: 'chart', label: 'Consumer lag (24h)', base: 450, variance: 300, color: '#ef4444', unit: ' msgs', threshold: 1000, thresholdLabel: 'Alert: 1000 msgs' },
        { type: 'steps', steps: [
          { action: 'Checked consumer group lag', result: 'Average lag 450 messages — within acceptable range', status: 'clear' },
          { action: 'Analyzed broker disk usage', result: 'Broker 2 at 72% disk — monitor closely', status: 'found' },
          { action: 'Checked partition balance', result: 'Partitions are evenly distributed across brokers', status: 'clear' },
          { action: 'Reviewed consumer throughput', result: 'Consumers processing at 96% of production rate', status: 'clear' },
        ]},
        { type: 'finding', severity: 'warning', title: 'Broker disk usage at 72%', content: 'Broker 2 disk is filling up. At current ingestion rate, you have ~5 days before hitting 85%. Consider increasing retention cleanup or adding storage.' },
      ],
      followUps: ['Which topics have the most lag?', 'Should I add more consumers?', 'Show me broker health', 'Create a disk usage alarm'],
    },
  }

  return investigations[widgetType] || {
    title: 'Investigation',
    subtitle: 'Analyzing...',
    messages: [
      { type: 'text', content: 'I\'m analyzing this metric. Here\'s what I found so far.' },
      { type: 'finding', severity: 'info', title: 'No issues detected', content: 'All metrics are within normal ranges.' },
    ],
    followUps: ['Tell me more', 'Show me the raw data'],
  }
}
