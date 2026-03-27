// ── Derive status from baseline deviation ──
// Returns 'degraded' | 'warning' | 'healthy' based on how far current metrics deviate from baseline
export function getDeviationStatus(node) {
  if (!node.baseline) return node.status
  const latRatio = node.latency / Math.max(node.baseline.latency, 1)
  const errRatio = node.errorRate / Math.max(node.baseline.errorRate, 0.01)
  const maxRatio = Math.max(latRatio, errRatio)
  if (maxRatio >= 2.5) return 'degraded'
  if (maxRatio >= 1.8) return 'warning'
  return 'healthy'
}

// ── ~20 Application nodes — curated set ──

export const nodes = [
  // ── Frontend ──
  { id: 'customer-portal',      label: 'Customer Portal',       x: 0.20, y: 0.05, status: 'healthy',  requests: 890000, latency: 112, errorRate: 0.18, tier: 'frontend',  cloud: 'aws',    baseline: { latency: 108, errorRate: 0.15, requests: 860000 }, team: 'frontend-experience', businessUnit: 'commerce', env: 'production' },
  { id: 'mobile-app',           label: 'Mobile App',            x: 0.50, y: 0.05, status: 'healthy',  requests: 620000, latency: 135, errorRate: 0.22, tier: 'frontend',  cloud: 'aws',    baseline: { latency: 130, errorRate: 0.20, requests: 600000 }, team: 'frontend-experience', businessUnit: 'commerce', env: 'production' },
  { id: 'partner-portal',       label: 'Partner Portal',        x: 0.80, y: 0.05, status: 'healthy',  requests: 145000, latency: 98,  errorRate: 0.10, tier: 'frontend',  cloud: 'azure',  baseline: { latency: 95,  errorRate: 0.09, requests: 140000 }, team: 'partnerships', businessUnit: 'commerce', env: 'production' },

  // ── Business ──
  { id: 'order-management',     label: 'Order Management',      x: 0.10, y: 0.25, status: 'degraded', requests: 245000, latency: 289, errorRate: 2.1,  tier: 'business',  cloud: 'aws',    baseline: { latency: 95,  errorRate: 0.09, requests: 240000 }, team: 'checkout', businessUnit: 'commerce', env: 'production' },
  { id: 'inventory-system',     label: 'Inventory System',      x: 0.30, y: 0.25, status: 'healthy',  requests: 134000, latency: 67,  errorRate: 0.09, tier: 'business',  cloud: 'aws',    baseline: { latency: 65,  errorRate: 0.08, requests: 130000 }, team: 'checkout', businessUnit: 'commerce', env: 'production' },
  { id: 'payments-app',         label: 'Payments',              x: 0.50, y: 0.25, status: 'warning',  requests: 67000,  latency: 198, errorRate: 1.4,  tier: 'business',  cloud: 'azure',  baseline: { latency: 90,  errorRate: 0.65, requests: 68000  }, team: 'checkout', businessUnit: 'commerce', env: 'production' },
  { id: 'shipping-tracker',     label: 'Shipping Tracker',      x: 0.70, y: 0.25, status: 'healthy',  requests: 98000,  latency: 85,  errorRate: 0.12, tier: 'business',  cloud: 'aws',    baseline: { latency: 82,  errorRate: 0.10, requests: 95000  }, team: 'checkout', businessUnit: 'commerce', env: 'production' },
  { id: 'catalog-svc',          label: 'Product Catalog',       x: 0.90, y: 0.25, status: 'healthy',  requests: 310000, latency: 42,  errorRate: 0.03, tier: 'business',  cloud: 'aws',    baseline: { latency: 40,  errorRate: 0.03, requests: 300000 }, team: 'discovery', businessUnit: 'commerce', env: 'production' },
  { id: 'loyalty-program',      label: 'Loyalty Program',       x: 0.10, y: 0.42, status: 'warning',  requests: 48000,  latency: 165, errorRate: 0.85, tier: 'business',  cloud: 'gcp',    baseline: { latency: 75,  errorRate: 0.40, requests: 12000  }, team: 'growth', businessUnit: 'marketing', env: 'production' },
  { id: 'search-app',           label: 'Search',                x: 0.30, y: 0.42, status: 'healthy',  requests: 220000, latency: 68,  errorRate: 0.08, tier: 'business',  cloud: 'aws',    baseline: { latency: 65,  errorRate: 0.07, requests: 210000 }, team: 'discovery', businessUnit: 'commerce', env: 'production' },
  { id: 'recommendations',      label: 'Recommendations',       x: 0.50, y: 0.42, status: 'healthy',  requests: 185000, latency: 120, errorRate: 0.18, tier: 'business',  cloud: 'gcp',    baseline: { latency: 115, errorRate: 0.15, requests: 180000 }, team: 'discovery', businessUnit: 'commerce', env: 'production' },
  { id: 'fraud-detection',      label: 'Fraud Detection',       x: 0.70, y: 0.42, status: 'healthy',  requests: 67000,  latency: 88,  errorRate: 0.09, tier: 'business',  cloud: 'aws',    baseline: { latency: 85,  errorRate: 0.08, requests: 65000  }, team: 'trust-safety', businessUnit: 'commerce', env: 'production' },
  { id: 'crm',                  label: 'CRM',                   x: 0.90, y: 0.42, status: 'healthy',  requests: 98000,  latency: 78,  errorRate: 0.12, tier: 'business',  cloud: 'azure',  baseline: { latency: 75,  errorRate: 0.10, requests: 95000  }, team: 'growth', businessUnit: 'marketing', env: 'production' },

  // ── Platform ──
  { id: 'api-gateway',          label: 'API Gateway',           x: 0.20, y: 0.62, status: 'healthy',  requests: 1200000,latency: 18,  errorRate: 0.02, tier: 'platform',  cloud: 'aws',    baseline: { latency: 17,  errorRate: 0.02, requests: 1150000}, team: 'platform-infra', businessUnit: 'platform', env: 'production' },
  { id: 'identity-provider',    label: 'Identity Provider',     x: 0.40, y: 0.62, status: 'healthy',  requests: 182000, latency: 42,  errorRate: 0.04, tier: 'platform',  cloud: 'azure',  baseline: { latency: 180, errorRate: 0.04, requests: 175000 }, team: 'platform-infra', businessUnit: 'platform', env: 'production' },
  { id: 'notification-hub',     label: 'Notification Hub',      x: 0.60, y: 0.62, status: 'healthy',  requests: 410000, latency: 34,  errorRate: 0.03, tier: 'platform',  cloud: 'aws',    baseline: { latency: 32,  errorRate: 0.03, requests: 400000 }, team: 'platform-infra', businessUnit: 'platform', env: 'production' },
  { id: 'data-pipeline',        label: 'Data Pipeline',         x: 0.80, y: 0.62, status: 'healthy',  requests: 580000, latency: 8,   errorRate: 0.01, tier: 'platform',  cloud: 'gcp',    baseline: { latency: 8,   errorRate: 0.01, requests: 570000 }, team: 'data-eng', businessUnit: 'platform', env: 'production' },

  // ── Internal ──
  { id: 'analytics-platform',   label: 'Analytics Platform',    x: 0.20, y: 0.82, status: 'healthy',  requests: 320000, latency: 45,  errorRate: 0.05, tier: 'internal',  cloud: 'gcp',    baseline: { latency: 44,  errorRate: 0.05, requests: 310000 }, team: 'data-eng', businessUnit: 'platform', env: 'production' },
  { id: 'cdn-platform',         label: 'CDN Platform',          x: 0.50, y: 0.82, status: 'healthy',  requests: 3200000,latency: 15,  errorRate: 0.01, tier: 'internal',  cloud: 'aws',    baseline: { latency: 14,  errorRate: 0.01, requests: 3100000}, team: 'platform-infra', businessUnit: 'platform', env: 'production' },
  { id: 'devops-dashboard',     label: 'DevOps Dashboard',      x: 0.80, y: 0.82, status: 'healthy',  requests: 8500,   latency: 120, errorRate: 0.15, tier: 'internal',  cloud: 'on-prem',baseline: { latency: 118, errorRate: 0.14, requests: 8200   }, team: 'devops', businessUnit: 'engineering', env: 'production' },

  // ── Standalone apps (no edges) ──
  { id: 'feature-flags',        label: 'Feature Flags',         x: 0.15, y: 0.72, status: 'healthy',  requests: 42000,  latency: 12,  errorRate: 0.01, tier: 'platform',  cloud: 'aws',    baseline: { latency: 11,  errorRate: 0.01, requests: 40000  }, team: 'platform-infra', businessUnit: 'platform', env: 'production' },
  { id: 'config-service',       label: 'Config Service',        x: 0.35, y: 0.72, status: 'healthy',  requests: 28000,  latency: 8,   errorRate: 0.02, tier: 'platform',  cloud: 'aws',    baseline: { latency: 8,   errorRate: 0.02, requests: 27000  }, team: 'platform-infra', businessUnit: 'platform', env: 'production' },
  { id: 'ab-testing',           label: 'A/B Testing',           x: 0.55, y: 0.72, status: 'healthy',  requests: 95000,  latency: 22,  errorRate: 0.03, tier: 'platform',  cloud: 'gcp',    baseline: { latency: 20,  errorRate: 0.03, requests: 90000  }, team: 'growth', businessUnit: 'marketing', env: 'production' },
  { id: 'audit-log',            label: 'Audit Log',             x: 0.75, y: 0.72, status: 'healthy',  requests: 180000, latency: 5,   errorRate: 0.00, tier: 'platform',  cloud: 'aws',    baseline: { latency: 5,   errorRate: 0.00, requests: 175000 }, team: 'trust-safety', businessUnit: 'platform', env: 'production' },
  { id: 'email-service',        label: 'Email Service',         x: 0.10, y: 0.92, status: 'healthy',  requests: 52000,  latency: 340, errorRate: 0.08, tier: 'internal',  cloud: 'aws',    baseline: { latency: 330, errorRate: 0.07, requests: 50000  }, team: 'growth', businessUnit: 'marketing', env: 'production' },
  { id: 'scheduler',            label: 'Job Scheduler',         x: 0.35, y: 0.92, status: 'healthy',  requests: 15000,  latency: 45,  errorRate: 0.04, tier: 'internal',  cloud: 'aws',    baseline: { latency: 42,  errorRate: 0.04, requests: 14500  }, team: 'platform-infra', businessUnit: 'platform', env: 'production' },
  { id: 'secrets-vault',        label: 'Secrets Vault',         x: 0.55, y: 0.92, status: 'healthy',  requests: 62000,  latency: 3,   errorRate: 0.00, tier: 'internal',  cloud: 'on-prem',baseline: { latency: 3,   errorRate: 0.00, requests: 60000  }, team: 'devops', businessUnit: 'engineering', env: 'production' },
  { id: 'status-page',          label: 'Status Page',           x: 0.75, y: 0.92, status: 'healthy',  requests: 4200,   latency: 65,  errorRate: 0.02, tier: 'internal',  cloud: 'aws',    baseline: { latency: 62,  errorRate: 0.02, requests: 4000   }, team: 'devops', businessUnit: 'engineering', env: 'production' },
]

