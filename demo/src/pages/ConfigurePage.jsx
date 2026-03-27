import {
  GearSix, Bell, Globe, Shield, Key, Database,
  Users, Link, ArrowRight, CheckCircle, Warning
} from '@phosphor-icons/react'

const configSections = [
  {
    title: 'Monitoring',
    items: [
      { icon: Bell, label: 'Alarm configuration', description: '34 active alarms, 12 in ALARM state', status: 'warning' },
      { icon: Globe, label: 'Regions & accounts', description: '3 regions, 2 accounts connected', status: 'healthy' },
      { icon: Database, label: 'Data retention', description: 'Metrics: 15 months, Logs: 30 days', status: 'healthy' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { icon: Link, label: 'SNS notifications', description: '4 topics configured, Slack + PagerDuty', status: 'healthy' },
      { icon: Users, label: 'Team access', description: '8 team members, 3 roles', status: 'healthy' },
      { icon: Key, label: 'API keys & tokens', description: '2 active keys, 1 expiring in 7 days', status: 'warning' },
    ],
  },
  {
    title: 'Security',
    items: [
      { icon: Shield, label: 'IAM permissions', description: 'CloudWatch full access, read-only for 3 users', status: 'healthy' },
      { icon: Key, label: 'Encryption', description: 'KMS encryption enabled for all log groups', status: 'healthy' },
    ],
  },
]

export default function ConfigurePage() {
  return (
    <div className="px-6 py-6">
      <h1 className="text-[22px] leading-[28px] font-normal tracking-tighter text-foreground mb-1">
        Configure
      </h1>
      <p className="text-body-m text-foreground-muted mb-4">
        Settings and resource management
      </p>

      <div className="space-y-6">
        {configSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-heading-s font-normal text-foreground mb-3">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-primary/20 transition-colors"
                    style={{ borderColor: 'rgba(51,65,85,0.2)' }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-background-surface-2 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-foreground-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-body-s font-medium text-foreground block">{item.label}</span>
                      <span className="text-body-s text-foreground-muted">{item.description}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.status === 'warning' && (
                        <Warning size={14} className="text-status-blocked" />
                      )}
                      {item.status === 'healthy' && (
                        <CheckCircle size={14} className="text-status-active" />
                      )}
                      <ArrowRight size={14} className="text-foreground-disabled" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
