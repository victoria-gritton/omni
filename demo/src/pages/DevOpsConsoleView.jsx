import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretDown, CaretUp } from '@phosphor-icons/react'

const CHART_DATA = [
  { time: '1:00', val: 0.1 }, { time: '1:10', val: 0.1 }, { time: '1:15', val: 0.1 },
  { time: '1:20', val: 0.1 }, { time: '1:25', val: 0.1 }, { time: '1:30', val: 0.1 },
  { time: '1:35', val: 0.1 }, { time: '1:40', val: 0.2 }, { time: '1:45', val: 0.8, deploy: true },
  { time: '1:48', val: 3.2 }, { time: '1:50', val: 7.1 }, { time: '1:52', val: 12.4 },
  { time: '1:54', val: 14.3 }, { time: '1:56', val: 13.1 }, { time: '1:58', val: 12.8 },
  { time: '2:00', val: 13.5 }, { time: '2:02', val: 12.9 }, { time: '2:04', val: 12.1 },
  { time: '2:06', val: 13.0 }, { time: '2:08', val: 12.4 }, { time: '2:10', val: 11.8 },
  { time: '2:12', val: 10.2 }, { time: '2:14', val: 8.5 }, { time: '2:16', val: 6.1 },
]

function ErrorRateChart() {
  const [hover, setHover] = useState(null)
  const W = 480, H = 100, PAD = { t: 10, r: 8, b: 18, l: 30 }
  const cw = W - PAD.l - PAD.r, ch = H - PAD.t - PAD.b
  const maxVal = 16
  const yTicks = [0, 4, 8, 12, 16]
  const deployIdx = CHART_DATA.findIndex(d => d.deploy)

  const pts = CHART_DATA.map((d, i) => ({
    x: PAD.l + (i / (CHART_DATA.length - 1)) * cw,
    y: PAD.t + ch - (d.val / maxVal) * ch,
    ...d, i
  }))

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = line + ` L${pts[pts.length-1].x},${PAD.t + ch} L${pts[0].x},${PAD.t + ch} Z`

  return (
    <div className="glass-card p-3 col-span-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Error Rate (%)
        </h3>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-foreground-muted">Current <span className="text-status-outage font-semibold ml-1">12.1%</span></span>
          <span className="text-foreground-muted">Baseline <span className="text-foreground font-semibold ml-1">0.1%</span></span>
          <span className="text-foreground-muted">Peak <span className="text-status-outage font-semibold ml-1">14.3%</span></span>
        </div>
      </div>
      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const mx = ((e.clientX - rect.left) / rect.width) * W
            let closest = 0, minD = Infinity
            pts.forEach((p, i) => { const d = Math.abs(p.x - mx); if (d < minD) { minD = d; closest = i } })
            setHover(closest)
          }}
        >
          <defs>
            <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></linearGradient>
          </defs>
          {/* Grid lines */}
          {yTicks.map(v => {
            const y = PAD.t + ch - (v / maxVal) * ch
            return <g key={v}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="white" strokeOpacity="0.04" strokeWidth="1"/>
              <text x={PAD.l - 6} y={y + 3} fill="#94a3b8" fontSize="8" fontFamily="sans-serif" textAnchor="end">{v}%</text>
            </g>
          })}
          {/* X axis labels */}
          {pts.filter((_, i) => i % 4 === 0).map(p => (
            <text key={p.i} x={p.x} y={H - 4} fill="#94a3b8" fontSize="8" fontFamily="sans-serif" textAnchor="middle">{p.time}</text>
          ))}
          {/* Baseline */}
          <line x1={PAD.l} y1={PAD.t + ch - (0.1 / maxVal) * ch} x2={W - PAD.r} y2={PAD.t + ch - (0.1 / maxVal) * ch} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,3" opacity="0.35"/>
          {/* Area + Line */}
          <path d={area} fill="url(#errGrad)"/>
          <path d={line} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round"/>
          {/* Deploy marker */}
          {deployIdx >= 0 && <>
            <line x1={pts[deployIdx].x} y1={PAD.t} x2={pts[deployIdx].x} y2={PAD.t + ch} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" opacity="0.7"/>
            <rect x={pts[deployIdx].x + 3} y={PAD.t} width="58" height="14" rx="3" fill="#f59e0b" fillOpacity="0.12"/>
            <text x={pts[deployIdx].x + 8} y={PAD.t + 10} fill="#f59e0b" fontSize="8" fontFamily="sans-serif">Deploy #847</text>
          </>}
          {/* Data points */}
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 4 : 1.5} fill={p.val > 1 ? '#ef4444' : '#3b82f6'} opacity={hover === i ? 1 : 0.5} className="transition-all duration-100"/>
          ))}
          {/* Hover crosshair + tooltip */}
          {hover !== null && pts[hover] && <>
            <line x1={pts[hover].x} y1={PAD.t} x2={pts[hover].x} y2={PAD.t + ch} stroke="white" strokeWidth="0.5" strokeOpacity="0.3"/>
            <line x1={PAD.l} y1={pts[hover].y} x2={W - PAD.r} y2={pts[hover].y} stroke="white" strokeWidth="0.5" strokeOpacity="0.15"/>
            <rect x={pts[hover].x - 32} y={pts[hover].y - 28} width="64" height="22" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="0.5"/>
            <text x={pts[hover].x} y={pts[hover].y - 18} fill="white" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">{pts[hover].val}% at {pts[hover].time}</text>
          </>}
        </svg>
      </div>
    </div>
  )
}

