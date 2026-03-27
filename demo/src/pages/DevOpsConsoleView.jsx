import { useState } from 'react'
import {
  WarningCircle, CheckCircle, Lightning,
  ArrowClockwise, Copy, Play, CaretDown, CaretUp
} from '@phosphor-icons/react'

const devopsIncident = {
  title: 'Payments service is failing',
  summary: 'Deploy #847 introduced a reference to PaymentsTable-v2 which does not exist. 12% error rate \u2014 customers cannot complete checkout.',
  brief: {
    hypothesis: 'Deploy #847 landed at 01:45 AM. The new code references a DynamoDB table called PaymentsTable-v2 that does not exist in this account. The old table PaymentsTable is healthy \u2014 the new code just is not pointing to it. ~800 failed payment attempts, all retryable, no data corruption.',
    confidence: 'high',
    rootCauseType: 'Bad deploy \u2014 missing infrastructure',
  },
  timeline: [
    { time: '1:45 AM', event: 'Deploy #847 lands \u2014 Raj Patel merged table migration code', type: 'signal' },
    { time: '1:52 AM', event: 'Error rate spikes from 0.1% to 12% on /process-payment', type: 'alert' },
    { time: '1:55 AM', event: 'DynamoDB latency elevated (consequence, not cause)', type: 'signal' },
    { time: '2:03 AM', event: 'Payment gateway downstream still healthy', type: 'signal' },
    { time: '2:07 AM', event: 'Critical alert fired \u2014 HIGH SEVERITY', type: 'alert' },
    { time: '2:09 AM', event: 'Rollback to deploy #846 initiated', type: 'signal' },
    { time: '2:14 AM', event: 'Alarm cleared \u2014 error rate back to 0.2%', type: 'signal' },
  ],
  reasoning: [
    { step: 1, action: 'Checked recent deployments', result: 'Deploy #847 landed 22 min ago \u2014 correlates with error spike', status: 'found' },
    { step: 2, action: 'Analyzed error logs', result: 'ResourceNotFoundException: Table PaymentsTable-v2 does not exist', status: 'found' },
    { step: 3, action: 'Checked infrastructure state', result: 'Terraform change to create PaymentsTable-v2 not yet applied', status: 'found' },
    { step: 4, action: 'Verified downstream services', result: 'Payment gateway healthy \u2014 not affected', status: 'clear' },
    { step: 5, action: 'Checked for data corruption', result: 'No duplicate charges, all failures returned clean 500 errors', status: 'clear' },
  ],
  suggestedQueries: [
    { label: 'Error rate by endpoint', query: 'SELECT COUNT(*) as errors\nFROM PaymentsService.Logs\nWHERE statusCode >= 500\nGROUP BY endpoint\nORDER BY errors DESC' },
    { label: 'Deploy #847 change diff', query: "SELECT commit, author, message, files_changed\nFROM Deployments\nWHERE deploy_id = '847'\nLIMIT 1" },
  ],
}

function DependencyMap() {
  return (
    <svg viewBox="0 0 280 180" className="w-full" fill="none">
      <line x1="140" y1="42" x2="50" y2="110" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.4">
        <animate attributeName="strokeDasharray" values="0 4 4 0;4 4" dur="1.5s" repeatCount="indefinite" />
      </line>
      <line x1="140" y1="42" x2="140" y2="100" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3">
        <animate attributeName="strokeDashoffset" values="0;-6" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1="140" y1="42" x2="230" y2="110" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
      <circle cx="140" cy="30" r="22" fill="#0a0e1a" stroke="#ef4444" strokeWidth="2">
        <animate attributeName="strokeOpacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="140" y="34" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="monospace">12%</text>
      <circle cx="158" cy="14" r="7" fill="#ef4444" />
      <text x="158" y="17.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">!</text>
      <text x="140" y="62" textAnchor="middle" fill="white" fillOpacity="0.8" fontSize="9" fontWeight="500">Payments</text>
      <circle cx="50" cy="115" r="18" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="50" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">slow</text>
      <text x="50" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">DynamoDB</text>
      <circle cx="230" cy="115" r="18" fill="#0a0e1a" stroke="#22c55e" strokeWidth="1.5" />
      <text x="230" y="119" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="600" fontFamily="monospace">ok</text>
      <text x="230" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Gateway</text>
      <circle cx="140" cy="115" r="18" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="140" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">1.8s</text>
      <text x="140" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Checkout</text>
    </svg>
  )
}

