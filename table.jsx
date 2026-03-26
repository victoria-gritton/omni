import { createContext, useContext } from 'react'

/**
 * Table component — SSO Rhythm
 *
 * Composable table primitives: Table, TableHeader, TableBody, TableFooter,
 * TableRow, TableHead, TableCell, TableCaption
 *
 * Density:
 *   "default"  — h-10 header, h-[52px] cells
 *   "compact"  — h-8 header, h-auto min-h-8 cells
 *
 * TableCell props:
 *   wrap       — If true, content wraps instead of truncating
 *   align      — "left" | "right"
 *   bold       — font-medium
 */

const TableContext = createContext({ density: 'default' })

export function Table({ isDark = true, density = 'default', className = '', children, ...props }) {
  return (
    <TableContext.Provider value={{ density }}>
      <table
        className={`w-full text-xs tracking-[-0.12px] leading-[18px] ${className}`}
        {...props}
      >
        {children}
      </table>
    </TableContext.Provider>
  )
}

export function TableHeader({ isDark = true, className = '', children, ...props }) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ isDark = true, className = '', children, ...props }) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  )
}

export function TableFooter({ isDark = true, className = '', children, ...props }) {
  const bg = isDark ? 'bg-background-surface-2/50' : 'bg-slate-100'
  return (
    <tfoot className={`${bg} ${className}`} {...props}>
      {children}
    </tfoot>
  )
}

export function TableRow({ isDark = true, className = '', children, ...props }) {
  const border = isDark ? 'border-border-muted' : 'border-slate-200'
  return (
    <tr className={`border-b ${border} ${className}`} {...props}>
      {children}
    </tr>
  )
}

export function TableHead({ isDark = true, align = 'left', className = '', children, ...props }) {
  const { density } = useContext(TableContext)
  const color = isDark ? 'text-foreground-muted' : 'text-slate-500'
  const alignment = align === 'right' ? 'text-right' : 'text-left'
  const height = density === 'compact' ? 'h-8' : 'h-10'
  return (
    <th
      className={`${height} px-2 font-bold ${color} ${alignment} min-w-[85px] ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ isDark = true, align = 'left', bold = false, wrap = false, className = '', children, ...props }) {
  const { density } = useContext(TableContext)
  const color = isDark ? 'text-foreground' : 'text-gray-900'
  const alignment = align === 'right' ? 'text-right' : 'text-left'
  const weight = bold ? 'font-medium' : 'font-normal'
  const heightClass = density === 'compact' ? 'py-1.5' : 'h-[52px]'
  const overflow = wrap ? '' : 'truncate'
  return (
    <td
      className={`${heightClass} px-2 ${color} ${alignment} ${weight} min-w-[85px] ${overflow} ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}

export function TableCaption({ isDark = true, className = '', children, ...props }) {
  const color = isDark ? 'text-foreground-muted' : 'text-slate-500'
  return (
    <caption
      className={`caption-bottom pt-4 h-9 ${color} text-center ${className}`}
      {...props}
    >
      {children}
    </caption>
  )
}
