'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MarqueeBanner from '@/components/MarqueeBanner'
import Footer from '@/components/Footer'
import { useReveal } from '@/hooks/useReveal'
import { useProducts } from '@/hooks/useProducts'
import { useCartContext } from '@/lib/CartContext'

const ACCENT = '#8B1539'

interface CollectionInfo {
  name: string
  count: number
  images: string[]
  priceRange: string
}

function CollectionCard({ collection, index }: { collection: CollectionInfo; index: number }) {
  const [ref, visible] = useReveal()

  return (
    <div
      ref={ref}
      className={`${visible ? 'animate-fadeUp' : 'opacity-0'}`}
      style={{ animationDelay: visible ? `${index * 0.08}s` : undefined }}
    >
    <Link
      href={`/trends/products?category=${encodeURIComponent(collection.name)}`}
      className="group relative block overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {collection.images[0] && (
          <Image
            src={collection.images[0]}
            alt={collection.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />

        {collection.images.length > 1 && (
          <div className="absolute right-3 top-3 flex -space-x-2">
            {collection.images.slice(1, 4).map((img, i) => (
              <div key={i} className="relative h-10 w-10 overflow-hidden rounded-lg border-2 border-white shadow-md">
                <Image src={img} alt="" fill unoptimized className="object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-white/70">{collection.count} product{collection.count !== 1 ? 's' : ''} · {collection.priceRange}</p>
          <h3 className="mt-1 font-serif text-2xl font-bold text-white">{collection.name}</h3>
          <span
            className="mt-3 inline-block rounded-full px-5 py-2 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:opacity-100"
            style={{ backgroundColor: ACCENT }}
          >
            Shop Collection →
          </span>
        </div>
      </div>
    </Link>
    </div>
  )
}

export default function TrendsCollectionsPage() {
  const { count, openCart } = useCartContext()
  const { products } = useProducts('trends')

  const collections = useMemo(() => {
    const catMap = new Map<string, { count: number; images: string[]; prices: number[] }>()

    products.forEach(p => {
      const existing = catMap.get(p.category)
      if (existing) {
        existing.count++
        if (p.images[0] && existing.images.length < 4) existing.images.push(p.images[0])
        existing.prices.push(p.price)
      } else {
        catMap.set(p.category, { count: 1, images: p.images[0] ? [p.images[0]] : [], prices: [p.price] })
      }
    })

    const result: CollectionInfo[] = []
    catMap.forEach((val, name) => {
      const min = Math.min(...val.prices)
      const max = Math.max(...val.prices)
      const priceRange = min === max ? `₹${min.toFixed(0)}` : `₹${min.toFixed(0)} – ₹${max.toFixed(0)}`
      result.push({ name, count: val.count, images: val.images, priceRange })
    })

    return result
  }, [products])

  return (
    <div className="bg-white">
      <Navbar brand="trends" cartCount={count} onCartOpen={openCart} />
      <MarqueeBanner brand="trends" />

      <section className="px-6 py-16" style={{ background: 'linear-gradient(120deg, #F5E6E0, #FFF5F0)' }}>
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: ACCENT }}>✦ Curated Edits ✦</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold text-gray-900">Collections</h1>
          <p className="mt-3 max-w-lg text-[15px] text-gray-500">Browse by category — each collection is built from your latest products.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {collections.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <span className="text-5xl">👗</span>
            <p className="mt-4 text-sm">No collections yet — add products with categories to see them here.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c, i) => (
              <CollectionCard key={c.name} collection={c} index={i} />
            ))}
          </div>
        )}
      </section>

      <Footer brand="trends" />
    </div>
  )
}
