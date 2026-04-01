import { useNavigate } from 'react-router-dom'
import { Sparkle, CaretDown } from '@phosphor-icons/react'
import { useChatPanel } from '../components/ConsoleLayout'

const promptPills = [
  "Compare current traffic to last Tuesday at this time",
  "List my dashboards",
  "Top invoked Lambda functions",
  "Check my database instances health",
]

function Spark({ data, color = '#0ea5e9', h = 24, w = 80 }) {
  const max = Math.max(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: w, height: h }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Bars({ data, color = '#0ea5e9', h = 24, w = 80 }) {
  const max = Math.max(...data)
  const bw = w / data.length - 1
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: w, height: h }}>
      {data.map((v, i) => (
        <rect key={i} x={i * (bw + 1)} y={h - (v / max) * h} width={bw} height={(v / max) * h} fill={color} opacity={0.7} rx={1} />
      ))}
    </svg>
  )
}

const anomalies = [
  {
    title: 'order-service latency',
    value: '2.4s',
    sub: 'p99 up 12× in 35 min. ECS tasks OOM-killed 6 times, stuck in restart loop.',
    color: 'from-red-900/60 to-red-950/40',
    border: 'border-red-500/30',
    spark: [200, 210, 220, 280, 450, 800, 1200, 1800, 2100, 2400],
    sparkColor: '#ef4444',
    link: '/console',
    linkLabel: 'Investigate',
  },
  {
    title: 'payment-service errors',
    value: '12.3%',
    sub: '847 failed payments since deploy #847. Table reference points to non-existent resource.',
    color: 'from-red-900/50 to-red-950/30',
    border: 'border-red-500/20',
    spark: [0.1, 0.1, 0.2, 0.8, 3.2, 7.1, 12.4, 13.1, 12.8, 12.3],
    sparkColor: '#ef4444',
    link: '/devops-console',
    linkLabel: 'Investigate',
  },
  {
    title: 'DynamoDB read throttling',
    value: '847',
    sub: 'UsersTable throttle events spiking. Auto-scaling triggered, not yet effective.',
    color: 'from-amber-900/40 to-amber-950/30',
    border: 'border-amber-500/20',
    spark: [10, 15, 22, 45, 120, 340, 580, 720, 800, 847],
    sparkColor: '#f59e0b',
    link: '/explore',
    linkLabel: 'Explore logs',
  },
]

const trends = [
  {
    title: 'Checkout traffic',
    value: '+22%',
    sub: 'Week-over-week. Driven by EU growth after DACH launch.',
    color: 'from-sky-900/40 to-sky-950/30',
    border: 'border-sky-500/20',
    bars: [32, 35, 38, 40, 42, 45, 48, 52, 55, 58],
    link: '/explore',
    linkLabel: 'Explore metrics',
  },
  {
    title: 'Auth latency improved',
    value: '42ms',
    sub: 'Down from 180ms after connection pooling. Stable 7 days.',
    color: 'from-emerald-900/40 to-emerald-950/30',
    border: 'border-emerald-500/20',
    bars: [90, 88, 85, 50, 30, 25, 22, 21, 21, 21],
    link: '/explore',
    linkLabel: 'View trend',
  },
  {
    title: 'SQS queue depth',
    value: '2.1k',
    sub: 'order-processing queue growing steadily. Not yet alarming.',
    color: 'from-teal-900/40 to-teal-950/30',
    border: 'border-teal-500/20',
    bars: [20, 25, 30, 38, 50, 65, 80, 95, 100, 105],
    link: '/explore',
    linkLabel: 'Explore traces',
  },
  {
    title: 'Deploys (24h)',
    value: '7',
    sub: 'Latest: payment-service v2.14.1, 2h ago by Raj P.',
    color: 'from-slate-700/40 to-slate-800/30',
    border: 'border-slate-500/20',
    bars: [1, 0, 2, 1, 0, 1, 2],
    link: '/investigate',
    linkLabel: 'View changes',
  },
]

const recommendations = [
  {
    title: 'order-service',
    headline: 'Add a p99 latency SLO',
    sub: 'No SLO defined. A 300ms threshold would have triggered 18 min before the alarm fired today.',
    color: 'from-purple-900/40 to-purple-950/30',
    border: 'border-purple-500/20',
    link: '/configure',
    linkLabel: 'Set up SLO',
  },
  {
    title: 'payment-processing-prod',
    headline: 'Configure memory alarms',
    sub: 'Container at 85% memory with no alarm. Weekend traffic typically increases 40%.',
    color: 'from-purple-900/30 to-purple-950/20',
    border: 'border-purple-500/15',
    link: '/configure',
    linkLabel: 'Configure alarm',
  },
  {
    title: '3 services',
    headline: 'No alarms configured',
    sub: 'auth-service, search-service, and inventory-service have zero alarms. Agent can auto-generate based on baselines.',
    color: 'from-purple-900/30 to-purple-950/20',
    border: 'border-purple-500/15',
    link: '/configure',
    linkLabel: 'Review alarms',
  },
]

const quickAccess = [
  { label: 'Health briefing', sub: '12 services operational, 2 active situations, all core paths up', link: '/monitor', highlight: true },
  { label: 'payment-service dashboard', sub: 'Viewed 2h ago', link: '/explore' },
  { label: 'order-service logs', sub: 'Viewed 35m ago', link: '/explore' },
  { label: 'Production alarms', sub: '4 active', link: '/monitor' },
]