function QueryCard({ query }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(query.query)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-heading-xs font-normal text-foreground">{query.label}</span>
        <div className="flex gap-1">
          <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-background-surface-2 transition-colors" aria-label="Copy">
            {copied ? <CheckCircle size={14} className="text-status-active" /> : <Copy size={14} className="text-foreground-muted" />}
          </button>
          <button className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" aria-label="Run">
            <Play size={14} className="text-primary" />
          </button>
        </div>
      </div>
      <pre className="text-pre font-mono bg-background-surface-2/40 rounded-lg p-3 text-foreground-secondary overflow-x-auto">{query.query}</pre>
    </div>
  )
}

export default function DevOpsConsoleView() {
  const [showReasoning, setShowReasoning] = useState(true)
  const [remediating, setRemediating] = useState(false)
  const [remediated, setRemediated] = useState(false)

  function handleRemediate() {
    setRemediating(true)
    setTimeout(() => { setRemediating(false); setRemediated(true) }, 2000)
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-6 py-6">
        <h1 className="text-heading-xl font-normal tracking-tighter text-foreground mb-1">
          {devopsIncident.title}
        </h1>
        <p className="text-body-m text-foreground-secondary mb-6">
          {devopsIncident.summary}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-3">
            <div className="ai-glass-card p-4 space-y-3">
              <span className="text-body-s font-semibold text-orange-400">AI analysis</span>
              <p className="text-body-m text-foreground leading-relaxed">{devopsIncident.brief.hypothesis}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-body-s text-foreground-muted">Confidence</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-active/10 border border-status-active/20 text-[10px] font-semibold text-status-active">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body-s text-foreground-muted">Root cause</span>
                  <span className="text-body-s text-foreground">{devopsIncident.brief.rootCauseType}</span>
                </div>
              </div>
              <div className="border-t border-border-muted pt-3 mt-1">
                <span className="text-heading-xs font-normal text-link block mb-1.5">Auto-remediation authorized</span>
                <p className="text-body-s text-foreground-muted mb-3">You pre-approved this fix: Roll back to deploy #846 to restore the working table reference immediately.</p>
                <div className="flex justify-end">
                  {!remediated ? (
                    <button onClick={handleRemediate} disabled={remediating} className="inline-flex items-center justify-center h-8 px-4 gap-2 rounded-lg bg-primary border border-white/10 text-body-s font-medium text-primary-foreground hover:bg-slate-200 active:bg-slate-300 transition-all">
                      {remediating ? (<><ArrowClockwise size={14} className="animate-spin" />Rolling back...</>) : (<><Lightning size={14} />Roll Back Deploy #847</>)}
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 h-8 px-4 rounded-lg bg-status-active/10 border border-status-active/20">
                      <CheckCircle size={14} className="text-status-active" weight="fill" />
                      <span className="text-body-s text-status-active font-medium">Rolled back to #846</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <button onClick={() => setShowReasoning(!showReasoning)} className="flex items-center justify-between w-full mb-3">
                <span className="text-heading-s font-normal text-foreground">How AI reached this conclusion</span>
                {showReasoning ? <CaretUp size={14} className="text-foreground-muted" /> : <CaretDown size={14} className="text-foreground-muted" />}
              </button>
              {showReasoning && (
                <div className="space-y-0">
                  {devopsIncident.reasoning.map((step) => (
                    <div key={step.step} className="flex items-start gap-3 py-3 border-b border-border-muted last:border-0">
                      <div className="mt-0.5">{step.status === 'found' ? <WarningCircle size={16} className="text-status-blocked" /> : <CheckCircle size={16} className="text-status-active" />}</div>
                      <div>
                        <span className="text-body-s text-foreground font-semibold block">{step.action}</span>
                        <span className="text-body-s text-foreground-muted">{step.result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-heading-s font-normal text-foreground mb-3">Suggested queries</h3>
              <div className="space-y-3">{devopsIncident.suggestedQueries.map((q, i) => (<QueryCard key={i} query={q} />))}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="glass-card p-4">
              <h3 className="text-heading-s font-normal text-foreground mb-2">Service map</h3>
              <DependencyMap />
            </div>
            <div className="glass-card p-4">
              <h3 className="text-heading-s font-normal text-foreground mb-3">Timeline</h3>
              {devopsIncident.timeline.map((item, i) => {
                const isAlert = item.type === 'alert'
                const isLast = i === devopsIncident.timeline.length - 1
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${isAlert ? 'bg-status-outage' : 'bg-primary'}`} />
                      {!isLast && <div className="w-px flex-1 bg-border-muted mt-1" />}
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] text-foreground-muted block">{item.time}</span>
                      <span className="text-body-s text-foreground">{item.event}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
