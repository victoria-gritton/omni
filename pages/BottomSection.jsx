import { Bar } from 'react-chartjs-2'
import Card from './ui/card'

export default function BottomSection({ isDark, only }) {
  const metricsData = {
    labels: ['Requests', 'Faults', 'Errors', 'Latency'],
    datasets: [{
      data: [165600, 10700, 984, 13.7],
      backgroundColor: [
        'rgba(59, 130, 246, 0.5)',
        'rgba(251, 146, 60, 0.5)',
        'rgba(239, 68, 68, 0.5)',
        'rgba(59, 130, 246, 0.5)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(251, 146, 60)',
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)'
      ],
      borderWidth: 1
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)' },
        ticks: { color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.6)' }
      },
      x: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)' },
        ticks: { color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.6)' }
      }
    }
  }

  const changesContent = (
    <>
      <div className="space-y-2">
        <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5' : 'bg-white/60'} backdrop-blur-sm rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div>
            <div className={`text-body-m ${isDark ? 'text-foreground' : 'text-gray-900'}`}>Deployment v2.4.1</div>
            <div className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-600'}`}>2 hours ago</div>
          </div>
          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-status-active' : 'bg-green-500'}`}></div>
        </div>
        <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5' : 'bg-white/60'} backdrop-blur-sm rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div>
            <div className={`text-body-m ${isDark ? 'text-foreground' : 'text-gray-900'}`}>Config update</div>
            <div className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-600'}`}>5 hours ago</div>
          </div>
          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-status-blocked' : 'bg-yellow-500'}`}></div>
        </div>
      </div>
    </>
  )

  const metricsAggContent = (
    <>
      <div className="h-40">
        <Bar data={metricsData} options={chartOptions} />
      </div>
    </>
  )

  if (only === 'changes') return changesContent
  if (only === 'metrics-agg') return metricsAggContent

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      <Card variant="glass" isDark={isDark} className="p-2">
        <h4 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>Changes</h4>
        {changesContent}
      </Card>
      <Card variant="glass" isDark={isDark} className="p-2">
        <h4 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>Metrics (aggregated)</h4>
        {metricsAggContent}
      </Card>
    </div>
  )
}
