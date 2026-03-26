// Mock incident data for the 2AM flow demo
export const incident = {
  id: 'INC-2847',
  severity: 'critical',
  title: 'Payment service 12× slower',
  summary: 'ECS tasks on payment-service-east-2 are hitting memory limits and getting killed. 3 downstream services are degraded.',
  timestamp: '2:03 AM',

  // AI-generated brief
  brief: {
    hypothesis: 'ECS tasks on payment-service-east-2 hit memory limits. Tasks are OOM-killed and restarting in a loop. No deploys in 6h. Traffic normal.',
    confidence: 'high',
    rootCauseType: 'ECS memory exhaustion',
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
    { time: '1:47 AM', event: 'Memory usage on payment-service-east-2 crosses 90%', type: 'signal' },
    { time: '1:52 AM', event: 'First ECS task OOM-killed, replacement task starts', type: 'signal' },
    { time: '1:55 AM', event: 'Second task OOM-killed — restart loop begins', type: 'alert' },
    { time: '1:58 AM', event: 'p99 latency crosses 1,000ms', type: 'signal' },
    { time: '2:01 AM', event: 'Checkout, order, and inventory services start degrading', type: 'signal' },
    { time: '2:03 AM', event: 'Critical alert fired', type: 'alert' },
  ],

  // AI reasoning steps
  reasoning: [
    { step: 1, action: 'Checked recent deployments', result: 'None in last 6 hours — not a bad deploy', status: 'clear' },
    { step: 2, action: 'Checked incoming traffic', result: 'Normal levels — not a traffic spike', status: 'clear' },
    { step: 3, action: 'Checked ECS task metrics', result: 'Memory at 98%, tasks OOM-killed 6 times since 1:52am', status: 'found' },
    { step: 4, action: 'Checked task definition', result: 'Memory limit set to 512MB — likely too low for current workload', status: 'found' },
    { step: 5, action: 'Mapped downstream impact', result: '3 services degraded via dependency chain from payment-service', status: 'found' },
  ],

  // Suggested queries (console view)
  suggestedQueries: [
    {
      label: 'ECS task memory over time',
      query: 'SELECT AVG(MemoryUtilization)\nFROM ECS/ContainerInsights\nWHERE ServiceName = "payment-service"\nGROUP BY TaskId\nORDER BY time DESC',
    },
    {
      label: 'OOM kill events',
      query: 'fields @timestamp, @message\n| filter @message like /OOM/\n| filter service = "payment-service-east-2"\n| sort @timestamp desc\n| limit 50',
    },
    {
      label: 'Downstream error rates',
      query: 'fields @timestamp, service, status_code\n| filter status_code >= 500\n| filter service in ["checkout-service", "order-service", "inventory-service"]\n| stats count() by service, bin(5m)',
    },
  ],

  // Remediation options
  remediations: [
    { id: 'restart', label: 'Restart ECS tasks with more memory', description: 'Recycles payment service tasks one at a time with 1GB memory (up from 512MB). No downtime.', risk: 'low' },
    { id: 'scale', label: 'Scale out payment service', description: 'Adds 2 more tasks to spread the load across more instances.', risk: 'low' },
    { id: 'rollback', label: 'Rollback task definition', description: 'Reverts to the previous task definition from 3 days ago.', risk: 'medium' },
  ],
}
