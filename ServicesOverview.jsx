import { useState, useRef, useEffect } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { CheckCircle, Warning, MagnifyingGlass, Question, Play, CodeSimple, ChartBar, ChartPie, ChartLine, ChartLineUp, ArrowsClockwise, Table as TableIcon, ArrowLeft, HardDrives, ListBullets, PresentationChart } from '@phosphor-icons/react'
import Card from './ui/card'
import Input from './ui/input'
import SegmentedControl from './ui/segmented-control'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Widget, WidgetHeader, WidgetBody } from './ui/widget'
import Badge from './ui/badge'
import AgGridTable from './ui/components/data-table'

const sliDonutData = [
  { label: 'Healthy', count: 1, value: 1, color: 'rgb(52, 211, 153)' },
  { label: 'Unhealthy', count: 1, value: 1, color: 'rgb(248, 113, 113)' },
  { label: 'Recovered', count: 1, value: 1, color: 'rgb(250, 204, 21)' },
  { label: 'No SLO', count: 5, value: 5, color: 'rgb(100, 116, 139)' },
  { label: 'Insufficient data', count: 0, value: 0.001, color: 'rgb(51, 65, 85)' },
]

const dependencyPaths = [
  { remote: 'PaymentService', service: 'OrderService', serviceEnv: 'aws:lambda/production', rate: 4.5 },
  { remote: 'AuthService', service: 'APIGateway', serviceEnv: 'aws:apigateway/production', rate: 3.2 },
  { remote: 'UsersDatabase', service: 'AuthService', serviceEnv: 'aws:lambda/production', rate: 1.8 },
  { remote: 'OrdersDatabase', service: 'PaymentService', serviceEnv: 'aws:lambda/production', rate: 1.2 },
  { remote: 'APIGateway', service: 'CloudFrontCDN', serviceEnv: 'aws:cloudfront/production', rate: 0.5 },
]

const services = [
  { name: 'Order Service', sliStatus: '2/3 Unhealthy', sliColor: 'text-red-400', sliIcon: '⊘', availability: '-', env: 'aws:lambda/production', hosted: 'Lambda function', instrumented: false },
  { name: 'API Gateway', sliStatus: '1/2 Recovered', sliColor: 'text-yellow-400', sliIcon: '↻', availability: '-', env: 'aws:apigateway/production', hosted: 'Api Gateway', instrumented: false },
  { name: 'Auth Service', sliStatus: '2/2 Healthy', sliColor: 'text-emerald-400', sliIcon: '✓', availability: '-', env: 'aws:lambda/production', hosted: 'Lambda function', instrumented: false },
  { name: 'CloudFront CDN', sliStatus: 'Create SLO', sliColor: 'text-sky-400', sliIcon: null, availability: '-', env: 'aws:cloudfront/production', hosted: 'Cloud Front', instrumented: false },
  { name: 'Orders Database', sliStatus: 'Create SLO', sliColor: 'text-sky-400', sliIcon: null, availability: '-', env: 'aws:dynamodb/production', hosted: 'Dynamo DB', instrumented: false },
  { name: 'Pet Clinic Frontend', sliStatus: 'Create SLO', sliColor: 'text-sky-400', sliIcon: null, availability: '-', env: 'eks:petclinic/default', hosted: 'EKS Cluster → Namespace → Workload Pet Clinic Frontend', instrumented: false },
  { name: 'Inventory Service', sliStatus: 'Create SLO', sliColor: 'text-sky-400', sliIcon: null, availability: '-', env: 'ecs:inventory/production', hosted: 'ECS', instrumented: false },
  { name: 'Legacy API', sliStatus: 'Create SLO', sliColor: 'text-sky-400', sliIcon: null, availability: '-', env: 'ec2:legacy/production', hosted: 'EC2 Auto Scaling group Legacy API', instrumented: false },
]


