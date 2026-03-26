/**
 * Utility: conditional class name joiner (cn)
 * Lightweight alternative to clsx/tailwind-merge for this design system.
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}

/**
 * Formatters — common display helpers
 */
export function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function formatDuration(ms) {
  if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}m`
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(1)}s`
  return `${ms}ms`
}

export function formatPercent(value, decimals = 1) {
  return `${Number(value).toFixed(decimals)}%`
}
