import { useState, useEffect } from 'react'
import { X, ShieldCheck as Shield, CheckCircle as CheckCircle2, CaretLeft as ChevronLeft, PencilSimple as Pencil } from '@phosphor-icons/react'

const SEVERITY_TABS = [
  { key: 'all',          label: 'All',            countColor: 'text-foreground',  activeBorder: 'border-[var(--primary)] ring-1 ring-[var(--primary)]/40' },
  { key: 'incident',     label: 'Incident-based',  countColor: 'text-red-400',             activeBorder: 'border-red-500 ring-1 ring-red-500/40' },
  { key: 'best-practice',label: 'Best practice',   countColor: 'text-cyan-400',            activeBorder: 'border-cyan-500 ring-1 ring-cyan-500/40' },
]

const ALARMS = [
  {
    id: 1,
    category: 'incident',
    severity: 'critical',
    confidence: 92,
    source: 'From Investigation #INV-2847',
    title: 'Add DatabaseConnections alarm for RDS instance prod-db-primary',
    description: 'Based on Investigation INV-2847 (connection pool exhaustion on Jan 15), this alarm would have detected the issue 15 minutes earlier.',
    benefits: ['Would catch 2 missed incidents', '15 min faster detection', 'Based on real incident'],
    preview: {
      summary: 'Add a DatabaseConnections alarm to detect connection pool exhaustion before customer impact.',
      detectionSpeed: '15 minutes faster', detectionBasis: 'Based on COE-2847',
      customerImpact: 'Prevented', customerImpactDetail: 'Early intervention possible',
      falsePositives: 'Low Risk', falsePositiveDetail: '80% threshold with headroom',
      recommendation: 'Set alarm at **80 connections** (80% of max_connections=100) with **2 consecutive datapoints** to avoid brief spikes during connection recycling.',
      config: { metric: 'DatabaseConnections', namespace: 'AWS/RDS', statistic: 'Maximum', period: '60s', threshold: 80, comparison: 'GreaterThanThreshold', evaluationPeriods: 2, datapointsToAlarm: 2, action: 'SNS: ops-critical' },
      simulation: {
        metricLabel: 'Connections',
        thresholdLabel: 'Threshold: 80',
        delay: '15 min Delay',
        earlyLabel: 'Early Detection',
        currentTimeline: [
          { time: '14:15 UTC', text: 'Marketing campaign launched' },
          { time: '14:48 UTC', text: 'Connection pool exhausted' },
          { time: '14:50 UTC', text: 'Customer impact begins' },
          { time: '15:03 UTC', text: 'Detected via customer reports' },
        ],
        proposedTimeline: [
          { time: '14:15 UTC', text: 'Marketing campaign launched' },
          { time: '14:33 UTC', text: 'Alarm triggers at 80 connections', highlight: true },
          { time: '14:48 UTC', text: 'Pool exhaustion prevented' },
          { time: '14:50 UTC', text: 'Customer impact prevented' },
        ],
      },
    },
  },
  {
    id: 2,
    category: 'incident',
    severity: 'high',
    confidence: 87,
    source: 'From Investigation #INV-3021',
    title: 'Add CPUUtilization alarm for ECS service payments-api',
    description: 'CPU spikes above 85% correlate with p99 latency degradation. A proactive alarm at 80% would give 5 minutes of lead time.',
    benefits: ['Prevents latency spikes', '5 min early warning', 'Based on real incident'],
    preview: {
      summary: 'Add a CPUUtilization alarm to detect CPU saturation before latency degrades.',
      detectionSpeed: '5 minutes faster', detectionBasis: 'Based on INV-3021',
      customerImpact: 'Reduced', customerImpactDetail: 'Prevents p99 latency spikes',
      falsePositives: 'Low Risk', falsePositiveDetail: '80% threshold avoids scaling noise',
      recommendation: 'Set alarm at **80% CPU** with **3 consecutive datapoints** over 1-minute periods to filter transient spikes.',
      config: { metric: 'CPUUtilization', namespace: 'AWS/ECS', statistic: 'Average', period: '60s', threshold: 80, comparison: 'GreaterThanThreshold', evaluationPeriods: 3, datapointsToAlarm: 3, action: 'SNS: ops-warning' },
      simulation: {
        metricLabel: 'CPU %',
        thresholdLabel: 'Threshold: 80%',
        delay: '5 min Delay',
        earlyLabel: 'Early Detection',
        currentTimeline: [
          { time: '09:12 UTC', text: 'Traffic spike begins' },
          { time: '09:38 UTC', text: 'CPU hits 92%, latency degrades' },
          { time: '09:41 UTC', text: 'p99 latency exceeds SLA' },
          { time: '09:43 UTC', text: 'Detected via latency alarm' },
        ],
        proposedTimeline: [
          { time: '09:12 UTC', text: 'Traffic spike begins' },
          { time: '09:33 UTC', text: 'Alarm triggers at 80% CPU', highlight: true },
          { time: '09:38 UTC', text: 'Auto-scaling initiated' },
          { time: '09:41 UTC', text: 'Latency stays within SLA' },
        ],
      },
    },
  },
  {
    id: 3,
    category: 'best-practice',
    severity: 'high',
    confidence: 84,
    source: 'Best practice rule',
    title: 'Add 5xx error rate alarm for ALB app-load-balancer',
    description: 'Your ALB currently has no error rate alarm. Industry best practice recommends alerting when 5xx rate exceeds 1% over 5 minutes.',
    benefits: ['Covers monitoring gap', 'Industry best practice', 'Protects customer experience'],
    preview: {
      summary: 'Add a 5xx error rate alarm to detect backend failures at the load balancer level.',
      detectionSpeed: 'Immediate', detectionBasis: 'AWS best practice',
      customerImpact: 'Prevented', customerImpactDetail: 'Catches errors before users report',
      falsePositives: 'Low Risk', falsePositiveDetail: '1% threshold filters noise',
      recommendation: 'Set alarm when **5xx rate exceeds 1%** over **5 minutes** with **2 consecutive datapoints**.',
      config: { metric: 'HTTPCode_ELB_5XX_Count', namespace: 'AWS/ApplicationELB', statistic: 'Sum', period: '300s', threshold: '1%', comparison: 'GreaterThanThreshold', evaluationPeriods: 2, datapointsToAlarm: 2, action: 'SNS: ops-warning' },
      simulation: {
        metricLabel: '5xx Rate',
        thresholdLabel: 'Threshold: 1%',
        delay: '8 min Delay',
        earlyLabel: 'Early Detection',
        currentTimeline: [
          { time: '11:02 UTC', text: 'Backend deploy starts' },
          { time: '11:14 UTC', text: '5xx rate hits 3.2%' },
          { time: '11:18 UTC', text: 'Users report errors' },
          { time: '11:22 UTC', text: 'Detected via support tickets' },
        ],
        proposedTimeline: [
          { time: '11:02 UTC', text: 'Backend deploy starts' },
          { time: '11:06 UTC', text: 'Alarm triggers at 1% error rate', highlight: true },
          { time: '11:08 UTC', text: 'Auto-rollback initiated' },
          { time: '11:14 UTC', text: 'Error rate normalized' },
        ],
      },
    },
  },
  {
    id: 4,
    category: 'best-practice',
    severity: 'medium',
    confidence: 78,
    source: 'Best practice rule',
    title: 'Add FreeStorageSpace alarm for RDS instance prod-db-primary',
    description: 'Storage is growing at 2.1 GB/week. At current rate, you will hit 80% capacity in ~45 days. An alarm at 20% remaining would give 2 weeks notice.',
    benefits: ['Prevents storage outage', '2 week early warning', 'Capacity planning'],
    preview: {
      summary: 'Add a FreeStorageSpace alarm to detect storage exhaustion before it causes downtime.',
      detectionSpeed: '2 weeks early', detectionBasis: 'Trend analysis',
      customerImpact: 'Prevented', customerImpactDetail: 'Avoids write failures',
      falsePositives: 'Very Low', falsePositiveDetail: 'Steady growth pattern',
      recommendation: 'Set alarm when **FreeStorageSpace falls below 20%** of total with **1 datapoint** over 5-minute period.',
      config: { metric: 'FreeStorageSpace', namespace: 'AWS/RDS', statistic: 'Minimum', period: '300s', threshold: '20 GB', comparison: 'LessThanThreshold', evaluationPeriods: 1, datapointsToAlarm: 1, action: 'SNS: ops-warning' },
      simulation: {
        metricLabel: 'Free GB',
        thresholdLabel: 'Threshold: 20 GB',
        delay: '14 day Delay',
        earlyLabel: 'Early Detection',
        currentTimeline: [
          { time: 'Day 1', text: 'Storage at 45 GB free' },
          { time: 'Day 30', text: 'Storage at 18 GB free' },
          { time: 'Day 44', text: 'Write failures begin' },
          { time: 'Day 44', text: 'Detected via application errors' },
        ],
        proposedTimeline: [
          { time: 'Day 1', text: 'Storage at 45 GB free' },
          { time: 'Day 30', text: 'Alarm triggers at 20 GB', highlight: true },
          { time: 'Day 31', text: 'Storage expansion planned' },
          { time: 'Day 44', text: 'Write failures prevented' },
        ],
      },
    },
  },
  {
    id: 5,
    category: 'incident',
    severity: 'critical',
    confidence: 95,
    source: 'From Incident #INC-1192',
    title: 'Add HealthyHostCount alarm for target group payments-tg',
    description: 'During the Jan 22 outage, healthy host count dropped to 1 before anyone noticed. This alarm triggers when count falls below 2.',
    benefits: ['Would catch 1 missed outage', 'Immediate detection', 'Based on real incident'],
    preview: {
      summary: 'Add a HealthyHostCount alarm to detect when healthy targets drop below safe levels.',
      detectionSpeed: 'Immediate', detectionBasis: 'Based on INC-1192',
      customerImpact: 'Prevented', customerImpactDetail: 'Catches host failures instantly',
      falsePositives: 'Very Low', falsePositiveDetail: 'Hard threshold on host count',
      recommendation: 'Set alarm when **HealthyHostCount falls below 2** with **1 datapoint** over 1-minute period.',
      config: { metric: 'HealthyHostCount', namespace: 'AWS/ApplicationELB', statistic: 'Minimum', period: '60s', threshold: 2, comparison: 'LessThanThreshold', evaluationPeriods: 1, datapointsToAlarm: 1, action: 'SNS: ops-critical' },
      simulation: {
        metricLabel: 'Hosts',
        thresholdLabel: 'Threshold: 2',
        delay: '12 min Delay',
        earlyLabel: 'Early Detection',
        currentTimeline: [
          { time: '03:15 UTC', text: 'Host health check fails' },
          { time: '03:22 UTC', text: 'Healthy count drops to 1' },
          { time: '03:27 UTC', text: 'Request queuing begins' },
          { time: '03:34 UTC', text: 'Detected via latency spike' },
        ],
        proposedTimeline: [
          { time: '03:15 UTC', text: 'Host health check fails' },
          { time: '03:22 UTC', text: 'Alarm triggers at count < 2', highlight: true },
          { time: '03:24 UTC', text: 'Replacement host launched' },
          { time: '03:27 UTC', text: 'Request queuing prevented' },
        ],
      },
    },
  },
  {
    id: 6,
    category: 'best-practice',
    severity: 'medium',
    confidence: 75,
    source: 'Cost optimization',
    title: 'Add EstimatedCharges alarm for billing account',
    description: 'Set a billing alarm to notify when estimated monthly charges exceed your budget threshold. Potential savings of $43.50/mo from early anomaly detection.',
    savings: '$43.50/mo',
    benefits: ['Cost protection', 'Budget awareness', 'Anomaly-based savings'],
    preview: {
      summary: 'Add a billing alarm to detect unexpected cost spikes before they accumulate.',
      detectionSpeed: 'Daily', detectionBasis: 'Cost optimization',
      customerImpact: 'N/A', customerImpactDetail: 'Financial protection only',
      falsePositives: 'Low Risk', falsePositiveDetail: 'Budget-based threshold',
      recommendation: 'Set alarm when **EstimatedCharges exceed budget threshold** checked **daily** with **1 datapoint**.',
      config: { metric: 'EstimatedCharges', namespace: 'AWS/Billing', statistic: 'Maximum', period: '21600s', threshold: 'Budget limit', comparison: 'GreaterThanThreshold', evaluationPeriods: 1, datapointsToAlarm: 1, action: 'SNS: billing-alerts' },
      simulation: {
        metricLabel: 'Cost $',
        thresholdLabel: 'Threshold: Budget',
        delay: '3 day Delay',
        earlyLabel: 'Early Detection',
        currentTimeline: [
          { time: 'Day 1', text: 'Normal spending pattern' },
          { time: 'Day 22', text: 'Anomalous resource created' },
          { time: 'Day 25', text: 'Budget exceeded by $43.50' },
          { time: 'Day 30', text: 'Detected in monthly review' },
        ],
        proposedTimeline: [
          { time: 'Day 1', text: 'Normal spending pattern' },
          { time: 'Day 22', text: 'Alarm triggers on cost spike', highlight: true },
          { time: 'Day 22', text: 'Anomalous resource identified' },
          { time: 'Day 25', text: 'Budget overrun prevented' },
        ],
      },
    },
  },
]

