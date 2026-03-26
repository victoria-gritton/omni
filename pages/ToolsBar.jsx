import { 
  SquaresFour, 
  Bell, 
  ChartPie, 
  MagnifyingGlass 
} from '@phosphor-icons/react'

export default function ToolsBar({ isDark, inline = false, iconOnly = false, compact = false, onToolClick }) {
  const toolCards = [
    { Icon: SquaresFour, label: 'Services', color: 'sky' },
    { Icon: Bell, label: 'Alarms', color: 'purple' },
    { Icon: ChartPie, label: 'SLOs', color: 'pink' },
    { Icon: MagnifyingGlass, label: 'Explore', color: 'orange' }
  ]

  const buttons = toolCards.map((tool, index) => {
    const Icon = tool.Icon
    return (
      <button
        key={index}
        onClick={() => onToolClick && onToolClick({ type: tool.label.toLowerCase(), title: tool.label })}
        className={`
          flex items-center justify-center ${iconOnly ? '' : compact ? 'gap-1' : 'gap-1.5'}
          ${iconOnly ? 'px-2 py-2' : compact ? 'px-2 py-1 rounded-md' : 'px-3 py-2 rounded-lg'}
          ${!compact ? 'rounded-lg' : ''}
          transition-all duration-200
          ${isDark
            ? 'bg-white/5 hover:bg-white/10 text-foreground-secondary hover:text-foreground border border-transparent hover:border-white/20'
            : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-300'
          }
        `}
        title={iconOnly || compact ? tool.label : undefined}
      >
        <Icon size={compact ? 12 : 14} className={`
          ${tool.color === 'sky' ? 'text-sky-400' : ''}
          ${tool.color === 'teal' ? 'text-teal-400' : ''}
          ${tool.color === 'purple' ? 'text-purple-400' : ''}
          ${tool.color === 'pink' ? 'text-pink-400' : ''}
          ${tool.color === 'orange' ? 'text-orange-400' : ''}
        `} />
        {!iconOnly && (
          <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium`}>
            {tool.label}
          </span>
        )}
      </button>
    )
  })

  // If inline mode, just return the buttons without wrapper
  if (inline) {
    return <>{buttons}</>
  }

  // Otherwise, return with full wrapper
  return (
    <div className="px-6 py-3">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex gap-1 w-fit">
          {buttons}
        </div>
      </div>
    </div>
  )
}
