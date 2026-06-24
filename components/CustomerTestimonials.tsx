'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Brand, Product } from '@/lib/types'
import { useReveal } from '@/hooks/useReveal'

export default function CustomerTestimonials({ brand, accent, products }: { brand: Brand; accent: string; products: Product[] }) {
  const testimonials = products.filter(p => p.category === 'Customer Review')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [headerRef, headerVisible] = useReveal()

  if (testimonials.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 340
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const brandName = brand === 'organics' ? 'Thisha Organics' : 'Thisha Trends'

  return (
    <section
      className="px-4 py-12 md:px-6 md:py-20"
      style={{ background: brand === 'organics' ? 'linear-gradient(135deg, #16280c, #3B5E1F)' : 'linear-gradient(135deg, #3D0A1B, #6B1230)' }}
    >
      <div ref={headerRef} className={`mx-auto max-w-7xl ${headerVisible ? 'animate-fadeUp' : 'opacity-0'}`}>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: brand === 'organics' ? '#a8d87a' : '#C8963E' }}>
              ✦ Real Stories ✦
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-white md:text-4xl">
              What Customers Say About {brandName}
            </h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <button onClick={() => scroll('left')} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10">←</button>
            <button onClick={() => scroll('right')} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10">→</button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-5 overflow-x-auto pb-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {testimonials.map((item, i) => (
            <div
              key={item.id}
              className="flex-shrink-0 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm"
              style={{ width: '320px', scrollSnapAlign: 'start', animationDelay: `${i * 0.1}s` }}
            >
              {item.images[0] && (
                <div className="relative aspect-square overflow-hidden">
                  <Image src={item.images[0]} alt={item.name} fill unoptimized className="object-cover" sizes="320px" />
                </div>
              )}
              <div className="p-5">
                {item.description && (
                  <p className="font-serif text-[15px] italic leading-relaxed text-white/90">
                    &ldquo;{item.description}&rdquo;
                  </p>
                )}
                <p className="mt-3 text-xs uppercase tracking-[2px] text-white/50">— {item.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-2 md:hidden">
          <button onClick={() => scroll('left')} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-sm text-white">←</button>
          <button onClick={() => scroll('right')} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-sm text-white">→</button>
        </div>
      </div>
    </section>
  )
}
