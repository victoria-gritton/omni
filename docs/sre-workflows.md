# SRE Workflows

The SRE's role is shifting from "do the work" to "direct the AI agents." These two workflows show how that plays out across devices.

---

## 🌙 The 2AM Flow — Something's broken, fix it fast

This is the fire drill. The SRE is half-asleep and needs to understand what's wrong, how bad it is, and what to do — in under 5 minutes, without staring at dashboards.

### Watch (first 30 seconds)

**1. Alert hits your wrist.**
Your watch buzzes. No wall of text — just one plain sentence the AI wrote for you:

> "Payment service is 12x slower than normal. 3 other services are affected. Nothing was deployed recently."

**2. You see three things at a glance:**
- How bad is it? (severity)
- How far has it spread? (blast radius)
- What kind of problem is it? (infrastructure, application, or security)

**3. Two buttons: "Got it" or "Wake someone up."**
You tap "Got it" and head to your phone.

### Phone (next 2–5 minutes, still in bed)

**4. Your phone opens an incident brief — not a dashboard.**
The AI has already done the detective work and written it up in plain language:

> "Best guess: the payment service in east-2 ran out of database connections. Memory started spiking at 1:47am. Nothing was deployed in the last 6 hours. Incoming traffic looks normal. Confidence: high."

**5. You see a map of what's affected.**
A simple diagram shows which services are broken, which are struggling, and which are fine. You can see the chain reaction — where the problem started and where it spread.

**6. The AI shows its work.**
It's already been digging through logs, performance data, and request traces. You can see its reasoning step by step — not just "here's the answer" but "here's why I think this." You can trust it or challenge it.

**7. You tell it what to do.**
Tap a button or just say it: "Run the fix for connection pool exhaustion" or "Roll back the last config change." The AI agent executes the playbook.

### Laptop (only if needed)

**8. You open the console and the context is already there.**
No starting from scratch. Everything the AI found on your phone is waiting for you — the timeline, the hypothesis, the affected services.

**9. Need to dig deeper? The AI writes the queries for you.**
Instead of hand-typing complex search queries at 2AM, the AI suggests them. You review, tweak if needed, and run.

**10. Problem solved. AI writes the post-mortem draft.**
Once the fix is confirmed, the AI generates a first draft of the incident report — pre-filled with the timeline, what signals it found, and the root cause. You edit and publish, not write from scratch.

---

## ☕ The Coffee Flow — Nothing's on fire, make things better

This is the morning routine. The SRE has coffee, no active incidents, and wants to understand the health of their systems, catch problems before they become 2AM pages, and chip away at reliability debt.

### Phone (commute or morning scroll)

**1. Daily health digest lands in your feed.**
The AI summarizes overnight activity in plain language:

> "Quiet night. Two auto-resolved warnings on the search service (brief CPU spikes, self-corrected). Payment service error rate crept up 0.3% over the past week — not alerting yet, but trending."

**2. You see what's trending, not just what's broken.**
The AI highlights slow-moving patterns that haven't triggered alerts yet — the kind of things that become 2AM problems if ignored. Think of it as a weather forecast for your systems.

**3. Quick actions from your phone.**
- "Show me the payment error trend" → opens a chart
- "Create a ticket to investigate" → files it with context pre-filled
- "Remind me Friday" → snoozes it

### Laptop (at your desk)

**4. Service health overview — not a wall of dashboards.**
The console opens to a prioritized view: what needs attention, what's healthy, what's changed. AI ranks services by risk, not just current status.

**5. Proactive investigation.**
You pick a trending issue from the digest. The AI has already gathered related signals:

> "Payment error rate increase correlates with a gradual memory leak in payment-service-west-1. Started 5 days ago after deploy #4821. No customer impact yet, but projected to hit alert threshold in ~3 days."

**6. You explore the dependency map.**
Not because something's broken — because you want to understand. Which services depend on what? Where are the single points of failure? The AI annotates the map with risk scores.

**7. Reliability improvements.**
The AI suggests concrete actions based on patterns it's seen:

> "This service has had 3 connection pool incidents in 60 days. Suggested: increase pool size from 50 to 100, add circuit breaker on the database call, create a runbook for this failure mode."

You review, approve, and either apply the fix or create a task for it.

**8. SLO check-in.**
Plain language summary of your service level objectives:

> "5 of 6 SLOs are healthy. The search service latency SLO has burned 40% of its monthly error budget in 10 days — on pace to breach by the 22nd."

The AI suggests where to focus engineering effort to protect the budget.

**9. Post-mortem follow-ups.**
The AI tracks action items from past incidents and nudges you:

> "2 of 5 action items from last week's database incident are still open. The connection pool fix was deployed but the monitoring gap hasn't been addressed."

---

## Key principle: AI does the legwork, humans make the calls

In both flows, the pattern is the same:
- The AI gathers signals, correlates data, and forms hypotheses
- The AI explains its reasoning so you can trust or challenge it
- The human decides what to do — the AI executes
- No blank dashboards, no manual query construction, no starting from zero
