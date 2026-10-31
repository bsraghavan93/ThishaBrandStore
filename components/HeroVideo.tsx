'use client'

import { useEffect, useRef } from 'react'

interface HeroVideoProps {
  src: string
  className?: string
  videoClassName?: string
  /** CSS mask that fades the video into the hero background. */
  mask?: string
}

/**
 * Muted, looping, inline hero video. Pauses when off-screen, when the tab is
 * hidden, and for visitors who prefer reduced motion (shows the first frame).
 */
export default function HeroVideo({ src, className = '', videoClassName = '', mask }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let inView = true

    const sync = () => {
      if (!reduced.matches && inView && !document.hidden) video.play().catch(() => {})
      else video.pause()
    }
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync() })
    io.observe(video)
    document.addEventListener('visibilitychange', sync)
    reduced.addEventListener('change', sync)
    sync()

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      reduced.removeEventListener('change', sync)
    }
  }, [])

  return (
    <div
      className={className}
      style={mask ? { WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: 'source-in', maskComposite: 'intersect' } : undefined}
    >
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        className={`h-full w-full object-cover ${videoClassName}`}
      />
    </div>
  )
}