// ── Edges: connections between the curated apps ──
export const edges = [
  { from: 'customer-portal', to: 'order-management',   rps: 5800, status: 'degraded', errorRate: 2.8,  latency: 245 },
  { from: 'customer-portal', to: 'inventory-system',   rps: 1800, status: 'healthy',  errorRate: 0.12, latency: 58  },
  { from: 'customer-portal', to: 'identity-provider',  rps: 4500, status: 'healthy',  errorRate: 0.05, latency: 38  },
  { from: 'customer-portal', to: 'search-app',         rps: 2200, status: 'healthy',  errorRate: 0.09, latency: 62  },
  { from: 'mobile-app', to: 'api-gateway',             rps: 9400, status: 'healthy',  errorRate: 0.03, latency: 22  },
  { from: 'partner-portal', to: 'api-gateway',         rps: 1400, status: 'healthy',  errorRate: 0.04, latency: 25  },
  { from: 'partner-portal', to: 'identity-provider',   rps: 900,  status: 'healthy',  errorRate: 0.05, latency: 35  },
  { from: 'order-management', to: 'payments-app',      rps: 900,  status: 'warning',  errorRate: 1.8,  latency: 210 },
  { from: 'order-management', to: 'inventory-system',  rps: 1400, status: 'healthy',  errorRate: 0.08, latency: 52  },
  { from: 'order-management', to: 'shipping-tracker',  rps: 800,  status: 'healthy',  errorRate: 0.10, latency: 65  },
  { from: 'order-management', to: 'data-pipeline',     rps: 2200, status: 'healthy',  errorRate: 0.02, latency: 10  },
  { from: 'payments-app', to: 'notification-hub',      rps: 400,  status: 'healthy',  errorRate: 0.06, latency: 30  },
  { from: 'payments-app', to: 'fraud-detection',       rps: 900,  status: 'healthy',  errorRate: 0.08, latency: 72  },
  { from: 'loyalty-program', to: 'crm',                rps: 480,  status: 'healthy',  errorRate: 0.15, latency: 55  },
  { from: 'search-app', to: 'catalog-svc',             rps: 2200, status: 'healthy',  errorRate: 0.04, latency: 35  },
  { from: 'recommendations', to: 'catalog-svc',        rps: 1500, status: 'healthy',  errorRate: 0.06, latency: 48  },
  { from: 'data-pipeline', to: 'analytics-platform',   rps: 8500, status: 'healthy',  errorRate: 0.01, latency: 8   },
  { from: 'devops-dashboard', to: 'analytics-platform', rps: 200, status: 'healthy',  errorRate: 0.02, latency: 42  },
]

