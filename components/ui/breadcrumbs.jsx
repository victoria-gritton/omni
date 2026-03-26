/**
 * Breadcrumbs component — SSO Rhythm
 *
 * Usage:
 *   <Breadcrumbs
 *     items={[
 *       { label: 'Home', onClick: () => navigate('/'), icon: <HomeIcon /> },
 *       { label: 'Services', onClick: () => goBack() },
 *       { label: 'pet-clinic-frontend', icon: <StatusDot /> },
 *     ]}
 *   />
 *
 * The last item is treated as the current page (non-clickable, foreground color).
 * All other items are clickable links. Each item can have an optional `icon` rendered to its left.
 */

export default function Breadcrumbs({ items = [], isDark = true, className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1

        return (
          <span key={i} className="inline-flex items-center gap-1.5">
            {/* Separator */}
            {i > 0 && (
              <span className={`text-xs select-none ${isDark ? 'text-foreground-muted' : 'text-gray-400'}`}>/</span>
            )}

            {/* Icon */}
            {item.icon && (
              <span className="inline-flex items-center shrink-0">{item.icon}</span>
            )}

            {/* Label */}
            {isLast ? (
              <span className={`font-medium ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className={`font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'text-link hover:text-link/80'
                    : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                {item.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
