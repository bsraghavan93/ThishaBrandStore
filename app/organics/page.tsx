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
import { useProducts } from '@/hooks/useProducts'
import { useCartContext } from '@/lib/CartContext'
import { organicsProducts } from '@/lib/seedData'
import { Product } from '@/lib/types'

const ACCENT = '#3B5E1F'

const VALUES = [
  { icon: '🌱', title: '100% Organic' },
  { icon: '🐰', title: 'Cruelty Free' },
  { icon: '🧪', title: 'Clean Formula' },
  { icon: '🌍', title: 'Eco Packaging' },
]

const HERO_IMAGES = organicsProducts.slice(0, 4).map(p => p.images[0])

function ValueCard({ icon, title, delay }: { icon: string; title: string; delay: number }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-4 text-center ${visible ? 'animate-fadeUp' : 'opacity-0'}`}
      style={{ animationDelay: visible ? `${delay}s` : undefined }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 hover:scale-110 hover:-rotate-3"
        style={{ backgroundColor: '#f0f7ea' }}
      >
        {icon}
      </div>
      <span className="font-medium text-gray-800">{title}</span>
    </div>
  )
}

export default function OrganicsHome() {
  const { addToCart, count, openCart } = useCartContext()
  const { products } = useProducts('organics')
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const [valuesRef, valuesVisible] = useReveal()
  const [testimonialRef, testimonialVisible] = useReveal()

  return (
    <div className="bg-white">
      <Navbar brand="organics" cartCount={count} onCartOpen={openCart} />
      <MarqueeBanner brand="organics" />

      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 py-24"
        style={{ background: 'linear-gradient(135deg, #1e3810, #3B5E1F, #7aad45)' }}
      >
        <div className="animate-orbFloat pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full blur-[90px]" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <div className="animate-orbFloat pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(168,216,122,0.2)', animationDelay: '5s' }} />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="animate-fadeUp">
            <p className="text-sm font-medium tracking-[3px]" style={{ color: '#a8d87a' }}>✦ Pure · Natural · Honest ✦</p>
            <h1 className="mt-4 font-serif text-5xl font-semibold italic leading-tight text-white md:text-6xl">
              Skincare made <span style={{ color: '#a8d87a' }}>honest</span>, <br /> straight from nature
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/80">
              Thisha Organics blends ancient botanicals with modern science — clean formulas free of nasties, made to love your skin and the planet.
            </p>
            <Link
              href="/organics/products"
              className="btn-shimmer mt-8 inline-block rounded-full px-8 py-3.5 text-sm font-semibold text-white"
              style={{ backgroundImage: 'linear-gradient(90deg, #2c4717, #5a8a31, #2c4717)', backgroundSize: '200% auto' }}
            >
              Shop Now →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {HERO_IMAGES.map((src, i) => (
              <div
                key={i}
                className="animate-float relative overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-105"
                style={{
                  aspectRatio: '1 / 1',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                <Image src={src} alt="Organics product" fill unoptimized className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section ref={valuesRef} className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {VALUES.map((v, i) => (
            <ValueCard key={v.title} icon={v.icon} title={v.title} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: ACCENT }}>✦ Loved by many ✦</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-gray-900">Our Bestsellers</h2>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {products.map((product, i) => (
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

      {/* Testimonial */}
      <section
        ref={testimonialRef}
        className="px-6 py-24 text-center"
        style={{ background: 'linear-gradient(135deg, #16280c, #3B5E1F)' }}
      >
        <div className={`mx-auto max-w-2xl ${testimonialVisible ? 'animate-fadeUp' : 'opacity-0'}`}>
          <span className="font-serif text-6xl" style={{ color: '#a8d87a' }}>&ldquo;</span>
          <p className="font-serif text-[28px] italic leading-snug text-white">
            My skin has never felt this calm and radiant. Thisha Organics feels like a ritual, not just a routine.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[3px] text-white/60">— Aanya R., verified customer</p>
        </div>
      </section>

      <Footer brand="organics" />

      <ProductModal product={modalProduct} accent={ACCENT} onClose={() => setModalProduct(null)} onAdd={addToCart} />
    </div>
  )
}
