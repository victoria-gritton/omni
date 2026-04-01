import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PaperPlaneRight, Bell, ChartBar, Sparkle, Robot, ArrowRight,
  WaveTriangle, FileText, Path, Cpu,
  Globe, Lightning, Gauge,
  Download, Rocket, CaretRight, CaretDown,
  CheckSquare, Square, Code, Play, X, Gear,
  CheckCircle, ShieldCheck, Trophy, Star, Lock,
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'
import { AlarmConfigModal } from '../components/AlarmConfigModal'
import { getAllRecommendedItems } from '../data/recommendations'

const severityColors = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/30',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  medium: 'text-primary bg-primary/10 border-primary/30',
  low: 'text-foreground-muted bg-foreground-muted/10 border-foreground-muted/30',
}
const severityDotColors = { critical: 'bg-red-400', high: 'bg-orange-400', medium: 'bg-primary', low: 'bg-foreground-muted' }
const severityBarColors = { critical: 'bg-red-400', high: 'bg-orange-400', medium: 'bg-primary', low: 'bg-foreground-muted/60' }

const categoryIcons = {
  alarms: Bell, logs: FileText, traces: Path, dashboards: ChartBar,
  anomaly: WaveTriangle, slos: Gauge, 'cross-account': Globe, 'cw-agent': Cpu, 'alarm-actions': Bell,
}

const tierConfig = {
  critical: { label: 'Critical', icon: ShieldCheck, color: 'text-red-400', bgColor: 'bg-red-400', milestone: 'Critical gaps resolved — your services won\'t fail silently' },
  high: { label: 'High Priority', icon: Bell, color: 'text-orange-400', bgColor: 'bg-orange-400', milestone: 'High priority covered — solid operational visibility' },
  medium: { label: 'Recommended', icon: Star, color: 'text-primary', bgColor: 'bg-primary', milestone: 'Recommended items done — proactive monitoring in place' },
  low: { label: 'Nice to Have', icon: Trophy, color: 'text-foreground-muted', bgColor: 'bg-foreground-muted/60', milestone: 'Full observability — you\'re in great shape' },
}

// Agent blurbs explaining WHY each gap matters
const agentBlurbs = {
  alarms: (gap, appName) => gap.title.includes('stale')
    ? 'Stale alarms create noise that masks real incidents. Your team will start ignoring alerts, and when a real issue hits, it gets lost in the noise.'
    : `Without alarms, a 5xx spike or CPU saturation on ${appName || 'your services'} could go unnoticed for hours. Your customers will notice before you do.`,
  logs: () => 'Without logs, you\'re debugging blind. When something breaks at 3 AM, you need logs to understand what happened — not just that something happened.',
  traces: () => 'Without distributed tracing, you can\'t see how a request flows across services. A slow response could be caused by any hop in the chain, and you\'ll have no way to pinpoint it.',
  dashboards: () => 'Dashboards give your team a shared view of system health. Without them, everyone checks different metrics in different ways — no single source of truth.',
  anomaly: () => 'Anomaly detection learns your traffic patterns and alerts on deviations. It catches issues that static thresholds miss, like a gradual degradation over days.',
  slos: () => 'SLOs formalize your reliability targets. Without them, there\'s no objective way to measure if your service is meeting expectations — or to justify engineering investment.',
  'cross-account': () => 'With services spread across 12 accounts, you\'re flying blind between them. A failure in one account can cascade to others with no visibility.',
  'cw-agent': () => 'The default metrics miss memory, disk, and custom application metrics. The CW Agent fills those gaps — without it, you\'re only seeing half the picture.',
  'alarm-actions': () => 'Alarms without actions are like smoke detectors with no sound. They\'ll detect the fire, but nobody gets woken up.',
}


