import { useState, useRef, useEffect } from 'react'
import { SquaresFour, X, Sparkle, Plus, CaretDown } from '@phosphor-icons/react'
import CanvasScope from './CanvasScope'

const viewFilters = [
  { id: 'application', label: 'Application', agentLabel: 'Agent' },
  { id: 'business-unit', label: 'Business Unit' },
  { id: 'team', label: 'Team' },
  { id: 'environment', label: 'Environment' },
]

export default function GlobalHeader({ isDark, activeCanvasName, showServiceTab, serviceTabs, activeTab, onTabChange, onCloseTab, isHomePage, showToolsPanel, viewFilter, onViewFilterChange, viewMode, onViewModeChange }) {
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-transparent`}>
      <div className="flex items-center justify-between max-w-[100vw]">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          {showServiceTab && serviceTabs && serviceTabs.length > 0 ? (
            <>
              {serviceTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                  className={`
                    flex items-center justify-center gap-2
                    px-3 py-2 rounded-lg
                    transition-all duration-200
                    ${activeTab === tab.id
                      ? isDark
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-black/10 text-gray-900 border border-gray-300'
                      : isDark
                        ? 'bg-white/5 text-foreground-muted border border-transparent hover:bg-white/10 hover:text-foreground hover:border-white/20'
                        : 'bg-black/5 text-gray-600 border border-transparent hover:bg-black/10 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <SquaresFour size={14} className="text-sky-400" />
                  <span className="text-xs font-medium">{tab.name}</span>
                  {activeTab === tab.id && (
                    <X size={14} className={`ml-1 ${isDark ? 'text-foreground-muted hover:text-foreground' : 'text-gray-500 hover:text-gray-900'} transition-colors cursor-pointer`} />
                  )}
                </button>
              ))}
            </>
          ) : isHomePage ? (
            <div className="flex items-center gap-4">
              <div className={`text-sm font-medium ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
                Good morning, Maya!
              </div>
              {/* Applications / Agents Toggle */}
              <div
                className="flex items-center rounded-lg p-0.5"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                {[
                  { id: 'applications', label: 'Applications', icon: (
                    <SquaresFour size={12} />
                  )},
                  { id: 'agents', label: 'Agents', icon: (
                    <Sparkle size={12} />
                  )},
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => onViewModeChange && onViewModeChange(mode.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-body-s font-medium transition-all duration-200 cursor-pointer ${
                      viewMode === mode.id
                        ? isDark
                          ? 'bg-white/12 text-white shadow-sm'
                          : 'bg-white text-gray-900 shadow-sm'
                        : isDark
                          ? 'text-foreground-muted hover:text-foreground'
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={viewMode === mode.id ? {
                      background: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)',
                    } : {}}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          ) : activeCanvasName ? (
            <h2 className={`text-lg font-normal ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
              {activeCanvasName}
            </h2>
          ) : null}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* View Filter (homepage) */}
          {isHomePage && (
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-body-s font-medium transition-all ${isDark ? 'text-foreground-muted hover:text-foreground hover:bg-white/5 border border-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5 border border-gray-200'}`}
              >
                <span>View: {(() => { const f = viewFilters.find(f => f.id === viewFilter); return viewMode === 'agents' && f?.agentLabel ? f.agentLabel : f?.label || 'Application'; })()}</span>
                <CaretDown size={10} className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              {filterOpen && (
                <div
                  className={`absolute top-full right-0 mt-1 rounded-lg overflow-hidden min-w-[160px] z-50 ${isDark ? 'border border-white/10' : 'border border-gray-200'}`}
                  style={{
                    background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  }}
                >
                  {viewFilters.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { onViewFilterChange && onViewFilterChange(f.id); setFilterOpen(false) }}
                      className={`block w-full text-left px-3 py-2 text-body-s font-medium transition-all ${viewFilter === f.id ? (isDark ? 'bg-white/10 text-foreground' : 'bg-black/5 text-gray-900') : (isDark ? 'text-foreground-muted hover:bg-white/5' : 'text-gray-500 hover:bg-black/5')}`}
                    >
                      {viewMode === 'agents' && f.agentLabel ? f.agentLabel : f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* New Canvas Button */}
          {!isHomePage && !activeCanvasName && (
          <button
            className={`${isDark ? 'bg-white/5 border-white/10 text-foreground-secondary hover:bg-white/10' : 'bg-black/5 border-gray-300 text-gray-700 hover:bg-black/10'} border rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer`}
            aria-label="Create new canvas"
          >
            <Plus size={14} />
            <span>New canvas</span>
          </button>
          )}
        </div>
      </div>
    </header>
  )
}
