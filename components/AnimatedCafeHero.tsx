'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Animated watercolor café illustration for the Trends hero.
 *
 * Tuning knobs live in the `.cafe-hero` block in app/globals.css:
 *   --cafe-scale, --cafe-offset-x, --cafe-offset-y  (artwork size / position)
 *   --cafe-float-duration, --cafe-steam-duration     (CSS animation speed)
 * and in the constants below (frame loop speed, parallax strength).
 */

const FRAME_COUNT = 16
const FRAME_FPS = 10          // 16 frames @ 10fps = 1.6s loop
const PARALLAX_MAX_PX = 8
const WIDTH = 1448
const HEIGHT = 1086

const POSTER = '/trends-hero/woman-cafe-poster.webp'
const frameSrc = (i: number) => `/trends-hero/frames/frame-${String(i).padStart(2, '0')}.webp`

// Soft edges so the artwork melts into the hero gradient (no visible rectangle).
const MASK =
  'linear-gradient(to right, transparent 0%, #000 24%, #000 90%, transparent 100%), ' +
  'linear-gradient(to bottom, transparent 0%, #000 10%, #000 88%, transparent 100%)'

export default function AnimatedCafeHero() {
  const rootRef = useRef<HTMLDivElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [motionOk, setMotionOk] = useState(false)

  // Only enable motion on the client when the user hasn't asked to reduce it.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setMotionOk(!mq.matches)
    const onChange = () => setMotionOk(!mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Frame loop: preload after first paint, run only while visible.
  useEffect(() => {
    const img = imgRef.current
    const root = rootRef.current
    if (!motionOk || !img || !root) return

    let cancelled = false
    let timer: ReturnType<typeof setInterval> | null = null
    let frame = 0
    let inView = true
    let loaded = false

    const tick = () => {
      frame = (frame + 1) % FRAME_COUNT
      img.src = frameSrc(frame)
    }
    const sync = () => {
      const shouldRun = loaded && inView && !document.hidden
      if (shouldRun && !timer) timer = setInterval(tick, 1000 / FRAME_FPS)
      if (!shouldRun && timer) { clearInterval(timer); timer = null }
    }

    const start = () => {
      let remaining = FRAME_COUNT
      for (let i = 0; i < FRAME_COUNT; i++) {
        const pre = new window.Image()
        pre.onload = pre.onerror = () => {
          if (--remaining === 0 && !cancelled) { loaded = true; sync() }
        }
        pre.src = frameSrc(i)
      }
    }
    const idle = (window as any).requestIdleCallback as undefined | ((cb: () => void) => number)
    const startHandle = idle ? idle(start) : window.setTimeout(start, 600)

    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync() })
    io.observe(root)
    document.addEventListener('visibilitychange', sync)

    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      if (idle) (window as any).cancelIdleCallback?.(startHandle)
      else clearTimeout(startHandle as number)
      img.src = POSTER
    }
  }, [motionOk])

  // Pointer parallax (desktop / fine pointers only), max 8px.
  useEffect(() => {
    const el = parallaxRef.current
    if (!motionOk || !el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2
        const y = (e.clientY / window.innerHeight - 0.5) * 2
        el.style.transform = `translate3d(${(x * PARALLAX_MAX_PX).toFixed(1)}px, ${(y * PARALLAX_MAX_PX).toFixed(1)}px, 0)`
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [motionOk])

  return (
    <div ref={rootRef} className="cafe-hero" data-motion={motionOk ? 'on' : 'off'}>
      <div
        className="cafe-hero__mask"
        style={{
          WebkitMaskImage: MASK,
          maskImage: MASK,
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      >
        <div className="cafe-hero__float">
          <div ref={parallaxRef} className="cafe-hero__parallax" style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={POSTER}
              width={WIDTH}
              height={HEIGHT}
              alt="Watercolor illustration of a woman in a straw hat and red top having coffee at a café"
              fetchPriority="high"
              decoding="async"
              draggable={false}
              className="block h-full w-full object-contain"
            />
            {/* Steam rises from the cup (cup rim ≈ 60% across, 79% down the artwork) */}
            <span className="cafe-hero__steam cafe-hero__steam--a" aria-hidden="true" />
            <span className="cafe-hero__steam cafe-hero__steam--b" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
