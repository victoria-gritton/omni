import { useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'

export default function DevOpsConsoleView() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">
            Payments Service Incident
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-status-active/10 border border-status-active/20 text-[10px] font-semibold text-status-active">
            RESOLVED
          </span>
          <span className="ml-auto text-body-s text-foreground-muted">01:52 AM -- 02:14 AM / 22 min</span>
        </div>

        <div className="flex gap-4 mt-4">
          {/* Left sidebar */}
          <div className="w-[180px] flex-shrink-0 space-y-5">
            <div>
              <h4 className="text-[9px] text-foreground-disabled uppercase tracking-wider font-semibold mb-2">Incident Timeline</h4>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/10 text-primary text-body-s"><div className="w-1.5 h-1.5 rounded-full bg-status-outage" /> 01:52 -- Alarm fired</div>
                <div className="flex items-center gap-2 px-2 py-1.5 text-body-s text-foreground-secondary"><div className="w-1.5 h-1.5 rounded-full bg-status-blocked" /> 01:45 -- Deploy #847</div>
                <div className="flex items-center gap-2 px-2 py-1.5 text-body-s text-foreground-secondary"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> 02:09 -- Rollback started</div>
                <div className="flex items-center gap-2 px-2 py-1.5 text-body-s text-foreground-secondary"><div className="w-1.5 h-1.5 rounded-full bg-status-active" /> 02:14 -- Alarm cleared</div>
              </div>
            </div>
            <div>
              <h4 className="text-[9px] text-foreground-disabled uppercase tracking-wider font-semibold mb-2">Affected Resources</h4>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 px-2 py-1.5 text-body-s text-foreground-secondary"><div className="w-1.5 h-1.5 rounded-full bg-status-outage" /> PaymentsLambda</div>
                <div className="flex items-center gap-2 px-2 py-1.5 text-body-s text-foreground-secondary"><div className="w-1.5 h-1.5 rounded-full bg-status-blocked" /> PaymentsTable (DDB)</div>
                <div className="flex items-center gap-2 px-2 py-1.5 text-body-s text-foreground-secondary"><div className="w-1.5 h-1.5 rounded-full bg-status-active" /> PaymentGateway API</div>
              </div>
            </div>
            <div>
              <h4 className="text-[9px] text-foreground-disabled uppercase tracking-wider font-semibold mb-2">Related</h4>
              <div className="space-y-0.5">
                <div className="px-2 py-1.5 text-body-s text-foreground-secondary hover:text-foreground cursor-pointer">Follow-up task</div>
                <div className="px-2 py-1.5 text-body-s text-foreground-secondary hover:text-foreground cursor-pointer">Slack thread</div>
                <div className="px-2 py-1.5 text-body-s text-foreground-secondary hover:text-foreground cursor-pointer">Deploy #847 diff</div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-3">
            {/* Agent Summary */}
            <div className="ai-glass-card p-4">
              <span className="text-body-s font-semibold text-orange-400">Agent Summary</span>
              <p className="text-body-m text-foreground leading-relaxed mt-2">
                Deploy #847 introduced a reference to <strong>PaymentsTable-v2</strong> which doesn't exist. The Terraform change to create the table hasn't been applied yet -- the code shipped before the infrastructure. Rolled back to deploy #846 at 02:09 AM. Service recovered by 02:14 AM. <strong>847 payment attempts failed</strong>, all retryable, no data corruption.
              </p>
            </div>

            {/* Error Rate + Service Map row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4">
                <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  Error Rate
                </h3>
                <div className="h-[80px] rounded-lg overflow-hidden bg-background-surface-2/30">
                  <svg width="100%" height="100%" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <defs><linearGradient id="eg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></linearGradient></defs>
                    <path d="M0,78 L80,78 L100,78 L140,78 L160,75 L180,40 L200,15 L220,20 L240,18 L260,22 L280,35 L300,55 L320,70 L340,76 L360,78 L400,78" fill="url(#eg2)" stroke="none"/>
                    <path d="M0,78 L80,78 L100,78 L140,78 L160,75 L180,40 L200,15 L220,20 L240,18 L260,22 L280,35 L300,55 L320,70 L340,76 L360,78 L400,78" fill="none" stroke="#ef4444" strokeWidth="2"/>
                    <line x1="130" y1="0" x2="130" y2="80" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" opacity="0.7"/>
                    <text x="134" y="10" fill="#f59e0b" fontSize="7" fontFamily="sans-serif">Deploy #847</text>
                    <line x1="290" y1="0" x2="290" y2="80" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,3" opacity="0.7"/>
                    <text x="294" y="10" fill="#22c55e" fontSize="7" fontFamily="sans-serif">Rollback</text>
                  </svg>
                </div>
              </div>
              <div className="glass-card p-4">
                <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                  Service Map
                </h3>
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-status-outage/20 border-2 border-status-outage flex items-center justify-center mx-auto mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    </div>
                    <span className="text-[9px] text-foreground-muted">Payments</span>
                  </div>
                  <span className="text-foreground-disabled text-xs">&#8594;</span>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-status-blocked/20 border-2 border-status-blocked flex items-center justify-center mx-auto mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>
                    </div>
                    <span className="text-[9px] text-foreground-muted">DynamoDB</span>
                  </div>
                  <span className="text-foreground-disabled text-xs">&#8594;</span>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-status-active/20 border-2 border-status-active flex items-center justify-center mx-auto mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M3 21V5a2 2 0 012-2h14a2 2 0 012 2v16"/><path d="M3 10h18"/><rect x="7" y="14" width="3" height="4"/><rect x="14" y="14" width="3" height="4"/></svg>
                    </div>
                    <span className="text-[9px] text-foreground-muted">Gateway</span>
                  </div>
                </div>
                <p className="text-[10px] text-foreground-muted text-center mt-1">DynamoDB latency was a consequence, not the cause</p>
              </div>
            </div>

            {/* Impact Summary + Root Cause Chain row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4">
                <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Impact Summary
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg bg-background-surface-2/30">
                    <div className="text-lg font-bold text-status-outage">847</div>
                    <div className="text-[9px] text-foreground-muted">Failed Payments</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background-surface-2/30">
                    <div className="text-lg font-bold text-status-blocked">22 min</div>
                    <div className="text-[9px] text-foreground-muted">Duration</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background-surface-2/30">
                    <div className="text-lg font-bold text-status-active">0</div>
                    <div className="text-[9px] text-foreground-muted">Data Loss</div>
                  </div>
                </div>
                <p className="text-body-s text-foreground-muted">All 847 failures returned clean 500 errors. Customers saw "payment failed, please retry." No duplicate charges.</p>
              </div>
              <div className="glass-card p-4">
                <h3 className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  Root Cause Chain
                </h3>
                <div className="space-y-2 text-body-s">
                  <div className="flex gap-2"><span className="text-status-blocked font-bold w-4">1</span><span className="text-foreground">Raj Patel merged commit <code className="text-[10px] px-1.5 py-0.5 rounded bg-background-surface-2 text-status-outage">a3f7c2d</code> at 5:47 PM</span></div>
                  <div className="flex gap-2"><span className="text-status-blocked font-bold w-4">2</span><span className="text-foreground">Code changed table ref: PaymentsTable &#8594; PaymentsTable-v2</span></div>
                  <div className="flex gap-2"><span className="text-status-blocked font-bold w-4">3</span><span className="text-foreground">Terraform to create PaymentsTable-v2 not yet applied</span></div>
                  <div className="flex gap-2"><span className="text-status-blocked font-bold w-4">4</span><span className="text-foreground">Deploy #847 went live at 01:45 AM</span></div>
                  <div className="flex gap-2"><span className="text-status-outage font-bold w-4">5</span><span className="text-foreground">Every request to new code path &#8594; ResourceNotFoundException</span></div>
                </div>
              </div>
            </div>

            {/* Suggested Next Steps */}
            <div className="glass-card p-4 border-status-active/20">
              <div className="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>
                <span className="text-body-s font-semibold text-status-active">Suggested Next Steps</span>
              </div>
              <div className="text-body-s text-foreground-secondary leading-relaxed">
                1. Apply the Terraform change to create PaymentsTable-v2 before redeploying<br/>
                2. Add a deployment gate that validates referenced resources exist<br/>
                3. Consider a feature flag for the table migration cutover
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
