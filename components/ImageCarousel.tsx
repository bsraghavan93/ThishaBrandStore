'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: string[]
  alt: string
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [index, setIndex] = useState(0)

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIndex(i => (i - 1 + images.length) % images.length)
  }
  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIndex(i => (i + 1) % images.length)
  }

  return (
    <div
      className="group relative overflow-hidden rounded-2xl"
      style={{ aspectRatio: '1 / 1' }}
    >
      <Image
        key={index}
        src={images[index]}
        alt={alt}
        fill
        unoptimized
        className="animate-fadeIn object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />

      {/* bottom gradient overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent" />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-sm opacity-70 backdrop-blur transition-all duration-200 hover:scale-110 md:left-2 md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-sm opacity-70 backdrop-blur transition-all duration-200 hover:scale-110 md:right-2 md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next image"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIndex(i) }}
                className="h-1.5 rounded-full bg-white/80 transition-all duration-300"
                style={{ width: i === index ? '20px' : '6px', opacity: i === index ? 1 : 0.5 }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
