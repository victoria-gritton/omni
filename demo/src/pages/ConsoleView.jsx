import { useState } from 'react'
import {
  Warning, WarningCircle, CheckCircle, Lightning,
  ArrowClockwise, Copy, Play, CaretDown, CaretUp,
  Clock, ArrowRight, FileText
} from '@phosphor-icons/react'
import { incident } from '../data/incident'

function StatusBadge({ status }) {
  const config = {
    critical: { bg: 'bg-status-outage/10', border: 'border-status-outage/20', text: 'text-status-outage', label: 'Critical' },
    degraded: { bg: 'bg-status-blocked/10', border: 'border-status-blocked/20', text: 'text-status-blocked', label: 'Degraded' },
    healthy: { bg: 'bg-status-active/10', border: 'border-status-active/20', text: 'text-status-active', label: 'Healthy' },
  }
  const c = config[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} border ${c.border} ${c.text}`}>
      {c.label}
    </span>
  )
}

function DependencyMap() {
  const services = incident.services
  const critical = services.filter(s => s.status === 'critical')
  const degraded = services.filter(s => s.status === 'degraded')
  const healthy = services.filter(s => s.status === 'healthy')

  return (
    <svg viewBox="0 0 280 180" className="w-full" fill="none">
      {/* Lines */}
      <line x1="140" y1="42" x2="50" y2="110" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.4">
        <animate attributeName="strokeDasharray" values="0 4 4 0;4 4" dur="1.5s" repeatCount="indefinite" />
      </line>
      <line x1="140" y1="46" x2="140" y2="100" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3">
        <animate attributeName="strokeDashoffset" values="0;-6" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1="140" y1="42" x2="230" y2="110" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3">
        <animate attributeName="strokeDashoffset" values="0;-6" dur="1s" repeatCount="indefinite" />
      </line>

      {/* Root — payment */}
      <circle cx="140" cy="30" r="22" fill="#0a0e1a" stroke="#ef4444" strokeWidth="2">
        <animate attributeName="strokeOpacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="30" r="24" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeOpacity="0.2">
        <animate attributeName="r" values="24;28;24" dur="2s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="140" y="34" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="monospace">2.4s</text>
      <circle cx="158" cy="14" r="7" fill="#ef4444" />
      <text x="158" y="17.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">3</text>
      <text x="140" y="62" textAnchor="middle" fill="white" fillOpacity="0.8" fontSize="9" fontWeight="500">Payment</text>

      {/* Degraded */}
      <circle cx="50" cy="115" r="18" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="50" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">1.8s</text>
      <circle cx="65" cy="101" r="3.5" fill="#f59e0b" />
      <text x="50" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Checkout</text>

      <circle cx="140" cy="115" r="18" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="140" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">900ms</text>
      <circle cx="155" cy="101" r="3.5" fill="#f59e0b" />
      <text x="140" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Order</text>

      <circle cx="230" cy="115" r="18" fill="#0a0e1a" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="230" y="119" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">600ms</text>
      <circle cx="245" cy="101" r="3.5" fill="#f59e0b" />
      <text x="230" y="142" textAnchor="middle" fill="white" fillOpacity="0.6" fontSize="8">Inventory</text>

      {/* Healthy cluster */}
      <circle cx="260" cy="30" r="12" fill="#0a0e1a" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.5" />
      <text x="260" y="34" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">3</text>
      <circle cx="269" cy="22" r="3" fill="#22c55e" fillOpacity="0.8" />
      <text x="260" y="50" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="8">Healthy</text>
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
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-background-surface-2 transition-colors duration-hover"
            aria-label="Copy query"
          >
            {copied
              ? <CheckCircle size={14} className="text-status-active" />
              : <Copy size={14} className="text-foreground-muted" />
            }
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors duration-hover"
            aria-label="Run query"
          >
            <Play size={14} className="text-primary" />
          </button>
        </div>
      </div>
      <pre className="text-pre font-mono bg-background-surface-2/40 rounded-lg p-3 text-foreground-secondary overflow-x-auto">
        {query.query}
      </pre>
    </div>
  )
}

export default function ConsoleView() {
  const [showReasoning, setShowReasoning] = useState(true)
  const [remediating, setRemediating] = useState(null)
  const [remediated, setRemediated] = useState(false)
  const [postMortem, setPostMortem] = useState(false)

  function handleRemediate(id) {
    setRemediating(id)
    setTimeout(() => {
      setRemediating(null)
      setRemediated(true)
    }, 2000)
  }

  return (
    <>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-heading-xl font-normal tracking-tighter text-foreground mb-1">
              {incident.title}
            </h1>
            <p className="text-body-m text-foreground-secondary mb-6">
              {incident.summary}
            </p>

            {/* Post-mortem banner */}
            {postMortem && (
              <div className="ai-glass-card p-4 mb-6">
                <span className="text-heading-s font-normal text-foreground block mb-1">
                  Post-mortem draft generated
                </span>
                <p className="text-body-s text-foreground-secondary">
                  AI drafted a post-mortem with timeline, root cause, and action items from this incident. Review and edit before publishing.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Left column — 2 cols wide */}
              <div className="lg:col-span-2 space-y-3">
                {/* AI Brief */}
                <div className="ai-glass-card p-4 space-y-3">
                  <span className="text-body-s font-semibold text-orange-400">AI analysis</span>
                  <p className="text-body-m text-foreground leading-relaxed">
                    {incident.brief.hypothesis}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-body-s text-foreground-muted">Confidence</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-active/10 border border-status-active/20 text-[10px] font-semibold text-status-active">
                        High
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-body-s text-foreground-muted">Root cause</span>
                      <span className="text-body-s text-foreground">{incident.brief.rootCauseType}</span>
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="glass-card p-4">
                  <button
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <span className="text-heading-s font-normal text-foreground">
                      How AI reached this conclusion
                    </span>
                    {showReasoning
                      ? <CaretUp size={14} className="text-foreground-muted" />
                      : <CaretDown size={14} className="text-foreground-muted" />
                    }
                  </button>
                  {showReasoning && (
                    <div className="space-y-0">
                      {incident.reasoning.map((step) => (
                        <div key={step.step} className="flex items-start gap-3 py-3 border-b border-border-muted last:border-0">
                          <div className="mt-0.5">
                            {step.status === 'found'
                              ? <WarningCircle size={16} className="text-status-blocked" />
                              : <CheckCircle size={16} className="text-status-active" />
                            }
                          </div>
                          <div>
                            <span className="text-body-s text-foreground font-semibold block">{step.action}</span>
                            <span className="text-body-s text-foreground-muted">{step.result}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested Queries */}
                <div>
                  <h3 className="text-heading-s font-normal text-foreground mb-3">
                    Suggested queries
                  </h3>
                  <div className="space-y-3">
                    {incident.suggestedQueries.map((q, i) => (
                      <QueryCard key={i} query={q} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-3">
                {/* Dependency Map */}
                <div className="glass-card p-4">
                  <h3 className="text-heading-s font-normal text-foreground mb-2">
                    Service map
                  </h3>
                  <DependencyMap />
                </div>

                {/* Timeline */}
                <div className="glass-card p-4">
                  <h3 className="text-heading-s font-normal text-foreground mb-3">
                    Timeline
                  </h3>
                  {incident.timeline.map((item, i) => {
                    const isAlert = item.type === 'alert'
                    const isLast = i === incident.timeline.length - 1
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

                {/* Remediation */}
                <div className="glass-card p-4">
                  <h3 className="text-heading-s font-normal text-foreground mb-3">
                    Remediation
                  </h3>
                  {remediated ? (
                    <div className="p-3 rounded-lg bg-status-active/8 border border-status-active/20 flex items-center gap-2">
                      <CheckCircle size={16} className="text-status-active" weight="bold" />
                      <span className="text-body-s text-status-active font-semibold">
                        Fix applied successfully
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {incident.remediations.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleRemediate(r.id)}
                          disabled={remediating !== null}
                          className={`w-full text-left p-3 rounded-lg border transition-all duration-hover ${
                            remediating === r.id
                              ? 'bg-primary/10 border-primary/30'
                              : 'bg-background-surface-1/50 border-border-muted hover:border-primary/30 hover:bg-primary/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Lightning size={14} className="text-primary" />
                              <span className="text-body-s text-foreground font-semibold">{r.label}</span>
                            </div>
                            {remediating === r.id ? (
                              <ArrowClockwise size={14} className="text-primary animate-spin" />
                            ) : (
                              <ArrowRight size={14} className="text-foreground-muted" />
                            )}
                          </div>
                          <p className="text-body-s text-foreground-muted mt-1 ml-5">{r.description}</p>
                          <span className={`text-[10px] font-semibold mt-1.5 ml-5 inline-block ${
                            r.risk === 'low' ? 'text-status-active' : 'text-status-blocked'
                          }`}>
                            {r.risk} risk
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
    </>
  )
}
