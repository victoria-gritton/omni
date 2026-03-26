import { useState, useEffect, useRef, useMemo } from 'react'
import { MagnifyingGlassMinus, MagnifyingGlassPlus, ArrowsIn, ArrowsOut, Sparkle } from '@phosphor-icons/react'
import Card from './ui/card'
import Button from './ui/button'
import Breadcrumbs from './ui/breadcrumbs'
import SegmentedControl from './ui/segmented-control'

const statusFilterOptions = [
  { id: 'healthy', label: 'Healthy', dot: '#22c55e' },
  { id: 'warning', label: 'Warning', dot: '#eab308' },
  { id: 'critical', label: 'Critical', dot: '#ef4444' },
]

export default function ApplicationMap({ isDark, externalStatusFilter, activeFilter: externalActiveFilter, onFilterChange, viewMode, visibleNodeIds = null }) {
  const [hoveredNode, setHoveredNode] = useState(null)
  const [zoom, setZoom] = useState(null) // null = not yet computed
  const [fitZoom, setFitZoom] = useState(1) // the computed fit-to-screen zoom
  const [mapReady, setMapReady] = useState(false) // fade-in after zoom computed
  const [internalActiveFilter, setInternalActiveFilter] = useState('application')
  const activeFilter = externalActiveFilter || internalActiveFilter
  const setActiveFilter = onFilterChange || setInternalActiveFilter
  const [statusFilter, setStatusFilter] = useState(null)
  const canvasRef = useRef(null)
  const drillCanvasRef = useRef(null)
  const drillAnimRef = useRef(null)

  // Sync external status filter from InsightsCards
  useEffect(() => {
    if (externalStatusFilter !== undefined) {
      setStatusFilter(externalStatusFilter)
    }
  }, [externalStatusFilter])
  const animFrameRef = useRef(null)
  const particlesRef = useRef([])
  const containerRef = useRef(null)
  const [isPanning, setIsPanning] = useState(false)
  const [expandedNode, setExpandedNode] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [drillZoom, setDrillZoom] = useState(1)
  const [drillStatusFilter, setDrillStatusFilter] = useState(null)
  const [expandedDrillNode, setExpandedDrillNode] = useState(null)
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })
  const nodeOpacityRef = useRef(new Map())
  const nodeOpacityAnimRef = useRef(null)
  const [, forceRender] = useState(0)

  // Mock detail data for expanded cards
  const serviceDetails = {
    health: {
      critical: { errors4xx: '0.8%', faults5xx: '4.2%', unhealthy: '3/4' },
      warning:  { errors4xx: '0.3%', faults5xx: '1.1%', unhealthy: '1/4' },
      healthy:  { errors4xx: '0%',   faults5xx: '0%',   unhealthy: '0/4' },
    },
    changes: [
      { type: 'Deployment', name: 'ListTicketsLite', time: '43 min ago', initiator: 'TicketingLiteDeployment' },
      { type: 'Deployment', name: 'ReadTicketLite', time: '43 min ago', initiator: 'TicketingLiteDeployment' },
    ],
  }

  // Agent-mode data by filter
  const agentServicesByFilter = {
    'application': [
      { id: 'orchestrator', name: 'Orchestrator Agent', platform: 'Main Orchestration',       requests: '180.0K', x: 140, y: 50,  status: 'critical', connections: ['order-agent'] },
      { id: 'order-agent',  name: 'Order Agent',        platform: 'Order Processing Agent',   requests: '45.0K',  x: 380, y: 50,  status: 'critical', connections: ['retrieval-agent'] },
      { id: 'retrieval-agent', name: 'Retrieval Agent',  platform: 'RAG Pipeline Agent',      requests: '62.0K',  x: 620, y: 50,  status: 'warning', connections: [] },
      { id: 'auth-agent',   name: 'Auth Agent',         platform: 'Authentication Agent',     requests: '95.0K',  x: 0,   y: 190, status: 'healthy', connections: ['guardrail-agent'] },
      { id: 'guardrail-agent', name: 'Guardrail Agent',  platform: 'Safety & Compliance',     requests: '210.0K', x: 200, y: 190, status: 'healthy', connections: [] },
      { id: 'payment-agent', name: 'Payment Agent',     platform: 'Payment Processing Agent', requests: '38.0K',  x: 400, y: 190, status: 'healthy', connections: [] },
      { id: 'recommend-agent', name: 'Recommendation Agent', platform: 'ML Recommendation',   requests: '62.0K',  x: 600, y: 190, status: 'healthy', connections: [] },
      { id: 'support-agent', name: 'Support Agent',      platform: 'Customer Support Agent',  requests: '31.4K',  x: 800, y: 190, status: 'healthy', connections: [] },
      { id: 'inventory-agent', name: 'Inventory Agent',  platform: 'Stock Management Agent',  requests: '22.5K',  x: 0,   y: 330, status: 'healthy', connections: [] },
      { id: 'shipping-agent', name: 'Shipping Agent',    platform: 'Logistics Agent',         requests: '18.2K',  x: 200, y: 330, status: 'healthy', connections: [] },
      { id: 'analytics-agent', name: 'Analytics Agent',  platform: 'Data Analytics Agent',    requests: '44.0K',  x: 400, y: 330, status: 'healthy', connections: [] },
    ],
    'business-unit': [
      { id: 'bu-customer',   name: 'Customer Experience Agents', platform: '5 Agents',  requests: '320.0K', x: 140, y: 50,  status: 'critical', connections: ['bu-fulfillment'] },
      { id: 'bu-fulfillment', name: 'Fulfillment Agents',       platform: '4 Agents',  requests: '85.6K',  x: 620, y: 50,  status: 'warning',  connections: ['bu-data-ai'] },
      { id: 'bu-platform-ai', name: 'Platform AI Agents',       platform: '3 Agents',  requests: '210.0K', x: 0,   y: 190, status: 'healthy', connections: ['bu-security-ai'] },
      { id: 'bu-data-ai',    name: 'Data & Analytics Agents',   platform: '3 Agents',  requests: '106.0K', x: 200, y: 190, status: 'healthy', connections: [] },
      { id: 'bu-security-ai', name: 'Security & Compliance Agents', platform: '2 Agents', requests: '225.0K', x: 400, y: 190, status: 'healthy', connections: [] },
      { id: 'bu-finance-ai', name: 'Finance Agents',            platform: '2 Agents',  requests: '38.0K',  x: 600, y: 190, status: 'healthy', connections: [] },
    ],
    'team': [
      { id: 'tm-orchestration', name: 'Orchestration Team',  platform: '3 Engineers', requests: '180.0K', x: 140, y: 50,  status: 'critical', connections: ['tm-ml'] },
      { id: 'tm-guardrails',    name: 'Guardrails Team',     platform: '2 Engineers', requests: '210.0K', x: 620, y: 50,  status: 'warning',  connections: ['tm-ml'] },
      { id: 'tm-ml',            name: 'ML Platform Team',    platform: '5 Engineers', requests: '106.0K', x: 0,   y: 190, status: 'healthy', connections: ['tm-infra-ai'] },
      { id: 'tm-domain',        name: 'Domain Agents Team',  platform: '4 Engineers', requests: '136.6K', x: 200, y: 190, status: 'healthy', connections: [] },
      { id: 'tm-infra-ai',      name: 'AI Infrastructure',   platform: '3 Engineers', requests: '95.0K',  x: 400, y: 190, status: 'healthy', connections: [] },
      { id: 'tm-eval',          name: 'Evaluation Team',     platform: '2 Engineers', requests: '44.0K',  x: 600, y: 190, status: 'healthy', connections: [] },
    ],
    'environment': [
      { id: 'env-prod-agents',    name: 'Production Agents',    platform: 'us-east-1',      requests: '680.0K', x: 140, y: 50,  status: 'critical', connections: ['env-staging-agents'] },
      { id: 'env-staging-agents', name: 'Staging Agents',       platform: 'us-west-2',      requests: '45.2K',  x: 620, y: 50,  status: 'warning',  connections: ['env-prod-agents'] },
      { id: 'env-dev-agents',     name: 'Development Agents',   platform: 'us-west-2',      requests: '12.0K',  x: 0,   y: 190, status: 'healthy', connections: ['env-eval'] },
      { id: 'env-eval',           name: 'Evaluation Environment', platform: 'us-east-2',    requests: '28.5K',  x: 200, y: 190, status: 'healthy', connections: ['env-staging-agents'] },
      { id: 'env-sandbox-agents', name: 'Sandbox Agents',       platform: 'us-west-1',      requests: '3.1K',   x: 400, y: 190, status: 'healthy', connections: [] },
      { id: 'env-canary',         name: 'Canary Environment',   platform: 'us-east-1',      requests: '8.8K',   x: 600, y: 190, status: 'healthy', connections: [] },
    ],
  }

  const agentConnectionsByFilter = {
    'application': {
      'orchestrator-order-agent': 'critical',
      'order-agent-retrieval-agent': 'warning',
      'auth-agent-guardrail-agent': 'healthy',
    },
    'business-unit': {
      'bu-customer-bu-fulfillment': 'critical',
      'bu-fulfillment-bu-data-ai': 'warning',
      'bu-platform-ai-bu-security-ai': 'healthy',
    },
    'team': {
      'tm-orchestration-tm-ml': 'critical',
      'tm-guardrails-tm-ml': 'warning',
      'tm-ml-tm-infra-ai': 'healthy',
    },
    'environment': {
      'env-prod-agents-env-staging-agents': 'critical',
      'env-staging-agents-env-prod-agents': 'warning',
      'env-dev-agents-env-eval': 'healthy',
      'env-eval-env-staging-agents': 'healthy',
    },
  }

  const servicesByFilter = {
    'application': [
      { id: 'logging',      name: 'Logging Pipeline',  platform: 'AWS-Kinesis',      requests: '45.8K', x: 140, y: 50, status: 'critical', connections: ['sms'] },
      { id: 'sms',          name: 'SMS Service',        platform: 'Twilio',           requests: '0.3K',  x: 380, y: 50, status: 'critical', connections: ['imageservice'] },
      { id: 'imageservice', name: 'ImageService',       platform: 'Azure-AKS',        requests: '6.2K',  x: 620, y: 50, status: 'warning',  connections: [] },
      { id: 'shopfront',    name: 'pet-clinic-frontend-java', platform: 'AWS-ECS',    requests: '12.0K', x: 0,   y: 190, status: 'healthy', connections: ['catalog', 'auth'] },
      { id: 'catalog',      name: 'Catalog',            platform: 'AWS-ECS',          requests: '8.5K',  x: 200, y: 190, status: 'healthy', connections: ['cache'] },
      { id: 'auth',         name: 'Auth Service',       platform: 'AWS-Cognito',      requests: '5.6K',  x: 400, y: 190, status: 'healthy', connections: [] },
      { id: 'orderservice', name: 'OrderService',       platform: 'AWS-ECS',          requests: '4.3K',  x: 600, y: 190, status: 'healthy', connections: [] },
      { id: 'notification', name: 'Notification Service', platform: 'AWS-SNS',        requests: '2.1K',  x: 800, y: 190, status: 'healthy', connections: ['userdb'] },
      { id: 'cdn',          name: 'CloudFront CDN',     platform: 'AWS-CloudFront',   requests: '25.4K', x: 0,   y: 330, status: 'healthy', connections: [] },
      { id: 'cache',        name: 'Redis Cache',        platform: 'AWS-ElastiCache',  requests: '15.2K', x: 200, y: 330, status: 'healthy', connections: [] },
      { id: 'payment',      name: 'Payment Service',    platform: 'AWS-Lambda',       requests: '3.1K',  x: 400, y: 330, status: 'healthy', connections: ['stripe'] },
      { id: 'productsdb',   name: 'Products DB',        platform: 'AWS-RDS',          requests: '9.2K',  x: 600, y: 330, status: 'healthy', connections: [] },
      { id: 'userdb',       name: 'User DB',            platform: 'AWS-RDS',          requests: '5.5K',  x: 800, y: 330, status: 'healthy', connections: [] },
      { id: 'ordersdb',     name: 'Orders DB',          platform: 'AWS-DynamoDB',     requests: '7.6K',  x: 0,   y: 470, status: 'healthy', connections: [] },
      { id: 'paymentdb',    name: 'Payment DB',         platform: 'AWS-RDS',          requests: '3.0K',  x: 200, y: 470, status: 'healthy', connections: [] },
      { id: 'stripe',       name: 'Stripe API',         platform: 'External',         requests: '2.8K',  x: 400, y: 470, status: 'healthy', connections: [] },
      { id: 'email',        name: 'Email Service',      platform: 'AWS-SES',          requests: '1.8K',  x: 600, y: 470, status: 'healthy', connections: [] },
    ],
    'business-unit': [
      { id: 'bu-ecom',      name: 'E-Commerce',         platform: '12 Services',      requests: '85.2K', x: 140, y: 50, status: 'critical', connections: ['bu-fintech', 'bu-platform'] },
      { id: 'bu-fintech',   name: 'FinTech',            platform: '8 Services',       requests: '32.1K', x: 620, y: 50, status: 'warning',  connections: ['bu-data'] },
      { id: 'bu-platform',  name: 'Platform Engineering', platform: '15 Services',    requests: '120.5K', x: 0,  y: 190, status: 'healthy', connections: ['bu-infra'] },
      { id: 'bu-data',      name: 'Data & Analytics',   platform: '10 Services',      requests: '67.3K', x: 200, y: 190, status: 'healthy', connections: [] },
      { id: 'bu-infra',     name: 'Infrastructure',     platform: '20 Services',      requests: '200.1K', x: 400, y: 190, status: 'healthy', connections: ['bu-security'] },
      { id: 'bu-security',  name: 'Security',           platform: '6 Services',       requests: '15.8K', x: 600, y: 190, status: 'healthy', connections: [] },
      { id: 'bu-mobile',    name: 'Mobile',             platform: '5 Services',       requests: '44.0K', x: 800, y: 190, status: 'healthy', connections: [] },
      { id: 'bu-ml',        name: 'Machine Learning',   platform: '7 Services',       requests: '28.9K', x: 0,   y: 330, status: 'healthy', connections: [] },
      { id: 'bu-devex',     name: 'Developer Experience', platform: '4 Services',     requests: '10.2K', x: 200, y: 330, status: 'healthy', connections: [] },
    ],
    'team': [
      { id: 'tm-frontend',  name: 'Frontend Team',      platform: '4 Engineers',      requests: '35.0K', x: 140, y: 50, status: 'critical', connections: ['tm-backend'] },
      { id: 'tm-payments',  name: 'Payments Team',      platform: '3 Engineers',      requests: '12.4K', x: 620, y: 50, status: 'warning',  connections: ['tm-backend'] },
      { id: 'tm-backend',   name: 'Backend Team',       platform: '6 Engineers',      requests: '58.3K', x: 0,   y: 190, status: 'healthy', connections: ['tm-data'] },
      { id: 'tm-devops',    name: 'DevOps',             platform: '3 Engineers',      requests: '90.1K', x: 200, y: 190, status: 'healthy', connections: ['tm-sre'] },
      { id: 'tm-data',      name: 'Data Team',          platform: '5 Engineers',      requests: '42.7K', x: 400, y: 190, status: 'healthy', connections: [] },
      { id: 'tm-sre',       name: 'SRE',                platform: '4 Engineers',      requests: '110.0K', x: 600, y: 190, status: 'healthy', connections: [] },
      { id: 'tm-mobile',    name: 'Mobile Team',        platform: '3 Engineers',      requests: '22.5K', x: 800, y: 190, status: 'healthy', connections: [] },
      { id: 'tm-qa',        name: 'QA Team',            platform: '4 Engineers',      requests: '8.0K',  x: 0,   y: 330, status: 'healthy', connections: [] },
      { id: 'tm-security',  name: 'Security Team',      platform: '2 Engineers',      requests: '5.3K',  x: 200, y: 330, status: 'healthy', connections: [] },
    ],
    'environment': [
      { id: 'env-prod-us',  name: 'Production US',      platform: 'us-east-1',        requests: '250.0K', x: 140, y: 50, status: 'critical', connections: ['env-prod-eu'] },
      { id: 'env-staging',  name: 'Staging',            platform: 'us-west-2',        requests: '18.5K', x: 620, y: 50, status: 'warning',  connections: ['env-prod-us'] },
      { id: 'env-prod-eu',  name: 'Production EU',      platform: 'eu-west-1',        requests: '180.2K', x: 0,  y: 190, status: 'healthy', connections: ['env-prod-apac'] },
      { id: 'env-prod-apac', name: 'Production APAC',   platform: 'ap-southeast-1',   requests: '95.4K', x: 200, y: 190, status: 'healthy', connections: [] },
      { id: 'env-dev',      name: 'Development',        platform: 'us-west-2',        requests: '5.2K',  x: 400, y: 190, status: 'healthy', connections: ['env-qa'] },
      { id: 'env-qa',       name: 'QA',                 platform: 'us-east-2',        requests: '12.0K', x: 600, y: 190, status: 'healthy', connections: ['env-staging'] },
      { id: 'env-sandbox',  name: 'Sandbox',            platform: 'us-west-1',        requests: '1.1K',  x: 800, y: 190, status: 'healthy', connections: [] },
      { id: 'env-dr',       name: 'Disaster Recovery',  platform: 'eu-central-1',     requests: '0.5K',  x: 0,   y: 330, status: 'healthy', connections: [] },
      { id: 'env-perf',     name: 'Performance Test',   platform: 'us-east-1',        requests: '45.0K', x: 200, y: 330, status: 'healthy', connections: [] },
    ],
  }

  const connectionsByFilter = {
    'application': {
      'logging-sms': 'critical',
      'sms-imageservice': 'warning',
      'shopfront-catalog': 'healthy',
      'shopfront-auth': 'healthy',
      'catalog-cache': 'healthy',
      'payment-stripe': 'healthy',
      'notification-userdb': 'healthy',
    },
    'business-unit': {
      'bu-ecom-bu-fintech': 'critical',
      'bu-ecom-bu-platform': 'healthy',
      'bu-fintech-bu-data': 'warning',
      'bu-platform-bu-infra': 'healthy',
      'bu-infra-bu-security': 'healthy',
    },
    'team': {
      'tm-frontend-tm-backend': 'critical',
      'tm-payments-tm-backend': 'warning',
      'tm-backend-tm-data': 'healthy',
      'tm-devops-tm-sre': 'healthy',
    },
    'environment': {
      'env-prod-us-env-prod-eu': 'critical',
      'env-staging-env-prod-us': 'warning',
      'env-prod-eu-env-prod-apac': 'healthy',
      'env-dev-env-qa': 'healthy',
      'env-qa-env-staging': 'healthy',
    },
  }

  const allServices = viewMode === 'agents'
    ? (agentServicesByFilter[activeFilter] || agentServicesByFilter['application'])
    : (servicesByFilter[activeFilter] || servicesByFilter['application'])
  const connectionStatus = viewMode === 'agents'
    ? (agentConnectionsByFilter[activeFilter] || agentConnectionsByFilter['application'])
    : (connectionsByFilter[activeFilter] || connectionsByFilter['application'])
  const services = useMemo(() => visibleNodeIds != null
    ? allServices.filter(s => (visibleNodeIds instanceof Set ? visibleNodeIds.has(s.id) : visibleNodeIds.includes(s.id)))
    : allServices, [allServices, visibleNodeIds])

  // Animate node opacity: fade in newly visible nodes over ~300ms
  useEffect(() => {
    if (visibleNodeIds == null) {
      nodeOpacityRef.current.clear()
      return
    }
    const opMap = nodeOpacityRef.current
    services.forEach(s => { if (!opMap.has(s.id)) opMap.set(s.id, 0) })
    for (const id of opMap.keys()) {
      if (!services.some(s => s.id === id)) opMap.delete(id)
    }
    let animating = true
    const step = () => {
      if (!animating) return
      let needsUpdate = false
      for (const [id, val] of opMap) {
        if (val < 1) { opMap.set(id, Math.min(val + 0.05, 1)); needsUpdate = true }
      }
      if (needsUpdate) forceRender(n => n + 1)
      if (needsUpdate) nodeOpacityAnimRef.current = requestAnimationFrame(step)
    }
    nodeOpacityAnimRef.current = requestAnimationFrame(step)
    return () => { animating = false; cancelAnimationFrame(nodeOpacityAnimRef.current) }
  }, [services, visibleNodeIds])

  const handleZoomIn = () => {
    setZoom(prev => Math.min((prev || fitZoom) + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max((prev || fitZoom) - 0.1, 0.3))
  }

  const handleFitToScreen = () => {
    setZoom(fitZoom)
  }

  // connectionStatus is now derived from connectionsByFilter above

  // Status-specific colors and timing
  const statusConfig = {
    healthy:  { r: 0,   g: 229, b: 204, travelMs: 8000,  pauseMs: 0, flickerHz: 0 },   // #00E5CC teal
    warning:  { r: 255, g: 179, b: 0,   travelMs: 10000, pauseMs: 0, flickerHz: 0 },   // #FFB300 amber
    critical: { r: 255, g: 68,  b: 68,  travelMs: 8000,  pauseMs: 0, flickerHz: 8 },   // #FF4444 red
  }

  // Shared position adjustment for expanded cards
  const getAdjustedPos = (service) => {
      let adjX = service.x
      let adjY = service.y
      if (expandedNode && expandedNode !== service.id) {
        const exp = services.find(s => s.id === expandedNode)
        if (exp) {
          const expBottom = exp.y + (viewMode === 'agents' ? 1050 : 610) // agent expanded card is taller
          const extraW = 470 // (580 - 130) + 20px gap
          // Push cards below: ensure they start after the expanded card's bottom
          if (service.y > exp.y) {
            const rowOffset = service.y - exp.y // preserve relative row spacing
            adjY = expBottom + rowOffset
          }
          // Push cards on same row to the right
          if (service.y === exp.y && service.x > exp.x) {
            adjX = service.x + extraW
          }
        }
      }
      return { x: adjX, y: adjY }
    }

  // Build edges with staggered delays — uses adjusted positions
  const getEdges = () => {
    const edges = []
    let idx = 0
    services.forEach(service => {
      service.connections.forEach(targetId => {
        const target = services.find(s => s.id === targetId)
        if (target) {
          const key = `${service.id}-${targetId}`
          const status = connectionStatus[key] || 'healthy'
          const cfg = statusConfig[status]
          const cycleMs = cfg.travelMs + cfg.pauseMs
          const srcPos = getAdjustedPos(service)
          const tgtPos = getAdjustedPos(target)
          const srcW = expandedNode === service.id ? 580 : 130
          const srcH = expandedNode === service.id ? 580 : 130
          const tgtW = expandedNode === target.id ? 580 : 130
          const tgtH = expandedNode === target.id ? 580 : 130
          edges.push({
            key,
            x1: srcPos.x + srcW / 2,
            y1: srcPos.y + Math.min(srcH, 130) / 2,
            x2: tgtPos.x + tgtW / 2,
            y2: tgtPos.y + Math.min(tgtH, 130) / 2,
            sourceId: service.id,
            targetId,
            status,
            cfg,
            delayMs: idx * 250,
            cycleMs,
          })
          idx++
        }
      })
    })
    return edges
  }

  // Track node glow bursts
  const nodeGlowRef = useRef({})

  // Pulse animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    // Offset startTime so all particles appear mid-cycle immediately (no stagger delay on mount)
    const startTime = performance.now() - 10000

    const animate = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const elapsed = now - startTime
      const edges = getEdges()

      edges.forEach(edge => {
        const { cfg, delayMs, cycleMs, x1, y1, x2, y2, status } = edge
        const { r, g, b, travelMs, flickerHz } = cfg

        // Fade edges when status filter is active and neither endpoint matches
        const srcNode = services.find(s => s.id === edge.sourceId)
        const tgtNode = services.find(s => s.id === edge.targetId)
        const edgeFaded = statusFilter && (!srcNode || srcNode.status !== statusFilter) && (!tgtNode || tgtNode.status !== statusFilter)
        const nodeAlpha = Math.min(nodeOpacityRef.current.get(edge.sourceId) ?? 1, nodeOpacityRef.current.get(edge.targetId) ?? 1)
        const fadeMul = (edgeFaded ? 0.12 : 1) * nodeAlpha

        // Calculate pulse position within its cycle
        const edgeTime = Math.max(0, elapsed - delayMs)
        const cyclePos = edgeTime % cycleMs
        const t = Math.min(cyclePos / travelMs, 1) // 0→1 during travel, clamped at 1 during pause
        const isTraveling = cyclePos < travelMs

        // Ease in-out for smooth motion
        const eased = t < 0.5
          ? 2 * t * t
          : 1 - Math.pow(-2 * t + 2, 2) / 2

        // Line brightness: brightens as pulse travels
        const lineAlpha = (isTraveling ? 0.15 + 0.55 * (1 - Math.abs(eased - 0.5) * 2) : 0.15) * fadeMul

        // Draw tapered line — thick in middle, thin/faded at card edges
        const segments = 20
        for (let i = 0; i < segments; i++) {
          const s0 = i / segments
          const s1 = (i + 1) / segments
          const sx = x1 + (x2 - x1) * s0
          const sy = y1 + (y2 - y1) * s0
          const ex = x1 + (x2 - x1) * s1
          const ey = y1 + (y2 - y1) * s1

          // Taper: 0 at edges, 1 at center
          const taper = Math.sin(((s0 + s1) / 2) * Math.PI)
          const segWidth = 0.5 + taper * 1.5       // 0.5px at edges → 2px at center
          const segAlpha = lineAlpha * (0.15 + taper * 0.85)  // faded at edges

          // Outer glow segment
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.lineTo(ex, ey)
          ctx.strokeStyle = `rgba(${r},${g},${b},${segAlpha * 0.3})`
          ctx.lineWidth = segWidth + 4
          ctx.stroke()

          // Core segment
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.lineTo(ex, ey)
          ctx.strokeStyle = `rgba(${r},${g},${b},${segAlpha})`
          ctx.lineWidth = segWidth
          ctx.stroke()
        }

        // Triangle taper at source end
        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.sqrt(dx * dx + dy * dy)
        const nx = dx / len  // unit vector along line
        const ny = dy / len
        const perpX = -ny    // perpendicular
        const perpY = nx
        const triLen = 10    // triangle depth
        const triHalf = 5    // half-width at base

        const tipX = x1
        const tipY = y1
        const baseX = x1 + nx * triLen
        const baseY = y1 + ny * triLen

        ctx.beginPath()
        ctx.moveTo(tipX, tipY)
        ctx.lineTo(baseX + perpX * triHalf, baseY + perpY * triHalf)
        ctx.lineTo(baseX - perpX * triHalf, baseY - perpY * triHalf)
        ctx.closePath()
        ctx.fillStyle = `rgba(${r},${g},${b},${lineAlpha})`
        ctx.fill()

        // Draw multiple equally-spaced pulse dots
        const dotCount = 3
        const spacing = 1 / dotCount  // equal intervals
        for (let d = 0; d < dotCount; d++) {
          // Each dot offset by equal fraction, animated over time
          const rawT = ((elapsed - delayMs) / travelMs + d * spacing) % 1
          if (rawT < 0) continue

          // Linear motion — constant smooth speed
          const dotEased = rawT

          const px = x1 + (x2 - x1) * dotEased
          const py = y1 + (y2 - y1) * dotEased

          // Flicker for critical state (8Hz oscillation)
          let orbAlpha = 0.85
          if (status === 'critical' && flickerHz > 0) {
            orbAlpha = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(now * flickerHz * 2 * Math.PI / 1000 + d))
          }

          // Fade dots near endpoints for clean entry/exit
          const edgeFade = Math.min(dotEased, 1 - dotEased) * 6
          const fadeAlpha = orbAlpha * Math.min(edgeFade, 1) * fadeMul

          // Outer glow halo (~12px radius)
          const haloGrad = ctx.createRadialGradient(px, py, 0, px, py, 12)
          haloGrad.addColorStop(0, `rgba(${r},${g},${b},${fadeAlpha * 0.4})`)
          haloGrad.addColorStop(0.5, `rgba(${r},${g},${b},${fadeAlpha * 0.1})`)
          haloGrad.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(px, py, 12, 0, Math.PI * 2)
          ctx.fillStyle = haloGrad
          ctx.fill()

          // Core orb (~2px)
          const coreGrad = ctx.createRadialGradient(px, py, 0, px, py, 2)
          coreGrad.addColorStop(0, `rgba(255,255,255,${fadeAlpha})`)
          coreGrad.addColorStop(0.5, `rgba(${r},${g},${b},${fadeAlpha})`)
          coreGrad.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(px, py, 2, 0, Math.PI * 2)
          ctx.fillStyle = coreGrad
          ctx.fill()

          // Node glow burst when a dot reaches endpoints — use node's own status color
          if (d === 0 && dotEased > 0.95) {
            const tNode = services.find(s => s.id === edge.targetId)
            const tCfg = tNode ? statusConfig[tNode.status] : cfg
            nodeGlowRef.current[edge.targetId] = { time: now, r: tCfg.r, g: tCfg.g, b: tCfg.b }
          }
          if (d === 0 && dotEased < 0.05) {
            const sNode = services.find(s => s.id === edge.sourceId)
            const sCfg = sNode ? statusConfig[sNode.status] : cfg
            nodeGlowRef.current[edge.sourceId] = { time: now, r: sCfg.r, g: sCfg.g, b: sCfg.b }
          }
        }
      })

      // Draw node glow bursts
      Object.entries(nodeGlowRef.current).forEach(([nodeId, glow]) => {
        const age = now - glow.time
        if (age > 300) return // burst lasts 300ms
        const node = services.find(s => s.id === nodeId)
        if (!node) return
        const progress = age / 300
        const glowNodeAlpha = nodeOpacityRef.current.get(nodeId) ?? 1
        const burstAlpha = (1 - progress) * 0.4 * glowNodeAlpha
        const burstRadius = 30 + progress * 15
        const nodePos = getAdjustedPos(node)
        const cx = nodePos.x + 65
        const cy = nodePos.y + 35
        const burstGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstRadius)
        burstGrad.addColorStop(0, `rgba(${glow.r},${glow.g},${glow.b},${burstAlpha})`)
        burstGrad.addColorStop(1, `rgba(${glow.r},${glow.g},${glow.b},0)`)
        ctx.beginPath()
        ctx.arc(cx, cy, burstRadius, 0, Math.PI * 2)
        ctx.fillStyle = burstGrad
        ctx.fill()
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isDark, activeFilter, statusFilter, expandedNode, selectedService, viewMode, visibleNodeIds])

  // Compute fit-to-screen zoom and center the map on initial load
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    requestAnimationFrame(() => {
      const contentW = 940
      const contentH = 600
      const padding = 48 // leave some breathing room
      const scaleX = (el.clientWidth - padding) / contentW
      const scaleY = (el.clientHeight - padding) / contentH
      const fit = Math.min(scaleX, scaleY, 1.5) // cap at 1.5x
      const rounded = Math.round(fit * 100) / 100
      setFitZoom(rounded)
      setZoom(rounded)
      // Small delay so the browser applies the zoom before fading in
      requestAnimationFrame(() => setMapReady(true))
    })
  }, [])

  const filters = [
    { id: 'application', label: 'Application' },
    { id: 'business-unit', label: 'Business Unit' },
    { id: 'team', label: 'Team' },
    { id: 'environment', label: 'Environment' },
  ]

  // Drill-down canvas animation
  useEffect(() => {
    if (!selectedService) return
    const canvas = drillCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const startTime = performance.now()

    const svc = selectedService
    const statusOrder = { critical: 0, warning: 1, healthy: 2 }
    const allSubNodes = [
      { id: 'instance-1', status: svc.status, x: 0, y: 0 },
      { id: 'instance-2', status: 'healthy', x: 0, y: 0 },
      { id: 'instance-3', status: 'healthy', x: 0, y: 0 },
      { id: 'lb', status: 'healthy', x: 0, y: 0 },
      { id: 'db', status: svc.status === 'critical' ? 'warning' : 'healthy', x: 0, y: 0 },
    ].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    const filteredSubNodes = drillStatusFilter
      ? allSubNodes.filter(n => n.status === drillStatusFilter)
      : allSubNodes
    const subNodes = filteredSubNodes.map((n, i) => ({
      ...n,
      x: (i % 3) * 260 + 60,
      y: Math.floor(i / 3) * 160 + 60,
    }))
    const subConns = [
      { from: 'lb', to: 'instance-2' },
      { from: 'lb', to: 'instance-3' },
      { from: 'instance-1', to: 'db' },
      { from: 'instance-2', to: 'db' },
    ]

    const drillEdges = subConns.filter(conn => {
      return subNodes.some(n => n.id === conn.from) && subNodes.some(n => n.id === conn.to)
    }).map((conn, idx) => {
      const from = subNodes.find(n => n.id === conn.from)
      const to = subNodes.find(n => n.id === conn.to)

      // Adjust positions for expanded drill node
      const getAdjDrillPos = (node) => {
        let ax = node.x, ay = node.y
        if (expandedDrillNode && expandedDrillNode !== node.id) {
          const expN = subNodes.find(n => n.id === expandedDrillNode)
          if (expN) {
            const expBottom = expN.y + 750
            const extraW = 470
            if (node.y > expN.y) {
              ay = expBottom + (node.y - expN.y)
            }
            if (node.y === expN.y && node.x > expN.x) {
              ax = node.x + extraW
            }
          }
        }
        return { x: ax, y: ay }
      }

      const fromPos = getAdjDrillPos(from)
      const toPos = getAdjDrillPos(to)
      const fromW = expandedDrillNode === from.id ? 580 : 130
      const toW = expandedDrillNode === to.id ? 580 : 130
      const fromH = expandedDrillNode === from.id ? 580 : 90
      const toH = expandedDrillNode === to.id ? 580 : 90

      const status = from.status !== 'healthy' ? from.status : to.status !== 'healthy' ? to.status : 'healthy'
      const cfg = statusConfig[status]
      return {
        x1: fromPos.x + fromW / 2, y1: fromPos.y + Math.min(fromH, 90) / 2,
        x2: toPos.x + toW / 2, y2: toPos.y + Math.min(toH, 90) / 2,
        sourceId: conn.from, targetId: conn.to,
        status, cfg,
        delayMs: idx * 250,
        cycleMs: cfg.travelMs,
        travelMs: cfg.travelMs,
      }
    })

    const drillGlowRef = {}

    const animate = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const elapsed = now - startTime

      drillEdges.forEach(edge => {
        const { cfg, delayMs, cycleMs, travelMs, x1, y1, x2, y2, status } = edge
        const { r, g, b, flickerHz } = cfg

        const edgeTime = Math.max(0, elapsed - delayMs)
        const cyclePos = edgeTime % cycleMs
        const t = Math.min(cyclePos / travelMs, 1)
        const isTraveling = cyclePos < travelMs
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        const lineAlpha = isTraveling ? 0.15 + 0.55 * (1 - Math.abs(eased - 0.5) * 2) : 0.15

        // Tapered line segments
        const segments = 20
        for (let i = 0; i < segments; i++) {
          const s0 = i / segments
          const s1 = (i + 1) / segments
          const sx = x1 + (x2 - x1) * s0
          const sy = y1 + (y2 - y1) * s0
          const ex = x1 + (x2 - x1) * s1
          const ey = y1 + (y2 - y1) * s1
          const taper = Math.sin(((s0 + s1) / 2) * Math.PI)
          const segWidth = 0.5 + taper * 1.5
          const segAlpha = lineAlpha * (0.15 + taper * 0.85)

          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.lineTo(ex, ey)
          ctx.strokeStyle = `rgba(${r},${g},${b},${segAlpha * 0.3})`
          ctx.lineWidth = segWidth + 4
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.lineTo(ex, ey)
          ctx.strokeStyle = `rgba(${r},${g},${b},${segAlpha})`
          ctx.lineWidth = segWidth
          ctx.stroke()
        }

        // Triangle at source
        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.sqrt(dx * dx + dy * dy)
        const nx = dx / len, ny = dy / len
        const perpX = -ny, perpY = nx
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x1 + nx * 10 + perpX * 5, y1 + ny * 10 + perpY * 5)
        ctx.lineTo(x1 + nx * 10 - perpX * 5, y1 + ny * 10 - perpY * 5)
        ctx.closePath()
        ctx.fillStyle = `rgba(${r},${g},${b},${lineAlpha})`
        ctx.fill()

        // 3 pulse dots
        for (let d = 0; d < 3; d++) {
          const rawT = ((elapsed - delayMs) / travelMs + d * (1 / 3)) % 1
          if (rawT < 0) continue
          const px = x1 + (x2 - x1) * rawT
          const py = y1 + (y2 - y1) * rawT

          let orbAlpha = 0.85
          if (status === 'critical' && flickerHz > 0) {
            orbAlpha = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(now * flickerHz * 2 * Math.PI / 1000 + d))
          }
          const edgeFade = Math.min(rawT, 1 - rawT) * 6
          const fadeAlpha = orbAlpha * Math.min(edgeFade, 1)

          const haloGrad = ctx.createRadialGradient(px, py, 0, px, py, 12)
          haloGrad.addColorStop(0, `rgba(${r},${g},${b},${fadeAlpha * 0.4})`)
          haloGrad.addColorStop(0.5, `rgba(${r},${g},${b},${fadeAlpha * 0.1})`)
          haloGrad.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(px, py, 12, 0, Math.PI * 2)
          ctx.fillStyle = haloGrad
          ctx.fill()

          const coreGrad = ctx.createRadialGradient(px, py, 0, px, py, 2)
          coreGrad.addColorStop(0, `rgba(255,255,255,${fadeAlpha})`)
          coreGrad.addColorStop(0.5, `rgba(${r},${g},${b},${fadeAlpha})`)
          coreGrad.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(px, py, 2, 0, Math.PI * 2)
          ctx.fillStyle = coreGrad
          ctx.fill()

          // Node glow bursts
          if (d === 0 && rawT > 0.95) {
            const tNode = subNodes.find(n => n.id === edge.targetId)
            const tCfg = tNode ? statusConfig[tNode.status] : cfg
            drillGlowRef[edge.targetId] = { time: now, r: tCfg.r, g: tCfg.g, b: tCfg.b }
          }
          if (d === 0 && rawT < 0.05) {
            const sNode = subNodes.find(n => n.id === edge.sourceId)
            const sCfg = sNode ? statusConfig[sNode.status] : cfg
            drillGlowRef[edge.sourceId] = { time: now, r: sCfg.r, g: sCfg.g, b: sCfg.b }
          }
        }
      })

      // Node glow bursts
      Object.entries(drillGlowRef).forEach(([nodeId, glow]) => {
        const age = now - glow.time
        if (age > 300) return
        const node = subNodes.find(n => n.id === nodeId)
        if (!node) return
        const progress = age / 300
        const burstAlpha = (1 - progress) * 0.4
        const burstRadius = 30 + progress * 15
        // Use adjusted position for glow
        let glowX = node.x, glowY = node.y
        if (expandedDrillNode && expandedDrillNode !== node.id) {
          const expN = subNodes.find(n => n.id === expandedDrillNode)
          if (expN) {
            if (node.y > expN.y) glowY = expN.y + 750 + (node.y - expN.y)
            if (node.y === expN.y && node.x > expN.x) glowX = node.x + 470
          }
        }
        const cx = glowX + 65, cy = glowY + 45
        const burstGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstRadius)
        burstGrad.addColorStop(0, `rgba(${glow.r},${glow.g},${glow.b},${burstAlpha})`)
        burstGrad.addColorStop(1, `rgba(${glow.r},${glow.g},${glow.b},0)`)
        ctx.beginPath()
        ctx.arc(cx, cy, burstRadius, 0, Math.PI * 2)
        ctx.fillStyle = burstGrad
        ctx.fill()
      })

      drillAnimRef.current = requestAnimationFrame(animate)
    }

    drillAnimRef.current = requestAnimationFrame(animate)
    return () => {
      if (drillAnimRef.current) cancelAnimationFrame(drillAnimRef.current)
    }
  }, [selectedService, drillStatusFilter, expandedDrillNode])

  // Drill-down view for a selected service
  if (selectedService) {
    const svc = selectedService
    const statusColor = svc.status === 'critical' ? 'var(--severity-critical)' : svc.status === 'warning' ? 'var(--status-blocked)' : 'var(--status-active)'

    // Mock sub-nodes for the service drill-down — sorted by severity
    const allSubNodes = [
      { id: 'instance-1', name: `${svc.name}-instance-1`, type: 'Instance', status: svc.status, cpu: '42%', mem: '68%' },
      { id: 'instance-2', name: `${svc.name}-instance-2`, type: 'Instance', status: 'healthy', cpu: '31%', mem: '55%' },
      { id: 'instance-3', name: `${svc.name}-instance-3`, type: 'Instance', status: 'healthy', cpu: '28%', mem: '49%' },
      { id: 'lb', name: `${svc.name}-lb`, type: 'Load Balancer', status: 'healthy', cpu: '—', mem: '—' },
      { id: 'db', name: `${svc.name}-db`, type: 'Database', status: svc.status === 'critical' ? 'warning' : 'healthy', cpu: '—', mem: '72%' },
    ]
      .sort((a, b) => ({ critical: 0, warning: 1, healthy: 2 }[a.status] - { critical: 0, warning: 1, healthy: 2 }[b.status]))

    const subNodes = (drillStatusFilter
      ? allSubNodes.filter(n => n.status === drillStatusFilter)
      : allSubNodes
    ).map((n, i) => ({ ...n, x: (i % 3) * 260 + 60, y: Math.floor(i / 3) * 160 + 60 }))

    const subConnections = [
      { from: 'lb', to: 'instance-2' },
      { from: 'lb', to: 'instance-3' },
      { from: 'instance-1', to: 'db' },
      { from: 'instance-2', to: 'db' },
    ]

    return (
      <div className={`relative w-full h-[calc(100vh-180px)] ${isDark ? 'bg-slate-950' : 'bg-white'}`}>

        {/* Breadcrumbs */}
        <div className="absolute top-3 left-4 z-10">
          <Breadcrumbs
            isDark={isDark}
            items={[
              {
                label: 'Application Map',
                onClick: () => { setSelectedService(null); setDrillZoom(1); setDrillStatusFilter(null); setExpandedDrillNode(null) },
              },
              {
                label: svc.name,
                icon: <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />,
              },
            ]}
          />
        </div>

        {/* Legend and Zoom — top right, side by side */}
        <div className="absolute top-3 right-4 flex items-center gap-2 z-10">
          {/* Status Legend — Toggle Buttons */}
          <SegmentedControl
            options={statusFilterOptions}
            value={drillStatusFilter}
            onChange={setDrillStatusFilter}
            isDark={isDark}
            size="default"
            allowDeselect
          />

          {/* Zoom Controls — horizontal */}
          <div
            className={`inline-flex items-center gap-1 rounded-lg p-0.5 ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-black/[0.03] border border-black/[0.06]'}`}
          >
            <button
              onClick={() => setDrillZoom(prev => Math.max(prev - 0.2, 0.5))}
              className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${isDark ? 'text-foreground-secondary hover:bg-white/10 hover:text-foreground' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
              title="Zoom Out"
            >
              <MagnifyingGlassMinus size={14} />
            </button>
            <span className={`text-body-s font-medium tabular-nums min-w-[36px] text-center ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>
              {Math.round(drillZoom * 100)}%
            </span>
            <button
              onClick={() => setDrillZoom(prev => Math.min(prev + 0.2, 2))}
              className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${isDark ? 'text-foreground-secondary hover:bg-white/10 hover:text-foreground' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
              title="Zoom In"
            >
              <MagnifyingGlassPlus size={14} />
            </button>
            <div className={`w-px h-4 mx-0.5 ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`} />
            <button
              onClick={() => setDrillZoom(1)}
              className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${isDark ? 'text-foreground-secondary hover:bg-white/10 hover:text-foreground' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
              title="Fit to Screen"
            >
              <ArrowsIn size={14} />
            </button>
          </div>
        </div>

        {/* Drill-down node map */}
        <div className="relative w-full h-[calc(100%-36px)] overflow-auto" style={{ padding: '20px 24px 24px 24px' }}>
          <div style={{ 
            transform: `scale(${drillZoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.3s ease',
          }}>
          {/* Content area for nodes */}
          <div style={{ position: 'relative', width: expandedDrillNode ? '1200px' : '800px', height: expandedDrillNode ? '1200px' : '380px' }}>

            {/* Canvas for glowing connectors */}
            <canvas
              ref={drillCanvasRef}
              width={expandedDrillNode ? 1200 : 800}
              height={expandedDrillNode ? 1200 : 380}
              className="absolute inset-0"
              style={{ pointerEvents: 'none' }}
            />

            {/* Sub-nodes */}
            {subNodes.map(node => {
              const nodeStatusColor = node.status === 'critical' ? 'rgba(248, 81, 73, 0.3)' : node.status === 'warning' ? 'rgba(255, 170, 0, 0.3)' : 'rgba(63, 185, 80, 0.3)'
              const dotColor = node.status === 'critical' ? 'bg-red-500' : node.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              const isDrillExpanded = expandedDrillNode === node.id
              const drillHealthData = node.status === 'critical'
                ? { errors4xx: '1.2%', faults5xx: '4.2%', unhealthy: '3/4' }
                : node.status === 'warning'
                ? { errors4xx: '0.8%', faults5xx: '0.5%', unhealthy: '1/4' }
                : { errors4xx: '0%', faults5xx: '0%', unhealthy: '0/4' }
              const drillChanges = node.status !== 'healthy'
                ? [
                    { type: 'Deployment', name: node.name.replace(/\s/g, ''), time: '43 minutes ago', initiator: 'AutoDeployPipeline' },
                    { type: 'Config Change', name: 'env-vars', time: '1 hour ago', initiator: 'PlatformTeam' },
                  ]
                : [
                    { type: 'Deployment', name: node.name.replace(/\s/g, ''), time: '2 hours ago', initiator: 'CI/CD Pipeline' },
                  ]

              // Adjust positions when a node is expanded
              let adjX = node.x
              let adjY = node.y
              if (expandedDrillNode && expandedDrillNode !== node.id) {
                const expNode = subNodes.find(n => n.id === expandedDrillNode)
                if (expNode) {
                  const expBottom = expNode.y + 750
                  const extraW = 470
                  if (node.y > expNode.y) {
                    adjY = expBottom + (node.y - expNode.y)
                  }
                  if (node.y === expNode.y && node.x > expNode.x) {
                    adjX = node.x + extraW
                  }
                }
              }

              return (
                <div
                  key={node.id}
                  className={`absolute transition-all duration-300 ease-in-out ${isDrillExpanded ? 'z-30' : 'z-0'}`}
                  style={{
                    left: `${adjX}px`,
                    top: `${adjY}px`,
                    width: isDrillExpanded ? '580px' : '130px',
                  }}
                >
                  <Card
                    variant="glass"
                    isDark={isDark}
                    className="transition-all duration-300 relative"
                    style={{
                      padding: isDrillExpanded ? '18px' : '12px',
                    }}
                  >
                    {/* Expand/Collapse button — top right */}
                    <Button
                      isDark={isDark}
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1.5 right-1.5 z-50"
                      title={isDrillExpanded ? 'Collapse' : 'Expand'}
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedDrillNode(isDrillExpanded ? null : node.id)
                      }}
                    >
                      {isDrillExpanded
                        ? <ArrowsIn size={12} />
                        : <ArrowsOut size={12} />
                      }
                    </Button>

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      <span className={`text-[9px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>{node.type}</span>
                    </div>
                    <div className={`text-[10px] font-semibold mb-1.5 truncate ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{node.name}</div>
                    <div className="flex items-center">
                      <div className="flex gap-3">
                        {node.cpu !== '—' && (
                          <div>
                            <div className={`text-[8px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>CPU</div>
                            <div className={`text-[10px] font-semibold ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{node.cpu}</div>
                          </div>
                        )}
                        {node.mem !== '—' && (
                          <div>
                            <div className={`text-[8px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>MEM</div>
                            <div className={`text-[10px] font-semibold ${isDark ? 'text-foreground' : 'text-gray-900'}`}>{node.mem}</div>
                          </div>
                        )}
                        {node.cpu === '—' && node.mem === '—' && (
                          <div className={`text-[9px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>Active</div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <div className={`grid transition-all duration-300 ease-in-out ${isDrillExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                      <div className="overflow-hidden">
                        <div className="h-px w-full mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />

                        {/* Dive Deep Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className={`w-full text-body-s font-medium py-2 px-3 rounded-lg mb-3 transition-all cursor-pointer ${isDark ? 'text-sky-400 hover:bg-sky-500/10 border border-sky-500/20' : 'text-blue-600 hover:bg-blue-50 border border-blue-200'}`}
                        >
                          Dive Deep
                        </button>

                        {/* Health Section */}
                        <div className="mb-2">
                          <div className={`text-body-s font-semibold mb-2 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Health</div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-sm bg-yellow-500"></div>
                              <span className={`text-body-s ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{drillHealthData.errors4xx} errors (4xx)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-sm bg-red-500"></div>
                              <span className={`text-body-s ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{drillHealthData.faults5xx} faults (5xx)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-body-s" style={{ color: node.status === 'healthy' ? 'var(--status-active)' : 'var(--severity-critical)' }}>▲ {drillHealthData.unhealthy} Services Unhealthy</span>
                            </div>
                          </div>
                        </div>

                        {/* Changes Section */}
                        <div className="mb-2">
                          <div className={`text-body-s font-semibold mb-2 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Changes ({drillChanges.length})</div>
                          <div className="space-y-2">
                            {drillChanges.map((change, ci) => (
                              <div key={ci} className="rounded-lg p-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-body-s font-medium ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{change.type}</span>
                                  <span className={`text-[10px] ${isDark ? 'text-foreground-secondary' : 'text-gray-500'}`}>{change.time}</span>
                                </div>
                                <div className="text-body-s text-sky-400 mb-0.5">{change.name}</div>
                                <div className={`text-[10px] ${isDark ? 'text-foreground-secondary' : 'text-gray-500'}`}>Initiated by: {change.initiator}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="h-px w-full mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />

                        {/* Metrics Section */}
                        <div>
                          <div className={`text-body-s font-semibold mb-1.5 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Metrics (aggregated)</div>
                          <div className={`text-[10px] mb-3 ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>Choose a point in the graphs to view correlated spans and more.</div>
                          <div className="grid grid-cols-2 gap-2.5">
                            {[
                              { title: 'Requests and Availability', color: 'var(--primary)', data: node.status === 'critical' ? [0.3,0.5,0.8,0.95,0.7,0.4,0.6,0.85,0.5,0.3] : node.status === 'warning' ? [0.6,0.7,0.8,0.85,0.9,0.88,0.92,0.87,0.9,0.85] : [0.9,0.92,0.95,0.93,0.96,0.94,0.97,0.95,0.96,0.94] },
                              { title: 'Latency', subtitle: 'p99', color: 'var(--herman-violet)', data: node.status === 'critical' ? [0.2,0.4,0.9,0.95,0.8,0.6,0.85,0.7,0.5,0.9] : node.status === 'warning' ? [0.3,0.35,0.4,0.5,0.45,0.42,0.38,0.44,0.4,0.36] : [0.1,0.12,0.15,0.13,0.11,0.14,0.12,0.13,0.11,0.12] },
                              { title: 'Faults (5xx)', color: 'var(--destructive)', data: node.status === 'critical' ? [0.0,0.1,0.4,0.6,0.8,0.5,0.7,0.3,0.6,0.4] : node.status === 'warning' ? [0.0,0.0,0.05,0.1,0.08,0.03,0.0,0.02,0.05,0.01] : [0,0,0,0,0,0,0,0,0,0] },
                              { title: 'Errors (4xx)', color: 'var(--severity-warning)', data: node.status === 'critical' ? [0.1,0.2,0.15,0.3,0.25,0.4,0.2,0.35,0.3,0.15] : node.status === 'warning' ? [0.05,0.08,0.06,0.1,0.07,0.09,0.06,0.08,0.05,0.07] : [0,0,0.01,0,0,0.01,0,0,0,0] },
                            ].map((chart, ci) => (
                              <div key={ci} className="rounded-lg p-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-body-s font-medium ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{chart.title}</span>
                                  {chart.subtitle && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--herman-violet)' }}>{chart.subtitle}</span>
                                  )}
                                </div>
                                <svg width="100%" height="56" viewBox="0 0 160 56" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id={`svc-fill-${ci}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={chart.color} stopOpacity="0.18" />
                                      <stop offset="100%" stopColor={chart.color} stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  <text x="0" y="10" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'} fontSize="5.5">1.00</text>
                                  <text x="0" y="29" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'} fontSize="5.5">0.50</text>
                                  <text x="0" y="52" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'} fontSize="5.5">0</text>
                                  <line x1="18" y1="7" x2="158" y2="7" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                                  <line x1="18" y1="27" x2="158" y2="27" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                                  <line x1="18" y1="49" x2="158" y2="49" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                                  <path d={`M${18} ${49} ${chart.data.map((v, i) => `L${18 + (i / (chart.data.length - 1)) * 140} ${49 - v * 42}`).join(' ')} L${158} ${49} Z`} fill={`url(#svc-fill-${ci})`} />
                                  <path d={`M${chart.data.map((v, i) => `${18 + (i / (chart.data.length - 1)) * 140} ${49 - v * 42}`).join(' L')}`} fill="none" stroke={chart.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex justify-between mt-1 px-3">
                                  {['21:00','21:30','22:00','22:30','23:00','23:30'].map((t, ti) => (
                                    <span key={ti} className={`text-[8px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>{t}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-[600px]" style={{ overflow: 'clip' }}>
      {/* Legend and Zoom — top right, side by side */}
      <div className="absolute top-3 right-4 flex items-center gap-2 z-40">
        {/* Status Legend — Toggle Buttons */}
        <SegmentedControl
          options={statusFilterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          isDark={isDark}
          size="default"
          allowDeselect
        />

        {/* Zoom Controls */}
        <div
          className={`inline-flex items-center gap-1 rounded-lg p-0.5 ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-black/[0.03] border border-black/[0.06]'}`}
        >
          <button
            onClick={handleZoomOut}
            className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${isDark ? 'text-foreground-secondary hover:bg-white/10 hover:text-foreground' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
            title="Zoom Out"
          >
            <MagnifyingGlassMinus size={14} />
          </button>
          <span className={`text-body-s font-medium tabular-nums min-w-[36px] text-center ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>
            {Math.round((zoom || fitZoom) * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${isDark ? 'text-foreground-secondary hover:bg-white/10 hover:text-foreground' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
            title="Zoom In"
          >
            <MagnifyingGlassPlus size={14} />
          </button>
          <div className={`w-px h-4 mx-0.5 ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`} />
          <button
            onClick={handleFitToScreen}
            className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${isDark ? 'text-foreground-secondary hover:bg-white/10 hover:text-foreground' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
            title="Fit to Screen"
          >
            <ArrowsIn size={14} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full min-h-[600px] overflow-auto p-3 flex items-start justify-center"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        onMouseDown={(e) => {
          // Only pan on background clicks, not on cards/buttons
          if (e.target === containerRef.current || e.target.tagName === 'CANVAS') {
            setIsPanning(true)
            panStart.current = {
              x: e.clientX,
              y: e.clientY,
              scrollLeft: containerRef.current.scrollLeft,
              scrollTop: containerRef.current.scrollTop,
            }
            e.preventDefault()
          }
        }}
        onMouseMove={(e) => {
          if (!isPanning) return
          const dx = e.clientX - panStart.current.x
          const dy = e.clientY - panStart.current.y
          containerRef.current.scrollLeft = panStart.current.scrollLeft - dx
          containerRef.current.scrollTop = panStart.current.scrollTop - dy
        }}
        onMouseUp={() => setIsPanning(false)}
        onMouseLeave={() => setIsPanning(false)}
      >
        <div 
          style={{ 
            transform: `scale(${zoom || fitZoom})`,
            transformOrigin: 'top left',
            opacity: mapReady ? 1 : 0,
            transition: 'transform 0.5s ease-out, opacity 0.5s ease-out'
          }}
        >
          <canvas 
            ref={canvasRef} 
            width={expandedNode ? 1500 : 940} 
            height={expandedNode ? (viewMode === 'agents' ? 2000 : 1400) : 600} 
            className="absolute inset-0"
            style={{ pointerEvents: 'none' }}
          />

          {/* Service Nodes */}
          <div style={{ position: 'relative', width: expandedNode ? '1500px' : '940px', height: expandedNode ? (viewMode === 'agents' ? '2000px' : '1400px') : '600px' }}>
            {services.map(service => {
              const isExpanded = expandedNode === service.id
              // Mock health data per status
              const healthData = service.status === 'critical'
                ? { errors4xx: '1.2%', faults5xx: '4.2%', unhealthy: '3/4' }
                : service.status === 'warning'
                ? { errors4xx: '0.8%', faults5xx: '0.5%', unhealthy: '1/4' }
                : { errors4xx: '0%', faults5xx: '0%', unhealthy: '0/4' }
              const changes = service.status !== 'healthy'
                ? [
                    { type: 'Deployment', name: service.name.replace(/\s/g, ''), time: '43 minutes ago', initiator: 'AutoDeployPipeline' },
                    { type: 'Config Change', name: 'env-vars', time: '1 hour ago', initiator: 'PlatformTeam' },
                  ]
                : [
                    { type: 'Deployment', name: service.name.replace(/\s/g, ''), time: '2 hours ago', initiator: 'CI/CD Pipeline' },
                  ]

              // Agent-specific mock data
              const agentPerf = service.status === 'critical'
                ? { latencyP99: '12.4s', tokens: '48.2K', cost: '$3.82', invocations: '1,240', successRate: '72.1%' }
                : service.status === 'warning'
                ? { latencyP99: '4.8s', tokens: '31.5K', cost: '$1.45', invocations: '3,820', successRate: '91.3%' }
                : { latencyP99: '1.2s', tokens: '18.0K', cost: '$0.62', invocations: '8,450', successRate: '99.2%' }
              const agentQuality = service.status === 'critical'
                ? { groundedness: '0.54', guardrailTrigs: '142', feedbackPos: '38%', feedbackNeg: '24%' }
                : service.status === 'warning'
                ? { groundedness: '0.78', guardrailTrigs: '23', feedbackPos: '72%', feedbackNeg: '8%' }
                : { groundedness: '0.95', guardrailTrigs: '2', feedbackPos: '91%', feedbackNeg: '1%' }
              const agentTools = service.status === 'critical'
                ? [{ name: 'search_docs', calls: 342, failRate: '18.2%' }, { name: 'query_db', calls: 128, failRate: '31.5%' }, { name: 'send_email', calls: 56, failRate: '5.1%' }]
                : service.status === 'warning'
                ? [{ name: 'search_docs', calls: 1205, failRate: '3.4%' }, { name: 'query_db', calls: 890, failRate: '6.2%' }, { name: 'send_email', calls: 234, failRate: '0.8%' }]
                : [{ name: 'search_docs', calls: 4520, failRate: '0.2%' }, { name: 'query_db', calls: 2100, failRate: '0.1%' }, { name: 'send_email', calls: 980, failRate: '0%' }]
              const agentTraces = service.status === 'critical'
                ? [{ id: 'tr-8a2f', steps: 12, duration: '14.2s', status: 'failed', time: '2 min ago' }, { id: 'tr-7b1e', steps: 8, duration: '11.8s', status: 'timeout', time: '5 min ago' }, { id: 'tr-6c3d', steps: 5, duration: '3.1s', status: 'success', time: '8 min ago' }]
                : service.status === 'warning'
                ? [{ id: 'tr-5d4c', steps: 6, duration: '5.2s', status: 'success', time: '1 min ago' }, { id: 'tr-4e5b', steps: 9, duration: '7.8s', status: 'success', time: '4 min ago' }, { id: 'tr-3f6a', steps: 4, duration: '4.1s', status: 'guardrail', time: '12 min ago' }]
                : [{ id: 'tr-2g7h', steps: 3, duration: '1.1s', status: 'success', time: '30s ago' }, { id: 'tr-1h8i', steps: 4, duration: '1.3s', status: 'success', time: '2 min ago' }, { id: 'tr-0i9j', steps: 3, duration: '0.9s', status: 'success', time: '5 min ago' }]

              // Use shared adjusted position
              const pos = getAdjustedPos(service)
              const isFaded = statusFilter && service.status !== statusFilter

              return (
              <div
                key={service.id}
                className={`
                  absolute transition-all duration-300 ease-in-out
                  ${hoveredNode === service.id && !isExpanded ? 'scale-105' : ''}
                  ${isExpanded ? 'z-30' : hoveredNode === service.id ? 'z-10' : 'z-0'}
                `}
                style={{ 
                  left: `${pos.x}px`, 
                  top: `${pos.y}px`,
                  width: isExpanded ? '580px' : '130px',
                  cursor: 'default',
                  opacity: (isFaded ? 0.15 : 1) * (nodeOpacityRef.current.get(service.id) ?? 1),
                  pointerEvents: isFaded ? 'none' : 'auto',
                }}
                onMouseEnter={() => setHoveredNode(service.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <Card 
                  variant="glass"
                  isDark={isDark}
                  className="transition-all duration-300 relative"
                  style={{
                    padding: isExpanded ? '18px' : '12px',
                  }}
                >
                  {/* Expand/Collapse button — top right */}
                  <Button
                    isDark={isDark}
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1.5 right-1.5 z-50"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setExpandedNode(isExpanded ? null : service.id)
                    }}
                  >
                    {isExpanded
                      ? <ArrowsIn size={12} />
                      : <ArrowsOut size={12} />
                    }
                  </Button>

                  {/* Status Indicator */}
                  <div className="flex items-start gap-1.5 mb-1.5">
                    <div className={`
                      w-5 h-5 rounded flex items-center justify-center
                      ${service.status === 'healthy' ? 'bg-green-500/20' : ''}
                      ${service.status === 'warning' ? 'bg-yellow-500/20' : ''}
                      ${service.status === 'critical' ? 'bg-red-500/20' : ''}
                    `}>
                      {viewMode === 'agents' ? (
                        <Sparkle size={12} weight="fill" style={{ color: service.status === 'critical' ? 'var(--severity-critical)' : service.status === 'warning' ? 'var(--status-blocked)' : 'var(--status-active)' }} />
                      ) : (
                      <div className={`
                        w-1.5 h-1.5 rounded-full
                        ${service.status === 'healthy' ? 'bg-green-500' : ''}
                        ${service.status === 'warning' ? 'bg-yellow-500' : ''}
                        ${service.status === 'critical' ? 'bg-red-500' : ''}
                      `}></div>
                      )}
                    </div>

                  </div>

                  {/* Service Info */}
                  <div className="mb-1.5">
                    <h3
                      className={`text-[10px] font-normal leading-tight cursor-pointer transition-colors ${isDark ? 'text-sky-400 hover:text-sky-300' : 'text-blue-600 hover:text-blue-500'}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedService(service)
                        setExpandedNode(null)
                        setExpandedDrillNode(null)
                        setDrillZoom(1)
                        setDrillStatusFilter(null)
                      }}
                    >
                      {service.name}
                    </h3>
                    <p className={`text-[9px] ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>
                      {service.platform}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center">
                    <div>
                      <div className={`text-[8px] ${isDark ? 'text-foreground-secondary' : 'text-gray-500'}`}>
                        Requests
                      </div>
                      <div className={`text-[10px] font-semibold ${isDark ? 'text-foreground' : 'text-gray-900'}`}>
                        {service.requests}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                    <div className="overflow-hidden">
                      <div className="h-px w-full mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />

                      {viewMode === 'agents' ? (<>
                      {/* ── AGENT EXPANDED VIEW ── */}

                      {/* Performance */}
                      <div className="mb-3">
                        <div className={`text-body-s font-semibold mb-2 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Performance</div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Latency p99', value: agentPerf.latencyP99, warn: service.status === 'critical' },
                            { label: 'Tokens (avg)', value: agentPerf.tokens },
                            { label: 'Cost (avg)', value: agentPerf.cost },
                            { label: 'Invocations', value: agentPerf.invocations },
                            { label: 'Success Rate', value: agentPerf.successRate, warn: service.status !== 'healthy' },
                            { label: 'Model', value: 'Claude 3.5' },
                          ].map((m, mi) => (
                            <div key={mi} className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className={`text-[8px] mb-0.5 ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>{m.label}</div>
                              <div className={`text-body-s font-semibold ${m.warn ? 'text-red-400' : isDark ? 'text-foreground' : 'text-gray-900'}`}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quality */}
                      <div className="mb-3">
                        <div className={`text-body-s font-semibold mb-2 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Quality</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-sm" style={{ background: parseFloat(agentQuality.groundedness) < 0.7 ? 'var(--severity-critical)' : parseFloat(agentQuality.groundedness) < 0.85 ? 'var(--status-blocked)' : 'var(--status-active)' }}></div>
                            <span className={`text-body-s ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>Groundedness: {agentQuality.groundedness}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-sm" style={{ background: parseInt(agentQuality.guardrailTrigs) > 50 ? 'var(--severity-critical)' : parseInt(agentQuality.guardrailTrigs) > 10 ? 'var(--status-blocked)' : 'var(--status-active)' }}></div>
                            <span className={`text-body-s ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{agentQuality.guardrailTrigs} guardrail triggers</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-body-s ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>👍 {agentQuality.feedbackPos}</span>
                            <span className={`text-body-s ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>👎 {agentQuality.feedbackNeg}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tool Calls */}
                      <div className="mb-3">
                        <div className={`text-body-s font-semibold mb-2 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Tool Calls</div>
                        <div className="space-y-1.5">
                          {agentTools.map((tool, ti) => (
                            <div key={ti} className="flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <span className="text-[10px] text-sky-400 font-mono">{tool.name}</span>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>{tool.calls} calls</span>
                                <span className={`text-[10px] font-medium ${parseFloat(tool.failRate) > 10 ? 'text-red-400' : parseFloat(tool.failRate) > 2 ? 'text-yellow-400' : isDark ? 'text-green-400' : 'text-green-600'}`}>{tool.failRate} fail</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Traces */}
                      <div className="mb-3">
                        <div className={`text-body-s font-semibold mb-2 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Recent Traces</div>
                        <div className="space-y-1.5">
                          {agentTraces.map((trace, ti) => (
                            <div key={ti} className="flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{trace.id}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                                  trace.status === 'success' ? 'bg-green-500/15 text-green-400' :
                                  trace.status === 'failed' ? 'bg-red-500/15 text-red-400' :
                                  trace.status === 'timeout' ? 'bg-red-500/15 text-red-400' :
                                  'bg-yellow-500/15 text-yellow-400'
                                }`}>{trace.status}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>{trace.steps} steps</span>
                                <span className={`text-[10px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>{trace.duration}</span>
                                <span className={`text-[9px] ${isDark ? 'text-foreground-disabled' : 'text-gray-400'}`}>{trace.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="h-px w-full mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />

                      {/* Changes — same as applications */}
                      <div className="mb-2">
                        <div className={`text-body-s font-semibold mb-2 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Changes ({changes.length})</div>
                        <div className="space-y-2">
                          {changes.map((change, ci) => (
                            <div key={ci} className="rounded-lg p-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-body-s font-medium ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{change.type}</span>
                                <span className={`text-[10px] ${isDark ? 'text-foreground-secondary' : 'text-gray-500'}`}>{change.time}</span>
                              </div>
                              <div className="text-body-s text-sky-400 mb-0.5">{change.name}</div>
                              <div className={`text-[10px] ${isDark ? 'text-foreground-secondary' : 'text-gray-500'}`}>Initiated by: {change.initiator}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="h-px w-full mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />

                      {/* Agent Metrics Charts */}
                      <div>
                        <div className={`text-body-s font-semibold mb-1.5 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Metrics (aggregated)</div>
                        <div className={`text-[10px] mb-3 ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>Choose a point in the graphs to view correlated traces and more.</div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { title: 'Invocations & Success Rate', color: 'var(--primary)', data: service.status === 'critical' ? [0.3,0.5,0.8,0.95,0.7,0.4,0.6,0.85,0.5,0.3] : service.status === 'warning' ? [0.6,0.7,0.8,0.85,0.9,0.88,0.92,0.87,0.9,0.85] : [0.9,0.92,0.95,0.93,0.96,0.94,0.97,0.95,0.96,0.94] },
                            { title: 'Latency', subtitle: 'p99', color: 'var(--herman-violet)', data: service.status === 'critical' ? [0.2,0.4,0.9,0.95,0.8,0.6,0.85,0.7,0.5,0.9] : service.status === 'warning' ? [0.3,0.35,0.4,0.5,0.45,0.42,0.38,0.44,0.4,0.36] : [0.1,0.12,0.15,0.13,0.11,0.14,0.12,0.13,0.11,0.12] },
                            { title: 'Token Usage', color: 'var(--accent)', data: service.status === 'critical' ? [0.5,0.6,0.8,0.9,0.85,0.7,0.95,0.8,0.75,0.9] : service.status === 'warning' ? [0.4,0.45,0.5,0.55,0.5,0.48,0.52,0.5,0.47,0.51] : [0.2,0.22,0.25,0.23,0.21,0.24,0.22,0.23,0.21,0.22] },
                            { title: 'Guardrail Violations', color: 'var(--destructive)', data: service.status === 'critical' ? [0.0,0.1,0.4,0.6,0.8,0.5,0.7,0.3,0.6,0.4] : service.status === 'warning' ? [0.0,0.0,0.05,0.1,0.08,0.03,0.0,0.02,0.05,0.01] : [0,0,0,0,0,0,0,0,0,0] },
                          ].map((chart, ci) => (
                            <div key={ci} className="rounded-lg p-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-body-s font-medium ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{chart.title}</span>
                                {chart.subtitle && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--herman-violet)' }}>{chart.subtitle}</span>
                                )}
                              </div>
                              <svg width="100%" height="56" viewBox="0 0 160 56" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id={`agent-fill-${ci}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chart.color} stopOpacity="0.18" />
                                    <stop offset="100%" stopColor={chart.color} stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                                <text x="0" y="10" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'} fontSize="5.5">1.00</text>
                                <text x="0" y="29" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'} fontSize="5.5">0.50</text>
                                <text x="0" y="52" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'} fontSize="5.5">0</text>
                                <line x1="18" y1="7" x2="158" y2="7" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                                <line x1="18" y1="27" x2="158" y2="27" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                                <line x1="18" y1="49" x2="158" y2="49" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                                <path d={`M${18} ${49} ${chart.data.map((v, i) => `L${18 + (i / (chart.data.length - 1)) * 140} ${49 - v * 42}`).join(' ')} L${158} ${49} Z`} fill={`url(#agent-fill-${ci})`} />
                                <path d={`M${chart.data.map((v, i) => `${18 + (i / (chart.data.length - 1)) * 140} ${49 - v * 42}`).join(' L')}`} fill="none" stroke={chart.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex justify-between mt-1 px-3">
                                {['21:00','21:30','22:00','22:30','23:00','23:30'].map((t, ti) => (
                                  <span key={ti} className={`text-[8px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>{t}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      </>) : (<>
                      <div className="mb-2">
                        <div className={`text-body-s font-semibold mb-2 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Health</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-sm bg-yellow-500"></div>
                            <span className={`text-body-s ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{healthData.errors4xx} errors (4xx)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-sm bg-red-500"></div>
                            <span className={`text-body-s ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{healthData.faults5xx} faults (5xx)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-body-s" style={{ color: service.status === 'healthy' ? 'var(--status-active)' : 'var(--severity-critical)' }}>▲ {healthData.unhealthy} Services Unhealthy</span>
                          </div>
                        </div>
                      </div>

                      {/* Changes Section */}
                      <div className="mb-2">
                        <div className={`text-body-s font-semibold mb-2 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Changes ({changes.length})</div>
                        <div className="space-y-2">
                          {changes.map((change, ci) => (
                            <div
                              key={ci}
                              className="rounded-lg p-3"
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-body-s font-medium ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{change.type}</span>
                                <span className={`text-[10px] ${isDark ? 'text-foreground-secondary' : 'text-gray-500'}`}>{change.time}</span>
                              </div>
                              <div className="text-body-s text-sky-400 mb-0.5">{change.name}</div>
                              <div className={`text-[10px] ${isDark ? 'text-foreground-secondary' : 'text-gray-500'}`}>Initiated by: {change.initiator}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />

                      {/* Metrics (aggregated) Section */}
                      <div>
                        <div className={`text-body-s font-semibold mb-1.5 ${isDark ? 'text-foreground' : 'text-gray-700'}`}>Metrics (aggregated)</div>
                        <div className={`text-[10px] mb-3 ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>Choose a point in the graphs to view correlated spans and more.</div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { title: 'Requests and Availability', color: 'var(--primary)', data: service.status === 'critical' ? [0.3,0.5,0.8,0.95,0.7,0.4,0.6,0.85,0.5,0.3] : service.status === 'warning' ? [0.6,0.7,0.8,0.85,0.9,0.88,0.92,0.87,0.9,0.85] : [0.9,0.92,0.95,0.93,0.96,0.94,0.97,0.95,0.96,0.94] },
                            { title: 'Latency', subtitle: 'p99', color: 'var(--herman-violet)', data: service.status === 'critical' ? [0.2,0.4,0.9,0.95,0.8,0.6,0.85,0.7,0.5,0.9] : service.status === 'warning' ? [0.3,0.35,0.4,0.5,0.45,0.42,0.38,0.44,0.4,0.36] : [0.1,0.12,0.15,0.13,0.11,0.14,0.12,0.13,0.11,0.12] },
                            { title: 'Faults (5xx)', color: 'var(--destructive)', data: service.status === 'critical' ? [0.0,0.1,0.4,0.6,0.8,0.5,0.7,0.3,0.6,0.4] : service.status === 'warning' ? [0.0,0.0,0.05,0.1,0.08,0.03,0.0,0.02,0.05,0.01] : [0,0,0,0,0,0,0,0,0,0] },
                            { title: 'Errors (4xx)', color: 'var(--severity-warning)', data: service.status === 'critical' ? [0.1,0.2,0.15,0.3,0.25,0.4,0.2,0.35,0.3,0.15] : service.status === 'warning' ? [0.05,0.08,0.06,0.1,0.07,0.09,0.06,0.08,0.05,0.07] : [0,0,0.01,0,0,0.01,0,0,0,0] },
                          ].map((chart, ci) => (
                            <div
                              key={ci}
                              className="rounded-lg p-3"
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-body-s font-medium ${isDark ? 'text-foreground-secondary' : 'text-gray-600'}`}>{chart.title}</span>
                                {chart.subtitle && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--herman-violet)' }}>{chart.subtitle}</span>
                                )}
                              </div>
                              {/* Mini SVG Chart */}
                              <svg width="100%" height="56" viewBox="0 0 160 56" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id={`detail-fill-${ci}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chart.color} stopOpacity="0.18" />
                                    <stop offset="100%" stopColor={chart.color} stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                                {/* Y-axis labels */}
                                <text x="0" y="10" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'} fontSize="5.5">1.00</text>
                                <text x="0" y="29" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'} fontSize="5.5">0.50</text>
                                <text x="0" y="52" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'} fontSize="5.5">0</text>
                                {/* Grid lines */}
                                <line x1="18" y1="7" x2="158" y2="7" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                                <line x1="18" y1="27" x2="158" y2="27" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                                <line x1="18" y1="49" x2="158" y2="49" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="0.5" />
                                {/* Area fill */}
                                <path
                                  d={`M${18} ${49} ${chart.data.map((v, i) => `L${18 + (i / (chart.data.length - 1)) * 140} ${49 - v * 42}`).join(' ')} L${158} ${49} Z`}
                                  fill={`url(#detail-fill-${ci})`}
                                />
                                {/* Line */}
                                <path
                                  d={`M${chart.data.map((v, i) => `${18 + (i / (chart.data.length - 1)) * 140} ${49 - v * 42}`).join(' L')}`}
                                  fill="none"
                                  stroke={chart.color}
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {/* X-axis time labels */}
                              <div className="flex justify-between mt-1 px-3">
                                {['21:00','21:30','22:00','22:30','23:00','23:30'].map((t, ti) => (
                                  <span key={ti} className={`text-[8px] ${isDark ? 'text-foreground-muted' : 'text-gray-500'}`}>{t}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      </>)}
                    </div>
                  </div>
                </Card>
              </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
