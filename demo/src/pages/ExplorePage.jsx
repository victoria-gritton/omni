import { useState } from 'react'
import {
  MagnifyingGlass, Sparkle, Clock, ArrowRight,
  ChartBar, Database, Pulse, Warning, Globe,
  CodeBlock, Play, Copy, CheckCircle, FloppyDisk,
  X, Receipt, CaretDown, SplitHorizontal,
  ClockCounterClockwise, Info, Plus, ListBullets,
  ArrowsOutSimple, LinkSimple, Table, ChartLine
} from '@phosphor-icons/react'

/* ── Tab data ── */
const TABS = [
  { id: 'logs', label: 'Logs', icon: Database },
  { id: 'metrics', label: 'Metrics', icon: Pulse },
  { id: 'traces', label: 'Traces', icon: Globe },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
]

const DATA_SOURCES = [
  { id: 'cloudwatch', label: 'CloudWatch Logs & Metrics', type: 'aws' },
  { id: 'xray', label: 'X-Ray Traces', type: 'aws' },
  { id: 'prometheus', label: 'Prometheus', type: 'metrics' },
  { id: 'mixed', label: 'Mixed', type: 'mixed' },
]

const TIME_RANGES = [
  'Last 15 minutes', 'Last 30 minutes', 'Last 1 hour', 'Last 3 hours',
  'Last 6 hours', 'Last 12 hours', 'Last 24 hours', 'Last 7 days',
]

/* ── Mock: Query History ── */
const queryHistory = [
  { query: 'fields @timestamp, @message | filter @message like /OOM/', source: 'CloudWatch Logs', ts: '2 min ago', starred: true },
  { query: 'SELECT AVG(MemoryUtilization) FROM ECS/ContainerInsights WHERE ServiceName = "order-service"', source: 'CloudWatch Metrics', ts: '8 min ago', starred: false },
  { query: 'fields service, status_code | filter status_code >= 500 | stats count() by service', source: 'CloudWatch Logs', ts: '15 min ago', starred: true },
  { query: 'rate(http_requests_total{status="500"}[5m])', source: 'Prometheus', ts: '1h ago', starred: false },
  { query: 'fields @timestamp, @message | filter service = "payment-service" | sort @timestamp desc', source: 'CloudWatch Logs', ts: '2h ago', starred: false },
]

/* ── Mock: Logs ── */
const sampleLogs = [
  { ts: '2:03:12 AM', level: 'ERROR', service: 'order-service', region: 'us-east-2', msg: 'Container killed: OutOfMemoryError — memory limit 512MB exceeded (current: 511MB)' },
  { ts: '2:02:48 AM', level: 'ERROR', service: 'order-service', region: 'us-east-2', msg: 'Container killed: OutOfMemoryError — memory limit 512MB exceeded (current: 509MB)' },
  { ts: '2:01:15 AM', level: 'WARN',  service: 'order-service', region: 'us-east-2', msg: 'Memory usage 98% (502MB/512MB) — approaching limit' },
  { ts: '1:58:33 AM', level: 'ERROR', service: 'payment-service', region: 'us-east-1', msg: 'Upstream timeout: order-service did not respond within 3000ms' },
  { ts: '1:55:02 AM', level: 'ERROR', service: 'order-service', region: 'us-east-2', msg: 'Container killed: OutOfMemoryError — memory limit 512MB exceeded (current: 510MB)' },
  { ts: '1:52:41 AM', level: 'WARN',  service: 'inventory-service', region: 'us-east-2', msg: 'Degraded response from order-service — retrying (attempt 2/3)' },
  { ts: '1:52:18 AM', level: 'ERROR', service: 'order-service', region: 'us-east-2', msg: 'Container killed: OutOfMemoryError — memory limit 512MB exceeded (current: 511MB)' },
  { ts: '1:47:05 AM', level: 'WARN',  service: 'order-service', region: 'us-east-2', msg: 'Memory usage 90% (461MB/512MB) — threshold crossed' },
]