// ── Build grouped aggregate data ──
// groupKey: 'team' | 'businessUnit' | 'env'
export function buildGroupedData(groupKey) {
  const groups = {}
  nodes.forEach(n => {
    const key = n[groupKey] || 'unknown'
    if (!groups[key]) groups[key] = { members: [], totalRequests: 0, maxLatency: 0, maxErrorRate: 0, worstStatus: 'healthy' }
    const g = groups[key]
    g.members.push(n)
    g.totalRequests += n.requests
    g.maxLatency = Math.max(g.maxLatency, n.latency)
    g.maxErrorRate = Math.max(g.maxErrorRate, n.errorRate)
    const s = getDeviationStatus(n)
    if (s === 'degraded') g.worstStatus = 'degraded'
    else if (s === 'warning' && g.worstStatus !== 'degraded') g.worstStatus = 'warning'
  })

  const groupIds = Object.keys(groups)
  const groupNodes = groupIds.map((key, i) => {
    const g = groups[key]
    const cols = groupIds.length
    return {
      id: key,
      label: key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      x: (i + 0.5) / cols,
      y: 0.5,
      status: g.worstStatus,
      requests: g.totalRequests,
      latency: g.maxLatency,
      errorRate: g.maxErrorRate,
      tier: 'business',
      memberIds: g.members.map(m => m.id),
      baseline: {
        latency: Math.max(...g.members.map(m => m.baseline?.latency || 0)),
        errorRate: Math.max(...g.members.map(m => m.baseline?.errorRate || 0)),
        requests: g.members.reduce((s, m) => s + (m.baseline?.requests || 0), 0),
      },
    }
  })

  const nodeToGroup = {}
  nodes.forEach(n => { nodeToGroup[n.id] = n[groupKey] || 'unknown' })
  const edgeMap = {}
  edges.forEach(e => {
    const fg = nodeToGroup[e.from], tg = nodeToGroup[e.to]
    if (fg === tg) return
    const k = `${fg}->${tg}`
    if (!edgeMap[k]) edgeMap[k] = { from: fg, to: tg, rps: 0, worstStatus: 'healthy', totalErr: 0, totalLat: 0, count: 0 }
    edgeMap[k].rps += e.rps
    edgeMap[k].totalErr += (e.errorRate || 0) * e.rps
    edgeMap[k].totalLat += (e.latency || 0) * e.rps
    edgeMap[k].count += 1
    if (e.status === 'degraded') edgeMap[k].worstStatus = 'degraded'
    else if (e.status === 'warning' && edgeMap[k].worstStatus !== 'degraded') edgeMap[k].worstStatus = 'warning'
  })
  const groupEdges = Object.values(edgeMap).map(e => ({
    from: e.from, to: e.to, rps: e.rps, status: e.worstStatus,
    errorRate: e.rps > 0 ? +(e.totalErr / e.rps).toFixed(2) : 0,
    latency: e.rps > 0 ? Math.round(e.totalLat / e.rps) : 0,
  }))

  const groupInsights = insights.map(ins => ({
    ...ins,
    relatedNodes: [...new Set((ins.relatedNodes || []).map(id => nodeToGroup[id]).filter(Boolean))],
    relatedEdges: [],
  }))

  return { nodes: groupNodes, edges: groupEdges, insights: groupInsights }
}

