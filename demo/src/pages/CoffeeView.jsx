import { useState, useEffect } from 'react'
import {
  CheckCircle, Warning, Sparkle, ChartBar, Bell, Clock,
  CaretDown, CaretUp, ArrowRight, Lightning, ShieldCheck,
  Coffee, ArrowClockwise, Microphone, WarningCircle, Globe,
  ChatTeardropDots, Cpu, HardDrives, Database, CloudArrowUp,
  ListChecks, MagnifyingGlassPlus, CaretRight, Eye, X
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

function PromptPill({ text, onClick }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-full border border-primary/20 text-body-s text-primary hover:bg-primary/5 hover:border-primary/40 transition-all whitespace-nowrap">
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
    <svg viewBox="0 0 400 360" className="w-full max-h-[280px]">
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
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-[180px]">
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

const chatResponses = {
  "What's the health of my services?": "All 12 services are currently operational. However, **payment-service** is showing elevated latency (245ms avg, baseline 80ms) and **DynamoDB UsersTable** is experiencing read throttling. The remaining 10 services are within normal parameters.\n\nKey metrics:\n• 12M requests/hr across all services\n• 99.2% overall availability\n• 2 active situations requiring attention",
  "Show me all active alarms": "You have **4 active alarms**:\n\n1. 🔴 **DynamoDB UsersTable ReadThrottles** — ReadThrottleEvents is 847 (threshold: 0) — triggered just now\n2. 🔴 **PaymentService Fault Rate** — 12.3% fault rate (threshold: 5%) — triggered 2m ago\n3. 🟡 **API Gateway 5xx Errors** — 5.2% error rate (threshold: 1%) — triggered 4m ago\n4. 🟡 **Container Memory Warning** — 85% utilization (no alarm configured, detected by anomaly detection)",
  "Which services have the highest error rates?": "Top services by error rate in the last hour:\n\n1. **payment-service** — 12.3% fault rate (847 faults / 6,891 requests)\n2. **API Gateway** — 5.2% 5xx error rate (correlated with payment-service)\n3. **order-service** — 0.8% error rate (within normal range)\n4. **checkout-service** — 0.3% error rate (within normal range)\n\nThe payment-service errors are caused by DynamoDB throttling on UsersTable. This should self-resolve once auto-scaling completes (~3 minutes).",
  "Show me my service dependency map": "Your service topology shows 7 services across 3 tiers:\n\n**Tier 1 (Entry):** API Gateway → routes to Auth, Payment, Order\n**Tier 2 (Business Logic):** Payment → Checkout, Inventory; Order → Inventory\n**Tier 3 (Data):** Checkout, Inventory → DynamoDB\n\n⚠️ Payment service is currently in WARNING state — this is cascading to API Gateway (5xx errors). The dependency chain: DynamoDB throttling → Payment timeouts → API Gateway 5xx.",
  "Find services with elevated latency": "Services with latency above baseline:\n\n1. **payment-service** — 245ms avg (baseline: 80ms) — **3× above normal**\n2. **checkout-service** — 189ms avg (baseline: 120ms) — 1.6× above normal\n3. **order-service** — 134ms avg (baseline: 90ms) — 1.5× above normal\n\nRoot cause: DynamoDB UsersTable read throttling is causing cascading latency increases through the payment validation path.",
  "Show me recent errors in my logs": "Recent error patterns from the last 30 minutes:\n\n• **847 occurrences** — `TimeoutError: DynamoDB read timed out after 5000ms` in payment-service\n• **234 occurrences** — `HTTP 504 Gateway Timeout` in API Gateway access logs\n• **89 occurrences** — `ProvisionedThroughputExceededException` in DynamoDB\n• **12 occurrences** — `ConnectionPoolExhausted` in analytics-db (resolved)\n\nAll errors correlate to the DynamoDB throttling event that started 4 minutes ago.",
  "List my dashboards": "You have **6 dashboards**:\n\n1. 📊 **Production Overview** — Last viewed 2h ago\n2. 📊 **Payment Service Health** — Last viewed yesterday\n3. 📊 **API Gateway Metrics** — Last viewed 3 days ago\n4. 📊 **Lambda Performance** — Last viewed 1 week ago\n5. 📊 **DynamoDB Capacity** — Last viewed 2 weeks ago\n6. 📊 **Cost & Usage** — Last viewed 1 month ago\n\nWould you like me to open any of these, or create a new dashboard?",
  "How are my containers doing?": "I'll show you the health of your containers with key metrics from your EKS cluster.\n\nYour **payment-processing-prod** cluster has 10 containers running:\n• Top container memory: **680 MB** (85% of 800 MB limit) ⚠️\n• Average CPU utilization: **62%**\n• No OOM kills in the last 24h\n• 2 containers restarted last weekend due to OOM (no alarm caught it)\n\n**Recommendation:** Set up memory monitoring with a 700 MB threshold alarm before the weekend traffic spike.",
  "Top invoked Lambda functions": "Top 10 Lambda functions by invocation count (last hour):\n\n1. **payment-validator** — 6,891 invocations, 12.3% error rate ⚠️\n2. **auth-token-refresh** — 4,234 invocations, 0.1% error rate\n3. **order-processor** — 3,102 invocations, 0.8% error rate\n4. **notification-sender** — 2,890 invocations, 0% error rate\n5. **search-indexer** — 1,567 invocations, 0.2% error rate\n\nCold start avg: 340ms (up 15% since last deploy). The payment-validator errors are due to DynamoDB throttling.",
  "Check my database instances health": "Database health summary:\n\n**DynamoDB:**\n• UsersTable — ⚠️ Read throttling active, auto-scaling triggered\n• OrdersTable — ✅ Healthy, 45% read capacity\n• ProductsTable — ✅ Healthy, 23% read capacity\n\n**RDS (PostgreSQL):**\n• analytics-db — ✅ Connection pool at 62% (was 85%, now resolved)\n• reporting-db — ✅ Healthy, 34% CPU\n• config-db — ✅ Healthy, 12% CPU\n\nThe UsersTable throttling should resolve in ~3 minutes as auto-scaling provisions additional capacity.",
}

/* ── Chat Panel ── */
function ChatPanel({ query, onClose, onSetupComplete }) {
  const isSetup = query === '__setup_monitoring__'
  const response = isSetup ? null : (chatResponses[query] || "I'm analyzing your system. One moment...")
  const [setupPhase, setSetupPhase] = useState(0) // 0=chart, 1=suggestion visible, 2=setting up, 3=done
  const [chartVisible, setChartVisible] = useState(false)

  useEffect(() => {
    if (isSetup) {
      const t1 = setTimeout(() => setChartVisible(true), 600)
      const t2 = setTimeout(() => setSetupPhase(1), 1400)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [isSetup])

  function handleApprove() {
    setSetupPhase(2)
    setTimeout(() => {
      setSetupPhase(3)
      setTimeout(() => { onSetupComplete?.(); onClose() }, 2500)
    }, 2000)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-[60%] z-50 flex flex-col" style={{ animation: 'slideIn 0.25s ease-out' }}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm border-l border-border-muted" />
      <div className="relative flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-muted">
          <div className="flex items-center gap-2">
            <Sparkle size={16} className="text-primary" />
            <span className="text-body-s font-semibold text-foreground">AI Assistant</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 transition-colors text-foreground-muted" aria-label="Close"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!isSetup && (
            <>
              <div>
                <span className="text-[10px] font-semibold text-primary mb-1 block">@sarah</span>
                <div className="p-3 rounded-lg bg-background-surface-1 border border-border-muted">
                  <span className="text-body-s text-foreground">{query}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"><Sparkle size={10} className="text-primary" /></div>
                  <span className="text-[10px] font-semibold text-foreground-muted">ASSISTANT</span>
                </div>
                <div className="text-body-s text-foreground-secondary leading-relaxed whitespace-pre-line">
                  {response.split(/(\*\*.*?\*\*)/).map((part, i) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <span key={i} className="text-foreground font-medium">{part.slice(2, -2)}</span>
                      : part
                  )}
                </div>
              </div>
            </>
          )}

          {isSetup && (
            <>
              {/* AI message */}
              <div className="ai-glass-card p-4">
                <div className="flex items-center gap-2 mb-2"><Sparkle size={14} className="text-primary" /><span className="text-body-s font-semibold text-primary">AI assistant</span></div>
                <p className="text-body-m text-foreground leading-relaxed">
                  I found your payment-processing-prod cluster. Here's the current memory usage across your containers — the top container is at 680 MB, which is 85% of the 800 MB limit.
                </p>
              </div>

              {/* Query */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-heading-xs font-normal text-foreground">Metric query</span>
                  <span className="text-[10px] text-foreground-muted px-2 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">PromQL</span>
                </div>
                <pre className="text-pre font-mono bg-background-surface-2/40 rounded-lg p-3 text-foreground-secondary overflow-x-auto">{'topk(10, container_memory_working_set_bytes{cluster="payment-processing-prod"})'}</pre>
              </div>

              {/* Chart */}
              {chartVisible && (
                <div className="glass-card p-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-heading-s font-normal text-foreground">Container Memory Usage</h3>
                    <span className="text-body-s text-foreground-muted">payment-processing-prod</span>
                  </div>
                  <MemoryChart data={coffee.memoryChartData} threshold={700} />
                  <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-status-blocked/[0.06] border border-status-blocked/[0.15]">
                    <Warning size={14} className="text-status-blocked" />
                    <span className="text-body-s text-status-blocked">Your top container is currently at 680 MB (85% of 800 MB limit)</span>
                  </div>
                </div>
              )}

              {/* Suggestion */}
              {setupPhase >= 1 && setupPhase < 2 && (
                <div className="ai-glass-card p-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                  <div className="flex items-center gap-2 mb-3"><Sparkle size={14} className="text-primary" /><span className="text-body-s font-semibold text-primary">Recommended setup</span></div>
                  <p className="text-body-s text-foreground-secondary mb-3">Based on your container limits (800 MB) and current usage trends, I recommend:</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 py-1.5"><ChartBar size={14} className="text-foreground-muted" /><span className="text-body-s text-foreground-muted w-32">Dashboard widget</span><span className="text-body-s text-foreground font-medium">Payment Container Memory Usage</span></div>
                    <div className="flex items-center gap-3 py-1.5"><Bell size={14} className="text-foreground-muted" /><span className="text-body-s text-foreground-muted w-32">Alarm threshold</span><span className="text-body-s text-foreground font-medium">700 MB (87.5% of limit)</span></div>
                    <div className="flex items-center gap-3 py-1.5"><Clock size={14} className="text-foreground-muted" /><span className="text-body-s text-foreground-muted w-32">Evaluation period</span><span className="text-body-s text-foreground font-medium">2 consecutive 5-minute periods</span></div>
                  </div>
                  <p className="text-body-s text-foreground-muted mb-4">This will give you early warning before OOM events occur.</p>
                  <div className="flex gap-2 justify-end">
                    <button onClick={onClose} className="h-8 px-4 rounded-lg border border-border-muted text-body-s text-foreground-secondary hover:bg-background-surface-2 transition-colors">Not now</button>
                    <button onClick={handleApprove} className="h-8 px-4 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center gap-2"><CheckCircle size={14} /> Yes, set it up</button>
                  </div>
                </div>
              )}

              {/* Setting up */}
              {setupPhase === 2 && (
                <div className="ai-glass-card p-4 flex items-center gap-3"><ArrowClockwise size={16} className="text-primary animate-spin" /><div><span className="text-body-s font-semibold text-primary block">Setting up monitoring...</span><span className="text-body-s text-foreground-muted">Creating dashboard, alarm, and notifications</span></div></div>
              )}

              {/* Done */}
              {setupPhase === 3 && (
                <>
                  <div className="glass-card p-4">
                    <h3 className="text-heading-s font-normal text-foreground mb-3">Setup complete</h3>
                    <div className="space-y-3">
                      {[
                        { title: 'Dashboard created', desc: '"Payment Service Health" with memory usage widget' },
                        { title: 'Alarm configured', desc: '"Payment Container High Memory Alert" — triggers at 700 MB for 2 × 5 minutes' },
                        { title: 'Notifications active', desc: 'Slack via SNS → #payments-oncall' },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-start gap-3 py-2 ${i < 2 ? 'border-b border-border-muted' : ''}`}>
                          <CheckCircle size={16} className="text-status-active mt-0.5" weight="fill" />
                          <div><span className="text-body-s text-foreground font-medium block">{item.title}</span><span className="text-body-s text-foreground-muted">{item.desc}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="ai-glass-card p-4">
                    <div className="flex items-center gap-2 mb-2"><Sparkle size={14} className="text-primary" /><span className="text-body-s font-semibold text-primary">AI assistant</span></div>
                    <p className="text-body-m text-foreground leading-relaxed">
                      All set. I've created the "Payment Service Health" dashboard with your memory widget, and the alarm is now active. Your team will get Slack alerts in #payments-oncall if memory crosses 700 MB for 10 consecutive minutes. You're covered for the weekend.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border-muted">
          <div className="flex items-center gap-2 h-10 rounded-lg bg-background-surface-1 border border-border-muted px-3">
            <Sparkle size={14} className="text-primary flex-shrink-0" />
            <input type="text" placeholder="Ask a question about your system" className="flex-1 bg-transparent text-body-s text-foreground placeholder:text-foreground-disabled focus:outline-none" />
            <Microphone size={14} className="text-foreground-muted flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const [chatQuery, setChatQuery] = useState(null)
  const [setupComplete, setSetupComplete] = useState(false)
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
        <h1 className="text-[20px] font-normal text-foreground mb-4">{coffee.greeting}</h1>

        {/* ═══════ ACT 1: Homepage ═══════ */}
        {act === 0 && (
          <div className="space-y-2">
            {/* Success banner */}
            {setupComplete && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-status-active/[0.08] border border-status-active/20" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <CheckCircle size={16} className="text-status-active" weight="fill" />
                <div className="flex-1">
                  <span className="text-body-s text-foreground font-medium">Monitoring setup complete</span>
                  <span className="text-body-s text-foreground-muted ml-2">Dashboard, alarm, and Slack notifications are active for payment-processing-prod</span>
                </div>
                <button onClick={() => setSetupComplete(false)} className="text-foreground-muted hover:text-foreground"><X size={14} /></button>
              </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-2 h-12 rounded-xl bg-background-surface-1 border border-border-muted px-4 focus-within:border-primary/40 transition-colors">
              <Sparkle size={16} className="text-primary flex-shrink-0" />
              <input type="text" placeholder="Ask a question about your system" className="flex-1 bg-transparent text-body-m text-foreground placeholder:text-foreground-disabled focus:outline-none" />
              <Microphone size={16} className="text-foreground-muted flex-shrink-0" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {promptPills.map(p => <PromptPill key={p} text={p} onClick={() => setChatQuery(p)} />)}
            </div>

            {/* Observability Feed + Right sidebar */}
            {/* Feed 50% | Tasks 25% | Investigations 25% */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
              {/* Observability Feed — 2/4 cols */}
              <div className="lg:col-span-2 glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-heading-xs font-normal text-foreground">Observability Feed</h3>
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

              {/* Pending Tasks — 1/4 col */}
              <div className="glass-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks size={14} className="text-foreground-muted" />
                  <h3 className="text-heading-xs font-normal text-foreground">Pending Tasks</h3>
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
              <div className="glass-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MagnifyingGlassPlus size={14} className="text-foreground-muted" />
                  <h3 className="text-heading-xs font-normal text-foreground">Investigations</h3>
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

            {/* Monitored Systems + Service Topology */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {/* Monitored Systems */}
              <div className="glass-card p-3">
                <h3 className="text-heading-xs font-normal text-foreground mb-0.5">Monitored Systems</h3>
                <p className="text-[10px] text-foreground-muted mb-2">Applications and infrastructure under observation</p>

                <div className="mb-2">
                  <span className="text-[8px] font-bold tracking-wider uppercase text-foreground-disabled mb-1 block">Applications</span>
                  <div>
                    {setupComplete && (
                      <div className="flex items-center gap-1.5 py-1 border-b border-status-active/20 bg-status-active/[0.04] -mx-1 px-1 rounded" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <ChartBar size={12} className="text-status-active flex-shrink-0" />
                        <span className="text-[11px] text-status-active flex-1 font-medium">Payment Service Health</span>
                        <span className="text-[9px] text-status-active/70 px-1 py-0.5 rounded bg-status-active/10">Dashboard</span>
                        <span className="text-[9px] text-status-active/70">NEW</span>
                      </div>
                    )}
                    {monitoredSystems.applications.map(app => (
                      <div key={app.name} className="flex items-center gap-1.5 py-1 border-b border-border-muted/50 last:border-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusDot(app.status)} flex-shrink-0`} />
                        <span className="text-[11px] text-foreground flex-1 font-mono">{app.name}</span>
                        <span className="text-[9px] text-foreground-disabled px-1 py-0.5 rounded bg-background-surface-2/50">{app.type}</span>
                        <span className="text-[9px] text-foreground-disabled w-14 text-right">{app.metrics}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-[8px] font-bold tracking-wider uppercase text-foreground-disabled mb-1 block">Infrastructure</span>
                  <div className="grid grid-cols-3 gap-1">
                    {monitoredSystems.infrastructure.map(infra => (
                      <div key={infra.name} className="px-2 py-1.5 rounded-md border border-border-muted/50">
                        <div className="flex items-center gap-1 mb-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${statusDot(infra.status)}`} />
                          <span className="text-[11px] text-foreground font-medium">{infra.name}</span>
                        </div>
                        <span className="text-[9px] text-foreground-disabled">{infra.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compact recommendation */}
                <div className="p-2 rounded-md bg-purple-500/[0.06] border border-purple-400/20 flex items-center gap-2">
                  <Sparkle size={12} className="text-purple-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-foreground font-medium">Set up container memory monitoring</span>
                    <span className="text-[9px] text-foreground-muted ml-2">Weekend spike expected</span>
                  </div>
                  <button onClick={() => setChatQuery('__setup_monitoring__')} className="h-5 px-2 rounded text-[9px] font-medium bg-purple-500 text-white hover:bg-purple-400 transition-colors flex items-center gap-1 flex-shrink-0">
                    <Sparkle size={8} /> Set up
                  </button>
                </div>
              </div>

              {/* Service Topology */}
              <div className="glass-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-heading-xs font-normal text-foreground">Service Topology</h3>
                    <p className="text-[10px] text-foreground-muted">Real-time dependency map</p>
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
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      {chatQuery && <ChatPanel query={chatQuery} onClose={() => setChatQuery(null)} onSetupComplete={() => setSetupComplete(true)} />}
    </main>
  )
}