/* ── Mock: Metrics ── */
const sampleMetrics = [
  { name: 'CPUUtilization', service: 'order-service', region: 'us-east-2', value: '78%', trend: 'up', status: 'warning' },
  { name: 'MemoryUtilization', service: 'order-service', region: 'us-east-2', value: '98%', trend: 'up', status: 'critical' },
  { name: 'RequestCount', service: 'payment-service', region: 'us-east-1', value: '12,847/min', trend: 'stable', status: 'ok' },
  { name: '5xxErrorRate', service: 'payment-service', region: 'us-east-1', value: '12.3%', trend: 'up', status: 'critical' },
  { name: 'p99Latency', service: 'checkout-service', region: 'us-east-1', value: '1,240ms', trend: 'up', status: 'warning' },
  { name: 'ReadThrottleEvents', service: 'DynamoDB/UsersTable', region: 'us-east-1', value: '847', trend: 'up', status: 'critical' },
  { name: 'ConsumedReadCapacity', service: 'DynamoDB/OrdersTable', region: 'us-east-1', value: '45%', trend: 'stable', status: 'ok' },
  { name: 'InvocationErrors', service: 'payment-validator', region: 'us-east-1', value: '6,891', trend: 'up', status: 'critical' },
]

/* ── Mock: Traces ── */
const sampleTraces = [
  { traceId: '1-abc-001', service: 'API Gateway → payment-service', duration: '1,240ms', status: 'error', spans: 8, ts: '2:03 AM' },
  { traceId: '1-abc-002', service: 'API Gateway → order-service', duration: '3,100ms', status: 'error', spans: 12, ts: '2:02 AM' },
  { traceId: '1-abc-003', service: 'checkout-service → inventory', duration: '890ms', status: 'warning', spans: 6, ts: '2:01 AM' },
  { traceId: '1-abc-004', service: 'API Gateway → auth-service', duration: '42ms', status: 'ok', spans: 3, ts: '2:00 AM' },
  { traceId: '1-abc-005', service: 'order-service → shipping', duration: '2,400ms', status: 'error', spans: 9, ts: '1:58 AM' },
  { traceId: '1-abc-006', service: 'notification-sender', duration: '30ms', status: 'ok', spans: 2, ts: '1:55 AM' },
]

/* ── Mock: Transactions ── */
const sampleTransactions = [
  { txnId: 'TXN-90281', user: 'user-8821', action: 'checkout', services: 'API GW → payment → order → inventory', duration: '3,420ms', status: 'failed', ts: '2:03 AM', items: 3 },
  { txnId: 'TXN-90280', user: 'user-7734', action: 'checkout', services: 'API GW → payment → order', duration: '2,810ms', status: 'failed', ts: '2:02 AM', items: 1 },
  { txnId: 'TXN-90279', user: 'user-5519', action: 'add-to-cart', services: 'API GW → inventory', duration: '120ms', status: 'success', ts: '2:01 AM', items: 2 },
  { txnId: 'TXN-90278', user: 'user-3302', action: 'checkout', services: 'API GW → payment → order → shipping', duration: '4,100ms', status: 'failed', ts: '2:00 AM', items: 5 },
  { txnId: 'TXN-90277', user: 'user-9910', action: 'login', services: 'API GW → auth', duration: '42ms', status: 'success', ts: '1:59 AM', items: 0 },
  { txnId: 'TXN-90276', user: 'user-4455', action: 'search', services: 'API GW → search-service', duration: '55ms', status: 'success', ts: '1:58 AM', items: 0 },
  { txnId: 'TXN-90275', user: 'user-1128', action: 'checkout', services: 'API GW → payment → order', duration: '3,900ms', status: 'failed', ts: '1:55 AM', items: 2 },
]

/* ── Mock: Query Studio ── */
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

const queryResults = [
  { service: 'payment-service', region: 'us-east-1', avg_latency: '245ms', requests: '12,847', errors: '23' },
  { service: 'checkout-service', region: 'us-east-1', avg_latency: '189ms', requests: '8,234', errors: '12' },
  { service: 'order-service', region: 'us-east-2', avg_latency: '134ms', requests: '6,102', errors: '4' },
  { service: 'inventory-service', region: 'us-west-1', avg_latency: '67ms', requests: '15,890', errors: '1' },
  { service: 'auth-service', region: 'us-east-1', avg_latency: '42ms', requests: '31,204', errors: '0' },
]

