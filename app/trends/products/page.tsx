'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MarqueeBanner from '@/components/MarqueeBanner'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import ProductModal from '@/components/ProductModal'
import ProductFilters from '@/components/ProductFilters'
import Pagination from '@/components/Pagination'
import { useProducts } from '@/hooks/useProducts'
import { useCartContext } from '@/lib/CartContext'
import { Product } from '@/lib/types'

const ACCENT = '#8B1539'
const PER_PAGE = 12

export default function TrendsProductsPage() {
  return (
    <Suspense>
      <TrendsProductsContent />
    </Suspense>
  )
}

function TrendsProductsContent() {
  const { addToCart, count, openCart } = useCartContext()
  const { products } = useProducts('trends')
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999])
  const [page, setPage] = useState(1)

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products])
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 0), [products])

  const filtered = useMemo(() => {
    let result = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      )
    }

    const effectiveMax = priceRange[1] >= 99999 ? Infinity : priceRange[1]
    result = result.filter(p => p.price >= priceRange[0] && p.price <= effectiveMax)

    switch (sort) {
      case 'price-low': result = [...result].sort((a, b) => a.price - b.price); break
      case 'price-high': result = [...result].sort((a, b) => b.price - a.price); break
      case 'newest': result = [...result].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')); break
      case 'popular': break
    }

    return result
  }, [products, activeCategory, search, sort, priceRange])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleCategoryChange = (cat: string) => { setActiveCategory(cat); setPage(1) }
  const handleSearchChange = (v: string) => { setSearch(v); setPage(1) }
  const handleSortChange = (v: 'newest' | 'price-low' | 'price-high' | 'popular') => { setSort(v); setPage(1) }
  const handlePriceChange = (v: [number, number]) => { setPriceRange(v); setPage(1) }

  return (
    <div className="bg-white">
      <Navbar brand="trends" cartCount={count} onCartOpen={openCart} />
      <MarqueeBanner brand="trends" />

      <section className="px-4 py-10 md:px-6 md:py-16" style={{ background: 'linear-gradient(120deg, #F5E6E0, #FFF5F0)' }}>
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: ACCENT }}>✦ Thisha Trends ✦</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-gray-900 md:text-5xl">All Products</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-14">
        {/* Category filters */}
        <div className="mb-5 flex flex-wrap gap-2 md:mb-6 md:gap-3">
          {categories.map(cat => {
            const active = cat === activeCategory
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 md:px-5 md:py-2 md:text-sm"
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

        <ProductFilters
          accent={ACCENT}
          search={search}
          onSearchChange={handleSearchChange}
          sort={sort}
          onSortChange={handleSortChange}
          priceRange={priceRange}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          resultCount={filtered.length}
        />

        {paginated.length === 0 ? (
          <div className="py-20 text-center">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 text-sm text-gray-400">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
            {paginated.map((product, i) => (
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
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} accent={ACCENT} />
      </section>

      <Footer brand="trends" />
      <ProductModal product={modalProduct} accent={ACCENT} onClose={() => setModalProduct(null)} onAdd={addToCart} />
    </div>
  )
}