const SEVERITY_COLORS = {
  critical: 'bg-red-500/15 text-red-400',
  high: 'bg-amber-500/15 text-amber-400',
  medium: 'bg-cyan-500/15 text-cyan-400',
}

const CONFIDENCE_COLORS = {
  critical: 'bg-emerald-500/15 text-emerald-400',
  high: 'bg-emerald-500/15 text-emerald-400',
  medium: 'bg-blue-500/15 text-blue-400',
}

export default function AlarmRecommendations({ onClose }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [applied, setApplied] = useState({})
  const [creatingAll, setCreatingAll] = useState(false)
  const [createAllProgress, setCreateAllProgress] = useState(0)
  const [createAllDone, setCreateAllDone] = useState(false)
  const [detailAlarm, setDetailAlarm] = useState(null)
  const [detailTab, setDetailTab] = useState('overview')

  const filtered = activeFilter === 'all' ? ALARMS : ALARMS.filter(a => a.category === activeFilter)

  const handleApply = (id) => {
    setApplied(prev => ({ ...prev, [id]: 'applying' }))
    setTimeout(() => setApplied(prev => ({ ...prev, [id]: 'done' })), 1200)
  }

  const handleCreateAll = () => {
    setCreatingAll(true)
    setCreateAllProgress(0)
    setCreateAllDone(false)
    const ids = filtered.filter(a => applied[a.id] !== 'done').map(a => a.id)
    if (ids.length === 0) { setCreatingAll(false); setCreateAllDone(true); return }
    ids.forEach((id, i) => {
      setTimeout(() => {
        setApplied(prev => ({ ...prev, [id]: 'applying' }))
        setCreateAllProgress(((i + 1) / ids.length) * 100)
      }, i * 400)
      setTimeout(() => {
        setApplied(prev => ({ ...prev, [id]: 'done' }))
        if (i === ids.length - 1) {
          setCreatingAll(false)
          setCreateAllDone(true)
        }
      }, i * 400 + 800)
    })
  }

  const allFilteredDone = filtered.every(a => applied[a.id] === 'done')

  // Notify OverviewPage when all alarms are created
  useEffect(() => {
    const allDone = ALARMS.length > 0 && ALARMS.every(a => applied[a.id] === 'done')
    if (allDone) {
      window.dispatchEvent(new CustomEvent('ag-dash-all-alarms-created'))
    }
  }, [applied])

  // Detail view for a single alarm
  if (detailAlarm) {
    const p = detailAlarm.preview || {}
    const c = p.config || {}
    const TABS = [
      { key: 'overview', label: 'Overview' },
      { key: 'simulation', label: 'Historical Simulation' },
      { key: 'configuration', label: 'Configuration' },
    ]
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Detail header */}
        <div className="flex items-center justify-between h-10 border-b border-border-muted px-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setDetailAlarm(null)} className="text-foreground-muted hover:text-foreground-secondary transition-colors shrink-0" aria-label="Back">
              <ChevronLeft size={16} />
            </button>
            <span className="text-body-s font-medium text-foreground-secondary truncate">Preview: {detailAlarm.title.replace(/^Add /, '').split(' alarm')[0]} Alarm</span>
          </div>
          <button onClick={onClose} className="text-foreground-disabled hover:text-foreground-secondary transition-colors shrink-0" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border-muted px-4 shrink-0">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setDetailTab(t.key)}
              className={`px-3 py-2.5 text-[11px] font-medium transition-colors border-b-2 ${
                detailTab === t.key
                  ? 'border-[#0972d3] text-[#0972d3]'
                  : 'border-transparent text-foreground-muted hover:text-foreground-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {detailTab === 'overview' && (
            <>
              {/* Recommendation Summary */}
              <div>
                <p className="text-body-s font-semibold text-foreground mb-1">Recommendation Summary</p>
                <p className="text-[11px] text-foreground-muted leading-relaxed">{p.summary}</p>
              </div>

              {/* Expected Impact */}
              <div className="rounded-lg border-l-4 border-emerald-500 bg-background-surface-2 p-4">
                <p className="text-body-s font-semibold text-foreground mb-3">Expected Impact</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[11px] text-foreground-muted mb-0.5">Detection Speed</p>
                    <p className="text-[11px] font-semibold text-emerald-400">{p.detectionSpeed}</p>
                    <p className="text-[10px] text-foreground-disabled">{p.detectionBasis}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-foreground-muted mb-0.5">Customer Impact</p>
                    <p className="text-[11px] font-semibold text-emerald-400">{p.customerImpact}</p>
                    <p className="text-[10px] text-foreground-disabled">{p.customerImpactDetail}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-foreground-muted mb-0.5">False Positives</p>
                    <p className="text-[11px] font-semibold text-[#0972d3]">{p.falsePositives}</p>
                    <p className="text-[10px] text-foreground-disabled">{p.falsePositiveDetail}</p>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="rounded-lg border-l-4 border-border-muted bg-background-surface-2 p-4">
                <p className="text-body-s font-semibold text-foreground mb-1">Recommendation</p>
                <p className="text-[11px] text-foreground-muted leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: p.recommendation?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2">
                {applied[detailAlarm.id] === 'done' ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 size={14} /> Created
                    </span>
                    <span className="text-[11px] text-primary cursor-pointer hover:underline">View in Alarms →</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleApply(detailAlarm.id)}
                      disabled={applied[detailAlarm.id] === 'applying'}
                      className="rounded-lg bg-[#0972d3] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#065299] transition-colors disabled:opacity-50"
                    >
                      {applied[detailAlarm.id] === 'applying' ? 'Creating…' : 'Create alarm'}
                    </button>
                    <button
                      onClick={() => setDetailTab('configuration')}
                      className="rounded-lg border border-border-muted bg-background-surface-2 px-3 py-1.5 text-[11px] text-foreground-secondary hover:bg-input transition-colors"
                    >
                      Edit configuration
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {detailTab === 'simulation' && (() => {
            const sim = p.simulation || {}
            const metricLabel = sim.metricLabel || 'Value'
            const thresholdLabel = sim.thresholdLabel || 'Threshold'
            return (
            <div className="space-y-4">
              <p className="text-body-s font-semibold text-foreground">30-Day Historical Simulation</p>
              <p className="text-[11px] text-foreground-muted leading-relaxed">
                Showing how the {c.metric} alarm would have detected the incident from {p.detectionBasis} {p.detectionSpeed.toLowerCase()}.
              </p>

              {/* Stacked comparison cards */}
              <div className="space-y-3">
                {/* Current: No Alarm */}
                <div className="rounded-lg border border-border-muted bg-background-surface-2 overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <p className="text-[11px] font-semibold text-foreground">Current: No Alarm Configured</p>
                    <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-medium text-red-400">{sim.delay}</span>
                  </div>
                  {/* SVG Chart - no alarm */}
                  <div className="px-3">
                    <svg viewBox="0 0 400 140" className="w-full" style={{ height: 140 }}>
                      <text x="8" y="16" fontSize="11" fill="var(--foreground-muted)" fontWeight="500">{metricLabel}</text>
                      <text x="8" y="36" fontSize="10" fill="var(--foreground-disabled)">100</text>
                      <text x="8" y="76" fontSize="10" fill="var(--foreground-disabled)">50</text>
                      <text x="8" y="116" fontSize="10" fill="var(--foreground-disabled)">0</text>
                      <line x1="38" y1="22" x2="38" y2="120" stroke="var(--glass-border)" strokeWidth="0.5" />
                      <line x1="38" y1="120" x2="390" y2="120" stroke="var(--glass-border)" strokeWidth="0.5" />
                      <text x="45" y="133" fontSize="9" fill="var(--foreground-disabled)">Day 1</text>
                      <text x="200" y="133" fontSize="9" fill="var(--foreground-disabled)">Day 15</text>
                      <text x="350" y="133" fontSize="9" fill="var(--foreground-disabled)">Day 30</text>
                      <line x1="38" y1="36" x2="390" y2="36" stroke="var(--glass-border)" strokeWidth="0.3" strokeDasharray="4,4" />
                      <line x1="38" y1="76" x2="390" y2="76" stroke="var(--glass-border)" strokeWidth="0.3" strokeDasharray="4,4" />
                      <polyline points="50,105 110,100 180,94 240,82 310,60 340,40 370,24" fill="none" stroke="#0972d3" strokeWidth="2" strokeLinejoin="round" />
                      <circle cx="340" cy="40" r="5" fill="#d91515" />
                      <text x="300" y="34" fontSize="10" fill="#d91515" fontWeight="600">Missed</text>
                      <line x1="340" y1="40" x2="340" y2="120" stroke="#d91515" strokeWidth="1" strokeDasharray="3,3" />
                    </svg>
                  </div>
                  {/* Timeline */}
                  <div className="bg-background-surface-1/60 border-t border-border-muted px-4 py-3">
                    <p className="text-[11px] font-semibold text-red-400 mb-2">Timeline</p>
                    {(sim.currentTimeline || []).map((e, i) => (
                      <div key={i} className="flex gap-2 py-0.5">
                        <span className="text-[11px] text-foreground-disabled whitespace-nowrap shrink-0">{e.time}</span>
                        <span className="text-[11px] text-foreground-muted">{e.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed: With Alarm */}
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.03] overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <p className="text-[11px] font-semibold text-foreground">Proposed: With Alarm</p>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">{sim.earlyLabel}</span>
                  </div>
                  {/* SVG Chart - with alarm */}
                  <div className="px-3">
                    <svg viewBox="0 0 400 140" className="w-full" style={{ height: 140 }}>
                      <text x="8" y="16" fontSize="11" fill="var(--foreground-muted)" fontWeight="500">{metricLabel}</text>
                      <text x="8" y="36" fontSize="10" fill="var(--foreground-disabled)">100</text>
                      <text x="8" y="76" fontSize="10" fill="var(--foreground-disabled)">50</text>
                      <text x="8" y="116" fontSize="10" fill="var(--foreground-disabled)">0</text>
                      <line x1="38" y1="22" x2="38" y2="120" stroke="var(--glass-border)" strokeWidth="0.5" />
                      <line x1="38" y1="120" x2="390" y2="120" stroke="var(--glass-border)" strokeWidth="0.5" />
                      <text x="45" y="133" fontSize="9" fill="var(--foreground-disabled)">Day 1</text>
                      <text x="200" y="133" fontSize="9" fill="var(--foreground-disabled)">Day 15</text>
                      <text x="350" y="133" fontSize="9" fill="var(--foreground-disabled)">Day 30</text>
                      <line x1="38" y1="36" x2="390" y2="36" stroke="var(--glass-border)" strokeWidth="0.3" strokeDasharray="4,4" />
                      <line x1="38" y1="76" x2="390" y2="76" stroke="var(--glass-border)" strokeWidth="0.3" strokeDasharray="4,4" />
                      <line x1="38" y1="48" x2="390" y2="48" stroke="#16a34a" strokeWidth="1" strokeDasharray="6,3" />
                      <text x="42" y="44" fontSize="10" fill="#16a34a" fontWeight="500">{thresholdLabel}</text>
                      <polyline points="50,105 110,100 180,94 240,82 310,60 350,46 370,24" fill="none" stroke="#0972d3" strokeWidth="2" strokeLinejoin="round" />
                      <circle cx="350" cy="46" r="5" fill="#16a34a" />
                      <text x="310" y="38" fontSize="10" fill="#16a34a" fontWeight="600">Caught</text>
                      <line x1="350" y1="46" x2="350" y2="120" stroke="#16a34a" strokeWidth="1" strokeDasharray="3,3" />
                    </svg>
                  </div>
                  {/* Timeline */}
                  <div className="bg-emerald-500/[0.03] border-t border-emerald-500/20 px-4 py-3">
                    <p className="text-[11px] font-semibold text-emerald-400 mb-2">Timeline with Alarm</p>
                    {(sim.proposedTimeline || []).map((e, i) => (
                      <div key={i} className="flex gap-2 py-0.5">
                        <span className={`text-[11px] whitespace-nowrap shrink-0 ${e.highlight ? 'text-emerald-400' : 'text-foreground-disabled'}`}>{e.time}</span>
                        <span className={`text-[11px] ${e.highlight ? 'text-emerald-400 font-medium' : 'text-foreground-muted'}`}>
                          {e.highlight ? <><strong>Alarm triggers</strong> — {e.text.replace(/^Alarm triggers /, '')}</> : e.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            )
          })()}

          {detailTab === 'configuration' && (
            <div className="space-y-4">
              <p className="text-body-s font-semibold text-foreground">Alarm Configuration</p>

              {/* Shared input/select styles */}
              {(() => {
                const inputCls = "w-full rounded-md border border-border-muted bg-background-surface-1/60 px-3 py-2 text-body-s text-foreground outline-none focus:border-[#0972d3] focus:ring-1 focus:ring-[#0972d3]/30 transition-colors"
                const selectCls = inputCls + " appearance-none cursor-pointer"
                const labelCls = "text-[11px] font-medium text-foreground-muted mb-1.5 block"
                const readOnlyCls = "w-full rounded-md border border-border-muted bg-background-surface-2 px-3 py-2 text-body-s text-foreground-disabled cursor-not-allowed"
                const fieldCls = "border-l-2 border-border-muted bg-background-surface-2 rounded-r-md mb-px px-4 py-3"

                const dimension = detailAlarm.title.match(/for (.+)$/)?.[1] || ''
                const periodMap = { '10s': '10 seconds', '30s': '30 seconds', '60s': '1 minute', '300s': '5 minutes', '900s': '15 minutes', '3600s': '1 hour', '21600s': '6 hours', '86400s': '1 day' }
                const periodValue = periodMap[c.period] || c.period

                return (
                  <div className="space-y-0">
                    {/* Alarm Name */}
                    <div className={fieldCls}>
                      <label className={labelCls}>Alarm Name</label>
                      <input type="text" defaultValue={`${c.metric}-${detailAlarm.title.split(' ').pop()}`} className={inputCls} />
                    </div>

                    {/* Metric (read-only) */}
                    <div className={fieldCls}>
                      <label className={labelCls}>Metric</label>
                      <input type="text" value={c.metric} readOnly className={readOnlyCls} />
                    </div>

                    {/* Namespace (read-only) */}
                    <div className={fieldCls}>
                      <label className={labelCls}>Namespace</label>
                      <input type="text" value={c.namespace} readOnly className={readOnlyCls} />
                    </div>

                    {/* Dimension */}
                    <div className={fieldCls}>
                      <label className={labelCls}>Dimension</label>
                      <input type="text" defaultValue={dimension} className={inputCls} />
                    </div>

                    {/* Statistic (dropdown) */}
                    <div className={fieldCls}>
                      <label className={labelCls}>Statistic</label>
                      <select defaultValue={c.statistic} className={selectCls}>
                        {['Average', 'Sum', 'Minimum', 'Maximum', 'SampleCount', 'p99', 'p95', 'p90', 'p50'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Period (dropdown) */}
                    <div className={fieldCls}>
                      <label className={labelCls}>Period</label>
                      <select defaultValue={periodValue} className={selectCls}>
                        {Object.values(periodMap).map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Threshold — operator dropdown + numeric input */}
                    <div className={fieldCls}>
                      <label className={labelCls}>Threshold</label>
                      <div className="flex gap-2">
                        <select defaultValue={c.comparison} className={selectCls + " w-auto shrink-0"}>
                          <option value="GreaterThanThreshold">&gt; Greater than</option>
                          <option value="GreaterThanOrEqualToThreshold">&ge; Greater than or equal</option>
                          <option value="LessThanThreshold">&lt; Less than</option>
                          <option value="LessThanOrEqualToThreshold">&le; Less than or equal</option>
                        </select>
                        <input type="text" defaultValue={c.threshold} className={inputCls} />
                      </div>
                    </div>

                    {/* Datapoints to alarm — two number inputs */}
                    <div className={fieldCls}>
                      <label className={labelCls}>Datapoints to Alarm</label>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={c.datapointsToAlarm} min={1} max={100} className={inputCls + " w-16 text-center"} />
                        <span className="text-[11px] text-foreground-muted shrink-0">out of</span>
                        <input type="number" defaultValue={c.evaluationPeriods} min={1} max={100} className={inputCls + " w-16 text-center"} />
                        <span className="text-[11px] text-foreground-muted shrink-0">evaluation periods</span>
                      </div>
                    </div>

                    {/* Missing data treatment (dropdown) */}
                    <div className={fieldCls}>
                      <label className={labelCls}>Missing Data Treatment</label>
                      <select defaultValue="missing" className={selectCls}>
                        <option value="missing">Treat missing data as missing</option>
                        <option value="breaching">Treat missing data as breaching</option>
                        <option value="notBreaching">Treat missing data as not breaching</option>
                        <option value="ignore">Treat missing data as ignore</option>
                      </select>
                    </div>

                    {/* Actions */}
                    <div className={fieldCls}>
                      <label className={labelCls}>Notification Action</label>
                      <select defaultValue={c.action} className={selectCls}>
                        <option value="SNS: ops-critical">SNS: ops-critical</option>
                        <option value="SNS: ops-warning">SNS: ops-warning</option>
                        <option value="SNS: billing-alerts">SNS: billing-alerts</option>
                        <option value="SNS: dev-notifications">SNS: dev-notifications</option>
                      </select>
                    </div>
                  </div>
                )
              })()}

              <div className="pt-4">
                {applied[detailAlarm.id] === 'done' ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 size={14} /> Created
                    </span>
                    <span className="text-[11px] text-primary cursor-pointer hover:underline">View in Alarms →</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(detailAlarm.id)}
                    disabled={applied[detailAlarm.id] === 'applying'}
                    className="rounded-lg bg-[#0972d3] px-5 py-2.5 text-body-s font-medium text-white hover:bg-[#065299] transition-colors disabled:opacity-50"
                  >
                    {applied[detailAlarm.id] === 'applying' ? 'Creating…' : 'Create with this configuration'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between h-10 border-b border-border-muted px-3 shrink-0">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-primary" />
          <span className="text-body-s font-medium text-foreground-secondary">Recommended Alarms</span>
          <span className="rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-[10px] font-medium text-primary">6 found</span>
        </div>
        <button onClick={onClose} className="text-foreground-disabled hover:text-foreground-secondary transition-colors" aria-label="Close">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* Create all button + progress */}
        <div className="space-y-2">
          {createAllDone && !creatingAll ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-400">All {filtered.length} alarms created successfully</span>
              <span className="text-[11px] text-primary ml-auto cursor-pointer hover:underline">View in Alarms →</span>
            </div>
          ) : (
            <button
              onClick={handleCreateAll}
              disabled={creatingAll || allFilteredDone}
              className="w-full rounded-lg bg-[#0972d3] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#065299] transition-colors disabled:opacity-50"
            >
              {creatingAll ? 'Creating alarms…' : `Create all ${filtered.filter(a => applied[a.id] !== 'done').length} alarms`}
            </button>
          )}
          {creatingAll && (
            <div className="h-1.5 rounded-full bg-background-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0972d3] transition-all duration-300"
                style={{ width: `${createAllProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Alarm cards */}
        <div className="space-y-3">
          {filtered.map((alarm) => (
            <div key={alarm.id} className="glass-card p-3 space-y-2">
              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${SEVERITY_COLORS[alarm.severity]}`}>
                  {alarm.severity}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CONFIDENCE_COLORS[alarm.severity]}`}>
                  {alarm.confidence}% Confidence
                </span>
                <span className="text-[10px] text-foreground-disabled">{alarm.source}</span>
              </div>

              {/* Title & description */}
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold text-foreground leading-snug">{alarm.title}</p>
                {alarm.savings && (
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    Save {alarm.savings}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-foreground-muted leading-relaxed">{alarm.description}</p>

              {/* Benefits */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-[10px] text-foreground-disabled">
                  <span className="text-emerald-400">✓</span> {alarm.benefits[0]}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                {applied[alarm.id] === 'done' ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 size={12} /> Created
                    </span>
                    <span className="text-[11px] text-primary cursor-pointer hover:underline">View in Alarms →</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleApply(alarm.id)}
                      disabled={applied[alarm.id] === 'applying'}
                      className="rounded-lg bg-[#0972d3] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#065299] transition-colors disabled:opacity-50"
                    >
                      {applied[alarm.id] === 'applying' ? 'Creating…' : 'Create'}
                    </button>
                    <button
                      onClick={() => { setDetailAlarm(alarm); setDetailTab('overview') }}
                      className="rounded-lg border border-border-muted bg-background-surface-2 px-3 py-1.5 text-[11px] text-foreground-secondary hover:bg-input transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => { setDetailAlarm(alarm); setDetailTab('configuration') }}
                      className="rounded-lg border border-border-muted bg-background-surface-2 p-1.5 text-foreground-secondary hover:bg-input transition-colors"
                      aria-label="Edit alarm"
                    >
                      <Pencil size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
