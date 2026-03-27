import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  House, MagnifyingGlass, Pulse, MagnifyingGlassPlus,
  CodeBlock, GearSix, Star, Clock, Sparkle, Bell, User,
  ChatTeardropDots, X, PaperPlaneRight
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'

const navItems = [
  { icon: House, label: 'Home', subtitle: 'Overview', path: '/home' },
  { icon: MagnifyingGlass, label: 'Explore', subtitle: 'Unified search', path: '/explore' },
  { icon: Pulse, label: 'Monitor', subtitle: 'Active monitoring & alerts', path: '/monitor' },
  { icon: MagnifyingGlassPlus, label: 'Investigate', subtitle: 'Deep-dive analysis', path: '/investigate' },
  { icon: CodeBlock, label: 'Query Studio', subtitle: 'SQL & PromQL queries', path: '/query' },
  { icon: GearSix, label: 'Configure', subtitle: 'Settings & resources', path: '/configure' },
]

const favorites = [
  { label: 'Production Dashboard' },
  { label: 'Error Rate Alerts' },
]

const recents = [
  { label: 'Lambda Errors' },
  { label: 'API Gateway Metrics' },
]

const CHAT_RESPONSES = {
  default: {
    text: "I'm monitoring the incident. The payment-service tasks in east-2 are the root cause — memory exhaustion triggered a restart loop.",
    followUps: ['What caused this?', 'How many users affected?', 'Show the timeline'],
  },
  'what caused': {
    text: "The ECS tasks for payment-service-east-2 hit their 512 MB memory limit. The tasks were OOM-killed 6 times since 1:52 AM, creating a restart loop.",
    followUps: ['How do we fix it?', 'Show affected services', 'Should we rollback?'],
  },
  'how many': {
    text: "~2,400 failed checkouts in the last 10 minutes. 3 downstream services are degraded: checkout (1.8s), order (900ms), inventory (600ms).",
    followUps: ['Which regions?', 'Show error rates', 'What caused this?'],
  },
  'rollback': {
    text: "A rollback isn't recommended. No deploys in the last 6 hours — nothing to roll back to. The fix is increasing memory from 512 MB to 1 GB per task.",
    followUps: ['Approve the fix', 'Show me the runbook', 'What are the risks?'],
  },
  'post-mortem': {
    text: "I can generate a post-mortem draft with the full timeline, root cause analysis, and action items. Want me to start?",
    followUps: ['Yes, generate it', 'Show the timeline first', 'Not now'],
  },
  'fix': {
    text: "The recommended fix is to restart ECS tasks with 1 GB memory (up from 512 MB), one task at a time. No downtime. This matches your runbook: OOM restart → increase memory.",
    followUps: ['Approve & execute', 'What are the risks?', 'Show affected services'],
  },
  'risk': {
    text: "Low risk. Rolling restart — one task at a time, so there's always capacity. Memory increase from 512 MB to 1 GB is within the task definition limits. No config changes needed.",
    followUps: ['Approve & execute', 'Show the runbook', 'Who else is on-call?'],
  },
  'affected': {
    text: "3 downstream services degraded via dependency chain: checkout-service (1.8s latency), order-service (900ms), inventory-service (600ms). 3 healthy services unaffected.",
    followUps: ['Show the service map', 'What caused this?', 'How do we fix it?'],
  },
}

