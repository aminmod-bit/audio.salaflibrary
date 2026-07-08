import { useState, useEffect, useRef } from 'react'

// Отключить: поставьте false
const ENABLE_CURSOR_GLOW = false
const GLOW_SIZE = 500

const isTouchDevice = () =>
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: -300, y: -300 })
  const [visible, setVisible] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const raf = useRef(0)

  useEffect(() => {
    if (!ENABLE_CURSOR_GLOW || isTouchDevice()) { setDisabled(true); return }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) { setDisabled(true); return }

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY })
        setVisible(true)
      })
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  if (disabled) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x - GLOW_SIZE / 2,
        top: pos.y - GLOW_SIZE / 2,
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(34,197,94,0.12) 35%, rgba(212,175,55,0.08) 55%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        willChange: 'left, top',
        transform: 'translate3d(0,0,0)',
      }}
    />
  )
}
