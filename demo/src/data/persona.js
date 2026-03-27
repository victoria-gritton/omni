// Day 0 Homepage — User persona and application profile
// TRUE DAY 0: First time opening CloudWatch Omni. No alarms, no dashboards,
// no traces, no SLOs configured. The agent just scanned the account and
// discovered raw AWS resources with only default auto-collected metrics.

export const persona = {
  user: {
    name: 'Maria Chen',
    role: 'Senior SRE',
    team: 'Platform Engineering',
    company: 'NovaMart',
    email: 'mchen@novamart.io',
    avatar: null,
    timezone: 'America/New_York',
    lastLogin: null,
  },

  // Demo-only metadata — shown in the persona card overlay
  demo: {
    observabilityMaturity: 'Beginner',
    observabilityDetail: 'First time using CloudWatch beyond basic console checks. No prior alarm, dashboard, or tracing setup.',
    spendingCohort: 'Mid-tier',
    monthlyAWSSpend: '~$18,000/mo',
    cloudWatchSpend: '$0 (default free tier only)',
    teamSize: 5,
    oncallRotation: true,
    incidentTooling: 'PagerDuty (not yet integrated with CloudWatch)',
    goals: [
      'Get visibility into production health without manual log diving',
      'Reduce MTTR — currently ~45 min to diagnose issues',
      'Set up proactive alerting before customers notice problems',
    ],
    awsServiceBreakdown: {
      compute: '6 ECS Fargate services (22 tasks), 2 Lambda functions',
      data: '2 RDS PostgreSQL (Multi-AZ), 1 DynamoDB, 1 ElastiCache Redis',
      networking: '1 API Gateway, 1 CloudFront, 1 S3',
      messaging: '1 SNS/SQS event bus',
    },
  },

  application: {
    name: 'NovaMart Platform',
    description: 'E-commerce platform serving ~2M monthly active users across NA and EU',
    environments: ['production', 'staging', 'dev'],
    regions: ['us-east-1', 'us-east-2', 'eu-west-1'],
    accounts: [
      { id: '111222333444', name: 'novamart-prod', env: 'production' },
      { id: '555666777888', name: 'novamart-staging', env: 'staging' },
    ],
  },

  services: [
    { name: 'api-gateway', type: 'API Gateway', aws: 'Amazon API Gateway', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, requests: '~14M/day' },
    { name: 'user-service', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, tasks: 4 },
    { name: 'checkout-service', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'us-east-2', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, tasks: 6 },
    { name: 'payment-service', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'us-east-2', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, tasks: 4 },
    { name: 'order-service', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, tasks: 3 },
    { name: 'inventory-service', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, tasks: 2 },
    { name: 'notification-service', type: 'Lambda', aws: 'AWS Lambda', region: 'us-west-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: true, hasTraces: false, invocations: '~80K/day' },
    { name: 'search-service', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'us-west-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, tasks: 3 },
    { name: 'orders-db', type: 'RDS PostgreSQL', aws: 'Amazon RDS', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, instance: 'db.r6g.xlarge', multiAZ: true },
    { name: 'users-db', type: 'RDS PostgreSQL', aws: 'Amazon RDS', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, instance: 'db.r6g.large', multiAZ: true },
    { name: 'session-cache', type: 'ElastiCache Redis', aws: 'Amazon ElastiCache', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, nodes: 2 },
    { name: 'product-catalog', type: 'DynamoDB', aws: 'Amazon DynamoDB', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false },
    { name: 'event-bus', type: 'SNS + SQS', aws: 'Amazon SNS / SQS', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false },
    { name: 'cdn', type: 'CloudFront', aws: 'Amazon CloudFront', region: 'global', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false },
    { name: 'image-processor', type: 'Lambda', aws: 'AWS Lambda', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: true, hasTraces: false, invocations: '~12K/day' },
    { name: 'static-assets', type: 'S3', aws: 'Amazon S3', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false },
  ],

  coverage: {
    totalServices: 16,
    withMetrics: 16,
    withAlarms: 0,
    withDashboards: 0,
    withLogs: 2,
    withTraces: 0,
  },

  // ─── TIERED SETUP ───────────────────────────────────────────────
  // Tier 1: Zero user input needed. Agent applies smart defaults.
  // Tier 2: Lightweight confirmation (toggle). Touches running infra.
  // Tier 3: Needs real user decisions. Queued as "next steps."

  setup: {
    // The big CTA summary
    summary: {
      headline: 'I can set up monitoring for all 16 services',
      subtext: 'Based on what I found, here\'s my recommended plan. The basics take about 2 minutes — I\'ll handle everything.',
    },

    tier1: {
      label: 'CloudWatch-only — no infrastructure changes',
      description: 'These create alarms, dashboards, and detection models inside CloudWatch. Your running services are not touched.',
      badge: 'Metadata only',
      badgeTooltip: 'These actions only create CloudWatch resources (alarms, dashboards, models). Your running services, task definitions, and infrastructure are not modified.',
      items: [
        {
          id: 't1-alarms',
          title: 'Create 42 recommended alarms',
          description: 'CPU > 90%, memory > 85%, 5xx errors > 1%, p99 latency thresholds per service type',
          icon: 'bell',
          viewLabel: 'View alarms',
          viewPath: '/console',
          detailsPerResource: true,
          details: [
            { service: 'ECS services (6)', alarms: 'CPUUtilization > 90%, MemoryUtilization > 85%, RunningTaskCount < desired' },
            { service: 'Lambda functions (2)', alarms: 'Errors > 1%, Duration p99 > 10s, Throttles > 0' },
            { service: 'RDS databases (2)', alarms: 'CPUUtilization > 80%, FreeableMemory < 500MB, ReadLatency > 20ms' },
            { service: 'API Gateway', alarms: '5XXError > 1%, Latency p99 > 1s, Count anomaly band' },
            { service: 'DynamoDB', alarms: 'ThrottledRequests > 0, SystemErrors > 0' },
            { service: 'ElastiCache', alarms: 'CPUUtilization > 75%, EngineCPUUtilization > 80%, CurrConnections anomaly' },
            { service: 'CloudFront', alarms: '5xxErrorRate > 1%, OriginLatency > 2s' },
            { service: 'SNS/SQS', alarms: 'NumberOfMessagesPublished anomaly, ApproximateAgeOfOldestMessage > 300s' },
          ],
        },
        {
          id: 't1-dashboard',
          title: 'Generate production dashboard',
          description: 'Overview with health, latency, errors, and throughput for all services',
          icon: 'chart',
          viewLabel: 'View dashboard',
          viewPath: '/home',
          details: [
            { section: 'Top row', widgets: 'Service health summary, active alarms count, error rate trend' },
            { section: 'Compute', widgets: 'ECS CPU/memory per service, Lambda invocations/errors/duration' },
            { section: 'Data', widgets: 'RDS connections/latency, DynamoDB read/write capacity, ElastiCache hit rate' },
            { section: 'Traffic', widgets: 'API Gateway requests/latency/errors, CloudFront cache hit ratio' },
          ],
        },
        {
          id: 't1-anomaly',
          title: 'Enable anomaly detection',
          description: 'Using 14 days of existing metric history to establish baselines',
          icon: 'wave',
          viewLabel: 'View detectors',
          viewPath: '/home',
          details: [
            { metric: 'API Gateway request count', reason: 'Detect traffic spikes or drops' },
            { metric: 'ECS CPU/memory per service', reason: 'Catch resource exhaustion early' },
            { metric: 'RDS read/write latency', reason: 'Database performance degradation' },
            { metric: 'Lambda duration', reason: 'Cold start or dependency slowdowns' },
            { metric: 'SQS message age', reason: 'Queue backup / consumer lag' },
          ],
        },
        {
          id: 't1-logclass',
          title: 'Optimize Lambda log classes',
          description: 'Move notification-service logs to Infrequent Access (low volume, saves ~$12/mo)',
          icon: 'archive',
          viewLabel: 'View log groups',
          viewPath: '/home',
          details: [
            { logGroup: '/aws/lambda/notification-service', currentClass: 'Standard', recommended: 'Infrequent Access', reason: 'Low query frequency, ~80K invocations/day' },
            { logGroup: '/aws/lambda/image-processor', currentClass: 'Standard', recommended: 'Keep Standard', reason: 'May need real-time debugging for image failures' },
          ],
        },
      ],
    },

    tier2: {
      label: 'Infrastructure changes — needs your OK',
      description: 'These modify your running services (sidecars, task definitions, parameter groups). May cause rolling restarts.',
      badge: 'Modifies infrastructure',
      badgeTooltip: 'These actions update your running AWS resources — ECS task definitions, RDS parameter groups, API Gateway stages. Some may trigger rolling restarts or redeployments.',
      items: [
        {
          id: 't2-cw-agent',
          title: 'Deploy CloudWatch Agent on ECS services',
          description: 'Adds memory, disk, and custom metrics. Deploys as a sidecar — triggers rolling restart.',
          impact: 'Rolling restart of 6 ECS services (~22 tasks). ~5 min total. Zero-downtime rolling update. Reversible by removing the sidecar.',
          defaultOn: true,
          icon: 'cpu',
          viewLabel: 'View agents',
          viewPath: '/home',
          detailsPerResource: true,
          details: [
            { service: 'user-service (4 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
            { service: 'checkout-service (6 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
            { service: 'payment-service (4 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
            { service: 'order-service (3 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
            { service: 'inventory-service (2 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
            { service: 'search-service (3 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
          ],
        },
        {
          id: 't2-logs',
          title: 'Enable log delivery for 14 services',
          description: 'API Gateway access logs, RDS slow query logs, ECS container logs, CloudFront access logs.',
          impact: 'API GW, RDS, CloudFront: config update only, no restarts. ECS services: rolling redeploy (~5 min). All reversible.',
          defaultOn: true,
          icon: 'file',
          viewLabel: 'View logs',
          viewPath: '/home',
          detailsPerResource: true,
          details: [
            { service: 'API Gateway', action: 'Enable access logging to CloudWatch Logs (no restart)' },
            { service: '6 ECS services', action: 'Add awslogs log driver to task definitions (rolling redeploy)' },
            { service: '2 RDS databases', action: 'Enable slow query log + error log export (parameter group update)' },
            { service: 'CloudFront', action: 'Enable standard logging to S3 + CloudWatch (no restart)' },
            { service: 'DynamoDB', action: 'Enable CloudTrail data events for read/write tracking' },
            { service: 'ElastiCache', action: 'Enable slow log to CloudWatch Logs' },
          ],
        },
        {
          id: 't2-traces',
          title: 'Enable X-Ray tracing',
          description: 'Adds X-Ray sidecar to ECS tasks and enables tracing on API Gateway.',
          impact: 'ECS: rolling restart to add X-Ray sidecar (~5 min, zero downtime). API GW: config update, no restart. Lambda: config toggle, instant. Reversible.',
          defaultOn: true,
          icon: 'path',
          viewLabel: 'View traces',
          viewPath: '/home',
          detailsPerResource: true,
          details: [
            { service: 'API Gateway', action: 'Enable X-Ray tracing on stage (config update, no downtime)' },
            { service: '6 ECS services', action: 'Add X-Ray daemon sidecar container (rolling redeploy)' },
            { service: '2 Lambda functions', action: 'Enable active tracing (config update, no cold start impact)' },
          ],
        },
        {
          id: 't2-container-insights',
          title: 'Enable Container Insights',
          description: 'Cluster-level and task-level metrics for all ECS services.',
          impact: 'Cluster setting update only — no task restarts, no downtime. Takes effect immediately. Reversible.',
          defaultOn: true,
          icon: 'container',
          viewLabel: 'View insights',
          viewPath: '/home',
          detailsPerResource: true,
          details: [
            { cluster: 'novamart-east-1', services: 4, action: 'Enable containerInsights account setting' },
            { cluster: 'novamart-east-2', services: 2, action: 'Enable containerInsights account setting' },
            { cluster: 'novamart-west-1', services: 1, action: 'Enable containerInsights account setting' },
          ],
        },
        {
          id: 't2-app-signals',
          title: 'Enable Application Signals',
          description: 'APM-level visibility: service map, latency breakdown, error tracking.',
          impact: 'Rolling restart of ECS services to update CW Agent config (~5 min, zero downtime). Adds ~10-15% memory overhead per task. Reversible.',
          defaultOn: false,
          icon: 'signal',
          viewLabel: 'View service map',
          viewPath: '/home',
          details: [
            { what: 'Auto-instrumentation', action: 'Adds OpenTelemetry auto-instrumentation to ECS tasks via CW Agent' },
            { what: 'Service map', action: 'Generates real-time dependency map from trace data' },
            { what: 'SLO-ready', action: 'Once enabled, you can define SLOs on discovered service operations' },
          ],
        },
      ],
    },

    tier3: {
      label: 'Business decisions — needs your input',
      description: 'These require choices the agent can\'t infer from your infrastructure — targets, routing, and org structure.',
      badge: 'Your call',
      badgeTooltip: 'These require business decisions the agent can\'t infer from your infrastructure — like SLO targets, alert routing destinations, or cross-account permissions.',
      items: [
        {
          id: 't3-slos',
          title: 'Define Service Level Objectives',
          question: 'What availability target for your critical path? (e.g., 99.9%, 99.95%)',
          suggestion: 'Based on your traffic patterns, I\'d recommend 99.9% availability and p99 latency < 500ms for the checkout flow.',
          icon: 'target',
        },
        {
          id: 't3-alerts',
          title: 'Configure alert routing',
          question: 'Where should critical alarms go? SNS topic, Slack, PagerDuty, or email?',
          suggestion: 'I can create an SNS topic now and you can add integrations later.',
          icon: 'route',
        },
        {
          id: 't3-cross-account',
          title: 'Set up cross-account observability',
          question: 'Want to link your staging account (novamart-staging) for unified monitoring?',
          suggestion: 'I\'ll generate a CloudFormation template for both accounts. Someone with admin access will need to deploy it.',
          icon: 'link',
        },
      ],
    },
  },

  agentActivity: [
    { time: 'Just now', action: 'Scanned 2 accounts, discovered 16 services across 3 regions' },
    { time: 'Just now', action: 'Mapped service dependencies: api-gateway → checkout → payment → orders-db' },
    { time: 'Just now', action: 'Found 0 alarms, 0 dashboards, 0 traces configured' },
    { time: 'Just now', action: 'Analyzed 14 days of default metrics to establish baselines' },
    { time: 'Just now', action: 'Generated setup plan — waiting for your go-ahead' },
  ],
}
