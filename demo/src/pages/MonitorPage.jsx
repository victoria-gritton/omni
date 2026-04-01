import { Sparkle } from '@phosphor-icons/react'
import TopologyMap from '../components/TopologyMap'
import { nodes as topoNodes, edges as topoEdges, insights as topoInsights } from '../data/topology'

// Filter topology to key services
const monitorNodeIds = new Set([
  'customer-portal', 'order-management', 'inventory-system', 'payments-app',
  'shipping-tracker', 'loyalty-program', 'search-app', 'fraud-detection',
  'identity-provider', 'notification-hub',
])
const monitorYRemap = { 0.05: 0.08, 0.25: 0.40, 0.42: 0.40, 0.62: 0.75 }
const monitorNodes = topoNodes.filter(n => monitorNodeIds.has(n.id)).map(n => ({ ...n, y: monitorYRemap[n.y] ?? n.y }))
const monitorEdges = topoEdges.filter(e => monitorNodeIds.has(e.from) && monitorNodeIds.has(e.to))
const monitorInsights = topoInsights.filter(ins => (ins.relatedNodes || []).some(id => monitorNodeIds.has(id)))

export default function MonitorPage() {
  return (
    <div className="px-6 py-6">
      <h1 className="text-[22px] leading-[28px] font-normal tracking-tighter text-foreground mb-1">Monitor</h1>
      <p className="text-body-m text-foreground-muted mb-4">Active monitoring & alerts</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Trends & signals */}
        <div className="glass-card p-3">
          <h3 className="text-heading-xs font-normal text-foreground mb-2">Trends & signals</h3>

          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/[0.04] border border-primary/10 mb-2">
            <Sparkle size={12} className="text-primary mt-0.5 flex-shrink-0" weight="fill" />
            <p className="text-[11px] text-foreground leading-relaxed">3 signals worth your attention: a capacity trend, a latency improvement, and week-over-week health gains.</p>
          </div>

          <div className="space-y-2">
            {/* Capacity Trend */}
            <div className="pb-2 border-b border-border-muted">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-foreground-muted">Capacity trend</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-heading-l font-normal text-foreground">~12 days</span>
                    <span className="text-[10px] text-foreground">until scaling needed</span>
                  </div>
                  <p className="text-[11px] text-foreground-muted mt-1">DynamoDB UsersTable read capacity trending up. At current growth rate, will exceed provisioned capacity.</p>
                </div>
                <div className="w-[120px] flex-shrink-0">
                  <svg viewBox="0 0 120 48" className="w-full" style={{ height: 48 }}>
                    <path d="M0,42 L10,40 L20,38 L30,37 L40,35 L50,32 L60,28 L70,24 L80,20 L90,16 L100,12 L110,8 L120,4" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
                    <path d="M0,42 L10,40 L20,38 L30,37 L40,35 L50,32 L60,28 L70,24 L80,20 L90,16 L100,12 L110,8 L120,4 L120,48 L0,48 Z" fill="#0ea5e9" fillOpacity="0.08" />
                    <line x1="0" y1="10" x2="120" y2="10" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                  </svg>
                  <div className="flex justify-between text-[8px] text-foreground-disabled mt-0.5">
                    <span>14d ago</span><span>now</span><span>+12d</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement */}
            <div className="py-2 border-b border-border-muted">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-foreground-muted">Improvement detected</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-heading-l font-normal text-foreground">−77%</span>
                    <span className="text-[10px] text-foreground-muted">auth latency</span>
                  </div>
                  <p className="text-[11px] text-foreground-muted mt-1">Identity Provider p99 dropped from 180ms to 42ms after connection pooling. Sustained for 7 days.</p>
                </div>
                <div className="w-[120px] flex-shrink-0">
                  <svg viewBox="0 0 120 48" className="w-full" style={{ height: 48 }}>
                    <path d="M0,4 L15,6 L30,8 L45,10 L55,28 L65,36 L75,40 L85,42 L95,43 L105,43 L120,44" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
                    <path d="M0,4 L15,6 L30,8 L45,10 L55,28 L65,36 L75,40 L85,42 L95,43 L105,43 L120,44 L120,48 L0,48 Z" fill="#0ea5e9" fillOpacity="0.08" />
                  </svg>
                  <div className="flex justify-between text-[8px] text-foreground-disabled mt-0.5">
                    <span>180ms</span><span>42ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Week-over-Week */}
            <div className="pt-2">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-foreground-muted">Week-over-week</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-heading-l font-normal text-foreground">p99 −40%</span>
                    <span className="text-body-s text-foreground">errors −18%</span>
                  </div>
                  <p className="text-[11px] text-foreground-muted mt-1">Your services are healthier than last week. Latency and error rates both trending down.</p>
                </div>
                <div className="w-[120px] flex-shrink-0">
                  <svg viewBox="0 0 120 48" className="w-full" style={{ height: 48 }}>
                    <polyline points="0,10 15,12 30,14 45,18 60,22 75,20 90,24 105,22 120,20" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                    <polyline points="0,22 15,24 30,28 45,30 60,32 75,34 90,36 105,38 120,40" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
                    <path d="M0,22 L15,24 L30,28 L45,30 L60,32 L75,34 L90,36 L105,38 L120,40 L120,48 L0,48 Z" fill="#0ea5e9" fillOpacity="0.08" />
                  </svg>
                  <div className="flex justify-between text-[8px] text-foreground-disabled mt-0.5">
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-primary inline-block rounded" />this wk</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-foreground-disabled inline-block rounded" />last wk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application map */}
        <div className="glass-card p-3 flex flex-col" style={{ height: '460px' }}>
          <h3 className="text-heading-xs font-normal text-foreground mb-2">Application map</h3>

          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/[0.04] border border-primary/10 mb-2">
            <Sparkle size={12} className="text-primary mt-0.5 flex-shrink-0" weight="fill" />
            <p className="text-[11px] text-foreground leading-relaxed">I'm watching 2 anomalies on the payment path. Order Management is degraded and cascading into Payments.</p>
          </div>

          <div className="flex-1 min-h-0">
            <TopologyMap customNodes={monitorNodes} customEdges={monitorEdges} customInsights={monitorInsights} />
          </div>
        </div>
      </div>
    </div>
  )
}
