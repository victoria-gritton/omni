import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { CaretDown as ChevronDown } from '@phosphor-icons/react'
import { nodes as defaultNodes, edges as defaultEdges, insights as defaultInsights, getDeviationStatus } from '../data/topology'

const STATUS_COLORS = {
  healthy:  { fill: '#34d399', stroke: '#10b981', glow: 'rgba(52,211,153,0.3)' },
  warning:  { fill: '#fbbf24', stroke: '#f59e0b', glow: 'rgba(251,191,36,0.35)' },
  degraded: { fill: '#f87171', stroke: '#ef4444', glow: 'rgba(248,113,113,0.4)' },
}

const EDGE_COLORS = {
  healthy:  'rgba(148,163,184,0.18)',
  warning:  'rgba(251,191,36,0.35)',
  degraded: 'rgba(248,113,113,0.4)',
}

const CLOUD_LABELS = { aws: 'AWS', azure: 'AZ', gcp: 'GCP', 'on-prem': 'DC' }
const CLOUD_COLORS = { aws: '#94a3b8', azure: '#94a3b8', gcp: '#94a3b8', 'on-prem': '#94a3b8' }

function isLightMode() {
  return document.documentElement.getAttribute('data-theme') === 'light'
}

const TIER_LABELS = { frontend: 'Frontend', business: 'Business Apps', platform: 'Platform', internal: 'Internal' }
const CLOUDS = ['all', 'aws', 'azure', 'gcp', 'on-prem']
const CLOUD_FILTER_LABELS = { all: 'All', aws: 'AWS', azure: 'Azure', gcp: 'GCP', 'on-prem': 'On-prem' }
const STATUSES = ['all', 'healthy', 'warning', 'degraded']
const STATUS_FILTER_LABELS = { all: 'All', healthy: 'Healthy', warning: 'Warning', degraded: 'Degraded' }
const LERP_SPEED = 0.12

function getNodeRadius(requests) {
  const min = 14, max = 28
  const scale = Math.log10(Math.max(requests, 1000)) / Math.log10(5000000)
  return min + (max - min) * Math.min(scale, 1)
}

function edgeWidth(rps) {
  return 0.6 + Math.min(rps / 2000, 4)
}