// ── Layer data generators for Applications page ──
// Each layer generates nodes + edges for a different abstraction level

const SERVICE_NAMES = [
  'auth-svc','user-svc','cart-svc','checkout-svc','pricing-svc','tax-svc','discount-svc',
  'product-svc','review-svc','rating-svc','wishlist-svc','compare-svc','browse-svc',
  'order-svc','fulfillment-svc','returns-svc','refund-svc','invoice-svc','receipt-svc',
  'payment-svc','wallet-svc','subscription-svc','billing-svc','ledger-svc',
  'shipping-svc','tracking-svc','warehouse-svc','logistics-svc','delivery-svc',
  'search-svc','autocomplete-svc','indexer-svc','ranking-svc','filter-svc',
  'recommendation-svc','personalization-svc','ml-inference-svc','feature-store-svc',
  'notification-svc','email-svc','sms-svc','push-svc','template-svc',
  'analytics-svc','event-collector-svc','aggregator-svc','reporting-svc','dashboard-svc',
  'fraud-svc','risk-svc','compliance-svc','audit-svc','kyc-svc',
  'loyalty-svc','points-svc','rewards-svc','tier-svc','campaign-svc',
  'crm-svc','contact-svc','ticket-svc','feedback-svc','survey-svc',
  'identity-svc','session-svc','token-svc','permission-svc','role-svc',
  'gateway-svc','rate-limiter-svc','circuit-breaker-svc','load-balancer-svc',
  'config-svc','feature-flag-svc','secrets-svc','vault-svc',
  'cache-svc','cdn-svc','asset-svc','media-svc','image-svc',
  'queue-svc','stream-svc','pubsub-svc','scheduler-svc','cron-svc',
  'monitor-svc','health-svc','alerting-svc','incident-svc','pager-svc',
  'deploy-svc','pipeline-svc','build-svc','artifact-svc','registry-svc',
  'data-lake-svc','etl-svc','transform-svc','catalog-data-svc','schema-svc',
  'partner-svc','integration-svc','webhook-svc','api-adapter-svc','sync-svc',
  'geo-svc','location-svc','map-svc','timezone-svc',
  'ab-test-svc','experiment-svc','metrics-svc','telemetry-svc',
  'backup-svc','archive-svc','snapshot-svc','recovery-svc',
  'dns-svc','cert-svc','proxy-svc','mesh-svc','service-discovery-svc',
  'chat-svc','support-svc','bot-svc','knowledge-svc',
]

