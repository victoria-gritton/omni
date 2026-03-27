// Mock data for the Coffee Flow demo
// Friday afternoon proactive monitoring setup for payment containers

export const coffee = {
  // Act 1: Homepage state
  greeting: 'Good afternoon, Sarah',
  timestamp: '2:30 PM · Friday',
  healthBriefing: {
    servicesMonitored: 12,
    status: 'operational',
    summary: 'All core paths operational',
    services: [
      { name: 'payment-service', status: 'healthy', region: 'us-east-1' },
      { name: 'checkout-service', status: 'healthy', region: 'us-east-1' },
      { name: 'order-service', status: 'healthy', region: 'us-east-1' },
      { name: 'inventory-service', status: 'healthy', region: 'us-east-2' },
      { name: 'user-service', status: 'healthy', region: 'us-west-1' },
      { name: 'notification-service', status: 'healthy', region: 'us-west-1' },
      { name: 'search-service', status: 'healthy', region: 'us-west-2' },
      { name: 'auth-service', status: 'healthy', region: 'us-east-1' },
      { name: 'cdn-service', status: 'healthy', region: 'global' },
      { name: 'analytics-service', status: 'healthy', region: 'us-east-1' },
      { name: 'recommendation-service', status: 'healthy', region: 'us-west-2' },
      { name: 'logging-service', status: 'healthy', region: 'us-east-1' },
    ],
  },

  // AI proactive recommendation
  recommendation: {
    title: 'Weekend traffic prep: Memory monitoring gap detected',
    description: 'Your payment-processing-prod cluster handles 3× more traffic on weekends, but container memory metrics aren\'t being monitored. Last weekend, two containers restarted due to OOM — no alarm caught it.',
    severity: 'warning',
    confidence: 'high',
    action: 'Set up monitoring',
  },

  // Act 2: Metric discovery
  metricQuery: {
    query: 'topk(10, container_memory_working_set_bytes{cluster="payment-processing-prod"})',
    language: 'PromQL',
    timeRange: 'Last 3 hours',
    highlight: 'Your top container is currently at 680 MB (85% of 800 MB limit)',
  },

  // Simulated chart data — memory usage over 3 hours (36 points, 5-min intervals)
  memoryChartData: [
    520, 535, 540, 528, 545, 560, 555, 570, 580, 575,
    590, 600, 595, 610, 620, 615, 630, 640, 635, 645,
    650, 655, 648, 660, 665, 670, 658, 672, 678, 680,
    675, 682, 680, 678, 680, 680,
  ],

  // Act 2: AI suggestion
  aiSuggestion: {
    message: 'Based on your container limits (800 MB) and current usage trends, I recommend:',
    items: [
      { label: 'Dashboard widget', value: 'Payment Container Memory Usage', icon: 'chart' },
      { label: 'Alarm threshold', value: '700 MB (87.5% of limit)', icon: 'bell' },
      { label: 'Evaluation period', value: '2 consecutive 5-minute periods', icon: 'clock' },
    ],
    footer: 'This will give you early warning before OOM events occur.',
  },

  // Act 3: Setup confirmation
  setup: {
    dashboard: { name: 'Payment Service Health', widgets: 1 },
    alarm: {
      name: 'Payment Container High Memory Alert',
      threshold: '700 MB',
      evaluationPeriods: 2,
      period: '5 minutes',
      comparison: 'GreaterThanThreshold',
    },
    notification: {
      channel: '#payments-oncall',
      type: 'Slack via SNS',
    },
    confirmationMessage: 'All set. I\'ve created the "Payment Service Health" dashboard with your memory widget, and the alarm is now active. Your team will get Slack alerts in #payments-oncall if memory crosses 700 MB for 10 consecutive minutes. You\'re covered for the weekend.',
  },

  // Act 4: Updated homepage state
  updatedState: {
    quickAccess: [
      { name: 'Payment Service Health', type: 'dashboard', isNew: true },
    ],
    healthBriefing: 'Payment processing memory monitoring active',
    liveUpdates: 'No active alarms',
  },
}
