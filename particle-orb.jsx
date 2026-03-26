import { useMemo } from 'react'
import './particle-orb.css'

/**
 * ParticleOrb — animated 3D particle sphere.
 *
 * Props:
 *  - size: orb radius in px (default 24)
 *  - count: number of particles (default 200)
 *  - particleSize: dot diameter in px (default 3)
 *  - duration: full rotation cycle in seconds (default 14)
 *  - active: whether animation is playing (default true)
 *  - className: additional wrapper classes
 *
 * Particles are colored along the herman gradient:
 * turquoise (#22d3ee) → violet (#a78bfa) → pink (#f472b6)
 */

// Gradient stops: turquoise → violet → pink
const COLORS = [
  [34, 211, 238],   // #22d3ee turquoise
  [167, 139, 250],  // #a78bfa violet
  [244, 114, 182],  // #f472b6 pink
]

function lerpColor(t) {
  const segment = t * (COLORS.length - 1)
  const i = Math.min(Math.floor(segment), COLORS.length - 2)
  const f = segment - i
  const a = COLORS[i]
  const b = COLORS[i + 1]
  const r = Math.round(a[0] + (b[0] - a[0]) * f)
  const g = Math.round(a[1] + (b[1] - a[1]) * f)
  const bl = Math.round(a[2] + (b[2] - a[2]) * f)
  return `rgb(${r},${g},${bl})`
}

// Seeded pseudo-random for deterministic particle placement
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function ParticleOrb({
  size = 24,
  count = 200,
  particleSize = 3,
  duration = 14,
  active = true,
  idle = false,
  className = '',
}) {
  const { particles, keyframes } = useMemo(() => {
    const rand = seededRandom(42)
    const parts = []
    const kfs = []

    for (let i = 0; i < count; i++) {
      const z = rand() * 360  // rotateZ angle
      const y = rand() * 360  // rotateY angle
      const t = i / count      // 0..1 for color gradient
      const color = lerpColor(t)
      const delay = i * 0.01
      const name = `porb${i}`

      parts.push({ color, delay, name })

      kfs.push(`@keyframes ${name}{` +
        `20%{opacity:1}` +
        `30%{transform:rotateZ(${-z}deg) rotateY(${y}deg) translateX(${size}px) rotateZ(${z}deg);opacity:1}` +
        `80%{transform:rotateZ(${-z}deg) rotateY(${y}deg) translateX(${size}px) rotateZ(${z}deg);opacity:1}` +
        `100%{transform:rotateZ(${-z}deg) rotateY(${y}deg) translateX(${size * 3}px) rotateZ(${z}deg)}` +
      `}`)
    }

    return { particles: parts, keyframes: kfs.join('') }
  }, [count, size])

  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size * 2, height: size * 2 }}
    >
      <style>{keyframes}</style>
      <div className={`particle-orb-wrap ${idle ? 'idle' : active ? '' : 'paused'}`} style={{ animationDuration: `${duration}s` }}>
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle-orb-dot"
            style={{
              width: particleSize,
              height: particleSize,
              backgroundColor: p.color,
              animation: `${p.name} ${duration}s infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
