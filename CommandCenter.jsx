import { useState, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  SlidersHorizontal,
  Microphone,
  PaperPlaneRight,
  BookmarkSimple,
  MagnifyingGlass,
  SquaresFour,
  Bell,
  ChartPie,
  DotsThree,
  Gear,
  User,
  Compass,
  Sidebar,
  X,
} from '@phosphor-icons/react'
import Button from './ui/button'
import Badge from './ui/badge'
import Input from './ui/input'
import Tooltip from './ui/tooltip'
import ParticleOrb from './ui/particle-orb'
import { cn } from './ui/lib/utils'

/**
 * CommandCenter — SSO Rhythm
 *
 * Sticky bottom bar:
 * 1. Center: Herman orb (flush left) + Input field (fused) + Tools|Bookmarks pill (right)
 * 2. Right: Settings + User profile (floating circle buttons)
 * 3. Floating badge: "Thinking…" appears above input when agent is processing
 * 4. Floating popover: Response appears above orb+input area
 */

// ── Floating circle button (outline style with shadow) ──
const FloatingButton = forwardRef(function FloatingButton({ isDark, children, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:shadow-ring-default',
        isDark
          ? 'bg-background-surface-1 border-border-muted text-foreground-secondary hover:bg-background-surface-2 active:bg-background-surface-1/80 shadow-lg'
          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

// ── Pill icon button (ghost style, 32px inside 40px pill) ──
const PillIconButton = forwardRef(function PillIconButton({ isDark, children, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-lg border border-transparent transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:shadow-ring-default',
        isDark
          ? 'bg-transparent text-foreground hover:bg-white/5 active:bg-white/10'
          : 'bg-transparent text-slate-700 hover:bg-black/5 active:bg-black/10',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

// ── Pill wrapper — shared styling for each pill group ──
function Pill({ isDark, children, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-0 h-10 px-1 rounded-lg shadow-lg',
        isDark
          ? 'bg-background-surface-1 border border-border-muted'
          : 'bg-white border border-slate-200',
        className
      )}
    >
      {children}
    </div>
  )
}

export default function CommandCenter({
  isDark,
  onSubmit,
  onCreateCanvas,
  disableFixedPosition = false,
  onExplore,
  onAlarms,
  onDashboards,
  onOpenSettings,
  onOpenChat,
  settingsOpen = false,
  chatMode = 'closed',
  chatMessages = [],
  onChatSubmit,
  onDockChat,
  onCloseChat,
  agentTyping = false,
  suggestions = [],
}) {
  const [input, setInput] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    const trimmed = input.trim()
    if (trimmed) {
      if (onCreateCanvas) {
        onCreateCanvas(trimmed)
      } else if (onSubmit) {
        onSubmit(trimmed)
      }
      setInput('')
    }
  }

  return (
    <div className={cn(
      disableFixedPosition ? '' : 'fixed bottom-0 left-0 right-0 z-50',
      'px-4 pb-4 pt-8 pointer-events-none'
    )}
    style={{
      background: isDark
        ? 'linear-gradient(to bottom, transparent 0%, var(--background) 50%)'
        : 'linear-gradient(to bottom, transparent 0%, rgb(249, 250, 251) 50%)'
    }}
    >
      <div className="flex items-end justify-center max-w-[100vw] gap-2 pointer-events-auto">

        {/* ── Centered: Orb-in-Input ── */}
        <div className="flex items-end gap-2 min-w-0 w-full relative">

          {/* Floating "Thinking…" badge above input */}
          <AnimatePresence>
            {agentTyping && !chatMessages.some(m => m.type === 'assistant') && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="absolute -top-8 left-10 z-10"
              >
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-lg border',
                  isDark
                    ? 'bg-background-surface-2 border-border-muted text-foreground-secondary'
                    : 'bg-white border-slate-200 text-slate-600'
                )}>
                  <ParticleOrb size={10} count={80} particleSize={1.5} active />
                  Thinking…
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating chat popover — anchored above the input area */}
          {chatMode === 'popover' && chatMessages.some(m => m.type === 'assistant') && (
            <>
            <div
              className="pointer-events-none absolute bottom-full mb-2 rounded-xl"
              style={{
                left: '0px',
                width: '300px',
                height: '100px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(251,113,133,0.15))'
                  : 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(251,113,133,0.12))',
                filter: 'blur(40px)',
                animation: 'popoverGrow 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                transformOrigin: 'bottom left',
              }}
            />
            <div
              className={cn(
                'absolute bottom-full mb-2 rounded-xl border flex flex-col overflow-hidden group/popover',
                isDark ? 'bg-background-surface-2 border-border shadow-2xl' : 'bg-white border-slate-200 shadow-2xl'
              )}
              style={{
                left: '0px',
                width: '300px',
                maxHeight: '400px',
                pointerEvents: 'auto',
                animation: 'popoverGrow 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                transformOrigin: 'bottom left',
              }}
            >
              <style>{`
                @keyframes popoverGrow {
                  from { opacity: 0; transform: scale(0.3); }
                  40% { opacity: 1; }
                  to { opacity: 1; transform: scale(1); }
                }
              `}</style>
              <span
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] z-10"
                style={{ background: 'linear-gradient(90deg, transparent, #38bdf8, #fb7185, transparent)' }}
              />
              <span
                className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 w-1/2 h-8 blur-xl z-10"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.15), rgba(251,113,133,0.18), transparent)' }}
              />
              <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-end px-2 py-1 opacity-0 group-hover/popover:opacity-100 transition-opacity duration-200 rounded-t-xl ${isDark ? 'bg-background-surface-2/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'}`}>
                <div className="flex items-center gap-0.5">
                  <button onClick={onDockChat} className={`p-1 rounded-md transition-colors ${isDark ? 'text-foreground-disabled hover:text-foreground hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-black/5'}`} title="Dock to side panel">
                    <Sidebar size={12} />
                  </button>
                  <button onClick={onCloseChat} className={`p-1 rounded-md transition-colors ${isDark ? 'text-foreground-disabled hover:text-foreground hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-black/5'}`} title="Close">
                    <X size={12} />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto px-4 py-3" aria-live="polite">
                <motion.div
                  key="response"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={`text-sm whitespace-pre-line ${isDark ? 'text-foreground-secondary' : 'text-gray-700'}`}
                >
                  {chatMessages.filter(m => m.type === 'assistant').slice(-1)[0]?.text}
                </motion.div>
              </div>
            </div>
            </>
          )}

          {/* Input field with orb inside as leading icon */}
          <form onSubmit={handleSubmit} role="search" className="flex items-end flex-1 min-w-0">
            <Input
              size="lg"
              isDark={isDark}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything"
              className="shadow-md !px-1.5"
              leadingIcon={
                <Tooltip content={agentTyping ? '' : (chatMode !== 'closed' ? 'Herman active' : 'Herman')} isDark={isDark} side="top">
                  <button
                    type="button"
                    onClick={onOpenChat}
                    aria-label="Herman"
                    className={cn(
                      'inline-flex items-center justify-center w-6 h-6 rounded-full cursor-pointer',
                      'focus-visible:outline-none focus-visible:shadow-ring-default',
                      'transition-all duration-200',
                      isDark
                        ? 'hover:bg-white/10 active:bg-white/15'
                        : 'hover:bg-black/5 active:bg-black/10'
                    )}
                  >
                    <ParticleOrb size={12} count={80} particleSize={1.5} active={chatMode !== 'closed'} />
                  </button>
                </Tooltip>
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              trailingSlot={
                <>
                  {!input && (
                    <span className="pointer-events-none opacity-50">
                      <Badge isDark={isDark} variant="default" size="sm">/ for commands</Badge>
                    </span>
                  )}
                  <Tooltip content="Bookmarks" isDark={isDark} side="top">
                    <Button type="button" isDark={isDark} variant="ghost" size="icon" style={{ color: isDark ? 'var(--foreground)' : '#111827' }} aria-label="Bookmarks">
                      <BookmarkSimple size={16} />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Voice input" isDark={isDark} side="top">
                    <Button type="button" isDark={isDark} variant="ghost" size="icon" style={{ color: isDark ? 'var(--foreground)' : '#111827' }} aria-label="Voice input">
                      <Microphone size={16} />
                    </Button>
                  </Tooltip>
                  <Button
                    type="submit"
                    isDark={isDark}
                    variant="default"
                    size="icon"
                    disabled={!input.trim()}
                    aria-label="Send message"
                  >
                    <PaperPlaneRight size={16} />
                  </Button>
                </>
              }
            />
          </form>
          {suggestions.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setInput(s); onSubmit?.(s) }}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[11px] transition-colors cursor-pointer',
                    isDark
                      ? 'bg-white/[0.06] text-foreground-secondary hover:bg-white/[0.1] hover:text-foreground'
                      : 'bg-black/[0.04] text-gray-500 hover:bg-black/[0.07] hover:text-gray-700'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}