import { useRef, useState, useCallback, useEffect, type ReactNode, type CSSProperties } from 'react'

interface TiltSpotlightCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  maxTilt?: number
  glowColor?: string
}

const isTouchDevice = () =>
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

export default function TiltSpotlightCard({
  children,
  className = '',
  style,
  maxTilt = 12,
  glowColor = 'rgba(168, 85, 247, 0.35)',
}: TiltSpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [vars, setVars] = useState({ mx: '50%', my: '50%', rx: '0deg', ry: '0deg' })
  const [hovered, setHovered] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [isReduced, setIsReduced] = useState(false)

  useEffect(() => {
    setIsTouch(isTouchDevice())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isReduced || isTouch) return
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const ry = (px - 0.5) * maxTilt
    const rx = (0.5 - py) * maxTilt
    setVars({
      mx: `${px * 100}%`,
      my: `${py * 100}%`,
      rx: `${rx}deg`,
      ry: `${ry}deg`,
    })
  }, [isReduced, isTouch, maxTilt])

  const handleMouseEnter = useCallback(() => setHovered(true), [])
  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    setVars({ mx: '50%', my: '50%', rx: '0deg', ry: '0deg' })
  }, [])

  const cardStyle: CSSProperties = {
    '--mx': vars.mx,
    '--my': vars.my,
    '--rx': vars.rx,
    '--ry': vars.ry,
    transform: hovered && !isReduced && !isTouch
      ? `perspective(900px) rotateX(${vars.rx}) rotateY(${vars.ry}) translateY(-4px)`
      : 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)',
    transition: hovered ? 'transform 0.15s ease-out' : 'transform 0.5s ease-out',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  } as CSSProperties

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    background: hovered && !isReduced && !isTouch
      ? `radial-gradient(circle at ${vars.mx} ${vars.my}, ${glowColor}, transparent 55%)`
      : 'none',
    opacity: hovered ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
    zIndex: 1,
  }

  const borderGlowStyle: CSSProperties = {
    position: 'absolute',
    inset: -1,
    borderRadius: 'inherit',
    padding: 1,
    background: hovered && !isReduced && !isTouch
      ? `linear-gradient(135deg, rgba(168,85,247,0.4), rgba(212,175,55,0.3), rgba(34,197,94,0.25), rgba(168,85,247,0.4))`
      : 'none',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    opacity: hovered ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
    zIndex: 3,
  }

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={borderGlowStyle} />
      <div style={overlayStyle} />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  )
}
