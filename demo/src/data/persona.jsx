// ─── Persona Definitions ──────────────────────────────────────────
// Two personas for demo: light user (Maria) and heavy user (James)
// The active persona is selected via PersonaContext

import { createContext, useContext, useState } from 'react'

// ─── Shared tier labels ───────────────────────────────────────────
const TIER_LABELS = {
  tier1: {
    label: 'CloudWatch-only — no infrastructure changes',
    description: 'These create alarms, dashboards, and detection models inside CloudWatch. Your running services are not touched.',
    badge: 'Metadata only',
    badgeTooltip: 'These actions only create CloudWatch resources (alarms, dashboards, models). Your running services, task definitions, and infrastructure are not modified.',
  },
  tier2: {
    label: 'Infrastructure changes — needs your OK',
    description: 'These modify your running services (sidecars, task definitions, parameter groups). May cause rolling restarts.',
    badge: 'Modifies infrastructure',
    badgeTooltip: 'These actions update your running AWS resources — ECS task definitions, RDS parameter groups, API Gateway stages. Some may trigger rolling restarts or redeployments.',
  },
  tier3: {
    label: 'Business decisions — needs your input',
    description: 'These require choices the agent can\'t infer from your infrastructure — targets, routing, and org structure.',
    badge: 'Your call',
    badgeTooltip: 'These require business decisions the agent can\'t infer from your infrastructure — like SLO targets, alert routing destinations, or cross-account permissions.',
  },
}

