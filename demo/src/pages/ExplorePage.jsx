import { useState } from 'react'
import {
  MagnifyingGlass, Sparkle, Clock, ArrowRight,
  ChartBar, Database, Pulse, Warning, Globe
} from '@phosphor-icons/react'

const recentSearches = [
  { query: 'payment-service error rate last 24h', type: 'metrics' },
  { query: 'OOM events in us-east-1', type: 'logs' },
  { query: 'checkout-service latency p99', type: 'traces' },
]

const suggestedExplorations = [
  {
    icon: Warning,
    title: 'Anomaly detected: API Gateway 5xx spike',
    subtitle: 'Error rate increased 3× in the last 30 minutes',
    type: 'anomaly',
  },
  {
    icon: ChartBar,
    title: 'Unused metrics cleanup opportunity',
    subtitle: '23 custom metrics haven\'t been queried in 90 days',
    type: 'optimization',
  },
  {
    icon: Globe,
    title: 'Cross-region latency comparison',
    subtitle: 'us-east-1 vs eu-west-1 for payment-service',
    type: 'insight',
  },
]

const resourceTypes = [
  { icon: Pulse, label: 'Metrics', count: '1,247' },
  { icon: Database, label: 'Log Groups', count: '86' },
  { icon: Globe, label: 'Traces', count: '12 services' },
  { icon: Warning, label: 'Alarms', count: '34 active' },
]

export default function ExplorePage() {
  const [query, setQuery] = useState('')

  return (
    <div className="px-6 py-6">
      <h1 className="text-[22px] leading-[28px] font-normal tracking-tighter text-foreground mb-1">
        Explore
      </h1>
      <p className="text-body-m text-foreground-muted mb-4">
        Unified search and discovery across metrics, logs, traces, and alarms
      </p>

      {/* Search bar */}
      <div>
        <div className="relative mb-6">
          <div className="flex items-center gap-2 h-10 rounded-xl bg-background-surface-1 border border-border-muted px-4 focus-within:border-primary/40 transition-colors">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything — metrics, logs, traces, alarms, or ask a question..."
              className="flex-1 bg-transparent text-body-m text-foreground placeholder:text-foreground-disabled focus:outline-none"
            />
            <MagnifyingGlass size={16} className="text-foreground-muted flex-shrink-0" />
          </div>
        </div>

        {/* Resource type cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {resourceTypes.map(({ icon: Icon, label, count }) => (
            <div key={label} className="glass-card p-3 cursor-pointer hover:border-primary/20 transition-colors" style={{ borderColor: 'rgba(51,65,85,0.2)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className="text-foreground-muted" />
                <span className="text-body-s font-medium text-foreground">{label}</span>
              </div>
              <span className="text-heading-s font-normal text-foreground">{count}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* AI-suggested explorations */}
          <div className="glass-card p-4">
            <h3 className="text-heading-s font-normal text-foreground mb-3">Suggested explorations</h3>
            <div className="space-y-0">
              {suggestedExplorations.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 py-3 border-b border-border-muted last:border-0 cursor-pointer hover:bg-background-surface-2/50 -mx-2 px-2 rounded-lg transition-colors">
                    <div>
                      <span className="text-body-s text-foreground font-medium block">{item.title}</span>
                      <span className="text-body-s text-foreground-muted">{item.subtitle}</span>
                    </div>
                    <ArrowRight size={14} className="text-foreground-disabled mt-0.5 ml-auto flex-shrink-0" />
                  </div>
              ))}
            </div>
          </div>

          {/* Recent searches */}
          <div className="glass-card p-4">
            <h3 className="text-heading-s font-normal text-foreground mb-3">Recent searches</h3>
            <div className="space-y-0">
              {recentSearches.map((item) => (
                <div key={item.query} className="flex items-center gap-3 py-3 border-b border-border-muted last:border-0 cursor-pointer hover:bg-background-surface-2/50 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="text-body-s text-foreground">{item.query}</span>
                  <span className="text-[10px] text-foreground-muted ml-auto px-1.5 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
