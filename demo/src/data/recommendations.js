// Recommended observability items per AWS service type
// Used to generate the tree-select items in gap cards

const alarmsByType = {
  'API Gateway': [
    { id: 'alarm-5xx', name: '5xx Error Rate > 1%', metric: '5XXError', threshold: '1%' },
    { id: 'alarm-latency', name: 'Latency p99 > 1s', metric: 'Latency', threshold: '1000ms' },
    { id: 'alarm-count', name: 'Request count anomaly', metric: 'Count', threshold: 'Anomaly band' },
  ],
  'ECS Fargate': [
    { id: 'alarm-cpu', name: 'CPU > 90%', metric: 'CPUUtilization', threshold: '90%' },
    { id: 'alarm-mem', name: 'Memory > 85%', metric: 'MemoryUtilization', threshold: '85%' },
    { id: 'alarm-tasks', name: 'Running tasks < desired', metric: 'RunningTaskCount', threshold: 'Desired count' },
  ],
  'Lambda': [
    { id: 'alarm-errors', name: 'Error rate > 1%', metric: 'Errors', threshold: '1%' },
    { id: 'alarm-duration', name: 'Duration p99 > 10s', metric: 'Duration', threshold: '10000ms' },
    { id: 'alarm-throttles', name: 'Throttles > 0', metric: 'Throttles', threshold: '0' },
  ],
  'RDS PostgreSQL': [
    { id: 'alarm-cpu', name: 'CPU > 80%', metric: 'CPUUtilization', threshold: '80%' },
    { id: 'alarm-memory', name: 'Freeable memory < 500MB', metric: 'FreeableMemory', threshold: '500MB' },
    { id: 'alarm-latency', name: 'Read latency > 20ms', metric: 'ReadLatency', threshold: '20ms' },
  ],
  'Aurora PostgreSQL': [
    { id: 'alarm-cpu', name: 'CPU > 80%', metric: 'CPUUtilization', threshold: '80%' },
    { id: 'alarm-memory', name: 'Freeable memory < 1GB', metric: 'FreeableMemory', threshold: '1GB' },
    { id: 'alarm-replica-lag', name: 'Replica lag > 100ms', metric: 'AuroraReplicaLag', threshold: '100ms' },
    { id: 'alarm-deadlocks', name: 'Deadlocks > 0', metric: 'Deadlocks', threshold: '0' },
  ],
  'DynamoDB': [
    { id: 'alarm-throttle', name: 'Throttled requests > 0', metric: 'ThrottledRequests', threshold: '0' },
    { id: 'alarm-errors', name: 'System errors > 0', metric: 'SystemErrors', threshold: '0' },
  ],
  'ElastiCache Redis': [
    { id: 'alarm-cpu', name: 'CPU > 75%', metric: 'CPUUtilization', threshold: '75%' },
    { id: 'alarm-engine-cpu', name: 'Engine CPU > 80%', metric: 'EngineCPUUtilization', threshold: '80%' },
    { id: 'alarm-connections', name: 'Connections anomaly', metric: 'CurrConnections', threshold: 'Anomaly band' },
  ],
  'CloudFront': [
    { id: 'alarm-5xx', name: '5xx error rate > 1%', metric: '5xxErrorRate', threshold: '1%' },
    { id: 'alarm-origin-latency', name: 'Origin latency > 2s', metric: 'OriginLatency', threshold: '2000ms' },
  ],
  'SNS + SQS': [
    { id: 'alarm-publish', name: 'Publish count anomaly', metric: 'NumberOfMessagesPublished', threshold: 'Anomaly band' },
    { id: 'alarm-age', name: 'Message age > 300s', metric: 'ApproximateAgeOfOldestMessage', threshold: '300s' },
  ],
  'S3': [
    { id: 'alarm-4xx', name: '4xx error rate > 5%', metric: '4xxErrors', threshold: '5%' },
  ],
  'EKS': [
    { id: 'alarm-pod-restarts', name: 'Pod restart rate > 5/hr', metric: 'pod_restart_count', threshold: '5/hr' },
    { id: 'alarm-node-cpu', name: 'Node CPU > 85%', metric: 'node_cpu_utilization', threshold: '85%' },
    { id: 'alarm-node-mem', name: 'Node memory > 85%', metric: 'node_memory_utilization', threshold: '85%' },
    { id: 'alarm-pending-pods', name: 'Pending pods > 0', metric: 'pending_pods', threshold: '0' },
  ],
  'SageMaker': [
    { id: 'alarm-latency', name: 'Model latency p99 > 300ms', metric: 'ModelLatency', threshold: '300ms' },
    { id: 'alarm-5xx', name: 'Invocation 5xx > 0', metric: 'Invocation5XXErrors', threshold: '0' },
    { id: 'alarm-cpu', name: 'CPU > 80%', metric: 'CPUUtilization', threshold: '80%' },
  ],
  'Kinesis': [
    { id: 'alarm-iterator-age', name: 'Iterator age > 60s', metric: 'GetRecords.IteratorAgeMilliseconds', threshold: '60000ms' },
    { id: 'alarm-throughput', name: 'Read throughput exceeded', metric: 'ReadProvisionedThroughputExceeded', threshold: '0' },
  ],
  'MSK': [
    { id: 'alarm-consumer-lag', name: 'Consumer lag > 1000', metric: 'EstimatedMaxTimeLag', threshold: '1000' },
    { id: 'alarm-disk', name: 'Disk usage > 85%', metric: 'KafkaDataLogsDiskUsed', threshold: '85%' },
  ],
  'Bedrock Agent': [
    { id: 'alarm-latency', name: 'Invocation latency > 5s', metric: 'InvocationLatency', threshold: '5000ms' },
    { id: 'alarm-errors', name: 'Invocation errors > 0', metric: 'InvocationErrors', threshold: '0' },
  ],
}

