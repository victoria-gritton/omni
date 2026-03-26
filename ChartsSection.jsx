import { Line } from 'react-chartjs-2'
import Card from './ui/card'

export default function ChartsSection({ isDark, only, compact }) {
  const timeLabels = ['18:00', '18:05', '18:10', '18:15', '18:20', '18:25', '18:30', '18:35', '18:40', '18:45', '18:50', '18:55', '19:00', '19:05', '19:10', '19:15', '19:20', '19:25', '19:30', '19:35', '19:40', '19:45', '19:50', '19:55', '20:00', '20:05', '20:10', '20:15', '20:20', '20:25', '20:30']

  const availabilityData = {
    labels: timeLabels,
    datasets: [{
      label: 'Availability %',
      data: [22, 23, 40, 38, 23, 23, 30, 27, 23, 27, 20, 23, 23, 30, 28, 28, 27, 27, 25, 24, 26, 25, 27, 26, 28, 27, 26, 25, 27, 28, 27],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2
    }]
  }

  const latencyData = {
    labels: timeLabels,
    datasets: [{
      label: 'Latency (ms)',
      data: [2000, 3000, 2500, 3000, 2000, 2500, 3000, 2000, 18000, 32000, 3000, 5000, 12000, 3000, 8000, 5000, 3000, 2500, 3000, 2000, 38000, 12000, 3000, 5000, 3000, 2500, 18000, 22000, 3000, 2500, 3000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2
    }]
  }

  const chartOptions = (min, max, callback) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: callback ? { label: callback } : undefined
      }
    },
    scales: {
      y: {
        min,
        max,
        grid: { 
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)',
          drawBorder: false
        },
        ticks: { 
          color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.6)',
          callback: callback || undefined
        }
      },
      x: {
        grid: { 
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)',
          drawBorder: false
        },
        ticks: { 
          color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.6)',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      }
    }
  })

  const availabilityContent = (
    <>
      <div className="mb-4">
        <div className="mb-2">
          <div className={`text-body-m ${isDark ? 'text-foreground-secondary' : 'text-gray-700'} mb-0.5`}>
            GET /api/payments/owners/{'{ownerId}'}/pets/{'{petId}'}
          </div>
          <div className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-600'}`}>%</div>
        </div>
        <div className="h-40">
          <Line data={availabilityData} options={chartOptions(15, 42, (value) => value.toFixed(2))} />
        </div>
        {!compact && (
          <>
            <div className={`mt-3 text-body-m ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>
              Traces show the faults are caused by a dependency invocation with{' '}
              <span className="font-mono text-code">IllegalStateException</span>, see a{' '}
              <a href="#" className={`${isDark ? 'text-link' : 'text-blue-600'} hover:underline`}>
                sample trace
              </a>.
            </div>
            <div className={`mt-2 text-body-m font-mono ${isDark ? 'text-foreground-muted bg-background-surface-1/40' : 'text-gray-700 bg-gray-100'} rounded-lg p-2`}>
              No instances available for nutrition-service
            </div>
          </>
        )}
      </div>
      {!compact && <ServiceMap isDark={isDark} type="availability" />}
    </>
  )

  const latencyContent = (
    <>
      <div className="mb-4">
        <div className="mb-2">
          <div className={`text-body-m ${isDark ? 'text-foreground-secondary' : 'text-gray-700'} mb-0.5`}>
            GET /api/customer/owners
          </div>
          <div className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-600'}`}>Milliseconds</div>
        </div>
        <div className="h-40">
          <Line 
            data={latencyData} 
            options={chartOptions(0, 40000, (value) => (value / 1000).toFixed(0) + 'K')} 
          />
        </div>
        {!compact && (
          <div className={`mt-3 text-body-m ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}>
            Traces show the long latency are caused by an internal operation, see a{' '}
            <a href="#" className={`${isDark ? 'text-link' : 'text-blue-600'} hover:underline`}>
              sample trace
            </a>.
          </div>
        )}
      </div>
      {!compact && <ServiceMap isDark={isDark} type="latency" />}
    </>
  )

  if (only === 'availability') return availabilityContent
  if (only === 'latency') return latencyContent

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      <Card variant="glass" isDark={isDark} className="p-2">
        <h4 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>
          Availability decline
        </h4>
        {availabilityContent}
      </Card>
      <Card variant="glass" isDark={isDark} className="p-2">
        <h4 className={`text-heading-s font-normal ${isDark ? 'text-foreground' : 'text-gray-900'} mb-3`}>
          Latency increase
        </h4>
        {latencyContent}
      </Card>
    </div>
  )
}

function ServiceMap({ isDark, type }) {
  const textColor = isDark ? '#ffffff' : '#374151'
  const subTextColor = isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
  const lineColor = isDark ? 'rgba(156, 163, 175, 0.5)' : 'rgba(107, 114, 128, 0.5)'

  if (type === 'availability') {
    return (
      <div className={`h-48 flex items-center justify-center border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-4`}>
        <svg className="w-full h-full" viewBox="0 0 500 230">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={lineColor} />
            </marker>
          </defs>
          
          <line x1="140" y1="65" x2="360" y2="65" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrow)"/>
          <line x1="140" y1="65" x2="250" y2="155" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrow)"/>
          <line x1="360" y1="65" x2="250" y2="155" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrow)"/>
          
          <circle cx="140" cy="65" r="28" fill="rgb(220, 38, 38)" stroke="rgb(185, 28, 28)" strokeWidth="3"/>
          <circle cx="140" cy="65" r="11" fill="white"/>
          <text x="140" y="108" textAnchor="middle" fill={textColor} fontSize="11" fontWeight="500">pet-clinic-frontend</text>
          <text x="140" y="121" textAnchor="middle" fill={subTextColor} fontSize="9">Service</text>
          
          <circle cx="360" cy="65" r="28" fill="rgb(220, 38, 38)" stroke="rgb(185, 28, 28)" strokeWidth="3"/>
          <circle cx="360" cy="65" r="11" fill="white"/>
          <text x="360" y="108" textAnchor="middle" fill={textColor} fontSize="11" fontWeight="500">customers-service</text>
          <text x="360" y="121" textAnchor="middle" fill={subTextColor} fontSize="9">Service</text>
          
          <circle cx="250" cy="155" r="28" fill="rgb(161, 98, 7)" stroke="rgb(133, 77, 14)" strokeWidth="3"/>
          <circle cx="250" cy="155" r="11" fill="white"/>
          <text x="250" y="198" textAnchor="middle" fill={textColor} fontSize="11" fontWeight="500">payment-service</text>
          <text x="250" y="211" textAnchor="middle" fill={subTextColor} fontSize="9">Service</text>
        </svg>
      </div>
    )
  }

  return (
    <div className={`h-48 flex items-center justify-center border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-4`}>
      <svg className="w-full h-full" viewBox="0 0 460 200">
        <defs>
          <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill={lineColor} />
          </marker>
        </defs>
        
        <line x1="168" y1="80" x2="222" y2="80" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrow2)"/>
        
        <circle cx="140" cy="80" r="28" fill="none" stroke="rgb(107, 114, 128)" strokeWidth="3"/>
        <circle cx="140" cy="80" r="11" fill="rgb(107, 114, 128)"/>
        <text x="140" y="123" textAnchor="middle" fill={textColor} fontSize="11" fontWeight="500">pet-clinic-frontend</text>
        <text x="140" y="136" textAnchor="middle" fill={subTextColor} fontSize="9">Service</text>
        
        <circle cx="320" cy="80" r="28" fill="none" stroke="rgb(107, 114, 128)" strokeWidth="3"/>
        <circle cx="320" cy="80" r="11" fill="rgb(107, 114, 128)"/>
        <text x="320" y="123" textAnchor="middle" fill={textColor} fontSize="11" fontWeight="500">customers-service</text>
        <text x="320" y="136" textAnchor="middle" fill={subTextColor} fontSize="9">Service</text>

        <line x1="168" y1="80" x2="292" y2="80" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrow2)"/>
      </svg>
    </div>
  )
}
