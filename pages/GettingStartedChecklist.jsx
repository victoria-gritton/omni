import { useState, useCallback } from 'react'
import { Check, CircleDashed } from '@phosphor-icons/react'
import { cn } from './ui/lib/utils'

/**
 * GettingStartedChecklist — portable onboarding checklist.
 *
 * Renders a segmented progress bar + task list with completed/pending states,
 * connected by a vertical line through the circle indicators.
 *
 * Each item: { id, label, description?, completed, optional? }
 */

const DEFAULT_ITEMS = [
  {
    id: 'domain',
    label: 'Set up your domain',
    description: 'Configure your custom domain for your workspace.',
    completed: true,
  },
  {
    id: 'data-source',
    label: 'Connect your AWS data source',
    description: 'Already connected via your CloudWatch account.',
    completed: true,
  },
  {
    id: 'space',
    label: 'Create your first space',
    description: 'Organize dashboards and resources into a named space.',
    completed: false,
  },
  {
    id: 'invite',
    label: 'Invite your team',
    description: 'Collaborate by adding teammates to your workspace.',
    completed: false,
  },
  {
    id: 'integrations',
    label: 'Add an integration',
    description: 'Connect tools like Slack, PagerDuty, or Jira.',
    completed: false,
    optional: true,
  },
  {
    id: 'ai-assistant',
    label: 'Customize your AI assistant',
    description: 'Tailor the assistant to your team\'s workflows.',
    completed: false,
    optional: true,
  },
]


/* ── Segmented progress bar ── */
function SegmentedProgressBar({ completed, total, isDark }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-0.5">
        {Array.from({ length: total }, (_, i) => {
          const filled = i < completed
          const isFirst = i === 0
          const isLast = i === total - 1
          return (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 transition-colors duration-spring ease-spring-smooth',
                isFirst && 'rounded-l-full',
                isLast && 'rounded-r-full',
                filled
                  ? 'bg-status-active'
                  : (isDark ? 'bg-background-surface-2' : 'bg-slate-200'),
              )}
            />
          )
        })}
      </div>
      <span
        className={cn(
          'text-body-s tabular-nums shrink-0',
          isDark ? 'text-foreground-muted' : 'text-gray-500',
        )}
      >
        {completed}/{total}
      </span>
    </div>
  )
}

/* ── Single checklist row ── */
function ChecklistItem({ item, onToggle, isDark, isLast }) {
  const { id, label, description, completed, optional } = item

  return (
    <button
      type="button"
      onClick={() => onToggle?.(id)}
      className={cn(
        'w-full flex items-start gap-3 py-2.5 text-left transition-colors duration-hover ease-spring-smooth',
        'rounded-lg -mx-1 px-1',
        isDark ? 'hover:bg-background-surface-2' : 'hover:bg-slate-50',
      )}
    >
      {/* Circle column — fixed 20px wide, connector line spans full row height */}
      <span className="relative shrink-0 w-5 self-stretch flex justify-center">
        {/* Connector line — full height of the row, behind the circle */}
        {!isLast && (
          <span
            className={cn(
              'absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px',
              isDark ? 'bg-border' : 'bg-slate-200',
            )}
            style={{ opacity: 0.3 }}
          />
        )}
        {/* Circle / check — centered at top of row */}
        <span className="relative z-10 mt-px">
          {completed ? (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-status-active">
              <Check size={12} className="text-white" weight="bold" />
            </span>
          ) : (
            <CircleDashed
              size={20}
              className={isDark ? 'text-foreground-disabled' : 'text-gray-300'}
              weight="regular"
            />
          )}
        </span>
      </span>

      {/* Text */}
      <span className="flex flex-col gap-0.5 min-w-0">
        <span
          className={cn(
            'text-body-m leading-5',
            completed
              ? cn('line-through', isDark ? 'text-foreground-disabled' : 'text-gray-400')
              : (isDark ? 'text-foreground' : 'text-gray-900'),
          )}
        >
          {label}
          {optional && (
            <span
              className={cn(
                'ml-1.5 text-body-s',
                isDark ? 'text-foreground-muted' : 'text-gray-400',
              )}
            >
              Optional
            </span>
          )}
        </span>
        {description && (
          <span
            className={cn(
              'text-body-s',
              completed
                ? (isDark ? 'text-foreground-disabled' : 'text-gray-300')
                : (isDark ? 'text-foreground-muted' : 'text-gray-500'),
            )}
          >
            {description}
          </span>
        )}
      </span>
    </button>
  )
}


/* ── Main component ── */
export default function GettingStartedChecklist({
  items: initialItems,
  onItemToggle,
  title = 'Getting Started',
  subtitle,
  isDark = true,
  className,
}) {
  const [items, setItems] = useState(initialItems || DEFAULT_ITEMS)

  const completedCount = items.filter((i) => i.completed).length
  const totalCount = items.length

  const handleToggle = useCallback(
    (id) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item,
        ),
      )
      onItemToggle?.(id)
    },
    [onItemToggle],
  )

  const greeting = subtitle ?? `Let's finish setting up — you're almost there.`

  return (
    <section
      className={cn('flex flex-col gap-3', className)}
      aria-label={title}
    >
      {/* Subtitle */}
      {greeting && (
        <p
          className={cn(
            'text-body-s',
            isDark ? 'text-foreground-muted' : 'text-gray-500',
          )}
        >
          {greeting}
        </p>
      )}

      {/* Segmented progress */}
      <SegmentedProgressBar completed={completedCount} total={totalCount} isDark={isDark} />

      {/* Items with vertical connector */}
      <div className="flex flex-col">
        {items.map((item, i) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={handleToggle}
            isDark={isDark}
            isLast={i === items.length - 1}
          />
        ))}
      </div>
    </section>
  )
}
