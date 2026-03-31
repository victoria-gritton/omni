import { useState, useEffect } from 'react'
import { X, Sparkle, PaperPlaneRight, Code, Play, CaretRight, CaretDown, CheckSquare, Square } from '@phosphor-icons/react'
import { LineChart, mockTimeSeries } from './Chart'
import { AlarmConfigModal } from './AlarmConfigModal'

// Inline config editor for alarm items
function ConfigEditor({ config }) {
  if (!config) return null
  const [threshold, setThreshold] = useState(config.threshold ?? '')
  const [period, setPeriod] = useState(config.period || 300)
  const [evalPeriods, setEvalPeriods] = useState(config.evalPeriods || 1)
  const [missingData, setMissingData] = useState(config.missingData || 'missing')

  const periodOptions = [{ v: 60, l: '1 min' }, { v: 300, l: '5 min' }, { v: 900, l: '15 min' }, { v: 3600, l: '1 hour' }]
  const missingOptions = [{ v: 'breaching', l: 'Treat as breaching' }, { v: 'notBreaching', l: 'Treat as not breaching' }, { v: 'missing', l: 'Treat as missing' }]

  return (
    <div className="mt-1.5 mb-1 ml-6 p-2.5 rounded-lg bg-background/40 border border-border-muted/20" onClick={(e) => e.stopPropagation()}>
      <div className="grid grid-cols-2 gap-2">
        {config.threshold !== null && (
          <div>
            <label className="text-[8px] text-foreground-disabled uppercase tracking-wider">Threshold ({config.unit})</label>
            <input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full h-7 mt-0.5 rounded bg-background-surface-1 border border-border-muted px-2 text-[10px] text-foreground focus:outline-none focus:border-primary/40" />
          </div>
        )}
        <div>
          <label className="text-[8px] text-foreground-disabled uppercase tracking-wider">Period</label>
          <select value={period} onChange={(e) => setPeriod(+e.target.value)} className="w-full h-7 mt-0.5 rounded bg-background-surface-1 border border-border-muted px-2 text-[10px] text-foreground focus:outline-none focus:border-primary/40">
            {periodOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[8px] text-foreground-disabled uppercase tracking-wider">Eval periods</label>
          <input type="number" value={evalPeriods} onChange={(e) => setEvalPeriods(+e.target.value)} min={1} max={10} className="w-full h-7 mt-0.5 rounded bg-background-surface-1 border border-border-muted px-2 text-[10px] text-foreground focus:outline-none focus:border-primary/40" />
        </div>
        <div>
          <label className="text-[8px] text-foreground-disabled uppercase tracking-wider">Missing data</label>
          <select value={missingData} onChange={(e) => setMissingData(e.target.value)} className="w-full h-7 mt-0.5 rounded bg-background-surface-1 border border-border-muted px-2 text-[10px] text-foreground focus:outline-none focus:border-primary/40">
            {missingOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
      </div>
      <p className="text-[8px] text-foreground-disabled mt-1.5">Metric: {config.metric} · Comparison: {config.comparison}</p>
    </div>
  )
}

// Group items by service name (text before " — ")
function groupByService(items) {
  const groups = {}
  for (const item of items) {
    const sep = item.name.indexOf(' — ')
    const svc = sep > -1 ? item.name.substring(0, sep) : 'Other'
    if (!groups[svc]) groups[svc] = []
    groups[svc].push({ ...item, shortName: sep > -1 ? item.name.substring(sep + 3) : item.name })
  }
  return groups
}

export function AgentDrawer({ investigation, onClose, onExportCode }) {
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [expanded, setExpanded] = useState(new Set())
  const [configOpen, setConfigOpen] = useState(new Set())
  const [alarmConfigItem, setAlarmConfigItem] = useState(null)

  useEffect(() => {
    if (investigation?.selectableItems) {
      setSelected(new Set(investigation.selectableItems.filter(i => i.defaultOn).map(i => i.id)))
      setExpanded(new Set())
    } else {
      setSelected(new Set())
    }
  }, [investigation])

  if (!investigation) return null

  const items = investigation.selectableItems || []
  const hasSelectable = items.length > 0
  const groups = hasSelectable ? groupByService(items) : {}
  const serviceNames = Object.keys(groups)
  const needsGrouping = serviceNames.length > 1 && items.length > 6
  const selectedItems = items.filter(i => selected.has(i.id))
  const totalCost = selectedItems.reduce((s, i) => s + (i.cost || 0), 0)

  const toggle = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleGroup = (svc) => {
    const grp = groups[svc]
    setSelected(prev => {
      const n = new Set(prev)
      const allIn = grp.every(i => n.has(i.id))
      grp.forEach(i => allIn ? n.delete(i.id) : n.add(i.id))
      return n
    })
  }
  const toggleExpand = (svc) => setExpanded(prev => { const n = new Set(prev); n.has(svc) ? n.delete(svc) : n.add(svc); return n })
  const selectAll = () => {
    if (selected.size === items.length) setSelected(new Set())
    else setSelected(new Set(items.map(i => i.id)))
  }

  return (
    <div className="fixed inset-y-0 left-14 w-[480px] z-50 flex flex-col bg-[#0c1120] border-r border-border-muted shadow-2xl">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-muted flex-shrink-0">
        <div className="flex items-center gap-2"><Sparkle size={16} className="text-primary" weight="fill" /><span className="text-body-s font-semibold text-foreground">Agent Investigation</span></div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h3 className="text-body-m font-semibold text-foreground mb-1">{investigation.title}</h3>
        <p className="text-[11px] text-foreground-muted mb-4">{investigation.subtitle}</p>

        {investigation.messages.map((msg, i) => (
          <div key={i} className="mb-4">
            {msg.type === 'text' && <div className="flex gap-3"><div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5"><Sparkle size={10} className="text-primary" weight="fill" /></div><p className="text-[12px] text-foreground leading-relaxed">{msg.content}</p></div>}
            {msg.type === 'chart' && <div className="glass-card p-3 my-2"><p className="text-[9px] text-foreground-disabled mb-2">{msg.label}</p><LineChart data={mockTimeSeries(24, msg.base || 50, msg.variance || 20)} color={msg.color || '#0ea5e9'} height={64} unit={msg.unit || ''} thresholdValue={msg.threshold} thresholdLabel={msg.thresholdLabel} /></div>}
            {msg.type === 'finding' && <div className={`rounded-lg p-3 my-2 border-l-2 ${msg.severity === 'critical' ? 'border-l-red-400 bg-red-400/5' : msg.severity === 'warning' ? 'border-l-status-degraded bg-status-degraded/5' : 'border-l-primary bg-primary/5'}`}><p className="text-[11px] font-medium text-foreground">{msg.title}</p><p className="text-[10px] text-foreground-muted mt-1">{msg.content}</p></div>}
            {msg.type === 'actions' && !hasSelectable && <div className="flex gap-2 my-3"><button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-medium"><Play size={12} /> Apply now</button><button onClick={() => onExportCode?.()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-[11px] text-foreground hover:bg-background-surface-2"><Code size={12} /> Export as code</button></div>}
            {msg.type === 'steps' && <div className="my-2">{msg.steps.map((step, si) => <div key={si} className="flex gap-2 py-1.5"><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 ${step.status === 'found' ? 'bg-red-400/20 text-red-400' : 'bg-status-active/20 text-status-active'}`}>{si + 1}</div><div><p className="text-[11px] text-foreground">{step.action}</p><p className="text-[10px] text-foreground-muted">{step.result}</p></div></div>)}</div>}

            {msg.type === 'selectable' && hasSelectable && (
              <div className="my-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-foreground-disabled uppercase tracking-wider">{selected.size} of {items.length} selected</p>
                  <button onClick={selectAll} className="text-[9px] text-primary hover:text-primary-hover">{selected.size === items.length ? 'Deselect all' : 'Select all'}</button>
                </div>

                {needsGrouping ? (
                  /* Grouped view — collapsible per service */
                  <div className="flex flex-col gap-1">
                    {serviceNames.map(svc => {
                      const grp = groups[svc]
                      const grpSelected = grp.filter(i => selected.has(i.id)).length
                      const allIn = grpSelected === grp.length
                      const someIn = grpSelected > 0 && !allIn
                      const isExpanded = expanded.has(svc)
                      const grpCost = grp.filter(i => selected.has(i.id)).reduce((s, i) => s + i.cost, 0)

                      return (
                        <div key={svc} className="rounded-lg border border-border-muted/20 overflow-hidden">
                          <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-background-surface-2/30 cursor-pointer" onClick={() => toggleExpand(svc)}>
                            <button onClick={(e) => { e.stopPropagation(); toggleGroup(svc) }} className="flex-shrink-0">
                              {allIn ? <CheckSquare size={14} weight="fill" className="text-primary" /> : someIn ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} className="text-foreground-disabled" />}
                            </button>
                            {isExpanded ? <CaretDown size={10} className="text-foreground-muted" /> : <CaretRight size={10} className="text-foreground-muted" />}
                            <span className="text-[11px] font-medium text-foreground flex-1">{svc}</span>
                            <span className="text-[9px] text-foreground-disabled">{grpSelected}/{grp.length}</span>
                            {grpCost !== 0 && <span className="text-[9px] text-foreground-muted">{grpCost >= 0 ? '+' : ''}${grpCost.toFixed(2)}</span>}
                          </div>
                          {isExpanded && (
                            <div className="border-t border-border-muted/10 bg-background/20">
                              {grp.map(item => (
                                <div key={item.id}>
                                  <div onClick={() => toggle(item.id)} className={`flex items-center gap-2 py-1.5 px-3 pl-9 cursor-pointer transition-colors ${selected.has(item.id) ? 'bg-primary/5' : 'hover:bg-background-surface-2/30'}`}>
                                    {selected.has(item.id) ? <CheckSquare size={12} weight="fill" className="text-primary flex-shrink-0" /> : <Square size={12} className="text-foreground-disabled flex-shrink-0" />}
                                    <span className="text-[10px] text-foreground flex-1">{item.shortName}</span>
                                    {item.config && <button onClick={(e) => { e.stopPropagation(); setAlarmConfigItem(item) }} className="text-[9px] text-primary hover:text-primary-hover">Edit</button>}
                                    <span className="text-[9px] text-foreground-muted">${item.cost.toFixed(2)}</span>
                                  </div>
                                  {configOpen.has(item.id) && null}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* Flat view — for small lists */
                  <div className="flex flex-col gap-1">
                    {items.map(item => (
                      <div key={item.id}>
                        <div onClick={() => toggle(item.id)} className={`flex items-center gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-colors ${selected.has(item.id) ? 'bg-primary/5 border border-primary/20' : 'border border-transparent hover:bg-background-surface-2/50'}`}>
                          {selected.has(item.id) ? <CheckSquare size={14} weight="fill" className="text-primary flex-shrink-0" /> : <Square size={14} className="text-foreground-disabled flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-foreground">{item.name}</p>
                            {item.description && <p className="text-[9px] text-foreground-muted">{item.description}</p>}
                          </div>
                          {item.config && <button onClick={(e) => { e.stopPropagation(); setAlarmConfigItem(item) }} className="text-[9px] text-primary hover:text-primary-hover">Edit</button>}
                          <span className="text-[10px] text-foreground-muted flex-shrink-0">{item.cost >= 0 ? '+' : ''}${item.cost.toFixed(2)}/mo</span>
                        </div>
                        {configOpen.has(item.id) && null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {investigation.followUps && (
          <div className="mt-2"><p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-2">Follow up</p><div className="flex flex-col gap-1">{investigation.followUps.map((q, i) => <button key={i} className="flex items-center gap-2 text-[11px] text-primary hover:text-primary-hover text-left py-1 hover:bg-primary/5 rounded px-2 -mx-2"><CaretRight size={10} /> {q}</button>)}</div></div>
        )}
      </div>

      {/* Sticky action bar */}
      {hasSelectable && selected.size > 0 && (
        <div className="flex-shrink-0 border-t border-border-muted bg-[#0c1120] px-5 py-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] text-foreground-muted">{selected.size} of {items.length} selected</span>
            <div className="text-right">
              <span className="text-[10px] text-foreground-disabled">Estimated cost</span>
              <p className="text-body-s font-semibold text-foreground">{totalCost >= 0 ? '+' : ''}${totalCost.toFixed(2)}<span className="text-[10px] text-foreground-muted font-normal">/mo</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-medium transition-colors"><Play size={12} /> Apply now</button>
            <button onClick={() => onExportCode?.(selectedItems)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-background-surface-1 border border-border-muted text-[11px] text-foreground hover:bg-background-surface-2 transition-colors"><Code size={12} /> Export as code</button>
          </div>
        </div>
      )}

      {/* Chat input */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-border-muted">
        <div className="relative">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a follow-up..." className="w-full h-10 rounded-lg bg-background-surface-1 border border-border-muted px-3 pr-10 text-[12px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40" />
          <button className="absolute right-2 top-2 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20"><PaperPlaneRight size={12} /></button>
        </div>
      </div>

      {/* Alarm Config Modal */}
      {alarmConfigItem && (
        <AlarmConfigModal item={alarmConfigItem} onClose={() => setAlarmConfigItem(null)} onSave={() => setAlarmConfigItem(null)} />
      )}
    </div>
  )
}
