import { useState, useEffect, useRef } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import Button from './ui/button'

export default function InsightsCards({ isDark, onStatusFilter, viewMode, onCreateCanvas }) {
  const [expandedCard, setExpandedCard] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    setExpandedCard(null)
    if (onStatusFilter) onStatusFilter(null)
  }, [viewMode])

  const agentInsights = [
    {
      title: 'Orchestrator Agent Correctness Drop',
      time: '14 min ago',
      description: 'Correctness score dropped below 0.85 threshold after index update.',
      status: 'critical',
      value: '0.54', change: '−0.31',
      chart: Array(8).fill(0).map((_, i) => 90 - i * 5 + Math.random() * 8),
      metrics: [
        { label: 'Correctness', value: '0.54', change: '-37%', trend: 'down', data: [0.91, 0.88, 0.82, 0.74, 0.65, 0.58, 0.55, 0.54] },
        { label: 'Stale Retrievals', value: '23', change: '+820%', trend: 'up', data: [1, 2, 3, 5, 9, 14, 19, 23] },
        { label: 'P99 Latency', value: '12.4s', change: '+340%', trend: 'up', data: [2.8, 3.1, 4.2, 5.8, 7.4, 9.1, 11.2, 12.4] },
        { label: 'Traces Affected', value: '142', change: '+68%', trend: 'up', data: [42, 55, 68, 82, 95, 112, 128, 142] },
      ],
      rootCause: 'Knowledge base last refreshed 6 days ago. Embedding model drift in v2.3 index causing retrieval to return stale results — freshness filter not triggering web search fallback.',
      impact: 'Agent responses degraded for 23% of queries. No downstream service failures but user satisfaction scores declining.',
      timeline: [
        { time: '6d ago', text: 'Last KB refresh completed', color: 'muted' },
        { time: '2h ago', text: 'Correctness score crossed 0.85 threshold', color: 'muted' },
        { time: '14m ago', text: 'Agent flagged embedding drift as root cause', color: 'critical' },
      ],
    },
    {
      title: 'Order Agent Token Budget Overrun',
      time: '28 min ago',
      description: 'Averaging 48K tokens per invocation. Prompt compression could reduce usage by 41%.',
      status: 'warning',
      value: '$1,840', unit: '/mo',
      chart: Array(8).fill(0).map((_, i) => 60 + Math.random() * 30),
      metrics: [
        { label: 'Avg Tokens', value: '48K', change: '+62%', trend: 'up', data: [29, 32, 35, 38, 41, 44, 46, 48] },
        { label: 'Daily Cost', value: '$61', change: '+45%', trend: 'up', data: [32, 36, 40, 44, 48, 52, 57, 61] },
        { label: 'Compression', value: '41%', change: 'potential', trend: 'down', data: [0, 0, 0, 10, 20, 30, 38, 41] },
        { label: 'Invocations', value: '2.1K/d', change: '+18%', trend: 'up', data: [1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1] },
      ],
      rootCause: 'Order Agent system prompt includes full product catalog context on every invocation. Prompt compression and selective retrieval could reduce token usage significantly.',
      impact: 'Monthly token budget projected to exceed limit in 12 days at current growth rate. No service degradation yet.',
      timeline: [
        { time: '7d ago', text: 'Token usage began gradual increase', color: 'muted' },
        { time: '3d ago', text: 'Daily cost crossed $50 threshold', color: 'muted' },
        { time: '28m ago', text: 'Agent projected budget overrun', color: 'warning' },
      ],
    },
    {
      title: 'Guardrail Violations Trending Up',
      time: '43 min ago',
      description: 'Order Agent triggered guardrails 142 times in the last hour. PII leakage in 23% of blocked responses.',
      status: 'warning',
      value: '142', unit: 'triggers',
      chart: Array(8).fill(0).map((_, i) => 20 + i * 8 + Math.random() * 10),
      metrics: [
        { label: 'PII Violations', value: '33', change: '+340%', trend: 'up', data: [4, 8, 12, 16, 20, 25, 29, 33] },
        { label: 'Toxicity Blocks', value: '11', change: '+120%', trend: 'up', data: [3, 4, 5, 6, 7, 8, 10, 11] },
        { label: 'Off-topic', value: '98', change: '+85%', trend: 'up', data: [32, 42, 52, 62, 72, 82, 90, 98] },
        { label: 'Block Rate', value: '8.2%', change: '+4.1%', trend: 'up', data: [2.8, 3.4, 4.1, 4.9, 5.8, 6.6, 7.4, 8.2] },
      ],
      rootCause: 'Recent prompt template update removed output formatting constraints. Order Agent now occasionally includes raw user PII in responses.',
      impact: 'No data breach — all PII caught by guardrails. But block rate increasing means more failed user interactions.',
      timeline: [
        { time: '3h ago', text: 'Prompt template v2.4 deployed', color: 'muted' },
        { time: '1h ago', text: 'PII violation rate crossed 20%', color: 'muted' },
        { time: '43m ago', text: 'Agent flagged sustained guardrail trend', color: 'warning' },
      ],
    },
    {
      title: 'Retrieval Agent Auto-Scaled',
      time: '1h ago',
      description: 'Scaled 3→5 replicas after p99 exceeded 2s. Latency now 1.4s.',
      status: 'healthy',
      rootCause: 'Organic increase in retrieval queries following new product launch. Auto-scaling responded within SLA.',
      impact: 'Latency restored to target. Additional replicas cost ~$12/day. Will auto-scale down when load normalizes.',
      timeline: [
        { time: '2h ago', text: 'Query volume began increasing', color: 'muted' },
        { time: '1.5h ago', text: 'P99 latency crossed 2s threshold', color: 'muted' },
        { time: '1h ago', text: 'Auto-scaler added 2 replicas', color: 'healthy' },
      ],
    },
    {
      title: 'Eval Dataset Updated',
      time: '2h ago',
      description: 'Weekly eval score dropped 0.91→0.82. 3 new failure cases added.',
      status: 'healthy',
      rootCause: 'New edge cases from production traces added to evaluation dataset. Score drop reflects expanded test coverage, not regression.',
      impact: 'No production impact. Eval dataset now covers 3 additional failure modes for better monitoring.',
      timeline: [
        { time: '1d ago', text: 'Weekly eval pipeline triggered', color: 'muted' },
        { time: '4h ago', text: '3 new failure cases identified', color: 'muted' },
        { time: '2h ago', text: 'Dataset updated, score recalculated', color: 'healthy' },
      ],
    },
  ]

  const appInsights = [
    {
      title: 'Payment Service Error Spike',
      time: '14 min ago',
      description: 'Elevated 5xx errors since 14:32 UTC. Database connection pool exhaustion detected.',
      status: 'critical',
      value: '4.2%', change: '+2.8%',
      chart: Array(8).fill(0).map((_, i) => 20 + i * 5 + Math.random() * 10),
      metrics: [
        { label: 'Error Rate', value: '4.2%', change: '+2.8%', trend: 'up', data: [0.8, 1.1, 1.5, 2.0, 2.6, 3.2, 3.8, 4.2] },
        { label: 'DB Connections', value: '50/50', change: '+100%', trend: 'up', data: [28, 32, 36, 40, 44, 47, 49, 50] },
        { label: 'P99 Latency', value: '2.4s', change: '+380%', trend: 'up', data: [0.5, 0.6, 0.8, 1.1, 1.5, 1.8, 2.1, 2.4] },
        { label: 'Failed Txns', value: '1.2K', change: '+962%', trend: 'up', data: [48, 120, 240, 420, 600, 780, 1020, 1200] },
      ],
      rootCause: 'Connection pool saturation began at 14:32 UTC coinciding with a traffic spike. Pool max of 50 is insufficient for current load — queries are queuing and timing out after 30s.',
      impact: 'Payment processing delayed for ~12% of users. No data loss — transactions are retried. Revenue impact estimated at $2.4K/hr.',
      timeline: [
        { time: '45m ago', text: 'Traffic spike began from flash sale', color: 'muted' },
        { time: '20m ago', text: 'Connection pool reached 50/50', color: 'muted' },
        { time: '14m ago', text: 'Agent identified pool exhaustion as cause', color: 'critical' },
      ],
    },
    {
      title: 'Lambda Over-Provisioned Memory',
      time: '32 min ago',
      description: '3 Lambda functions with over-provisioned memory. Right-sizing could save 34%.',
      status: 'warning',
      value: '$2,340', unit: '/mo',
      chart: Array(8).fill(0).map((_, i) => 70 + Math.random() * 30),
      metrics: [
        { label: 'Monthly Cost', value: '$6.8K', change: '+12%', trend: 'up', data: [5.2, 5.5, 5.8, 6.0, 6.2, 6.4, 6.6, 6.8] },
        { label: 'Avg Memory', value: '82%', change: '-18%', trend: 'down', data: [95, 94, 92, 90, 88, 86, 84, 82] },
        { label: 'Potential Save', value: '34%', change: '$2.3K', trend: 'down', data: [0, 5, 10, 15, 20, 25, 30, 34] },
        { label: 'Functions', value: '3/12', change: 'flagged', trend: 'up', data: [0, 0, 1, 1, 2, 2, 3, 3] },
      ],
      rootCause: 'Three Lambda functions allocated 1024MB but peak usage is under 400MB. Memory was set during initial deployment and never right-sized.',
      impact: 'No performance impact. Pure cost optimization opportunity. Savings of $2,340/mo with zero risk to service quality.',
      timeline: [
        { time: '30d ago', text: 'Functions deployed with 1024MB', color: 'muted' },
        { time: '7d ago', text: 'Usage pattern stabilized below 400MB', color: 'muted' },
        { time: '32m ago', text: 'Agent flagged optimization opportunity', color: 'warning' },
      ],
    },
    {
      title: 'Catalog API Cache Opportunity',
      time: '1h ago',
      description: '78% of requests are for unchanged data. Enabling cache could improve response by 23%.',
      status: 'warning',
      value: '23%', unit: 'faster',
      chart: Array(8).fill(0).map((_, i) => 40 + Math.random() * 20),
      metrics: [
        { label: 'Cache Hit', value: '78%', change: '+22%', trend: 'up', data: [30, 38, 45, 52, 60, 66, 72, 78] },
        { label: 'Avg Response', value: '145ms', change: '-15%', trend: 'down', data: [180, 175, 170, 165, 160, 155, 150, 145] },
        { label: 'Total Requests', value: '42K', change: '+24%', trend: 'up', data: [28, 30, 32, 34, 36, 38, 40, 42] },
        { label: 'Unchanged', value: '78%', change: 'stable', trend: 'up', data: [74, 75, 76, 76, 77, 77, 78, 78] },
      ],
      rootCause: 'Catalog API serves product data that changes infrequently (avg 2 updates/day) but is queried 42K times/day without caching.',
      impact: 'Positive trend. Adding a 60s TTL cache would reduce origin load by 78% and improve p95 latency from 145ms to ~35ms.',
      timeline: [
        { time: '7d ago', text: 'Traffic pattern analysis began', color: 'muted' },
        { time: '3d ago', text: 'Unchanged request ratio crossed 75%', color: 'muted' },
        { time: '1h ago', text: 'Agent recommended cache implementation', color: 'warning' },
      ],
    },
    {
      title: 'Auto-Scaling Triggered',
      time: '1.5h ago',
      description: 'Catalog service scaled to 3 new instances based on CPU threshold.',
      status: 'healthy',
      rootCause: 'Organic traffic growth from marketing campaign. Auto-scaling responded within SLA parameters.',
      impact: 'Service remained healthy throughout. Additional instances cost ~$8/hr. Will scale down automatically.',
      timeline: [
        { time: '3h ago', text: 'Marketing campaign launched', color: 'muted' },
        { time: '2h ago', text: 'CPU crossed 70% threshold', color: 'muted' },
        { time: '1.5h ago', text: 'Auto-scaler added 3 instances', color: 'healthy' },
      ],
    },
    {
      title: 'CDN Cache Ratio Improved',
      time: '2h ago',
      description: 'CloudFront cache hit ratio improved to 94.2% after config change.',
      status: 'healthy',
      rootCause: 'Cache-Control headers updated from 1h to 24h for static assets. Origin requests reduced by 62%.',
      impact: 'Positive improvement. Origin load reduced, latency improved by ~40ms for cached assets. Cost savings of ~$120/mo.',
      timeline: [
        { time: '1d ago', text: 'Cache-Control header update deployed', color: 'muted' },
        { time: '6h ago', text: 'Cache hit ratio crossed 90%', color: 'muted' },
        { time: '2h ago', text: 'Ratio stabilized at 94.2%', color: 'healthy' },
      ],
    },
  ]

  const insights = viewMode === 'agents' ? agentInsights : appInsights

  const toggleCard = (index) => {
    const newExpanded = expandedCard === index ? null : index
    setExpandedCard(newExpanded)
    if (onStatusFilter) {
      onStatusFilter(newExpanded !== null && insights[newExpanded].status === 'critical' ? 'critical' : null)
    }
  }

  const statusDotColor = (status) => {
    if (status === 'critical') return '#f85149'
    if (status === 'warning') return '#ffb300'
    return '#3fb950'
  }

  const chartStrokeColor = (status) => {
    if (status === 'critical') return '#f85149'
    if (status === 'warning') return '#ffb300'
    return '#0ea5e9'
  }

  const trendColor = (trend, change) => {
    if (change === 'potential' || change === 'stable' || change === 'flagged') return isDark ? 'text-muted-foreground' : 'text-gray-400'
    if (trend === 'up') return 'text-red-400'
    return 'text-emerald-400'
  }

  const trendArrow = (trend) => trend === 'up' ? '↗' : '↘'

  const isTopInsight = (index) => index < 3

  // Mini area chart for metric cards
  const MiniChart = ({ data, color, height = 28 }) => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const w = 100
    const h = height
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - min) / range) * (h - 4)}`)
    const linePath = `M${points.join(' L')}`
    const yTop = min + range
    const yMid = min + range * 0.5
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: `${h}px` }} preserveAspectRatio="none">
        <line x1="0" y1="2" x2={w} y2="2" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
        <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
        <line x1="0" y1={h - 2} x2={w} y2={h - 2} stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
        <defs>
          <linearGradient id={`mc-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`${color}30`} />
            <stop offset="100%" stopColor={`${color}00`} />
          </linearGradient>
        </defs>
        <path d={`${linePath} L${w},${h} L0,${h} Z`} fill={`url(#mc-${color})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <div ref={containerRef}>
      {/* Insights list */}
      <div className="space-y-2">
        {insights.map((insight, index) => {
          const isExpanded = expandedCard === index
          const isTop = isTopInsight(index)
          const isCritical = insight.status === 'critical'
          const strokeColor = chartStrokeColor(insight.status)

          return (
            <div
              key={index}
              className={`rounded-lg px-3 py-2.5 transition-colors duration-150 ${
                isExpanded
                  ? isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]'
                  : isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.03]'
              }`}
            >
              {/* Row: dot + title + chevron — click target for expand/collapse */}
              <div className="flex items-start gap-2 cursor-pointer" onClick={() => toggleCard(index)}>
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: statusDotColor(insight.status) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <h5 className={`text-sm font-normal truncate ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{insight.title}</h5>
                      <span className={`text-xs flex-shrink-0 ${isDark ? 'text-muted-foreground' : 'text-gray-400'}`}>{insight.time}</span>
                    </div>
                    <CaretDown size={12} className={`flex-shrink-0 transition-transform duration-300 ${isDark ? 'text-muted-foreground' : 'text-gray-400'} ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                  <div className={`text-xs mt-1 leading-snug ${isDark ? 'text-foreground-muted' : 'text-gray-400'}`}>{insight.description}</div>

                  {/* Top 3: inline value + sparkline */}
                  {isTop && (
                    <div className="flex items-end justify-between gap-2 mt-2">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-base font-bold ${isDark ? 'text-foreground' : 'text-gray-900'}`}
                          style={isCritical ? { color: 'var(--severity-critical)', textShadow: '0 0 12px rgba(248,81,73,0.4)' } : undefined}
                        >
                          {insight.value}
                        </span>
                        {insight.unit && <span className={`text-xs ${isDark ? 'text-sky-400' : 'text-blue-500'}`}>{insight.unit}</span>}
                        {insight.change && <span className="text-xs text-red-400">{insight.change}</span>}
                      </div>
                      <svg viewBox="0 0 80 24" className="w-16 h-5 flex-shrink-0" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`spark-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={`${strokeColor}40`} />
                            <stop offset="100%" stopColor={`${strokeColor}00`} />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const data = insight.chart
                          const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1
                          const points = data.map((v, i) => `${(i / (data.length - 1)) * 80},${22 - ((v - min) / range) * 18}`)
                          const linePath = `M${points.join(' L')}`
                          return (
                            <>
                              <path d={`${linePath} L80,24 L0,24 Z`} fill={`url(#spark-${index})`} />
                              <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </>
                          )
                        })()}
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded content — aligned to left edge (same as status dot) */}
              <div
                className={`grid transition-[grid-template-rows,opacity] ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
                style={{ transitionDuration: '400ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <div className="overflow-hidden">
                  {/* KEY METRICS — only for top 3 insights */}
                  {isTop && insight.metrics && (
                    <div className="mb-3 transition-all duration-300" style={{ opacity: isExpanded ? 1 : 0, transform: isExpanded ? 'translateY(0)' : 'translateY(8px)', transitionDelay: isExpanded ? '100ms' : '0ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                      <div className={`text-xs font-medium mb-2 ${isDark ? 'text-muted-foreground' : 'text-gray-500'}`}>Key metrics</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {insight.metrics.map((m, mi) => (
                          <div
                            key={mi}
                            className="rounded-lg p-2"
                            style={{
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            }}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`text-xs truncate ${isDark ? 'text-muted-foreground' : 'text-gray-500'}`}>{m.label}</span>
                              <span className={`text-xs flex-shrink-0 ${trendColor(m.trend, m.change)}`}>
                                {m.change !== 'potential' && m.change !== 'stable' && m.change !== 'flagged' && trendArrow(m.trend)}{m.change}
                              </span>
                            </div>
                            <div className={`text-sm font-bold mb-1 ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{m.value}</div>
                            <MiniChart data={m.data} color={strokeColor} height={24} />
                            <div className="flex justify-between mt-0.5">
                              <span className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-gray-400'}`}>-60m</span>
                              <span className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-gray-400'}`}>-35m</span>
                              <span className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-gray-400'}`}>-10m</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ROOT CAUSE + IMPACT */}
                  {(insight.rootCause || insight.impact) && (
                    <div className={`grid ${insight.rootCause && insight.impact ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5 mb-3 transition-all duration-300`} style={{ opacity: isExpanded ? 1 : 0, transform: isExpanded ? 'translateY(0)' : 'translateY(8px)', transitionDelay: isExpanded ? '180ms' : '0ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                      {insight.rootCause && (
                        <div
                          className="rounded-lg p-2.5"
                          style={{
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          }}
                        >
                          <div className={`text-xs font-medium mb-1.5 ${isDark ? 'text-muted-foreground' : 'text-gray-500'}`}>Root cause</div>
                          <p className={`text-xs leading-relaxed ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>{insight.rootCause}</p>
                        </div>
                      )}
                      {insight.impact && (
                        <div
                          className="rounded-lg p-2.5"
                          style={{
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          }}
                        >
                          <div className={`text-xs font-medium mb-1.5 ${isDark ? 'text-muted-foreground' : 'text-gray-500'}`}>Impact</div>
                          <p className={`text-xs leading-relaxed ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>{insight.impact}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TIMELINE */}
                  {insight.timeline && (
                    <div className="mb-1 transition-all duration-300" style={{ opacity: isExpanded ? 1 : 0, transform: isExpanded ? 'translateY(0)' : 'translateY(8px)', transitionDelay: isExpanded ? '260ms' : '0ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
                      <div className={`text-xs font-medium mb-2 ${isDark ? 'text-muted-foreground' : 'text-gray-500'}`}>Timeline</div>
                      <div className="relative pl-3">
                        {/* Vertical line */}
                        <div className="absolute left-[3px] top-1 bottom-1 w-px" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                        <div className="space-y-2.5">
                          {insight.timeline.map((evt, ei) => {
                            const dotColor = evt.color === 'critical' ? '#f85149' : evt.color === 'warning' ? '#ffb300' : evt.color === 'healthy' ? '#3fb950' : isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'
                            return (
                              <div key={ei} className="flex items-start gap-3 relative">
                                <div className="absolute -left-3 top-[5px] w-[7px] h-[7px] rounded-full border-2" style={{ borderColor: dotColor, background: evt.color !== 'muted' ? dotColor : 'transparent' }} />
                                <span className={`text-xs w-14 flex-shrink-0 ${isDark ? 'text-muted-foreground' : 'text-gray-400'}`}>{evt.time}</span>
                                <span className={`text-xs ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{evt.text}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Open Investigation — critical only */}
                </div>
              </div>
              {isCritical && isExpanded && (
                <div className="mt-2 pl-4">
                  <Button
                    variant="outline"
                    size="sm"
                    isDark={isDark}
                    onClick={() => {
                      if (onCreateCanvas) onCreateCanvas(`Investigate: ${insight.title}`, { type: 'investigation', title: insight.title, summary: insight.description, isAgentInvestigation: viewMode === 'agents' })
                    }}
                  >
                    Open Investigation
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
