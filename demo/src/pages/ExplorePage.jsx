import { useState } from 'react'
import {
  MagnifyingGlass, Sparkle, Clock, ArrowRight,
  ChartBar, Database, Pulse, Warning, Globe,
  CodeBlock, Play, Copy, CheckCircle, FloppyDisk, Plus
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
  },
  {
    icon: ChartBar,
    title: 'Unused metrics cleanup opportunity',
    subtitle: '23 custom metrics haven\'t been queried in 90 days',
  },
  {
    icon: Globe,
    title: 'Cross-region latency comparison',
    subtitle: 'us-east-1 vs eu-west-1 for payment-service',
  },
]

const resourceTypes = [
  { icon: Pulse, label: 'Metrics', count: '1,247' },
  { icon: Database, label: 'Log Groups', count: '86' },
  { icon: Globe, label: 'Traces', count: '12 services' },
  { icon: Warning, label: 'Alarms', count: '34 active' },
]

const savedQueries = [
  { name: 'Payment error rate by region', language: 'SQL', lastRun: '2h ago' },
  { name: 'Container memory top-k', language: 'PromQL', lastRun: '4h ago' },
  { name: 'Lambda cold starts by function', language: 'SQL', lastRun: 'Yesterday' },
]

const sampleQuery = `SELECT service, region,
  AVG(latency_ms) as avg_latency,
  COUNT(*) as request_count,
  SUM(CASE WHEN status >= 500 THEN 1 ELSE 0 END) as errors
FROM traces
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY service, region
ORDER BY errors DESC
LIMIT 20`

const sampleResults = [
  { service: 'payment-service', region: 'us-east-1', avg_latency: '245ms', requests: '12,847', errors: '23' },
  { service: 'checkout-service', region: 'us-east-1', avg_latency: '189ms', requests: '8,234', errors: '12' },
  { service: 'order-service', region: 'us-east-2', avg_latency: '134ms', requests: '6,102', errors: '4' },
  { service: 'inventory-service', region: 'us-west-1', avg_latency: '67ms', requests: '15,890', errors: '1' },
  { service: 'auth-service', region: 'us-east-1', avg_latency: '42ms', requests: '31,204', errors: '0' },
]

export default function ExplorePage() {
  const [mode, setMode] = useState('search')
  const [query, setQuery] = useState('')
  const [editorQuery, setEditorQuery] = useState(sampleQuery)
  const [hasRun, setHasRun] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(editorQuery)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[22px] leading-[28px] font-normal tracking-tighter text-foreground mb-1">Explore</h1>
          <p className="text-body-m text-foreground-muted">Search, discover, and query across metrics, logs, and traces</p>
        </div>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-background-surface-1 border border-border-muted">
          <button onClick={() => setMode('search')} className={`px-3 py-1.5 rounded-md text-body-s font-medium transition-colors ${mode === 'search' ? 'bg-primary/15 text-primary' : 'text-foreground-muted hover:text-foreground'}`}>
            <span className="flex items-center gap-1.5"><MagnifyingGlass size={14} /> Search</span>
          </button>
          <button onClick={() => setMode('query')} className={`px-3 py-1.5 rounded-md text-body-s font-medium transition-colors ${mode === 'query' ? 'bg-primary/15 text-primary' : 'text-foreground-muted hover:text-foreground'}`}>
            <span className="flex items-center gap-1.5"><CodeBlock size={14} /> Query Studio</span>
          </button>
        </div>
      </div>

      {mode === 'search' && (
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

            <div className="glass-card p-4">
              <h3 className="text-heading-s font-normal text-foreground mb-3">Recent searches</h3>
              <div className="space-y-0">
                {recentSearches.map((item) => (
                  <div key={item.query} className="flex items-center gap-3 py-3 border-b border-border-muted last:border-0 cursor-pointer hover:bg-background-surface-2/50 -mx-2 px-2 rounded-lg transition-colors">
                    <span className="text-body-s text-foreground">{item.query}</span>
                    <span className="text-[10px] text-foreground-muted ml-auto px-1.5 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'query' && (
        <div className="flex gap-3">
          <div className="flex-1 space-y-3">
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted">
                <div className="flex items-center gap-2">
                  <CodeBlock size={14} className="text-foreground-muted" />
                  <span className="text-body-s font-medium text-foreground">Editor</span>
                  <span className="text-[10px] text-foreground-muted px-1.5 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">SQL</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-background-surface-2 transition-colors" aria-label="Copy query">
                    {copied ? <CheckCircle size={14} className="text-status-active" /> : <Copy size={14} className="text-foreground-muted" />}
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-background-surface-2 transition-colors" aria-label="Save query">
                    <FloppyDisk size={14} className="text-foreground-muted" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={editorQuery}
                  onChange={(e) => setEditorQuery(e.target.value)}
                  rows={8}
                  className="w-full bg-transparent text-pre font-mono text-foreground-secondary focus:outline-none resize-none"
                  spellCheck={false}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-t border-border-muted">
                <div className="flex items-center gap-2">
                  <Sparkle size={12} className="text-primary" />
                  <span className="text-[10px] text-foreground-muted">AI can help optimize this query</span>
                </div>
                <button onClick={() => setHasRun(true)} className="h-7 px-3 rounded-md bg-primary text-[11px] font-medium text-primary-foreground hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                  <Play size={12} /> Run query
                </button>
              </div>
            </div>

            {hasRun && (
              <div className="glass-card overflow-hidden" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted">
                  <span className="text-body-s font-medium text-foreground">Results (5 rows, 23ms)</span>
                  <span className="text-[10px] text-foreground-muted">Scanned 74,277 records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-muted">
                        {['service', 'region', 'avg_latency', 'requests', 'errors'].map(col => (
                          <th key={col} className="px-4 py-2 text-left text-[10px] font-bold text-foreground-muted uppercase tracking-wider">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleResults.map((row, i) => (
                        <tr key={i} className="border-b border-border-muted last:border-0">
                          <td className="px-4 py-2 text-body-s text-link">{row.service}</td>
                          <td className="px-4 py-2 text-body-s text-foreground-secondary">{row.region}</td>
                          <td className="px-4 py-2 text-body-s text-foreground font-mono">{row.avg_latency}</td>
                          <td className="px-4 py-2 text-body-s text-foreground font-mono">{row.requests}</td>
                          <td className="px-4 py-2 text-body-s text-foreground font-mono">
                            <span className={parseInt(row.errors) > 10 ? 'text-status-outage' : parseInt(row.errors) > 0 ? 'text-status-blocked' : 'text-foreground-muted'}>{row.errors}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="w-56 space-y-3">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-heading-xs font-normal text-foreground">Saved queries</h3>
                <button className="p-1 rounded hover:bg-background-surface-2 text-foreground-muted"><Plus size={14} /></button>
              </div>
              <div className="space-y-0">
                {savedQueries.map((q) => (
                  <div key={q.name} className="py-2 border-b border-border-muted last:border-0 cursor-pointer">
                    <span className="text-body-s text-foreground block">{q.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-foreground-muted px-1 py-0.5 rounded bg-background-surface-2 border border-border-muted">{q.language}</span>
                      <span className="text-[10px] text-foreground-disabled flex items-center gap-1"><Clock size={9} /> {q.lastRun}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
