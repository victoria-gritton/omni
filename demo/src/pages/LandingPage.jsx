import { useNavigate } from 'react-router-dom'
import { Moon, Coffee, House, ArrowRight } from '@phosphor-icons/react'

const flows = [
  {
    id: '2am-sre',
    icon: Moon,
    title: '2AM Flow: SRE',
    description: 'Watch → Phone → Console. Incident response from bed.',
    path: '/watch',
    ready: true,
  },
  {
    id: '2am-devops',
    icon: Moon,
    title: '2AM Flow: DevOps',
    description: 'Coming soon.',
    path: null,
    ready: false,
  },
  {
    id: 'coffee',
    icon: Coffee,
    title: 'Coffee Flow',
    description: 'Morning proactive review. Coming soon.',
    path: null,
    ready: false,
  },
  {
    id: 'home',
    icon: House,
    title: 'Home Dashboard',
    description: 'Console overview with AI chat.',
    path: '/home',
    ready: true,
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="gradient-bg-dark" />
      <div className="content-layer flex flex-col items-center gap-8 px-6">
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

        <div className="grid grid-cols-2 gap-3 max-w-xl w-full">
          {flows.map((flow) => {
            const Icon = flow.icon
            return (
              <button
                key={flow.id}
                onClick={() => flow.path && navigate(flow.path)}
                disabled={!flow.ready}
                className={`text-left p-4 rounded-xl border transition-all ${
                  flow.ready
                    ? 'border-border-muted hover:border-primary/40 hover:bg-primary/5 cursor-pointer'
                    : 'border-border-muted/50 opacity-40 cursor-not-allowed'
                } ${flow.id === '2am-sre' ? 'border-primary/30 bg-primary/5' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={20} className={flow.id === '2am-sre' ? 'text-primary' : 'text-foreground-muted'} />
                  {flow.ready && <ArrowRight size={14} className="text-foreground-muted" />}
                </div>
                <span className="text-body-s font-semibold text-foreground block">{flow.title}</span>
                <span className="text-body-s text-foreground-muted">{flow.description}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