function SliDonut({ data, isDark }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 58
  const stroke = 22
  const circumference = 2 * Math.PI * r
  let accumulated = 0

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mb-3">
        {data.map((item, i) => {
          const pct = item.value / total
          const dashLen = pct * circumference
          const gap = circumference - dashLen
          const offset = -(accumulated / total) * circumference
          accumulated += item.value
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={item.color}
              strokeWidth={stroke}
              strokeDasharray={`${dashLen} ${gap}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.4s ease' }}
            />
          )
        })}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          className={`text-3xl font-semibold ${isDark ? 'fill-white' : 'fill-gray-900'}`}
        >
          {data.reduce((s, d) => s + d.count, 0)}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className={`text-body-s ${isDark ? 'fill-white/50' : 'fill-gray-500'}`}
        >
          Total services
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-body-s">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
            <span className={isDark ? 'text-foreground-secondary' : 'text-gray-600'}>
              {item.label} ({item.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const sampleLogs = [
  { ts: '17738062180040000', msg: '[WARN] Authentication failed for user charlie@example.com from 10.0.150.155 — account locked after 5 consecutive failed attempts. Last successful login was 2024-03-14T08:22:00Z from IP 10.0.44.12. MFA challenge was not presented due to policy override on subnet 10.0.150.0/24. Security group sg-0a1b2c3d4e allows inbound from 0.0.0.0/0 on port 443. Recommend reviewing IAM policy arn:aws:iam::123456789012:policy/AuthServiceAccess and enabling MFA enforcement for all external subnets.', severity: 'WARN', svc: 'auth-svc' },
  { ts: '17738062170120000', msg: '[INFO] DELETE /api/orders/7eqxzhy50cp completed in 318ms status=201', severity: 'INFO', svc: 'auth-svc' },
  { ts: '17738062161670000', msg: '[ERROR] Failed to connect to host 10.0.23.233:5432 after 4 retries — connection pool exhausted (50/50 active connections). Circuit breaker tripped for upstream dependency payment-service (threshold: 5 failures in 30s window, current: 8). Fallback response served from cache (stale: 47s, key: payment:checkout:v2). Stack: ConnectionPoolExhausted at PoolManager.acquire (pool.js:142) → RetryPolicy.execute (retry.js:89) → CircuitBreaker.call (breaker.js:56) → PaymentClient.charge (client.js:201)', severity: 'ERROR', svc: 'auth-svc' },
  { ts: '17738062159240000', msg: '[INFO] PUT /api/orders/653fulzko3q completed in 1372ms status=201', severity: 'INFO', svc: 'auth-svc' },
  { ts: '17738062152840000', msg: '[ERROR] Request jcyux1zjod timed out after 30000ms waiting for auth-service — downstream latency p99=12400ms (threshold: 5000ms, SLO: 99.5% under 3000ms). Trace ID: abc-123-def-456-ghi-789. Span chain: api-gateway.route (2ms) → auth.validate (28450ms) → token.refresh (timeout) → db.query (never reached). Active deployments: auth-service v2.4.1 rolled out 43min ago to 3/8 instances. Canary metrics show 4.2% error rate vs 0.1% baseline. Rollback recommended.', severity: 'ERROR', svc: 'payment-svc' },
  { ts: '17738061986370000', msg: '[ERROR] Request elatdi23int timed out after 10000ms waiting for auth-service. Correlation ID: req-7f8a9b0c. Client IP: 10.0.88.42. User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36.', severity: 'ERROR', svc: 'search-svc' },
  { ts: '17738061961350000', msg: '[INFO] Query on table orders took 364ms rows=436 scan_type=full_table index_used=none. Query: SELECT o.id, o.status, o.total, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.created_at > NOW() - INTERVAL 24 HOUR AND o.status IN (pending, processing) ORDER BY o.created_at DESC LIMIT 500', severity: 'INFO', svc: 'payment-svc' },
  { ts: '17738061941870000', msg: '[INFO] GET /api/users/zdapy69gsv completed in 1693ms status=201', severity: 'INFO', svc: 'order-svc' },
  { ts: '17738061845260000', msg: '[INFO] Query on table products took 375ms rows=387', severity: 'INFO', svc: 'order-svc' },
  { ts: '17738061837950000', msg: '[ERROR] Failed to connect to host 10.0.50.228 after 2 retries. DNS resolution took 2340ms (expected <50ms). Possible DNS cache poisoning or resolver failure on vpc-resolver-1.internal. Affected zone: us-west-2.compute.internal.', severity: 'ERROR', svc: 'order-svc' },
]

function highlightMsg(msg, isDark) {
  const parts = []
  const regex = /(\b\d{1,3}(?:\.\d{1,3}){3}\b)|(\b\d+ms\b)|(status=\d+)|(\b(?:orders|products|users)\b)|(\b(?:auth-service|payment-service|search-service)\b)/g
  let last = 0
  let match
  while ((match = regex.exec(msg)) !== null) {
    if (match.index > last) parts.push({ text: msg.slice(last, match.index) })
    if (match[1]) parts.push({ text: match[0], color: 'text-status-active' })
    else if (match[2]) parts.push({ text: match[0], color: isDark ? 'text-foreground' : 'text-gray-900' })
    else if (match[3]) parts.push({ text: match[0], color: 'text-status-active' })
    else if (match[4]) parts.push({ text: match[0], color: isDark ? 'text-foreground' : 'text-gray-900' })
    else if (match[5]) parts.push({ text: match[0], color: isDark ? 'text-link' : 'text-blue-600' })
    last = match.index + match[0].length
  }
  if (last < msg.length) parts.push({ text: msg.slice(last) })
  return parts
}

function SparkleIcon({ isDark }) {
  return <Sparkle size={16} className={`shrink-0 ${isDark ? 'text-sky-400' : 'text-sky-500'}`} />
}

function PlayIconBtn() {
  return <Play size={16} />
}

function CodeIcon() {
  return <CodeSimple size={16} />
}

function ExploreHeader({ isDark }) {
  return (
    <div className="px-4 pt-3 pb-2 flex items-center gap-1.5">
      <span className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'}`}>Explore</span>
    </div>
  )
}

const vizModes = [
  { id: 'line', label: 'Line chart', Icon: ChartLine },
  { id: 'area', label: 'Area chart', Icon: ChartLineUp },
  { id: 'bar', label: 'Bar chart', Icon: ChartBar },
  { id: 'pie', label: 'Pie chart', Icon: ChartPie },
  { id: 'table', label: 'Table', Icon: TableIcon },
]

export function ExploreCard({ isDark, prefilled }) {
  const [query, setQuery] = useState(prefilled || '')
  const [submitted, setSubmitted] = useState(!!prefilled)
  const [activeResultTab, setActiveResultTab] = useState('logs')
  const [vizMode, setVizMode] = useState('table')
  const [expandedLog, setExpandedLog] = useState(null)

  const handleRun = () => {
    if (query.trim()) setSubmitted(true)
  }

  const queryInput = (
    <Input
      isDark={isDark}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleRun()}
      placeholder="Describe what you want to query..."
      leadingIcon={<MagnifyingGlass size={16} className={`shrink-0 ${isDark ? 'text-foreground-muted' : 'text-gray-400'}`} />}
      trailingSlot={
        <>
          <button type="button" onClick={handleRun} className={`shrink-0 p-1 rounded-lg transition-colors ${isDark ? 'text-foreground-muted hover:text-foreground' : 'text-gray-400 hover:text-gray-700'}`} aria-label="Run query"><PlayIconBtn /></button>
          <button type="button" className={`shrink-0 p-1 rounded-lg transition-colors ${isDark ? 'text-foreground-muted hover:text-foreground' : 'text-gray-400 hover:text-gray-700'}`} aria-label="View query code"><CodeIcon /></button>
        </>
      }
    />
  )

  if (!submitted) {
    return (
      <div>
        <Widget variant="glass" isDark={isDark}>
          <WidgetHeader title="Explore" />
          <WidgetBody>
            {queryInput}
          </WidgetBody>
        </Widget>
      </div>
    )
  }

  return (
    <div>
      <Widget variant="glass" isDark={isDark}>
        <WidgetHeader title="Explore" />
        <WidgetBody>

        <div className="px-4 pb-2 flex items-center gap-2">
          <div className="flex-1">{queryInput}</div>
          <SegmentedControl
            options={vizModes}
            value={vizMode}
            onChange={setVizMode}
            isDark={isDark}
          />
        </div>

        <Tabs value={activeResultTab} onValueChange={setActiveResultTab} isDark={isDark} variant="compressed">
          <div className="px-4">
            <TabsList isDark={isDark}>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="patterns">Patterns (5)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="logs">
            <div className="px-4">
              <AgGridTable
                isDark={isDark}
                rowData={sampleLogs.map((log, i) => ({ id: i, timestamp: log.ts, severity: log.severity, service: log.svc, message: log.msg }))}
                columnDefs={[
                  { field: 'timestamp', headerName: 'Timestamp', flex: 1.2, minWidth: 160 },
                  { field: 'severity', headerName: 'Severity', flex: 0.5, minWidth: 80,
                    cellRenderer: ({ value }) => {
                      const sev = value === 'ERROR' ? 'error' : value === 'WARN' ? 'warning' : 'info'
                      return <Badge severity={sev} size="sm" isDark={isDark}>{value}</Badge>
                    }
                  },
                  { field: 'service', headerName: 'Service', flex: 0.8, minWidth: 110 },
                  { field: 'message', headerName: 'Message', flex: 3, minWidth: 280 },
                ]}
                onRowClicked={(e) => setExpandedLog(expandedLog === e.data.id ? null : e.data.id)}
              />
              {expandedLog !== null && (
                <div className={`mt-1 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap ${isDark ? 'bg-white/[0.03] text-foreground-secondary border border-white/[0.06]' : 'bg-black/[0.02] text-gray-600 border border-black/[0.06]'}`}>
                  {sampleLogs[expandedLog]?.msg}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="patterns">
            <div className={`px-4 py-8 text-center text-xs ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>
              5 patterns detected across log entries
            </div>
          </TabsContent>
        </Tabs>
        </WidgetBody>
      </Widget>
    </div>
  )
}

function FaultRateBar({ rate, maxRate, isDark }) {
  const width = (rate / maxRate) * 100
  return (
    <div className="flex items-center gap-2">
      <div className={`w-20 h-1.5 ${isDark ? 'bg-white/10' : 'bg-gray-200'} rounded-full overflow-hidden`}>
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${width}%` }} />
      </div>
      <span className={`text-body-s ${isDark ? 'text-foreground' : 'text-gray-900'} w-10 text-right`}>
        {rate}%
      </span>
    </div>
  )
}

const alarmData = [
  { name: 'HighCPU-api-gateway', metric: 'CPUUtilization', namespace: 'AWS/EC2', threshold: 80, comparison: 'GreaterThanThreshold', service: 'APIGateway', serviceType: 'API Gateway', status: 'alarm' },
  { name: 'LowMemory-api-gateway', metric: 'MemoryUtilization', namespace: 'CWAgent', threshold: 90, comparison: 'GreaterThanThreshold', service: 'APIGateway', serviceType: 'API Gateway', status: 'ok' },
  { name: 'Latency-api-gateway', metric: 'Latency', namespace: 'AWS/ELB', threshold: 500, comparison: 'GreaterThanThreshold', service: 'APIGateway', serviceType: 'API Gateway', status: 'ok' },
  { name: 'ErrorRate-api-gateway', metric: '5XXError', namespace: 'AWS/ApiGateway', threshold: 5, comparison: 'GreaterThanThreshold', service: 'APIGateway', serviceType: 'API Gateway', status: 'ok' },
  { name: 'Duration-api-gateway', metric: 'Duration', namespace: 'AWS/Lambda', threshold: 3000, comparison: 'GreaterThanThreshold', service: 'APIGateway', serviceType: 'API Gateway', status: 'ok' },
  { name: 'HighCPU-web-frontend', metric: 'CPUUtilization', namespace: 'AWS/EC2', threshold: 80, comparison: 'GreaterThanThreshold', service: 'WebFrontend', serviceType: 'EC2 Instance', status: 'ok' },
  { name: 'LowMemory-web-frontend', metric: 'MemoryUtilization', namespace: 'CWAgent', threshold: 90, comparison: 'GreaterThanThreshold', service: 'WebFrontend', serviceType: 'EC2 Instance', status: 'ok' },
  { name: 'Latency-web-frontend', metric: 'Latency', namespace: 'AWS/ELB', threshold: 500, comparison: 'GreaterThanThreshold', service: 'WebFrontend', serviceType: 'EC2 Instance', status: 'ok' },
  { name: 'ErrorRate-web-frontend', metric: '5XXError', namespace: 'AWS/ApiGateway', threshold: 5, comparison: 'GreaterThanThreshold', service: 'WebFrontend', serviceType: 'EC2 Instance', status: 'ok' },
  { name: 'Duration-web-frontend', metric: 'Duration', namespace: 'AWS/Lambda', threshold: 3000, comparison: 'GreaterThanThreshold', service: 'WebFrontend', serviceType: 'EC2 Instance', status: 'ok' },
  { name: 'HighCPU-order-service', metric: 'CPUUtilization', namespace: 'AWS/EC2', threshold: 80, comparison: 'GreaterThanThreshold', service: 'OrderService', serviceType: 'ECS Service', status: 'alarm' },
  { name: 'LowMemory-order-service', metric: 'MemoryUtilization', namespace: 'CWAgent', threshold: 90, comparison: 'GreaterThanThreshold', service: 'OrderService', serviceType: 'ECS Service', status: 'ok' },
  { name: 'Latency-order-service', metric: 'Latency', namespace: 'AWS/ELB', threshold: 200, comparison: 'GreaterThanThreshold', service: 'OrderService', serviceType: 'ECS Service', status: 'ok' },
  { name: 'ErrorRate-order-service', metric: '5XXError', namespace: 'AWS/ApiGateway', threshold: 5, comparison: 'GreaterThanThreshold', service: 'OrderService', serviceType: 'ECS Service', status: 'ok' },
  { name: 'Duration-order-service', metric: 'Duration', namespace: 'AWS/Lambda', threshold: 3000, comparison: 'GreaterThanThreshold', service: 'OrderService', serviceType: 'ECS Service', status: 'ok' },
  { name: 'HighCPU-payment-service', metric: 'CPUUtilization', namespace: 'AWS/EC2', threshold: 80, comparison: 'GreaterThanThreshold', service: 'PaymentService', serviceType: 'Lambda', status: 'unknown' },
]

function getStateSegments(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  const segments = []
  // 12 segments for compact thumbnail view
  for (let i = 0; i < 12; i++) {
    const v = Math.abs((hash * (i + 1) * 7) % 100)
    segments.push(v < 8 ? 'alarm' : v < 14 ? 'insufficient' : 'ok')
  }
  return segments
}

function StateBar({ segments, isDark }) {
  return (
    <div className="flex gap-0.5 mt-2">
      {segments.map((s, i) => {
        const isFirst = i === 0
        const isLast = i === segments.length - 1
        const radius = isFirst ? 'rounded-l-full' : isLast ? 'rounded-r-full' : ''
        return (
          <div
            key={i}
            className={`h-1 flex-1 ${radius} ${
              s === 'ok' ? 'bg-emerald-500'
              : s === 'alarm' ? 'bg-red-500'
              : (isDark ? 'bg-slate-600' : 'bg-slate-300')
            }`}
          />
        )
      })}
    </div>
  )
}

function generateMetricData(alarm) {
  const now = new Date()
  const labels = []
  const values = []
  const stateSpans = []
  let hash = 0
  for (let i = 0; i < alarm.name.length; i++) hash = ((hash << 5) - hash + alarm.name.charCodeAt(i)) | 0

  // 3 hours of data, 5-min intervals = 36 points
  for (let i = 0; i < 36; i++) {
    const t = new Date(now.getTime() - (35 - i) * 5 * 60000)
    const h = t.getHours()
    const m = t.getMinutes().toString().padStart(2, '0')
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    labels.push(`${h12}:${m} ${ampm}`)

    const base = alarm.threshold * 0.4
    const noise = Math.sin(i * 0.5 + Math.abs(hash) * 0.01) * alarm.threshold * 0.3
    const spike = (i > 18 && i < 28) ? alarm.threshold * 0.4 * Math.sin((i - 18) * 0.35) : 0
    values.push(Math.max(0, base + noise + spike))
  }

  // State spans for the timeline (proportional, 3h window)
  const spanCount = 4 + (Math.abs(hash) % 3)
  let remaining = 36
  for (let i = 0; i < spanCount; i++) {
    const isLast = i === spanCount - 1
    const len = isLast ? remaining : Math.max(3, Math.floor(remaining / (spanCount - i) + (Math.abs(hash * (i + 1)) % 5) - 2))
    const v = Math.abs((hash * (i + 3) * 11) % 100)
    stateSpans.push({ length: Math.min(len, remaining), state: v < 20 ? 'alarm' : v < 30 ? 'insufficient' : 'ok' })
    remaining -= len
    if (remaining <= 0) break
  }

  return { labels, values, stateSpans }
}

export function AlarmDetail({ alarm, isDark, onBack }) {
  const { labels, values, stateSpans } = generateMetricData(alarm)

  const lineData = {
    labels,
    datasets: [{
      label: `${alarm.metric} Average`,
      data: values,
      borderColor: 'rgb(34, 211, 238)',
      backgroundColor: 'rgba(34, 211, 238, 0.1)',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHitRadius: 8,
      fill: true,
      tension: 0.4,
    }],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)', drawBorder: false },
        ticks: { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', font: { size: 10, family: 'DM Sans' }, maxTicksLimit: 6 },
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)', drawBorder: false },
        ticks: { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', font: { size: 10, family: 'DM Sans' } },
        beginAtZero: true,
        suggestedMax: alarm.threshold * 2,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)', titleColor: isDark ? '#e2e8f0' : '#1e293b', bodyColor: isDark ? '#94a3b8' : '#64748b', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderWidth: 1, padding: 8, bodyFont: { size: 11, family: 'DM Sans' }, titleFont: { size: 11, family: 'DM Sans' } },
      annotation: {
        annotations: {
          threshold: {
            type: 'line',
            yMin: alarm.threshold,
            yMax: alarm.threshold,
            borderColor: 'rgba(248, 113, 113, 0.7)',
            borderWidth: 1.5,
            borderDash: [6, 4],
            label: {
              display: true,
              content: String(alarm.threshold),
              position: 'start',
              backgroundColor: 'transparent',
              color: 'rgb(248, 113, 113)',
              font: { size: 10, family: 'DM Sans' },
            },
          },
        },
      },
    },
  }

  const statusLabel = alarm.status === 'alarm' ? 'In Alarm' : alarm.status === 'ok' ? 'OK' : 'Insufficient Data'

  const stateColors = { ok: 'bg-severity-success', alarm: 'bg-severity-critical', insufficient: isDark ? 'bg-slate-600' : 'bg-slate-300' }

  return (
    <Card variant="glass" isDark={isDark} className="p-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && <button onClick={onBack} className={`p-1 rounded-lg transition-colors ${isDark ? 'text-foreground-muted hover:text-foreground hover:bg-white/[0.06]' : 'text-gray-400 hover:text-gray-700 hover:bg-black/[0.04]'}`} aria-label="Back to alarms">
            <ArrowLeft size={16} />
          </button>}
          <span className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'}`}>Alarm · {alarm.name}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium ${isDark ? 'bg-white/[0.06] text-foreground-secondary' : 'bg-gray-100 text-gray-600'}`}>
          <HardDrives size={12} />
          {alarm.service} · {alarm.serviceType}
        </div>
      </div>

      {/* Status badge */}
      <div className="px-4 pb-3">
        <Badge
          isDark={isDark}
          severity={alarm.status === 'alarm' ? 'critical' : alarm.status === 'ok' ? 'success' : undefined}
          size="sm"
        >
          {statusLabel}
        </Badge>
      </div>

      {/* Metadata row */}
      <div className={`px-4 pb-4 flex gap-8 ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>
        <div>
          <div className={`text-[10px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>Metric</div>
          <div className="text-xs font-medium">{alarm.metric}</div>
        </div>
        <div>
          <div className={`text-[10px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>Namespace</div>
          <div className="text-xs font-medium">{alarm.namespace}</div>
        </div>
        <div>
          <div className={`text-[10px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>Threshold</div>
          <div className="text-xs font-medium">{alarm.threshold}</div>
        </div>
        <div>
          <div className={`text-[10px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>Comparison</div>
          <div className="text-xs font-medium">{alarm.comparison}</div>
        </div>
      </div>

      {/* Metric chart */}
      <div className="px-4">
        <div className={`text-[9px] font-medium mb-2 ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>
          {alarm.metric} average
        </div>
        <div style={{ height: 200 }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex justify-center">
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="w-4 h-0.5 bg-cyan-400 rounded-full" />
          <span className={isDark ? 'text-foreground-secondary' : 'text-gray-600'}>{alarm.metric} Average</span>
        </div>
      </div>

      {/* State history timeline */}
      <div className="px-4 pb-4">
        <div className={`text-[9px] font-medium mb-2 ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>
          State history (last 3h)
        </div>
        <div className="flex gap-0.5">
          {stateSpans.map((span, i) => {
            const isFirst = i === 0
            const isLast = i === stateSpans.length - 1
            const radius = isFirst ? 'rounded-l-full' : isLast ? 'rounded-r-full' : ''
            return (
              <div
                key={i}
                className={`h-2 ${radius} ${stateColors[span.state]}`}
                style={{ flex: span.length }}
              />
            )
          })}
        </div>
      </div>
    </Card>
  )
}

function AlarmsCard({ isDark }) {
  const [search, setSearch] = useState('')
  const [selectedAlarm, setSelectedAlarm] = useState(null)
  const cardRef = useRef(null)

  useEffect(() => {
    if (cardRef.current) cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (selectedAlarm) {
    return <AlarmDetail alarm={selectedAlarm} isDark={isDark} onBack={() => setSelectedAlarm(null)} />
  }

  const filtered = search
    ? alarmData.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    : alarmData

  return (
    <div ref={cardRef}>
      <Widget isDark={isDark}>
        <WidgetHeader isDark={isDark} title="Alarms" />
        <WidgetBody>
          <div className="pb-1">
            <Input
              isDark={isDark}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alarms..."
              leadingIcon={<MagnifyingGlass size={16} />}
            />
          </div>
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filtered.map((alarm) => {
              const segments = getStateSegments(alarm.name)
              const StatusIcon = alarm.status === 'ok' ? CheckCircle
                : alarm.status === 'alarm' ? Warning
                : Question
              const statusColor = alarm.status === 'ok' ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                : alarm.status === 'alarm' ? (isDark ? 'text-red-400' : 'text-red-600')
                : (isDark ? 'text-foreground-muted' : 'text-gray-500')
              return (
                <Card key={alarm.name} variant="flat" isDark={isDark} className="p-3 cursor-pointer transition-colors hover:bg-white/[0.04]" onClick={() => setSelectedAlarm(alarm)}>
                  <div className="flex items-start gap-2">
                    <StatusIcon className={`w-4 h-4 mt-0.5 shrink-0 ${statusColor}`} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-medium truncate ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{alarm.name}</div>
                      <div className={`text-[10px] mt-0.5 ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>{alarm.namespace}/{alarm.metric}</div>
                    </div>
                  </div>
                  <StateBar segments={segments} isDark={isDark} />
                </Card>
              )
            })}
          </div>
        </WidgetBody>
      </Widget>
    </div>
  )
}

export default function ServicesOverview({ isDark, showExplore, showAlarms }) {
  const maxRate = Math.max(...dependencyPaths.map(d => d.rate))

  // When only showing explore or alarms, skip the service detail cards
  if (showAlarms && !showExplore) {
    return <AlarmsCard isDark={isDark} />
  }
  if (showExplore && !showAlarms) {
    return <ExploreCard isDark={isDark} />
  }

  return (
    <div className="space-y-2">
      {/* Top row — 3 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Services by SLI status */}
        <Card variant="glass" isDark={isDark} className="p-2">
          <h5 className={`text-heading-s font-medium ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>
            Services by SLI status
          </h5>
          <SliDonut data={sliDonutData} isDark={isDark} />
        </Card>

        {/* Top services by fault rate */}
        <Card variant="glass" isDark={isDark} className="p-2">
          <h5 className={`text-heading-s font-medium ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>
            Top services by fault rate
          </h5>
          <Table isDark={isDark}>
            <TableHeader isDark={isDark}>
              <TableRow isDark={isDark}>
                <TableHead isDark={isDark}>Service</TableHead>
                <TableHead isDark={isDark} align="right">Fault rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody isDark={isDark}>
              <TableRow isDark={isDark}>
                <TableCell isDark={isDark} className="h-20">
                  <span className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>
                    No services found
                  </span>
                </TableCell>
                <TableCell isDark={isDark} />
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* Top dependency paths by fault rate */}
        <Card variant="glass" isDark={isDark} className="p-2">
          <h5 className={`text-heading-s font-medium ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>
            Top dependency paths by fault rate
          </h5>
          <Table isDark={isDark}>
            <TableHeader isDark={isDark}>
              <TableRow isDark={isDark}>
                <TableHead isDark={isDark}>Remote service</TableHead>
                <TableHead isDark={isDark}>Service</TableHead>
                <TableHead isDark={isDark} align="right">Fault rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody isDark={isDark}>
              {dependencyPaths.map((dep, i) => (
                <TableRow key={i} isDark={isDark}>
                  <TableCell isDark={isDark}>
                    <span className={isDark ? 'text-link' : 'text-blue-600'}>{dep.remote}</span>
                  </TableCell>
                  <TableCell isDark={isDark}>
                    <div className={isDark ? 'text-link' : 'text-blue-600'}>{dep.service}</div>
                    <div className={`text-[10px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>{dep.serviceEnv}</div>
                  </TableCell>
                  <TableCell isDark={isDark} align="right">
                    <FaultRateBar rate={dep.rate} maxRate={maxRate} isDark={isDark} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Services table */}
      <Card variant="glass" isDark={isDark} className="p-2">
        <h5 className={`text-heading-s font-medium ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>
          Services ({services.length})
        </h5>
        <Table isDark={isDark}>
          <TableHeader isDark={isDark}>
            <TableRow isDark={isDark}>
              <TableHead isDark={isDark}>Name ↕</TableHead>
              <TableHead isDark={isDark}>SLI status ↓</TableHead>
              <TableHead isDark={isDark}>Service availability ↕</TableHead>
              <TableHead isDark={isDark}>Environment ↕</TableHead>
              <TableHead isDark={isDark}>Hosted in</TableHead>
              <TableHead isDark={isDark} align="right">Instrumentation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isDark={isDark}>
            {services.map((svc, i) => (
              <TableRow key={i} isDark={isDark}>
                <TableCell isDark={isDark}>
                  <span className={isDark ? 'text-link' : 'text-blue-600'}>{svc.name}</span>
                </TableCell>
                <TableCell isDark={isDark}>
                  {svc.sliIcon ? (
                    <span className={`${svc.sliColor} text-body-s`}>
                      {svc.sliIcon} {svc.sliStatus}
                    </span>
                  ) : (
                    <span className={`${svc.sliColor} text-body-s font-medium`}>{svc.sliStatus}</span>
                  )}
                </TableCell>
                <TableCell isDark={isDark}>
                  <span className={isDark ? 'text-foreground-muted' : 'text-gray-500'}>{svc.availability}</span>
                </TableCell>
                <TableCell isDark={isDark}>
                  <span className={`text-body-s ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>{svc.env}</span>
                </TableCell>
                <TableCell isDark={isDark}>
                  <span className={`text-body-s ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>{svc.hosted}</span>
                </TableCell>
                <TableCell isDark={isDark} align="right">
                  <span className={isDark ? 'text-link' : 'text-blue-600'}>Enable</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {showAlarms && <AlarmsCard isDark={isDark} />}

      {/* Explore card */}
      {showExplore && <ExploreCard isDark={isDark} />}
    </div>
  )
}
