import { useState, useEffect } from 'react'
import {
  CheckCircle, Warning, Sparkle, ChartBar, Bell, Clock,
  CaretDown, CaretUp, ArrowRight, Lightning, ShieldCheck,
  Coffee, ArrowClockwise, Microphone, WarningCircle, Globe,
  ChatTeardropDots, Cpu, HardDrives, Database, CloudArrowUp,
  ListChecks, MagnifyingGlassPlus, CaretRight, Eye
} from '@phosphor-icons/react'
import { coffee } from '../data/coffee'

/* ── Act indicator ── */
function ActIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
            i < current ? 'bg-status-active/20 text-status-active border border-status-active/30' :
            i === current ? 'bg-primary/20 text-primary border border-primary/30' :
            'bg-background-surface-2 text-foreground-disabled border border-border-muted'
          }`}>
            {i < current ? <CheckCircle size={12} weight="fill" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`w-8 h-px ${i < current ? 'bg-status-active/30' : 'bg-border-muted'}`} />}
        </div>
      ))}
    </div>
  )
}

function PromptPill({ text }) {
  return (
    <button className="px-3 py-1.5 rounded-full border border-primary/20 text-body-s text-primary hover:bg-primary/5 hover:border-primary/40 transition-all whitespace-nowrap">
      {text}
    </button>
  )
}

/* ── Observability Feed Item (expandable) ── */
function FeedItem({ severity, title, source, detail, time, expanded, onToggle, aiSummary }) {
  const sevConfig = {
    critical: { bg: 'bg-status-outage/10', border: 'border-status-outage/20', text: 'text-status-outage', icon: WarningCircle, label: 'CRITICAL' },
    warning: { bg: 'bg-status-blocked/10', border: 'border-status-blocked/20', text: 'text-status-blocked', icon: Warning, label: 'WARNING' },
    info: { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', icon: Eye, label: 'INFO' },
    resolved: { bg: 'bg-status-active/10', border: 'border-status-active/20', text: 'text-status-active', icon: CheckCircle, label: 'RESOLVED' },
  }
  const c = sevConfig[severity]
  const Icon = c.icon
  return (
    <div className={`border-b border-border-muted last:border-0 transition-all ${expanded ? 'bg-background-surface-1/30' : ''}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 py-3 px-2 text-left hover:bg-background-surface-2/30 rounded-lg transition-colors">
        <div className={`w-7 h-7 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          <Icon size={14} className={c.text} weight="fill" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[9px] font-bold tracking-wider ${c.text}`}>{c.label}</span>
            <span className="text-[10px] text-foreground-muted">{source}</span>
          </div>
          <span className="text-body-s text-foreground font-medium">{title}</span>
        </div>
        <span className="text-[10px] text-foreground-muted flex-shrink-0 mr-1">{time}</span>
        {expanded ? <CaretUp size={12} className="text-foreground-muted" /> : <CaretDown size={12} className="text-foreground-muted" />}
      </button>
      {expanded && (
        <div className="px-12 pb-3 space-y-2" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <p className="text-body-s text-foreground-muted">{detail}</p>
          {aiSummary && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/[0.04] border border-primary/10">
              <Sparkle size={12} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-body-s text-foreground-secondary">{aiSummary}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button className="h-6 px-2.5 rounded-md border border-border-muted text-[10px] text-foreground-secondary hover:bg-background-surface-2 transition-colors flex items-center gap-1">
              <ChatTeardropDots size={10} /> Chat with agent
            </button>
            <button className="h-6 px-2.5 rounded-md border border-border-muted text-[10px] text-foreground-secondary hover:bg-background-surface-2 transition-colors flex items-center gap-1">
              <MagnifyingGlassPlus size={10} /> Investigate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Service topology ── */
function TopoNode({ name, status, x, y }) {
  const colors = { healthy: '#22c55e', warning: '#f59e0b', critical: '#ef4444' }
  return (
    <g>
      <circle cx={x} cy={y} r="24" fill="#0a0e1a" stroke={colors[status]} strokeWidth="1.5" />
      <circle cx={x} cy={y} r="4" fill={colors[status]} fillOpacity="0.3" />
      <text x={x} y={y + 38} textAnchor="middle" fill="white" fillOpacity="0.7" fontSize="9" fontFamily="DM Sans">{name}</text>
    </g>
  )
}
function ServiceTopology() {
  const nodes = [
    { name: 'API Gateway', status: 'healthy', x: 200, y: 50 },
    { name: 'Auth', status: 'healthy', x: 60, y: 130 },
    { name: 'Payment', status: 'warning', x: 200, y: 130 },
    { name: 'Order', status: 'healthy', x: 340, y: 130 },
    { name: 'Checkout', status: 'healthy', x: 120, y: 220 },
    { name: 'Inventory', status: 'healthy', x: 280, y: 220 },
    { name: 'DynamoDB', status: 'healthy', x: 200, y: 310 },
  ]
  const edges = [[0,1],[0,2],[0,3],[2,4],[2,5],[4,6],[5,6],[3,5]]
  return (
    <svg viewBox="0 0 400 360" className="w-full">
      {edges.map(([f,t],i) => {
        const a=nodes[f],b=nodes[t], w=a.status==='warning'||b.status==='warning'
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={w?'#f59e0b':'#22c55e'} strokeWidth="1" strokeOpacity="0.25" strokeDasharray={w?'4 3':'none'}>{w&&<animate attributeName="strokeDashoffset" values="0;-7" dur="1s" repeatCount="indefinite"/>}</line>
      })}
      {nodes.map((n,i)=><TopoNode key={i} {...n}/>)}
    </svg>
  )
}

/* ── Memory chart ── */
function MemoryChart({ data, threshold }) {
  const width=480,height=160,padding={top:10,right:10,bottom:24,left:44}
  const chartW=width-padding.left-padding.right,chartH=height-padding.top-padding.bottom,max=800,min=400
  const points=data.map((v,i)=>({x:padding.left+(i/(data.length-1))*chartW,y:padding.top+chartH-((v-min)/(max-min))*chartH,v}))
  const linePath=points.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ')
  const areaPath=linePath+` L${points[points.length-1].x},${padding.top+chartH} L${points[0].x},${padding.top+chartH} Z`
  const thresholdY=padding.top+chartH-((threshold-min)/(max-min))*chartH
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs><linearGradient id="mem-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18"/><stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/></linearGradient></defs>
      {[400,500,600,700,800].map(v=>{const y=padding.top+chartH-((v-min)/(max-min))*chartH;return<g key={v}><line x1={padding.left} y1={y} x2={width-padding.right} y2={y} stroke="rgba(51,65,85,0.2)" strokeWidth="0.5"/><text x={padding.left-6} y={y+3} textAnchor="end" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">{v} MB</text></g>})}
      <line x1={padding.left} y1={thresholdY} x2={width-padding.right} y2={thresholdY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.6"/>
      <path d={areaPath} fill="url(#mem-fill)"/><path d={linePath} fill="none" stroke="#0ea5e9" strokeWidth="1.5"/>
      <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="3" fill="#0ea5e9"/>
      <text x={padding.left} y={height-4} fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">11:30 AM</text>
      <text x={padding.left+chartW/2} y={height-4} textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">1:00 PM</text>
      <text x={width-padding.right} y={height-4} textAnchor="end" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="DM Sans">2:30 PM</text>
    </svg>
  )
}

/* ── Typing animation ── */
function TypedText({ text, speed=20, onDone }) {
  const [displayed,setDisplayed]=useState('');const [done,setDone]=useState(false)
  useEffect(()=>{let i=0;const iv=setInterval(()=>{i++;setDisplayed(text.slice(0,i));if(i>=text.length){clearInterval(iv);setDone(true);onDone?.()}},speed);return()=>clearInterval(iv)},[text,speed])
  return <span>{displayed}{!done&&<span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse"/>}</span>
}

/* ── Data ── */
const promptPills = [
  "What's the health of my services?", "Show me all active alarms",
  "Which services have the highest error rates?", "Show me my service dependency map",
  "Find services with elevated latency", "Show me recent errors in my logs",
  "List my dashboards", "How are my containers doing?",
  "Top invoked Lambda functions", "Check my database instances health",
]

const feedItems = [
  { severity: 'critical', title: 'DynamoDB UsersTable ReadThrottles', source: 'DynamoDB', detail: 'ReadThrottleEvents spiked to 847 (threshold: 0). Auto-scaling triggered but not yet effective.', time: 'just now', aiSummary: 'This correlates with the PaymentService fault rate increase. The UsersTable is receiving 3× normal read traffic from the payment validation path. Auto-scaling should resolve within 5 minutes.' },
  { severity: 'critical', title: 'PaymentService — 12.3% fault rate', source: 'Lambda', detail: '847 faults out of 6,891 requests in the last 5 minutes. Timeout errors dominating.', time: '2m ago', aiSummary: 'Root cause appears to be DynamoDB throttling on UsersTable. Payment validation calls are timing out waiting for user lookups. This should self-resolve once DynamoDB auto-scaling completes.' },
  { severity: 'warning', title: 'API Gateway 5xx Errors above threshold', source: 'ApiGateway', detail: '5XXError rate is 5.2% (threshold: 1%). Correlated with upstream PaymentService faults.', time: '4m ago', aiSummary: 'These 5xx errors are downstream effects of the PaymentService issue. No action needed on API Gateway itself — fixing the upstream will resolve this.' },
  { severity: 'warning', title: 'Container memory approaching limit', source: 'ECS', detail: 'payment-processing-prod top container at 680 MB (85% of 800 MB limit). No alarm configured.', time: '12m ago', aiSummary: 'Weekend traffic typically increases 40-60%. Without monitoring, OOM kills are likely. I recommend setting up memory alarms before the weekend.' },
  { severity: 'info', title: 'Checkout canary all steps passing', source: 'Synthetics', detail: 'All 5 steps completed in 2.3s. Performance within baseline.', time: '6m ago', aiSummary: null },
  { severity: 'resolved', title: 'Analytics DB connection pool normalized', source: 'RDS', detail: 'Connection pool dropped from 85% to 62% after idle connection cleanup.', time: '18m ago', aiSummary: null },
]

const pendingTasks = [
  { id: 'T-1', title: 'Set up container memory monitoring', description: 'Create dashboard + alarm for payment-processing-prod memory at 87.5% threshold', priority: 'high', source: 'Recommendation' },
  { id: 'T-2', title: 'Enable DynamoDB auto-scaling alerts', description: 'Add alarm for when auto-scaling events fire on UsersTable', priority: 'medium', source: 'Feed analysis' },
  { id: 'T-3', title: 'Archive 23 unused custom metrics', description: 'Metrics not queried in 90+ days. Estimated savings: $47/month', priority: 'low', source: 'Cost optimization' },
]

const investigations = [
  { id: 'INV-1024', title: 'DynamoDB + PaymentService cascade', status: 'active', progress: '3 of 5 steps', started: '4m ago' },
  { id: 'INV-1023', title: 'Lambda cold start regression post-deploy', status: 'paused', progress: 'Waiting for data', started: '2h ago' },
]

const monitoredSystems = {
  applications: [
    { name: 'payment-service', type: 'Lambda', status: 'degraded', metrics: '24 metrics' },
    { name: 'checkout-service', type: 'ECS', status: 'healthy', metrics: '18 metrics' },
    { name: 'order-service', type: 'ECS', status: 'healthy', metrics: '15 metrics' },
    { name: 'auth-service', type: 'Lambda', status: 'healthy', metrics: '12 metrics' },
    { name: 'search-service', type: 'ECS', status: 'healthy', metrics: '9 metrics' },
  ],
  infrastructure: [
    { name: 'DynamoDB', count: '8 tables', status: 'warning' },
    { name: 'RDS', count: '3 instances', status: 'healthy' },
    { name: 'ECS Clusters', count: '4 clusters', status: 'healthy' },
    { name: 'Lambda', count: '23 functions', status: 'degraded' },
    { name: 'API Gateway', count: '2 APIs', status: 'warning' },
    { name: 'S3', count: '12 buckets', status: 'healthy' },
  ],
}

/* ── Main Coffee Flow ── */
export default function CoffeeView() {
  const [act, setAct] = useState(0)
  const [expandedFeed, setExpandedFeed] = useState(null)
  const [aiTypingDone, setAiTypingDone] = useState(false)
  const [settingUp, setSettingUp] = useState(false)
  const [setupDone, setSetupDone] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [confirmTypingDone, setConfirmTypingDone] = useState(false)

  useEffect(() => { if (act===1) { const t=setTimeout(()=>setShowChart(true),600); return ()=>clearTimeout(t) } }, [act])
  useEffect(() => { if (showChart) { const t=setTimeout(()=>setShowSuggestion(true),800); return ()=>clearTimeout(t) } }, [showChart])
  function handleSetup() { setSettingUp(true); setTimeout(()=>{setSettingUp(false);setSetupDone(true)},2000) }
  const iconMap = { chart: ChartBar, bell: Bell, clock: Clock }

  const statusDot = (s) => s==='healthy'?'bg-status-active':s==='degraded'?'bg-status-outage':s==='warning'?'bg-status-blocked':'bg-foreground-muted'
  const priorityStyle = (p) => p==='high'?'text-status-outage bg-status-outage/10 border-status-outage/20':p==='medium'?'text-status-blocked bg-status-blocked/10 border-status-blocked/20':'text-foreground-muted bg-background-surface-2 border-border-muted'

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-6 py-6">
        <h1 className="text-display-l font-normal tracking-tighter text-primary mb-1">CloudWatch Omni</h1>
        <p className="text-body-m text-foreground-muted mb-6">{coffee.greeting}</p>
        <ActIndicator current={act} total={4} />

        {/* ═══════ ACT 1: Homepage ═══════ */}
        {act === 0 && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2 h-12 rounded-xl bg-background-surface-1 border border-border-muted px-4 focus-within:border-primary/40 transition-colors">
              <Sparkle size={16} className="text-primary flex-shrink-0" />
              <input type="text" placeholder="Ask a question about your system" className="flex-1 bg-transparent text-body-m text-foreground placeholder:text-foreground-disabled focus:outline-none" />
              <Microphone size={16} className="text-foreground-muted flex-shrink-0" />
            </div>
            <div className="flex flex-wrap gap-2">
              {promptPills.map(p => <PromptPill key={p} text={p} />)}
            </div>

            {/* Recommendation */}
            <div className="ai-glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center"><Sparkle size={18} className="text-primary" /></div>
                <h3 className="text-heading-m font-normal text-foreground">Recommendation</h3>
              </div>
              <p className="text-body-m text-foreground-secondary leading-relaxed mb-2">
                <span className="text-foreground font-medium">Weekend traffic spike expected</span> (40-60% increase based on historical patterns). Your payment processing containers don't have memory monitoring configured.
              </p>
              <p className="text-body-s text-foreground-secondary mb-1"><span className="text-status-outage font-medium">Risk:</span> Potential out-of-memory (OOM) issues could disrupt customer transactions.</p>
              <p className="text-body-s text-foreground-secondary mb-4"><span className="text-primary font-medium">Recommendation:</span> Set up container memory monitoring with automated alerts.</p>
              <div className="flex gap-2">
                <button onClick={() => setAct(1)} className="h-8 px-4 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center gap-2"><Lightning size={14} /> Set up monitoring</button>
                <button className="h-8 px-4 rounded-lg border border-primary/20 text-body-s text-primary hover:bg-primary/5 transition-colors">Tell me more</button>
              </div>
            </div>

            {/* Observability Feed + Right sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Observability Feed — 2 cols */}
              <div className="lg:col-span-2 glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-heading-m font-normal text-foreground">Observability Feed</h3>
                    <span className="text-[10px] text-foreground-muted px-1.5 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">{feedItems.length} issues</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-status-active animate-pulse" />
                    <span className="text-[10px] text-foreground-muted">Agent monitoring</span>
                  </div>
                </div>
                <div className="space-y-0">
                  {feedItems.map((item, i) => (
                    <FeedItem key={i} {...item} expanded={expandedFeed === i} onToggle={() => setExpandedFeed(expandedFeed === i ? null : i)} />
                  ))}
                </div>
              </div>

              {/* Right sidebar: Tasks + Investigations */}
              <div className="space-y-3">
                {/* Pending Tasks */}
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks size={16} className="text-foreground-muted" />
                    <h3 className="text-heading-s font-normal text-foreground">Pending Tasks</h3>
                    <span className="text-[10px] text-foreground-muted px-1.5 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">{pendingTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {pendingTasks.map(task => (
                      <div key={task.id} className="p-2 rounded-lg border border-border-muted hover:bg-background-surface-2/30 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-body-s text-foreground font-medium">{task.title}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityStyle(task.priority)}`}>{task.priority}</span>
                        </div>
                        <p className="text-[10px] text-foreground-muted mb-2">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-foreground-disabled">{task.source}</span>
                          <button className="h-5 px-2 rounded text-[9px] font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">Approve</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Investigations */}
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MagnifyingGlassPlus size={16} className="text-foreground-muted" />
                    <h3 className="text-heading-s font-normal text-foreground">Investigations</h3>
                  </div>
                  <div className="space-y-2">
                    {investigations.map(inv => (
                      <div key={inv.id} className="flex items-center gap-3 p-2 rounded-lg border border-border-muted hover:bg-background-surface-2/30 transition-colors cursor-pointer">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${inv.status==='active'?'bg-primary animate-pulse':'bg-foreground-disabled'}`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-body-s text-foreground font-medium block truncate">{inv.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-foreground-muted">{inv.progress}</span>
                            <span className="text-[10px] text-foreground-disabled">· {inv.started}</span>
                          </div>
                        </div>
                        <CaretRight size={12} className="text-foreground-disabled flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Monitored Systems + Service Topology */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Monitored Systems */}
              <div className="glass-card p-4">
                <h3 className="text-heading-m font-normal text-foreground mb-1">Monitored Systems</h3>
                <p className="text-body-s text-foreground-muted mb-3">Applications and infrastructure under observation</p>

                <div className="mb-3">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-foreground-muted mb-2 block">Applications</span>
                  <div className="space-y-0">
                    {monitoredSystems.applications.map(app => (
                      <div key={app.name} className="flex items-center gap-2 py-1.5 border-b border-border-muted last:border-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusDot(app.status)}`} />
                        <span className="text-body-s text-foreground flex-1">{app.name}</span>
                        <span className="text-[10px] text-foreground-muted px-1 py-0.5 rounded bg-background-surface-2 border border-border-muted">{app.type}</span>
                        <span className="text-[10px] text-foreground-disabled">{app.metrics}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold tracking-wider uppercase text-foreground-muted mb-2 block">Infrastructure</span>
                  <div className="grid grid-cols-3 gap-2">
                    {monitoredSystems.infrastructure.map(infra => (
                      <div key={infra.name} className="p-2 rounded-lg border border-border-muted">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${statusDot(infra.status)}`} />
                          <span className="text-body-s text-foreground font-medium">{infra.name}</span>
                        </div>
                        <span className="text-[10px] text-foreground-muted">{infra.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Service Topology */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-heading-m font-normal text-foreground">Service Topology</h3>
                    <p className="text-body-s text-foreground-muted">Real-time dependency map</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {[['Healthy','bg-status-active'],['Warning','bg-status-blocked'],['Critical','bg-status-outage']].map(([l,c])=>(
                      <div key={l} className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${c}`}/><span className="text-[10px] text-foreground-muted">{l}</span></div>
                    ))}
                  </div>
                </div>
                <ServiceTopology />
              </div>
            </div>
          </div>
        )}

        {/* ═══════ ACT 2: Metric Discovery ═══════ */}
        {act === 1 && (
          <div className="space-y-3">
            <div className="ai-glass-card p-4">
              <div className="flex items-center gap-2 mb-2"><Sparkle size={14} className="text-primary" /><span className="text-body-s font-semibold text-primary">AI assistant</span></div>
              <p className="text-body-m text-foreground leading-relaxed">
                <TypedText text="I found your payment-processing-prod cluster. Here's the current memory usage across your containers — the top container is at 680 MB, which is 85% of the 800 MB limit." speed={18} onDone={() => setAiTypingDone(true)} />
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-heading-xs font-normal text-foreground">Metric query</span>
                <span className="text-[10px] text-foreground-muted px-2 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">{coffee.metricQuery.language}</span>
              </div>
              <pre className="text-pre font-mono bg-background-surface-2/40 rounded-lg p-3 text-foreground-secondary overflow-x-auto mb-2">{coffee.metricQuery.query}</pre>
            </div>
            {showChart && (
              <div className="glass-card p-4" style={{animation:'fadeIn 0.4s ease-out'}}>
                <div className="flex items-center justify-between mb-3"><h3 className="text-heading-s font-normal text-foreground">Container Memory Usage</h3><span className="text-body-s text-foreground-muted">payment-processing-prod</span></div>
                <MemoryChart data={coffee.memoryChartData} threshold={700} />
                <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-status-blocked/[0.06] border border-status-blocked/[0.15]"><Warning size={14} className="text-status-blocked" /><span className="text-body-s text-status-blocked">{coffee.metricQuery.highlight}</span></div>
              </div>
            )}
            {showSuggestion && (
              <div className="ai-glass-card p-4" style={{animation:'fadeIn 0.4s ease-out'}}>
                <div className="flex items-center gap-2 mb-3"><Sparkle size={14} className="text-primary" /><span className="text-body-s font-semibold text-primary">Recommended setup</span></div>
                <p className="text-body-s text-foreground-secondary mb-3">{coffee.aiSuggestion.message}</p>
                <div className="space-y-2 mb-4">{coffee.aiSuggestion.items.map(item=>{const Icon=iconMap[item.icon];return<div key={item.label} className="flex items-center gap-3 py-1.5"><Icon size={14} className="text-foreground-muted"/><span className="text-body-s text-foreground-muted w-32">{item.label}</span><span className="text-body-s text-foreground font-medium">{item.value}</span></div>})}</div>
                <p className="text-body-s text-foreground-muted mb-4">{coffee.aiSuggestion.footer}</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={()=>setAct(0)} className="h-8 px-4 rounded-lg border border-border-muted text-body-s text-foreground-secondary hover:bg-background-surface-2 transition-colors">Not now</button>
                  <button onClick={()=>{setAct(2);handleSetup()}} className="h-8 px-4 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center gap-2"><CheckCircle size={14}/> Yes, set it up</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ ACT 3: Setup ═══════ */}
        {act === 2 && (
          <div className="space-y-3">
            {settingUp && <div className="ai-glass-card p-4 flex items-center gap-3"><ArrowClockwise size={16} className="text-primary animate-spin"/><div><span className="text-body-s font-semibold text-primary block">Setting up monitoring...</span><span className="text-body-s text-foreground-muted">Creating dashboard, alarm, and notifications</span></div></div>}
            {setupDone && (<>
              <div className="glass-card p-4"><h3 className="text-heading-s font-normal text-foreground mb-3">Setup complete</h3><div className="space-y-3">{[{title:'Dashboard created',desc:`"${coffee.setup.dashboard.name}" with memory usage widget`},{title:'Alarm configured',desc:`"${coffee.setup.alarm.name}" — triggers at ${coffee.setup.alarm.threshold} for ${coffee.setup.alarm.evaluationPeriods} × ${coffee.setup.alarm.period}`},{title:'Notifications active',desc:`${coffee.setup.notification.type} → ${coffee.setup.notification.channel}`}].map((item,i)=><div key={i} className={`flex items-start gap-3 py-2 ${i<2?'border-b border-border-muted':''}`}><CheckCircle size={16} className="text-status-active mt-0.5" weight="fill"/><div><span className="text-body-s text-foreground font-medium block">{item.title}</span><span className="text-body-s text-foreground-muted">{item.desc}</span></div></div>)}</div></div>
              <div className="ai-glass-card p-4"><div className="flex items-center gap-2 mb-2"><Sparkle size={14} className="text-primary"/><span className="text-body-s font-semibold text-primary">AI assistant</span></div><p className="text-body-m text-foreground leading-relaxed"><TypedText text={coffee.setup.confirmationMessage} speed={15} onDone={()=>setConfirmTypingDone(true)}/></p></div>
              {confirmTypingDone && <div className="flex justify-end" style={{animation:'fadeIn 0.3s ease-out'}}><button onClick={()=>setAct(3)} className="h-8 px-4 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center gap-2">Back to homepage <ArrowRight size={14}/></button></div>}
            </>)}
          </div>
        )}

        {/* ═══════ ACT 4: Updated Homepage ═══════ */}
        {act === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 space-y-3">
                <div className="glass-card p-4"><div className="flex items-center justify-between mb-3"><h3 className="text-heading-m font-normal text-foreground">Health Briefing</h3><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-status-active"/><span className="text-body-s text-status-active">{coffee.healthBriefing.summary}</span></div></div><div className="flex items-center gap-2"><ShieldCheck size={16} className="text-status-active"/><span className="text-body-s text-foreground-secondary">{coffee.healthBriefing.servicesMonitored} services monitored · {coffee.updatedState.healthBriefing}</span></div></div>
                <div className="glass-card p-4"><h3 className="text-heading-m font-normal text-foreground mb-3">Live Updates</h3><div className="flex items-center gap-2 py-2"><CheckCircle size={14} className="text-status-active"/><span className="text-body-s text-foreground-muted">{coffee.updatedState.liveUpdates}</span></div></div>
              </div>
              <div className="space-y-3">
                <div className="glass-card p-4" style={{animation:'fadeIn 0.4s ease-out'}}><h3 className="text-heading-s font-normal text-foreground mb-3">Quick access</h3>{coffee.updatedState.quickAccess.map(item=><div key={item.name} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-background-surface-2 transition-colors cursor-pointer"><ChartBar size={16} className="text-primary"/><div className="flex-1"><span className="text-body-s text-foreground block">{item.name}</span><span className="text-[10px] text-foreground-muted">{item.type}</span></div>{item.isNew&&<span className="text-[9px] font-semibold text-primary px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">NEW</span>}</div>)}</div>
                <div className="ai-glass-card p-4"><div className="flex items-center gap-2 mb-2"><Sparkle size={14} className="text-primary"/><span className="text-body-s font-semibold text-primary">Weekend readiness</span></div><div className="space-y-2">{['Memory monitoring active','Alarm threshold set at 87.5%','Team notifications configured'].map(t=><div key={t} className="flex items-center gap-2"><CheckCircle size={12} className="text-status-active" weight="fill"/><span className="text-body-s text-foreground-secondary">{t}</span></div>)}</div><p className="text-body-s text-foreground-muted mt-3">You're covered for the weekend. Enjoy it.</p></div>
                <button onClick={()=>{setAct(0);setExpandedFeed(null);setAiTypingDone(false);setSettingUp(false);setSetupDone(false);setShowChart(false);setShowSuggestion(false);setConfirmTypingDone(false)}} className="w-full h-8 rounded-lg border border-border-muted text-body-s text-foreground-muted hover:bg-background-surface-2 transition-colors flex items-center justify-center gap-2"><ArrowClockwise size={14}/> Restart demo</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </main>
  )
}
