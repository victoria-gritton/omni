import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  House, MagnifyingGlass, Pulse, MagnifyingGlassPlus,
  GearSix, Star, Clock, Sparkle, Bell, User,
  ChatTeardropDots, X, PaperPlaneRight, List
} from '@phosphor-icons/react'
import { usePersona } from '../data/persona'
import AlarmRecommendations from './AlarmRecommendations'

const ChatContext = createContext(null)
export function useChatPanel() { return useContext(ChatContext) }

const navItems = [
  { icon: House, label: 'Home', subtitle: 'Overview', path: '/home' },
  { icon: MagnifyingGlass, label: 'Explore', subtitle: 'Logs, metrics, traces', path: '/explore', also: ['/query'] },
  { icon: Pulse, label: 'Monitor', subtitle: 'Active monitoring & alerts', path: '/monitor' },
  { icon: MagnifyingGlassPlus, label: 'Investigate', subtitle: 'Active investigations', path: '/investigate', also: ['/console', '/devops-console'] },
  { icon: GearSix, label: 'Configure', subtitle: 'Settings & resources', path: '/configure' },
]

const favorites = [
  { label: 'Production Dashboard' },
  { label: 'Error Rate Alerts' },
]

const recents = [
  { label: 'Lambda Errors' },
  { label: 'API Gateway Metrics' },
]

