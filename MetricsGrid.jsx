import DonutChart from './ui/donut-chart'
import DependencyList from './DependencyList'
import Card from './ui/card'

const cards = [
  {
    key: 'operations',
    title: 'Operations (38)',
    subtitle: 'SLI Health',
    content: (isDark) => (
      <DonutChart 
        data={[
          { label: 'Healthy (5)', value: 141, color: 'rgb(52, 211, 153)' },
          { label: 'Unhealthy (3)', value: 47, color: 'rgb(248, 113, 113)' }
        ]}
        isDark={isDark}
      />
    ),
  },
  {
    key: 'dependencies',
    title: 'Dependencies (21)',
    subtitle: 'Top dependencies by fault rate',
    content: (isDark) => (
      <DependencyList 
        items={[
          { name: 'billing-service-python', value: 100 },
          { name: 'customers-service-java', value: 100 },
          { name: 'vets-service-java', value: 9.5 }
        ]}
        isDark={isDark}
      />
    ),
  },
  {
    key: 'canaries',
    title: 'Synthetics Canaries (8)',
    subtitle: 'Canaries success rate',
    content: (isDark) => (
      <DonutChart 
        data={[
          { label: 'Passed (74.5%)', value: 165, color: 'rgb(59, 130, 246)' },
          { label: 'Failed (25.5%)', value: 23, color: 'rgb(248, 113, 113)' }
        ]}
        isDark={isDark}
      />
    ),
  },
  {
    key: 'appmonitor',
    title: 'App monitor pages/screens (5)',
    subtitle: 'Top pages/screens with HTTP faults and errors',
    content: (isDark) => (
      <DependencyList 
        items={[
          { name: 'All', value: 107000, format: 'k' },
          { name: 'owners/details/ownerInfo', value: 107000, format: 'k' },
          { name: 'welcome', value: 2 }
        ]}
        isDark={isDark}
      />
    ),
  },
]

export { cards as metricsCards }

export default function MetricsGrid({ isDark, only }) {
  if (only) {
    const card = cards.find(c => c.key === only)
    if (!card) return null
    return (
      <>
        <div className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-600'} mb-2`}>{card.subtitle}</div>
        {card.content(isDark)}
      </>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {cards.map(card => (
        <Card key={card.key} variant="glass" isDark={isDark} className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{card.title}</h4>
          </div>
          <div className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-600'} mb-2`}>{card.subtitle}</div>
          {card.content(isDark)}
        </Card>
      ))}
    </div>
  )
}
