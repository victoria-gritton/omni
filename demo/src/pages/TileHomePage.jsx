import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkle, CaretDown, ChartBar, Bell, Heartbeat, X, ShareNetwork } from '@phosphor-icons/react'
import { useChatPanel } from '../components/ConsoleLayout'

const promptPills = [
  "Compare current traffic to last Tuesday at this time",
  "List my dashboards",
  "Top invoked Lambda functions",
  "Check my database instances health",
]

function Spark({ data, color = '#0ea5e9', h = 20 }) {
  const max = Math.max(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${h - (v / max) * h}`).join(' ')
  return (
    <svg viewBox={`0 0 100 ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: h }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Bars({ data, color = '#0ea5e9', h = 20 }) {
  const max = Math.max(...data)
  const gap = 1
  const bw = (100 - gap * (data.length - 1)) / data.length
  return (
    <svg viewBox={`0 0 100 ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: h }}>
      {data.map((v, i) => (
        <rect key={i} x={i * (bw + gap)} y={h - (v / max) * h} width={bw} height={(v / max) * h} fill={color} opacity={0.7} rx={1} />
      ))}
    </svg>
  )
}

const anomalies = [
  {
    title: 'order-service latency', value: '2.4s',
    sub: 'p99 up 12× in 35 min. ECS tasks OOM-killed 6 times, stuck in restart loop.',
    bg: '#2a1215', border: 'rgba(239,68,68,0.3)',
    spark: [200, 210, 220, 280, 450, 800, 1200, 1800, 2100, 2400],
    sparkColor: '#0ea5e9', link: '/console', linkLabel: 'Investigate',
  },
  {
    title: 'payment-service errors', value: '12.3%',
    sub: '847 failed payments since deploy #847.',
    bg: '#2a1215', border: 'rgba(239,68,68,0.3)',
    spark: [0.1, 0.1, 0.2, 0.8, 3.2, 7.1, 12.4, 13.1, 12.8, 12.3],
    sparkColor: '#0ea5e9', link: '/devops-console', linkLabel: 'Investigate',
  },
  {
    title: 'DynamoDB throttling', value: '847',
    sub: 'UsersTable throttle events. Auto-scaling active.',
    bg: '#2a2012', border: 'rgba(245,158,11,0.3)',
    spark: [10, 15, 22, 45, 120, 340, 580, 720, 800, 847],
    sparkColor: '#0ea5e9', link: '/explore', linkLabel: 'Explore logs',
  },
]

const trends = [
  {
    title: 'Checkout traffic', value: '+22%',
    sub: 'WoW. EU growth after DACH launch.',
    bg: '#12202a', border: 'rgba(14,165,233,0.25)',
    bars: [32, 35, 38, 40, 42, 45, 48, 52, 55, 58],
    barColor: '#0ea5e9', link: '/explore', linkLabel: 'Explore metrics',
  },
  {
    title: 'Auth latency improved', value: '42ms',
    sub: 'Down from 180ms. Connection pooling. 7d stable.',
    bg: '#122a1a', border: 'rgba(34,197,94,0.25)',
    bars: [90, 88, 85, 50, 30, 25, 22, 21, 21, 21],
    barColor: '#0ea5e9', link: '/explore', linkLabel: 'View trend',
  },
  {
    title: 'SQS queue depth', value: '2.1k',
    sub: 'order-processing queue growing.',
    bg: '#122a26', border: 'rgba(20,184,166,0.25)',
    bars: [20, 25, 30, 38, 50, 65, 80, 95, 100, 105],
    barColor: '#0ea5e9', link: '/explore', linkLabel: 'Explore traces',
  },
  {
    title: 'Deploys (24h)', value: '7',
    sub: 'Latest: payment-service v2.14.1',
    bg: '#1b232d', border: '#424650',
    bars: [1, 0, 2, 1, 0, 1, 2],
    barColor: '#0ea5e9', link: '/investigate', linkLabel: 'View changes',
  },
]

const recommendations = [
  {
    title: 'order-service', headline: 'Add a p99 latency SLO',
    sub: 'A 300ms threshold would have triggered 18 min earlier today.',
    chatQuery: 'Set up a p99 latency SLO for order-service', linkLabel: 'Review SLO',
  },
  {
    title: 'payment-processing-prod', headline: 'Configure memory alarms',
    sub: 'Container at 85% memory. No alarm. Weekend traffic +40%.',
    chatQuery: 'Set up container memory monitoring for payment-processing-prod', linkLabel: 'Review alarm',
  },
  {
    title: '3 services', headline: 'No alarms configured',
    sub: 'auth, search, inventory have zero alarms. Agent can auto-generate.',
    chatQuery: '__alarms__', linkLabel: 'Review alarms',
  },
]

const quickAccess = [
  { icon: Heartbeat, label: 'Health briefing', sub: '12 operational, 2 situations', link: '/monitor', accent: '#22c55e' },
  { icon: ChartBar, label: 'Dashboards', sub: 'payment-service · 2h ago', link: '/explore', accent: '#0ea5e9' },
  { icon: ShareNetwork, label: 'Service map', sub: '2 anomalies on payment path', link: '/monitor', accent: '#8b5cf6', isMap: true },
  { icon: Bell, label: 'Alarms', sub: '4 active', link: '/monitor', accent: '#ef4444' },
]

export default function TileHomePage() {
  const navigate = useNavigate()
  const { openChat } = useChatPanel()
  const [bannerVisible, setBannerVisible] = useState(true)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">Good afternoon</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-body-s text-foreground-muted">Scanned 14 services across 3 regions. 3 anomalies, 4 trends, 2 recommendations.</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {['All accounts', 'All teams', 'Last 3 hours'].map(label => (
              <button key={label} className="h-6 px-2 rounded text-[10px] text-foreground-muted hover:bg-[#1b232d] transition-colors flex items-center gap-1" style={{ background: '#161d26', border: '1px solid #424650' }}>
                {label} <CaretDown size={10} className="text-foreground-disabled" />
              </button>
            ))}
          </div>
        </div>

        {/* Chat bar */}
        <div className="flex items-center gap-2 h-10 rounded-lg px-4 focus-within:border-[#e040fb]/40 transition-colors mb-2" style={{ background: '#1b232d', border: '1px solid #424650' }}>
          <Sparkle size={14} className="text-foreground-muted flex-shrink-0" />
          <input type="text" placeholder="Ask a question about your system" className="flex-1 bg-transparent text-body-s text-foreground placeholder:text-foreground-disabled focus:outline-none" />
        </div>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {promptPills.map(p => (
            <button key={p} onClick={() => openChat(p)} className="px-2.5 py-1 rounded-full text-[11px] text-primary hover:bg-primary/10 transition-all whitespace-nowrap" style={{ border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.05)' }}>
              {p}
            </button>
          ))}
        </div>

        {/* Anomalies */}
        <h2 className="text-[10px] font-bold tracking-wider uppercase text-foreground-disabled mb-2">Anomalies</h2>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {anomalies.map(a => (
            <div key={a.title} onClick={() => navigate(a.link)} className="rounded-lg p-3 cursor-pointer hover:brightness-110 transition-all" style={{ background: a.bg, border: `1px solid ${a.border}` }}>
              <p className="text-[10px] text-foreground-muted tracking-wider font-bold uppercase">{a.title}</p>
              <p className="text-heading-l font-normal text-foreground mt-0.5">{a.value}</p>
              <p className="text-[11px] text-foreground-muted mt-1">{a.sub}</p>
              <div className="mt-2"><Spark data={a.spark} color={a.sparkColor} /></div>
              <p className="text-[11px] text-link mt-2">{a.linkLabel} →</p>
            </div>
          ))}
        </div>

        {/* Trends */}
        <h2 className="text-[10px] font-bold tracking-wider uppercase text-foreground-disabled mb-2">Trends</h2>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {trends.map(t => (
            <div key={t.title} onClick={() => navigate(t.link)} className="rounded-lg p-3 cursor-pointer hover:brightness-110 transition-all" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
              <p className="text-[10px] text-foreground-muted tracking-wider font-bold uppercase">{t.title}</p>
              <p className="text-heading-l font-normal text-foreground mt-0.5">{t.value}</p>
              <p className="text-[11px] text-foreground-muted mt-1">{t.sub}</p>
              <div className="mt-2"><Bars data={t.bars} color={t.barColor} /></div>
              <p className="text-[11px] text-link mt-2">{t.linkLabel} →</p>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <h2 className="text-[10px] font-bold tracking-wider uppercase text-foreground-disabled mb-2 flex items-center gap-1.5"><Sparkle size={10} className="text-[#e040fb]" weight="fill" /> Recommendations</h2>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {recommendations.map(r => (
            <div key={r.title} onClick={() => openChat(r.chatQuery)} className="rounded-lg p-3 cursor-pointer hover:brightness-110 transition-all" style={{ background: '#06080A', border: '1px solid rgba(224, 64, 251, 0.35)' }}>
              <p className="text-[10px] text-foreground-muted tracking-wider font-bold uppercase">{r.title}</p>
              <p className="text-heading-l font-normal text-foreground mt-1">{r.headline}</p>
              <p className="text-[11px] text-foreground-muted mt-1">{r.sub}</p>
              <p className="text-[11px] text-[#e040fb] mt-3">{r.linkLabel} →</p>
            </div>
          ))}
        </div>

        {/* Quick access */}
        <h2 className="text-[10px] font-bold tracking-wider uppercase text-foreground-disabled mb-2">Quick access</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickAccess.map(q => {
            const Icon = q.icon
            return (
              <div key={q.label} onClick={() => navigate(q.link)} className="rounded-lg p-3 cursor-pointer hover:brightness-110 transition-all flex flex-col items-center text-center" style={{ background: '#1b232d', border: '1px solid #424650' }}>
                {q.isMap ? (
                  <svg viewBox="0 0 100 50" className="w-full mb-2" style={{ height: 40 }}>
                    {/* Mini topology: 5 nodes with hot path */}
                    <circle cx="50" cy="8" r="5" fill="none" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="20" cy="28" r="5" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                    <circle cx="40" cy="28" r="5" fill="none" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="60" cy="28" r="5" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                    <circle cx="80" cy="28" r="5" fill="none" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="35" cy="45" r="4" fill="none" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="65" cy="45" r="4" fill="none" stroke="#22c55e" strokeWidth="1" />
                    {/* Edges */}
                    <line x1="50" y1="13" x2="20" y2="23" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
                    <line x1="50" y1="13" x2="40" y2="23" stroke="#424650" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="50" y1="13" x2="60" y2="23" stroke="#424650" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="50" y1="13" x2="80" y2="23" stroke="#424650" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="20" y1="33" x2="60" y2="23" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
                    <line x1="60" y1="33" x2="65" y2="41" stroke="#424650" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="20" y1="33" x2="35" y2="41" stroke="#424650" strokeWidth="0.5" strokeDasharray="2,2" />
                  </svg>
                ) : (
                  <Icon size={32} className="text-foreground-muted mb-2" weight="light" />
                )}
                <p className="text-body-s text-foreground font-medium">{q.label}</p>
                <p className="text-[10px] text-foreground-muted mt-0.5">{q.sub}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