const CHAT_RESPONSES = {
  default: {
    text: <><p>I'm monitoring the incident.</p><ul className="mt-1.5 space-y-1"><li className="flex gap-2"><span className="text-status-outage">●</span>order-service east-2 — memory exhaustion</li><li className="flex gap-2"><span className="text-status-blocked">●</span>Restart loop active since 1:52 AM</li><li className="flex gap-2"><span className="text-foreground-muted">●</span>No deploys in 6h</li></ul></>,
    followUps: ['What caused this?', 'How many users affected?', 'Show the timeline'],
  },
  'deploy diff': {
    text: <><p className="text-foreground font-medium">Deploy #847 — commit a3f7c2d by Raj Patel</p><div className="mt-1.5 p-2 rounded-lg bg-background-surface-2/50 font-mono text-[10px]"><p className="text-status-outage">- TableName: 'PaymentsTable'</p><p className="text-status-active">+ TableName: 'PaymentsTable-v2'</p></div><p className="mt-1.5 text-foreground-muted">1 file changed in payment-processor.ts:47. The table reference was updated as part of migration work, but the Terraform change to create PaymentsTable-v2 has not been applied yet.</p></>,
    followUps: ['Open this in IDE', 'Who approved this CR?', 'Show the Terraform change'],
  },
  'post-mortem': {
    text: <><p className="text-foreground font-medium">Post-mortem draft generated</p><div className="mt-1.5 space-y-1.5"><div><p className="text-foreground-muted font-semibold">Title:</p><p>Payments service outage — bad deploy #847</p></div><div><p className="text-foreground-muted font-semibold">Duration:</p><p>22 minutes (01:52 — 02:14 AM)</p></div><div><p className="text-foreground-muted font-semibold">Impact:</p><p>847 failed checkouts, ~$12.4k est. revenue impact, 0 data loss</p></div><div><p className="text-foreground-muted font-semibold">Root cause:</p><p>Code referencing PaymentsTable-v2 deployed before Terraform created the table</p></div><div><p className="text-foreground-muted font-semibold">Action items:</p><ul className="mt-0.5 space-y-0.5"><li>1. Add deployment gate to validate referenced resources exist</li><li>2. Require Terraform apply before code deploy for migration PRs</li><li>3. Add feature flag for table migration cutover</li></ul></div></div></>,
    followUps: ['Share to Slack', 'Create Jira ticket', 'Edit draft'],
  },
  'slack': {
    text: <><p className="text-foreground font-medium">Slack update sent to #payments-eng</p><div className="mt-1.5 p-2 rounded-lg bg-background-surface-2/50"><p className="text-foreground">Incident update — Payments service</p><p className="mt-1 text-foreground-muted">Deploy #847 introduced a reference to PaymentsTable-v2 which does not exist. 847 payment attempts failed (12% error rate). No data corruption. Root cause: code shipped before Terraform applied. Investigating rollback and fix.</p><p className="mt-1 text-[10px] text-foreground-disabled">Posted by CloudWatch AI on behalf of Maya Santos</p></div><a href="#/slack" className="text-[11px] text-link mt-2 block hover:underline">View in Slack u2192</a></>,
    followUps: ['Send to #incidents too', 'Page Raj Patel', 'Generate post-mortem'],
  },
  'open this in ide': {
    text: <><p>Opening <span className="text-foreground font-medium">payment-processor.ts</span> in your IDE with the suggested fix highlighted.</p><div className="mt-1.5 p-2 rounded-lg bg-background-surface-2/50 font-mono text-[10px]"><p>Line 47:</p><p className="text-status-outage">- TableName: 'PaymentsTable-v2'</p><p className="text-status-active">+ TableName: 'PaymentsTable'</p></div><p className="mt-1.5 text-foreground-muted">Accept the change and the Terraform apply will be queued automatically.</p></>,
    followUps: ['Apply Terraform now', 'Show full file', 'Run tests first'],
  },
  'who approved': {
    text: <><p className="text-foreground font-medium">CR-4821 approved by Alex Kim</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span className="text-foreground-muted">Author</span><span>Raj Patel</span></div><div className="flex justify-between"><span className="text-foreground-muted">Reviewer</span><span>Alex Kim</span></div><div className="flex justify-between"><span className="text-foreground-muted">Approved</span><span>Yesterday 5:32 PM</span></div><div className="flex justify-between"><span className="text-foreground-muted">Merged</span><span>Yesterday 5:47 PM</span></div></div><p className="mt-1.5 text-foreground-muted">The CR description mentions table migration but does not reference a Terraform dependency.</p></>,
    followUps: ['Show the CR diff', 'Notify Raj Patel', 'Add deployment gate policy'],
  },
  'terraform': {
    text: <><p className="text-foreground font-medium">Terraform change: create PaymentsTable-v2</p><div className="mt-1.5 p-2 rounded-lg bg-background-surface-2/50 font-mono text-[10px]"><p>resource "aws_dynamodb_table" "payments_v2" {'{'}</p><p>  name = "PaymentsTable-v2"</p><p>  billing_mode = "PAY_PER_REQUEST"</p><p>  hash_key = "paymentId"</p><p>{'}'}</p></div><p className="mt-1.5 text-foreground-muted">This change is in the pipeline but requires approval from the infra team. Estimated apply time: 3-5 minutes once approved.</p></>,
    followUps: ['Request approval now', 'Show pipeline status', 'Who needs to approve?'],
  },
  'jira': {
    text: <><p className="text-foreground font-medium">Jira ticket created: PAY-2847</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span className="text-foreground-muted">Type</span><span>Incident</span></div><div className="flex justify-between"><span className="text-foreground-muted">Priority</span><span className="text-status-outage">P1</span></div><div className="flex justify-between"><span className="text-foreground-muted">Assignee</span><span>Maya Santos</span></div><div className="flex justify-between"><span className="text-foreground-muted">Labels</span><span>deploy-issue, payments</span></div></div><p className="mt-1.5 text-foreground-muted">Linked to deploy #847 and CR-4821. Post-mortem draft attached.</p></>,
    followUps: ['Open in Jira', 'Add Raj as watcher', 'Link to runbook'],
  },
  '#incidents': {
    text: <><p className="text-foreground font-medium">Update posted to #incidents</p><div className="mt-1.5 p-2 rounded-lg bg-background-surface-2/50"><p className="text-foreground">P1 Incident — Payments service</p><p className="mt-1 text-foreground-muted">12% error rate on /process-payment. 847 failed checkouts. Root cause: Deploy #847 refs non-existent PaymentsTable-v2. Investigating rollback. No data corruption.</p><p className="mt-1 text-[10px] text-foreground-disabled">Posted to #incidents and #payments-eng</p></div></>,
    followUps: ['Page on-call manager', 'Start bridge call', 'Update status page'],
  },
  'raj': {
    text: <><p className="text-foreground font-medium">Notification sent to Raj Patel</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span className="text-foreground-muted">Channel</span><span>Slack DM + PagerDuty</span></div><div className="flex justify-between"><span className="text-foreground-muted">Message</span><span>You are listed as author of deploy #847</span></div><div className="flex justify-between"><span className="text-foreground-muted">Status</span><span className="text-status-blocked">Awaiting response</span></div></div><p className="mt-1.5 text-foreground-muted">Raj merged commit a3f7c2d at 5:47 PM yesterday. The commit changed the table reference from PaymentsTable to PaymentsTable-v2 as part of migration work.</p></>,
    followUps: ['Show the CR diff', 'Escalate to manager', 'Send reminder'],
  },
  'page': {
    text: <><p className="text-foreground font-medium">Notification sent to Raj Patel</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span className="text-foreground-muted">Channel</span><span>Slack DM + PagerDuty</span></div><div className="flex justify-between"><span className="text-foreground-muted">Message</span><span>You are listed as author of deploy #847</span></div><div className="flex justify-between"><span className="text-foreground-muted">Status</span><span className="text-status-blocked">Awaiting response</span></div></div><p className="mt-1.5 text-foreground-muted">Raj merged commit a3f7c2d at 5:47 PM yesterday. The commit changed the table reference from PaymentsTable to PaymentsTable-v2 as part of migration work.</p></>,
    followUps: ['Show the CR diff', 'Escalate to manager', 'Send reminder'],
  },
  'notify': {
    text: <><p className="text-foreground font-medium">Raj Patel notified via Slack and PagerDuty</p><p className="mt-1 text-foreground-muted">He is the author of deploy #847 (commit a3f7c2d). Awaiting acknowledgment.</p></>,
    followUps: ['Show the CR diff', 'Escalate to manager', 'Send reminder'],
  },
  'bridge': {
    text: <><p className="text-foreground font-medium">Bridge call started</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span className="text-foreground-muted">Room</span><span>Chime: INC-payments-847</span></div><div className="flex justify-between"><span className="text-foreground-muted">Invited</span><span>Maya Santos, Raj Patel, Alex Kim</span></div><div className="flex justify-between"><span className="text-foreground-muted">Status</span><span className="text-status-active">Active</span></div></div></>,
    followUps: ['Share investigation link', 'Add on-call manager', 'Record notes'],
  },
  'status page': {
    text: <><p className="text-foreground font-medium">Status page updated</p><div className="mt-1.5 p-2 rounded-lg bg-background-surface-2/50"><p className="text-status-outage font-medium">Payments Service - Degraded</p><p className="mt-1 text-foreground-muted">Some customers may experience payment failures at checkout. Our team is actively investigating and working on a fix. No data has been lost.</p><p className="mt-1 text-[10px] text-foreground-disabled">Updated 2:15 AM</p></div></>,
    followUps: ['Notify subscribers', 'Update to resolved', 'Add timeline entry'],
  },
  'escalate': {
    text: <><p className="text-foreground font-medium">Escalated to engineering manager</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span className="text-foreground-muted">Manager</span><span>Sarah Chen</span></div><div className="flex justify-between"><span className="text-foreground-muted">Channel</span><span>Slack DM + Phone call</span></div><div className="flex justify-between"><span className="text-foreground-muted">Severity</span><span className="text-status-outage">P1</span></div></div><p className="mt-1.5 text-foreground-muted">Incident summary and investigation link shared. Sarah has been added to the bridge call.</p></>,
    followUps: ['Start bridge call', 'Share post-mortem draft', 'Show blast radius'],
  },
  'reminder': {
    text: <><p className="text-foreground font-medium">Reminder sent to Raj Patel</p><p className="mt-1 text-foreground-muted">Second notification sent via Slack DM and PagerDuty. If no response in 5 minutes, I can escalate to his manager.</p></>,
    followUps: ['Escalate to manager', 'Try phone call', 'Continue without Raj'],
  },
  'what caused': {
    text: <><p>ECS tasks hit their <span className="text-foreground font-medium">512 MB memory limit</span>.</p><ul className="mt-1.5 space-y-1"><li className="flex gap-2"><span className="text-status-outage">●</span>6 OOM kills since 1:52 AM</li><li className="flex gap-2"><span className="text-status-outage">●</span>Tasks stuck in restart loop</li><li className="flex gap-2"><span className="text-status-active">●</span>No bad deploys — workload outgrew allocation</li></ul></>,
    followUps: ['How do we fix it?', 'Show affected services', 'Should we rollback?'],
  },
  'how many': {
    text: <><p className="text-foreground font-medium">~2,400 failed checkouts</p><p className="mt-1">in the last 10 minutes. 3 downstream services degraded:</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span>checkout-service</span><span className="text-status-blocked font-mono">1.8s</span></div><div className="flex justify-between"><span>order-service</span><span className="text-status-blocked font-mono">900ms</span></div><div className="flex justify-between"><span>inventory-service</span><span className="text-status-blocked font-mono">600ms</span></div></div></>,
    followUps: ['Which regions?', 'Show error rates', 'What caused this?'],
  },
  'rollback': {
    text: <><p>Rollback <span className="text-status-blocked font-medium">not recommended</span>.</p><ul className="mt-1.5 space-y-1"><li className="flex gap-2"><span className="text-foreground-muted">—</span>No deploys in 6 hours</li><li className="flex gap-2"><span className="text-foreground-muted">—</span>Nothing to roll back to</li><li className="flex gap-2"><span className="text-status-active">→</span>Fix: increase memory 512 MB → 1 GB</li></ul></>,
    followUps: ['Approve the fix', 'Show me the runbook', 'What are the risks?'],
  },
  'post-mortem': {
    text: <p>I can generate a post-mortem draft with timeline, root cause, and action items. Ready when you are.</p>,
    followUps: ['Yes, generate it', 'Show the timeline first', 'Not now'],
  },
  'fix': {
    text: <><p>Recommended fix:</p><div className="mt-1.5 p-2 rounded-lg bg-background-surface-2/50"><p className="text-foreground font-medium">Restart ECS tasks with 1 GB memory</p><p className="mt-0.5">Up from 512 MB · one task at a time · no downtime</p></div><p className="mt-1.5">Matches runbook: <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-background-surface-2">OOM restart → increase memory</span></p></>,
    followUps: ['Approve & execute', 'What are the risks?', 'Show affected services'],
  },
  'risk': {
    text: <><p className="text-status-active font-medium">Low risk</p><ul className="mt-1.5 space-y-1"><li className="flex gap-2"><span className="text-status-active">✓</span>Rolling restart — always capacity</li><li className="flex gap-2"><span className="text-status-active">✓</span>1 GB within task definition limits</li><li className="flex gap-2"><span className="text-status-active">✓</span>No config changes needed</li></ul></>,
    followUps: ['Approve & execute', 'Show the runbook', 'Who else is on-call?'],
  },
  'affected': {
    text: <><p>3 services degraded via dependency chain:</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span>checkout-service</span><span className="text-status-blocked font-mono">1.8s</span></div><div className="flex justify-between"><span>order-service</span><span className="text-status-blocked font-mono">900ms</span></div><div className="flex justify-between"><span>inventory-service</span><span className="text-status-blocked font-mono">600ms</span></div></div><p className="mt-1.5 text-foreground-muted">3 healthy services unaffected</p></>,
    followUps: ['Show the service map', 'What caused this?', 'How do we fix it?'],
  },
  'health': {
    text: <><p><span className="text-status-active font-medium">12 services operational</span></p><ul className="mt-1.5 space-y-1"><li className="flex gap-2"><span className="text-status-blocked">⚠</span>payment-service — 245ms avg (baseline 80ms)</li><li className="flex gap-2"><span className="text-status-blocked">⚠</span>DynamoDB UsersTable — read throttling</li><li className="flex gap-2"><span className="text-status-active">✓</span>10 other services normal</li></ul></>,
    followUps: ['Show active alarms', 'Which services have errors?', 'Show dependency map'],
  },
  'alarm': {
    text: <><p className="text-foreground font-medium">4 active alarms</p><div className="mt-1.5 space-y-1.5"><div className="flex items-start gap-2"><span className="text-status-outage">●</span><div><p className="text-foreground">DynamoDB ReadThrottles</p><p className="text-foreground-muted">just now</p></div></div><div className="flex items-start gap-2"><span className="text-status-outage">●</span><div><p className="text-foreground">PaymentService Fault Rate 12.3%</p><p className="text-foreground-muted">2m ago</p></div></div><div className="flex items-start gap-2"><span className="text-status-blocked">●</span><div><p className="text-foreground">API Gateway 5xx — 5.2%</p><p className="text-foreground-muted">4m ago</p></div></div><div className="flex items-start gap-2"><span className="text-status-blocked">●</span><div><p className="text-foreground">Container Memory — 85%</p><p className="text-foreground-muted">anomaly detected</p></div></div></div></>,
    followUps: ['Tell me about payment-service', 'Show error logs', 'Which is most critical?'],
  },
  'compare': {
    text: <>
      <p className="text-foreground font-medium">Traffic comparison: now vs last Tuesday</p>
      <p className="mt-1 text-foreground-muted">Same window (2:00–2:30 AM)</p>
      {/* Inline sparkline comparison chart */}
      <div className="mt-2 rounded-lg bg-background-surface-2/50 p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-foreground-muted">Requests/min</span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-primary inline-block rounded" /> Today</span>
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-foreground-disabled inline-block rounded" /> Last Tue</span>
          </div>
        </div>
        <svg viewBox="0 0 200 50" className="w-full" style={{ height: 50 }}>
          {/* Last Tuesday - dashed gray */}
          <polyline points="0,38 20,36 40,34 60,30 80,28 100,26 120,24 140,22 160,20 180,18 200,16" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
          {/* Today - solid primary */}
          <polyline points="0,40 20,37 40,32 60,28 80,25 100,22 120,20 140,17 160,14 180,12 200,10" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
          {/* Subtle fill under today */}
          <path d="M0,40 L20,37 L40,32 L60,28 L80,25 L100,22 L120,20 L140,17 L160,14 L180,12 L200,10 L200,50 L0,50 Z" fill="#0ea5e9" fillOpacity="0.08" />
        </svg>
        <div className="flex justify-between text-[10px] text-foreground-disabled mt-0.5">
          <span>2:00 AM</span><span>2:15 AM</span><span>2:30 AM</span>
        </div>
      </div>
      {/* Metric comparison */}
      <div className="mt-2 space-y-1 text-[11px]">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 items-baseline">
          <span>Requests/min</span><span className="font-mono text-right">8,420</span><span className="text-foreground-muted font-mono">vs 8,180</span><span className="text-status-active font-mono">+2.9%</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 items-baseline">
          <span>Error rate</span><span className="font-mono text-right">0.3%</span><span className="text-foreground-muted font-mono">vs 0.2%</span><span />
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 items-baseline">
          <span>p99 latency</span><span className="font-mono text-right">210ms</span><span className="text-foreground-muted font-mono">vs 195ms</span><span className="text-status-blocked font-mono">+7.7%</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 items-baseline">
          <span>Unique users</span><span className="font-mono text-right">1,240</span><span className="text-foreground-muted font-mono">vs 1,190</span><span />
        </div>
      </div>
      <p className="mt-2 text-foreground-muted">Traffic is tracking close to last Tuesday. The slight latency bump correlates with DynamoDB throttling on UsersTable.</p>
    </>,
    followUps: ['Why is latency higher?', 'Compare to last 7 Tuesdays', 'Show error breakdown'],
  },
  'error rate': {
    text: <><p className="text-foreground font-medium">Error rates (last hour)</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span>payment-service</span><span className="text-status-outage font-mono">12.3%</span></div><div className="flex justify-between"><span>API Gateway</span><span className="text-status-blocked font-mono">5.2%</span></div><div className="flex justify-between"><span>order-service</span><span className="text-foreground-muted font-mono">0.8%</span></div><div className="flex justify-between"><span>checkout-service</span><span className="text-foreground-muted font-mono">0.3%</span></div></div><p className="mt-1.5 text-foreground-muted">Root cause: DynamoDB throttling on UsersTable</p></>,
    followUps: ['Show payment-service details', 'Show error logs', 'What caused the throttling?'],
  },
  'log': {
    text: <><p className="text-foreground font-medium">Recent errors (30 min)</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span>DynamoDB read timeout</span><span className="font-mono text-status-outage">847×</span></div><div className="flex justify-between"><span>HTTP 504 Gateway</span><span className="font-mono text-status-outage">234×</span></div><div className="flex justify-between"><span>ThroughputExceeded</span><span className="font-mono text-status-blocked">89×</span></div><div className="flex justify-between"><span>ConnectionPool</span><span className="font-mono text-status-active">12× ✓</span></div></div></>,
    followUps: ['Show error rates', 'What caused the throttling?', 'Show active alarms'],
  },
  'container': {
    text: <><p className="text-foreground font-medium">payment-processing-prod</p><p>10 containers running</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span>Top memory</span><span className="text-status-blocked font-mono">680 MB / 800 MB</span></div><div className="flex justify-between"><span>Avg CPU</span><span className="font-mono">62%</span></div><div className="flex justify-between"><span>OOM kills (24h)</span><span className="text-status-active font-mono">0</span></div></div><p className="mt-1.5 text-status-blocked">⚠ 2 OOM restarts last weekend — no alarm caught it</p></>,
    followUps: ['Set up monitoring', 'Show all containers', 'Show memory trends'],
  },
  'lambda': {
    text: <><p className="text-foreground font-medium">Top Lambda functions (1h)</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span>payment-validator</span><span className="text-status-outage font-mono">6,891 · 12.3%</span></div><div className="flex justify-between"><span>auth-token-refresh</span><span className="font-mono">4,234 · 0.1%</span></div><div className="flex justify-between"><span>order-processor</span><span className="font-mono">3,102 · 0.8%</span></div><div className="flex justify-between"><span>notification-sender</span><span className="text-status-active font-mono">2,890 · 0%</span></div></div><p className="mt-1.5 text-foreground-muted">Cold start avg: 340ms (↑15% since last deploy)</p></>,
    followUps: ['Show payment-validator errors', 'Show cold start trends', 'Compare with last week'],
  },
  'database': {
    text: <><p className="text-foreground font-medium">Database health</p><div className="mt-1.5 space-y-1"><div className="flex items-start gap-2"><span className="text-status-blocked">⚠</span><span>UsersTable — read throttling (auto-scaling)</span></div><div className="flex items-start gap-2"><span className="text-status-active">✓</span><span>OrdersTable — 45% read capacity</span></div><div className="flex items-start gap-2"><span className="text-status-active">✓</span><span>ProductsTable — 23% read capacity</span></div><div className="flex items-start gap-2"><span className="text-status-active">✓</span><span>analytics-db — 62% connections</span></div></div></>,
    followUps: ['Show throttling details', 'Show active alarms', 'When will it resolve?'],
  },
  'dashboard': {
    text: <><p className="text-foreground font-medium">6 dashboards</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span>Production Overview</span><span className="text-foreground-muted">2h ago</span></div><div className="flex justify-between"><span>Payment Service Health</span><span className="text-foreground-muted">yesterday</span></div><div className="flex justify-between"><span>API Gateway Metrics</span><span className="text-foreground-muted">3d ago</span></div><div className="flex justify-between"><span>Lambda Performance</span><span className="text-foreground-muted">1w ago</span></div><div className="flex justify-between"><span>DynamoDB Capacity</span><span className="text-foreground-muted">2w ago</span></div><div className="flex justify-between"><span>Cost & Usage</span><span className="text-foreground-muted">1mo ago</span></div></div></>,
    followUps: ['Open Production Overview', 'Create new dashboard', 'Show stale dashboards'],
  },
  'payment': {
    text: <><p className="text-foreground font-medium">payment-service east-2</p><div className="mt-1.5 space-y-1"><div className="flex items-start gap-2"><span className="text-status-outage">●</span><span>Memory limit hit — 512 MB</span></div><div className="flex items-start gap-2"><span className="text-status-outage">●</span><span>OOM restart loop active</span></div><div className="flex items-start gap-2"><span className="text-status-outage">●</span><span>~2,400 failed checkouts (10 min)</span></div><div className="flex items-start gap-2"><span className="text-status-active">●</span><span>No deploys in 6h</span></div></div><p className="mt-2">I created an investigation dashboard with the full analysis, service map, and remediation options.</p></>,
    followUps: ['Open investigation dashboard', 'What caused this?', 'How do we fix it?'],
  },
  'set up': {
    text: <><p>I can set up container memory monitoring:</p><div className="mt-1.5 p-2 rounded-lg bg-background-surface-2/50 space-y-1"><div className="flex justify-between"><span className="text-foreground-muted">Cluster</span><span className="text-foreground">payment-processing-prod</span></div><div className="flex justify-between"><span className="text-foreground-muted">Metric</span><span className="text-foreground">MemoryUtilization</span></div><div className="flex justify-between"><span className="text-foreground-muted">Threshold</span><span className="text-foreground">80%</span></div><div className="flex justify-between"><span className="text-foreground-muted">Action</span><span className="text-foreground">SNS → on-call</span></div></div></>,
    followUps: ['Create the alarm', 'Show me the config first', 'What else should I monitor?'],
  },
  'dependency': {
    text: <><p className="text-foreground font-medium">Service topology</p><div className="mt-1.5 space-y-1"><p>API Gateway → Auth, Payment, Order</p><p>Payment → Checkout, Inventory</p><p>All → DynamoDB</p></div><p className="mt-1.5 text-status-blocked">⚠ Payment in WARNING — cascading to API Gateway 5xx</p></>,
    followUps: ['Show affected services', 'What caused this?', 'Show latency breakdown'],
  },
  'latency': {
    text: <><p className="text-foreground font-medium">Elevated latency</p><div className="mt-1.5 space-y-1"><div className="flex justify-between"><span>payment-service</span><span className="text-status-outage font-mono">245ms <span className="text-foreground-muted">(3×)</span></span></div><div className="flex justify-between"><span>checkout-service</span><span className="text-status-blocked font-mono">189ms <span className="text-foreground-muted">(1.6×)</span></span></div><div className="flex justify-between"><span>order-service</span><span className="text-status-blocked font-mono">134ms <span className="text-foreground-muted">(1.5×)</span></span></div></div><p className="mt-1.5 text-foreground-muted">Root cause: DynamoDB read throttling</p></>,
    followUps: ['Show the dependency map', 'Show active alarms', 'How do we fix it?'],
  },
}