function formatRequests(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function FilterDropdown({ label, value, options, onChange, displayLabels }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const getLabel = (v) => displayLabels ? displayLabels[v] || v : v
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--background-surface-1)] px-2 py-[3px] hover:bg-[var(--input-2)] transition-colors`}
        style={{ fontFamily: "'Amazon Ember', sans-serif", fontSize: 11 }}>
        <span className="text-[#b4bec9]">{label}:</span>
        <span className="text-[#d1d5db] font-medium">{getLabel(value)}</span>
        <svg width="8" height="6" viewBox="0 0 8 6" fill="#539fe5" className={`transition-transform ${open ? 'rotate-180' : ''}`}><path d="M0.5 0.5l3.5 4.5 3.5-4.5z"/></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 min-w-[140px] rounded-lg border border-[var(--glass-border)] bg-[var(--background-surface-2)] p-1 shadow-xl">
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
              className={`flex items-center justify-between w-full px-3 py-1.5 text-left text-[11px] rounded-md transition-colors ${
                opt === value ? 'border border-[#0972D3] bg-[#0a1929] text-[var(--foreground-secondary)]' : 'border border-transparent text-[var(--foreground-muted)] hover:bg-[var(--input)]'}`}>
              <span>{label}: {getLabel(opt)}</span>
              {opt === value && <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#0972D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 8.5 6.5 12 13 4"/></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Bezier point helper for edge hit testing
function bezierPoint(from, mx, my, to, t) {
  const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * mx + t * t * to.x
  const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * my + t * t * to.y
  return { x, y }
}

export default function TopologyMap({
  highlightNodes = [], highlightEdges = [], onNodeClick, onEdgeClick,
  customNodes, customEdges, customInsights, extraFilters, isolatedNode,
}) {
  const activeNodes = customNodes || defaultNodes
  const activeEdges = customEdges || defaultEdges
  const activeInsights = customInsights || defaultInsights

  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [hovered, setHovered] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const [dims, setDims] = useState({ w: 800, h: 500 })
  const [filterCloud, setFilterCloud] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const animRef = useRef(0)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0 })

  const camTarget = useRef({ x: 0, y: 0, zoom: 1 })
  const camCurrent = useRef({ x: 0, y: 0, zoom: 1 })
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, camStartX: 0, camStartY: 0 })

  // Build problem count map from insights
  const problemCounts = useMemo(() => {
    const counts = {}
    activeInsights.forEach(ins => {
      if (ins.severity === 'critical' || ins.severity === 'high' || ins.severity === 'medium') {
        (ins.relatedNodes || []).forEach(id => {
          counts[id] = (counts[id] || 0) + 1
        })
      }
    })
    return counts
  }, [activeInsights])

  const interestingIds = useMemo(() => {
    // When customNodes are provided (Applications page), show all of them
    if (customNodes) return new Set(customNodes.map(n => n.id))
    const ids = new Set()
    activeNodes.forEach(n => { if (n.status !== 'healthy') ids.add(n.id) })
    activeInsights.forEach(ins => { ins.relatedNodes.forEach(id => ids.add(id)) })
    const snapshot = new Set(ids)
    activeEdges.forEach(e => {
      if (snapshot.has(e.from)) ids.add(e.to)
      if (snapshot.has(e.to)) ids.add(e.from)
    })
    return ids
  }, [activeNodes, activeEdges, activeInsights, customNodes])

  const filteredNodes = useMemo(() => {
    return activeNodes.filter(n => {
      if (!interestingIds.has(n.id)) return false
      if (filterCloud !== 'all' && n.cloud !== filterCloud) return false
      if (filterStatus !== 'all' && n.status !== filterStatus) return false
      return true
    })
  }, [activeNodes, interestingIds, filterCloud, filterStatus])

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes])
  const filteredEdges = useMemo(() => activeEdges.filter(e => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to)), [activeEdges, filteredNodeIds])

  // 2-hop isolation set (for dimming, not hiding)
  const isolationSet = useMemo(() => {
    if (!isolatedNode) return null
    const neighborhood = new Set([isolatedNode])
    filteredEdges.forEach(e => {
      if (e.from === isolatedNode) neighborhood.add(e.to)
      if (e.to === isolatedNode) neighborhood.add(e.from)
    })
    const oneHop = new Set(neighborhood)
    filteredEdges.forEach(e => {
      if (oneHop.has(e.from)) neighborhood.add(e.to)
      if (oneHop.has(e.to)) neighborhood.add(e.from)
    })
    return neighborhood
  }, [filteredEdges, isolatedNode])

  // All filtered nodes are visible (no hiding), isolation just dims
  const visibleNodes = filteredNodes
  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes])
  const visibleEdges = useMemo(() => filteredEdges.filter(e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)), [filteredEdges, visibleNodeIds])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDims({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const particles = []
    visibleEdges.forEach(edge => {
      const count = Math.max(1, Math.ceil(edge.rps / 3000))
      for (let i = 0; i < count; i++) {
        particles.push({ edge, t: Math.random(), speed: 0.0015 + Math.random() * 0.002 })
      }
    })
    particlesRef.current = particles
  }, [visibleEdges])

  const layoutPositions = useMemo(() => {
    const map = {}
    const sorted = [...visibleNodes].sort((a, b) => {
      const tierOrder = { frontend: 0, business: 1, platform: 2, internal: 3 }
      return (tierOrder[a.tier] ?? 2) - (tierOrder[b.tier] ?? 2)
    })
    const tiers = []
    let curTier = null
    sorted.forEach(n => {
      if (n.tier !== curTier) { tiers.push([]); curTier = n.tier }
      tiers[tiers.length - 1].push(n)
    })
    const rowCount = tiers.length
    tiers.forEach((tierNodes, rowIdx) => {
      const cols = tierNodes.length
      tierNodes.forEach((n, colIdx) => {
        map[n.id] = {
          x: ((colIdx + 0.5) / Math.max(cols, 1)),
          y: ((rowIdx + 0.5) / Math.max(rowCount, 1)),
        }
      })
    })
    return map
  }, [visibleNodes])

  const getWorldPos = useCallback((node) => {
    const pos = layoutPositions[node.id]
    if (pos) return { x: pos.x * dims.w, y: pos.y * dims.h }
    return { x: node.x * dims.w, y: node.y * dims.h }
  }, [dims, layoutPositions])

  const screenToWorld = useCallback((sx, sy) => {
    const cam = camCurrent.current
    return { x: (sx - cam.x) / cam.zoom, y: (sy - cam.y) / cam.zoom }
  }, [])

  const hitTest = useCallback((sx, sy) => {
    const world = screenToWorld(sx, sy)
    for (const node of visibleNodes) {
      const pos = getWorldPos(node)
      const r = getNodeRadius(node.requests) / camCurrent.current.zoom
      const dx = world.x - pos.x, dy = world.y - pos.y
      if (dx * dx + dy * dy <= (r + 6) * (r + 6)) return node
    }
    return null
  }, [getWorldPos, screenToWorld, visibleNodes])

  const edgeHitTest = useCallback((sx, sy) => {
    const world = screenToWorld(sx, sy)
    const threshold = 8 / camCurrent.current.zoom
    for (const edge of visibleEdges) {
      const fromNode = visibleNodes.find(n => n.id === edge.from)
      const toNode = visibleNodes.find(n => n.id === edge.to)
      if (!fromNode || !toNode) continue
      const from = getWorldPos(fromNode)
      const to = getWorldPos(toNode)
      const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.08
      const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.08
      for (let i = 0; i <= 20; i++) {
        const t = i / 20
        const pt = bezierPoint(from, mx, my, to, t)
        const dx = world.x - pt.x, dy = world.y - pt.y
        if (dx * dx + dy * dy <= threshold * threshold) return edge
      }
    }
    return null
  }, [getWorldPos, screenToWorld, visibleEdges, visibleNodes])

  const handleMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const hit = hitTest(sx, sy)
    if (hit) return
    dragRef.current = {
      dragging: true, startX: e.clientX, startY: e.clientY,
      camStartX: camTarget.current.x, camStartY: camTarget.current.y,
    }
    canvasRef.current.style.cursor = 'grabbing'
  }, [hitTest])

  const handleMouseMove = useCallback((e) => {
    const drag = dragRef.current
    if (drag.dragging) {
      camTarget.current.x = drag.camStartX + (e.clientX - drag.startX)
      camTarget.current.y = drag.camStartY + (e.clientY - drag.startY)
      return
    }
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    mouseRef.current = { x: sx, y: sy }
    const nodeHit = hitTest(sx, sy)
    if (nodeHit) {
      setHovered(nodeHit)
      setHoveredEdge(null)
      canvasRef.current.style.cursor = 'pointer'
      return
    }
    setHovered(null)
    const edgeHit = edgeHitTest(sx, sy)
    setHoveredEdge(edgeHit)
    canvasRef.current.style.cursor = edgeHit ? 'pointer' : 'grab'
  }, [hitTest, edgeHitTest])

  const handleMouseUp = useCallback(() => {
    dragRef.current.dragging = false
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
  }, [])

  const handleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const nodeHit = hitTest(sx, sy)
    if (nodeHit) { if (onNodeClick) onNodeClick(nodeHit); return }
    const edgeHit = edgeHitTest(sx, sy)
    if (edgeHit && onEdgeClick) onEdgeClick(edgeHit)
  }, [hitTest, edgeHitTest, onNodeClick, onEdgeClick])

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    let running = true
    const draw = () => {
      if (!running) return
      const light = isLightMode()
      canvas.width = dims.w * dpr
      canvas.height = dims.h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, dims.w, dims.h)

      const cur = camCurrent.current
      const tgt = camTarget.current
      cur.x = lerp(cur.x, tgt.x, LERP_SPEED)
      cur.y = lerp(cur.y, tgt.y, LERP_SPEED)
      cur.zoom = lerp(cur.zoom, tgt.zoom, LERP_SPEED)

      ctx.save()
      ctx.translate(cur.x, cur.y)
      ctx.scale(cur.zoom, cur.zoom)

      const highlightNodeSet = new Set(highlightNodes)
      const highlightEdgeSet = new Set(highlightEdges.map(e => `${e.from}->${e.to}`))
      const hasHighlight = highlightNodeSet.size > 0 || highlightEdgeSet.size > 0

      // Tier labels
      const tierList = ['frontend', 'business', 'platform', 'internal']
      tierList.forEach(t => {
        const tierNodes = visibleNodes.filter(n => n.tier === t)
        if (tierNodes.length === 0) return
        const minY = Math.min(...tierNodes.map(n => getWorldPos(n).y)) - 28
        ctx.fillStyle = light ? 'rgba(100,116,139,0.35)' : 'rgba(148,163,184,0.10)'
        ctx.font = '9px Inter, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(TIER_LABELS[t], 8, minY + 4)
      })

      // Edges
      visibleEdges.forEach(edge => {
        const fromNode = visibleNodes.find(n => n.id === edge.from)
        const toNode = visibleNodes.find(n => n.id === edge.to)
        if (!fromNode || !toNode) return
        const from = getWorldPos(fromNode)
        const to = getWorldPos(toNode)
        const key = `${edge.from}->${edge.to}`
        const isHighlighted = highlightEdgeSet.has(key)
        const dimmed = hasHighlight && !isHighlighted
        const isIsolationDimmed = isolationSet && (!isolationSet.has(edge.from) || !isolationSet.has(edge.to))
        const isEdgeHovered = hoveredEdge && hoveredEdge.from === edge.from && hoveredEdge.to === edge.to

        const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.08
        const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.08

        const crossCloud = fromNode.cloud && toNode.cloud && fromNode.cloud !== toNode.cloud
        if (crossCloud) ctx.setLineDash([4, 3])

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.quadraticCurveTo(mx, my, to.x, to.y)

        if (isEdgeHovered) {
          ctx.strokeStyle = 'rgba(34,211,238,0.6)'
          ctx.lineWidth = (edgeWidth(edge.rps) + 1.5) / cur.zoom
        } else if (dimmed || isIsolationDimmed) {
          ctx.strokeStyle = light ? 'rgba(148,163,184,0.06)' : 'rgba(148,163,184,0.03)'
          ctx.lineWidth = edgeWidth(edge.rps) / cur.zoom
        } else {
          ctx.strokeStyle = isHighlighted ? (EDGE_COLORS[edge.status] === EDGE_COLORS.healthy ? 'rgba(34,211,238,0.5)' : EDGE_COLORS[edge.status])
            : EDGE_COLORS[edge.status]
          ctx.lineWidth = (isHighlighted ? edgeWidth(edge.rps) + 0.8 : edgeWidth(edge.rps)) / cur.zoom
        }
        ctx.stroke()
        if (crossCloud) ctx.setLineDash([])
      })

      // Particles
      particlesRef.current.forEach(p => {
        p.t += p.speed
        if (p.t > 1) p.t -= 1
        const fromNode = visibleNodes.find(n => n.id === p.edge.from)
        const toNode = visibleNodes.find(n => n.id === p.edge.to)
        if (!fromNode || !toNode) return
        const from = getWorldPos(fromNode)
        const to = getWorldPos(toNode)
        const dimmed = hasHighlight && !highlightEdgeSet.has(`${p.edge.from}->${p.edge.to}`)
        const isIsolationDimmed = isolationSet && (!isolationSet.has(p.edge.from) || !isolationSet.has(p.edge.to))
        if (dimmed || isIsolationDimmed) return
        const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.08
        const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.08
        const t = p.t
        const px = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * mx + t * t * to.x
        const py = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * my + t * t * to.y
        ctx.beginPath()
        ctx.arc(px, py, 1.2 / cur.zoom, 0, Math.PI * 2)
        ctx.fillStyle = p.edge.status === 'degraded' ? 'rgba(248,113,113,0.7)'
          : p.edge.status === 'warning' ? 'rgba(251,191,36,0.6)' : 'rgba(148,163,184,0.3)'
        ctx.fill()
      })

      // Nodes
      const statusOrder = { healthy: 0, warning: 1, degraded: 2 }
      const sortedNodes = [...visibleNodes].sort((a, b) => (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0))
      sortedNodes.forEach(node => {
        const pos = getWorldPos(node)
        const r = getNodeRadius(node.requests)
        const colors = STATUS_COLORS[node.status]
        const isHovered = hovered?.id === node.id
        const isHighlighted = highlightNodeSet.has(node.id)
        const dimmed = hasHighlight && !isHighlighted
        const isIsolationDimmed = isolationSet && !isolationSet.has(node.id)
        const isDimmed = dimmed || isIsolationDimmed

        if ((node.status !== 'healthy' || isHighlighted || isHovered) && !isDimmed) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, r + 10, 0, Math.PI * 2)
          const grad = ctx.createRadialGradient(pos.x, pos.y, r, pos.x, pos.y, r + 10)
          grad.addColorStop(0, isHighlighted ? 'rgba(34,211,238,0.25)' : colors.glow)
          grad.addColorStop(1, 'transparent')
          ctx.fillStyle = grad
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
        ctx.fillStyle = isDimmed
          ? (light ? 'rgba(226,232,240,0.4)' : 'rgba(30,41,59,0.3)')
          : (light ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.85)')
        ctx.fill()
        ctx.strokeStyle = isDimmed
          ? (light ? 'rgba(148,163,184,0.15)' : 'rgba(71,85,105,0.12)')
          : isHighlighted ? '#22d3ee' : colors.stroke
        ctx.lineWidth = (isHovered || isHighlighted ? 2 : 1.2) / cur.zoom
        ctx.stroke()

        if (!isDimmed) {
          ctx.beginPath()
          ctx.arc(pos.x + r * 0.6, pos.y - r * 0.6, 3, 0, Math.PI * 2)
          ctx.fillStyle = colors.fill
          ctx.fill()
        }

        // Problem count badge
        const pCount = problemCounts[node.id]
        if (pCount && !isDimmed) {
          const bx = pos.x + r * 0.5
          const by = pos.y - r * 0.7
          const badgeR = 7
          ctx.beginPath()
          ctx.arc(bx, by, badgeR, 0, Math.PI * 2)
          ctx.fillStyle = pCount >= 2 ? '#ef4444' : '#f59e0b'
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = '600 7px Inter, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(pCount), bx, by)
          ctx.textBaseline = 'alphabetic'
        }

        // Label
        ctx.fillStyle = isDimmed
          ? (light ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.10)')
          : isHighlighted
            ? (light ? '#1e293b' : '#e2e8f0')
            : (light ? 'rgba(51,65,85,0.85)' : 'rgba(203,213,225,0.8)')
        ctx.font = `${isHovered ? '600' : '500'} 9px Inter, sans-serif`
        ctx.textAlign = 'center'
        const maxLabelW = 70
        let labelBottomY = pos.y + r + 14
        if (ctx.measureText(node.label).width > maxLabelW) {
          const words = node.label.split(' ')
          let line1 = words[0]
          let line2 = ''
          for (let wi = 1; wi < words.length; wi++) {
            const test = line1 + ' ' + words[wi]
            if (ctx.measureText(test).width <= maxLabelW) { line1 = test }
            else { line2 = words.slice(wi).join(' '); break }
          }
          ctx.fillText(line1, pos.x, pos.y + r + 13)
          if (line2) {
            ctx.fillText(line2, pos.x, pos.y + r + 23)
            labelBottomY = pos.y + r + 23
          }
        } else {
          ctx.fillText(node.label, pos.x, pos.y + r + 14)
        }

        // Latency inside node
        if (!isDimmed) {
          ctx.fillStyle = light ? 'rgba(51,65,85,0.9)' : 'rgba(203,213,225,0.85)'
          ctx.font = '600 9px JetBrains Mono, monospace'
          ctx.textAlign = 'center'
          ctx.fillText(formatRequests(node.requests), pos.x, pos.y + 1)
        }
      })

      // Node Tooltip
      if (hovered) {
        const pos = getWorldPos(hovered)
        const r = getNodeRadius(hovered.requests)
        const lines = [
          hovered.label,
          `${hovered.latency}ms p95  ·  ${hovered.errorRate}% errors`,
          `${(hovered.requests / 1000).toFixed(0)}K req/min  ·  ${hovered.tier}`,
        ]
        const lineH = 15
        const boxW = 200
        const boxH = lines.length * lineH + 18
        const tx = pos.x + r + 14
        const ty = pos.y - 18
        const fx = (tx + boxW) * cur.zoom + cur.x > dims.w ? pos.x - r - boxW - 14 : tx

        ctx.fillStyle = light ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.92)'
        ctx.strokeStyle = light ? 'rgba(148,163,184,0.2)' : 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1 / cur.zoom
        ctx.beginPath()
        ctx.roundRect(fx, ty, boxW, boxH, 6)
        ctx.fill()
        ctx.stroke()

        if (hovered.cloud) {
          const cl = CLOUD_LABELS[hovered.cloud] || hovered.cloud
          ctx.font = '600 8px Inter, sans-serif'
          const cw = ctx.measureText(cl).width + 6
          const cx = fx + boxW - cw - 6
          const cy = ty + 5
          ctx.fillStyle = '#94a3b822'
          ctx.beginPath()
          ctx.roundRect(cx, cy, cw, 13, 3)
          ctx.fill()
          ctx.fillStyle = '#94a3b8'
          ctx.textAlign = 'center'
          ctx.fillText(cl, cx + cw / 2, cy + 10)
        }

        lines.forEach((line, i) => {
          ctx.fillStyle = i === 0 ? (light ? '#1e293b' : '#e2e8f0') : (light ? '#64748b' : '#94a3b8')
          ctx.font = i === 0 ? '600 11px Inter, sans-serif' : '10px Inter, sans-serif'
          ctx.textAlign = 'left'
          ctx.fillText(line, fx + 8, ty + 14 + i * lineH)
        })
      }

      // Edge Tooltip
      if (hoveredEdge && !hovered) {
        const fromNode = visibleNodes.find(n => n.id === hoveredEdge.from)
        const toNode = visibleNodes.find(n => n.id === hoveredEdge.to)
        if (fromNode && toNode) {
          const crossCloud = fromNode.cloud && toNode.cloud && fromNode.cloud !== toNode.cloud
          const lines = [
            `${fromNode.label} > ${toNode.label}`,
            `${hoveredEdge.rps >= 1000 ? (hoveredEdge.rps / 1000).toFixed(1) + 'K' : hoveredEdge.rps} calls/s`,
            `Error: ${(hoveredEdge.errorRate != null ? hoveredEdge.errorRate : 0).toFixed(2)}%`,
            `Latency p95: ${hoveredEdge.latency || 0}ms`,
          ]
          if (crossCloud) {
            const fc = CLOUD_LABELS[fromNode.cloud] || fromNode.cloud
            const tc = CLOUD_LABELS[toNode.cloud] || toNode.cloud
            lines.push(`Cross-cloud: ${fc} > ${tc}`)
          }
          const world = screenToWorld(mouseRef.current.x, mouseRef.current.y)
          const lineH = 15
          const boxW = 210
          const boxH = lines.length * lineH + 18
          const fx = world.x + 12
          const fy = world.y - boxH / 2

          ctx.fillStyle = light ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.92)'
          ctx.strokeStyle = light ? 'rgba(148,163,184,0.2)' : 'rgba(255,255,255,0.08)'
          ctx.lineWidth = 1 / cur.zoom
          ctx.beginPath()
          ctx.roundRect(fx, fy, boxW, boxH, 6)
          ctx.fill()
          ctx.stroke()

          lines.forEach((line, i) => {
            ctx.fillStyle = i === 0 ? (light ? '#1e293b' : '#e2e8f0') : (light ? '#64748b' : '#94a3b8')
            ctx.font = i === 0 ? '600 11px Inter, sans-serif' : '10px Inter, sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText(line, fx + 8, fy + 14 + i * lineH)
          })
        }
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { running = false; cancelAnimationFrame(animRef.current) }
  }, [dims, hovered, hoveredEdge, highlightNodes, highlightEdges, getWorldPos, visibleNodes, visibleEdges, isolationSet, problemCounts])

  useEffect(() => {
    const onUp = () => { dragRef.current.dragging = false }
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [])

  return (
    <div ref={containerRef} className="relative h-full w-full min-h-[400px]">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="text-sm font-semibold text-[var(--foreground)] mr-1">Application map</span>
        <span className="text-[10px] text-[var(--foreground-disabled)] ml-1">{visibleNodes.length} apps of interest</span>
      </div>

      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setHovered(null); setHoveredEdge(null); dragRef.current.dragging = false }}
        onClick={handleClick}
      />
    </div>
  )
}
