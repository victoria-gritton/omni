import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PaperPlaneRight, Bell, ChartBar, Sparkle, Robot,
  WaveTriangle, FileText, Path, Cpu,
  Globe, Lightning, Gauge,
  Download, CaretRight, CaretDown,
  CheckSquare, Square, Code, Play, X,
  CheckCircle, ShieldCheck, Trophy, Star, Check, CircleNotch,
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'
import { AlarmConfigModal } from '../components/AlarmConfigModal'
import { LogConfigModal } from '../components/LogConfigModal'
import { TraceConfigModal } from '../components/TraceConfigModal'
import { getAllRecommendedItems, serviceSeverity } from '../data/recommendations'

const severityColors = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/30',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  medium: 'text-primary bg-primary/10 border-primary/30',
  low: 'text-foreground-muted bg-foreground-muted/10 border-foreground-muted/30',
}
const severityBarColors = { critical: 'bg-red-400', high: 'bg-orange-400', medium: 'bg-primary', low: 'bg-foreground-muted/60' }
const severityBarMuted = { critical: 'bg-red-400/30', high: 'bg-orange-400/30', medium: 'bg-primary/30', low: 'bg-foreground-muted/20' }

const categoryIcons = { alarms: Bell, logs: FileText, traces: Path, dashboards: ChartBar, anomaly: WaveTriangle, slos: Gauge, 'cross-account': Globe, 'cw-agent': Cpu, 'alarm-actions': Bell }

const tierConfig = {
  critical: { label: 'Critical', icon: ShieldCheck, color: 'text-red-400', bgColor: 'bg-red-400', milestone: 'Critical gaps resolved — your services won\'t fail silently' },
  high: { label: 'High Priority', icon: Bell, color: 'text-orange-400', bgColor: 'bg-orange-400', milestone: 'High priority covered — solid operational visibility' },
  medium: { label: 'Recommended', icon: Star, color: 'text-primary', bgColor: 'bg-primary', milestone: 'Recommended items done — proactive monitoring in place' },
  low: { label: 'Nice to Have', icon: Trophy, color: 'text-foreground-muted', bgColor: 'bg-foreground-muted/60', milestone: 'Full observability — you\'re in great shape' },
}

const agentBlurbs = {
  alarms: (gap) => {
    if (gap.title.includes('stale')) return 'Stale alarms create noise that masks real incidents. Your team will start ignoring alerts.'
    if (gap.severity === 'critical') return 'These are your customer-facing and data services — API gateways, databases. Without alarms here, an outage or data corruption could go undetected for hours.'
    if (gap.severity === 'high') return 'Your compute workloads (ECS, EKS, Lambda) need alarms to catch CPU spikes, memory pressure, and task failures before they cascade.'
    if (gap.severity === 'medium') return 'Alarms on caching, messaging, and ML services help you catch degradation early — before it impacts the critical path.'
    return 'These are nice-to-have alarms for edge services like CDN and storage. Lower risk, but still good hygiene.'
  },
  logs: (gap) => {
    if (gap.severity === 'critical') return 'Your API gateways and databases need logs for audit trails and debugging. Without them, you can\'t investigate data issues or trace API failures.'
    if (gap.severity === 'high') return 'Compute services generate the bulk of your application logs. Without them, you\'re debugging blind when containers crash or functions error.'
    if (gap.severity === 'medium') return 'Logs on caching and messaging services help with capacity planning and debugging intermittent issues.'
    return 'Edge service logs (CDN, S3) are useful for access auditing but lower priority for operational debugging.'
  },
  traces: (gap) => {
    if (gap.severity === 'critical') return 'Tracing on your API gateways and databases shows you the full request path. Without it, you can\'t pinpoint where latency or errors originate.'
    if (gap.severity === 'high') return 'Your compute services are the middle of every request chain. Tracing here connects the dots between entry points and data stores.'
    if (gap.severity === 'medium') return 'Tracing on supporting services helps complete the picture — useful for deep investigations but not the first priority.'
    return 'Edge service tracing adds completeness but is rarely the bottleneck in investigations.'
  },
  dashboards: () => 'Dashboards give your team a shared view of system health.',
  anomaly: () => 'Anomaly detection learns your traffic patterns and alerts on deviations.',
  slos: () => 'SLOs formalize your reliability targets.',
  'cross-account': () => 'With services spread across multiple accounts, you\'re flying blind between them.',
  'cw-agent': () => 'The default metrics miss memory, disk, and custom application metrics. The CW Agent fills those gaps.',
  'alarm-actions': () => 'Alarms without actions are like smoke detectors with no sound.',
}

const postAgentDiscoveries = [
  { id: 'disc-mem-alarm-1', service: 'checkout-service', name: 'Memory > 85% alarm', category: 'alarms', severity: 'high', description: 'New metric after CW Agent install' },
  { id: 'disc-mem-alarm-2', service: 'payment-service', name: 'Memory > 85% alarm', category: 'alarms', severity: 'high', description: 'New metric after CW Agent install' },
  { id: 'disc-disk-alarm-1', service: 'order-service', name: 'Disk > 90% alarm', category: 'alarms', severity: 'medium', description: 'New metric after CW Agent install' },
]


