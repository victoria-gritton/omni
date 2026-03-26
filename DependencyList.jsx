export default function DependencyList({ items, isDark }) {
  const formatValue = (value, format) => {
    if (format === 'k') {
      return `${(value / 1000).toFixed(0)}k`
    }
    return `${value}%`
  }

  const getBarWidth = (value, format) => {
    if (format === 'k') {
      const maxValue = Math.max(...items.map(i => i.value))
      return (value / maxValue) * 100
    }
    return value
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className={isDark ? 'text-foreground-secondary' : 'text-gray-700'}>
          {items[0].format === 'k' ? 'Page/Screen' : 'Dependency'}
        </span>
        <span className={isDark ? 'text-foreground-secondary' : 'text-gray-700'}>
          {items[0].format === 'k' ? 'Faults and crashes/errors' : 'Faults'}
        </span>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className={`${isDark ? 'text-link' : 'text-blue-600'} text-body-s flex-1`}>
            {item.name}
          </span>
          <span className={`${isDark ? 'text-foreground' : 'text-gray-900'} text-body-s w-12 text-right`}>
            {formatValue(item.value, item.format)}
          </span>
          <div className={`w-24 h-2 ${isDark ? 'bg-background-surface-2' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${getBarWidth(item.value, item.format)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}
