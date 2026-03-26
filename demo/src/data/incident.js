// Mock incident data for the 2AM flow demo
export const incident = {
  id: 'INC-2847',
  severity: 'critical',
  title: 'Payment service p99 latency 12x baseline',
  summary: 'Payment service is 12x slower than normal. 3 other services are affected. Nothing was deployed recently.',
  timestamp: '2:03 AM',
  acknowledgedAt: null,

  // AI-generated brief (phone view)
  brief: {
    hypothesis: 'Connection pool exhaustion on payment-service-east-2',
    details: 'Memory pressure spike detected at 1:47am. No deployment in last 6 hours. Upstream traffic is normal.',
    confidence: 'high',
    rootCauseType: 'infrastructure',
  },

  // Blast radius
  services: [
    { name: 'payment-service', status: 'critical', region: 'east-2', latency: '2,400ms', baseline: '200ms' },
    { name: 'checkout-service', status: 'degraded', region: 'east-2', latency: '1,800ms', baseline: '150ms' },
    { name: 'order-service', status: 'degraded', region: 'east-1', latency: '900ms', baseline: '120ms' },
    { name: 'inventory-service', status: 'degraded', region: 'east-1', latency: '600ms', baseline: '80ms' },
    { name: 'user-service', status: 'healthy', region: 'east-1', latency: '45ms', baseline: '40ms' },
    { name: 'notification-service', status: 'healthy', region: 'west-1', latency: '30ms', baseline: '25ms' },
    { name: 'search-service', status: 'healthy', region: 'west-1', latency: '55ms', baseline: '50ms' },
  ],

  // Timeline
  timeline: [
    { time: '1:47 AM', event: 'Memory pressure spike on payment-service-east-2', type: 'signal' },
    { time: '1:52 AM', event: 'Connection pool utilization hits 95%', type: 'signal' },
    { time: '1:58 AM', event: 'p99 latency crosses 1,000ms threshold', type: 'alert' },
    { time: '2:01 AM', event: 'Downstream services begin degrading', type: 'signal' },
    { time: '2:03 AM', event: 'Critical alert fired — PagerDuty notified', type: 'alert' },
  ],

  // AI reasoning steps
  reasoning: [
    { step: 1, action: 'Checked recent deployments', result: 'None in last 6 hours', status: 'clear' },
    { step: 2, action: 'Analyzed traffic patterns', result: 'Upstream traffic normal — not a load spike', status: 'clear' },
    { step: 3, action: 'Correlated memory metrics', result: 'Memory pressure spike at 1:47am on payment-service-east-2', status: 'found' },
    { step: 4, action: 'Checked connection pool metrics', result: 'Pool utilization at 98%, max connections reached', status: 'found' },
    { step: 5, action: 'Mapped downstream impact', result: '3 services degraded via dependency chain', status: 'found' },
  ],

  // Suggested queries (console view)
  suggestedQueries: [
    {
      label: 'Connection pool metrics',
      query: 'SELECT avg(pool_active), max(pool_active), avg(pool_idle)\nFROM payment_service_metrics\nWHERE time > now() - 2h\nGROUP BY time(1m)',
    },
    {
      label: 'Memory pressure timeline',
      query: 'fields @timestamp, memory_used_percent, gc_pause_ms\n| filter service = "payment-service-east-2"\n| sort @timestamp desc\n| limit 200',
    },
    {
      label: 'Error rate by endpoint',
      query: 'fields @timestamp, endpoint, status_code\n| filter service = "payment-service" AND status_code >= 500\n| stats count() by endpoint, bin(5m)',
    },
  ],

  // Remediation options
  remediations: [
    { id: 'pool-fix', label: 'Run connection pool remediation playbook', description: 'Restarts connection pool, increases max connections from 50 to 100', risk: 'low' },
    { id: 'rollback', label: 'Rollback last config change', description: 'Reverts config deployed 18 hours ago (pool timeout reduction)', risk: 'medium' },
    { id: 'restart', label: 'Rolling restart payment-service-east-2', description: 'Graceful restart of all instances in the region', risk: 'medium' },
  ],
}
