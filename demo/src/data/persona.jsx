// ─── Persona Definitions ──────────────────────────────────────────
// Restructured around applications, observability gaps, and use cases
// Based on feedback: use-case-driven, IaC-first, application-centric

import { createContext, useContext, useState } from 'react'

// ─── PERSONA 1: Maria Chen — Mid-tier e-commerce (light) ─────────
const maria = {
  id: 'maria',
  user: { name: 'Maria Chen', role: 'Senior SRE', team: 'Platform Engineering', company: 'NovaMart', avatar: null, timezone: 'America/New_York' },
  demo: {
    observabilityMaturity: 'Beginner',
    observabilityDetail: 'First time using CloudWatch. No alarms, dashboards, or tracing.',
    spendingCohort: 'Mid-tier',
    monthlyAWSSpend: '~$18,000/mo',
    cloudWatchSpend: '$0 (default free tier only)',
    teamSize: 5,
    oncallRotation: true,
    incidentTooling: 'PagerDuty (not integrated)',
    goals: [
      'Get visibility into production health',
      'Reduce MTTR from ~45 min',
      'Set up proactive alerting',
    ],
    awsServiceBreakdown: {
      compute: '6 ECS Fargate services (22 tasks), 2 Lambda functions',
      data: '2 RDS PostgreSQL (Multi-AZ), 1 DynamoDB, 1 ElastiCache Redis',
      networking: '1 API Gateway, 1 CloudFront, 1 S3',
      messaging: '1 SNS/SQS event bus',
    },
  },

  // Applications — grouped by tags/dependencies
  applications: [
    {
      id: 'novamart-checkout',
      name: 'Checkout Flow',
      tag: 'Application:NovaMart-Checkout',
      services: [
        { name: 'api-gateway', type: 'API Gateway', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'checkout-service', type: 'ECS Fargate', region: 'us-east-2', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'payment-service', type: 'ECS Fargate', region: 'us-east-2', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'order-service', type: 'ECS Fargate', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'orders-db', type: 'RDS PostgreSQL', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
      ],
      widgets: [
        { type: 'alarms', span: 1 },
        { type: 'error-rate', span: 1, services: ['api-gateway', 'checkout-service', 'payment-service'] },
        { type: 'latency-waterfall', span: 2, services: ['api-gateway', 'checkout-service', 'payment-service', 'orders-db'] },
        { type: 'throughput', span: 1, service: 'api-gateway', label: 'API Gateway requests' },
        { type: 'db-connections', span: 1, service: 'orders-db' },
      ],
    },
    {
      id: 'novamart-catalog',
      name: 'Product Catalog',
      tag: 'Application:NovaMart-Catalog',
      services: [
        { name: 'search-service', type: 'ECS Fargate', region: 'us-west-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'product-catalog', type: 'DynamoDB', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'image-processor', type: 'Lambda', region: 'us-east-1', hasAlarms: false, hasLogs: true, hasTraces: false },
        { name: 'cdn', type: 'CloudFront', region: 'global', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'static-assets', type: 'S3', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
      ],
      widgets: [
        { type: 'alarms', span: 1 },
        { type: 'throughput', span: 1, service: 'search-service', label: 'Search queries' },
        { type: 'cache-hit', span: 1, service: 'cdn', label: 'CDN cache hit ratio' },
        { type: 'lambda-stats', span: 1, service: 'image-processor' },
        { type: 'dynamo-capacity', span: 2, service: 'product-catalog' },
      ],
    },
    {
      id: 'novamart-platform',
      name: 'Platform Services',
      tag: 'Application:NovaMart-Platform',
      services: [
        { name: 'user-service', type: 'ECS Fargate', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'notification-service', type: 'Lambda', region: 'us-west-1', hasAlarms: false, hasLogs: true, hasTraces: false },
        { name: 'session-cache', type: 'ElastiCache Redis', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'event-bus', type: 'SNS + SQS', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'inventory-service', type: 'ECS Fargate', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'users-db', type: 'RDS PostgreSQL', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
      ],
      widgets: [
        { type: 'alarms', span: 1 },
        { type: 'cache-hit', span: 1, service: 'session-cache', label: 'Session cache hit ratio' },
        { type: 'queue-depth', span: 1, service: 'event-bus' },
        { type: 'lambda-stats', span: 1, service: 'notification-service' },
        { type: 'db-connections', span: 1, service: 'users-db' },
        { type: 'resource-util', span: 1, services: ['user-service', 'inventory-service'] },
      ],
    },
  ],

  // CloudWatch Agent coverage
  cwAgent: {
    installed: [],
    notInstalled: [
      { name: 'checkout-service', type: 'ECS Fargate', tasks: 6, workload: 'web-server', tags: { Application: 'NovaMart-Checkout', Environment: 'production' } },
      { name: 'payment-service', type: 'ECS Fargate', tasks: 4, workload: 'web-server', tags: { Application: 'NovaMart-Checkout', Environment: 'production' } },
      { name: 'order-service', type: 'ECS Fargate', tasks: 3, workload: 'web-server', tags: { Application: 'NovaMart-Checkout', Environment: 'production' } },
      { name: 'user-service', type: 'ECS Fargate', tasks: 4, workload: 'web-server', tags: { Application: 'NovaMart-Platform', Environment: 'production' } },
      { name: 'inventory-service', type: 'ECS Fargate', tasks: 2, workload: 'web-server', tags: { Application: 'NovaMart-Platform', Environment: 'production' } },
      { name: 'search-service', type: 'ECS Fargate', tasks: 3, workload: 'web-server', tags: { Application: 'NovaMart-Catalog', Environment: 'production' } },
    ],
    summary: { ecs: 6, eks: 0, ec2: 0, total: 6 },
  },

  // Observability gaps — selectable items for batch IaC generation
  gaps: [
    { id: 'g-alarms', category: 'alarms', appIds: ['all'], title: 'No alarms configured', description: '0 of 16 services have alarms. Recommended: 42 alarms across all services.', severity: 'critical', services: 16, fixCount: 42, fixLabel: '42 alarms' },
    { id: 'g-logs', category: 'logs', appIds: ['all'], title: 'Logging missing on 14 services', description: 'Only Lambda functions have auto-created log groups. ECS, RDS, API Gateway, and others need log delivery enabled.', severity: 'high', services: 14, fixCount: 14, fixLabel: '14 log configurations' },
    { id: 'g-traces', category: 'traces', appIds: ['all'], title: 'No distributed tracing', description: 'X-Ray is not enabled on any service. You have no visibility into request flows across services.', severity: 'high', services: 16, fixCount: 16, fixLabel: '16 trace configurations' },
    { id: 'g-dashboards', category: 'dashboards', appIds: ['all'], title: 'No dashboards', description: 'No custom dashboards exist. Recommended: 1 production overview dashboard.', severity: 'medium', services: 16, fixCount: 1, fixLabel: '1 dashboard' },
    { id: 'g-anomaly', category: 'anomaly', appIds: ['all'], title: 'No anomaly detection', description: 'Baselines exist from 14 days of auto-collected metrics but no anomaly detectors are configured.', severity: 'medium', services: 0, fixCount: 5, fixLabel: '5 anomaly detectors' },
    { id: 'g-slos', category: 'slos', appIds: ['novamart-checkout'], title: 'No SLOs defined', description: 'No Service Level Objectives configured. Recommended for the checkout critical path.', severity: 'low', services: 0, fixCount: 3, fixLabel: '3 SLOs' },
    { id: 'g-cw-agent', category: 'cw-agent', appIds: ['all'], title: 'CloudWatch Agent not installed', description: 'None of your 6 ECS services have the CW Agent. Missing memory, disk, and custom metrics.', severity: 'high', services: 6, fixCount: 6, fixLabel: '6 agent deployments' },
    { id: 'g-no-actions', category: 'alarm-actions', appIds: ['all'], title: 'No alarm actions configured', description: 'Alarms will detect issues but won\'t notify anyone. Configure SNS, Slack, or email routing.', severity: 'medium', services: 0, fixCount: 0, fixLabel: 'Configure routing' },
  ],

  // Cost data
  cost: {
    current: { total: 0, breakdown: [{ category: 'Metrics (auto-collected)', amount: 0, note: 'Free tier' }] },
    projected: [
      { gapId: 'g-alarms', category: 'Alarms', amount: 4.20, note: '$0.10/alarm' },
      { gapId: 'g-dashboards', category: 'Dashboards', amount: 3, note: '$3/dashboard' },
      { gapId: 'g-logs', category: 'Logs ingestion', amount: 28, note: '~56 GB/mo' },
      { gapId: 'g-traces', category: 'X-Ray traces', amount: 8, note: '~1.6M traces/mo' },
      { gapId: 'g-anomaly', category: 'Anomaly detection', amount: 5, note: '5 detectors' },
    ],
  },

  // Agent-suggested use cases based on discovered infrastructure
  useCases: [
    { id: 'uc-1', title: 'Monitor checkout flow end-to-end', description: 'Set up alarms, logs, tracing, and a dashboard for api-gateway → checkout → payment → orders-db', icon: 'rocket', gapIds: ['g-alarms', 'g-logs', 'g-traces', 'g-dashboards'] },
    { id: 'uc-2', title: 'Get alerted before customers notice', description: 'Create recommended alarms with anomaly detection on all 16 services', icon: 'bell', gapIds: ['g-alarms', 'g-anomaly'] },
    { id: 'uc-3', title: 'Enable full-stack observability', description: 'Alarms, logs, traces, dashboards, and anomaly detection for everything', icon: 'globe', gapIds: ['g-alarms', 'g-logs', 'g-traces', 'g-dashboards', 'g-anomaly'] },
  ],

  // Needs your attention — ranked issues
  attention: [
    { id: 'att-1', severity: 'critical', category: 'coverage', title: 'No alarms on any service', description: 'None of your 16 services have CloudWatch alarms configured. You won\'t be notified of issues.', app: 'All', time: 'Detected just now' },
    { id: 'att-2', severity: 'high', category: 'coverage', title: 'No distributed tracing', description: 'X-Ray is not enabled. You have no visibility into request flows across services.', app: 'All', time: 'Detected just now' },
    { id: 'att-3', severity: 'high', category: 'coverage', title: '14 services missing logs', description: 'Only Lambda functions have auto-created log groups. ECS, RDS, and API Gateway need log delivery.', app: 'All', time: 'Detected just now' },
    { id: 'att-4', severity: 'medium', category: 'insight', title: 'checkout-service CPU trending up', description: 'CPU utilization increased 15% over the past 7 days based on auto-collected metrics.', app: 'Checkout Flow', time: '7 day trend' },
  ],

  // Service dependency map per application
  serviceMaps: {
    'novamart-checkout': {
      nodes: [
        { id: 'api-gateway', label: 'API Gateway', type: 'API Gateway', status: 'unknown', x: 10, y: 50 },
        { id: 'checkout-service', label: 'Checkout', type: 'ECS', status: 'unknown', x: 35, y: 30 },
        { id: 'payment-service', label: 'Payment', type: 'ECS', status: 'unknown', x: 35, y: 70 },
        { id: 'order-service', label: 'Orders', type: 'ECS', status: 'unknown', x: 60, y: 50 },
        { id: 'orders-db', label: 'Orders DB', type: 'RDS', status: 'unknown', x: 85, y: 50 },
      ],
      edges: [
        { from: 'api-gateway', to: 'checkout-service' },
        { from: 'api-gateway', to: 'payment-service' },
        { from: 'checkout-service', to: 'order-service' },
        { from: 'payment-service', to: 'order-service' },
        { from: 'order-service', to: 'orders-db' },
      ],
    },
    'novamart-catalog': {
      nodes: [
        { id: 'search-service', label: 'Search', type: 'ECS', status: 'unknown', x: 15, y: 50 },
        { id: 'product-catalog', label: 'Catalog DB', type: 'DynamoDB', status: 'unknown', x: 40, y: 30 },
        { id: 'image-processor', label: 'Image Proc', type: 'Lambda', status: 'unknown', x: 40, y: 70 },
        { id: 'cdn', label: 'CDN', type: 'CloudFront', status: 'unknown', x: 65, y: 50 },
        { id: 'static-assets', label: 'Assets', type: 'S3', status: 'unknown', x: 85, y: 50 },
      ],
      edges: [
        { from: 'search-service', to: 'product-catalog' },
        { from: 'search-service', to: 'image-processor' },
        { from: 'image-processor', to: 'static-assets' },
        { from: 'cdn', to: 'static-assets' },
      ],
    },
    'novamart-platform': {
      nodes: [
        { id: 'user-service', label: 'Users', type: 'ECS', status: 'unknown', x: 15, y: 30 },
        { id: 'notification-service', label: 'Notifications', type: 'Lambda', status: 'unknown', x: 15, y: 70 },
        { id: 'session-cache', label: 'Session Cache', type: 'Redis', status: 'unknown', x: 45, y: 30 },
        { id: 'users-db', label: 'Users DB', type: 'RDS', status: 'unknown', x: 45, y: 70 },
        { id: 'inventory-service', label: 'Inventory', type: 'ECS', status: 'unknown', x: 75, y: 30 },
        { id: 'event-bus', label: 'Event Bus', type: 'SNS/SQS', status: 'unknown', x: 75, y: 70 },
      ],
      edges: [
        { from: 'user-service', to: 'session-cache' },
        { from: 'user-service', to: 'users-db' },
        { from: 'notification-service', to: 'event-bus' },
        { from: 'inventory-service', to: 'event-bus' },
        { from: 'inventory-service', to: 'users-db' },
      ],
    },
  },

  agentActivity: [
    { time: 'Just now', action: 'Grouped services into 3 applications by tags' },
    { time: 'Just now', action: 'Found 0 alarms, 0 dashboards, 0 traces configured' },
    { time: 'Just now', action: 'Analyzed 14 days of default metrics for baselines' },
    { time: 'Just now', action: 'Ready — select gaps to fix or choose a use case' },
  ],
}

// ─── PERSONA 2: James Okafor — Enterprise fintech (heavy) ────────
const james = {
  id: 'james',
  user: { name: 'James Okafor', role: 'Principal Engineer, Observability', team: 'Cloud Platform', company: 'Meridian Financial', avatar: null, timezone: 'America/Los_Angeles' },
  demo: {
    observabilityMaturity: 'Intermediate',
    observabilityDetail: 'Fragmented monitoring — some teams set up alarms, others didn\'t. 3 stale dashboards. Datadog in some accounts.',
    spendingCohort: 'Enterprise',
    monthlyAWSSpend: '~$420,000/mo',
    cloudWatchSpend: '~$2,800/mo (fragmented, unoptimized)',
    teamSize: 38,
    oncallRotation: true,
    incidentTooling: 'PagerDuty + Slack + internal runbooks',
    goals: [
      'Consolidate from Datadog + fragmented CW into unified CW Omni',
      'Cross-account visibility across 12 accounts',
      'Reduce alert noise — 147 alarms, 52 stale',
      'Enable SLOs for PCI-DSS compliance',
    ],
    awsServiceBreakdown: {
      compute: '3 EKS clusters (480 pods), 14 ECS services (86 tasks), 23 Lambda functions',
      data: '6 RDS/Aurora, 4 DynamoDB, 3 ElastiCache, 1 Neptune, 2 Redshift',
      networking: '3 API Gateways, 2 ALBs, 2 NLBs, 3 CloudFront, 1 Global Accelerator',
      messaging: '4 SQS, 3 SNS, 2 EventBridge, 1 Kinesis, 1 MSK',
      ai: '2 SageMaker endpoints, 1 Bedrock agent',
      storage: '12 S3 buckets, 2 EFS',
    },
  },

  applications: [
    {
      id: 'meridian-payments',
      name: 'Payments Platform',
      tag: 'Application:Meridian-Payments',
      services: [
        { name: 'public-api', type: 'API Gateway', region: 'us-east-1', hasAlarms: true, hasLogs: true, hasTraces: false },
        { name: 'payments-cluster', type: 'EKS', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'transaction-processor', type: 'Lambda', region: 'us-east-1', hasAlarms: true, hasLogs: true, hasTraces: false },
        { name: 'fraud-scorer', type: 'Lambda', region: 'us-east-1', hasAlarms: false, hasLogs: true, hasTraces: false },
        { name: 'fraud-model', type: 'SageMaker', region: 'us-east-1', hasAlarms: false, hasLogs: true, hasTraces: false },
        { name: 'transactions-db', type: 'Aurora PostgreSQL', region: 'us-east-1', hasAlarms: true, hasLogs: false, hasTraces: false },
        { name: 'transaction-stream', type: 'Kinesis', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
      ],
      widgets: [
        { type: 'alarms', span: 1 },
        { type: 'error-rate', span: 1, services: ['public-api', 'transaction-processor'] },
        { type: 'latency-waterfall', span: 2, services: ['public-api', 'payments-cluster', 'transactions-db'] },
        { type: 'throughput', span: 1, service: 'public-api', label: 'API requests (~85M/day)' },
        { type: 'model-latency', span: 1, service: 'fraud-model', label: 'Fraud model latency' },
        { type: 'stream-lag', span: 1, service: 'transaction-stream', label: 'Kinesis iterator age' },
        { type: 'db-connections', span: 1, service: 'transactions-db' },
      ],
    },
    {
      id: 'meridian-trading',
      name: 'Trading Engine',
      tag: 'Application:Meridian-Trading',
      services: [
        { name: 'partner-api', type: 'API Gateway', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'trading-cluster', type: 'EKS', region: 'us-west-2', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'risk-model', type: 'SageMaker', region: 'us-east-1', hasAlarms: false, hasLogs: true, hasTraces: false },
        { name: 'event-backbone', type: 'MSK', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'ledger-db', type: 'DynamoDB', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
      ],
      widgets: [
        { type: 'alarms', span: 1 },
        { type: 'resource-util', span: 1, services: ['trading-cluster'], label: 'EKS cluster (220 pods)' },
        { type: 'model-latency', span: 1, service: 'risk-model', label: 'Risk model latency' },
        { type: 'consumer-lag', span: 1, service: 'event-backbone', label: 'MSK consumer lag' },
        { type: 'dynamo-capacity', span: 1, service: 'ledger-db' },
        { type: 'throughput', span: 1, service: 'partner-api', label: 'Partner API (~12M/day)' },
      ],
    },
    {
      id: 'meridian-core',
      name: 'Core Services',
      tag: 'Application:Meridian-Core',
      services: [
        { name: 'auth-service', type: 'ECS Fargate', region: 'us-east-1', hasAlarms: true, hasLogs: true, hasTraces: false },
        { name: 'account-service', type: 'ECS Fargate', region: 'us-east-1', hasAlarms: true, hasLogs: false, hasTraces: false },
        { name: 'accounts-db', type: 'Aurora PostgreSQL', region: 'us-east-1', hasAlarms: true, hasLogs: false, hasTraces: false },
        { name: 'session-store', type: 'ElastiCache Redis', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'notification-hub', type: 'ECS Fargate', region: 'us-east-1', hasAlarms: false, hasLogs: true, hasTraces: false },
      ],
      widgets: [
        { type: 'alarms', span: 1 },
        { type: 'error-rate', span: 1, services: ['auth-service', 'account-service'] },
        { type: 'cache-hit', span: 1, service: 'session-store', label: 'Session cache hit ratio' },
        { type: 'db-connections', span: 1, service: 'accounts-db' },
        { type: 'resource-util', span: 2, services: ['auth-service', 'account-service', 'notification-hub'] },
      ],
    },
    {
      id: 'meridian-compliance',
      name: 'Compliance & Analytics',
      tag: 'Application:Meridian-Compliance',
      services: [
        { name: 'compliance-engine', type: 'ECS Fargate', region: 'us-east-1', hasAlarms: true, hasLogs: true, hasTraces: false },
        { name: 'kyc-service', type: 'ECS Fargate', region: 'eu-central-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'analytics-cluster', type: 'EKS', region: 'eu-west-1', hasAlarms: false, hasLogs: false, hasTraces: false },
        { name: 'report-generator', type: 'Lambda', region: 'us-east-1', hasAlarms: false, hasLogs: true, hasTraces: false },
        { name: 'advisor-agent', type: 'Bedrock Agent', region: 'us-east-1', hasAlarms: false, hasLogs: false, hasTraces: false },
      ],
      widgets: [
        { type: 'alarms', span: 1 },
        { type: 'resource-util', span: 1, services: ['compliance-engine', 'kyc-service'] },
        { type: 'lambda-stats', span: 1, service: 'report-generator' },
        { type: 'model-latency', span: 1, service: 'advisor-agent', label: 'Bedrock advisor latency' },
        { type: 'top-errors', span: 2, services: ['compliance-engine', 'kyc-service', 'analytics-cluster'] },
      ],
    },
  ],

  cwAgent: {
    installed: [],
    notInstalled: [
      { name: 'payments-cluster', type: 'EKS', pods: 180, workload: 'payment-processing', tags: { Application: 'Meridian-Payments', Environment: 'production' } },
      { name: 'trading-cluster', type: 'EKS', pods: 220, workload: 'trading-engine', tags: { Application: 'Meridian-Trading', Environment: 'production' } },
      { name: 'analytics-cluster', type: 'EKS', pods: 80, workload: 'analytics', tags: { Application: 'Meridian-Compliance', Environment: 'production' } },
      { name: 'auth-service', type: 'ECS Fargate', tasks: 12, workload: 'auth', tags: { Application: 'Meridian-Core', Environment: 'production' } },
      { name: 'account-service', type: 'ECS Fargate', tasks: 8, workload: 'web-server', tags: { Application: 'Meridian-Core', Environment: 'production' } },
      { name: 'notification-hub', type: 'ECS Fargate', tasks: 4, workload: 'worker', tags: { Application: 'Meridian-Core', Environment: 'production' } },
      { name: 'compliance-engine', type: 'ECS Fargate', tasks: 6, workload: 'compliance', tags: { Application: 'Meridian-Compliance', Environment: 'production' } },
      { name: 'kyc-service', type: 'ECS Fargate', tasks: 4, workload: 'web-server', tags: { Application: 'Meridian-Compliance', Environment: 'eu-central-1' } },
    ],
    summary: { ecs: 5, eks: 3, ec2: 0, total: 8 },
  },

  gaps: [
    { id: 'g-stale', category: 'alarms', appIds: ['all'], title: '52 stale/misconfigured alarms', description: 'Orphaned alarms for deleted resources, outdated thresholds, and duplicate alarms across accounts.', severity: 'critical', services: 8, fixCount: 52, fixLabel: '52 alarms to fix' },
    { id: 'g-alarms', category: 'alarms', appIds: ['meridian-trading', 'meridian-compliance'], title: '14 services have no alarms', description: 'EKS clusters, Lambda functions, Kinesis, MSK, and SageMaker endpoints have no alarm coverage.', severity: 'critical', services: 14, fixCount: 91, fixLabel: '91 new alarms' },
    { id: 'g-logs', category: 'logs', appIds: ['all'], title: '13 services missing logs', description: 'EKS pod logs, remaining ECS services, Aurora audit logs, and API Gateway access logs not configured.', severity: 'high', services: 13, fixCount: 13, fixLabel: '13 log configurations' },
    { id: 'g-traces', category: 'traces', appIds: ['all'], title: 'No distributed tracing', description: 'X-Ray/ADOT not enabled. No visibility into request flows across 22 services and 12 accounts.', severity: 'high', services: 22, fixCount: 22, fixLabel: '22 trace configurations' },
    { id: 'g-dashboards', category: 'dashboards', appIds: ['all'], title: '3 stale dashboards + 4 missing', description: 'Existing dashboards last updated 4 months ago. Missing: EKS Ops, Data Pipeline, ML Models, Cross-Region.', severity: 'medium', services: 22, fixCount: 7, fixLabel: '3 rebuilt + 4 new dashboards' },
    { id: 'g-anomaly', category: 'anomaly', appIds: ['all'], title: 'No anomaly detection', description: 'Historical data available but no anomaly detectors configured across any service.', severity: 'medium', services: 0, fixCount: 28, fixLabel: '28 anomaly detectors' },
    { id: 'g-slos', category: 'slos', appIds: ['meridian-payments'], title: 'No SLOs (PCI-DSS gap)', description: 'PCI-DSS compliance requires documented SLOs on payment processing. None configured.', severity: 'critical', services: 0, fixCount: 5, fixLabel: '5 SLOs' },
    { id: 'g-cross-account', category: 'cross-account', appIds: ['all'], title: 'No cross-account observability', description: '12 accounts operate in silos. No unified view of metrics, logs, or traces across accounts.', severity: 'high', services: 22, fixCount: 1, fixLabel: '1 observability access manager config' },
    { id: 'g-cw-agent', category: 'cw-agent', appIds: ['all'], title: 'CloudWatch Agent not installed', description: 'None of your 5 ECS services or 3 EKS clusters have the CW Agent. Missing memory, disk, and custom metrics on 8 compute resources.', severity: 'high', services: 8, fixCount: 8, fixLabel: '8 agent deployments' },
  ],

  cost: {
    current: { total: 2800, breakdown: [
      { category: 'Metrics', amount: 820, note: '~2,700 custom metrics' },
      { category: 'Alarms', amount: 14.70, note: '147 alarms × $0.10' },
      { category: 'Dashboards', amount: 9, note: '3 dashboards × $3' },
      { category: 'Logs ingestion', amount: 1400, note: '~2.8 TB/mo (Standard class)' },
      { category: 'Logs storage', amount: 520, note: '~17 TB retained' },
      { category: 'Other', amount: 36, note: 'API calls, contributor insights' },
    ]},
    projected: [
      { gapId: 'g-stale', category: 'Fix stale alarms', amount: -5.20, note: 'Remove 52 orphaned alarms' },
      { gapId: 'g-alarms', category: 'New alarms', amount: 9.10, note: '91 alarms × $0.10' },
      { gapId: 'g-logs', category: 'Log ingestion', amount: 100, note: '+EKS pod logs, Aurora audit logs' },
      { gapId: 'g-traces', category: 'X-Ray traces', amount: 180, note: '~36M traces/mo' },
      { gapId: 'g-dashboards', category: 'Dashboards', amount: 12, note: '4 new × $3' },
      { gapId: 'g-anomaly', category: 'Anomaly detection', amount: 84, note: '28 detectors' },
      { gapId: 'g-slos', category: 'SLOs', amount: 0, note: 'Included with Application Signals' },
      { gapId: 'g-cross-account', category: 'Cross-account', amount: 0, note: 'No additional cost' },
    ],
    savings: [
      { description: 'Move low-query logs to Infrequent Access', amount: 340 },
      { description: 'Consolidate Datadog (estimated)', amount: 8000 },
    ],
  },

  useCases: [
    { id: 'uc-1', title: 'Monitor payments end-to-end', description: 'Full observability for public-api → payments-cluster → transactions-db with SLOs for PCI-DSS', icon: 'rocket', gapIds: ['g-alarms', 'g-logs', 'g-traces', 'g-dashboards', 'g-slos'] },
    { id: 'uc-2', title: 'Fix alert noise', description: 'Clean up 52 stale alarms, reconfigure thresholds, add missing coverage', icon: 'bell', gapIds: ['g-stale', 'g-alarms'] },
    { id: 'uc-3', title: 'Consolidate from Datadog', description: 'Migrate 4 accounts from Datadog to CloudWatch with parallel running. Save ~$8,000/mo.', icon: 'download', gapIds: ['g-alarms', 'g-logs', 'g-traces', 'g-dashboards'] },
    { id: 'uc-4', title: 'Unified cross-account view', description: 'Link all 12 accounts for single-pane observability across 5 regions', icon: 'globe', gapIds: ['g-cross-account', 'g-dashboards'] },
    { id: 'uc-5', title: 'PCI-DSS compliance', description: 'SLOs, audit logging, and compliance dashboards for payment processing', icon: 'gauge', gapIds: ['g-slos', 'g-logs', 'g-dashboards'] },
  ],

  attention: [
    { id: 'att-1', severity: 'critical', category: 'alarm', title: 'transactions-db CPU at 76%', description: 'Aurora PostgreSQL CPU approaching 80% threshold. Connection count also elevated at 340/500.', app: 'Payments Platform', time: '12 min ago' },
    { id: 'att-2', severity: 'critical', category: 'coverage', title: '52 stale alarms across 4 accounts', description: 'Orphaned alarms for deleted resources, outdated thresholds. Generating noise and masking real issues.', app: 'All', time: 'Detected just now' },
    { id: 'att-3', severity: 'high', category: 'alarm', title: 'fraud-model latency approaching SLA', description: 'p99 latency at 290ms, SLA is 300ms. Trending upward over the past week — possible data drift.', app: 'Payments Platform', time: '25 min ago' },
    { id: 'att-4', severity: 'high', category: 'coverage', title: 'No distributed tracing on any service', description: 'X-Ray/ADOT not enabled across 22 services and 12 accounts. No request flow visibility.', app: 'All', time: 'Detected just now' },
    { id: 'att-5', severity: 'high', category: 'compliance', title: 'No SLOs defined (PCI-DSS gap)', description: 'PCI-DSS compliance requires documented SLOs on payment processing. None configured.', app: 'Payments Platform', time: 'Compliance' },
    { id: 'att-6', severity: 'medium', category: 'insight', title: 'MSK consumer lag increasing', description: 'event-backbone consumer lag at 342 messages, up 40% from yesterday. Processing may be falling behind.', app: 'Trading Engine', time: '1 hour trend' },
    { id: 'att-7', severity: 'medium', category: 'cost', title: 'Datadog running in parallel', description: '4 accounts still have Datadog agents. Consolidating could save ~$8,000/mo.', app: 'All', time: 'Optimization' },
    { id: 'att-8', severity: 'low', category: 'insight', title: 'analytics-cluster underutilized', description: 'EKS cluster in eu-west-1 running at 22% CPU. Consider scaling down or consolidating workloads.', app: 'Compliance & Analytics', time: '7 day avg' },
  ],

  serviceMaps: {
    'meridian-payments': {
      nodes: [
        { id: 'public-api', label: 'Public API', type: 'API GW', status: 'healthy', x: 5, y: 50 },
        { id: 'payments-cluster', label: 'Payments EKS', type: 'EKS', status: 'warning', x: 30, y: 30 },
        { id: 'transaction-processor', label: 'Txn Processor', type: 'Lambda', status: 'healthy', x: 30, y: 70 },
        { id: 'fraud-scorer', label: 'Fraud Scorer', type: 'Lambda', status: 'healthy', x: 55, y: 30 },
        { id: 'fraud-model', label: 'Fraud Model', type: 'SageMaker', status: 'warning', x: 55, y: 70 },
        { id: 'transactions-db', label: 'Txn DB', type: 'Aurora', status: 'warning', x: 80, y: 50 },
        { id: 'transaction-stream', label: 'Kinesis', type: 'Kinesis', status: 'healthy', x: 80, y: 15 },
      ],
      edges: [
        { from: 'public-api', to: 'payments-cluster' },
        { from: 'public-api', to: 'transaction-processor' },
        { from: 'payments-cluster', to: 'fraud-scorer' },
        { from: 'payments-cluster', to: 'transactions-db' },
        { from: 'transaction-processor', to: 'fraud-model' },
        { from: 'transaction-processor', to: 'transactions-db' },
        { from: 'fraud-scorer', to: 'fraud-model' },
        { from: 'transactions-db', to: 'transaction-stream' },
      ],
    },
  },

  agentActivity: [
    { time: 'Just now', action: 'Scanned 12 accounts across 5 regions, discovered 22 services' },
    { time: 'Just now', action: 'Grouped services into 4 applications by tags' },
    { time: 'Just now', action: 'Found 147 existing alarms — 52 stale or misconfigured' },
    { time: 'Just now', action: '3 dashboards found — last updated 4 months ago' },
    { time: 'Just now', action: 'Identified PCI-DSS compliance gaps' },
    { time: 'Just now', action: 'Ready — select gaps to fix or choose a use case' },
  ],

  slos: [
    { id: "slo-payments-avail", service: "Payments Platform", name: "Availability", target: 99.95, current: 99.92, trend: "down", status: "at-risk", window: "30d rolling" },
    { id: "slo-payments-latency", service: "Payments Platform", name: "Latency p99 < 500ms", target: 99.5, current: 99.8, trend: "stable", status: "healthy", window: "30d rolling" },
    { id: "slo-trading-avail", service: "Trading Engine", name: "Availability", target: 99.99, current: 99.995, trend: "stable", status: "healthy", window: "30d rolling" },
    { id: "slo-trading-latency", service: "Trading Engine", name: "Order latency p99 < 50ms", target: 99.0, current: 99.2, trend: "stable", status: "healthy", window: "30d rolling" },
    { id: "slo-core-auth", service: "Core Services", name: "Auth availability", target: 99.9, current: 99.95, trend: "up", status: "healthy", window: "30d rolling" },
    { id: "slo-compliance-audit", service: "Compliance & Analytics", name: "Audit log completeness", target: 100, current: 100, trend: "stable", status: "healthy", window: "7d rolling" },
  ],
  activeAlarms: [
    { id: "aa-1", name: "transactions-db-cpu", resource: "transactions-db", severity: "critical", state: "ALARM", triggered: "12 min ago", metric: "CPUUtilization", value: "76%", threshold: "80%", recommendation: "Scale up or optimize queries." },
    { id: "aa-2", name: "fraud-model-latency-p99", resource: "fraud-model", severity: "high", state: "ALARM", triggered: "25 min ago", metric: "ModelLatency p99", value: "290ms", threshold: "300ms", recommendation: "Approaching SLA. Check for data drift." },
    { id: "aa-3", name: "event-backbone-consumer-lag", resource: "event-backbone", severity: "medium", state: "ALARM", triggered: "1 hour ago", metric: "ConsumerLag", value: "342 msgs", threshold: "200 msgs", recommendation: "Consumer falling behind." },
    { id: "aa-4", name: "public-api-5xx", resource: "public-api", severity: "low", state: "OK", triggered: "3 hours ago (resolved)", metric: "5XXError", value: "0.1%", threshold: "1%", recommendation: "Resolved. Brief upstream timeout." },
  ],
  infraHealth: [
    { name: "payments-cluster", type: "EKS", status: "warning", note: "CPU 72%, 3 pods restarted", app: "Payments Platform" },
    { name: "trading-cluster", type: "EKS", status: "healthy", note: "All pods healthy, CPU 45%", app: "Trading Engine" },
    { name: "analytics-cluster", type: "EKS", status: "healthy", note: "Underutilized, CPU 22%", app: "Compliance & Analytics" },
    { name: "transactions-db", type: "Aurora PostgreSQL", status: "warning", note: "CPU 76%, connections 340/500", app: "Payments Platform" },
    { name: "accounts-db", type: "Aurora PostgreSQL", status: "healthy", note: "CPU 34%, connections 45/200", app: "Core Services" },
    { name: "ledger-db", type: "DynamoDB", status: "healthy", note: "Throttles: 0, on-demand", app: "Trading Engine" },
    { name: "session-store", type: "ElastiCache Redis", status: "healthy", note: "Hit ratio 94%, CPU 18%", app: "Core Services" },
    { name: "auth-service", type: "ECS Fargate", status: "healthy", note: "12 tasks, CPU 28%", app: "Core Services" },
    { name: "compliance-engine", type: "ECS Fargate", status: "healthy", note: "6 tasks, CPU 41%", app: "Compliance & Analytics" },
  ],
  dashboards: [
    { id: "dash-1", name: "Payments Overview", lastViewed: "2 hours ago", widgets: 12 },
    { id: "dash-2", name: "Trading Floor", lastViewed: "1 day ago", widgets: 8 },
    { id: "dash-3", name: "Infrastructure", lastViewed: "4 months ago", stale: true, widgets: 15 },
  ],
}

// ─── Exports ──────────────────────────────────────────────────────
export const personas = { maria, james }
export const personaList = [maria, james]
export const PersonaContext = createContext(null)

export function PersonaProvider({ children }) {
  const [activeId, setActiveId] = useState('maria')
  const active = personas[activeId]
  return (
    <PersonaContext.Provider value={{ persona: active, activeId, setActiveId, personaList }}>
      {children}
    </PersonaContext.Provider>
  )
}

export function usePersona() {
  return useContext(PersonaContext)
}

export const persona = maria