const PROCESS_NAMES = [
  'nginx-proxy','envoy-sidecar','node-api','java-api','python-worker','go-gateway',
  'redis-cache','memcached','postgres-primary','postgres-replica','mysql-primary',
  'kafka-broker','rabbitmq','celery-worker','sidekiq-worker','resque-worker',
  'elasticsearch','kibana','logstash','fluentd','prometheus','grafana',
  'consul-agent','vault-agent','nomad-client','docker-daemon','containerd',
  'etcd','zookeeper','haproxy','traefik','caddy',
  'cron-scheduler','batch-processor','stream-consumer','event-handler',
  'ml-serving','tensorflow-serving','onnx-runtime','feature-compute',
  'cert-manager','dns-resolver','ntp-sync','log-shipper',
  'health-checker','circuit-breaker','rate-limiter','auth-proxy',
  'backup-agent','snapshot-daemon','replication-agent','sync-worker',
]

const INFRA_NAMES = [
  'k8s-node-1','k8s-node-2','k8s-node-3','k8s-node-4','k8s-node-5',
  'k8s-node-6','k8s-node-7','k8s-node-8',
  'rds-primary','rds-replica-1','rds-replica-2',
  'elasticache-1','elasticache-2','elasticache-3',
  'kafka-broker-1','kafka-broker-2','kafka-broker-3',
  'elb-external','elb-internal','nlb-grpc',
  'nat-gateway-1','nat-gateway-2',
  's3-data','s3-logs','s3-backups',
  'cloudfront-dist','route53-zone',
  'vpc-main','subnet-public-1','subnet-private-1','subnet-private-2',
  'efs-shared','ebs-vol-1',
]