// ─── IaC Modal ────────────────────────────────────────────────────
function IaCModal({ onClose, selectedGaps }) {
  const [format, setFormat] = useState('cloudformation')
  const [showShare, setShowShare] = useState(false)
  const [shareMethod, setShareMethod] = useState('slack')
  const [shareDestination, setShareDestination] = useState('')
  const [shareMessage, setShareMessage] = useState('Here\'s the CloudWatch config I\'d like to deploy. Please review.')
  const formats = [{ id: 'cloudformation', label: 'CloudFormation' }, { id: 'terraform', label: 'Terraform' }, { id: 'json', label: 'JSON' }]
  const shareMethods = [{ id: 'slack', label: 'Slack', placeholder: '#ops-team', icon: '💬' }, { id: 'email', label: 'Email', placeholder: 'admin@company.com', icon: '✉️' }, { id: 'jira', label: 'Jira', placeholder: 'OPS-123', icon: '🎫' }]
  const rc = selectedGaps.reduce((s, g) => s + g.fixCount, 0)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-[640px] max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border-muted"><div><h2 className="text-body-m font-semibold text-foreground">Export as Code</h2><p className="text-[11px] text-foreground-muted">{selectedGaps.length} gaps · {rc} resources</p></div><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><X size={16} /></button></div>
        <div className="flex gap-2 px-4 pt-3">{formats.map(f => <button key={f.id} onClick={() => setFormat(f.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${format === f.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>{f.label}</button>)}</div>
        <div className="flex-1 overflow-y-auto p-4"><pre className="text-[10px] text-foreground-muted bg-background/60 rounded-lg p-4 border border-border-muted/30 overflow-x-auto leading-relaxed">{format === 'cloudformation' && `AWSTemplateFormatVersion: '2010-09-09'\nResources:\n${selectedGaps.map(g => `  # ${g.title}\n  ${g.id.replace(/[^a-zA-Z0-9]/g, '')}:\n    Type: AWS::CloudWatch::CompositeAlarm\n    # ${g.fixCount} resources`).join('\n')}`}{format === 'terraform' && `${selectedGaps.map(g => `# ${g.title}\nresource "aws_cloudwatch_metric_alarm" "${g.id.replace(/[^a-zA-Z0-9_]/g, '_')}" {\n  # ${g.fixCount} resources\n}`).join('\n\n')}`}{format === 'json' && JSON.stringify({ resources: selectedGaps.map(g => ({ id: g.id, title: g.title, count: g.fixCount })) }, null, 2)}</pre></div>
        <div className="p-4 border-t border-border-muted">
          <div className="flex items-center justify-between"><span className="text-[10px] text-foreground-disabled">Preview only</span><div className="flex gap-2"><button className="px-4 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-body-s text-foreground hover:bg-background-surface-2">Copy</button><button className="px-4 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-body-s text-foreground hover:bg-background-surface-2 flex items-center gap-1.5"><Download size={14} /> Download</button><button onClick={() => setShowShare(!showShare)} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium">Share</button></div></div>
          {showShare && (<div className="mt-4 pt-4 border-t border-border-muted/30"><div className="flex gap-2 mb-3">{shareMethods.map(m => <button key={m.id} onClick={() => setShareMethod(m.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-colors ${shareMethod === m.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>{m.icon} {m.label}</button>)}</div><input type="text" value={shareDestination} onChange={(e) => setShareDestination(e.target.value)} placeholder={shareMethods.find(m => m.id === shareMethod)?.placeholder} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40 mb-2" /><textarea value={shareMessage} onChange={(e) => setShareMessage(e.target.value)} rows={2} className="w-full rounded-lg bg-background-surface-1 border border-border-muted px-3 py-2 text-[11px] text-foreground focus:outline-none focus:border-primary/40 resize-none mb-3" /><button className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-medium">Send via {shareMethods.find(m => m.id === shareMethod)?.label}</button></div>)}
        </div>
      </div>
    </div>
  )
}


// ─── Progress Bar ─────────────────────────────────────────────────
function ProgressBar({ tiers, activeTier, onTierClick, deploying }) {
  const tierKeys = ['critical', 'high', 'medium', 'low']
  const totalGaps = tierKeys.reduce((s, k) => s + (tiers[k]?.total || 0), 0)
  const totalDeployed = tierKeys.reduce((s, k) => s + (tiers[k]?.deployed || 0), 0)
  const totalSelected = tierKeys.reduce((s, k) => s + (tiers[k]?.selected || 0), 0)

  const segments = tierKeys.map((k, i) => {
    const t = tiers[k] || { total: 0, deployed: 0, selected: 0 }
    const deployedPct = t.total > 0 ? (t.deployed / t.total) : 0
    const selectedPct = t.total > 0 ? ((t.deployed + t.selected) / t.total) : 0
    return { key: k, total: t.total, deployed: t.deployed, selected: t.selected, deployedPct, selectedPct, allDeployed: t.total > 0 && t.deployed === t.total }
  })

  let chainComplete = true
  const tierComplete = {}
  for (const seg of segments) { chainComplete = chainComplete && seg.allDeployed; tierComplete[seg.key] = chainComplete }

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Sparkle size={14} className="text-primary" weight="fill" /><span className="text-body-s font-semibold text-foreground">Observability Journey</span></div>
        <div className="flex items-center gap-3">
          {deploying && <span className="text-[10px] text-primary flex items-center gap-1.5"><CircleNotch size={10} className="animate-spin" /> Deploying {deploying.count} items...</span>}
          {!deploying && totalDeployed > 0 && <span className="text-[10px] text-status-active">{totalDeployed} deployed</span>}
          {!deploying && totalSelected > 0 && <span className="text-[10px] text-foreground-muted">{totalSelected} selected</span>}
          <span className="text-[11px] text-foreground-disabled">{totalDeployed + totalSelected} of {totalGaps}</span>
        </div>
      </div>
      <div className="relative h-3 rounded-full bg-border-muted/20 overflow-hidden mb-2 flex">
        {segments.map((seg, i) => {
          // During deploy, animate the muted bar filling to solid
          const deployingPct = deploying ? Math.min(seg.selectedPct, 1) * (deploying.progress / 100) + seg.deployedPct : seg.deployedPct
          return (
            <div key={seg.key} className="relative h-full" style={{ width: '25%' }}>
              <div className={`absolute inset-y-0 left-0 ${severityBarMuted[seg.key]} transition-all duration-500 ${i === 0 ? 'rounded-l-full' : ''}`} style={{ width: `${Math.min(seg.selectedPct, 1) * 100}%` }} />
              <div className={`absolute inset-y-0 left-0 ${severityBarColors[seg.key]} transition-all ${deploying ? 'duration-200' : 'duration-500'} ${i === 0 ? 'rounded-l-full' : ''} ${i === 3 && seg.allDeployed ? 'rounded-r-full' : ''}`} style={{ width: `${Math.min(deployingPct, 1) * 100}%` }} />
              {i > 0 && <div className="absolute left-0 inset-y-0 w-px bg-border-muted/30 z-10" />}
            </div>
          )
        })}
      </div>
      <div className="relative h-10">
        {segments.map((seg, i) => {
          const cfg = tierConfig[seg.key]; const isActive = activeTier === seg.key; const position = (i + 1) * 25; const done = tierComplete[seg.key]
          const TierIcon = cfg.icon
          const statusText = done ? '✓' : seg.deployed > 0 ? `${seg.deployed}/${seg.total}` : seg.total > 0 ? `0/${seg.total}` : ''
          return (
            <button key={seg.key} onClick={() => onTierClick(seg.key)} className="absolute flex flex-col items-center -translate-x-1/2 group" style={{ left: `${position}%` }}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${done ? `${cfg.bgColor} border-transparent shadow-lg` : isActive ? `border-current ${cfg.color} bg-background` : 'border-border-muted bg-background'}`} style={done ? { boxShadow: `0 0 12px ${seg.key === 'critical' ? 'rgba(248,113,113,0.5)' : seg.key === 'high' ? 'rgba(251,146,60,0.5)' : seg.key === 'medium' ? 'rgba(14,165,233,0.4)' : 'rgba(100,116,139,0.3)'}` } : undefined}>
                {done ? <Check size={12} weight="bold" className="text-white" /> : <TierIcon size={12} className={isActive ? cfg.color : 'text-foreground-disabled'} weight={isActive ? 'fill' : 'regular'} />}
              </div>
              <span className={`text-[8px] mt-0.5 whitespace-nowrap ${isActive ? cfg.color : 'text-foreground-disabled group-hover:text-foreground-muted'}`}>{cfg.label} {statusText && `(${statusText})`}</span>
            </button>
          )
        })}
      </div>
      {activeTier && tierComplete[activeTier] && (
        <div className={`flex items-center gap-2 mt-1 px-3 py-2 rounded-lg ${severityColors[activeTier]} border`}><CheckCircle size={14} weight="fill" /><span className="text-[10px]">{tierConfig[activeTier].milestone}</span></div>
      )}
    </div>
  )
}


// ─── Gap Card (only shows non-deployed items) ─────────────────────
function GapCard({ gap, selectedItems, deployedItems, onToggleGap, onToggleService, onToggleItem, scopedServices, onConfigureItem, isInActiveTier, isSliding }) {
  const Icon = categoryIcons[gap.category] || Lightning
  const [expanded, setExpanded] = useState(false)
  const colorClass = severityColors[gap.severity] || severityColors.medium

  // Only show non-deployed items
  const activeItems = (gap.items || []).filter(i => !deployedItems.has(i.id))
  const serviceGroups = {}
  for (const item of activeItems) {
    if (!serviceGroups[item.service]) serviceGroups[item.service] = []
    serviceGroups[item.service].push(item)
  }
  const serviceNames = Object.keys(serviceGroups)
  const totalActive = activeItems.length
  const selectedCount = activeItems.filter(i => selectedItems.has(i.id)).length
  const isGapSelected = totalActive === 0 && !gap.items?.length && selectedItems.has(gap.id)
  const allSelected = isGapSelected || (totalActive > 0 && selectedCount === totalActive)
  const someSelected = !isGapSelected && selectedCount > 0 && selectedCount < totalActive

  const blurbFn = agentBlurbs[gap.category]
  const blurb = blurbFn ? blurbFn(gap) : null

  const sevBorderColors = { critical: 'border-l-red-400', high: 'border-l-orange-400', medium: 'border-l-primary', low: 'border-l-foreground-muted' }
  const leftBorder = isInActiveTier && !isSliding ? `border-l-2 ${sevBorderColors[gap.severity] || ''}` : ''

  return (
    <div className={`rounded-xl border transition-all ${leftBorder} ${isSliding ? 'duration-700 opacity-0 translate-y-24 scale-95 max-h-0 overflow-hidden mb-0 border-status-active/30 bg-status-active/10' : 'duration-300 opacity-100 translate-y-0 scale-100'} ${!isSliding && isInActiveTier ? 'border-border-muted/40 bg-background-surface-1/50' : !isSliding ? 'border-border-muted/10 bg-background/30 opacity-60' : ''} ${!isSliding && (selectedCount > 0 || isGapSelected) ? 'border-primary/40 bg-primary/5' : ''}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button onClick={() => onToggleGap(gap)} className="mt-0.5 flex-shrink-0">
            {allSelected ? <CheckSquare size={18} weight="fill" className="text-primary" />
              : someSelected ? <CheckSquare size={18} weight="regular" className="text-primary" />
              : <Square size={18} className="text-foreground-disabled hover:text-foreground-muted" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colorClass}`}>{gap.severity}</span>
              <Icon size={14} className="text-foreground-muted" />
              <span className="text-body-s font-medium text-foreground">{gap.title}</span>
              {selectedCount > 0 && <span className="text-[9px] text-primary">{selectedCount} selected</span>}
            </div>
            <p className="text-[11px] text-foreground-muted mb-2">{gap.description}</p>
            {blurb && isInActiveTier && (
              <div className="relative flex gap-2.5 mb-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-primary/8 to-primary/3 border border-primary/15">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkle size={10} className="text-primary" weight="fill" />
                </div>
                <p className="text-[10px] text-foreground leading-relaxed">{blurb}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              {totalActive > 0 && (
                <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover">
                  {expanded ? <CaretDown size={10} /> : <CaretRight size={10} />}
                  {expanded ? 'Hide details' : `${totalActive} items across ${serviceNames.length} services`}
                </button>
              )}
              {totalActive === 0 && gap.items?.length === 0 && <span className="text-[10px] text-foreground-disabled">Fix: {gap.fixLabel}</span>}
            </div>
          </div>
        </div>
      </div>
      {expanded && totalActive > 0 && (
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
                      {item.config && <button onClick={() => onConfigureItem?.(item, gap.category)} className="text-[9px] text-primary hover:text-primary-hover">Edit</button>}
                      {!item.config && (gap.category === 'logs' || gap.category === 'traces') && <button onClick={() => onConfigureItem?.(item, gap.category)} className="text-[9px] text-primary hover:text-primary-hover">Edit</button>}
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
function TierSection({ tier, gaps, isActive, onActivate, selectedItems, deployedItems, onToggleGap, onToggleService, onToggleItem, scopedServices, onConfigureItem, slidingGaps }) {
  const cfg = tierConfig[tier]
  const Icon = cfg.icon
  // Only count non-deployed items
  const activeGaps = gaps.filter(g => {
    if (g.items?.length > 0) return g.items.some(i => !deployedItems.has(i.id))
    return !deployedItems.has(g.id)
  })
  const totalActive = activeGaps.reduce((s, g) => {
    if (g.items) return s + g.items.filter(i => !deployedItems.has(i.id)).length
    return s + 1
  }, 0)
  const selectedCount = activeGaps.reduce((s, g) => {
    if (g.items) return s + g.items.filter(i => selectedItems.has(i.id) && !deployedItems.has(i.id)).length
    return s + (selectedItems.has(g.id) && !deployedItems.has(g.id) ? 1 : 0)
  }, 0)

  if (activeGaps.length === 0) return null

  return (
    <div className="mb-4">
      <button onClick={onActivate} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isActive ? `${severityColors[tier]} border` : 'border-border-muted/20 bg-background/30 hover:bg-background-surface-1/30'}`}>
        <Icon size={16} className={cfg.color} weight={isActive ? 'fill' : 'regular'} />
        <span className={`text-body-s font-semibold ${isActive ? cfg.color : 'text-foreground'}`}>{cfg.label}</span>
        <span className="text-[10px] text-foreground-disabled">{activeGaps.length} gaps · {totalActive} items</span>
        <span className="flex-1" />
        {selectedCount > 0 && <span className="text-[9px] text-primary">{selectedCount} selected</span>}
        {isActive ? <CaretDown size={12} className="text-foreground-muted" /> : <CaretRight size={12} className="text-foreground-muted" />}
      </button>
      {isActive && (
        <div className="flex flex-col gap-2 mt-2 pl-2">
          {activeGaps.map(gap => (
            <GapCard key={gap.id} gap={gap} selectedItems={selectedItems} deployedItems={deployedItems} onToggleGap={onToggleGap} onToggleService={onToggleService} onToggleItem={onToggleItem} scopedServices={scopedServices} onConfigureItem={onConfigureItem} isInActiveTier={true} isSliding={slidingGaps.has(gap.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Deployed Section ─────────────────────────────────────────────
function DeployedSection({ deployedLog }) {
  const [expanded, setExpanded] = useState(false)
  const prevCountRef = useRef(0)

  useEffect(() => {
    if (deployedLog.length > prevCountRef.current) setExpanded(true)
    prevCountRef.current = deployedLog.length
  }, [deployedLog.length])

  if (deployedLog.length === 0) return null

  // Flatten all deployed items and group by category → severity
  const allItems = deployedLog.flatMap(e => e.items)
  const totalItems = allItems.length
  const catLabels = { alarms: 'Alarms', logs: 'Logs', traces: 'Traces', dashboards: 'Dashboards', anomaly: 'Anomaly Detection', slos: 'SLOs', 'cross-account': 'Cross-Account', 'cw-agent': 'CW Agent', 'alarm-actions': 'Alarm Actions' }
  const sevOrder = ['critical', 'high', 'medium', 'low']
  const sevLabels = { critical: 'Critical', high: 'High Priority', medium: 'Recommended', low: 'Nice to Have' }

  // Group: { alarms: { critical: [...], high: [...] }, logs: { ... } }
  const grouped = {}
  for (const item of allItems) {
    const cat = item.category || 'other'
    const sev = item.severity || 'medium'
    if (!grouped[cat]) grouped[cat] = {}
    if (!grouped[cat][sev]) grouped[cat][sev] = []
    grouped[cat][sev].push(item)
  }
  const categories = Object.keys(grouped).sort((a, b) => {
    const order = ['alarms', 'logs', 'traces', 'cw-agent', 'dashboards', 'anomaly', 'slos', 'cross-account', 'alarm-actions']
    return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b))
  })

  const isNewDeploy = deployedLog.length > 0
  const CatIcon = (cat) => categoryIcons[cat] || Lightning

  return (
    <div className="mt-6">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-status-active/20 bg-status-active/5 transition-all hover:bg-status-active/10">
        <CheckCircle size={16} weight="fill" className="text-status-active" />
        <span className="text-body-s font-semibold text-status-active">Deployed</span>
        <span className="text-[10px] text-foreground-disabled">{totalItems} items · {categories.length} categories</span>
        <span className="flex-1" />
        {expanded ? <CaretDown size={12} className="text-foreground-muted" /> : <CaretRight size={12} className="text-foreground-muted" />}
      </button>
      {expanded && (
        <div className="mt-2 pl-2 flex flex-col gap-3" style={isNewDeploy ? { animation: 'slideUp 0.5s ease-out' } : undefined}>
          {categories.map(cat => {
            const Icon = CatIcon(cat)
            const sevGroups = grouped[cat]
            const catTotal = Object.values(sevGroups).reduce((s, arr) => s + arr.length, 0)
            return (
              <div key={cat} className="rounded-xl border border-status-active/10 bg-status-active/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className="text-status-active" />
                  <span className="text-[11px] font-medium text-status-active">{catLabels[cat] || cat}</span>
                  <span className="text-[9px] text-foreground-disabled">{catTotal} items</span>
                </div>
                {sevOrder.filter(s => sevGroups[s]?.length > 0).map(sev => (
                  <div key={sev} className="ml-4 mb-1.5 last:mb-0">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${severityColors[sev]}`}>{sevLabels[sev]}</span>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {sevGroups[sev].map((item, ii) => (
                        <div key={ii} className="flex items-center gap-2 py-0.5">
                          <CheckCircle size={10} weight="fill" className="text-status-active flex-shrink-0" />
                          <span className="text-[10px] text-foreground-disabled">{item.name || item.id}</span>
                          {item.service && <span className="text-[8px] text-foreground-disabled">· {item.service}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(-20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

// ─── Cost Breakdown ───────────────────────────────────────────────
const UNIT_COSTS = { alarms: 0.10, logs: 2.00, traces: 0.50, dashboards: 3.00, anomaly: 10.00 }

function CostBreakdown({ cost, computedGaps, selectedItems, deployedItems }) {
  // Calculate deployed cost (added to current)
  const deployedLines = []; let deployedDelta = 0
  for (const gap of computedGaps) {
    const uc = UNIT_COSTS[gap.category]; if (!uc) continue
    if (gap.items?.length > 0) { const c = gap.items.filter(i => deployedItems.has(i.id)).length; if (c > 0) { const a = +(c * uc).toFixed(2); deployedDelta += a; deployedLines.push({ category: gap.category === 'alarms' ? 'Alarms' : gap.category === 'logs' ? 'Logs' : gap.category === 'traces' ? 'Traces' : gap.category, amount: a, note: `${c} deployed` }) } }
    else if (deployedItems.has(gap.id)) { const a = +(gap.fixCount * uc).toFixed(2); deployedDelta += a; deployedLines.push({ category: gap.category === 'dashboards' ? 'Dashboards' : gap.category === 'anomaly' ? 'Anomaly detection' : gap.category, amount: a, note: `${gap.fixCount} deployed` }) }
  }
  const currentTotal = cost.current.total + deployedDelta

  // Calculate projected cost from selected (not yet deployed)
  const projectedLines = []; let projectedDelta = 0
  for (const gap of computedGaps) {
    const uc = UNIT_COSTS[gap.category]; if (!uc) continue
    if (gap.items?.length > 0) { const c = gap.items.filter(i => selectedItems.has(i.id) && !deployedItems.has(i.id)).length; if (c > 0) { const a = +(c * uc).toFixed(2); projectedDelta += a; projectedLines.push({ category: gap.category === 'alarms' ? 'Alarms' : gap.category === 'logs' ? 'Logs' : gap.category === 'traces' ? 'Traces' : gap.category, amount: a, note: `${c} × ${uc}` }) } }
    else if (selectedItems.has(gap.id) && !deployedItems.has(gap.id)) { const a = +(gap.fixCount * uc).toFixed(2); projectedDelta += a; projectedLines.push({ category: gap.category === 'dashboards' ? 'Dashboards' : gap.category === 'anomaly' ? 'Anomaly detection' : gap.category, amount: a, note: `${gap.fixCount} × ${uc}` }) }
  }
  for (const p of cost.projected) { if (selectedItems.has(p.gapId) && !deployedItems.has(p.gapId)) { projectedDelta += p.amount; projectedLines.push({ category: p.category, amount: p.amount, note: p.note }) } }
  const projectedTotal = currentTotal + projectedDelta

  return (
    <div className="glass-card p-4">
      <h3 className="text-body-s font-semibold text-foreground mb-3">CloudWatch Cost</h3>
      <div className="flex items-baseline justify-between mb-1"><span className="text-[10px] text-foreground-disabled uppercase tracking-wider">Current</span><span className="text-body-m font-semibold text-foreground">${currentTotal.toLocaleString()}<span className="text-[11px] text-foreground-muted font-normal">/mo</span>{deployedDelta > 0 && <span className="text-[10px] text-status-degraded ml-1">+${deployedDelta.toFixed(2)} from deploys</span>}</span></div>
      {cost.current.breakdown.map((item, i) => <div key={i} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-foreground-muted">{item.category}</span><span className="text-[10px] text-foreground">${item.amount.toLocaleString()}</span></div>)}
      {deployedLines.map((item, i) => <div key={`d-${i}`} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-status-active">{item.category}</span><div className="flex items-center gap-2"><span className="text-[10px] text-foreground">+${item.amount.toFixed(2)}</span><span className="text-[9px] text-status-active">{item.note}</span></div></div>)}
      {projectedLines.length > 0 && (<div className="mt-3 pt-3 border-t border-border-muted/30"><div className="flex items-baseline justify-between mb-1"><span className="text-[10px] text-foreground-disabled uppercase tracking-wider">With selected</span><span className="text-body-m font-semibold text-foreground">${projectedTotal.toLocaleString()}<span className="text-[11px] text-foreground-muted font-normal">/mo</span><span className={`text-[10px] ml-1 ${projectedDelta >= 0 ? 'text-status-degraded' : 'text-status-active'}`}>{projectedDelta >= 0 ? '+' : ''}${projectedDelta.toFixed(2)}</span></span></div>{projectedLines.map((item, i) => <div key={i} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-foreground-muted">{item.category}</span><div className="flex items-center gap-2"><span className={`text-[10px] ${item.amount >= 0 ? 'text-foreground' : 'text-status-active'}`}>{item.amount >= 0 ? '+' : ''}${item.amount.toFixed(2)}</span><span className="text-[9px] text-foreground-disabled">{item.note}</span></div></div>)}</div>)}
      {cost.savings?.length > 0 && (<div className="mt-3 pt-3 border-t border-border-muted/30"><p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-1.5">Potential savings</p>{cost.savings.map((s, i) => <div key={i} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-foreground-muted">{s.description}</span><span className="text-[10px] text-status-active">-${s.amount.toLocaleString()}/mo</span></div>)}</div>)}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function Day0Page() {
  const [input, setInput] = useState('')
  const navigate = useNavigate()
  const { persona } = usePersona()
  const { applications, gaps, cost } = persona

  const [activeApp, setActiveApp] = useState('all')
  const [activeTier, setActiveTier] = useState('critical')
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [deployedItems, setDeployedItems] = useState(new Set())
  const [deployedLog, setDeployedLog] = useState([])
  const [discoveries, setDiscoveries] = useState([])
  const [showIaCModal, setShowIaCModal] = useState(false)
  const [alarmConfigItem, setAlarmConfigItem] = useState(null)
  const [logConfigItem, setLogConfigItem] = useState(null)
  const [traceConfigItem, setTraceConfigItem] = useState(null)
  const [deploying, setDeploying] = useState(null) // { count, progress }
  const [slidingGaps, setSlidingGaps] = useState(new Set())

  const allServices = applications.flatMap(a => a.services)
  const scopedServices = activeApp === 'all' ? allServices : (applications.find(a => a.id === activeApp)?.services || [])

  const computedGaps = useMemo(() => {
    const noAlarms = scopedServices.filter(s => !s.hasAlarms)
    const noLogs = scopedServices.filter(s => !s.hasLogs)
    const noTraces = scopedServices.filter(s => !s.hasTraces)
    const result = []

    const staleGap = gaps.find(g => g.id === 'g-stale')
    if (staleGap && (activeApp === 'all' || staleGap.appIds?.includes('all') || staleGap.appIds?.includes(activeApp))) result.push(staleGap)

    const splitByServiceSeverity = (services, category, titleFn, descFn) => {
      const allItems = getAllRecommendedItems(services, category)
      const byTier = { critical: [], high: [], medium: [], low: [] }
      for (const item of allItems) { const svc = services.find(s => s.name === item.service); byTier[serviceSeverity[svc?.type] || 'medium'].push(item) }
      for (const [tier, items] of Object.entries(byTier)) {
        if (items.length === 0) continue
        const sn = [...new Set(items.map(i => i.service))]
        result.push({ id: `g-${category}-${tier}`, category, title: titleFn(sn.length, items.length, tier), description: descFn(sn, items.length), severity: tier, services: sn.length, fixCount: items.length, fixLabel: `${items.length} ${category === 'alarms' ? 'alarms' : category === 'logs' ? 'log configs' : 'trace configs'}`, items })
      }
    }

    if (noAlarms.length > 0) splitByServiceSeverity(noAlarms, 'alarms', (sc, ic, t) => `${ic} ${t === 'critical' ? 'critical' : t === 'high' ? 'high priority' : t === 'medium' ? 'recommended' : 'optional'} alarms`, (sn, ic) => `${ic} alarms for ${sn.slice(0, 3).join(', ')}${sn.length > 3 ? ` +${sn.length - 3} more` : ''}.`)
    if (noLogs.length > 0) splitByServiceSeverity(noLogs, 'logs', (sc, ic, t) => `${t === 'critical' ? 'Critical' : t === 'high' ? 'High priority' : t === 'medium' ? 'Recommended' : 'Optional'} logging — ${sc} services`, (sn) => `${sn.slice(0, 3).join(', ')}${sn.length > 3 ? ` +${sn.length - 3} more` : ''} not sending logs.`)
    if (noTraces.length > 0) splitByServiceSeverity(noTraces, 'traces', (sc, ic, t) => `${t === 'critical' ? 'Critical' : t === 'high' ? 'High priority' : t === 'medium' ? 'Recommended' : 'Optional'} tracing — ${sc} services`, (sn) => `${sn.slice(0, 3).join(', ')}${sn.length > 3 ? ` +${sn.length - 3} more` : ''} have no X-Ray tracing.`)

    const extraIds = ['g-dashboards', 'g-anomaly', 'g-slos', 'g-cross-account', 'g-cw-agent', 'g-no-actions']
    for (const g of gaps) { if (extraIds.includes(g.id) && (activeApp === 'all' || g.appIds?.includes('all') || g.appIds?.includes(activeApp))) result.push(g) }

    for (const d of discoveries) {
      const existing = result.find(g => g.id === `g-disc-${d.severity}`)
      if (existing) { existing.items.push(d); existing.fixCount++ }
      else result.push({ id: `g-disc-${d.severity}`, category: d.category, title: `New: ${d.category} recommendations`, description: 'Discovered after CW Agent deployment.', severity: d.severity, services: 1, fixCount: 1, fixLabel: '1 new item', items: [d] })
    }

    result.sort((a, b) => ({ critical: 0, high: 1, medium: 2, low: 3 }[a.severity] ?? 3) - ({ critical: 0, high: 1, medium: 2, low: 3 }[b.severity] ?? 3))
    return result
  }, [activeApp, scopedServices, gaps, discoveries])

  const tierGroups = useMemo(() => {
    const g = { critical: [], high: [], medium: [], low: [] }
    for (const gap of computedGaps) g[gap.severity]?.push(gap)
    return g
  }, [computedGaps])

  const tierStats = useMemo(() => {
    const stats = {}
    for (const tier of ['critical', 'high', 'medium', 'low']) {
      const gapsInTier = tierGroups[tier] || []
      const total = gapsInTier.reduce((s, g) => s + (g.items?.length || 1), 0)
      const deployed = gapsInTier.reduce((s, g) => g.items ? s + g.items.filter(i => deployedItems.has(i.id)).length : s + (deployedItems.has(g.id) ? 1 : 0), 0)
      const selected = gapsInTier.reduce((s, g) => g.items ? s + g.items.filter(i => selectedItems.has(i.id) && !deployedItems.has(i.id)).length : s + (selectedItems.has(g.id) && !deployedItems.has(g.id) ? 1 : 0), 0)
      stats[tier] = { total, deployed, selected }
    }
    return stats
  }, [tierGroups, selectedItems, deployedItems])

  const toggleItem = (id) => { if (deployedItems.has(id)) return; setSelectedItems(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n }) }
  const toggleService = (items) => { const s = items.filter(i => !deployedItems.has(i.id)); setSelectedItems(p => { const n = new Set(p); const all = s.every(i => n.has(i.id)); s.forEach(i => all ? n.delete(i.id) : n.add(i.id)); return n }) }
  const toggleGapItems = (gap) => {
    if (!gap.items || gap.items.length === 0) { if (deployedItems.has(gap.id)) return; setSelectedItems(p => { const n = new Set(p); n.has(gap.id) ? n.delete(gap.id) : n.add(gap.id); return n }); return }
    const s = gap.items.filter(i => !deployedItems.has(i.id))
    setSelectedItems(p => { const n = new Set(p); const all = s.every(i => n.has(i.id)); s.forEach(i => all ? n.delete(i.id) : n.add(i.id)); return n })
  }

  const handleDeploy = () => {
    const itemsToDeploy = [...selectedItems].filter(id => !deployedItems.has(id))
    const count = itemsToDeploy.length
    if (count === 0) return

    // Build log entry with item details
    const logItems = []
    for (const id of itemsToDeploy) {
      for (const gap of computedGaps) {
        if (gap.items) { const item = gap.items.find(i => i.id === id); if (item) { logItems.push({ id, name: item.name, category: gap.category, severity: gap.severity, service: item.service }); break } }
        if (gap.id === id) { logItems.push({ id, name: gap.title, category: gap.category, severity: gap.severity }); break }
      }
    }

    // Show deploy progress
    setDeploying({ count, progress: 0 })
    let prog = 0
    const interval = setInterval(() => {
      prog += Math.random() * 25 + 10
      if (prog >= 100) {
        prog = 100
        clearInterval(interval)
        setDeploying({ count, progress: 100 })

        // After brief pause, finalize
        setTimeout(() => {
          // Mark gaps that will be fully deployed for slide animation
          const willSlide = new Set()
          for (const gap of computedGaps) {
            if (gap.items?.length > 0) {
              const allWillBeDone = gap.items.every(i => deployedItems.has(i.id) || selectedItems.has(i.id))
              if (allWillBeDone) willSlide.add(gap.id)
            } else if (selectedItems.has(gap.id)) willSlide.add(gap.id)
          }
          setSlidingGaps(willSlide)

          // After slide animation, commit deploy
          setTimeout(() => {
            const newDeployed = new Set(deployedItems)
            const cwAgent = itemsToDeploy.some(id => id === 'g-cw-agent' || id.includes('cwa-'))
            for (const id of itemsToDeploy) newDeployed.add(id)
            setDeployedItems(newDeployed)
            setSelectedItems(new Set())
            setDeployedLog(prev => [{ time: 'Just now', items: logItems }, ...prev])
            setSlidingGaps(new Set())
            setDeploying(null)

            if (cwAgent && discoveries.length === 0) setTimeout(() => setDiscoveries(postAgentDiscoveries), 600)
          }, 500)
        }, 400)
      } else {
        setDeploying({ count, progress: Math.min(prog, 99) })
      }
    }, 200)
  }

  const totalSelected = [...selectedItems].filter(id => !deployedItems.has(id)).length
  const selectedGapIds = new Set()
  for (const gap of computedGaps) {
    if (gap.items && gap.items.some(i => selectedItems.has(i.id) && !deployedItems.has(i.id))) selectedGapIds.add(gap.id)
    if (!gap.items && selectedItems.has(gap.id) && !deployedItems.has(gap.id)) selectedGapIds.add(gap.id)
  }

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/day0')} className="text-[11px] text-primary hover:text-primary-hover mb-2 flex items-center gap-1">← Back to overview</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-heading-xl font-normal tracking-tighter text-foreground">Observability Gaps</h1><p className="text-body-m text-foreground-muted mt-1">{scopedServices.length} services across {applications.length} applications</p></div>
          <div className="flex items-center gap-2"><Sparkle size={14} className="text-primary" weight="fill" /><span className="text-[11px] text-primary font-medium">Agent active</span></div>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setActiveApp('all')} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${activeApp === 'all' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>All ({allServices.length})</button>
        {applications.map(app => <button key={app.id} onClick={() => setActiveApp(app.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${activeApp === app.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>{app.name} ({app.services.length})</button>)}
      </div>

      <ProgressBar tiers={tierStats} activeTier={activeTier} onTierClick={(t) => setActiveTier(prev => prev === t ? null : t)} deploying={deploying} />

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div>
          {['critical', 'high', 'medium', 'low'].map(tier => {
            const gapsInTier = tierGroups[tier]
            if (!gapsInTier || gapsInTier.length === 0) return null
            return <TierSection key={tier} tier={tier} gaps={gapsInTier} isActive={activeTier === tier} onActivate={() => setActiveTier(prev => prev === tier ? null : tier)} selectedItems={selectedItems} deployedItems={deployedItems} onToggleGap={toggleGapItems} onToggleService={toggleService} onToggleItem={toggleItem} scopedServices={scopedServices} onConfigureItem={(item, category) => { if (category === 'logs') setLogConfigItem(item); else if (category === 'traces') setTraceConfigItem(item); else setAlarmConfigItem(item) }} slidingGaps={slidingGaps} />
          })}
          <DeployedSection deployedLog={deployedLog} />
        </div>

        <div className="flex flex-col gap-4 self-start sticky top-6">
          <div className="glass-card p-4">
            <h3 className="text-body-s font-semibold text-foreground mb-3">Selection Summary</h3>
            {totalSelected > 0 ? (<>
              <div className="flex items-baseline justify-between mb-1"><span className="text-[11px] text-foreground-muted">{totalSelected} items selected</span><span className="text-[11px] text-foreground-disabled">{selectedGapIds.size} categories</span></div>
              <div className="flex flex-col gap-1 mb-3">{computedGaps.filter(g => selectedGapIds.has(g.id)).map(g => { const c = g.items ? g.items.filter(i => selectedItems.has(i.id) && !deployedItems.has(i.id)).length : 1; return <div key={g.id} className="flex items-center justify-between py-0.5"><span className="text-[10px] text-foreground-muted truncate">{g.title}</span><span className="text-[9px] text-foreground-disabled">{c}</span></div> })}</div>
              <div className="flex flex-col gap-2">
                <button onClick={handleDeploy} disabled={!!deploying} className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-white text-[11px] font-medium transition-colors ${deploying ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}>{deploying ? <><CircleNotch size={12} className="animate-spin" /> Deploying...</> : <><Play size={12} /> Apply now</>}</button>
                <button onClick={() => setShowIaCModal(true)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-background-surface-1 border border-border-muted text-[11px] text-foreground hover:bg-background-surface-2 transition-colors"><Code size={12} /> Export as code</button>
                <button onClick={() => setSelectedItems(new Set())} className="text-[10px] text-foreground-muted hover:text-foreground text-center py-1">Clear selection</button>
              </div>
            </>) : (<p className="text-[10px] text-foreground-disabled">Select gaps to see a summary and take action.</p>)}
          </div>
          <CostBreakdown cost={cost} computedGaps={computedGaps} selectedItems={selectedItems} deployedItems={deployedItems} />
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3"><Robot size={16} className="text-primary" /><h3 className="text-body-s font-semibold text-foreground">Ask the agent</h3></div>
            <div className="relative"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. 'Why no tracing?'" className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 pr-9 text-[12px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40" /><button className="absolute right-1.5 top-1.5 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20"><PaperPlaneRight size={12} /></button></div>
          </div>
        </div>
      </div>

      {showIaCModal && <IaCModal onClose={() => setShowIaCModal(false)} selectedGaps={computedGaps.filter(g => selectedGapIds.has(g.id))} />}
      {alarmConfigItem && <AlarmConfigModal item={alarmConfigItem} onClose={() => setAlarmConfigItem(null)} onSave={() => { setSelectedItems(prev => new Set(prev).add(alarmConfigItem.id)); setAlarmConfigItem(null) }} />}
      {logConfigItem && <LogConfigModal item={logConfigItem} onClose={() => setLogConfigItem(null)} onSave={() => { setSelectedItems(prev => new Set(prev).add(logConfigItem.id)); setLogConfigItem(null) }} />}
      {traceConfigItem && <TraceConfigModal item={traceConfigItem} onClose={() => setTraceConfigItem(null)} onSave={() => { setSelectedItems(prev => new Set(prev).add(traceConfigItem.id)); setTraceConfigItem(null) }} />}
    </div>
  )
}
