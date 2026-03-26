import { Star } from '@phosphor-icons/react'
import Card from './ui/card'

const stats = [
  { key: 'requests', label: 'Requests', value: '165.6K', change: '[+0.5K]', changeColor: 'text-foreground-muted' },
  { 
    key: 'faults',
    label: 'Faults (5kx)', 
    value: '10.7K', 
    changes: ['(6.5%) [+2]', '[+3.7K]'], 
    changeColors: ['text-foreground-muted', 'text-foreground-muted'] 
  },
  { 
    key: 'errors',
    label: 'Errors (4xx)', 
    value: '984', 
    changes: ['(0.6%) [+0]', '[+0.8%]'], 
    changeColors: ['text-foreground-muted', 'text-foreground-muted'] 
  },
  { key: 'availability', label: 'Availability', value: '93.5%', change: '[-0.2%]', changeColor: 'text-foreground-muted' },
  { key: 'latency', label: 'Latency p99', value: '13.7 sec', change: '[+9.6%]', changeColor: 'text-foreground-muted' },
  { 
    key: 'sli',
    label: 'SLI Health', 
    value: '4/7', 
    change: 'unhealthy', 
    changeColor: 'text-foreground-muted',
    hasIcon: true 
  }
]

export { stats as statsItems }

function StatCard({ stat, isDark, className, style, hideLabel }) {
  return (
    <div className={className} style={style}>
      {!hideLabel && (
        <h4 className={`text-heading-s font-normal ${isDark ? 'text-foreground-secondary' : 'text-gray-600'} mb-1`}>
          {stat.label}
        </h4>
      )}
      <div className="flex items-center gap-1.5 mb-0.5">
        {stat.hasIcon && (
          <Star size={14} weight="fill" className={isDark ? 'text-amber-300' : 'text-amber-500'} />
        )}
        <span className={`text-4xl font-semibold ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
          {stat.value}
        </span>
      </div>
      {stat.changes ? (
        <>
          {stat.changes.map((change, i) => (
            <div key={i} className={`text-sm font-medium ${isDark ? stat.changeColors[i] : 'text-gray-500'}`}>
              {change}
            </div>
          ))}
        </>
      ) : (
        <div className={`text-sm font-medium ${isDark ? stat.changeColor : 'text-gray-500'}`}>
          {stat.change}
        </div>
      )}
    </div>
  )
}

export { StatCard }

export default function StatsRow({ isDark, only }) {
  if (only) {
    const stat = stats.find(s => s.key === only)
    if (!stat) return null
    return <StatCard stat={stat} isDark={isDark} hideLabel />
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {stats.map((stat, index) => (
        <Card key={index} variant="metric" isDark={isDark} className="p-2 min-h-[120px]">
          <StatCard stat={stat} isDark={isDark} />
        </Card>
      ))}
    </div>
  )
}
