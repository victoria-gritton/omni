import { useId } from 'react'

export default function GlowingGlobe({ size = 20, className = "" }) {
  const uid = useId().replace(/:/g, '')
  const sphereId = `sphere-gradient-${uid}`
  const glowId = `outer-glow-${uid}`
  const filterId = `glow-filter-${uid}`
  const highlightId = `highlight-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id={sphereId} cx="35%" cy="35%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#5cf2ff" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#36e6c2" stopOpacity="0.7" />
          <stop offset="85%" stopColor="#8b7cff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#5cf2ff" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id={glowId} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#5cf2ff" stopOpacity="0" />
          <stop offset="50%" stopColor="#36e6c2" stopOpacity="0.3" />
          <stop offset="80%" stopColor="#8b7cff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#5cf2ff" stopOpacity="0" />
        </radialGradient>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={highlightId} cx="30%" cy="30%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#5cf2ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5cf2ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="10" cy="10" r="9.5" fill={`url(#${glowId})`} opacity="0.8">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        <animate attributeName="r" values="9;10.5;9" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="10" cy="10" r="7" fill={`url(#${sphereId})`} filter={`url(#${filterId})`}>
        <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="8" cy="8" rx="4" ry="3.5" fill={`url(#${highlightId})`} opacity="0.7">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <circle cx="10" cy="10" r="7" fill="none" stroke="#5cf2ff" strokeWidth="0.5" opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
