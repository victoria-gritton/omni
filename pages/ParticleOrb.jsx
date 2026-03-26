import { useEffect, useRef } from 'react'

export default function ParticleOrb({ isDark }) {
  const wrapRef = useRef(null)
  const styleSheetRef = useRef(null)

  useEffect(() => {
    if (!wrapRef.current) return

    const particleCount = 800 // Reduced from 2000
    const orbSize = 200 // Reduced from 300
    const wrap = wrapRef.current

    // Clear existing particles
    wrap.innerHTML = ''

    // Create or reuse style sheet
    if (!styleSheetRef.current) {
      styleSheetRef.current = document.createElement('style')
      document.head.appendChild(styleSheetRef.current)
    } else {
      // Clear existing rules
      while (styleSheetRef.current.sheet.cssRules.length > 0) {
        styleSheetRef.current.sheet.deleteRule(0)
      }
    }

    const styleSheet = styleSheetRef.current

    // Generate particles and their animations
    for (let i = 0; i < particleCount; i++) {
      // Create particle element
      const particle = document.createElement('div')
      particle.className = 'particle-orb-dot'
      particle.style.animation = `orbit${i} 14s infinite`
      particle.style.animationDelay = `${i * 0.01}s`
      wrap.appendChild(particle)

      // Generate random angles for 3D positioning
      const z = Math.random() * 360
      const y = Math.random() * 360

      // Create keyframe animation for this particle
      const keyframes = `
        @keyframes orbit${i} {
          0% { 
            transform: rotateZ(-${z}deg) rotateY(${y}deg) translateX(${orbSize}px) rotateZ(${z}deg);
            opacity: 1;
          }
          80% { 
            transform: rotateZ(-${z}deg) rotateY(${y}deg) translateX(${orbSize}px) rotateZ(${z}deg);
            opacity: 1;
          }
          100% { 
            transform: rotateZ(-${z}deg) rotateY(${y}deg) translateX(${orbSize * 3}px) rotateZ(${z}deg);
            opacity: 0;
          }
        }
      `
      styleSheet.sheet.insertRule(keyframes, styleSheet.sheet.cssRules.length)
    }

    // Cleanup function
    return () => {
      if (styleSheetRef.current && styleSheetRef.current.parentNode) {
        // Don't remove the stylesheet, just clear it for reuse
      }
    }
  }, [isDark])

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/2 left-1/2 w-0 h-0" style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        animation: 'rotate-orb 14s infinite linear'
      }}>
        <div ref={wrapRef} className="absolute top-0 left-0 w-0 h-0" style={{
          transformStyle: 'preserve-3d'
        }}></div>
      </div>
    </div>
  )
}