function getAIResponse(input) {
  const lower = input.toLowerCase()
  for (const [key, response] of Object.entries(CHAT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return response
  }
  return CHAT_RESPONSES.default
}

const PAGE_CONTEXT = {
  '/console': {
    greeting: <><p className="font-medium">INC-2847 · order-service-memory-high</p><p className="mt-1.5">You acknowledged from your phone. I've been investigating since 2:03 AM — here's what I found. The investigation is loaded on the left.</p><p className="mt-1.5 text-foreground-muted">What would you like to dig into?</p></>,
    prompts: ['Show me the OOM kill logs', 'What are the memory limits set to?', 'Post update to Slack'],
    placeholder: 'Ask about this incident...',
  },
  '/home': {
    greeting: "Welcome. I can help you review your environment, set up monitoring, or answer questions about your services.",
    prompts: ["What's the health of my services?", 'Show me all active alarms', 'Which services have errors?', 'How are my containers doing?'],
    placeholder: 'Ask about your environment...',
  },
  '/investigate': {
    greeting: "I can help you start a new investigation or dig into an existing one. Describe what you're seeing.",
    prompts: ['Why are checkout errors up?', 'Compare pre/post deploy', 'Correlate latency with errors', 'Show OOM events'],
    placeholder: 'Describe what you are investigating...',
  },
  '/explore': {
    greeting: "I can search across metrics, logs, traces, and alarms. What are you looking for?",
    prompts: ['Find high-error services', 'Show unused metrics', 'Search OOM events', 'List active alarms'],
    placeholder: 'Search or ask a question...',
  },
  '/devops-console': {
    greeting: "I'm investigating the Payments service failure. Deploy #847 referenced PaymentsTable-v2 which doesn't exist. 847 payments failed. What would you like to know?",
    prompts: ['Show me the deploy diff', 'Generate post-mortem', 'Send update to Slack'],
    placeholder: 'Ask about this incident...',
  },
  '/monitor': {
    greeting: "I can help you review active alarms, set up new monitors, or analyze alert patterns.",
    prompts: ['Show active alarms', 'Which alarms are noisy?', 'Set up a new alarm', 'Alert trends this week'],
    placeholder: 'Ask about monitoring...',
  },
}

function ChatPanel({ onClose, path, pendingQuery, onQueryConsumed }) {
  const ctx = PAGE_CONTEXT[path] || PAGE_CONTEXT['/home']
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { role: 'ai', text: ctx.greeting }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)
  const pendingHandled = useRef(false)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  useEffect(() => {
    if (pendingQuery && !pendingHandled.current) {
      pendingHandled.current = true
      sendMessage(pendingQuery)
      onQueryConsumed?.()
    }
  }, [pendingQuery])

  const NAV_ACTIONS = {
    'Open investigation dashboard': '/console',
    'Show the investigation': '/console',
  }

  function sendMessage(text) {
    if (NAV_ACTIONS[text]) {
      navigate(NAV_ACTIONS[text])
      onClose()
      return
    }
    setMessages(prev => [...prev, { role: 'user', text }])
    setTyping(true)
    setTimeout(() => {
      const response = getAIResponse(text)
      setMessages(prev => [...prev, { role: 'ai', text: response.text, followUps: response.followUps }])
      setTyping(false)
    }, 800 + Math.random() * 600)
  }

  function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="w-[320px] flex-shrink-0 border-r border-border-muted bg-background-surface-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-muted flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkle size={16} className="text-orange-400" />
          <span className="text-heading-xs font-normal text-foreground">AI Assistant</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background-surface-2 transition-colors" aria-label="Close chat"><X size={14} className="text-foreground-muted" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-body-s ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background-surface-2 text-foreground rounded-bl-sm'}`}>{msg.text}</div>
            </div>
            {msg.followUps && i === messages.length - 1 && !typing && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.followUps.map(p => (
                  <button key={p} onClick={() => sendMessage(p)} className="px-2.5 py-1 rounded-full text-[11px] text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {messages.length === 1 && !typing && (
          <div className="flex flex-wrap gap-1.5">
            {ctx.prompts.map(p => (
              <button key={p} onClick={() => sendMessage(p)} className="px-2.5 py-1 rounded-full text-[11px] text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                {p}
              </button>
            ))}
          </div>
        )}
        {typing && <div className="flex justify-start"><div className="bg-background-surface-2 px-3 py-2 rounded-xl rounded-bl-sm"><span className="text-body-s text-foreground-muted animate-pulse">Thinking...</span></div></div>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-border-muted flex-shrink-0">
        <div className="flex items-center gap-2 h-10 px-3 border border-border-muted rounded-lg bg-input focus-within:border-foreground-disabled focus-within:shadow-ring-default transition-all">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={ctx.placeholder} className="flex-1 min-w-0 bg-transparent outline-none text-body-s text-foreground placeholder-foreground-muted" />
          <button type="submit" disabled={!input.trim()} className={`p-1.5 rounded-md transition-all ${input.trim() ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-foreground-disabled cursor-not-allowed'}`} aria-label="Send"><PaperPlaneRight size={14} /></button>
        </div>
      </form>
    </div>
  )
}

function PersonaCard({ onClose }) {
  const { persona, activeId, setActiveId, personaList } = usePersona()
  const { user, demo, application, services, coverage } = persona
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const serviceTypes = [...new Set(services.map(s => s.aws))]

  return (
    <div ref={ref} className="absolute right-0 top-10 w-[420px] glass-card p-5 z-50 shadow-2xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        {personaList.map(p => (
          <button key={p.id} onClick={() => setActiveId(p.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] transition-colors ${p.id === activeId ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background-surface-1 text-foreground-muted border border-border-muted hover:border-primary/20'}`}>
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-semibold text-primary">{p.user.name.split(' ').map(n => n[0]).join('')}</div>
            {p.user.name.split(' ')[0]}
          </button>
        ))}
      </div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-body-s">{user.name.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <p className="text-body-s font-semibold text-foreground">{user.name}</p>
            <p className="text-[11px] text-foreground-muted">{user.role} · {user.team}</p>
            <p className="text-[11px] text-foreground-disabled">{user.company}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><X size={14} /></button>
      </div>
      <div className="text-[10px] text-primary bg-primary/10 rounded-md px-2 py-1 mb-4 text-center font-medium">Demo persona — this card explains who this user is and why the page shows what it shows</div>
      <Section title="Application">
        <Row label="Name" value={application.name} />
        <Row label="Scale" value={application.description} />
        <Row label="Regions" value={application.regions.join(', ')} />
        <Row label="Accounts" value={`${application.accounts.length} accounts`} />
      </Section>
      <Section title="AWS Services">
        <Row label="Compute" value={demo.awsServiceBreakdown.compute} />
        <Row label="Data" value={demo.awsServiceBreakdown.data} />
        <Row label="Networking" value={demo.awsServiceBreakdown.networking} />
        <Row label="Messaging" value={demo.awsServiceBreakdown.messaging} />
        {demo.awsServiceBreakdown.ai && <Row label="AI/ML" value={demo.awsServiceBreakdown.ai} />}
        {demo.awsServiceBreakdown.storage && <Row label="Storage" value={demo.awsServiceBreakdown.storage} />}
        <Row label="Total" value={`${services.length} services using ${serviceTypes.length} AWS service types`} />
      </Section>
      <Section title="Observability Maturity">
        <Row label="Level" value={demo.observabilityMaturity} />
        <Row label="Detail" value={demo.observabilityDetail} />
        <Row label="Current state" value={`${coverage.withAlarms} alarms, ${coverage.withDashboards} dashboards, ${coverage.withTraces} traces`} />
      </Section>
      <Section title="Spending">
        <Row label="Cohort" value={demo.spendingCohort} />
        <Row label="AWS spend" value={demo.monthlyAWSSpend} />
        <Row label="CW spend" value={demo.cloudWatchSpend} />
      </Section>
      <Section title="Team & Operations">
        <Row label="Team size" value={`${demo.teamSize} engineers`} />
        <Row label="On-call" value={demo.oncallRotation ? 'Yes — rotation active' : 'No'} />
        <Row label="Incident tooling" value={demo.incidentTooling} />
      </Section>
      <Section title="Goals for CloudWatch+">
        <ul className="flex flex-col gap-1 mt-1">
          {demo.goals.map((g, i) => (<li key={i} className="text-[11px] text-foreground-muted flex gap-2"><span className="text-primary">•</span> {g}</li>))}
        </ul>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return <div className="mb-4"><h4 className="text-[10px] text-foreground-disabled uppercase tracking-wider font-semibold mb-2">{title}</h4><div className="flex flex-wrap gap-1.5">{children}</div></div>
}
function Row({ label, value }) {
  return <div className="flex gap-2"><span className="text-[11px] text-foreground-muted w-24 flex-shrink-0">{label}</span><span className="text-[11px] text-foreground">{value}</span></div>
}

export default function ConsoleLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(location.pathname === '/console' || location.pathname === '/devops-console')
  const [pendingQuery, setPendingQuery] = useState(null)
  const [showPersona, setShowPersona] = useState(false)
  const { persona } = usePersona()

  function openChat(query) {
    setPendingQuery(query || null)
    setChatOpen(true)
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="gradient-bg-dark" />
      <div className="content-layer h-full flex w-full">
        {/* Sidebar */}
        <nav className={`${navOpen ? 'w-48' : 'w-14'} border-r border-border-muted flex flex-col flex-shrink-0 overflow-y-auto scrollbar-hide transition-all duration-200`}>
          <div className="px-3 pt-4 pb-3 flex items-center gap-2 cursor-pointer" onClick={() => setNavOpen(!navOpen)}>
            {navOpen
              ? <span className="text-body-s font-semibold text-foreground">CloudWatch<sup className="text-primary text-[14px]">+</sup></span>
              : <List size={20} className="text-foreground-muted mx-auto" />
            }
          </div>

          <div className="px-3 pt-2">
            {navOpen && <span className="text-[10px] font-bold tracking-wider uppercase text-foreground-muted px-2 mb-2 block">Navigation</span>}
            <div className="space-y-0.5">
              {navItems.map(({ icon: Icon, label, subtitle, path, also }) => {
                const active = path && (location.pathname === path || (also && also.includes(location.pathname)))
                return (
                  <button key={label} onClick={() => path && navigate(path)} className={`w-full text-left rounded-lg flex items-start gap-2.5 px-2 py-2 transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-background-surface-2'}`} aria-label={label}>
                    <Icon size={18} className={`flex-shrink-0 mt-0.5 ${active ? 'text-primary' : 'text-foreground-muted'}`} />
                    {navOpen && (
                      <div>
                        <span className={`text-body-s font-medium block leading-tight ${active ? 'text-primary' : 'text-foreground'}`}>{label}</span>
                        <span className="text-[10px] text-foreground-muted leading-tight">{subtitle}</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {navOpen && (
            <>
              <div className="px-3 pt-4">
                <div className="flex items-center gap-1.5 px-2 mb-2">
                  <Star size={10} className="text-foreground-muted" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-foreground-muted">Favorites</span>
                </div>
                <div className="space-y-0.5">
                  {favorites.map(({ label }) => (
                    <button key={label} className="w-full text-left rounded-lg px-2 py-1.5 text-body-s text-foreground-secondary hover:bg-background-surface-2 transition-colors">{label}</button>
                  ))}
                </div>
              </div>

            </>
          )}

          <div className="flex-1" />


          {/* AI Assistant button */}
          <div className="px-3 pb-4">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="w-full flex items-center justify-center gap-2 py-2 transition-all"
              aria-label="AI Assistant"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0ea5e9] via-[#8b5cf6] to-[#f59e0b] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
                  <path d="M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14z" />
                </svg>
              </div>
              {navOpen && <span className="text-body-s font-medium bg-gradient-to-r from-[#0ea5e9] via-[#8b5cf6] to-[#f59e0b] bg-clip-text text-transparent">AI Assistant</span>}
            </button>
          </div>
        </nav>


        {chatOpen && pendingQuery === "__alarms__" && (
          <div className="w-[340px] flex-shrink-0 border-r border-border-muted bg-background-surface-1 flex flex-col overflow-y-auto scrollbar-hide">
            <AlarmRecommendations onClose={() => { setChatOpen(false); setPendingQuery(null) }} />
          </div>
        )}
        {chatOpen && pendingQuery !== "__alarms__" && <ChatPanel onClose={() => { setChatOpen(false); setPendingQuery(null) }} path={location.pathname} pendingQuery={pendingQuery} onQueryConsumed={() => setPendingQuery(null)} />}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 border-b border-border-muted px-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 bg-background-surface-1 rounded-lg px-3 py-1.5 w-80">
              <MagnifyingGlass size={14} className="text-foreground-muted" />
              <span className="text-body-s text-foreground-disabled">Search services, metrics, traces...</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#/" className="text-body-s text-link">← Demos</a>
              <button className="p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted"><GearSix size={16} /></button>
              <button className="relative p-1.5 rounded-lg hover:bg-background-surface-2 text-foreground-muted">
                <Bell size={16} /><div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-outage" />
              </button>
              <div className="relative">
                <button onClick={() => setShowPersona(!showPersona)} className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors text-[10px] font-semibold text-primary">
                  {persona.user.name.split(' ').map(n => n[0]).join('')}
                </button>
                {showPersona && <PersonaCard onClose={() => setShowPersona(false)} />}
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            <ChatContext.Provider value={{ openChat, chatOpen }}>
              <div className="px-4 pt-2">
                <nav className="flex items-center gap-1 text-[11px]">
                  <span className="text-foreground-muted">CloudWatch<sup className="text-primary">+</sup></span>
                  <span className="text-foreground-disabled">/</span>
                  <span className="text-foreground">{
                    {'/home':'Home','/explore':'Explore','/monitor':'Monitor','/investigate':'Investigate','/console':'Investigate / order-service','/devops-console':'Investigate / payments-service','/query':'Explore / Advanced','/configure':'Configure','/day0':'Welcome','/coffee':'Home'}[location.pathname] || 'Home'
                  }</span>
                </nav>
              </div>
              {children}
            </ChatContext.Provider>
          </div>
        </div>

      </div>
    </div>
  )
}
