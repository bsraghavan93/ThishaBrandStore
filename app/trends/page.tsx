'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import MarqueeBanner from '@/components/MarqueeBanner'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import ProductModal from '@/components/ProductModal'
import { useReveal } from '@/hooks/useReveal'
import { useCartContext } from '@/lib/CartContext'
import { trendsProducts } from '@/lib/seedData'
import { Product } from '@/lib/types'

const ACCENT = '#C2185B'

const HERO_IMAGES = trendsProducts.slice(0, 4).map(p => p.images[0])

const COLLECTIONS = [
  { name: 'Summer Bloom', emoji: '🌸', bg: '#FFF1F6' },
  { name: 'Power Dressing', emoji: '💼', bg: '#F3E9F4' },
  { name: 'Weekend Luxe', emoji: '✨', bg: '#FCE4EC' },
]

function CollectionCard({ name, emoji, bg, delay }: { name: string; emoji: string; bg: string; delay: number }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={`group flex flex-col items-center gap-3 rounded-3xl px-8 py-14 text-center transition-all duration-300 hover:-translate-y-2 ${visible ? 'animate-fadeUp' : 'opacity-0'}`}
      style={{ backgroundColor: bg, animationDelay: visible ? `${delay}s` : undefined, boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
    >
      <span className="text-5xl transition-transform duration-300 group-hover:scale-110">{emoji}</span>
      <h3 className="font-serif text-2xl font-semibold text-gray-900">{name}</h3>
      <Link href="/trends/collections" className="text-sm font-semibold" style={{ color: ACCENT }}>
        Explore →
      </Link>
    </div>
  )
}

export default function TrendsHome() {
  const { addToCart, count, openCart } = useCartContext()
  const [modalProduct, setModalProduct] = useState<Product | null>(null)

  return (
    <div className="bg-white">
      <Navbar brand="trends" cartCount={count} onCartOpen={openCart} />
      <MarqueeBanner brand="trends" />

      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 py-24"
        style={{ background: 'linear-gradient(135deg, #560027, #880e4f, #C2185B, #e91e8c)' }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.18), transparent 60%)' }} />
        <div className="animate-orbFloat pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div className="animate-orbFloat pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full blur-[90px]" style={{ backgroundColor: 'rgba(255,192,213,0.18)', animationDelay: '6s' }} />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="animate-fadeUp">
            <h1 className="font-display text-5xl font-black leading-[1.05] text-white md:text-6xl">
              Dress the <br />
              <span className="italic" style={{ color: '#ffc0d5' }}>Woman</span> <br />
              You Are
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/80">
              Bold cuts, modern silhouettes, and pieces that move with you — Thisha Trends is fashion for the woman who knows herself.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/trends/products"
                className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{ color: ACCENT }}
              >
                Shop Now →
              </Link>
              <Link
                href="/trends/collections"
                className="rounded-full border border-white/50 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                Collections
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {HERO_IMAGES.map((src, i) => (
              <div
                key={i}
                className="animate-float relative overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-105"
                style={{
                  aspectRatio: '3 / 4',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                <Image src={src} alt="Trends product" fill unoptimized className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: ACCENT }}>✦ Just Dropped ✦</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-gray-900">New Arrivals</h2>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {trendsProducts.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              accent={ACCENT}
              onAdd={addToCart}
              onView={setModalProduct}
              delay={i * 0.08}
            />
          ))}
        </div>
      </section>

      {/* Collections teaser */}
      <section className="px-6 py-24" style={{ backgroundColor: '#FCE4EC' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: ACCENT }}>✦ Curated for you ✦</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold text-gray-900">Shop Collections</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {COLLECTIONS.map((c, i) => (
              <CollectionCard key={c.name} {...c} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      <Footer brand="trends" />
      <ProductModal product={modalProduct} accent={ACCENT} onClose={() => setModalProduct(null)} onAdd={addToCart} />
    </div>
  )
}
