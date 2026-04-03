import { useState } from 'react'
import { X, Sparkle } from '@phosphor-icons/react'

const logClasses = [
  { id: 'standard', label: 'Standard', desc: 'Full query support, higher ingestion cost ($0.50/GB)', cost: 0.50 },
  { id: 'infrequent', label: 'Infrequent Access', desc: 'Lower ingestion ($0.25/GB), higher query cost', cost: 0.25 },
]

const retentionOptions = [
  { value: 1, label: '1 day' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 365, label: '1 year' },
  { value: 0, label: 'Never expire' },
]

const formatOptions = [
  { id: 'json', label: 'JSON (structured)', desc: 'Easier to query with CloudWatch Logs Insights' },
  { id: 'text', label: 'Plain text', desc: 'Default format, less structured' },
]

export function LogConfigModal({ item, onClose, onSave }) {
  const [logClass, setLogClass] = useState('standard')
  const [retention, setRetention] = useState(30)
  const [format, setFormat] = useState('json')

  const selectedClass = logClasses.find(c => c.id === logClass)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-[520px] max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-muted">
          <div>
            <h2 className="text-body-m font-semibold text-foreground">Log Configuration</h2>
            <p className="text-[11px] text-foreground-muted">{item?.service || item?.name} · {item?.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          {/* Log class */}
          <div>
            <label className="text-[10px] text-foreground-disabled uppercase tracking-wider mb-2 block">Log class</label>
            <div className="flex flex-col gap-2">
              {logClasses.map(c => (
                <button key={c.id} onClick={() => setLogClass(c.id)} className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${logClass === c.id ? 'border-primary/40 bg-primary/5' : 'border-border-muted/30 hover:border-primary/20'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${logClass === c.id ? 'border-primary' : 'border-border-muted'}`}>
                    {logClass === c.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-foreground">{c.label}</p>
                    <p className="text-[10px] text-foreground-muted">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Retention */}
          <div>
            <label className="text-[10px] text-foreground-disabled uppercase tracking-wider mb-1.5 block">Retention period</label>
            <select value={retention} onChange={(e) => setRetention(+e.target.value)} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground focus:outline-none focus:border-primary/40">
              {retentionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="text-[9px] text-foreground-disabled mt-1">Longer retention increases storage costs. 30 days covers most debugging needs.</p>
          </div>

          {/* Format */}
          <div>
            <label className="text-[10px] text-foreground-disabled uppercase tracking-wider mb-2 block">Log format</label>
            <div className="flex gap-2">
              {formatOptions.map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)} className={`flex-1 p-3 rounded-lg border text-left transition-colors ${format === f.id ? 'border-primary/40 bg-primary/5' : 'border-border-muted/30 hover:border-primary/20'}`}>
                  <p className="text-[11px] font-medium text-foreground">{f.label}</p>
                  <p className="text-[9px] text-foreground-muted mt-0.5">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Agent recommendation */}
          <div className="flex gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <Sparkle size={12} className="text-primary flex-shrink-0 mt-0.5" weight="fill" />
            <p className="text-[10px] text-foreground-muted leading-relaxed">
              {logClass === 'standard' ? 'Standard class is recommended for services you actively debug. ' : 'Infrequent Access saves ~50% on ingestion but costs more to query. Best for audit/compliance logs. '}
              {format === 'json' ? 'JSON format enables structured queries in Logs Insights.' : 'Plain text works but limits query capabilities.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border-muted">
          <span className="text-[10px] text-foreground-disabled">Est. ~${selectedClass?.cost}/GB ingestion</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-body-s text-foreground hover:bg-background-surface-2">Cancel</button>
            <button onClick={() => onSave?.({ logClass, retention, format })} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
