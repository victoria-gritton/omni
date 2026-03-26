import './css-orb.css'

/**
 * CssOrb — animated gradient sphere.
 *
 * Props:
 *  - size: pixel diameter (default 40)
 *  - active: adds ambient glow
 *  - loading: triggers a pulsing animation
 */
export default function CssOrb({ size = 40, active = false, loading = false }) {
  return (
    <div
      aria-hidden="true"
      className={`css-orb ${active ? 'css-orb-active' : ''} ${loading ? 'css-orb-loading' : ''}`}
      style={{ width: size, height: size }}
    />
  )
}
