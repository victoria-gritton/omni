import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { House, Atom, Bell, ChartBar, Globe, TrendUp, Database, Gear, Lifebuoy, MagnifyingGlass, X } from '@phosphor-icons/react'
import { usePersona } from '../data/persona'

const navItems = [
  { icon: House, label: 'Home', path: '/day0' },
  { icon: Atom, label: 'Agents' },
  { icon: Bell, label: 'Alarms', path: '/console' },
  { icon: ChartBar, label: 'Dashboards' },
  { icon: Globe, label: 'Application Map' },
  { icon: TrendUp, label: 'Metrics' },
  { icon: Database, label: 'Logs' },
  { icon: Gear, label: 'Settings' },
  { icon: Lifebuoy, label: 'Getting Started' },
]

function Sec({ title, children }) {
  return <div className="mb-4"><h4 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-2">{title}</h4><div className="flex flex-col gap-1.5">{children}</div></div>
}
function Row({ label, value }) {
  return <div className="flex gap-2"><span className="text-[11px] text-foreground-muted w-24 flex-shrink-0">{label}</span><span className="text-[11px] text-foreground">{value}</span></div>
}

function PersonaCard({ onClose }) {
  const { persona, activeId, setActiveId, personaList } = usePersona()
  const { user, demo, applications, gaps, cost } = persona
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const allServices = applications.flatMap(a => a.services)
  const withAlarms = allServices.filter(s => s.hasAlarms).length
  const withLogs = allServices.filter(s => s.hasLogs).length
  const withTraces = allServices.filter(s => s.hasTraces).length
  const projectedDelta = cost.projected.reduce((s, p) => s + p.amount, 0)

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
      <div className="text-[10px] text-primary bg-primary/10 rounded-md px-2 py-1 mb-4 text-center font-medium">Demo persona — explains who this user is and why the page shows what it shows</div>
      <Sec title="Applications">
        {applications.map(app => <Row key={app.id} label={app.name} value={`${app.services.length} services`} />)}
        <Row label="Total" value={`${allServices.length} services across ${applications.length} apps`} />
      </Sec>
      <Sec title="AWS Services">
        <Row label="Compute" value={demo.awsServiceBreakdown.compute} />
        <Row label="Data" value={demo.awsServiceBreakdown.data} />
        <Row label="Networking" value={demo.awsServiceBreakdown.networking} />
        <Row label="Messaging" value={demo.awsServiceBreakdown.messaging} />
        {demo.awsServiceBreakdown.ai && <Row label="AI/ML" value={demo.awsServiceBreakdown.ai} />}
        {demo.awsServiceBreakdown.storage && <Row label="Storage" value={demo.awsServiceBreakdown.storage} />}
      </Sec>
      <Sec title="Observability Posture">
        <Row label="Level" value={demo.observabilityMaturity} />
        <Row label="Detail" value={demo.observabilityDetail} />
        <Row label="Alarms" value={`${withAlarms} of ${allServices.length} services`} />
        <Row label="Logs" value={`${withLogs} of ${allServices.length} services`} />
        <Row label="Traces" value={`${withTraces} of ${allServices.length} services`} />
        <Row label="Gaps" value={`${gaps.length} identified`} />
      </Sec>
      <Sec title="Spending">
        <Row label="Cohort" value={demo.spendingCohort} />
        <Row label="AWS spend" value={demo.monthlyAWSSpend} />
        <Row label="CW current" value={`$${cost.current.total.toLocaleString()}/mo`} />
        <Row label="CW projected" value={`$${(cost.current.total + projectedDelta).toLocaleString()}/mo`} />
      </Sec>
      <Sec title="Team & Operations">
        <Row label="Team size" value={`${demo.teamSize} engineers`} />
        <Row label="On-call" value={demo.oncallRotation ? 'Yes' : 'No'} />
        <Row label="Incident tooling" value={demo.incidentTooling} />
      </Sec>
      <Sec title="Goals">
        <ul className="flex flex-col gap-1 mt-1">
          {demo.goals.map((g, i) => <li key={i} className="text-[11px] text-foreground-muted flex gap-2"><span className="text-primary">•</span> {g}</li>)}
        </ul>
      </Sec>
    </div>
  )
}

export default function ConsoleLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)
  const [showPersona, setShowPersona] = useState(false)
  const { persona } = usePersona()

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="gradient-bg-dark" />
      <div className="content-layer h-full flex w-full">
        <nav className={`${expanded ? 'w-48' : 'w-14'} border-r border-border-muted flex flex-col py-3 gap-1 flex-shrink-0 transition-all duration-200`}>
          <div className={`mb-4 cursor-pointer flex items-center gap-2 ${expanded ? 'px-3' : 'justify-center'}`} onClick={() => setExpanded(!expanded)}>
            <svg width="28" height="32" viewBox="0 0 28 32" fill="none" className="flex-shrink-0">
              <circle cx="14" cy="12" r="9.5" stroke="#475569" strokeWidth="3.5" />
              <rect x="3" y="25" width="22" height="4" rx="2" fill="#0ea5e9" />
            </svg>
            {expanded && <span className="text-body-s font-semibold text-foreground">CloudWatch Omni</span>}
          </div>
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = path && location.pathname === path
            return (
              <button key={label} onClick={() => path && navigate(path)} className={`relative group h-10 rounded-lg flex items-center gap-2 transition-colors ${expanded ? 'px-3 mx-2' : 'w-10 justify-center mx-auto'} ${active ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:text-foreground hover:bg-background-surface-2'}`} aria-label={label}>
                <Icon size={20} className="flex-shrink-0" />
                {expanded && <span className="text-body-s whitespace-nowrap">{label}</span>}
                {!expanded && <span className="absolute left-12 px-2 py-1 rounded-md bg-background-surface-2 border border-border-muted text-[11px] text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">{label}</span>}
              </button>
            )
          })}
        </nav>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 border-b border-border-muted px-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 bg-background-surface-1 rounded-lg px-3 py-1.5 w-80">
              <MagnifyingGlass size={14} className="text-foreground-muted" />
              <span className="text-body-s text-foreground-disabled">Search services, metrics, traces...</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#/" className="text-body-s text-link">← Demos</a>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-status-active" />
                <span className="text-body-s text-foreground-muted">Live</span>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><Gear size={16} /></button>
              <button className="relative p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted">
                <Bell size={16} /><div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-outage" />
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
      </div>
    </div>
  )
}