export default function DevOpsConsoleView() {
  const navigate = useNavigate()
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">
            Payments Service Incident
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-status-outage/10 border border-status-outage/20 text-[10px] font-semibold text-status-outage">
            ACTIVE
          </span>
        </div>

        <div className="mt-4">
          {/* Main content */}
          <div className="space-y-3">
            {/* Agent Summary */}
            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-primary/40 via-purple-500/30 to-orange-400/30">
            <div className="ai-glass-card p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="10" r="1.5" fill="#f59e0b" stroke="none"/><circle cx="15" cy="10" r="1.5" fill="#f59e0b" stroke="none"/><path d="M9 15h6"/></svg>
                <span className="text-body-s font-semibold text-orange-400">AI Investigation Summary</span>
                <span className="ml-auto text-[10px] text-foreground-disabled">2:14 AM</span>
              </div>

              <p className="text-body-m text-foreground leading-relaxed mb-4">
                Deploy <strong>#847</strong> introduced a reference to <strong className="text-orange-400">PaymentsTable-v2</strong> which doesn't exist. The Terraform change to create the table hasn't been applied yet -- the code shipped before the infrastructure. <strong>847 payment attempts have failed</strong> so far, all retryable. No data corruption detected.
              </p>

              <div className="flex items-center gap-6 mb-4 pb-4 border-b border-border-muted">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-outage" />
                  <span className="text-body-s text-foreground-muted">Impact</span>
                  <span className="text-body-s text-foreground font-semibold">847 failed payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-active" />
                  <span className="text-body-s text-foreground-muted">Data loss</span>
                  <span className="text-body-s text-status-active font-semibold">None</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-active" />
                  <span className="text-body-s text-foreground-muted">Duration</span>
                  <span className="text-body-s text-foreground font-semibold">22 min</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/8 border border-primary/20 hover:bg-primary/12 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><polyline points="11 19 2 12 11 5"/><polyline points="22 19 13 12 22 5"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-body-s font-semibold text-primary block">Recommended: Roll back deploy #847</span>
                    <span className="text-[11px] text-foreground-muted">Restore deploy #846 to fix the table reference immediately</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-background-surface-2 border border-border-muted text-foreground text-body-s font-semibold hover:bg-background-surface-2/80 active:scale-[0.98] transition-all">
                      Notify PoC
                    </button>
                    <button className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-primary text-primary-foreground text-body-s font-semibold hover:bg-primary/80 active:scale-[0.98] transition-all">
                    Roll Back
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-background-surface-2/30 border border-border-muted hover:bg-background-surface-2/50 transition-colors cursor-pointer" onClick={() => navigate('/devops-ide')}>
                  <div className="w-9 h-9 rounded-lg bg-background-surface-2 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground-muted"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-body-s font-semibold text-foreground block">Fix forward: Update code in IDE</span>
                    <span className="text-[11px] text-foreground-muted">Change table reference in payment-processor.ts:47 and apply Terraform</span>
                  </div>
                  <button onClick={() => navigate('/devops-ide')} className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-background-surface-2 border border-border-muted text-foreground text-body-s font-semibold hover:bg-background-surface-2/80 active:scale-[0.98] transition-all flex-shrink-0">
                    Open in IDE
                  </button>
                </div>
              </div>
            </div>
            </div>

            {/* Consolidated visualization: Error Rate + Service Map + Timeline */}
            <div className="grid grid-cols-3 gap-3">
              {/* Error Rate - spans 2 cols */}
              <ErrorRateChart />

              {/* Service Health - right col */}
              <div className="glass-card p-4">
                <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                  Service Health
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-status-outage/15 border border-status-outage/30 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between"><span className="text-body-s text-foreground font-medium">Payments</span><span className="text-[10px] text-status-outage font-semibold">DOWN</span></div>
                      <div className="h-1 mt-1 rounded-full bg-background-surface-2 overflow-hidden"><div className="h-full w-full bg-status-outage rounded-full" style={{width:'100%'}}/></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-status-blocked/15 border border-status-blocked/30 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between"><span className="text-body-s text-foreground font-medium">DynamoDB</span><span className="text-[10px] text-status-blocked font-semibold">SLOW</span></div>
                      <div className="h-1 mt-1 rounded-full bg-background-surface-2 overflow-hidden"><div className="h-full bg-status-blocked rounded-full" style={{width:'60%'}}/></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-status-active/15 border border-status-active/30 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M3 21V5a2 2 0 012-2h14a2 2 0 012 2v16"/><path d="M3 10h18"/><rect x="7" y="14" width="3" height="4"/><rect x="14" y="14" width="3" height="4"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between"><span className="text-body-s text-foreground font-medium">Gateway</span><span className="text-[10px] text-status-active font-semibold">OK</span></div>
                      <div className="h-1 mt-1 rounded-full bg-background-surface-2 overflow-hidden"><div className="h-full bg-status-active rounded-full" style={{width:'15%'}}/></div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-foreground-disabled mt-3">DynamoDB latency is a consequence, not the cause</p>
              </div>

            {/* Root Cause Chain */}
            <div className="glass-card p-5 col-span-2">
              <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-4 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                Root Cause Chain
              </h3>

              <div className="space-y-0">
                {[
                  { t: '5:47 PM', e: 'Raj Patel merges commit a3f7c2d', d: 'Table reference changed from PaymentsTable to PaymentsTable-v2 as part of migration work', icon: 'commit', s: 'warn' },
                  { t: '5:47 PM', e: 'Terraform change not applied', d: 'Infrastructure to create PaymentsTable-v2 is still in the pipeline awaiting approval', icon: 'infra', s: 'warn' },
                  { t: '1:45 AM', e: 'Deploy #847 goes live', d: 'New code referencing non-existent table reaches production', icon: 'deploy', s: 'err' },
                  { t: '1:52 AM', e: 'ResourceNotFoundException on every request', d: '12% error rate -- 847 payment attempts fail with clean 500 errors', icon: 'error', s: 'err' },
                ].map((step, i, arr) => (
                  <div key={i} className="flex gap-4">
                    {/* Timeline column */}
                    <div className="flex flex-col items-center w-6 flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${step.s === 'err' ? 'bg-status-outage/15 text-status-outage ring-1 ring-status-outage/30' : 'bg-status-blocked/15 text-status-blocked ring-1 ring-status-blocked/30'}`}>
                        {i + 1}
                      </div>
                      {i < arr.length - 1 && <div className={`w-px flex-1 my-1 ${step.s === 'err' ? 'bg-status-outage/20' : 'bg-status-blocked/20'}`} />}
                    </div>
                    {/* Content */}
                    <div className={`flex-1 pb-4 ${i < arr.length - 1 ? '' : 'pb-0'}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-body-s text-foreground font-semibold">{step.e}</span>
                        <span className="text-[10px] text-foreground-disabled ml-auto flex-shrink-0">{step.t}</span>
                      </div>
                      <p className="text-[11px] text-foreground-muted leading-relaxed">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conclusion */}
              <div className="mt-3 pt-3 border-t border-border-muted flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <span className="text-body-s text-primary font-semibold block">Conclusion</span>
                  <p className="text-[11px] text-foreground-muted leading-relaxed">Code change shipped before infrastructure was ready. The fix is to roll back deploy #847 or apply the Terraform change to create PaymentsTable-v2.</p>
                </div>
              </div>
            </div>

              {/* Customer Impact */}
              <div className="glass-card p-4">
                <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  Customer Impact
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2.5 rounded-lg bg-status-outage/10 border border-status-outage/20 text-center">
                    <div className="text-xl font-bold text-status-outage">847</div>
                    <div className="text-[10px] text-foreground-muted mt-0.5">failed checkouts</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-status-blocked/10 border border-status-blocked/20 text-center">
                    <div className="text-xl font-bold text-status-blocked">~$12.4k</div>
                    <div className="text-[10px] text-foreground-muted mt-0.5">est. revenue impact</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-body-s">
                    <span className="text-foreground-muted">Affected endpoint</span>
                    <span className="text-foreground font-mono text-[10px]">/process-payment</span>
                  </div>
                  <div className="flex items-center justify-between text-body-s">
                    <span className="text-foreground-muted">Error type</span>
                    <span className="text-status-outage font-mono text-[10px]">500 ResourceNotFound</span>
                  </div>
                  <div className="flex items-center justify-between text-body-s">
                    <span className="text-foreground-muted">Retryable</span>
                    <span className="text-status-active font-semibold">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-body-s">
                    <span className="text-foreground-muted">Data corruption</span>
                    <span className="text-status-active font-semibold">None</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
