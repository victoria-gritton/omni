import { useState } from 'react'
import {
  PaperPlaneRight, ShieldCheck, ChartBar, Crosshair, Link as LinkIcon,
  Lightning, Bell, Clock, Sparkle, Robot, ArrowRight, Play,
  WaveTriangle, Eye, Cpu, FileText, Path, Package,
  Broadcast, Target, SignOut, CheckCircle,
  Archive, CaretDown, CaretUp, CaretRight, Info,
} from '@phosphor-icons/react'
import { persona } from '../data/persona'

const tierIcons = {
  bell: Bell, chart: ChartBar, wave: WaveTriangle, archive: Archive,
  cpu: Cpu, file: FileText, path: Path, container: Package,
  signal: Broadcast, target: Crosshair, route: SignOut, link: LinkIcon,
}

function BadgeWithTooltip({ text, tooltip, colorClass, bgClass }) {
  return (
    <span className={`relative group inline-flex items-center gap-1 text-[9px] ${colorClass} ${bgClass} px-1.5 py-0.5 rounded-full font-medium cursor-help`}>
      {text}
      <Info size={9} />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 px-3 py-2 rounded-lg bg-background-surface-2 border border-border-muted text-[10px] text-foreground-muted leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
        {tooltip}
      </span>
    </span>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange() }}
      className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${on ? 'bg-primary' : 'bg-foreground-disabled/30'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

function DetailTable({ details }) {
  if (!details || details.length === 0) return null
  const keys = Object.keys(details[0])
  return (
    <div className="mt-2 rounded-lg bg-background/40 border border-border-muted/30 overflow-hidden">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-border-muted/30">
            {keys.map(k => (
              <th key={k} className="text-left px-2.5 py-1.5 text-foreground-disabled font-medium uppercase tracking-wider">{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {details.map((row, i) => (
            <tr key={i} className={i < details.length - 1 ? 'border-b border-border-muted/20' : ''}>
              {keys.map(k => (
                <td key={k} className="px-2.5 py-1.5 text-foreground-muted">{row[k]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RunButton({ onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
      className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover px-2 py-1 rounded-md hover:bg-primary/10 transition-colors flex-shrink-0"
    >
      <Play size={10} weight="fill" />
      Run
    </button>
  )
}

function Tier1Item({ item }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = tierIcons[item.icon] || Lightning
  return (
    <div className="py-2">
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-7 h-7 rounded-lg bg-status-active/10 flex items-center justify-center text-status-active flex-shrink-0 mt-0.5">
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-body-s font-medium text-foreground">{item.title}</p>
            {item.details && (
              expanded
                ? <CaretDown size={10} className="text-foreground-disabled" />
                : <CaretRight size={10} className="text-foreground-disabled" />
            )}
          </div>
          <p className="text-[11px] text-foreground-muted mt-0.5">{item.description}</p>
        </div>
        <RunButton />
      </div>
      {expanded && <div className="ml-10"><DetailTable details={item.details} /></div>}
    </div>
  )
}

function Tier2Item({ item, enabled, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = tierIcons[item.icon] || Lightning
  return (
    <div className={`py-2 ${!enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-body-s font-medium text-foreground">{item.title}</p>
            {item.details && (
              expanded
                ? <CaretDown size={10} className="text-foreground-disabled" />
                : <CaretRight size={10} className="text-foreground-disabled" />
            )}
          </div>
          <p className="text-[11px] text-foreground-muted mt-0.5">{item.description}</p>
          {enabled && <p className="text-[10px] text-status-degraded/80 mt-1">⚡ {item.impact}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {enabled && <RunButton />}
          <Toggle on={enabled} onChange={onToggle} />
        </div>
      </div>
      {expanded && enabled && <div className="ml-10"><DetailTable details={item.details} /></div>}
    </div>
  )
}

function Tier3Item({ item }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = tierIcons[item.icon] || Lightning
  return (
    <div className="py-2 opacity-60">
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-7 h-7 rounded-lg bg-foreground-muted/10 flex items-center justify-center text-foreground-muted flex-shrink-0 mt-0.5">
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-body-s font-medium text-foreground">{item.title}</p>
            {expanded
              ? <CaretDown size={10} className="text-foreground-disabled" />
              : <CaretRight size={10} className="text-foreground-disabled" />
            }
          </div>
          <p className="text-[11px] text-foreground-muted mt-0.5">{item.suggestion}</p>
        </div>
        <span className="text-[10px] text-foreground-disabled flex-shrink-0 mt-1">After setup</span>
      </div>
      {expanded && (
        <div className="ml-10 mt-2 rounded-lg bg-background/40 border border-border-muted/30 p-3">
          <p className="text-[11px] text-foreground-muted"><span className="text-foreground font-medium">Question:</span> {item.question}</p>
        </div>
      )}
    </div>
  )
}

function ActivityItem({ item, isLast }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex flex-col items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5" />
        {!isLast && <div className="w-px flex-1 bg-border-muted mt-1" />}
      </div>
      <div className={isLast ? '' : 'pb-3'}>
        <p className="text-[11px] text-foreground-muted">{item.action}</p>
        <p className="text-[10px] text-foreground-disabled mt-0.5">{item.time}</p>
      </div>
    </div>
  )
}

export default function Day0Page() {
  const [input, setInput] = useState('')
  const { user, application, coverage, setup, agentActivity, services } = persona

  const [tier2State, setTier2State] = useState(() =>
    Object.fromEntries(setup.tier2.items.map(i => [i.id, i.defaultOn]))
  )
  const toggleTier2 = (id) => setTier2State(prev => ({ ...prev, [id]: !prev[id] }))

  const [showTier2, setShowTier2] = useState(true)
  const [showTier3, setShowTier3] = useState(false)

  const firstName = user.name.split(' ')[0]
  const tier2Count = Object.values(tier2State).filter(Boolean).length

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkle size={16} className="text-primary" weight="fill" />
          <span className="text-[11px] text-primary font-medium">Agent active</span>
        </div>
        <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">
          Welcome, {firstName}
        </h1>
        <p className="text-body-m text-foreground-muted mt-1">
          I just scanned your account and found {coverage.totalServices} services across {application.regions.length} regions. Let's get you set up.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-[1fr_300px] gap-6">

        {/* Left — setup flow */}
        <div className="flex flex-col gap-5">

          {/* Hero CTA card */}
          <div className="ai-glass-card p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <Robot size={22} />
              </div>
              <div className="flex-1">
                <h2 className="text-body-l font-semibold text-foreground">{setup.summary.headline}</h2>
                <p className="text-body-s text-foreground-muted mt-1">{setup.summary.subtext}</p>
                <p className="text-[11px] text-foreground-disabled mt-2">Click any item to see exactly what I'll do. Run individually or all at once.</p>
              </div>
            </div>
          </div>

          {/* Tier 1 — automatic */}
          <div className="glass-card p-5 border-l-2 border-l-status-active/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} weight="fill" className="text-status-active" />
              <h3 className="text-body-s font-semibold text-foreground">{setup.tier1.label}</h3>
              <BadgeWithTooltip text={setup.tier1.badge} tooltip={setup.tier1.badgeTooltip} colorClass="text-status-active" bgClass="bg-status-active/10" />
            </div>
            <p className="text-[11px] text-foreground-muted mb-3 ml-6">{setup.tier1.description}</p>
            <div className="flex flex-col divide-y divide-border-muted/50 ml-6">
              {setup.tier1.items.map(item => (
                <Tier1Item key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Tier 2 — toggles */}
          <div className="glass-card p-5 border-l-2 border-l-status-degraded/50">
            <button
              onClick={() => setShowTier2(!showTier2)}
              className="flex items-center gap-2 mb-1 w-full text-left"
            >
              <ShieldCheck size={16} className="text-status-degraded" />
              <h3 className="text-body-s font-semibold text-foreground">{setup.tier2.label}</h3>
              <BadgeWithTooltip text={setup.tier2.badge} tooltip={setup.tier2.badgeTooltip} colorClass="text-status-degraded" bgClass="bg-status-degraded/10" />
              <span className="flex-1" />
              <span className="text-[11px] text-foreground-disabled mr-2">{tier2Count} of {setup.tier2.items.length} enabled</span>
              {showTier2 ? <CaretUp size={14} className="text-foreground-muted" /> : <CaretDown size={14} className="text-foreground-muted" />}
            </button>
            {showTier2 && (
              <>
                <p className="text-[11px] text-foreground-muted mb-3 ml-6">{setup.tier2.description}</p>
                <div className="flex flex-col divide-y divide-border-muted/50 ml-6">
                  {setup.tier2.items.map(item => (
                    <Tier2Item
                      key={item.id}
                      item={item}
                      enabled={tier2State[item.id]}
                      onToggle={() => toggleTier2(item.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tier 3 — next steps */}
          <div className="glass-card p-5 border-l-2 border-l-foreground-muted/30">
            <button
              onClick={() => setShowTier3(!showTier3)}
              className="flex items-center gap-2 mb-1 w-full text-left"
            >
              <Clock size={16} className="text-foreground-muted" />
              <h3 className="text-body-s font-semibold text-foreground">{setup.tier3.label}</h3>
              <BadgeWithTooltip text={setup.tier3.badge} tooltip={setup.tier3.badgeTooltip} colorClass="text-foreground-muted" bgClass="bg-foreground-muted/10" />
              <span className="flex-1" />
              <span className="text-[11px] text-foreground-disabled mr-2">{setup.tier3.items.length} items</span>
              {showTier3 ? <CaretUp size={14} className="text-foreground-muted" /> : <CaretDown size={14} className="text-foreground-muted" />}
            </button>
            {showTier3 && (
              <>
                <p className="text-[11px] text-foreground-muted mb-3 ml-6">{setup.tier3.description}</p>
                <div className="flex flex-col divide-y divide-border-muted/50 ml-6">
                  {setup.tier3.items.map(item => (
                    <Tier3Item key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* GO button */}
          <button className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-body-m flex items-center justify-center gap-2 transition-colors">
            <Sparkle size={18} weight="fill" />
            Set up everything
            <ArrowRight size={16} />
          </button>

        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">

          {/* Agent chat */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Robot size={16} className="text-primary" />
              <h3 className="text-body-s font-semibold text-foreground">Ask the agent</h3>
            </div>
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 'Why these alarms?'"
                className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 pr-9 text-[12px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40 transition-colors"
              />
              <button className="absolute right-1.5 top-1.5 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <PaperPlaneRight size={12} />
              </button>
            </div>
          </div>

          {/* Agent activity */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkle size={14} className="text-primary" weight="fill" />
              <h3 className="text-body-s font-semibold text-foreground">Agent Activity</h3>
            </div>
            <div className="flex flex-col">
              {agentActivity.map((item, i) => (
                <ActivityItem key={i} item={item} isLast={i === agentActivity.length - 1} />
              ))}
            </div>
          </div>

          {/* Discovered services */}
          <div className="glass-card p-4">
            <h3 className="text-body-s font-semibold text-foreground mb-3">Discovered Services</h3>
            <div className="flex flex-col gap-1.5">
              {services.slice(0, 8).map((svc) => (
                <div key={svc.name} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground-disabled" />
                    <span className="text-[11px] text-foreground">{svc.name}</span>
                  </div>
                  <span className="text-[10px] text-foreground-disabled">{svc.type}</span>
                </div>
              ))}
              <button className="text-[11px] text-primary hover:text-primary-hover mt-1 text-left">
                View all {services.length} services →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
