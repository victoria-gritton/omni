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
      label: 'Instant setup — no input needed',
      description: 'I\'ll apply smart defaults based on your service types. You can customize later.',
      items: [
        {
          id: 't1-alarms',
          title: 'Create 42 recommended alarms',
          description: 'CPU > 90%, memory > 85%, 5xx errors > 1%, p99 latency thresholds per service type',
          detail: '16 services × ~2-3 alarms each',
          icon: 'bell',
        },
        {
          id: 't1-dashboard',
          title: 'Generate production dashboard',
          description: 'Overview with health, latency, errors, and throughput for all services',
          icon: 'chart',
        },
        {
          id: 't1-anomaly',
          title: 'Enable anomaly detection',
          description: 'Using 14 days of existing metric history to establish baselines',
          icon: 'wave',
        },
        {
          id: 't1-logclass',
          title: 'Optimize Lambda log classes',
          description: 'Move notification-service logs to Infrequent Access (low volume, saves ~$12/mo)',
          icon: 'archive',
        },
      ],
    },

    tier2: {
      label: 'Recommended — needs your OK',
      description: 'These touch running infrastructure. I\'ll handle the config, but want your go-ahead first.',
      items: [
        {
          id: 't2-cw-agent',
          title: 'Deploy CloudWatch Agent on ECS services',
          description: 'Adds memory, disk, and custom metrics. Deploys as a sidecar — triggers rolling restart.',
          impact: 'Rolling restart of 6 ECS services (~22 tasks)',
          defaultOn: true,
          icon: 'cpu',
        },
        {
          id: 't2-logs',
          title: 'Enable log delivery for 14 services',
          description: 'API Gateway access logs, RDS slow query logs, ECS container logs, CloudFront access logs.',
          impact: 'Updates service configurations. No restarts for API GW, RDS, CloudFront. ECS needs task redeploy.',
          defaultOn: true,
          icon: 'file',
        },
        {
          id: 't2-traces',
          title: 'Enable X-Ray tracing',
          description: 'Adds X-Ray sidecar to ECS tasks and enables tracing on API Gateway.',
          impact: 'Rolling restart of ECS services. API Gateway config update (no downtime).',
          defaultOn: true,
          icon: 'path',
        },
        {
          id: 't2-container-insights',
          title: 'Enable Container Insights',
          description: 'Cluster-level and task-level metrics for all ECS services.',
          impact: 'Updates ECS cluster settings. No service restarts.',
          defaultOn: true,
          icon: 'container',
        },
        {
          id: 't2-app-signals',
          title: 'Enable Application Signals',
          description: 'APM-level visibility: service map, latency breakdown, error tracking.',
          impact: 'Requires CloudWatch Agent with app signals config. Triggers rolling restart.',
          defaultOn: false,
          icon: 'signal',
        },
      ],
    },

    tier3: {
      label: 'Next steps — needs your input',
      description: 'These need decisions only you can make. I\'ll queue them up for after the initial setup.',
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
