// Mock incident data for the 2AM flow demo
export const incident = {
  id: 'INC-2847',
  severity: 'critical',
  title: 'order-service is timing out',
  summary: 'ECS tasks on order-service-east-2 are hitting memory limits and getting killed. 3 downstream services are degraded.',
  timestamp: '2:03 AM',

  brief: {
    hypothesis: 'ECS tasks on order-service-east-2 hit memory limits. Tasks are being killed and restarting in a loop. ~2,400 failed orders in the last 10 minutes. No deploys in 6h.',
    confidence: 'high',
    rootCauseType: 'ECS memory exhaustion',
  },

  services: [
    { name: 'order-service', status: 'critical', region: 'east-2', latency: '2,400ms', baseline: '200ms' },
    { name: 'inventory-service', status: 'degraded', region: 'east-2', latency: '1,800ms', baseline: '150ms' },
    { name: 'shipping-service', status: 'degraded', region: 'east-1', latency: '900ms', baseline: '120ms' },
    { name: 'billing-service', status: 'degraded', region: 'east-1', latency: '600ms', baseline: '80ms' },
    { name: 'user-service', status: 'healthy', region: 'east-1', latency: '45ms', baseline: '40ms' },
    { name: 'notification-service', status: 'healthy', region: 'west-1', latency: '30ms', baseline: '25ms' },
    { name: 'search-service', status: 'healthy', region: 'west-1', latency: '55ms', baseline: '50ms' },
  ],

  timeline: [
    { time: '1:47 AM', event: 'Memory usage on order-service-east-2 crosses 90%', type: 'signal' },
    { time: '1:52 AM', event: 'First ECS task OOM-killed, replacement task starts', type: 'signal' },
    { time: '1:55 AM', event: 'Second task OOM-killed — restart loop begins', type: 'alert' },
    { time: '1:58 AM', event: 'p99 latency crosses 1,000ms', type: 'signal' },
    { time: '2:01 AM', event: 'Inventory, shipping, and billing services start degrading', type: 'signal' },
    { time: '2:03 AM', event: 'Critical alert fired', type: 'alert' },
  ],

  reasoning: [
    { step: 1, action: 'Checked recent deployments', result: 'None in last 6 hours — not a bad deploy', status: 'clear' },
    { step: 2, action: 'Checked incoming traffic', result: 'Normal levels — not a traffic spike', status: 'clear' },
    { step: 3, action: 'Checked ECS task metrics', result: 'Memory at 98%, tasks OOM-killed 6 times since 1:52am', status: 'found' },
    { step: 4, action: 'Checked task definition', result: 'Memory limit set to 512MB — likely too low for current workload', status: 'found' },
    { step: 5, action: 'Mapped downstream impact', result: '3 services degraded via dependency chain from order-service', status: 'found' },
  ],

  suggestedQueries: [
    {
      label: 'ECS task memory over time',
      query: 'SELECT AVG(MemoryUtilization)\nFROM ECS/ContainerInsights\nWHERE ServiceName = "order-service"\nGROUP BY TaskId\nORDER BY time DESC',
    },
    {
      label: 'OOM kill events',
      query: 'fields @timestamp, @message\n| filter @message like /OOM/\n| filter service = "order-service-east-2"\n| sort @timestamp desc\n| limit 50',
    },
    {
      label: 'Downstream error rates',
      query: 'fields @timestamp, service, status_code\n| filter status_code >= 500\n| filter service in ["inventory-service", "shipping-service", "billing-service"]\n| stats count() by service, bin(5m)',
    },
  ],

  remediations: [
    { id: 'restart', label: 'Restart ECS tasks with more memory', description: 'Recycles order service tasks one at a time with 1GB memory (up from 512MB). No downtime.', risk: 'low' },
    { id: 'scale', label: 'Scale out order service', description: 'Adds 2 more tasks to spread the load across more instances.', risk: 'low' },
    { id: 'rollback', label: 'Rollback task definition', description: 'Reverts to the previous task definition from 3 days ago.', risk: 'medium' },
  ],

  logSnapshot: {
    query: 'fields @timestamp, @message | filter @message like /OutOfMemory|OOM|killed/ | filter service = "order-service-east-2" | sort @timestamp desc | limit 8',
    queryTime: '1.2s',
    logGroup: '/ecs/order-service-east-2',
    lines: [
      { ts: '2:03:12', level: 'ERROR', msg: 'Container killed: OutOfMemoryError — memory limit 512MB exceeded (current: 511MB)' },
      { ts: '2:02:48', level: 'ERROR', msg: 'Container killed: OutOfMemoryError — memory limit 512MB exceeded (current: 509MB)' },
      { ts: '2:01:15', level: 'WARN',  msg: 'Memory usage 98% (502MB/512MB) — approaching limit' },
      { ts: '1:58:33', level: 'ERROR', msg: 'Container killed: OutOfMemoryError — memory limit 512MB exceeded (current: 512MB)' },
      { ts: '1:55:02', level: 'ERROR', msg: 'Container killed: OutOfMemoryError — memory limit 512MB exceeded (current: 510MB)' },
      { ts: '1:52:41', level: 'WARN',  msg: 'Memory usage 95% (486MB/512MB) — approaching limit' },
      { ts: '1:52:18', level: 'ERROR', msg: 'Container killed: OutOfMemoryError — memory limit 512MB exceeded (current: 511MB)' },
      { ts: '1:47:05', level: 'WARN',  msg: 'Memory usage 90% (461MB/512MB) — threshold crossed' },
    ],
  },
}