function seededRandom(seed) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export function buildLayerData(layer) {
  if (layer === 'applications') return { nodes, edges, insights }

  const rand = seededRandom(layer === 'services' ? 42 : layer === 'processes' ? 137 : 271)
  const names = layer === 'services' ? SERVICE_NAMES.slice(0, 122)
    : layer === 'processes' ? PROCESS_NAMES.slice(0, 48)
    : INFRA_NAMES.slice(0, 33)

  const tiers = layer === 'services'
    ? ['frontend', 'business', 'business', 'business', 'platform', 'internal']
    : layer === 'processes'
    ? ['business', 'business', 'platform', 'platform', 'internal']
    : ['platform', 'platform', 'platform', 'internal', 'internal']

  const clouds = ['aws', 'aws', 'aws', 'azure', 'gcp', 'on-prem']
  const statuses = ['healthy','healthy','healthy','healthy','healthy','healthy','healthy','healthy','warning','degraded']

  const layerNodes = names.map((name, i) => {
    const tier = tiers[Math.floor(rand() * tiers.length)]
    const status = statuses[Math.floor(rand() * statuses.length)]
    const requests = Math.floor(rand() * 500000) + 5000
    const latency = Math.floor(rand() * 300) + 5
    const errorRate = +(rand() * (status === 'degraded' ? 5 : status === 'warning' ? 2 : 0.5)).toFixed(2)
    return {
      id: name,
      label: name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      x: rand(), y: rand(),
      status, requests, latency, errorRate, tier,
      cloud: clouds[Math.floor(rand() * clouds.length)],
      baseline: { latency: Math.floor(latency * 0.6), errorRate: +(errorRate * 0.3).toFixed(2), requests: Math.floor(requests * 0.95) },
      team: 'auto', businessUnit: 'auto', env: 'production',
    }
  })

  const layerEdges = []
  const nodeCount = layerNodes.length
  const edgeCount = Math.floor(nodeCount * 1.3)
  for (let i = 0; i < edgeCount; i++) {
    const from = layerNodes[Math.floor(rand() * nodeCount)]
    const to = layerNodes[Math.floor(rand() * nodeCount)]
    if (from.id === to.id) continue
    if (layerEdges.some(e => e.from === from.id && e.to === to.id)) continue
    const rps = Math.floor(rand() * 8000) + 100
    const worst = from.status === 'degraded' || to.status === 'degraded' ? 'degraded'
      : from.status === 'warning' || to.status === 'warning' ? 'warning' : 'healthy'
    layerEdges.push({
      from: from.id, to: to.id, rps,
      status: rand() > 0.7 ? worst : 'healthy',
      errorRate: +(rand() * 2).toFixed(2),
      latency: Math.floor(rand() * 200) + 5,
    })
  }

  // Generate some insights for this layer
  const unhealthy = layerNodes.filter(n => n.status !== 'healthy')
  const layerInsights = unhealthy.slice(0, 5).map((n, i) => ({
    id: 1000 + i,
    severity: n.status === 'degraded' ? 'critical' : 'high',
    title: `${n.label} ${n.status === 'degraded' ? 'latency spike' : 'elevated error rate'}`,
    summary: `${n.label} showing ${n.status} status at ${layer} layer.`,
    relatedNodes: [n.id],
    relatedEdges: [],
    time: `${Math.floor(rand() * 30) + 5} min ago`,
  }))

  return { nodes: layerNodes, edges: layerEdges, insights: layerInsights }
}

// ── Layer health summary (for pill indicators) ──
export function getLayerHealth(layer) {
  const data = layer === 'applications'
    ? { nodes, insights }
    : buildLayerData(layer)
  const degraded = data.nodes.filter(n => n.status === 'degraded').length
  const warning = data.nodes.filter(n => n.status === 'warning').length
  if (degraded > 0) return 'degraded'
  if (warning > 0) return 'warning'
  return 'healthy'
}

