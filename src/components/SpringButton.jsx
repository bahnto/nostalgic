import { useRef, useEffect } from 'react'
import { play } from '../lib/sounds.js'


export default function SpringButton({ children, onClick, className = 'btn', sound = 'kh-select', ...rest }) {
  const ref = useRef(null)
  const spring = useRef({ x: 1, v: 0, target: 1, raf: 0 })

  useEffect(() => {
    const s = spring.current
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.032)
      last = now
      const a = -280 * (s.x - s.target) - 9 * s.v
      s.v += a * dt; s.x += s.v * dt
      if (ref.current) ref.current.style.transform = `scale(${s.x.toFixed(4)})`
      s.raf = requestAnimationFrame(tick)
    }
    s.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(s.raf)
  }, [])

  return (
    <button
      ref={ref}
      className={className}
      onPointerDown={() => { spring.current.target = 0.94 }}
      onPointerUp={() => { spring.current.target = 1 }}
      onPointerLeave={() => { spring.current.target = 1 }}
      onClick={(e) => {
        play(sound)
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
