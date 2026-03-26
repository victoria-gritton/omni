import { useState, useRef, useLayoutEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CaretDown, Pencil, Copy, X, House, Trash } from '@phosphor-icons/react'
import Button from './ui/button'
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover'
import { Thumbnail } from './RecentsPopover'

function HorizonLogo() {
  return (
    <svg width="72" height="15" viewBox="0 0 191 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="191" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#fda4af" />
        </linearGradient>
      </defs>
      <path d="M158.227 20.0266C158.679 21.5722 158.909 23.2599 158.909 25.0903C158.909 27.3642 158.559 29.4183 157.862 31.2521C157.166 33.0858 156.176 34.663 154.893 35.9833C153.609 37.2671 152.049 38.258 150.215 38.955C148.418 39.6517 146.4 40 144.163 40C141.926 40 139.909 39.6518 138.111 38.955C136.314 38.258 134.772 37.2671 133.489 35.9833C132.205 34.663 131.216 33.0858 130.519 31.2521C129.822 29.4183 129.472 27.3642 129.472 25.0903C129.472 23.2599 129.702 21.5722 130.154 20.0266H138.117C137.906 20.5564 137.737 21.1246 137.615 21.7329C137.395 22.8333 137.285 23.9531 137.285 25.0903C137.285 26.2271 137.395 27.3456 137.615 28.4458C137.836 29.5095 138.202 30.482 138.716 31.3623C139.266 32.206 139.982 32.8838 140.863 33.3973C141.743 33.9107 142.843 34.1687 144.163 34.1687C145.483 34.1687 146.583 33.9107 147.463 33.3973C148.38 32.8838 149.097 32.206 149.61 31.3623C150.161 30.482 150.546 29.5095 150.766 28.4458C150.986 27.3456 151.096 26.2271 151.096 25.0903C151.096 23.9531 150.986 22.8333 150.766 21.7329C150.644 21.1245 150.47 20.5564 150.247 20.0266H158.227Z" fill="url(#logo-grad)"/><path d="M7.81303 14.8014H7.97834C8.96872 13.1508 10.2341 11.9573 11.7747 11.2236C13.3148 10.4536 14.8186 10.0686 16.2854 10.0684C18.3762 10.0684 20.0836 10.3631 21.4041 10.95C22.7608 11.5002 23.8242 12.2888 24.5943 13.3156C25.3645 14.3059 25.897 15.5346 26.1904 17.0017C26.5204 18.4321 26.6844 20.0275 26.6844 21.788V39.2856H18.8714V23.2187C18.8713 20.8712 18.5048 19.1287 17.7712 17.9916C17.0376 16.8182 15.7352 16.2303 13.8647 16.2303C11.7376 16.2304 10.1974 16.8733 9.24378 18.1569C8.29012 19.404 7.81308 21.4764 7.81303 24.3739V39.2856H0V0H7.81303V14.8014Z" fill="url(#logo-grad)"/><path d="M82.8672 10.0684C83.3807 10.0684 83.9499 10.1605 84.5734 10.3439V17.6059C84.2067 17.5326 83.7663 17.4792 83.2529 17.4425C82.7394 17.3692 82.2439 17.3323 81.7671 17.3323C80.3367 17.3323 79.1263 17.57 78.136 18.0467C77.1457 18.5236 76.3389 19.1848 75.7154 20.0285C75.1287 20.8352 74.7067 21.7881 74.4499 22.8881C74.1932 23.9885 74.0642 25.1821 74.0642 26.4659V39.2856H66.2512V10.8398H73.6785V16.122H73.7887C74.1555 15.2416 74.651 14.433 75.2746 13.6994C75.8979 12.9295 76.6131 12.288 77.4197 11.7747C78.2265 11.2246 79.0889 10.8027 80.0057 10.5092C80.9227 10.2158 81.8769 10.0684 82.8672 10.0684Z" fill="url(#logo-grad)"/><path d="M95.6698 39.2856H87.8567V10.8398H95.6698V39.2856Z" fill="url(#logo-grad)"/><path d="M125.151 16.7262L110.35 33.3973H126.196V39.2856H100.061V33.3973L114.862 16.7262H101.161V10.8398H125.151V16.7262Z" fill="url(#logo-grad)"/><path d="M180.276 10.0684C182.366 10.0685 184.072 10.3632 185.392 10.95C186.749 11.5002 187.812 12.2887 188.583 13.3156C189.353 14.306 189.885 15.5345 190.179 17.0017C190.509 18.4321 190.674 20.0275 190.675 21.788V39.2856H182.861V23.2187C182.861 20.8714 182.495 19.1287 181.761 17.9916C181.028 16.818 179.725 16.2304 177.855 16.2303C175.727 16.2303 174.186 16.8731 173.232 18.1569C172.278 19.404 171.801 21.4765 171.801 24.3739V39.2856H163.988V10.8398H171.417V14.8014H171.581C172.571 13.151 173.855 11.9573 175.432 11.2236C177.01 10.4533 178.625 10.0684 180.276 10.0684Z" fill="url(#logo-grad)"/><path d="M46.426 10.0684C48.6632 10.0685 50.6806 10.4351 52.4777 11.1685C54.3115 11.8654 55.87 12.875 57.1537 14.1953C58.4374 15.479 59.4285 17.0561 60.1254 18.9265C60.8223 20.7605 61.1704 22.816 61.1704 25.0903C61.1704 27.2741 60.8461 29.2538 60.2033 31.0317H52.0692C52.5156 30.2403 52.8358 29.3781 53.0287 28.4458C53.2487 27.3456 53.3574 26.227 53.3574 25.0903C53.3574 23.9531 53.2488 22.8333 53.0287 21.7329C52.8086 20.6327 52.4216 19.6617 51.8716 18.8182C51.358 17.9745 50.6434 17.2948 49.7264 16.7813C48.8462 16.2313 47.7461 15.9568 46.426 15.9567C45.1055 15.9567 44.004 16.2311 43.1237 16.7813C42.2435 17.2948 41.5287 17.9746 40.9785 18.8182C40.4653 19.6615 40.0984 20.6329 39.8784 21.7329C39.6583 22.8333 39.5478 23.9531 39.5478 25.0903C39.5478 26.2271 39.6584 27.3455 39.8784 28.4458C40.0713 29.3781 40.3759 30.2403 40.7942 31.0317H32.7019C32.0592 29.2538 31.7348 27.274 31.7348 25.0903C31.7348 22.816 32.0828 20.7605 32.7798 18.9265C33.4767 17.056 34.4678 15.479 35.7515 14.1953C37.0352 12.875 38.5753 11.8654 40.3724 11.1685C42.1698 10.4349 44.1885 10.0684 46.426 10.0684Z" fill="url(#logo-grad)"/>
    </svg>
  )
}

