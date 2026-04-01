import { useState } from 'react'
import { X, Sparkle } from '@phosphor-icons/react'

const samplingModes = [
  { id: 'fixed', label: 'Fixed rate', desc: 'Sample a fixed percentage of all requests' },
  { id: 'reservoir', label: 'Reservoir + fixed', desc: 'Guarantee a minimum per second, then sample the rest at a fixed rate' },
]

const rateOptions = [
  { value: 1, label: '100% (all requests)' },
  { value: 0.5, label: '50%' },
  { value: 0.1, label: '10%' },
  { value: 0.05, label: '5%' },
  { value: 0.01, label: '1%' },
]

export function TraceConfigModal({ item, onClose, onSave }) {
  const [mode, setMode] = useState('reservoir')
  const [rate, setRate] = useState(0.1)
  const [reservoir, setReservoir] = useState(5)

  const estCostPerMillion = rate * 5 // rough: $5 per million traces at 100%

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-[520px] max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-muted">
          <div>
            <h2 className="text-body-m font-semibold text-foreground">Trace Configuration</h2>
            <p className="text-[11px] text-foreground-muted">{item?.service || item?.name} · {item?.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          {/* Sampling mode */}
          <div>
            <label className="text-[10px] text-foreground-disabled uppercase tracking-wider mb-2 block">Sampling mode</label>
            <div className="flex flex-col gap-2">
              {samplingModes.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)} className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${mode === m.id ? 'border-primary/40 bg-primary/5' : 'border-border-muted/30 hover:border-primary/20'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${mode === m.id ? 'border-primary' : 'border-border-muted'}`}>
                    {mode === m.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-foreground">{m.label}</p>
                    <p className="text-[10px] text-foreground-muted">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sampling rate */}
          <div>
            <label className="text-[10px] text-foreground-disabled uppercase tracking-wider mb-1.5 block">Sampling rate</label>
            <select value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground focus:outline-none focus:border-primary/40">
              {rateOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="text-[9px] text-foreground-disabled mt-1">Higher rates give better visibility but increase costs. 10% is a good starting point for most services.</p>
          </div>

          {/* Reservoir (only for reservoir mode) */}
          {mode === 'reservoir' && (
            <div>
              <label className="text-[10px] text-foreground-disabled uppercase tracking-wider mb-1.5 block">Reservoir size (traces/sec)</label>
              <input type="number" value={reservoir} onChange={(e) => setReservoir(+e.target.value)} min={1} max={100} className="w-full h-9 rounded-lg bg-background-surface-1 border border-border-muted px-3 text-[12px] text-foreground focus:outline-none focus:border-primary/40" />
              <p className="text-[9px] text-foreground-disabled mt-1">Guarantees at least {reservoir} traces per second before applying the sampling rate to the rest.</p>
            </div>
          )}

          {/* Agent recommendation */}
          <div className="flex gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <Sparkle size={12} className="text-primary flex-shrink-0 mt-0.5" weight="fill" />
            <p className="text-[10px] text-foreground-muted leading-relaxed">
              {mode === 'reservoir'
                ? `Reservoir mode ensures you always capture traces during low-traffic periods. With ${reservoir} traces/sec guaranteed and ${(rate * 100).toFixed(0)}% sampling, you'll get good coverage without excessive costs.`
                : `Fixed rate at ${(rate * 100).toFixed(0)}% is simple and predictable. Good for high-traffic services where you don't need every trace.`
              }
              {rate >= 0.5 && ' Consider a lower rate for high-traffic services to control costs.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border-muted">
          <span className="text-[10px] text-foreground-disabled">Est. ~${estCostPerMillion.toFixed(2)}/million traces</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-background-surface-1 border border-border-muted text-body-s text-foreground hover:bg-background-surface-2">Cancel</button>
            <button onClick={() => onSave?.({ mode, rate, reservoir })} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-body-s font-medium">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
