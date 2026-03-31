import { useState } from 'react'
import { X, Bell, Plus, Trash, Gear, Lightning, PencilSimple } from '@phosphor-icons/react'
import { LineChart, mockTimeSeries } from './Chart'

const periodOptions = [
  { value: 60, label: '1 minute' }, { value: 300, label: '5 minutes' },
  { value: 900, label: '15 minutes' }, { value: 3600, label: '1 hour' },
]
const missingDataOptions = [
  { value: 'breaching', label: 'Treat as breaching' }, { value: 'notBreaching', label: 'Treat as not breaching' },
  { value: 'missing', label: 'Treat as missing' }, { value: 'ignore', label: 'Ignore' },
]
const comparisonLabels = {
  'GreaterThanThreshold': '> Greater than', 'GreaterThanOrEqualToThreshold': '>= Greater than or equal',
  'LessThanThreshold': '< Less than', 'LessThanOrEqualToThreshold': '<= Less than or equal',
  'LessThanLowerOrGreaterThanUpperThreshold': 'Outside anomaly band',
}
const actionTypes = [
  { id: 'sns', label: 'SNS Topic', placeholder: 'arn:aws:sns:us-east-1:...' },
  { id: 'email', label: 'Email', placeholder: 'ops-team@company.com' },
  { id: 'slack', label: 'Slack', placeholder: '#ops-alerts or webhook URL' },
  { id: 'lambda', label: 'Lambda', placeholder: 'arn:aws:lambda:...' },
]
const alarmStates = [
  { id: 'ALARM', label: 'In alarm', color: 'text-red-400 bg-red-400/10' },
  { id: 'OK', label: 'OK', color: 'text-status-active bg-status-active/10' },
  { id: 'INSUFFICIENT_DATA', label: 'Insufficient data', color: 'text-foreground-muted bg-foreground-muted/10' },
]

