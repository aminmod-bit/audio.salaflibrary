import { useState, useEffect } from 'react'

const isTouchDevice = () =>
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

export default function NatureBackground() {
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (isTouchDevice()) { setDisabled(true); return }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) { setDisabled(true); return }
  }, [])

  if (disabled) return null

  return (
    <div className="nature-bg" aria-hidden="true">
      <div className="nature-layer nature-clouds" />
      <div className="nature-layer nature-mist" />
      <div className="nature-layer nature-glow" />
      <div className="nature-particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="nature-particle" style={{
            left: `${8 + (i * 7.5) % 100}%`,
            animationDelay: `${i * 2.5}s`,
            animationDuration: `${18 + (i % 4) * 4}s`,
          }} />
        ))}
      </div>
    </div>
  )
}