/* ── Suggested explorations ── */
const suggestedExplorations = [
  { title: 'Anomaly detected: API Gateway 5xx spike', subtitle: 'Error rate increased 3× in the last 30 minutes' },
  { title: 'Unused metrics cleanup opportunity', subtitle: "23 custom metrics haven't been queried in 90 days" },
  { title: 'Cross-region latency comparison', subtitle: 'us-east-1 vs eu-west-1 for payment-service' },
]

/* ── Helpers ── */
const levelColor = (l) => l === 'ERROR' ? 'text-status-outage' : l === 'WARN' ? 'text-status-blocked' : 'text-foreground-muted'
const statusColor = (s) => s === 'critical' || s === 'error' ? 'text-status-outage' : s === 'warning' ? 'text-status-blocked' : 'text-foreground-muted'
const trendArrow = (t) => t === 'up' ? '↑' : t === 'down' ? '↓' : '→'

/* ── Toolbar ── */
function ExploreToolbar({ dataSource, setDataSource, timeRange, setTimeRange, split, setSplit, onRun, showDsPicker, setShowDsPicker, showTimePicker, setShowTimePicker }) {
  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      {/* Data source picker */}
      <div className="relative">
        <button onClick={() => { setShowDsPicker(!showDsPicker); setShowTimePicker(false) }} className="h-8 px-3 rounded-lg border border-border-muted text-body-s text-foreground hover:bg-background-surface-2 transition-colors flex items-center gap-1.5">
          <Database size={12} className="text-foreground-muted" />
          {dataSource.label}
          <CaretDown size={10} className="text-foreground-muted" />
        </button>
        {showDsPicker && (
          <div className="absolute top-10 left-0 z-50 w-64 glass-card p-2 shadow-xl">
            {DATA_SOURCES.map(ds => (
              <button key={ds.id} onClick={() => { setDataSource(ds); setShowDsPicker(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-body-s transition-colors ${ds.id === dataSource.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-background-surface-2'}`}>
                {ds.label}
                <span className="text-[10px] text-foreground-muted ml-2">{ds.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-border-muted" />

      {/* Time picker */}
      <div className="relative">
        <button onClick={() => { setShowTimePicker(!showTimePicker); setShowDsPicker(false) }} className="h-8 px-3 rounded-lg border border-border-muted text-body-s text-foreground hover:bg-background-surface-2 transition-colors flex items-center gap-1.5">
          <Clock size={12} className="text-foreground-muted" />
          {timeRange}
          <CaretDown size={10} className="text-foreground-muted" />
        </button>
        {showTimePicker && (
          <div className="absolute top-10 left-0 z-50 w-52 glass-card p-2 shadow-xl">
            {TIME_RANGES.map(tr => (
              <button key={tr} onClick={() => { setTimeRange(tr); setShowTimePicker(false) }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-body-s transition-colors ${tr === timeRange ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-background-surface-2'}`}>
                {tr}
              </button>
            ))}
            <div className="border-t border-border-muted mt-1 pt-1">
              <button className="w-full text-left px-3 py-1.5 rounded-lg text-body-s text-link hover:bg-background-surface-2 transition-colors">
                Absolute time range...
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Split view */}
      <button onClick={() => setSplit(!split)} className={`h-8 px-3 rounded-lg border text-body-s transition-colors flex items-center gap-1.5 ${split ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border-muted text-foreground-secondary hover:bg-background-surface-2'}`}>
        <SplitHorizontal size={14} />
        Split
      </button>

      <div className="flex-1" />

      {/* Run query */}
      <button onClick={onRun} className="h-8 px-4 rounded-lg bg-primary text-body-s font-medium text-primary-foreground hover:bg-slate-200 transition-colors flex items-center gap-1.5">
        <Play size={12} />
        Run query
      </button>
    </div>
  )
}

/* ── Content Outline sidebar ── */
function ContentOutline({ activeTab, advanced, queries }) {
  return (
    <div className="w-48 flex-shrink-0 space-y-3">
      <div className="glass-card p-3">
        <h4 className="text-[10px] font-bold tracking-wider uppercase text-foreground-muted mb-2">Outline</h4>
        <div className="space-y-1">
          {!advanced && TABS.map(({ id, label, icon: Icon }) => (
            <div key={id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-body-s cursor-pointer transition-colors ${activeTab === id ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:text-foreground hover:bg-background-surface-2'}`}>
              <Icon size={12} />
              <span>{label}</span>
            </div>
          ))}
          {advanced && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-body-s bg-primary/10 text-primary">
              <CodeBlock size={12} />
              <span>Query Studio</span>
            </div>
          )}
          {queries.map((q, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-body-s text-foreground-muted hover:text-foreground hover:bg-background-surface-2 cursor-pointer transition-colors">
              <Table size={12} />
              <span className="truncate">Query {String.fromCharCode(65 + i)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Query History drawer ── */
function QueryHistoryDrawer({ onClose, onUse }) {
  const [historyFilter, setHistoryFilter] = useState('')
  const [starredOnly, setStarredOnly] = useState(false)
  const filtered = queryHistory.filter(h => {
    if (starredOnly && !h.starred) return false
    if (historyFilter && !h.query.toLowerCase().includes(historyFilter.toLowerCase())) return false
    return true
  })
  return (
    <div className="glass-card p-4 mb-3" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClockCounterClockwise size={14} className="text-foreground-muted" />
          <h3 className="text-heading-xs font-normal text-foreground">Query history</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setStarredOnly(!starredOnly)} className={`text-[10px] px-2 py-1 rounded-md transition-colors ${starredOnly ? 'bg-primary/10 text-primary border border-primary/30' : 'text-foreground-muted hover:bg-background-surface-2 border border-border-muted'}`}>
            ★ Starred
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-background-surface-2" aria-label="Close history"><X size={12} className="text-foreground-muted" /></button>
        </div>
      </div>
      <div className="flex items-center gap-2 h-8 rounded-lg bg-background-surface-2 border border-border-muted px-3 mb-3">
        <MagnifyingGlass size={12} className="text-foreground-muted" />
        <input type="text" value={historyFilter} onChange={e => setHistoryFilter(e.target.value)} placeholder="Filter history..." className="flex-1 bg-transparent text-body-s text-foreground placeholder:text-foreground-disabled focus:outline-none" />
      </div>
      <div className="space-y-0 max-h-48 overflow-y-auto">
        {filtered.map((h, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-border-muted last:border-0 hover:bg-background-surface-2/50 -mx-2 px-2 rounded-lg cursor-pointer transition-colors" onClick={() => onUse(h.query)}>
            <div className="flex-1 min-w-0">
              <span className="text-body-s text-foreground font-mono block truncate">{h.query}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-foreground-muted">{h.source}</span>
                <span className="text-[10px] text-foreground-disabled">· {h.ts}</span>
              </div>
            </div>
            {h.starred && <span className="text-primary text-[10px] mt-1">★</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Query Inspector panel ── */
function QueryInspector({ onClose }) {
  const [inspectorTab, setInspectorTab] = useState('stats')
  return (
    <div className="glass-card overflow-hidden mb-3" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-foreground-muted" />
          <span className="text-body-s font-medium text-foreground">Query inspector</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-background-surface-2" aria-label="Close inspector"><X size={12} className="text-foreground-muted" /></button>
      </div>
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border-muted">
        {['Stats', 'Query', 'JSON', 'Data'].map(t => (
          <button key={t} onClick={() => setInspectorTab(t.toLowerCase())} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${inspectorTab === t.toLowerCase() ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:text-foreground hover:bg-background-surface-2'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="p-4">
        {inspectorTab === 'stats' && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total request time', value: '23ms' },
              { label: 'Data processing time', value: '8ms' },
              { label: 'Rows returned', value: '5' },
              { label: 'Records scanned', value: '74,277' },
              { label: 'Bytes scanned', value: '12.4 MB' },
              { label: 'Cache hit', value: 'No' },
            ].map(s => (
              <div key={s.label}>
                <span className="text-[10px] text-foreground-muted block">{s.label}</span>
                <span className="text-body-s text-foreground font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        )}
        {inspectorTab === 'query' && (
          <div>
            <span className="text-[10px] text-foreground-muted block mb-1">Request</span>
            <pre className="text-[11px] text-foreground-secondary font-mono bg-background-surface-2 rounded-lg p-3 overflow-x-auto">
{`POST /api/ds/query HTTP/1.1
Content-Type: application/json

{
  "queries": [{
    "datasource": "cloudwatch",
    "expr": "SELECT service, region, AVG(latency_ms)...",
    "interval": "1m",
    "maxDataPoints": 1440
  }],
  "from": "now-1h",
  "to": "now"
}`}
            </pre>
            <span className="text-[10px] text-foreground-muted block mt-3 mb-1">Response time</span>
            <span className="text-body-s text-foreground font-mono">23ms</span>
          </div>
        )}
        {inspectorTab === 'json' && (
          <pre className="text-[11px] text-foreground-secondary font-mono bg-background-surface-2 rounded-lg p-3 overflow-x-auto max-h-40">
{`{
  "results": {
    "A": {
      "status": 200,
      "frames": [{
        "schema": {
          "fields": [
            {"name": "service", "type": "string"},
            {"name": "region", "type": "string"},
            {"name": "avg_latency", "type": "number"},
            {"name": "requests", "type": "number"},
            {"name": "errors", "type": "number"}
          ]
        },
        "data": { "values": [...] }
      }]
    }
  }
}`}
          </pre>
        )}
        {inspectorTab === 'data' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-foreground-muted">5 fields × 5 rows</span>
              <span className="text-[10px] text-foreground-disabled">· DataFrame: A</span>
            </div>
            <div className="grid grid-cols-5 gap-px text-[10px]">
              {['service', 'region', 'avg_latency', 'requests', 'errors'].map(f => (
                <span key={f} className="font-bold text-foreground-muted uppercase bg-background-surface-2 px-2 py-1">{f}</span>
              ))}
              {queryResults.flatMap((r, i) => [
                <span key={`s${i}`} className="text-foreground px-2 py-1 bg-background-surface-1">{r.service}</span>,
                <span key={`r${i}`} className="text-foreground-secondary px-2 py-1 bg-background-surface-1">{r.region}</span>,
                <span key={`l${i}`} className="text-foreground font-mono px-2 py-1 bg-background-surface-1">{r.avg_latency}</span>,
                <span key={`q${i}`} className="text-foreground font-mono px-2 py-1 bg-background-surface-1">{r.requests}</span>,
                <span key={`e${i}`} className="text-foreground font-mono px-2 py-1 bg-background-surface-1">{r.errors}</span>,
              ])}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Sub-panels ── */
function LogsPanel({ filter }) {
  const filtered = filter ? sampleLogs.filter(l => l.msg.toLowerCase().includes(filter) || l.service.toLowerCase().includes(filter)) : sampleLogs
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted">
        <span className="text-body-s font-medium text-foreground">{filtered.length} log entries</span>
        <span className="text-[10px] text-foreground-muted">/ecs/order-service-east-2 + 3 more</span>
      </div>
      <div className="divide-y divide-border-muted">
        {filtered.map((l, i) => (
          <div key={i} className="px-4 py-2 flex items-start gap-3 hover:bg-background-surface-2/50 transition-colors cursor-pointer">
            <span className="text-[10px] text-foreground-disabled font-mono w-20 flex-shrink-0 pt-0.5">{l.ts}</span>
            <span className={`text-[10px] font-bold w-12 flex-shrink-0 pt-0.5 ${levelColor(l.level)}`}>{l.level}</span>
            <span className="text-[10px] text-foreground-muted w-28 flex-shrink-0 pt-0.5">{l.service}</span>
            <span className="text-body-s text-foreground-secondary font-mono">{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricsPanel({ filter }) {
  const filtered = filter ? sampleMetrics.filter(m => m.name.toLowerCase().includes(filter) || m.service.toLowerCase().includes(filter)) : sampleMetrics
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted">
        <span className="text-body-s font-medium text-foreground">{filtered.length} metrics</span>
        <span className="text-[10px] text-foreground-muted">Last 1 hour</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-muted">
            {['Metric', 'Service', 'Region', 'Value', 'Trend'].map(h => (
              <th key={h} className="px-4 py-2 text-left text-[10px] font-bold text-foreground-muted uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((m, i) => (
            <tr key={i} className="border-b border-border-muted last:border-0 hover:bg-background-surface-2/50 cursor-pointer">
              <td className="px-4 py-2 text-body-s text-link">{m.name}</td>
              <td className="px-4 py-2 text-body-s text-foreground-secondary">{m.service}</td>
              <td className="px-4 py-2 text-body-s text-foreground-secondary">{m.region}</td>
              <td className={`px-4 py-2 text-body-s font-mono ${statusColor(m.status)}`}>{m.value}</td>
              <td className={`px-4 py-2 text-body-s font-mono ${statusColor(m.status)}`}>{trendArrow(m.trend)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TracesPanel({ filter }) {
  const filtered = filter ? sampleTraces.filter(t => t.service.toLowerCase().includes(filter) || t.traceId.toLowerCase().includes(filter)) : sampleTraces
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted">
        <span className="text-body-s font-medium text-foreground">{filtered.length} traces</span>
        <span className="text-[10px] text-foreground-muted">Last 1 hour</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-muted">
            {['Trace ID', 'Service path', 'Duration', 'Spans', 'Time'].map(h => (
              <th key={h} className="px-4 py-2 text-left text-[10px] font-bold text-foreground-muted uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((t, i) => (
            <tr key={i} className="border-b border-border-muted last:border-0 hover:bg-background-surface-2/50 cursor-pointer">
              <td className="px-4 py-2 text-body-s text-link font-mono">{t.traceId}</td>
              <td className="px-4 py-2 text-body-s text-foreground-secondary">{t.service}</td>
              <td className={`px-4 py-2 text-body-s font-mono ${statusColor(t.status)}`}>{t.duration}</td>
              <td className="px-4 py-2 text-body-s text-foreground-muted font-mono">{t.spans}</td>
              <td className="px-4 py-2 text-body-s text-foreground-disabled">{t.ts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TransactionsPanel({ filter }) {
  const filtered = filter ? sampleTransactions.filter(t => t.txnId.toLowerCase().includes(filter) || t.action.toLowerCase().includes(filter) || t.services.toLowerCase().includes(filter) || t.user.toLowerCase().includes(filter)) : sampleTransactions
  const txnStatusColor = (s) => s === 'failed' ? 'text-status-outage' : 'text-status-active'
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted">
        <span className="text-body-s font-medium text-foreground">{filtered.length} transactions</span>
        <span className="text-[10px] text-foreground-muted">Last 1 hour · end-to-end user flows</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-muted">
            {['Transaction', 'User', 'Action', 'Service path', 'Duration', 'Status', 'Time'].map(h => (
              <th key={h} className="px-4 py-2 text-left text-[10px] font-bold text-foreground-muted uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((t, i) => (
            <tr key={i} className="border-b border-border-muted last:border-0 hover:bg-background-surface-2/50 cursor-pointer">
              <td className="px-4 py-2 text-body-s text-link font-mono">{t.txnId}</td>
              <td className="px-4 py-2 text-body-s text-foreground-secondary font-mono">{t.user}</td>
              <td className="px-4 py-2 text-body-s text-foreground-secondary">{t.action}</td>
              <td className="px-4 py-2 text-body-s text-foreground-muted">{t.services}</td>
              <td className={`px-4 py-2 text-body-s font-mono ${t.status === 'failed' ? 'text-status-outage' : 'text-foreground'}`}>{t.duration}</td>
              <td className={`px-4 py-2 text-body-s font-medium ${txnStatusColor(t.status)}`}>{t.status}</td>
              <td className="px-4 py-2 text-body-s text-foreground-disabled">{t.ts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Advanced mode (Query Studio) ── */
function AdvancedPanel({ onAddQuery, queries }) {
  return (
    <div className="space-y-3">
      {queries.map((q, idx) => (
        <QueryEditorBlock key={idx} index={idx} initialQuery={q} />
      ))}
      <div className="flex items-center gap-2">
        <button onClick={onAddQuery} className="h-7 px-3 rounded-lg border border-border-muted text-[11px] text-foreground-secondary hover:bg-background-surface-2 transition-colors flex items-center gap-1.5">
          <Plus size={12} />
          Add query
        </button>
        <button className="h-7 px-3 rounded-lg border border-border-muted text-[11px] text-foreground-secondary hover:bg-background-surface-2 transition-colors flex items-center gap-1.5">
          <FloppyDisk size={12} />
          Add from saved queries
        </button>
      </div>
    </div>
  )
}

function QueryEditorBlock({ index, initialQuery }) {
  const [query, setQuery] = useState(initialQuery)
  const [hasRun, setHasRun] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex gap-3">
      <div className="flex-1 space-y-3">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary bg-primary/10 w-5 h-5 rounded flex items-center justify-center">{String.fromCharCode(65 + index)}</span>
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
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={6} className="w-full bg-transparent text-pre font-mono text-foreground-secondary focus:outline-none resize-none" spellCheck={false} />
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-t border-border-muted">
            <div className="flex items-center gap-2">
              <Sparkle size={12} className="text-primary" />
              <span className="text-[10px] text-foreground-muted">AI can help optimize this query</span>
            </div>
            <button onClick={() => setHasRun(true)} className="h-7 px-3 rounded-md bg-primary text-[11px] font-medium text-primary-foreground hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <Play size={12} />
              Run
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
                  {queryResults.map((row, i) => (
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

      {index === 0 && (
        <div className="w-52 space-y-3">
          <div className="glass-card p-4">
            <h3 className="text-heading-xs font-normal text-foreground mb-3">Saved queries</h3>
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
      )}
    </div>
  )
}

/* ── Main Explore page ── */
export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('logs')
  const [advanced, setAdvanced] = useState(false)
  const [query, setQuery] = useState('')
  const [dataSource, setDataSource] = useState(DATA_SOURCES[0])
  const [timeRange, setTimeRange] = useState('Last 1 hour')
  const [split, setSplit] = useState(false)
  const [showOutline, setShowOutline] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showInspector, setShowInspector] = useState(false)
  const [showDsPicker, setShowDsPicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [queries, setQueries] = useState([sampleQuery])
  const filter = query.toLowerCase().trim()

  function handleRun() { /* mock run — data is static */ }
  function handleAddQuery() { setQueries([...queries, '']) }
  function handleUseFromHistory(q) { setQueries([q, ...queries.slice(1)]); setShowHistory(false); setAdvanced(true) }

  return (
    <div className="px-6 py-5" onClick={() => { setShowDsPicker(false); setShowTimePicker(false) }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground mb-0.5">Explore</h1>
          <p className="text-body-s text-foreground-muted">Query, analyze, and aggregate data across all your sources</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowOutline(!showOutline)} className={`h-8 px-3 rounded-lg text-body-s transition-colors flex items-center gap-1.5 ${showOutline ? 'bg-primary/10 text-primary border border-primary/30' : 'border border-border-muted text-foreground-secondary hover:bg-background-surface-2'}`}>
            <ListBullets size={14} />
            Outline
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className={`h-8 px-3 rounded-lg text-body-s transition-colors flex items-center gap-1.5 ${showHistory ? 'bg-primary/10 text-primary border border-primary/30' : 'border border-border-muted text-foreground-secondary hover:bg-background-surface-2'}`}>
            <ClockCounterClockwise size={14} />
            History
          </button>
          <button onClick={() => setShowInspector(!showInspector)} className={`h-8 px-3 rounded-lg text-body-s transition-colors flex items-center gap-1.5 ${showInspector ? 'bg-primary/10 text-primary border border-primary/30' : 'border border-border-muted text-foreground-secondary hover:bg-background-surface-2'}`}>
            <Info size={14} />
            Inspector
          </button>
          <div className="w-px h-5 bg-border-muted" />
          <button
            onClick={() => setAdvanced(!advanced)}
            className={`h-8 px-3 rounded-lg text-body-s font-medium transition-colors flex items-center gap-1.5 ${advanced ? 'bg-primary text-primary-foreground' : 'border border-border-muted text-foreground-secondary hover:bg-background-surface-2'}`}
          >
            <CodeBlock size={14} />
            {advanced ? 'Close Query Studio' : 'Query Studio'}
          </button>
        </div>
      </div>

      {/* Toolbar: data source, time, split, run */}
      <ExploreToolbar
        dataSource={dataSource} setDataSource={setDataSource}
        timeRange={timeRange} setTimeRange={setTimeRange}
        split={split} setSplit={setSplit}
        onRun={handleRun}
        showDsPicker={showDsPicker} setShowDsPicker={setShowDsPicker}
        showTimePicker={showTimePicker} setShowTimePicker={setShowTimePicker}
      />

      {/* Search / filter bar */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 h-10 rounded-xl bg-background-surface-1 border-2 border-primary/20 px-4 focus-within:border-primary/50 shadow-[0_0_12px_rgba(14,165,233,0.08)] transition-colors">
          <Sparkle size={14} className="text-primary flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={advanced ? 'Filter results...' : 'Search logs, metrics, traces — or ask a question...'}
            className="flex-1 bg-transparent text-body-s text-foreground placeholder:text-foreground-disabled focus:outline-none"
            onClick={e => e.stopPropagation()}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded hover:bg-background-surface-2" aria-label="Clear search">
              <X size={12} className="text-foreground-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Drawers: history & inspector */}
      {showHistory && <QueryHistoryDrawer onClose={() => setShowHistory(false)} onUse={handleUseFromHistory} />}
      {showInspector && <QueryInspector onClose={() => setShowInspector(false)} />}

      {/* Main layout: outline + content (+ optional split) */}
      <div className="flex gap-4">
        {showOutline && <ContentOutline activeTab={activeTab} advanced={advanced} queries={queries} />}

        <div className={`flex-1 min-w-0 ${split ? 'flex gap-4' : ''}`}>
          {/* Primary pane */}
          <div className={split ? 'flex-1 min-w-0' : ''}>
            {advanced ? (
              <AdvancedPanel queries={queries} onAddQuery={handleAddQuery} />
            ) : (
              <>
                {/* Segmented control */}
                <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-background-surface-2/80 border border-border-muted w-fit">
                  {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-s font-medium transition-colors ${
                        activeTab === id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-foreground-muted hover:text-foreground hover:bg-background-surface-1'
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>

                {activeTab === 'logs' && <LogsPanel filter={filter} />}
                {activeTab === 'metrics' && <MetricsPanel filter={filter} />}
                {activeTab === 'traces' && <TracesPanel filter={filter} />}
                {activeTab === 'transactions' && <TransactionsPanel filter={filter} />}

                {/* Suggested explorations */}
                <div className="mt-4 p-4 rounded-xl bg-purple-500/[0.06] border border-purple-400/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkle size={14} className="text-purple-400" />
                    <h3 className="text-heading-s font-normal text-foreground">AI-suggested explorations</h3>
                  </div>
                  <div className="space-y-0">
                    {suggestedExplorations.map((item) => (
                      <div key={item.title} className="flex items-start gap-3 py-3 border-b border-purple-400/10 last:border-0 cursor-pointer hover:bg-purple-500/[0.04] -mx-2 px-2 rounded-lg transition-colors">
                        <div>
                          <span className="text-body-s text-foreground font-medium block">{item.title}</span>
                          <span className="text-body-s text-foreground-muted">{item.subtitle}</span>
                        </div>
                        <ArrowRight size={14} className="text-purple-400/60 mt-0.5 ml-auto flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Split pane (mirrors primary with independent tab) */}
          {split && (
            <div className="flex-1 min-w-0 border-l border-border-muted pl-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LinkSimple size={12} className="text-primary" />
                  <span className="text-[10px] text-primary">Time synced</span>
                </div>
                <button onClick={() => setSplit(false)} className="text-[10px] text-foreground-muted hover:text-foreground transition-colors">Close split</button>
              </div>
              <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-background-surface-1 border border-border-muted w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-s font-medium transition-colors ${id === 'metrics' ? 'bg-primary/15 text-primary border border-primary/30' : 'text-foreground-muted hover:text-foreground hover:bg-background-surface-2'}`}>
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
              <MetricsPanel filter={filter} />
            </div>
          )}
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
