export default function DonutChart({ data, isDark }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentOffset = 0

  return (
    <div className="flex items-center gap-4 mb-3">
      <svg width="80" height="80" viewBox="0 0 80 80">
        {data.map((item, index) => {
          const dashArray = `${item.value} ${total - item.value}`
          const dashOffset = -currentOffset
          currentOffset += item.value
          
          return (
            <circle
              key={index}
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke={item.color}
              strokeWidth="12"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 40 40)"
            />
          )
        })}
      </svg>
      <div className="flex flex-col gap-2 text-xs">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
            <span className={isDark ? 'text-foreground-secondary' : 'text-gray-700'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
