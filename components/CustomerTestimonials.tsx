'use client'

import Image from 'next/image'
import { useMemo, useRef } from 'react'
import { Brand, Product } from '@/lib/types'
import { useReveal } from '@/hooks/useReveal'

interface TestimonialCard {
  id: string
  image: string
  description: string
  name: string
}

export default function CustomerTestimonials({ brand, products }: { brand: Brand; products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [headerRef, headerVisible] = useReveal()

  const cards = useMemo(() => {
    const result: TestimonialCard[] = []
    products
      .filter(p => p.category === 'Customer Review')
      .forEach(p => {
        if (p.images.length === 0) {
          result.push({ id: p.id, image: '', description: p.description, name: p.name })
        } else {
          p.images.forEach((img, i) => {
            result.push({ id: `${p.id}-${i}`, image: img, description: p.description, name: p.name })
          })
        }
      })
    return result
  }, [products])

  if (cards.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' })
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
          {cards.map((card, i) => (
            <div
              key={card.id}
              className="flex-shrink-0 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm"
              style={{ width: '320px', scrollSnapAlign: 'start', animationDelay: `${i * 0.1}s` }}
            >
              {card.image && (
                <div className="relative aspect-square overflow-hidden">
                  <Image src={card.image} alt={card.name} fill unoptimized className="object-cover" sizes="320px" />
                </div>
              )}
              <div className="p-5">
                {card.description && (
                  <p className="font-serif text-[15px] italic leading-relaxed text-white/90">
                    &ldquo;{card.description}&rdquo;
                  </p>
                )}
                <p className="mt-3 text-xs uppercase tracking-[2px] text-white/50">— {card.name}</p>
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