// ─── PERSONA 1: Maria Chen — Mid-tier e-commerce (light) ─────────
const maria = {
  id: 'maria',
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
  coverage: { totalServices: 16, withMetrics: 16, withAlarms: 0, withDashboards: 0, withLogs: 2, withTraces: 0 },
  setup: {
    summary: { headline: 'I can set up monitoring for all 16 services', subtext: 'Based on what I found, here\'s my recommended plan. The basics take about 2 minutes — I\'ll handle everything.' },
    tier1: { ...TIER_LABELS.tier1, items: [
      { id: 't1-alarms', title: 'Create 42 recommended alarms', description: 'CPU > 90%, memory > 85%, 5xx errors > 1%, p99 latency thresholds per service type', icon: 'bell', viewLabel: 'View alarms', viewPath: '/console', detailsPerResource: true, details: [
        { service: 'ECS services (6)', alarms: 'CPUUtilization > 90%, MemoryUtilization > 85%, RunningTaskCount < desired' },
        { service: 'Lambda functions (2)', alarms: 'Errors > 1%, Duration p99 > 10s, Throttles > 0' },
        { service: 'RDS databases (2)', alarms: 'CPUUtilization > 80%, FreeableMemory < 500MB, ReadLatency > 20ms' },
        { service: 'API Gateway', alarms: '5XXError > 1%, Latency p99 > 1s, Count anomaly band' },
        { service: 'DynamoDB', alarms: 'ThrottledRequests > 0, SystemErrors > 0' },
        { service: 'ElastiCache', alarms: 'CPUUtilization > 75%, EngineCPUUtilization > 80%, CurrConnections anomaly' },
        { service: 'CloudFront', alarms: '5xxErrorRate > 1%, OriginLatency > 2s' },
        { service: 'SNS/SQS', alarms: 'NumberOfMessagesPublished anomaly, ApproximateAgeOfOldestMessage > 300s' },
      ]},
      { id: 't1-dashboard', title: 'Generate production dashboard', description: 'Overview with health, latency, errors, and throughput for all services', icon: 'chart', viewLabel: 'View dashboard', viewPath: '/home', details: [
        { section: 'Top row', widgets: 'Service health summary, active alarms count, error rate trend' },
        { section: 'Compute', widgets: 'ECS CPU/memory per service, Lambda invocations/errors/duration' },
        { section: 'Data', widgets: 'RDS connections/latency, DynamoDB read/write capacity, ElastiCache hit rate' },
        { section: 'Traffic', widgets: 'API Gateway requests/latency/errors, CloudFront cache hit ratio' },
      ]},
      { id: 't1-anomaly', title: 'Enable anomaly detection', description: 'Using 14 days of existing metric history to establish baselines', icon: 'wave', viewLabel: 'View detectors', viewPath: '/home', details: [
        { metric: 'API Gateway request count', reason: 'Detect traffic spikes or drops' },
        { metric: 'ECS CPU/memory per service', reason: 'Catch resource exhaustion early' },
        { metric: 'RDS read/write latency', reason: 'Database performance degradation' },
        { metric: 'Lambda duration', reason: 'Cold start or dependency slowdowns' },
        { metric: 'SQS message age', reason: 'Queue backup / consumer lag' },
      ]},
      { id: 't1-logclass', title: 'Optimize Lambda log classes', description: 'Move notification-service logs to Infrequent Access (low volume, saves ~$12/mo)', icon: 'archive', viewLabel: 'View log groups', viewPath: '/home', details: [
        { logGroup: '/aws/lambda/notification-service', currentClass: 'Standard', recommended: 'Infrequent Access', reason: 'Low query frequency, ~80K invocations/day' },
        { logGroup: '/aws/lambda/image-processor', currentClass: 'Standard', recommended: 'Keep Standard', reason: 'May need real-time debugging for image failures' },
      ]},
    ]},
    tier2: { ...TIER_LABELS.tier2, items: [
      { id: 't2-cw-agent', title: 'Deploy CloudWatch Agent on ECS services', description: 'Adds memory, disk, and custom metrics via sidecar.', impact: 'Rolling restart of 6 ECS services (~22 tasks). ~5 min total. Zero-downtime. Reversible.', defaultOn: true, icon: 'cpu', viewLabel: 'View agents', viewPath: '/home', detailsPerResource: true, details: [
        { service: 'user-service (4 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
        { service: 'checkout-service (6 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
        { service: 'payment-service (4 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
        { service: 'order-service (3 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
        { service: 'inventory-service (2 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
        { service: 'search-service (3 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network' },
      ]},
      { id: 't2-logs', title: 'Enable log delivery for 14 services', description: 'API Gateway access logs, RDS slow query logs, ECS container logs, CloudFront access logs.', impact: 'API GW, RDS, CloudFront: config only. ECS: rolling redeploy (~5 min). All reversible.', defaultOn: true, icon: 'file', viewLabel: 'View logs', viewPath: '/home', detailsPerResource: true, details: [
        { service: 'API Gateway', action: 'Enable access logging to CloudWatch Logs (no restart)' },
        { service: '6 ECS services', action: 'Add awslogs log driver to task definitions (rolling redeploy)' },
        { service: '2 RDS databases', action: 'Enable slow query log + error log export (parameter group update)' },
        { service: 'CloudFront', action: 'Enable standard logging to S3 + CloudWatch (no restart)' },
        { service: 'DynamoDB', action: 'Enable CloudTrail data events for read/write tracking' },
        { service: 'ElastiCache', action: 'Enable slow log to CloudWatch Logs' },
      ]},
      { id: 't2-traces', title: 'Enable X-Ray tracing', description: 'Adds X-Ray sidecar to ECS tasks and enables tracing on API Gateway.', impact: 'ECS: rolling restart (~5 min, zero downtime). API GW: config update. Lambda: instant. Reversible.', defaultOn: true, icon: 'path', viewLabel: 'View traces', viewPath: '/home', detailsPerResource: true, details: [
        { service: 'API Gateway', action: 'Enable X-Ray tracing on stage (config update, no downtime)' },
        { service: '6 ECS services', action: 'Add X-Ray daemon sidecar container (rolling redeploy)' },
        { service: '2 Lambda functions', action: 'Enable active tracing (config update, no cold start impact)' },
      ]},
      { id: 't2-container-insights', title: 'Enable Container Insights', description: 'Cluster-level and task-level metrics for all ECS services.', impact: 'Cluster setting update only — no restarts, no downtime. Immediate. Reversible.', defaultOn: true, icon: 'container', viewLabel: 'View insights', viewPath: '/home', detailsPerResource: true, details: [
        { cluster: 'novamart-east-1', services: 4, action: 'Enable containerInsights account setting' },
        { cluster: 'novamart-east-2', services: 2, action: 'Enable containerInsights account setting' },
        { cluster: 'novamart-west-1', services: 1, action: 'Enable containerInsights account setting' },
      ]},
      { id: 't2-app-signals', title: 'Enable Application Signals', description: 'APM-level visibility: service map, latency breakdown, error tracking.', impact: 'Rolling restart of ECS services (~5 min, zero downtime). +10-15% memory overhead. Reversible.', defaultOn: false, icon: 'signal', viewLabel: 'View service map', viewPath: '/home', details: [
        { what: 'Auto-instrumentation', action: 'Adds OpenTelemetry auto-instrumentation to ECS tasks via CW Agent' },
        { what: 'Service map', action: 'Generates real-time dependency map from trace data' },
        { what: 'SLO-ready', action: 'Once enabled, you can define SLOs on discovered service operations' },
      ]},
    ]},
    tier3: { ...TIER_LABELS.tier3, items: [
      { id: 't3-slos', title: 'Define Service Level Objectives', question: 'What availability target for your critical path? (e.g., 99.9%, 99.95%)', suggestion: 'Based on your traffic patterns, I\'d recommend 99.9% availability and p99 latency < 500ms for the checkout flow.', icon: 'target' },
      { id: 't3-alerts', title: 'Configure alert routing', question: 'Where should critical alarms go? SNS topic, Slack, PagerDuty, or email?', suggestion: 'I can create an SNS topic now and you can add integrations later.', icon: 'route' },
      { id: 't3-cross-account', title: 'Set up cross-account observability', question: 'Want to link your staging account (novamart-staging) for unified monitoring?', suggestion: 'I\'ll generate a CloudFormation template for both accounts. Someone with admin access will need to deploy it.', icon: 'link' },
    ]},
  },
  // Widget display data — persona-specific
  widgetData: {
    alarms: { total: 42, ok: 42, alarm: 0, insufficient: 0, nearThreshold: [
      { name: 'payment-service', metric: 'CPU', value: 72, threshold: 90, unit: '%' },
      { name: 'orders-db', metric: 'ReadLatency', value: 14, threshold: 20, unit: 'ms' },
      { name: 'checkout-service', metric: 'Memory', value: 68, threshold: 85, unit: '%' },
    ]},
    dashboard: { metrics: [
      { name: 'API GW', color: '#0ea5e9' },
      { name: 'Checkout', color: '#8b5cf6' },
      { name: 'Payment', color: '#f59e0b' },
      { name: 'Orders DB', color: '#22c55e' },
    ]},
    anomaly: { detectors: [
      { metric: 'API GW requests', distance: '12%' },
      { metric: 'ECS CPU', distance: '24%' },
      { metric: 'RDS latency', distance: '8%' },
      { metric: 'Lambda duration', distance: '31%' },
      { metric: 'SQS age', distance: '5%' },
    ]},
    logs: { total: 14, standard: 13, ia: 1, topByVolume: [
      { name: 'checkout-service', volume: '1.8 GB/day' },
      { name: 'payment-service', volume: '1.2 GB/day' },
      { name: 'api-gateway', volume: '0.9 GB/day' },
    ]},
    traces: { latency: [
      { label: 'p50', value: '82ms' },
      { label: 'p95', value: '210ms' },
      { label: 'p99', value: '480ms' },
    ]},
    cwAgent: { services: [
      { name: 'checkout', mem: 62 }, { name: 'payment', mem: 58 },
      { name: 'user', mem: 45 }, { name: 'order', mem: 41 },
      { name: 'inventory', mem: 33 }, { name: 'search', mem: 52 },
    ]},
    containerInsights: { clusters: [
      { name: 'east-1', tasks: 13 }, { name: 'east-2', tasks: 10 }, { name: 'west-1', tasks: 3 },
    ]},
    logClass: { saved: '~$12/mo', detail: 'notification-service → Infrequent Access. image-processor → Standard (kept).' },
    appSignals: { detail: 'Service map, latency breakdown, and error tracking enabled.' },
  },
  agentActivity: [
    { time: 'Just now', action: 'Mapped service dependencies: api-gateway → checkout → payment → orders-db' },
    { time: 'Just now', action: 'Found 0 alarms, 0 dashboards, 0 traces configured' },
    { time: 'Just now', action: 'Analyzed 14 days of default metrics to establish baselines' },
    { time: 'Just now', action: 'Generated setup plan — waiting for your go-ahead' },
  ],
}

// ─── PERSONA 2: James Okafor — Enterprise fintech (heavy) ────────
const james = {
  id: 'james',
  user: {
    name: 'James Okafor',
    role: 'Principal Engineer, Observability',
    team: 'Cloud Platform',
    company: 'Meridian Financial',
    email: 'jokafor@meridianfin.com',
    avatar: null,
    timezone: 'America/Los_Angeles',
    lastLogin: null,
  },
  demo: {
    observabilityMaturity: 'Intermediate',
    observabilityDetail: 'Has fragmented monitoring — some teams set up alarms, others didn\'t. 3 stale dashboards. Datadog in some accounts. Wants to consolidate on CloudWatch.',
    spendingCohort: 'Enterprise',
    monthlyAWSSpend: '~$420,000/mo',
    cloudWatchSpend: '~$2,800/mo (fragmented, unoptimized)',
    teamSize: 38,
    oncallRotation: true,
    incidentTooling: 'PagerDuty + Slack + internal runbook system',
    goals: [
      'Consolidate from Datadog + fragmented CloudWatch into unified CW Omni',
      'Get cross-account visibility across 12 accounts in 5 regions',
      'Reduce alert noise — currently 200+ alarms, 40% are stale or misconfigured',
      'Enable SLOs for PCI-DSS compliance reporting',
      'Cut observability costs by consolidating tooling',
    ],
    awsServiceBreakdown: {
      compute: '3 EKS clusters (480 pods), 14 ECS services (86 tasks), 23 Lambda functions',
      data: '6 RDS (PostgreSQL + Aurora), 4 DynamoDB, 3 ElastiCache Redis, 1 Neptune, 2 Redshift',
      networking: '3 API Gateways, 2 ALBs, 2 NLBs, 3 CloudFront distributions, 1 Global Accelerator',
      messaging: '4 SQS queues, 3 SNS topics, 2 EventBridge buses, 1 Kinesis stream, 1 MSK cluster',
      ai: '2 SageMaker endpoints (fraud detection, risk scoring), 1 Bedrock agent',
      storage: '12 S3 buckets, 2 EFS volumes',
    },
  },
  application: {
    name: 'Meridian Banking Platform',
    description: 'Enterprise fintech platform processing ~$2B/day in transactions across NA, EU, and APAC',
    environments: ['production', 'staging', 'qa', 'dev', 'sandbox'],
    regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1'],
    accounts: [
      { id: '100200300401', name: 'meridian-prod-us', env: 'production' },
      { id: '100200300402', name: 'meridian-prod-eu', env: 'production' },
      { id: '100200300403', name: 'meridian-prod-apac', env: 'production' },
      { id: '100200300404', name: 'meridian-staging', env: 'staging' },
      { id: '100200300405', name: 'meridian-qa', env: 'qa' },
      { id: '100200300406', name: 'meridian-dev', env: 'dev' },
      { id: '100200300407', name: 'meridian-data', env: 'production' },
      { id: '100200300408', name: 'meridian-ml', env: 'production' },
      { id: '100200300409', name: 'meridian-security', env: 'production' },
      { id: '100200300410', name: 'meridian-shared-services', env: 'production' },
      { id: '100200300411', name: 'meridian-network', env: 'production' },
      { id: '100200300412', name: 'meridian-sandbox', env: 'sandbox' },
    ],
  },
  services: [
    // EKS
    { name: 'payments-cluster', type: 'EKS', aws: 'Amazon EKS', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, pods: 180 },
    { name: 'trading-cluster', type: 'EKS', aws: 'Amazon EKS', region: 'us-west-2', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, pods: 220 },
    { name: 'analytics-cluster', type: 'EKS', aws: 'Amazon EKS', region: 'eu-west-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, pods: 80 },
    // ECS
    { name: 'auth-service', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'us-east-1', hasMetrics: true, hasAlarms: true, hasDashboard: false, hasLogs: true, hasTraces: false, tasks: 12 },
    { name: 'account-service', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'us-east-1', hasMetrics: true, hasAlarms: true, hasDashboard: false, hasLogs: false, hasTraces: false, tasks: 8 },
    { name: 'notification-hub', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: true, hasTraces: false, tasks: 4 },
    { name: 'compliance-engine', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'us-east-1', hasMetrics: true, hasAlarms: true, hasDashboard: true, hasLogs: true, hasTraces: false, tasks: 6 },
    { name: 'kyc-service', type: 'ECS Fargate', aws: 'Amazon ECS', region: 'eu-central-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, tasks: 4 },
    // Lambda
    { name: 'transaction-processor', type: 'Lambda', aws: 'AWS Lambda', region: 'us-east-1', hasMetrics: true, hasAlarms: true, hasDashboard: false, hasLogs: true, hasTraces: false, invocations: '~2.4M/day' },
    { name: 'fraud-scorer', type: 'Lambda', aws: 'AWS Lambda', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: true, hasTraces: false, invocations: '~1.8M/day' },
    { name: 'report-generator', type: 'Lambda', aws: 'AWS Lambda', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: true, hasTraces: false, invocations: '~50K/day' },
    // Data
    { name: 'transactions-db', type: 'Aurora PostgreSQL', aws: 'Amazon RDS', region: 'us-east-1', hasMetrics: true, hasAlarms: true, hasDashboard: true, hasLogs: false, hasTraces: false, instance: 'db.r6g.2xlarge', multiAZ: true },
    { name: 'accounts-db', type: 'Aurora PostgreSQL', aws: 'Amazon RDS', region: 'us-east-1', hasMetrics: true, hasAlarms: true, hasDashboard: false, hasLogs: false, hasTraces: false, instance: 'db.r6g.xlarge', multiAZ: true },
    { name: 'ledger-db', type: 'DynamoDB', aws: 'Amazon DynamoDB', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false },
    { name: 'session-store', type: 'ElastiCache Redis', aws: 'Amazon ElastiCache', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, nodes: 6 },
    // AI/ML
    { name: 'fraud-model', type: 'SageMaker Endpoint', aws: 'Amazon SageMaker', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: true, hasTraces: false },
    { name: 'risk-model', type: 'SageMaker Endpoint', aws: 'Amazon SageMaker', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: true, hasTraces: false },
    { name: 'advisor-agent', type: 'Bedrock Agent', aws: 'Amazon Bedrock', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false },
    // Networking
    { name: 'public-api', type: 'API Gateway', aws: 'Amazon API Gateway', region: 'us-east-1', hasMetrics: true, hasAlarms: true, hasDashboard: true, hasLogs: true, hasTraces: false, requests: '~85M/day' },
    { name: 'partner-api', type: 'API Gateway', aws: 'Amazon API Gateway', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false, requests: '~12M/day' },
    // Messaging
    { name: 'transaction-stream', type: 'Kinesis', aws: 'Amazon Kinesis', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false },
    { name: 'event-backbone', type: 'MSK', aws: 'Amazon MSK', region: 'us-east-1', hasMetrics: true, hasAlarms: false, hasDashboard: false, hasLogs: false, hasTraces: false },
  ],
  coverage: { totalServices: 22, withMetrics: 22, withAlarms: 8, withDashboards: 3, withLogs: 9, withTraces: 0, existingAlarmCount: 147, staleAlarms: 52 },
  setup: {
    summary: { headline: 'I found 22 services across 12 accounts — and some issues', subtext: 'You have 147 existing alarms (52 are stale or misconfigured), 3 dashboards last updated 4 months ago, and no tracing. I can fix the gaps and consolidate everything.' },
    tier1: { ...TIER_LABELS.tier1, items: [
      { id: 't1-alarms', title: 'Fix 52 stale alarms + create 91 new ones', description: 'Reconfigure 52 misconfigured alarms and add coverage for 14 unmonitored services. Total after: 238 alarms.', icon: 'bell', viewLabel: 'View alarms', viewPath: '/console', detailsPerResource: true, details: [
        { service: 'EKS clusters (3)', alarms: 'Pod restart rate, node CPU/memory, pending pods, OOM kills' },
        { service: 'ECS services (14)', alarms: 'CPUUtilization > 90%, MemoryUtilization > 85%, RunningTaskCount < desired' },
        { service: 'Lambda functions (23)', alarms: 'Errors > 0.5%, Duration p99 > threshold, Throttles > 0, ConcurrentExecutions' },
        { service: 'Aurora/RDS (6)', alarms: 'CPUUtilization > 80%, FreeableMemory, ReadLatency, ReplicaLag, Deadlocks' },
        { service: 'DynamoDB (4)', alarms: 'ThrottledRequests, SystemErrors, ConsumedRCU/WCU vs provisioned' },
        { service: 'API Gateways (3)', alarms: '5XXError > 0.5%, Latency p99, IntegrationLatency, Count anomaly' },
        { service: 'Kinesis + MSK', alarms: 'GetRecords.IteratorAgeMilliseconds, ReadProvisionedThroughputExceeded' },
        { service: 'SageMaker (2)', alarms: 'ModelLatency p99, Invocation5XXErrors, CPUUtilization, MemoryUtilization' },
        { service: 'Stale alarms (52)', alarms: 'Reconfigure thresholds, remove orphaned alarms for deleted resources' },
      ]},
      { id: 't1-dashboard', title: 'Rebuild 3 stale dashboards + create 4 new ones', description: 'Current dashboards are 4 months old and missing 15 services. I\'ll rebuild and add cross-account views.', icon: 'chart', viewLabel: 'View dashboards', viewPath: '/home', details: [
        { dashboard: 'Executive Overview', status: 'Rebuild — add cross-account health, SLO status, cost trend' },
        { dashboard: 'Payments Pipeline', status: 'Rebuild — add EKS pod metrics, Kinesis lag, fraud model latency' },
        { dashboard: 'Compliance', status: 'Rebuild — add audit trail, KYC metrics, PCI-DSS indicators' },
        { dashboard: 'EKS Operations (new)', status: 'Create — pod health, node utilization, HPA scaling across 3 clusters' },
        { dashboard: 'Data Pipeline (new)', status: 'Create — Kinesis throughput, MSK consumer lag, DynamoDB capacity' },
        { dashboard: 'ML Models (new)', status: 'Create — SageMaker endpoint latency, invocation errors, Bedrock token usage' },
        { dashboard: 'Cross-Region (new)', status: 'Create — latency comparison, failover readiness, replication lag' },
      ]},
      { id: 't1-anomaly', title: 'Enable anomaly detection on 28 key metrics', description: 'Using historical data to establish baselines across all critical services', icon: 'wave', viewLabel: 'View detectors', viewPath: '/home', details: [
        { metric: 'Transaction volume per region', reason: 'Detect regional traffic shifts or outages' },
        { metric: 'EKS pod restart rate', reason: 'Catch crash loops before they cascade' },
        { metric: 'Aurora replication lag', reason: 'Cross-region consistency for compliance' },
        { metric: 'Kinesis iterator age', reason: 'Stream processing backlog detection' },
        { metric: 'SageMaker model latency', reason: 'ML model degradation (data drift)' },
        { metric: 'API Gateway error rate per endpoint', reason: 'Per-route anomaly detection' },
        { metric: 'MSK consumer group lag', reason: 'Event processing delays' },
      ]},
      { id: 't1-logclass', title: 'Optimize log classes across 9 log groups', description: 'Move low-query log groups to Infrequent Access. Estimated savings: ~$340/mo', icon: 'archive', viewLabel: 'View log groups', viewPath: '/home', details: [
        { logGroup: '/aws/lambda/report-generator', currentClass: 'Standard', recommended: 'Infrequent Access', reason: 'Batch job, rarely queried' },
        { logGroup: '/aws/ecs/notification-hub', currentClass: 'Standard', recommended: 'Infrequent Access', reason: 'Low-priority notifications' },
        { logGroup: '/aws/sagemaker/fraud-model', currentClass: 'Standard', recommended: 'Keep Standard', reason: 'Needs real-time debugging for model issues' },
        { logGroup: '/aws/lambda/fraud-scorer', currentClass: 'Standard', recommended: 'Keep Standard', reason: 'Critical path — needs live tail' },
      ]},
    ]},
    tier2: { ...TIER_LABELS.tier2, items: [
      { id: 't2-cw-agent', title: 'Deploy CloudWatch Agent on ECS + EKS', description: 'Adds memory, disk, GPU, and custom metrics. ECS sidecar + EKS DaemonSet.', impact: 'ECS: rolling restart of 14 services (~86 tasks, ~8 min). EKS: DaemonSet rollout (~3 min per cluster). Zero-downtime. Reversible.', defaultOn: true, icon: 'cpu', viewLabel: 'View agents', viewPath: '/home', detailsPerResource: true, details: [
        { service: '14 ECS services (86 tasks)', action: 'Add CW Agent sidecar, collect memory + disk + network + custom metrics' },
        { service: 'payments-cluster (180 pods)', action: 'Deploy CW Agent DaemonSet, collect pod/node/container metrics' },
        { service: 'trading-cluster (220 pods)', action: 'Deploy CW Agent DaemonSet, collect pod/node/container metrics' },
        { service: 'analytics-cluster (80 pods)', action: 'Deploy CW Agent DaemonSet, collect pod/node/container metrics' },
      ]},
      { id: 't2-logs', title: 'Enable log delivery for 13 unlogged services', description: 'EKS pod logs, remaining ECS services, Aurora audit logs, API Gateway access logs.', impact: 'EKS: Fluent Bit DaemonSet (~2 min). ECS: rolling redeploy. Aurora: parameter group update. All reversible.', defaultOn: true, icon: 'file', viewLabel: 'View logs', viewPath: '/home', detailsPerResource: true, details: [
        { service: '3 EKS clusters', action: 'Deploy Fluent Bit DaemonSet for pod log collection' },
        { service: '5 ECS services (no logs)', action: 'Add awslogs log driver to task definitions' },
        { service: '4 Aurora/RDS databases', action: 'Enable audit log + slow query log export' },
        { service: 'partner-api', action: 'Enable access logging to CloudWatch Logs' },
      ]},
      { id: 't2-traces', title: 'Enable X-Ray tracing across all services', description: 'Full distributed tracing from API Gateway through EKS/ECS to databases.', impact: 'EKS: ADOT collector DaemonSet (~3 min). ECS: X-Ray sidecar (rolling restart). API GW: config update. Reversible.', defaultOn: true, icon: 'path', viewLabel: 'View traces', viewPath: '/home', detailsPerResource: true, details: [
        { service: '3 API Gateways', action: 'Enable X-Ray tracing on all stages' },
        { service: '3 EKS clusters', action: 'Deploy ADOT collector for distributed tracing' },
        { service: '14 ECS services', action: 'Add X-Ray daemon sidecar container' },
        { service: '23 Lambda functions', action: 'Enable active tracing (config toggle)' },
        { service: '2 SageMaker endpoints', action: 'Enable inference tracing' },
      ]},
      { id: 't2-container-insights', title: 'Enable Container Insights on EKS + ECS', description: 'Cluster, node, pod, and task-level metrics with enhanced observability.', impact: 'EKS: enhanced observability add-on (~2 min). ECS: cluster setting update. No restarts. Reversible.', defaultOn: true, icon: 'container', viewLabel: 'View insights', viewPath: '/home', detailsPerResource: true, details: [
        { cluster: 'payments-cluster (EKS)', pods: 180, action: 'Enable enhanced Container Insights with Prometheus metrics' },
        { cluster: 'trading-cluster (EKS)', pods: 220, action: 'Enable enhanced Container Insights with Prometheus metrics' },
        { cluster: 'analytics-cluster (EKS)', pods: 80, action: 'Enable enhanced Container Insights' },
        { cluster: 'ECS clusters (5 regions)', services: 14, action: 'Enable containerInsights account setting' },
      ]},
      { id: 't2-app-signals', title: 'Enable Application Signals', description: 'APM-level visibility with auto-instrumented service map, latency breakdown, and error tracking.', impact: 'Requires ADOT auto-instrumentation on EKS + CW Agent on ECS. Rolling restarts. +10-15% memory overhead. Reversible.', defaultOn: true, icon: 'signal', viewLabel: 'View service map', viewPath: '/home', details: [
        { what: 'Auto-instrumentation', action: 'Java/Python/Node auto-instrumentation via ADOT on EKS and CW Agent on ECS' },
        { what: 'Service map', action: 'Real-time dependency map across 22 services, 12 accounts, 5 regions' },
        { what: 'SLO-ready', action: 'Enables SLO creation on discovered operations — needed for PCI-DSS compliance' },
      ]},
    ]},
    tier3: { ...TIER_LABELS.tier3, items: [
      { id: 't3-slos', title: 'Define SLOs for PCI-DSS compliance', question: 'What availability and latency targets for payment processing? Compliance requires documented SLOs.', suggestion: 'For PCI-DSS: 99.95% availability on payment endpoints, p99 latency < 300ms, error rate < 0.1%. I can create these with burn-rate alerting.', icon: 'target' },
      { id: 't3-alerts', title: 'Consolidate alert routing (PagerDuty + Slack)', question: 'You have 3 PagerDuty services and 8 Slack channels. Want to consolidate routing rules?', suggestion: 'I can map alarms to PagerDuty services by severity and team ownership, and route to the right Slack channels.', icon: 'route' },
      { id: 't3-cross-account', title: 'Set up cross-account observability (12 accounts)', question: 'Link all 12 accounts for unified monitoring? This requires IAM changes in each account.', suggestion: 'I\'ll generate CloudFormation StackSets to deploy the observability access manager across all accounts. Needs org admin approval.', icon: 'link' },
      { id: 't3-datadog', title: 'Plan Datadog migration', question: '4 accounts still use Datadog. Want to create a migration plan with parallel running?', suggestion: 'I can set up dual-shipping (metrics to both CW and Datadog) for 30 days, then cut over. Estimated savings: ~$8,000/mo.', icon: 'route' },
      { id: 't3-genai', title: 'Enable GenAI observability', question: 'Your Bedrock agent and SageMaker models need specialized monitoring. Enable AI-specific dashboards?', suggestion: 'I can track token usage, model latency, hallucination rates, and cost per inference across your AI stack.', icon: 'signal' },
    ]},
  },
  // Widget display data — persona-specific
  widgetData: {
    alarms: { total: 238, ok: 220, alarm: 3, insufficient: 15, nearThreshold: [
      { name: 'payments-cluster', metric: 'Pod restarts', value: 8, threshold: 10, unit: '/hr' },
      { name: 'transactions-db', metric: 'CPU', value: 76, threshold: 80, unit: '%' },
      { name: 'trading-cluster', metric: 'Memory', value: 78, threshold: 85, unit: '%' },
      { name: 'fraud-model', metric: 'Latency p99', value: 280, threshold: 300, unit: 'ms' },
    ]},
    dashboard: { metrics: [
      { name: 'Public API', color: '#0ea5e9' },
      { name: 'Payments', color: '#f59e0b' },
      { name: 'Trading', color: '#8b5cf6' },
      { name: 'Fraud Model', color: '#ef4444' },
      { name: 'Transactions DB', color: '#22c55e' },
      { name: 'Kinesis', color: '#f97316' },
    ]},
    anomaly: { detectors: [
      { metric: 'Transaction volume (us-east-1)', distance: '6%' },
      { metric: 'EKS pod restart rate', distance: '18%' },
      { metric: 'Aurora replication lag', distance: '3%' },
      { metric: 'Kinesis iterator age', distance: '42%' },
      { metric: 'SageMaker model latency', distance: '15%' },
      { metric: 'MSK consumer lag', distance: '28%' },
      { metric: 'API error rate /v2/payments', distance: '9%' },
    ]},
    logs: { total: 22, standard: 20, ia: 2, topByVolume: [
      { name: 'payments-cluster', volume: '18.4 GB/day' },
      { name: 'trading-cluster', volume: '12.1 GB/day' },
      { name: 'transaction-processor', volume: '6.8 GB/day' },
      { name: 'public-api', volume: '4.2 GB/day' },
    ]},
    traces: { latency: [
      { label: 'p50', value: '45ms' },
      { label: 'p95', value: '180ms' },
      { label: 'p99', value: '320ms' },
    ]},
    cwAgent: { services: [
      { name: 'payments-cluster', mem: 71 }, { name: 'trading-cluster', mem: 68 },
      { name: 'analytics-cluster', mem: 42 }, { name: 'auth-service', mem: 55 },
      { name: 'compliance-engine', mem: 48 }, { name: 'account-service', mem: 39 },
    ]},
    containerInsights: { clusters: [
      { name: 'payments (EKS)', tasks: 180 }, { name: 'trading (EKS)', tasks: 220 },
      { name: 'analytics (EKS)', tasks: 80 }, { name: 'ECS (5 regions)', tasks: 86 },
    ]},
    logClass: { saved: '~$340/mo', detail: 'report-generator + notification-hub → Infrequent Access. Critical path logs kept on Standard.' },
    appSignals: { detail: 'Service map across 22 services, 12 accounts, 5 regions. SLO-ready for PCI-DSS compliance.' },
  },
  agentActivity: [
    { time: 'Just now', action: 'Scanned 12 accounts across 5 regions, discovered 22 services' },
    { time: 'Just now', action: 'Found 147 existing alarms — 52 stale or misconfigured across 4 accounts' },
    { time: 'Just now', action: '3 dashboards found — last updated 4 months ago' },
    { time: 'Just now', action: 'Detected Datadog agents in 4 accounts (parallel monitoring)' },
    { time: 'Just now', action: 'Identified PCI-DSS compliance gaps: no SLOs, incomplete audit logging' },
    { time: 'Just now', action: 'Generated setup plan — waiting for your go-ahead' },
  ],
}

// ─── Exports ──────────────────────────────────────────────────────
export const personas = { maria, james }
export const personaList = [maria, james]

// React context for persona switching
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

// Backward compat — default export is Maria
export const persona = maria
