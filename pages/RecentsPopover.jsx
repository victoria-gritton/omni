import { useState, useRef, useEffect } from 'react'
import { Clock, Plus } from '@phosphor-icons/react'

const defaultRecents = [
  { name: 'Payment API Investigation', time: '18m ago', color: 'var(--severity-critical)', thumb: 'lines' },
  { name: 'Database Performance Review', time: '2h ago', color: 'var(--status-active)', thumb: 'bars' },
  { name: 'Service Topology Analysis', time: '5h ago', color: 'var(--status-active)', thumb: 'grid' },
  { name: 'Deployment Rollback Analysis', time: 'Yesterday', color: 'var(--herman-violet)', thumb: 'doc' },
]

export function Thumbnail({ type, color }) {
  if (type === 'lines') return (
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
      <rect x="0" y="1" width="18" height="2" rx="1" fill={color} opacity="0.6"/>
      <rect x="0" y="5.5" width="14" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
      <rect x="0" y="10" width="22" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
      <rect x="0" y="14" width="16" height="2" rx="1" fill="rgba(255,170,0,0.5)"/>
    </svg>
  )
  if (type === 'bars') return (
    <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
      <rect x="2" y="4" width="3" height="12" rx="1" fill={color} opacity="0.7"/>
      <rect x="7" y="8" width="3" height="8" rx="1" fill={color} opacity="0.5"/>
      <rect x="12" y="2" width="3" height="14" rx="1" fill={color} opacity="0.8"/>
      <rect x="17" y="6" width="3" height="10" rx="1" fill={color} opacity="0.6"/>
      <rect x="22" y="10" width="3" height="6" rx="1" fill={color} opacity="0.4"/>
    </svg>
  )
  if (type === 'grid') return (
    <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
      <rect x="0" y="0" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.1)"/>
      <rect x="9.5" y="0" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.08)"/>
      <rect x="19" y="0" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.06)"/>
      <rect x="0" y="10" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.08)"/>
      <rect x="9.5" y="10" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.1)"/>
      <rect x="19" y="10" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.06)"/>
    </svg>
  )
  return (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect x="0" y="0" width="14" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
      <rect x="0" y="4.5" width="20" height="1.5" rx="0.75" fill="rgba(255,255,255,0.08)"/>
      <rect x="0" y="8" width="16" height="1.5" rx="0.75" fill="rgba(255,255,255,0.08)"/>
      <rect x="0" y="11.5" width="22" height="1.5" rx="0.75" fill="rgba(255,255,255,0.08)"/>
      <rect x="0" y="15" width="12" height="1.5" rx="0.75" fill="rgba(255,255,255,0.08)"/>
    </svg>
  )
}

export default function RecentsPopover({ recents = defaultRecents, onSelect, onNewCanvas, position = 'top', trigger = 'hover', children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (trigger !== 'click') return
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [trigger])

  const popoverPosition = position === 'right'
    ? 'absolute left-full ml-2 top-0'
    : 'absolute bottom-full mb-2 left-0'

  const isHover = trigger === 'hover'
  const showPopover = isHover ? undefined : open

  const handleTriggerClick = () => {
    if (!isHover) setOpen(prev => !prev)
  }

  const handleItemSelect = (recent) => {
    setOpen(false)
    onSelect && onSelect(recent)
  }

  return (
    <div className={`relative ${isHover ? 'group' : ''}`} ref={ref}>
      <div onClick={handleTriggerClick}>
        {children || (
          <button
            type="button"
            className="group relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            aria-label="Recents"
          >
            <Clock size={16} className="text-teal-400" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 bg-background-surface-2 text-foreground border border-white/10">
              Recents
            </span>
          </button>
        )}
      </div>

      <div
        className={`${popoverPosition} w-80 rounded-2xl transition-all duration-200 z-50 ${
          isHover
            ? 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto translate-y-1 group-hover:translate-y-0'
            : showPopover
              ? 'opacity-100 pointer-events-auto translate-y-0'
              : 'opacity-0 pointer-events-none translate-y-1'
        }`}
        style={{
          background: 'rgba(12, 12, 18, 0.97)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div className="py-1">
          {recents.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <div className="text-xs mb-3" style={{ color: 'rgba(255, 255, 255, 0.35)' }}>No recent workspaces</div>
              {onNewCanvas && (
                <button
                  onClick={() => { setOpen(false); onNewCanvas() }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-foreground transition-all duration-200 bg-primary hover:opacity-90"
                >
                  <Plus size={14} />
                  New workspace
                </button>
              )}
            </div>
          ) : recents.map((recent, idx) => (
            <div key={idx}>
              <button
                onClick={() => handleItemSelect(recent)}
                className="flex items-center gap-3 px-3 py-1.5 transition-colors text-left w-full hover:bg-white/5"
              >
                <div
                  className="w-9 h-9 rounded-lg flex-shrink-0 relative overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full z-10" style={{ background: recent.color }} />
                  <div className="absolute inset-0 flex items-end justify-center p-1 pt-2.5">
                    <Thumbnail type={recent.thumb} color={recent.color} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-s font-medium truncate" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {recent.name}
                  </div>
                  {recent.time && (
                    <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                      {recent.time}
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
