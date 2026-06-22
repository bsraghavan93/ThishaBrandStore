'use client'

import { useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import MarqueeBanner from '@/components/MarqueeBanner'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import ProductModal from '@/components/ProductModal'
import { useProducts } from '@/hooks/useProducts'
import { useCartContext } from '@/lib/CartContext'
import { Product } from '@/lib/types'

const ACCENT = '#8B1539'

export default function TrendsProductsPage() {
  const { addToCart, count, openCart } = useCartContext()
  const { products } = useProducts('trends')
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products])

  const filtered = useMemo(
    () => (activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory)),
    [products, activeCategory]
  )

  return (
    <div className="bg-white">
      <Navbar brand="trends" cartCount={count} onCartOpen={openCart} />
      <MarqueeBanner brand="trends" />

      {/* Header strip */}
      <section className="px-6 py-16" style={{ background: 'linear-gradient(120deg, #F5E6E0, #FFF5F0)' }}>
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: ACCENT }}>✦ Thisha Trends ✦</p>
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
                  backgroundColor: active ? ACCENT : '#FDF0F4',
                  color: active ? '#fff' : ACCENT,
                  boxShadow: active ? '0 6px 18px rgba(139,21,57,0.35)' : 'none',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(244px, 1fr))' }}>
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

      <Footer brand="trends" />
      <ProductModal product={modalProduct} accent={ACCENT} onClose={() => setModalProduct(null)} onAdd={addToCart} />
    </div>
  )
}