export function AlarmConfigModal({ item, onClose, onSave }) {
  const cfg = item?.config || {}
  const [tab, setTab] = useState('config')
  const [threshold, setThreshold] = useState(cfg.threshold ?? '')
  const [period, setPeriod] = useState(cfg.period || 300)
  const [evalPeriods, setEvalPeriods] = useState(cfg.evalPeriods || 1)
  const [comparison, setComparison] = useState(cfg.comparison || 'GreaterThanThreshold')
  const [missingData, setMissingData] = useState(cfg.missingData || 'missing')
  const [actions, setActions] = useState([])

  if (!item) return null
  const metricData = mockTimeSeries(48, cfg.threshold ? cfg.threshold * 0.7 : 50, cfg.threshold ? cfg.threshold * 0.3 : 20)
  const serviceName = item.name?.split(' — ')[0] || item.service || 'Service'
  const defaultAlarmName = item.shortName || item.name?.split(' — ')[1] || 'Alarm'
  const [alarmName, setAlarmName] = useState(defaultAlarmName)
  const [editingName, setEditingName] = useState(false)

  const addAction = () => setActions(prev => [...prev, { type: 'sns', destination: '', trigger: 'ALARM' }])
  const removeAction = (idx) => setActions(prev => prev.filter((_, i) => i !== idx))
  const updateAction = (idx, field, value) => setActions(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-[680px] max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-muted">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-status-active" />
            <div>
              <h2 className="text-body-m font-semibold text-foreground">
                {editingName ? (
                  <input type="text" value={alarmName} onChange={(e) => setAlarmName(e.target.value)} onBlur={() => setEditingName(false)} onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)} autoFocus className="bg-transparent border-b border-primary/40 outline-none text-body-m font-semibold text-foreground w-full" />
                ) : (
                  <span onClick={() => setEditingName(true)} className="cursor-pointer hover:text-primary transition-colors inline-flex items-center gap-1.5" title="Click to edit alarm name">{alarmName} <PencilSimple size={12} className="text-foreground-muted" /></span>
                )}
              </h2>
              <p className="text-[10px] text-foreground-muted">{serviceName} · {cfg.metric}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 border-b border-border-muted">
          <button onClick={() => setTab('config')} className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium border-b-2 transition-colors ${tab === 'config' ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'}`}>
            <Gear size={12} /> Configuration
          </button>
          <button onClick={() => setTab('actions')} className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium border-b-2 transition-colors ${tab === 'actions' ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'}`}>
            <Lightning size={12} /> Actions {actions.length > 0 && <span className="text-[9px] bg-primary/20 text-primary px-1.5 rounded-full">{actions.length}</span>}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'config' && (
            <>
              {/* Metric chart */}
              <div className="mb-5">
                <p className="text-[9px] text-foreground-disabled uppercase tracking-wider mb-2">Metric preview — last 48 hours</p>
                <div className="rounded-lg bg-background/40 border border-border-muted/20 p-3">
                  <LineChart data={metricData} color="#0ea5e9" height={120} unit={` ${cfg.unit || ''}`} thresholdValue={threshold !== '' && threshold !== null ? +threshold : undefined} thresholdLabel={threshold !== '' && threshold !== null ? `Threshold: ${threshold}${cfg.unit || ''}` : undefined} />
                </div>
              </div>
              {/* Settings */}
              <div className="grid grid-cols-2 gap-3">
                {cfg.threshold !== null && <div><label className="text-[10px] text-foreground-muted block mb-1">Threshold ({cfg.unit})</label><input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground focus:outline-none focus:border-primary/40" /></div>}
                <div><label className="text-[10px] text-foreground-muted block mb-1">Comparison</label><select value={comparison} onChange={(e) => setComparison(e.target.value)} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground focus:outline-none focus:border-primary/40">{Object.entries(comparisonLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div><label className="text-[10px] text-foreground-muted block mb-1">Period</label><select value={period} onChange={(e) => setPeriod(+e.target.value)} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground focus:outline-none focus:border-primary/40">{periodOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                <div><label className="text-[10px] text-foreground-muted block mb-1">Datapoints to alarm</label><input type="number" value={evalPeriods} onChange={(e) => setEvalPeriods(+e.target.value)} min={1} max={10} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground focus:outline-none focus:border-primary/40" /></div>
                <div className="col-span-2"><label className="text-[10px] text-foreground-muted block mb-1">Missing data treatment</label><select value={missingData} onChange={(e) => setMissingData(e.target.value)} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground focus:outline-none focus:border-primary/40">{missingDataOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              </div>
            </>
          )}

          {tab === 'actions' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[11px] text-foreground">Configure what happens when the alarm state changes</p>
                  <p className="text-[9px] text-foreground-muted mt-0.5">Each action triggers on a specific state transition</p>
                </div>
                <button onClick={addAction} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15"><Plus size={10} /> Add action</button>
              </div>

              {actions.length === 0 ? (
                <div className="rounded-lg border border-border-muted/20 border-dashed p-6 text-center">
                  <Lightning size={24} className="text-foreground-disabled mx-auto mb-2" />
                  <p className="text-[11px] text-foreground-disabled mb-1">No actions configured</p>
                  <p className="text-[9px] text-foreground-disabled mb-3">The alarm will detect issues but won't notify anyone.</p>
                  <button onClick={addAction} className="text-[10px] text-primary hover:text-primary-hover">Add your first action →</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {actions.map((action, idx) => (
                    <div key={idx} className="rounded-lg bg-background/30 border border-border-muted/20 p-3">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] text-foreground-muted">Action {idx + 1}</span>
                        <button onClick={() => removeAction(idx)} className="p-1 rounded hover:bg-background-surface-2 text-foreground-disabled hover:text-red-400"><Trash size={12} /></button>
                      </div>

                      {/* Trigger state */}
                      <div className="mb-2.5">
                        <label className="text-[9px] text-foreground-disabled uppercase tracking-wider block mb-1.5">Trigger when alarm state changes to</label>
                        <div className="flex gap-2">
                          {alarmStates.map(s => (
                            <button key={s.id} onClick={() => updateAction(idx, 'trigger', s.id)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium text-center transition-colors ${action.trigger === s.id ? s.color + ' border border-current/20' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-foreground-muted/30'}`}>
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action type + destination */}
                      <div className="flex gap-2">
                        <div className="w-32">
                          <label className="text-[9px] text-foreground-disabled block mb-1">Type</label>
                          <select value={action.type} onChange={(e) => updateAction(idx, 'type', e.target.value)} className="w-full h-8 rounded-lg bg-background-surface-1 border border-border-muted px-2 text-[11px] text-foreground focus:outline-none focus:border-primary/40">
                            {actionTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] text-foreground-disabled block mb-1">Destination</label>
                          <input type="text" value={action.destination} onChange={(e) => updateAction(idx, 'destination', e.target.value)} placeholder={actionTypes.find(t => t.id === action.type)?.placeholder} className="w-full h-8 rounded-lg bg-background-surface-1 border border-border-muted px-2 text-[11px] text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-primary/40" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border-muted">
          <div className="text-[10px] text-foreground-disabled">Cost: $0.10/mo · {actions.length} action{actions.length !== 1 ? 's' : ''}</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-[11px] text-foreground hover:bg-background-surface-2 transition-colors">Cancel</button>
            <button onClick={() => onSave?.({ threshold, period, evalPeriods, comparison, missingData, actions })} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-medium transition-colors">Save configuration</button>
          </div>
        </div>
      </div>
    </div>
  )
}