// ── Agent insights ──
export const insights = [
  {
    id: 1,
    severity: 'critical',
    title: 'Order Management latency spike',
    summary: 'p95 at 289ms (3x baseline) on AWS. Schema migration correlated. Rollback recommended.',
    relatedNodes: ['order-management', 'payments-app'],
    relatedEdges: [{ from: 'order-management', to: 'payments-app' }],
    time: '18 min ago',
    details: {
      metrics: [
        { label: 'p95 Latency', current: '289ms', baseline: '95ms', delta: '+204%', unit: 'ms',
          spark: [92,95,94,91,93,95,94,98,105,185,245,278,289], color: '#f87171' },
        { label: 'Error Rate', current: '2.1%', baseline: '0.09%', delta: '+2233%', unit: '%',
          spark: [0.08,0.09,0.10,0.09,0.11,0.15,0.28,0.55,0.9,1.4,1.8,2.0,2.1], color: '#f87171' },
        { label: 'DB Query Time', current: '180ms', baseline: '22ms', delta: '+718%', unit: 'ms',
          spark: [20,22,21,23,22,24,35,68,120,155,170,178,180], color: '#fb923c' },
        { label: 'Failed Orders/min', current: '142', baseline: '3', delta: '+4633%', unit: 'count',
          spark: [3,2,4,3,5,8,18,42,78,110,130,138,142], color: '#fb923c' },
      ],
      rootCause: 'Schema migration v4.7 added an index on the orders table without using CONCURRENTLY. The exclusive lock is causing query queuing under production load.',
      impact: 'Affecting 245K requests/min. 142 failed orders per minute. Payments app experiencing elevated timeouts on order verification calls.',
      impactStats: [
        { value: '245K', label: 'requests impacted' },
        { value: '142', label: 'failed orders/min' },
      ],
    },
  },
  {
    id: 2,
    severity: 'medium',
    title: 'Payments app timeout rate climbing',
    summary: 'Timeout rate 1.4% on Azure, trending up. Cross-cloud cascading from Order Management (AWS).',
    relatedNodes: ['payments-app', 'order-management'],
    relatedEdges: [{ from: 'order-management', to: 'payments-app' }],
    time: '14 min ago',
    action: 'Increase timeout threshold',
    details: {
      metrics: [
        { label: 'Timeout Rate', current: '1.4%', baseline: '0.05%', delta: '+2700%', unit: '%',
          spark: [0.04,0.05,0.05,0.06,0.08,0.15,0.35,0.6,0.85,1.1,1.25,1.35,1.4], color: '#fb923c' },
        { label: 'Avg Response', current: '198ms', baseline: '65ms', delta: '+205%', unit: 'ms',
          spark: [62,65,64,68,72,85,110,140,165,180,190,195,198], color: '#fb923c' },
        { label: 'Queue Depth', current: '2.8K', baseline: '120', delta: '+2233%', unit: 'count',
          spark: [120,115,125,140,200,450,800,1400,1900,2300,2600,2750,2800], color: '#fbbf24' },
        { label: 'Success Rate', current: '98.6%', baseline: '99.95%', delta: '-1.4%', unit: '%',
          spark: [99.95,99.94,99.93,99.90,99.85,99.70,99.40,99.10,98.90,98.75,98.65,98.62,98.60], color: '#f87171' },
      ],
      timeline: [
        { time: '18 min ago', event: 'Order Management latency spike began' },
        { time: '14 min ago', event: 'Payment processing timeouts exceeded 1%' },
        { time: '10 min ago', event: 'Agent identified upstream dependency as cause' },
      ],
      rootCause: 'Cascading failure from Order Management (AWS). Cross-cloud payment verification calls to the orders API are timing out due to the schema migration lock contention upstream.',
      impact: 'Affecting 67K payment requests/min on Azure. Revenue impact estimated at $4.2K/min in failed transactions.',
      impactStats: [
        { value: '67K', label: 'payment requests/min' },
        { value: '$4.2K', label: 'revenue loss/min' },
      ],
    },
  },
  {
    id: 3,
    severity: 'medium',
    title: 'Loyalty Program response time elevated',
    summary: 'p95 at 165ms on GCP, up from 60ms. Heavy load from double-points promotion.',
    relatedNodes: ['loyalty-program'],
    relatedEdges: [],
    time: '35 min ago',
    action: null,
    details: {
      metrics: [
        { label: 'p95 Latency', current: '165ms', baseline: '60ms', delta: '+175%', unit: 'ms',
          spark: [58,60,62,65,72,88,105,125,140,152,160,163,165], color: '#fbbf24' },
        { label: 'Points Calc/s', current: '4.8K', baseline: '1.2K', delta: '+300%', unit: 'count',
          spark: [1.2,1.2,1.3,1.8,2.5,3.2,3.8,4.1,4.4,4.6,4.7,4.8,4.8], color: '#fbbf24' },
        { label: 'CPU Usage', current: '82%', baseline: '45%', delta: '+82%', unit: '%',
          spark: [45,44,46,52,60,68,74,78,80,81,82,82,82], color: '#fb923c' },
        { label: 'Error Rate', current: '0.85%', baseline: '0.08%', delta: '+962%', unit: '%',
          spark: [0.08,0.08,0.09,0.12,0.18,0.30,0.45,0.58,0.68,0.75,0.80,0.83,0.85], color: '#fb923c' },
      ],
      timeline: [
        { time: '2h ago', event: 'Double-points promotion activated' },
        { time: '35 min ago', event: 'Latency crossed 150ms threshold' },
        { time: '20 min ago', event: 'Agent determined promotion load as cause' },
      ],
      rootCause: 'Double-points promotion is generating 4x normal points calculation volume. The service is CPU-bound but stable. Will self-resolve when promotion ends.',
      impact: 'Loyalty points display may be delayed by 1-2s. No impact on order flow or other applications.',
      impactStats: [
        { value: '1-2s', label: 'points display delay' },
        { value: '4.8K', label: 'calc/s (4x normal)' },
      ],
    },
  },
  {
    id: 4,
    severity: 'info',
    title: 'Customer Portal traffic shift detected',
    summary: 'EU traffic up 22%. CDN cache hit 97.1% in eu-west-1.',
    relatedNodes: ['customer-portal', 'cdn-platform'],
    relatedEdges: [],
    time: '2h ago',
    action: null,
    details: {
      metrics: [
        { label: 'EU Traffic Share', current: '38%', baseline: '31%', delta: '+22%', unit: '%',
          spark: [31,32,33,34,35,36,37,37.5,38], color: '#22d3ee' },
        { label: 'CDN Hit Ratio', current: '97.1%', baseline: '95.2%', delta: '+2%', unit: '%',
          spark: [95.2,95.5,95.8,96.1,96.4,96.6,96.8,97.0,97.1], color: '#34d399' },
        { label: 'EU p95 Latency', current: '98ms', baseline: '115ms', delta: '-15%', unit: 'ms',
          spark: [115,112,110,108,105,103,100,99,98], color: '#34d399' },
        { label: 'Total Sessions', current: '42K', baseline: '34K', delta: '+24%', unit: 'K',
          spark: [34,35,36,37,38,39,40,41,42], color: '#22d3ee' },
      ],
      timeline: [
        { time: '7d ago', event: 'EU traffic began gradual increase' },
        { time: '3d ago', event: 'EU share crossed 35% for the first time' },
        { time: '2h ago', event: 'Agent flagged sustained pattern shift' },
      ],
      rootCause: 'Organic growth in EU user base following DACH region product launch.',
      impact: 'Positive trend. Consider adding eu-central-1 origin for lower latency if growth continues.',
      impactStats: [
        { value: '+22%', label: 'EU traffic growth' },
        { value: '97.1%', label: 'CDN cache hit' },
      ],
    },
  },
  {
    id: 5,
    severity: 'info',
    title: 'Identity Provider auth latency improved',
    summary: 'Connection pooling approach dropped p99 from 180ms to 42ms.',
    relatedNodes: ['identity-provider'],
    relatedEdges: [],
    time: '3h ago',
    action: null,
    details: {
      metrics: [
        { label: 'Token Issuance p99', current: '42ms', baseline: '180ms', delta: '-77%', unit: 'ms',
          spark: [180,175,160,85,55,48,44,42], color: '#22d3ee' },
        { label: 'Auth Success Rate', current: '99.96%', baseline: '99.82%', delta: '+0.14%', unit: '%',
          spark: [99.82,99.84,99.88,99.90,99.92,99.94,99.95,99.96], color: '#34d399' },
        { label: 'Pool Utilization', current: '62%', baseline: 'n/a', delta: 'new', unit: '%',
          spark: [0,0,0,58,60,61,62,62], color: '#22d3ee' },
        { label: 'Active Sessions', current: '18.2K', baseline: '16.8K', delta: '+8%', unit: 'K',
          spark: [16.8,17.0,17.2,17.4,17.6,17.8,18.0,18.2], color: '#34d399' },
      ],
      timeline: [
        { time: '7d ago', event: 'Connection pooling enabled on auth DB' },
        { time: '5d ago', event: 'Token issuance p99 stabilized below 50ms' },
        { time: '3h ago', event: 'Agent confirmed improvement is sustained' },
      ],
      rootCause: 'Connection pooling eliminated per-request DB connection overhead.',
      impact: 'Positive. Login latency improved across Customer Portal, CRM, and HR Portal.',
      impactStats: [
        { value: '-77%', label: 'auth latency reduction' },
        { value: '99.96%', label: 'auth success rate' },
      ],
    },
  },
]
