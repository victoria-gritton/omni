import { useNavigate } from 'react-router-dom'
import { Warning, Moon, Coffee, House, ArrowRight, CheckCircle } from '@phosphor-icons/react'

const flows = [
  {
    id: '2am-sre',
    title: '2AM Flow: SRE',
    subtitle: 'Why is Payments timing out?',
    path: '/watch',
    ready: true,
    preview: 'watch',
  },
  {
    id: '2am-devops',
    title: '2AM Flow: DevOps',
    subtitle: 'Database failover in us-east-1',
    path: null,
    ready: false,
    preview: 'placeholder',
  },
  {
    id: 'coffee',
    title: 'Coffee Flow',
    subtitle: 'Morning health check and SLO review',
    path: null,
    ready: false,
    preview: 'placeholder',
  },
  {
    id: 'home',
    title: 'Home Dashboard',
    subtitle: 'Overview with AI assistant',
    path: '/home',
    ready: true,
    preview: 'home',
  },
  {
    id: 'day0',
    title: 'Day 0 Homepage',
    subtitle: 'First-run onboarding experience',
    path: '/home',
    ready: true,
    preview: 'day0',
  },
]

function WatchPreview() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-[80px] h-[98px] rounded-[20px] border border-border-muted bg-black overflow-hidden flex flex-col p-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[5px] text-white/50">2:03</span>
          <div className="w-1 h-1 rounded-full bg-red-500" />
        </div>
        <div className="flex flex-col items-center flex-1 justify-center">
          <Warning size={12} weight="fill" className="text-red-500 mb-1" />
          <span className="text-[5px] text-red-400 font-bold">CRITICAL</span>
          <span className="text-[5px] text-white mt-0.5 text-center leading-tight">Payment 12× slower</span>
        </div>
        <div className="h-3 rounded-full bg-[#0a84ff] flex items-center justify-center">
          <span className="text-[4px] text-white font-semibold">Acknowledge</span>
        </div>
      </div>
    </div>
  )
}

function HomePreview() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-[120px] h-[80px] rounded-lg border border-border-muted bg-background overflow-hidden flex">
        <div className="w-3 border-r border-border-muted flex flex-col items-center py-1 gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground-muted" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-foreground-disabled" />
        </div>
        <div className="flex-1 p-1.5">
          <div className="h-1.5 w-12 bg-foreground-muted/20 rounded mb-1" />
          <div className="h-2.5 w-full bg-background-surface-1 rounded border border-border-muted mb-1" />
          <div className="flex gap-0.5">
            <div className="h-3 flex-1 bg-background-surface-1 rounded border border-border-muted" />
            <div className="h-3 flex-1 bg-background-surface-1 rounded border border-border-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PlaceholderPreview() {
  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-body-s text-foreground-disabled">Coming soon</span>
    </div>
  )
}

function Day0Preview() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-[120px] h-[80px] rounded-lg border border-border-muted bg-background overflow-hidden flex">
        <div className="w-3 border-r border-border-muted flex flex-col items-center py-1 gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground-muted" />
          <div className="w-1.5 h-1.5 rounded-full bg-foreground-disabled" />
        </div>
        <div className="flex-1 p-1.5 flex flex-col items-center justify-center gap-1">
          <House size={10} className="text-primary" />
          <div className="h-1 w-10 bg-primary/20 rounded" />
          <div className="flex gap-0.5">
            <div className="w-2 h-2 rounded-full border border-status-active/30 flex items-center justify-center">
              <CheckCircle size={4} className="text-status-active" />
            </div>
            <div className="w-2 h-2 rounded-full border border-border-muted" />
            <div className="w-2 h-2 rounded-full border border-border-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center pt-16">
      <div className="gradient-bg-dark" />
      <div className="content-layer flex flex-col items-center gap-8 px-6 w-full max-w-6xl">
        <div className="text-center">
          <svg width="48" height="56" viewBox="0 0 28 32" fill="none" className="mx-auto mb-4">
            <circle cx="14" cy="12" r="9.5" stroke="#475569" strokeWidth="3.5" />
            <rect x="3" y="25" width="22" height="4" rx="2" fill="#0ea5e9" />
          </svg>
          <h1 className="text-heading-xl font-normal tracking-tighter text-foreground">
            CloudWatch Omni
          </h1>
          <p className="text-body-m text-foreground-muted mt-1">Select a flow to demo</p>
        </div>

        <div className="grid grid-cols-4 gap-3 w-full">
          {flows.map((flow) => (
            <button
              key={flow.id}
              onClick={() => flow.path && navigate(flow.path)}
              disabled={!flow.ready}
              className={`text-left rounded-xl border transition-all overflow-hidden ${
                flow.ready
                  ? 'border-border-muted hover:border-primary/40 cursor-pointer'
                  : 'border-border-muted/50 opacity-40 cursor-not-allowed'
              } ${flow.id === '2am-sre' ? 'border-primary/30' : ''}`}
            >
              <div className="h-40 bg-background-surface-1/30">
                {flow.preview === 'watch' && <WatchPreview />}
                {flow.preview === 'home' && <HomePreview />}
                {flow.preview === 'day0' && <Day0Preview />}
                {flow.preview === 'placeholder' && <PlaceholderPreview />}
              </div>
              <div className="p-3">
                <span className="text-body-s font-semibold text-foreground block">{flow.title}</span>
                <span className="text-[11px] text-foreground-muted">{flow.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