export default function TileHomePage() {
  const navigate = useNavigate()
  const { openChat } = useChatPanel()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">Good afternoon</h1>
            <div className="flex items-center gap-2 mt-1">
              <Sparkle size={12} className="text-primary" weight="fill" />
              <span className="text-body-s text-foreground-muted">Scanned 14 services across 3 regions. 3 anomalies, 4 trends, 2 recommendations.</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="h-6 px-2 rounded-md bg-background-surface-1 border border-border-muted text-[10px] text-foreground-muted hover:bg-background-surface-2 transition-colors flex items-center gap-1">
              All accounts <CaretDown size={10} className="text-foreground-disabled" />
            </button>
            <button className="h-6 px-2 rounded-md bg-background-surface-1 border border-border-muted text-[10px] text-foreground-muted hover:bg-background-surface-2 transition-colors flex items-center gap-1">
              All teams <CaretDown size={10} className="text-foreground-disabled" />
            </button>
            <button className="h-6 px-2 rounded-md bg-background-surface-1 border border-border-muted text-[10px] text-foreground-muted hover:bg-background-surface-2 transition-colors flex items-center gap-1">
              Last 3 hours <CaretDown size={10} className="text-foreground-disabled" />
            </button>
          </div>
        </div>

        {/* Chat bar */}
        <div className="flex items-center gap-2 h-10 rounded-xl bg-background-surface-1 border border-border-muted px-4 focus-within:border-primary/40 transition-colors mb-2">
          <Sparkle size={16} className="text-primary flex-shrink-0" />
          <input type="text" placeholder="Ask a question about your system" className="flex-1 bg-transparent text-body-s text-foreground placeholder:text-foreground-disabled focus:outline-none" />
        </div>

        {/* Prompt pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {promptPills.map(p => (
            <button key={p} onClick={() => openChat(p)} className="px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-[11px] text-primary hover:bg-primary/10 hover:border-primary/40 transition-all whitespace-nowrap">
              {p}
            </button>
          ))}
        </div>

        <h2 className="text-[10px] font-bold tracking-wider uppercase text-foreground-disabled mb-2">Anomalies</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {anomalies.map(a => (
            <div key={a.title} onClick={() => navigate(a.link)} className={`rounded-xl border ${a.border} bg-gradient-to-br ${a.color} p-4 cursor-pointer hover:brightness-110 transition-all`}>
              <p className="text-[10px] text-foreground-muted tracking-wider font-bold uppercase">{a.title}</p>
              <p className="text-heading-xl font-normal text-foreground mt-1">{a.value}</p>
              <p className="text-[11px] text-foreground-muted mt-1">{a.sub}</p>
              <div className="mt-3"><Spark data={a.spark} color={a.sparkColor} /></div>
              <p className="text-[11px] text-link mt-2">{a.linkLabel} →</p>
            </div>
          ))}
        </div>

        <h2 className="text-[10px] font-bold tracking-wider uppercase text-foreground-disabled mb-2">Trends</h2>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {trends.map(t => (
            <div key={t.title} onClick={() => navigate(t.link)} className={`rounded-xl border ${t.border} bg-gradient-to-br ${t.color} p-4 cursor-pointer hover:brightness-110 transition-all`}>
              <p className="text-[10px] text-foreground-muted tracking-wider font-bold uppercase">{t.title}</p>
              <p className="text-heading-xl font-normal text-foreground mt-1">{t.value}</p>
              <p className="text-[11px] text-foreground-muted mt-1">{t.sub}</p>
              <div className="mt-3"><Bars data={t.bars} /></div>
              <p className="text-[11px] text-link mt-2">{t.linkLabel} →</p>
            </div>
          ))}
        </div>

        <h2 className="text-[10px] font-bold tracking-wider uppercase text-foreground-disabled mb-2">Recommendations</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {recommendations.map(r => (
            <div key={r.title} onClick={() => navigate(r.link)} className={`rounded-xl border ${r.border} bg-gradient-to-br ${r.color} p-4 cursor-pointer hover:brightness-110 transition-all`}>
              <p className="text-[10px] text-foreground-muted tracking-wider font-bold uppercase">{r.title}</p>
              <p className="text-heading-l font-normal text-foreground mt-1">{r.headline}</p>
              <p className="text-[11px] text-foreground-muted mt-1">{r.sub}</p>
              <p className="text-[11px] text-link mt-3">{r.linkLabel} →</p>
            </div>
          ))}
        </div>

        <h2 className="text-[10px] font-bold tracking-wider uppercase text-foreground-disabled mb-2">Quick access</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickAccess.map(q => (
            <div key={q.label} onClick={() => navigate(q.link)} className={`rounded-xl border p-4 cursor-pointer transition-all ${q.highlight ? 'border-emerald-500/20 bg-emerald-900/10 hover:border-emerald-500/30' : 'border-border-muted bg-background-surface-1/30 hover:border-primary/30 hover:bg-background-surface-1/50'}`}>
              <p className="text-body-s text-foreground font-medium">{q.label}</p>
              <p className="text-[11px] text-foreground-muted mt-0.5">{q.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
