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
    },
  ],

  // Observability gaps — selectable items for batch IaC generation
  gaps: [
    { id: 'g-alarms', category: 'alarms', appIds: ['all'], title: 'No alarms configured', description: '0 of 16 services have alarms. Recommended: 42 alarms across all services.', severity: 'critical', services: 16, fixCount: 42, fixLabel: '42 alarms' },
    { id: 'g-logs', category: 'logs', appIds: ['all'], title: 'Logging missing on 14 services', description: 'Only Lambda functions have auto-created log groups. ECS, RDS, API Gateway, and others need log delivery enabled.', severity: 'high', services: 14, fixCount: 14, fixLabel: '14 log configurations' },
    { id: 'g-traces', category: 'traces', appIds: ['all'], title: 'No distributed tracing', description: 'X-Ray is not enabled on any service. You have no visibility into request flows across services.', severity: 'high', services: 16, fixCount: 16, fixLabel: '16 trace configurations' },
    { id: 'g-dashboards', category: 'dashboards', appIds: ['all'], title: 'No dashboards', description: 'No custom dashboards exist. Recommended: 1 production overview dashboard.', severity: 'medium', services: 16, fixCount: 1, fixLabel: '1 dashboard' },
    { id: 'g-anomaly', category: 'anomaly', appIds: ['all'], title: 'No anomaly detection', description: 'Baselines exist from 14 days of auto-collected metrics but no anomaly detectors are configured.', severity: 'medium', services: 0, fixCount: 5, fixLabel: '5 anomaly detectors' },
    { id: 'g-slos', category: 'slos', appIds: ['novamart-checkout'], title: 'No SLOs defined', description: 'No Service Level Objectives configured. Recommended for the checkout critical path.', severity: 'low', services: 0, fixCount: 3, fixLabel: '3 SLOs' },
  ],

  // Cost data
  cost: {
    current: { total: 0, breakdown: [{ category: 'Metrics (auto-collected)', amount: 0, note: 'Free tier' }] },
    projected: { total: 48, breakdown: [
      { category: 'Alarms', amount: 4.20, note: '42 alarms × $0.10/alarm' },
      { category: 'Dashboards', amount: 3, note: '1 dashboard × $3/mo' },
      { category: 'Logs ingestion', amount: 28, note: '~56 GB/mo estimated' },
      { category: 'X-Ray traces', amount: 8, note: '~1.6M traces/mo' },
      { category: 'Anomaly detection', amount: 5, note: '5 detectors' },
    ]},
  },

  // Agent-suggested use cases based on discovered infrastructure
  useCases: [
    { id: 'uc-1', title: 'Monitor checkout flow end-to-end', description: 'Set up alarms, logs, tracing, and a dashboard for api-gateway → checkout → payment → orders-db', icon: 'rocket', gapIds: ['g-alarms', 'g-logs', 'g-traces', 'g-dashboards'] },
    { id: 'uc-2', title: 'Get alerted before customers notice', description: 'Create recommended alarms with anomaly detection on all 16 services', icon: 'bell', gapIds: ['g-alarms', 'g-anomaly'] },
    { id: 'uc-3', title: 'Enable full-stack observability', description: 'Alarms, logs, traces, dashboards, and anomaly detection for everything', icon: 'globe', gapIds: ['g-alarms', 'g-logs', 'g-traces', 'g-dashboards', 'g-anomaly'] },
  ],

  agentActivity: [
    { time: 'Just now', action: 'Scanned 2 accounts, discovered 16 services across 3 regions' },
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
    },
  ],

  gaps: [
    { id: 'g-stale', category: 'alarms', appIds: ['all'], title: '52 stale/misconfigured alarms', description: 'Orphaned alarms for deleted resources, outdated thresholds, and duplicate alarms across accounts.', severity: 'critical', services: 8, fixCount: 52, fixLabel: '52 alarms to fix' },
    { id: 'g-alarms', category: 'alarms', appIds: ['meridian-trading', 'meridian-compliance'], title: '14 services have no alarms', description: 'EKS clusters, Lambda functions, Kinesis, MSK, and SageMaker endpoints have no alarm coverage.', severity: 'critical', services: 14, fixCount: 91, fixLabel: '91 new alarms' },
    { id: 'g-logs', category: 'logs', appIds: ['all'], title: '13 services missing logs', description: 'EKS pod logs, remaining ECS services, Aurora audit logs, and API Gateway access logs not configured.', severity: 'high', services: 13, fixCount: 13, fixLabel: '13 log configurations' },
    { id: 'g-traces', category: 'traces', appIds: ['all'], title: 'No distributed tracing', description: 'X-Ray/ADOT not enabled. No visibility into request flows across 22 services and 12 accounts.', severity: 'high', services: 22, fixCount: 22, fixLabel: '22 trace configurations' },
    { id: 'g-dashboards', category: 'dashboards', appIds: ['all'], title: '3 stale dashboards + 4 missing', description: 'Existing dashboards last updated 4 months ago. Missing: EKS Ops, Data Pipeline, ML Models, Cross-Region.', severity: 'medium', services: 22, fixCount: 7, fixLabel: '3 rebuilt + 4 new dashboards' },
    { id: 'g-anomaly', category: 'anomaly', appIds: ['all'], title: 'No anomaly detection', description: 'Historical data available but no anomaly detectors configured across any service.', severity: 'medium', services: 0, fixCount: 28, fixLabel: '28 anomaly detectors' },
    { id: 'g-slos', category: 'slos', appIds: ['meridian-payments'], title: 'No SLOs (PCI-DSS gap)', description: 'PCI-DSS compliance requires documented SLOs on payment processing. None configured.', severity: 'critical', services: 0, fixCount: 5, fixLabel: '5 SLOs' },
    { id: 'g-cross-account', category: 'cross-account', appIds: ['all'], title: 'No cross-account observability', description: '12 accounts operate in silos. No unified view of metrics, logs, or traces across accounts.', severity: 'high', services: 22, fixCount: 1, fixLabel: '1 observability access manager config' },
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
    projected: { total: 3400, breakdown: [
      { category: 'Metrics', amount: 1100, note: '+Container Insights, CW Agent metrics' },
      { category: 'Alarms', amount: 23.80, note: '238 alarms × $0.10' },
      { category: 'Dashboards', amount: 21, note: '7 dashboards × $3' },
      { category: 'Logs ingestion', amount: 1500, note: '+EKS pod logs, Aurora audit logs' },
      { category: 'Logs storage', amount: 480, note: 'Optimized with IA class' },
      { category: 'X-Ray traces', amount: 180, note: '~36M traces/mo' },
      { category: 'Anomaly detection', amount: 84, note: '28 detectors' },
    ]},
    savings: [
      { description: 'Move low-query logs to Infrequent Access', amount: 340 },
      { description: 'Remove 52 stale alarms', amount: 5.20 },
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

  agentActivity: [
    { time: 'Just now', action: 'Scanned 12 accounts across 5 regions, discovered 22 services' },
    { time: 'Just now', action: 'Grouped services into 4 applications by tags' },
    { time: 'Just now', action: 'Found 147 existing alarms — 52 stale or misconfigured' },
    { time: 'Just now', action: '3 dashboards found — last updated 4 months ago' },
    { time: 'Just now', action: 'Identified PCI-DSS compliance gaps' },
    { time: 'Just now', action: 'Ready — select gaps to fix or choose a use case' },
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