const logsByType = {
  'API Gateway': [{ id: 'log-access', name: 'Access logs', description: 'Enable access logging to CloudWatch Logs' }],
  'ECS Fargate': [{ id: 'log-container', name: 'Container logs', description: 'Add awslogs log driver to task definition' }],
  'Lambda': [{ id: 'log-function', name: 'Function logs', description: 'Auto-created log group (already exists)' }],
  'RDS PostgreSQL': [
    { id: 'log-slow', name: 'Slow query log', description: 'Enable slow query log export' },
    { id: 'log-error', name: 'Error log', description: 'Enable error log export' },
  ],
  'Aurora PostgreSQL': [
    { id: 'log-slow', name: 'Slow query log', description: 'Enable slow query log export' },
    { id: 'log-audit', name: 'Audit log', description: 'Enable pgAudit for compliance' },
  ],
  'CloudFront': [{ id: 'log-access', name: 'Access logs', description: 'Enable standard logging to S3 + CloudWatch' }],
  'DynamoDB': [{ id: 'log-cloudtrail', name: 'CloudTrail data events', description: 'Enable read/write tracking' }],
  'ElastiCache Redis': [{ id: 'log-slow', name: 'Slow log', description: 'Enable slow log to CloudWatch Logs' }],
  'EKS': [{ id: 'log-pods', name: 'Pod logs', description: 'Deploy Fluent Bit DaemonSet for pod log collection' }],
  'SageMaker': [{ id: 'log-inference', name: 'Inference logs', description: 'Enable endpoint inference logging' }],
}

const tracesByType = {
  'API Gateway': [{ id: 'trace-xray', name: 'X-Ray tracing', description: 'Enable X-Ray tracing on stage' }],
  'ECS Fargate': [{ id: 'trace-xray', name: 'X-Ray sidecar', description: 'Add X-Ray daemon sidecar container' }],
  'Lambda': [{ id: 'trace-active', name: 'Active tracing', description: 'Enable active tracing (config toggle)' }],
  'EKS': [{ id: 'trace-adot', name: 'ADOT collector', description: 'Deploy ADOT collector for distributed tracing' }],
  'SageMaker': [{ id: 'trace-inference', name: 'Inference tracing', description: 'Enable inference request tracing' }],
}

export function getRecommendedItems(serviceName, serviceType, category) {
  const map = category === 'alarms' ? alarmsByType : category === 'logs' ? logsByType : tracesByType
  const items = map[serviceType] || []
  return items.map(item => ({
    ...item,
    id: `${serviceName}--${item.id}`,
    service: serviceName,
  }))
}

export function getAllRecommendedItems(services, category) {
  return services.flatMap(svc => {
    if (category === 'logs' && svc.hasLogs) return []
    if (category === 'traces' && svc.hasTraces) return []
    if (category === 'alarms' && svc.hasAlarms) return []
    return getRecommendedItems(svc.name, svc.type, category)
  })
}
