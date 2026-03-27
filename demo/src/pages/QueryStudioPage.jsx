import { useState } from 'react'
import {
  CodeBlock, Play, Copy, CheckCircle, Clock,
  Sparkle, CaretDown, FloppyDisk, Plus
} from '@phosphor-icons/react'

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

export default function QueryStudioPage() {
  const [query, setQuery] = useState(sampleQuery)
  const [hasRun, setHasRun] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground mb-1">
            Query Studio
          </h1>
          <p className="text-body-m text-foreground-muted">
            SQL & PromQL queries across metrics, logs, and traces
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-3 rounded-lg border border-border-muted text-body-s text-foreground-secondary hover:bg-background-surface-2 transition-colors flex items-center gap-1.5">
            <Plus size={14} />
            New query
          </button>
        </div>
      </div>

      <div className="max-w-6xl flex gap-3">
        {/* Main editor area */}
        <div className="flex-1 space-y-3">
          {/* Query editor */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted">
              <div className="flex items-center gap-2">
                <CodeBlock size={14} className="text-foreground-muted" />
                <span className="text-body-s font-medium text-foreground">Editor</span>
                <span className="text-[10px] text-foreground-muted px-1.5 py-0.5 rounded-full bg-background-surface-2 border border-border-muted">
                  SQL
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-background-surface-2 transition-colors"
                  aria-label="Copy query"
                >
                  {copied
                    ? <CheckCircle size={14} className="text-status-active" />
                    : <Copy size={14} className="text-foreground-muted" />
                  }
                </button>
                <button className="p-1.5 rounded-lg hover:bg-background-surface-2 transition-colors" aria-label="Save query">
                  <FloppyDisk size={14} className="text-foreground-muted" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
              <button
                onClick={() => setHasRun(true)}
                className="h-7 px-3 rounded-md bg-primary text-[11px] font-medium text-primary-foreground hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Play size={12} />
                Run query
              </button>
            </div>
          </div>

          {/* Results */}
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
                        <th key={col} className="px-4 py-2 text-left text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                          {col}
                        </th>
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
                          <span className={parseInt(row.errors) > 10 ? 'text-status-outage' : parseInt(row.errors) > 0 ? 'text-status-blocked' : 'text-foreground-muted'}>
                            {row.errors}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — saved queries */}
        <div className="w-56 space-y-3">
          <div className="glass-card p-4">
            <h3 className="text-heading-xs font-normal text-foreground mb-3">Saved queries</h3>
            <div className="space-y-0">
              {savedQueries.map((q) => (
                <div key={q.name} className="py-2 border-b border-border-muted last:border-0 cursor-pointer">
                  <span className="text-body-s text-foreground block">{q.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-foreground-muted px-1 py-0.5 rounded bg-background-surface-2 border border-border-muted">
                      {q.language}
                    </span>
                    <span className="text-[10px] text-foreground-disabled flex items-center gap-1">
                      <Clock size={9} /> {q.lastRun}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