/**
 * AppHeader — shared compressed header for all pages.
 *
 * Props:
 *  - isDark: boolean
 *  - mode: 'agents' | 'applications' — current toggle state
 *  - onModeChange: (mode) => void
 *  - canvases: array — list of canvas objects { id, name, createdAt }
 *  - onCreateCanvas: (prompt) => void — create a new canvas
 *  - onOpenCanvas: (canvasId) => void — navigate to an existing canvas
 */

function formatRelativeTime(date) {
  if (!date) return ''
  const now = new Date()
  const diff = now - new Date(date)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return 'Yesterday'
}

const defaultCanvases = [
  { id: 'recent-2', name: 'Payment API Investigation', time: '2h ago', color: 'var(--severity-critical)', thumb: 'lines' },
  { id: 'recent-3', name: 'Service Topology Analysis', time: '5h ago', color: 'var(--status-active)', thumb: 'grid' },
  { id: 'recent-4', name: 'Deployment Rollback Analysis', time: 'Yesterday', color: 'var(--herman-violet)', thumb: 'doc' },
]

export default function AppHeader({ isDark, canvases = [], onCreateCanvas, onOpenCanvas, activeCanvasId, onCloseCanvas, onDuplicateCanvas, onRenameCanvas, homeCanvasId = 'home', onSetHome, rightSlot }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  // FLIP animation refs for reorder
  const listRef = useRef(null)
  const positionsRef = useRef({}) // { [canvasId]: { top } }
  const animatingRef = useRef(false)

  // Capture positions before React re-renders (called before onSetHome)
  const capturePositions = useCallback(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('[data-canvas-id]')
    const positions = {}
    items.forEach(el => {
      const id = el.getAttribute('data-canvas-id')
      positions[id] = { top: el.getBoundingClientRect().top }
    })
    positionsRef.current = positions
    animatingRef.current = true
  }, [])

  // After render, compute delta and animate
  useLayoutEffect(() => {
    if (!animatingRef.current || !listRef.current) return
    animatingRef.current = false
    const oldPositions = positionsRef.current
    const items = listRef.current.querySelectorAll('[data-canvas-id]')
    items.forEach(el => {
      const id = el.getAttribute('data-canvas-id')
      const oldPos = oldPositions[id]
      if (!oldPos) return
      const newTop = el.getBoundingClientRect().top
      const deltaY = oldPos.top - newTop
      if (Math.abs(deltaY) < 1) return
      el.style.transform = `translateY(${deltaY}px)`
      el.style.transition = 'none'
      // Force reflow
      el.getBoundingClientRect()
      el.style.transition = 'transform 300ms cubic-bezier(0.2, 0, 0, 1)'
      el.style.transform = ''
    })
    positionsRef.current = {}
  })

  // Overview entry — the built-in dashboard view
  const overviewEntry = {
    id: 'home',
    name: 'Overview',
    time: '1d ago',
    color: 'var(--herman-turquoise-light)',
    thumb: 'grid',
  }

  // Merge real canvases with defaults for display
  const realCanvasList = canvases.map(c => ({
    id: c.id,
    name: c.name,
    time: formatRelativeTime(c.createdAt),
    color: 'var(--status-active)',
    thumb: 'lines',
  }))
  const allCanvases = [overviewEntry, ...realCanvasList, ...defaultCanvases]

  // Home canvas first, then the rest
  const homeItem = allCanvases.find(c => c.id === homeCanvasId)
  const rest = allCanvases.filter(c => c.id !== homeCanvasId)
  const displayCanvases = homeItem ? [homeItem, ...rest] : allCanvases

  const handleCanvasSelect = (canvas) => {
    if (canvas.id === homeCanvasId) {
      navigate('/home')
    } else if (canvas.id === 'home') {
      navigate('/overview')
    } else if (canvas.id.startsWith('recent-')) {
      // Default/placeholder canvases — no action
    } else if (onOpenCanvas) {
      onOpenCanvas(canvas.id)
    }
  }

  const handleStartRename = (e, canvas) => {
    e.stopPropagation()
    setEditingId(canvas.id)
    setEditName(canvas.name)
  }

  const handleFinishRename = (e, canvasId) => {
    e.stopPropagation()
    if (editName.trim() && onRenameCanvas) {
      onRenameCanvas(canvasId, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <header className="flex items-center justify-between px-3 py-0.5 flex-shrink-0">
      {/* Left: Logo + Separator + Workspace Selector */}
      <div className="flex items-center gap-2 h-7">
        <button onClick={() => navigate('/home')} className="hover:opacity-80 transition-opacity" title="Home">
          <HorizonLogo />
        </button>
        <div className={`w-px h-4 ${isDark ? 'bg-white/[0.12]' : 'bg-black/[0.12]'}`} />
        <Popover isDark={isDark}>
          <PopoverTrigger asChild>
            <button
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium transition-colors ${
                isDark
                  ? 'text-foreground-secondary hover:text-foreground hover:bg-white/[0.06]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-black/[0.04]'
              }`}
              title="Switch workspace"
            >
              <span className="truncate max-w-[144px]">
                {(() => {
                  if (location.pathname === '/overview') return 'Overview'
                  if (location.pathname === '/home' || !activeCanvasId || activeCanvasId === 'home') {
                    if (homeCanvasId === 'home') return 'Overview'
                    const homeCanvas = canvases.find(c => c.id === homeCanvasId)
                    return homeCanvas ? (homeCanvas.name.length > 24 ? homeCanvas.name.slice(0, 24) + '…' : homeCanvas.name) : 'Home'
                  }
                  const found = canvases.find(c => c.id === activeCanvasId)
                  if (found) {
                    return found.name.length > 24 ? found.name.slice(0, 24) + '…' : found.name
                  }
                  return 'Home'
                })()}
              </span>
              <CaretDown size={12} className="shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={0} animate className="w-80 p-0 overflow-hidden">
            <div className="px-3 pt-3 pb-1.5">
              <h5 className={isDark ? 'text-foreground' : 'text-gray-900'}>Recent workspaces</h5>
            </div>
            <div ref={listRef} className="max-h-64 overflow-y-auto py-1">
              {displayCanvases.map((canvas, idx) => {
                const isHome = canvas.id === homeCanvasId
                const isOverview = canvas.id === 'home'
                const isActive = canvas.id === activeCanvasId || (isHome && (location.pathname === '/home' || location.pathname === '/')) || (isOverview && location.pathname === '/overview')
                const isReal = !canvas.id.startsWith('recent-') && canvas.id !== 'home'
                const isEditing = editingId === canvas.id
                return (
                  <div key={canvas.id} data-canvas-id={canvas.id}>
                    <div
                      onClick={() => !isEditing && handleCanvasSelect(canvas)}
                      className={`group flex items-center gap-3 px-3 py-1.5 w-full text-left transition-colors cursor-pointer ${
                        isActive
                          ? (isDark ? 'bg-white/[0.08]' : 'bg-black/[0.06]')
                          : (isDark ? 'hover:bg-white/5' : 'hover:bg-black/5')
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex-shrink-0 relative overflow-hidden ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-black/[0.03] border border-black/[0.06]'}`}
                      >
                        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full z-10" style={{ background: canvas.color }} />
                        <div className="absolute inset-0 flex items-end justify-center p-1 pt-2.5">
                          <Thumbnail type={canvas.thumb} color={canvas.color} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleFinishRename(e, canvas.id); if (e.key === 'Escape') setEditingId(null) }}
                            onBlur={(e) => handleFinishRename(e, canvas.id)}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full text-xs font-medium bg-transparent outline-none border-b ${isDark ? 'text-foreground border-foreground-disabled' : 'text-gray-900 border-gray-400'}`}
                          />
                        ) : (
                          <div className={`text-xs font-medium truncate ${isActive ? (isDark ? 'text-foreground' : 'text-gray-900') : (isDark ? 'text-foreground' : 'text-gray-900')}`}>
                            {canvas.name}
                          </div>
                        )}
                        {canvas.time && (
                          <div className={`text-[10px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>
                            Last updated: {canvas.time}
                          </div>
                        )}
                      </div>
                      {/* Action buttons — visible on hover */}
                      {!isEditing && (
                        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          {!isHome && (
                            <Button isDark={isDark} variant="outline" size="icon-sm" title="Make my home" onClick={(e) => { e.stopPropagation(); capturePositions(); onSetHome?.(canvas.id) }}>
                              <House size={12} />
                            </Button>
                          )}
                          <Button isDark={isDark} variant="outline" size="icon-sm" title="Rename" onClick={(e) => handleStartRename(e, canvas)}>
                            <Pencil size={12} />
                          </Button>
                          <Button isDark={isDark} variant="outline" size="icon-sm" title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicateCanvas?.(canvas.id) }}>
                            <Copy size={12} />
                          </Button>
                          <Button isDark={isDark} variant="outline" size="icon-sm" title="Delete" onClick={(e) => { e.stopPropagation() }}>
                            <Trash size={12} />
                          </Button>
                        </div>
                      )}
                      {/* Active indicator */}
                      {isActive && !isEditing && (
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-sky-400' : 'bg-sky-500'}`} />
                      )}
                    </div>
                    {/* Separator after home item */}
                    {isHome && displayCanvases.length > 1 && (
                      <div className={`mx-3 my-1 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className={`px-3 py-2.5 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-200'}`}>
              <Button
                isDark={isDark}
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => onCreateCanvas?.('')}
              >
                Create workspace
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right: scope selector slot */}
      {rightSlot && (
        <div className="flex items-center h-7">
          {rightSlot}
        </div>
      )}
    </header>
  )
}