function getAIResponse(input) {
  const lower = input.toLowerCase()
  for (const [key, response] of Object.entries(CHAT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return response
  }
  return CHAT_RESPONSES.default
}

const PAGE_CONTEXT = {
  '/console': {
    greeting: "I'm investigating INC-2847. Payment-service in east-2 is hitting memory limits. What would you like to know?",
    prompts: ['What caused this?', 'How many users affected?', 'Should we rollback?', 'Generate post-mortem'],
    placeholder: 'Ask about this incident...',
  },
  '/home': {
    greeting: "Welcome. I can help you review your environment, set up monitoring, or answer questions about your services.",
    prompts: ['What needs attention?', 'Show me error trends', 'Any stale alarms?', 'Summarize my services'],
    placeholder: 'Ask about your environment...',
  },
  '/investigate': {
    greeting: "I can help you start a new investigation or dig into an existing one. Describe what you're seeing.",
    prompts: ['Why are checkout errors up?', 'Compare pre/post deploy', 'Correlate latency with errors', 'Show OOM events'],
    placeholder: 'Describe what you are investigating...',
  },
  '/explore': {
    greeting: "I can search across metrics, logs, traces, and alarms. What are you looking for?",
    prompts: ['Find high-error services', 'Show unused metrics', 'Search OOM events', 'List active alarms'],
    placeholder: 'Search or ask a question...',
  },
  '/monitor': {
    greeting: "I can help you review active alarms, set up new monitors, or analyze alert patterns.",
    prompts: ['Show active alarms', 'Which alarms are noisy?', 'Set up a new alarm', 'Alert trends this week'],
    placeholder: 'Ask about monitoring...',
  },
}

function ChatPanel({ onClose, path }) {
  const ctx = PAGE_CONTEXT[path] || PAGE_CONTEXT['/home']
  const [messages, setMessages] = useState([
    { role: 'ai', text: ctx.greeting }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  function sendMessage(text) {
    setMessages(prev => [...prev, { role: 'user', text }])
    setTyping(true)
    setTimeout(() => {
      const response = getAIResponse(text)
      setMessages(prev => [...prev, { role: 'ai', text: response.text, followUps: response.followUps }])
      setTyping(false)
    }, 800 + Math.random() * 600)
  }

  function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="w-[320px] flex-shrink-0 border-l border-border-muted bg-background-surface-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-muted flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkle size={16} className="text-orange-400" />
          <span className="text-heading-xs font-normal text-foreground">AI Assistant</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 transition-colors" aria-label="Close chat"><X size={14} className="text-foreground-muted" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-body-s ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background-surface-2 text-foreground rounded-bl-sm'}`}>{msg.text}</div>
            </div>
            {msg.followUps && i === messages.length - 1 && !typing && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.followUps.map(p => (
                  <button key={p} onClick={() => sendMessage(p)} className="px-2.5 py-1 rounded-full text-[11px] text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {messages.length === 1 && !typing && (
          <div className="flex flex-wrap gap-1.5">
            {ctx.prompts.map(p => (
              <button key={p} onClick={() => sendMessage(p)} className="px-2.5 py-1 rounded-full text-[11px] text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                {p}
              </button>
            ))}
          </div>
        )}
        {typing && <div className="flex justify-start"><div className="bg-background-surface-2 px-3 py-2 rounded-xl rounded-bl-sm"><span className="text-body-s text-foreground-muted animate-pulse">Thinking...</span></div></div>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-border-muted flex-shrink-0">
        <div className="flex items-center gap-2 h-10 px-3 border border-border-muted rounded-lg bg-input focus-within:border-foreground-disabled focus-within:shadow-ring-default transition-all">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={ctx.placeholder} className="flex-1 min-w-0 bg-transparent outline-none text-body-s text-foreground placeholder-foreground-muted" />
          <button type="submit" disabled={!input.trim()} className={`p-1.5 rounded-md transition-all ${input.trim() ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-foreground-disabled cursor-not-allowed'}`} aria-label="Send"><PaperPlaneRight size={14} /></button>
        </div>
      </form>
    </div>
  )
}

function PersonaCard({ onClose }) {
  const { persona, activeId, setActiveId, personaList } = usePersona()
  const { user, demo, application, services, coverage } = persona
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const serviceTypes = [...new Set(services.map(s => s.aws))]

  return (
    <div ref={ref} className="absolute right-0 top-10 w-[420px] glass-card p-5 z-50 shadow-2xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        {personaList.map(p => (
          <button key={p.id} onClick={() => setActiveId(p.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] transition-colors ${p.id === activeId ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-semibold text-primary">{p.user.name.split(' ').map(n => n[0]).join('')}</div>
            {p.user.name.split(' ')[0]}
          </button>
        ))}
      </div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-body-s">{user.name.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <p className="text-body-s font-semibold text-foreground">{user.name}</p>
            <p className="text-[11px] text-foreground-muted">{user.role} · {user.team}</p>
            <p className="text-[11px] text-foreground-disabled">{user.company}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><X size={14} /></button>
      </div>
      <div className="text-[10px] text-primary bg-primary/10 rounded-md px-2 py-1 mb-4 text-center font-medium">Demo persona — this card explains who this user is and why the page shows what it shows</div>
      <Section title="Application">
        <Row label="Name" value={application.name} />
        <Row label="Scale" value={application.description} />
        <Row label="Regions" value={application.regions.join(', ')} />
        <Row label="Accounts" value={`${application.accounts.length} accounts`} />
      </Section>
      <Section title="AWS Services">
        <Row label="Compute" value={demo.awsServiceBreakdown.compute} />
        <Row label="Data" value={demo.awsServiceBreakdown.data} />
        <Row label="Networking" value={demo.awsServiceBreakdown.networking} />
        <Row label="Messaging" value={demo.awsServiceBreakdown.messaging} />
        {demo.awsServiceBreakdown.ai && <Row label="AI/ML" value={demo.awsServiceBreakdown.ai} />}
        {demo.awsServiceBreakdown.storage && <Row label="Storage" value={demo.awsServiceBreakdown.storage} />}
        <Row label="Total" value={`${services.length} services using ${serviceTypes.length} AWS service types`} />
      </Section>
      <Section title="Observability Maturity">
        <Row label="Level" value={demo.observabilityMaturity} />
        <Row label="Detail" value={demo.observabilityDetail} />
        <Row label="Current state" value={`${coverage.withAlarms} alarms, ${coverage.withDashboards} dashboards, ${coverage.withTraces} traces`} />
      </Section>
      <Section title="Spending">
        <Row label="Cohort" value={demo.spendingCohort} />
        <Row label="AWS spend" value={demo.monthlyAWSSpend} />
        <Row label="CW spend" value={demo.cloudWatchSpend} />
      </Section>
      <Section title="Team & Operations">
        <Row label="Team size" value={`${demo.teamSize} engineers`} />
        <Row label="On-call" value={demo.oncallRotation ? 'Yes — rotation active' : 'No'} />
        <Row label="Incident tooling" value={demo.incidentTooling} />
      </Section>
      <Section title="Goals for CloudWatch Omni">
        <ul className="flex flex-col gap-1 mt-1">
          {demo.goals.map((g, i) => (<li key={i} className="text-[11px] text-foreground-muted flex gap-2"><span className="text-primary">•</span> {g}</li>))}
        </ul>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return <div className="mb-4"><h4 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-2">{title}</h4><div className="flex flex-col gap-1.5">{children}</div></div>
}
function Row({ label, value }) {
  return <div className="flex gap-2"><span className="text-[11px] text-foreground-muted w-24 flex-shrink-0">{label}</span><span className="text-[11px] text-foreground">{value}</span></div>
}

export default function ConsoleLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [showPersona, setShowPersona] = useState(false)
  const { persona } = usePersona()

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="gradient-bg-dark" />
      <div className="content-layer h-full flex w-full">
        {/* Sidebar */}
        <nav className={`${navOpen ? 'w-48' : 'w-14'} border-r border-border-muted flex flex-col flex-shrink-0 overflow-y-auto scrollbar-hide transition-all duration-200`}>
          <div className="px-3 pt-4 pb-3 flex items-center gap-2 cursor-pointer" onClick={() => setNavOpen(!navOpen)}>
            <svg width="24" height="28" viewBox="0 0 28 32" fill="none" className="flex-shrink-0">
              <circle cx="14" cy="12" r="9.5" stroke="#475569" strokeWidth="3.5" />
              <rect x="3" y="25" width="22" height="4" rx="2" fill="#0ea5e9" />
            </svg>
            {navOpen && <span className="text-body-s font-semibold text-foreground">CloudWatch Omni</span>}
          </div>

          <div className="px-3 pt-2">
            {navOpen && <span className="text-[9px] font-bold tracking-wider uppercase text-foreground-muted px-2 mb-2 block">Navigation</span>}
            <div className="space-y-0.5">
              {navItems.map(({ icon: Icon, label, subtitle, path, also }) => {
                const active = path && (location.pathname === path || (also && also.includes(location.pathname)))
                return (
                  <button key={label} onClick={() => path && navigate(path)} className={`w-full text-left rounded-lg flex items-start gap-2.5 px-2 py-2 transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-background-surface-2'}`} aria-label={label}>
                    <Icon size={18} className={`flex-shrink-0 mt-0.5 ${active ? 'text-primary' : 'text-foreground-muted'}`} />
                    {navOpen && (
                      <div>
                        <span className={`text-body-s font-medium block leading-tight ${active ? 'text-primary' : 'text-foreground'}`}>{label}</span>
                        <span className="text-[10px] text-foreground-muted leading-tight">{subtitle}</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {navOpen && (
            <>
              <div className="px-3 pt-4">
                <div className="flex items-center gap-1.5 px-2 mb-2">
                  <Star size={10} className="text-foreground-muted" />
                  <span className="text-[9px] font-bold tracking-wider uppercase text-foreground-muted">Favorites</span>
                </div>
                <div className="space-y-0.5">
                  {favorites.map(({ label }) => (
                    <button key={label} className="w-full text-left rounded-lg px-2 py-1.5 text-body-s text-foreground-secondary hover:bg-background-surface-2 transition-colors">{label}</button>
                  ))}
                </div>
              </div>

            </>
          )}

          <div className="flex-1" />
        </nav>


        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 border-b border-border-muted px-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 bg-background-surface-1 rounded-lg px-3 py-1.5 w-80">
              <MagnifyingGlass size={14} className="text-foreground-muted" />
              <span className="text-body-s text-foreground-disabled">Search services, metrics, traces...</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#/" className="text-body-s text-link">← Demos</a>
              <button className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><GearSix size={16} /></button>
              <button className="relative p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted">
                <Bell size={16} /><div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-outage" />
              </button>
              <button onClick={() => setChatOpen(!chatOpen)} className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-body-s transition-colors ${chatOpen ? 'bg-primary/10 text-primary' : 'bg-background-surface-1 border border-border-muted text-foreground-secondary hover:bg-background-surface-2'}`}>
                <ChatTeardropDots size={16} />
                Ask AI
              </button>
              <div className="relative">
                <button onClick={() => setShowPersona(!showPersona)} className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors text-[9px] font-semibold text-primary">
                  {persona.user.name.split(' ').map(n => n[0]).join('')}
                </button>
                {showPersona && <PersonaCard onClose={() => setShowPersona(false)} />}
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>

        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} path={location.pathname} />}
      </div>
    </div>
  )
}
