import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Sun, Moon } from '@phosphor-icons/react'
import RecentsPopover, { Thumbnail } from './RecentsPopover'
import GlowingGlobe from './GlowingGlobe'
import RecentsIcon from './RecentsIcon'

export default function LeftNav({ isDark, toggleTheme, recentCanvases = [], openCanvases = [], activeCanvasId, onCanvasSelect, onHomeClick, onNewCanvas, minimal = false }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCanvasSelect = (canvas) => {
    if (onCanvasSelect) onCanvasSelect(canvas.id)
  }

  const formatTimeAgo = (date) => {
    if (!date) return ''
    const now = new Date()
    const diff = Math.floor((now - new Date(date)) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 172800) return 'Yesterday'
    return `${Math.floor(diff / 86400)}d ago`
  }

  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick()
    else navigate('/home')
  }

  return (
    <div className="w-16 h-screen fixed left-0 top-0 z-40 flex flex-col items-center py-4">
      {/* Top — Orb logo */}
      <button onClick={handleHomeClick} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`} aria-label="Home">
        <GlowingGlobe size={28} />
      </button>

      {/* Middle — Canvas group */}
      {!minimal && <div className="flex flex-col items-center gap-2 my-auto">
        {/* Recent Canvases Overflow */}
        <RecentsPopover
          recents={recentCanvases.map((c, i) => {
            const thumbs = ['lines', 'bars', 'grid', 'doc']
            const colors = ['var(--severity-critical)', 'var(--status-active)', 'var(--status-active)', 'var(--herman-violet)']
            return { id: c.id, name: c.name, time: formatTimeAgo(c.createdAt), color: colors[i % colors.length], thumb: thumbs[i % thumbs.length] }
          })}
          onSelect={(recent) => onCanvasSelect && onCanvasSelect(recent.id)}
          onNewCanvas={onNewCanvas}
          position="right"
          trigger="click"
        >
          <button className={`p-2 rounded-lg transition-colors ${isDark ? 'text-foreground-muted hover:text-foreground hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'}`} aria-label="All canvases">
            <RecentsIcon className="w-5 h-5" />
          </button>
        </RecentsPopover>

        {/* Open Canvas Thumbnails (up to 4) */}
        {openCanvases.slice(0, 4).map((canvas, i) => {
          const thumbs = ['lines', 'bars', 'grid', 'doc']
          const colors = ['var(--severity-critical)', 'var(--status-active)', 'var(--status-active)', 'var(--herman-violet)']
          return (
            <button key={canvas.id} onClick={() => handleCanvasSelect(canvas)} className={`w-9 h-9 rounded-lg relative overflow-hidden flex items-center justify-center transition-all duration-200 ${activeCanvasId === canvas.id ? (isDark ? 'bg-sky-500/20 border border-sky-500/40 ring-1 ring-sky-500/30' : 'bg-blue-500/15 border border-blue-500/40 ring-1 ring-blue-500/30') : (isDark ? 'bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20' : 'bg-black/5 hover:bg-black/10 border border-gray-200 hover:border-gray-300')}`} title={canvas.name} aria-label={canvas.name}>
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full z-10" style={{ background: colors[i % colors.length] }} />
              <div className="absolute inset-0 flex items-end justify-center p-1 pt-2.5">
                <Thumbnail type={thumbs[i % thumbs.length]} color={colors[i % colors.length]} />
              </div>
            </button>
          )
        })}

        {/* New Canvas */}
        <button onClick={() => onNewCanvas && onNewCanvas()} className={`p-2 rounded-lg transition-colors ${isDark ? 'text-foreground-muted hover:text-foreground hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'}`} aria-label="New canvas">
          <Plus size={20} />
        </button>
      </div>}

      {/* Bottom */}
      {!minimal && <div className="flex flex-col items-center gap-2 mt-auto">
        <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${isDark ? 'text-foreground-disabled hover:text-foreground-secondary hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-black/5'}`} aria-label="Toggle theme">
          {isDark ? (
            <Sun size={16} />
          ) : (
            <Moon size={16} />
          )}
        </button>
        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setShowUserMenu(!showUserMenu)} className={`p-1.5 rounded-full transition-colors ${isDark ? 'text-foreground-muted hover:text-foreground hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'}`} aria-label="User menu">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${isDark ? 'bg-gradient-to-br from-sky-400 to-blue-500 text-white' : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'}`}>M</div>
          </button>
          {showUserMenu && (
            <div className={`absolute left-full ml-2 bottom-0 w-56 rounded-xl shadow-2xl ${isDark ? 'bg-background-surface-1/95 border border-white/10' : 'bg-white/95 border border-gray-200'} backdrop-blur-xl`}>
              <div className={`p-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className={`text-sm font-medium ${isDark ? 'text-foreground' : 'text-gray-900'}`}>Maya Anderson</div>
                <div className={`text-xs ${isDark ? 'text-foreground-muted' : 'text-gray-600'}`}>maya@company.com</div>
              </div>
              <div className="p-2">
                {[
                  { label: 'Profile', icon: '👤', action: () => {} },
                  { label: 'Components', icon: '🧩', action: () => navigate('/components') },
                  { label: 'Settings', icon: '⚙️', action: () => {} },
                  { label: 'Dashboard', icon: '📊', action: () => {} },
                  { label: 'Sign out', icon: '🚪', action: () => {} },
                ].map((item, index) => (
                  <button key={index} onClick={() => { item.action(); setShowUserMenu(false) }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${isDark ? 'text-foreground-secondary hover:bg-white/5 hover:text-foreground' : 'text-gray-700 hover:bg-black/5 hover:text-gray-900'}`}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>}
    </div>
  )
}
