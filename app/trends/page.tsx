'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import MarqueeBanner from '@/components/MarqueeBanner'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import ProductModal from '@/components/ProductModal'
import CustomerReviews from '@/components/CustomerReviews'
import CustomerTestimonials from '@/components/CustomerTestimonials'
import { useReveal } from '@/hooks/useReveal'
import { useProducts } from '@/hooks/useProducts'
import { useCartContext } from '@/lib/CartContext'
import { Product } from '@/lib/types'

const ACCENT = '#8B1539'
const CARD_BGS = ['#FFF5F0', '#F5EDE0', '#FDF0F4', '#F0F5FF', '#FFF8E1', '#F0FDF4']

function CategoryCard({ name, image, count, bg, delay }: { name: string; image?: string; count: number; bg: string; delay: number }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={`${visible ? 'animate-fadeUp' : 'opacity-0'}`}
      style={{ animationDelay: visible ? `${delay}s` : undefined }}
    >
      <Link
        href={`/trends/products?category=${encodeURIComponent(name)}`}
        className="group relative block overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-2"
        style={{ backgroundColor: bg, boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
      >
        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={image} alt={name} fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)' }} />
            <div className="absolute bottom-0 left-0 p-5">
              <h3 className="font-serif text-xl font-bold text-white">{name}</h3>
              <p className="text-xs text-white/70">{count} product{count !== 1 ? 's' : ''}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-8 py-14 text-center">
            <h3 className="font-serif text-2xl font-semibold text-gray-900">{name}</h3>
            <p className="text-xs text-gray-400">{count} product{count !== 1 ? 's' : ''}</p>
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>Explore →</span>
          </div>
        )}
      </Link>
    </div>
  )
}

export default function TrendsHome() {
  const { addToCart, count, openCart } = useCartContext()
  const { products } = useProducts('trends')
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const heroImages = products.slice(0, 4).map(p => p.images[0]).filter(Boolean)

  const displayProducts = products.filter(p => p.category !== 'Customer Review')

  const categories = useMemo(() => {
    const catMap = new Map<string, { count: number; image?: string }>()
    displayProducts.forEach(p => {
      const existing = catMap.get(p.category)
      if (existing) { existing.count++ }
      else { catMap.set(p.category, { count: 1, image: p.images[0] }) }
    })
    const result: { name: string; count: number; image?: string }[] = []
    catMap.forEach((val, name) => result.push({ name, ...val }))
    return result
  }, [displayProducts])

  return (
    <div className="bg-white">
      <Navbar brand="trends" cartCount={count} onCartOpen={openCart} />
      <MarqueeBanner brand="trends" />

      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 py-14 md:px-6 md:py-24"
        style={{ background: 'linear-gradient(135deg, #3D0A1B, #6B1230, #8B1539, #C8963E)' }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.18), transparent 60%)' }} />
        <div className="animate-orbFloat pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div className="animate-orbFloat pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full blur-[90px]" style={{ backgroundColor: 'rgba(200,150,62,0.18)', animationDelay: '6s' }} />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="animate-fadeUp">
            <h1 className="font-display text-3xl font-black leading-[1.05] text-white sm:text-5xl md:text-6xl">
              Dress the <br />
              <span className="italic" style={{ color: '#C8963E' }}>Woman</span> <br />
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

          {heroImages.length > 0 && <div className="grid grid-cols-2 gap-4">
            {heroImages.map((src, i) => (
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
          </div>}
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: ACCENT }}>✦ Just Dropped ✦</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-gray-900">New Arrivals</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {displayProducts.map((product, i) => (
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
      {categories.length > 0 && (
        <section className="px-4 py-12 md:px-6 md:py-24" style={{ backgroundColor: '#FDF0F4' }}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: ACCENT }}>✦ Curated for you ✦</p>
              <h2 className="mt-2 font-serif text-4xl font-semibold text-gray-900">Shop Collections</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {categories.map((c, i) => (
                <CategoryCard key={c.name} name={c.name} image={c.image} count={c.count} bg={CARD_BGS[i % CARD_BGS.length]} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Reviews */}
      <CustomerReviews brand="trends" accent={ACCENT} products={products} />

      {/* Owner Testimonials Scroll */}
      <CustomerTestimonials brand="trends" accent={ACCENT} products={products} />

      <Footer brand="trends" />
      <ProductModal product={modalProduct} accent={ACCENT} onClose={() => setModalProduct(null)} onAdd={addToCart} />
    </div>
  )
}