// ─── IaC Modal ────────────────────────────────────────────────────
function IaCModal({ onClose, selectedGaps, persona }) {
  const [format, setFormat] = useState('cloudformation')
  const [showShare, setShowShare] = useState(false)
  const [shareMethod, setShareMethod] = useState('slack')
  const [shareDestination, setShareDestination] = useState('')
  const [shareMessage, setShareMessage] = useState(`Here's the CloudWatch observability setup I'd like to deploy. Please review and approve.`)
  const formats = [{ id: 'cloudformation', label: 'CloudFormation' }, { id: 'terraform', label: 'Terraform' }, { id: 'json', label: 'JSON' }]
  const shareMethods = [
    { id: 'slack', label: 'Slack', placeholder: '#ops-team or @admin', icon: '💬' },
    { id: 'email', label: 'Email', placeholder: 'admin@company.com', icon: '✉️' },
    { id: 'jira', label: 'Jira', placeholder: 'OPS-123 or project key', icon: '🎫' },
  ]
  const resourceCount = selectedGaps.reduce((sum, g) => sum + g.fixCount, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-[640px] max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border-muted">
          <div><h2 className="text-body-m font-semibold text-foreground">Export as Code</h2><p className="text-[11px] text-foreground-muted">{selectedGaps.length} gaps · {resourceCount} resources</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><X size={16} /></button>
        </div>
        <div className="flex gap-2 px-4 pt-3">
          {formats.map(f => <button key={f.id} onClick={() => setFormat(f.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${format === f.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>{f.label}</button>)}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-[10px] text-foreground-muted bg-background/60 rounded-lg p-4 border border-border-muted/30 overflow-x-auto leading-relaxed">
            {format === 'cloudformation' && `AWSTemplateFormatVersion: '2010-09-09'\nDescription: CloudWatch observability setup\n  Generated by CloudWatch Omni Agent\n\nResources:\n${selectedGaps.map(g => `  # ${g.title}\n  # ${g.fixLabel}\n  ${g.id.replace('g-', '')}Setup:\n    Type: AWS::CloudWatch::CompositeAlarm\n    Properties:\n      AlarmName: omni-${g.id.replace('g-', '')}-setup\n      # ... ${g.fixCount} resources configured`).join('\n\n')}`}
            {format === 'terraform' && `# CloudWatch observability setup\n# Generated by CloudWatch Omni Agent\n\n${selectedGaps.map(g => `# ${g.title} — ${g.fixLabel}\nresource "aws_cloudwatch_metric_alarm" "${g.id.replace('g-', '').replace('-', '_')}" {\n  # ... ${g.fixCount} resources configured\n}`).join('\n\n')}`}
            {format === 'json' && JSON.stringify({ description: `CloudWatch observability setup`, resources: selectedGaps.map(g => ({ id: g.id, title: g.title, count: g.fixCount })) }, null, 2)}
          </pre>
        </div>
        <div className="p-4 border-t border-border-muted">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-foreground-disabled">Preview only</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-body-s text-foreground hover:bg-background-surface-2">Copy</button>
              <button className="px-4 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-body-s text-foreground hover:bg-background-surface-2 flex items-center gap-1.5"><Download size={14} /> Download</button>
              <button onClick={() => setShowShare(!showShare)} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium">Share</button>
            </div>
          </div>
          {showShare && (
            <div className="mt-4 pt-4 border-t border-border-muted/30">
              <div className="flex gap-2 mb-3">{shareMethods.map(m => <button key={m.id} onClick={() => setShareMethod(m.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-colors ${shareMethod === m.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>{m.icon} {m.label}</button>)}</div>
              <input type="text" value={shareDestination} onChange={(e) => setShareDestination(e.target.value)} placeholder={shareMethods.find(m => m.id === shareMethod)?.placeholder} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40 mb-2" />
              <textarea value={shareMessage} onChange={(e) => setShareMessage(e.target.value)} rows={2} className="w-full rounded-lg bg-background-surface-1 border border-border-muted px-3 py-2 text-[11px] text-foreground focus:outline-none focus:border-primary/40 resize-none mb-3" />
              <button className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-medium">Send via {shareMethods.find(m => m.id === shareMethod)?.label}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ─── Progress Bar ─────────────────────────────────────────────────
function ProgressBar({ tiers, activeTier, onTierClick }) {
  const tierKeys = ['critical', 'high', 'medium', 'low']
  const totalGaps = tierKeys.reduce((s, k) => s + (tiers[k]?.total || 0), 0)
  const totalResolved = tierKeys.reduce((s, k) => s + (tiers[k]?.resolved || 0), 0)
  const pct = totalGaps > 0 ? (totalResolved / totalGaps) * 100 : 0

  // Calculate segment widths proportional to gap count
  const segments = tierKeys.map(k => ({
    key: k,
    count: tiers[k]?.total || 0,
    resolved: tiers[k]?.resolved || 0,
    pct: totalGaps > 0 ? ((tiers[k]?.total || 0) / totalGaps) * 100 : 25,
    allDone: (tiers[k]?.total || 0) > 0 && (tiers[k]?.resolved || 0) === (tiers[k]?.total || 0),
  }))

  // Cumulative positions for milestone markers
  let cumPct = 0
  const milestones = segments.map(seg => {
    cumPct += seg.pct
    return { ...seg, position: cumPct }
  })

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkle size={14} className="text-primary" weight="fill" />
          <span className="text-body-s font-semibold text-foreground">Observability Journey</span>
        </div>
        <span className="text-[11px] text-foreground-muted">{totalResolved} of {totalGaps} gaps addressed</span>
      </div>

      {/* Bar */}
      <div className="relative h-3 rounded-full bg-border-muted/20 overflow-hidden mb-2">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-400 via-orange-400 via-[60%] to-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {/* Tier markers */}
      <div className="relative h-8">
        {milestones.map((m, i) => {
          const cfg = tierConfig[m.key]
          const isActive = activeTier === m.key
          return (
            <button key={m.key} onClick={() => onTierClick(m.key)} className="absolute flex flex-col items-center -translate-x-1/2 group" style={{ left: `${m.position}%` }}>
              <div className={`w-3 h-3 rounded-full border-2 transition-all ${m.allDone ? `${cfg.bgColor} border-transparent` : isActive ? `border-current ${cfg.color} bg-background` : 'border-border-muted bg-background'}`}>
                {m.allDone && <CheckCircle size={12} weight="fill" className="text-white -mt-px -ml-px" />}
              </div>
              <span className={`text-[8px] mt-0.5 whitespace-nowrap transition-colors ${isActive ? cfg.color : 'text-foreground-disabled group-hover:text-foreground-muted'}`}>{cfg.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active milestone message */}
      {activeTier && tierConfig[activeTier] && (
        <div className={`flex items-center gap-2 mt-1 px-3 py-2 rounded-lg ${severityColors[activeTier]} border`}>
          <Sparkle size={12} weight="fill" />
          <span className="text-[10px]">{tierConfig[activeTier].milestone}</span>
        </div>
      )}
    </div>
  )
}


// ─── Gap Card (redesigned — less checkbox-y, more guided) ─────────
function GapCard({ gap, selectedItems, onToggleGap, onToggleService, onToggleItem, scopedServices, onConfigureAlarm, isInActiveTier }) {
  const Icon = categoryIcons[gap.category] || Lightning
  const [expanded, setExpanded] = useState(false)
  const colorClass = severityColors[gap.severity] || severityColors.medium

  const serviceGroups = {}
  for (const item of (gap.items || [])) {
    if (!serviceGroups[item.service]) serviceGroups[item.service] = []
    serviceGroups[item.service].push(item)
  }
  const serviceNames = Object.keys(serviceGroups)
  const totalItems = gap.items?.length || 0
  const selectedCount = gap.items?.filter(i => selectedItems.has(i.id)).length || 0
  const isGapSelected = totalItems === 0 && selectedItems.has(gap.id)
  const allSelected = isGapSelected || (totalItems > 0 && selectedCount === totalItems)
  const someSelected = !isGapSelected && selectedCount > 0 && selectedCount < totalItems

  const blurbFn = agentBlurbs[gap.category]
  const blurb = blurbFn ? blurbFn(gap) : null

  return (
    <div className={`rounded-xl border transition-all ${isInActiveTier ? 'border-border-muted/40 bg-background-surface-1/50' : 'border-border-muted/10 bg-background/30 opacity-60'} ${selectedCount > 0 || isGapSelected ? 'border-primary/40 bg-primary/5' : ''}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button onClick={() => onToggleGap(gap)} className="mt-0.5 flex-shrink-0">
            {allSelected
              ? <CheckSquare size={18} weight="fill" className="text-primary" />
              : someSelected
                ? <CheckSquare size={18} weight="regular" className="text-primary" />
                : <Square size={18} className="text-foreground-disabled hover:text-foreground-muted" />
            }
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colorClass}`}>{gap.severity}</span>
              <Icon size={14} className="text-foreground-muted" />
              <span className="text-body-s font-medium text-foreground">{gap.title}</span>
              {selectedCount > 0 && selectedCount < totalItems && <span className="text-[9px] text-primary">{selectedCount}/{totalItems}</span>}
            </div>
            <p className="text-[11px] text-foreground-muted mb-2">{gap.description}</p>

            {/* Agent blurb — why this matters */}
            {blurb && isInActiveTier && (
              <div className="flex gap-2 mb-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                <Sparkle size={12} className="text-primary flex-shrink-0 mt-0.5" weight="fill" />
                <p className="text-[10px] text-foreground-muted leading-relaxed">{blurb}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              {totalItems > 0 && (
                <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover">
                  {expanded ? <CaretDown size={10} /> : <CaretRight size={10} />}
                  {expanded ? 'Hide details' : `${totalItems} items across ${serviceNames.length} services`}
                </button>
              )}
              {!totalItems && <span className="text-[10px] text-foreground-disabled">Fix: {gap.fixLabel}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable tree select */}
      {expanded && totalItems > 0 && (
        <div className="px-4 pb-4 ml-8 flex flex-col gap-1">
          {serviceNames.map(svcName => {
            const items = serviceGroups[svcName]
            const svcSelected = items.filter(i => selectedItems.has(i.id)).length
            const svcAll = svcSelected === items.length
            const svcSome = svcSelected > 0 && !svcAll
            const svcType = scopedServices.find(s => s.name === svcName)?.type || ''
            return (
              <div key={svcName} className="rounded-lg bg-background/30 border border-border-muted/20 p-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => onToggleService(items)} className="flex-shrink-0">
                    {svcAll ? <CheckSquare size={14} weight="fill" className="text-primary" /> : svcSome ? <CheckSquare size={14} weight="regular" className="text-primary" /> : <Square size={14} className="text-foreground-disabled hover:text-foreground-muted" />}
                  </button>
                  <span className="text-[11px] font-medium text-foreground">{svcName}</span>
                  <span className="text-[9px] text-foreground-disabled">{svcType}</span>
                </div>
                <div className="ml-6 mt-1 flex flex-col gap-0.5">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 py-0.5">
                      <button onClick={() => onToggleItem(item.id)} className="flex-shrink-0">
                        {selectedItems.has(item.id) ? <CheckSquare size={12} weight="fill" className="text-primary" /> : <Square size={12} className="text-foreground-disabled hover:text-foreground-muted" />}
                      </button>
                      <span className="text-[10px] text-foreground-muted flex-1">{item.name}</span>
                      {item.threshold && <span className="text-[9px] text-foreground-disabled">({item.threshold})</span>}
                      {item.config && <button onClick={() => onConfigureAlarm?.(item)} className="text-[9px] text-primary hover:text-primary-hover">Edit</button>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


// ─── Tier Section ─────────────────────────────────────────────────
function TierSection({ tier, gaps, isActive, onActivate, selectedItems, onToggleGap, onToggleService, onToggleItem, scopedServices, onConfigureAlarm }) {
  const cfg = tierConfig[tier]
  const Icon = cfg.icon
  const totalItems = gaps.reduce((s, g) => s + (g.items?.length || 1), 0)
  const resolvedItems = gaps.reduce((s, g) => {
    if (g.items) return s + g.items.filter(i => selectedItems.has(i.id)).length
    return s + (selectedItems.has(g.id) ? 1 : 0)
  }, 0)

  return (
    <div className="mb-4">
      <button onClick={onActivate} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isActive ? `${severityColors[tier]} border` : 'border-border-muted/20 bg-background/30 hover:bg-background-surface-1/30'}`}>
        <Icon size={16} className={cfg.color} weight={isActive ? 'fill' : 'regular'} />
        <span className={`text-body-s font-semibold ${isActive ? cfg.color : 'text-foreground'}`}>{cfg.label}</span>
        <span className="text-[10px] text-foreground-disabled">{gaps.length} gaps · {totalItems} items</span>
        <span className="flex-1" />
        {resolvedItems > 0 && <span className="text-[9px] text-primary">{resolvedItems} selected</span>}
        {isActive ? <CaretDown size={12} className="text-foreground-muted" /> : <CaretRight size={12} className="text-foreground-muted" />}
      </button>

      {isActive && (
        <div className="flex flex-col gap-2 mt-2 pl-2">
          {gaps.map(gap => (
            <GapCard key={gap.id} gap={gap} selectedItems={selectedItems} onToggleGap={onToggleGap} onToggleService={onToggleService} onToggleItem={onToggleItem} scopedServices={scopedServices} onConfigureAlarm={onConfigureAlarm} isInActiveTier={true} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Cost Breakdown ───────────────────────────────────────────────
const UNIT_COSTS = { alarms: 0.10, logs: 2.00, traces: 0.50, dashboards: 3.00, anomaly: 10.00 }

function CostBreakdown({ cost, computedGaps, selectedItems }) {
  const projectedLines = []
  let projectedDelta = 0
  for (const gap of computedGaps) {
    const unitCost = UNIT_COSTS[gap.category]
    if (!unitCost) continue
    if (gap.items && gap.items.length > 0) {
      const selectedCount = gap.items.filter(i => selectedItems.has(i.id)).length
      if (selectedCount > 0) {
        const amount = +(selectedCount * unitCost).toFixed(2)
        projectedDelta += amount
        projectedLines.push({ category: gap.category === 'alarms' ? 'Alarms' : gap.category === 'logs' ? 'Logs' : gap.category === 'traces' ? 'Traces' : gap.category, amount, note: `${selectedCount} × ${unitCost}` })
      }
    } else if (selectedItems.has(gap.id)) {
      const amount = +(gap.fixCount * unitCost).toFixed(2)
      projectedDelta += amount
      projectedLines.push({ category: gap.category === 'dashboards' ? 'Dashboards' : gap.category === 'anomaly' ? 'Anomaly detection' : gap.category, amount, note: `${gap.fixCount} × ${unitCost}` })
    }
  }
  for (const p of cost.projected) {
    if (selectedItems.has(p.gapId)) {
      projectedDelta += p.amount
      projectedLines.push({ category: p.category, amount: p.amount, note: p.note })
    }
  }
  const projectedTotal = cost.current.total + projectedDelta

  return (
    <div className="glass-card p-4">
      <h3 className="text-body-s font-semibold text-foreground mb-3">CloudWatch Cost</h3>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] text-foreground-disabled uppercase tracking-wider">Current</span>
        <span className="text-body-m font-semibold text-foreground">${cost.current.total.toLocaleString()}<span className="text-[11px] text-foreground-muted font-normal">/mo</span></span>
      </div>
      {cost.current.breakdown.map((item, i) => (
        <div key={i} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-foreground-muted">{item.category}</span><span className="text-[10px] text-foreground">${item.amount.toLocaleString()}</span></div>
      ))}
      {projectedLines.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-muted/30">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[10px] text-foreground-disabled uppercase tracking-wider">With selected</span>
            <span className="text-body-m font-semibold text-foreground">${projectedTotal.toLocaleString()}<span className="text-[11px] text-foreground-muted font-normal">/mo</span><span className={`text-[10px] ml-1 ${projectedDelta >= 0 ? 'text-status-degraded' : 'text-status-active'}`}>{projectedDelta >= 0 ? '+' : ''}${projectedDelta.toFixed(2)}</span></span>
          </div>
          {projectedLines.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-foreground-muted">{item.category}</span><div className="flex items-center gap-2"><span className={`text-[10px] ${item.amount >= 0 ? 'text-foreground' : 'text-status-active'}`}>{item.amount >= 0 ? '+' : ''}${item.amount.toFixed(2)}</span><span className="text-[9px] text-foreground-disabled">{item.note}</span></div></div>
          ))}
        </div>
      )}
      {cost.savings?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-muted/30">
          <p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-1.5">Potential savings</p>
          {cost.savings.map((s, i) => <div key={i} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-foreground-muted">{s.description}</span><span className="text-[10px] text-status-active">-${s.amount.toLocaleString()}/mo</span></div>)}
        </div>
      )}
    </div>
  )
}


// ─── Main Page ────────────────────────────────────────────────────
export default function Day0Page() {
  const [input, setInput] = useState('')
  const navigate = useNavigate()
  const { persona } = usePersona()
  const { user, applications, gaps, cost } = persona

  const [activeApp, setActiveApp] = useState('all')
  const [activeTier, setActiveTier] = useState('critical')
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [showIaCModal, setShowIaCModal] = useState(false)
  const [alarmConfigItem, setAlarmConfigItem] = useState(null)

  const allServices = applications.flatMap(a => a.services)
  const scopedServices = activeApp === 'all' ? allServices : (applications.find(a => a.id === activeApp)?.services || [])

  // Compute gaps dynamically
  const computedGaps = useMemo(() => {
    const total = scopedServices.length
    const noAlarms = scopedServices.filter(s => !s.hasAlarms)
    const noLogs = scopedServices.filter(s => !s.hasLogs)
    const noTraces = scopedServices.filter(s => !s.hasTraces)
    const result = []

    const staleGap = gaps.find(g => g.id === 'g-stale')
    if (staleGap && (activeApp === 'all' || staleGap.appIds?.includes('all') || staleGap.appIds?.includes(activeApp))) result.push(staleGap)

    if (noAlarms.length > 0) {
      const items = getAllRecommendedItems(noAlarms, 'alarms')
      result.push({ id: 'g-alarms', category: 'alarms', title: `${noAlarms.length} service${noAlarms.length > 1 ? 's' : ''} have no alarms`, description: `Recommended: ${items.length} alarms for ${noAlarms.length} unmonitored services.`, severity: 'critical', services: noAlarms.length, fixCount: items.length, fixLabel: `${items.length} alarms`, items })
    }
    if (noLogs.length > 0) {
      const items = getAllRecommendedItems(noLogs, 'logs')
      result.push({ id: 'g-logs', category: 'logs', title: `Logging missing on ${noLogs.length} service${noLogs.length > 1 ? 's' : ''}`, description: `${noLogs.length} of ${total} services are not sending logs.`, severity: 'high', services: noLogs.length, fixCount: items.length, fixLabel: `${items.length} log configs`, items })
    }
    if (noTraces.length > 0) {
      const items = getAllRecommendedItems(noTraces, 'traces')
      result.push({ id: 'g-traces', category: 'traces', title: `No tracing on ${noTraces.length} service${noTraces.length > 1 ? 's' : ''}`, description: `${noTraces.length} of ${total} services have no X-Ray tracing.`, severity: 'high', services: noTraces.length, fixCount: items.length, fixLabel: `${items.length} trace configs`, items })
    }

    const extraIds = ['g-dashboards', 'g-anomaly', 'g-slos', 'g-cross-account', 'g-cw-agent', 'g-no-actions']
    for (const g of gaps) {
      if (!extraIds.includes(g.id)) continue
      if (activeApp === 'all' || g.appIds?.includes('all') || g.appIds?.includes(activeApp)) result.push(g)
    }

    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    result.sort((a, b) => (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3))
    return result
  }, [activeApp, scopedServices, gaps])

  // Group gaps by tier
  const tierGroups = useMemo(() => {
    const groups = { critical: [], high: [], medium: [], low: [] }
    for (const g of computedGaps) groups[g.severity]?.push(g) 
    return groups
  }, [computedGaps])

  // Tier stats for progress bar
  const tierStats = useMemo(() => {
    const stats = {}
    for (const tier of ['critical', 'high', 'medium', 'low']) {
      const gapsInTier = tierGroups[tier] || []
      const total = gapsInTier.reduce((s, g) => s + (g.items?.length || 1), 0)
      const resolved = gapsInTier.reduce((s, g) => {
        if (g.items) return s + g.items.filter(i => selectedItems.has(i.id)).length
        return s + (selectedItems.has(g.id) ? 1 : 0)
      }, 0)
      stats[tier] = { total, resolved }
    }
    return stats
  }, [tierGroups, selectedItems])

  // Auto-advance active tier when current is fully selected
  // (just visual emphasis, user can still click any tier)

  const toggleItem = (itemId) => setSelectedItems(prev => { const n = new Set(prev); n.has(itemId) ? n.delete(itemId) : n.add(itemId); return n })
  const toggleService = (items) => setSelectedItems(prev => { const n = new Set(prev); const allIn = items.every(i => n.has(i.id)); items.forEach(i => allIn ? n.delete(i.id) : n.add(i.id)); return n })
  const toggleGapItems = (gap) => {
    if (!gap.items || gap.items.length === 0) {
      setSelectedItems(prev => { const n = new Set(prev); n.has(gap.id) ? n.delete(gap.id) : n.add(gap.id); return n })
      return
    }
    setSelectedItems(prev => { const n = new Set(prev); const allIn = gap.items.every(i => n.has(i.id)); gap.items.forEach(i => allIn ? n.delete(i.id) : n.add(i.id)); return n })
  }

  const totalSelected = selectedItems.size
  const selectedGapIds = new Set()
  for (const gap of computedGaps) {
    if (gap.items && gap.items.some(i => selectedItems.has(i.id))) selectedGapIds.add(gap.id)
    if (!gap.items && selectedItems.has(gap.id)) selectedGapIds.add(gap.id)
  }

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/day0')} className="text-[11px] text-primary hover:text-primary-hover mb-2 flex items-center gap-1">← Back to overview</button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">Observability Gaps</h1>
            <p className="text-body-m text-foreground-muted mt-1">{scopedServices.length} services across {applications.length} applications</p>
          </div>
          <div className="flex items-center gap-2"><Sparkle size={14} className="text-primary" weight="fill" /><span className="text-[11px] text-primary font-medium">Agent active</span></div>
        </div>
      </div>

      {/* Application tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setActiveApp('all')} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${activeApp === 'all' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>All ({allServices.length})</button>
        {applications.map(app => (
          <button key={app.id} onClick={() => setActiveApp(app.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${activeApp === app.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>{app.name} ({app.services.length})</button>
        ))}
      </div>

      {/* Progress bar */}
      <ProgressBar tiers={tierStats} activeTier={activeTier} onTierClick={setActiveTier} />

      {/* Main grid */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left — tiered gaps */}
        <div>
          {['critical', 'high', 'medium', 'low'].map(tier => {
            const gapsInTier = tierGroups[tier]
            if (!gapsInTier || gapsInTier.length === 0) return null
            return <TierSection key={tier} tier={tier} gaps={gapsInTier} isActive={activeTier === tier} onActivate={() => setActiveTier(tier)} selectedItems={selectedItems} onToggleGap={toggleGapItems} onToggleService={toggleService} onToggleItem={toggleItem} scopedServices={scopedServices} onConfigureAlarm={setAlarmConfigItem} />
          })}
        </div>

        {/* Right sidebar — sticky */}
        <div className="flex flex-col gap-4 self-start sticky top-6">
          {/* Selection summary */}
          <div className="glass-card p-4">
            <h3 className="text-body-s font-semibold text-foreground mb-3">Selection Summary</h3>
            {totalSelected > 0 ? (
              <>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[11px] text-foreground-muted">{totalSelected} items selected</span>
                  <span className="text-[11px] text-foreground-disabled">{selectedGapIds.size} categories</span>
                </div>
                <div className="flex flex-col gap-1 mb-3">
                  {computedGaps.filter(g => selectedGapIds.has(g.id)).map(g => {
                    const count = g.items ? g.items.filter(i => selectedItems.has(i.id)).length : 1
                    return <div key={g.id} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-foreground-muted truncate">{g.title}</span><span className="text-[9px] text-foreground-disabled">{count} items</span></div>
                  })}
                </div>
                <div className="flex flex-col gap-2">
                  <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-medium transition-colors"><Play size={12} /> Apply now</button>
                  <button onClick={() => setShowIaCModal(true)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-background-surface-1 border border-border-muted text-[11px] text-foreground hover:bg-background-surface-2 transition-colors"><Code size={12} /> Export as code</button>
                  <button onClick={() => setSelectedItems(new Set())} className="text-[10px] text-foreground-muted hover:text-foreground text-center py-1">Clear selection</button>
                </div>
              </>
            ) : (
              <p className="text-[10px] text-foreground-disabled">Select gaps to see a summary and take action.</p>
            )}
          </div>

          {/* Cost */}
          <CostBreakdown cost={cost} computedGaps={computedGaps} selectedItems={selectedItems} />

          {/* Agent chat */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3"><Robot size={16} className="text-primary" /><h3 className="text-body-s font-semibold text-foreground">Ask the agent</h3></div>
            <div className="relative">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. 'Why no tracing?'" className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 pr-9 text-[12px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40" />
              <button className="absolute right-1.5 top-1.5 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20"><PaperPlaneRight size={12} /></button>
            </div>
          </div>
        </div>
      </div>

      {showIaCModal && <IaCModal onClose={() => setShowIaCModal(false)} selectedGaps={computedGaps.filter(g => selectedGapIds.has(g.id))} persona={persona} />}
      {alarmConfigItem && <AlarmConfigModal item={alarmConfigItem} onClose={() => setAlarmConfigItem(null)} onSave={() => setAlarmConfigItem(null)} />}
    </div>
  )
}
