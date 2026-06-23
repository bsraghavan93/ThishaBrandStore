'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MarqueeBanner from '@/components/MarqueeBanner'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import ProductModal from '@/components/ProductModal'
import { useProducts } from '@/hooks/useProducts'
import { useCartContext } from '@/lib/CartContext'
import { Product } from '@/lib/types'

const ACCENT = '#3B5E1F'

export default function OrganicsProductsPage() {
  return (
    <Suspense>
      <OrganicsProductsContent />
    </Suspense>
  )
}

function OrganicsProductsContent() {
  const { addToCart, count, openCart } = useCartContext()
  const { products } = useProducts('organics')
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products])

  const filtered = useMemo(
    () => (activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory)),
    [products, activeCategory]
  )

  return (
    <div className="bg-white">
      <Navbar brand="organics" cartCount={count} onCartOpen={openCart} />
      <MarqueeBanner brand="organics" />

      {/* Header strip */}
      <section className="px-6 py-16" style={{ background: 'linear-gradient(120deg, #e8f3dc, #f6faf1)' }}>
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: ACCENT }}>✦ Thisha Organics ✦</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold text-gray-900">All Products</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        {/* Category filters */}
        <div className="mb-10 flex flex-wrap gap-3">
          {categories.map(cat => {
            const active = cat === activeCategory
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: active ? ACCENT : '#fff',
                  color: active ? '#fff' : '#666',
                  boxShadow: active ? '0 6px 18px rgba(59,94,31,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              accent={ACCENT}
              onAdd={addToCart}
              onView={setModalProduct}
              delay={i * 0.06}
            />
          ))}
        </div>
      </section>

      <Footer brand="organics" />
      <ProductModal product={modalProduct} accent={ACCENT} onClose={() => setModalProduct(null)} onAdd={addToCart} />
    </div>
  )
}
