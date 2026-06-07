'use client'

import { Product } from '@/lib/types'
import { useReveal } from '@/hooks/useReveal'
import ImageCarousel from './ImageCarousel'

interface ProductCardProps {
  product: Product
  accent: string
  onAdd: (p: Product) => void
  onView: (p: Product) => void
  delay?: number
}

function truncate(text: string, len = 68) {
  return text.length > len ? text.slice(0, len).trimEnd() + '…' : text
}

export default function ProductCard({ product, accent, onAdd, onView, delay = 0 }: ProductCardProps) {
  const [ref, visible] = useReveal()

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-[20px] bg-white p-3 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] ${visible ? 'animate-fadeUp' : 'opacity-0'}`}
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
        animationDelay: visible ? `${delay}s` : undefined,
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.14)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)')}
    >
      <div className="relative">
        <ImageCarousel images={product.images} alt={product.name} />
        {!product.in_stock && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Out of Stock
          </span>
        )}
      </div>

      <div className="px-1 pt-3">
        <div className="text-[10px] font-bold uppercase" style={{ color: accent, letterSpacing: '2px' }}>
          {product.category}
        </div>
        <h3
          onClick={() => onView(product)}
          className="mt-1 cursor-pointer font-serif text-[15px] font-bold text-gray-900 hover:underline"
        >
          {product.name}
        </h3>
        <p className="mt-1 text-[13px] leading-snug text-gray-500">{truncate(product.description)}</p>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-serif text-[19px] font-bold text-gray-900">${product.price.toFixed(2)}</span>
        </div>

        <button
          disabled={!product.in_stock}
          onClick={() => onAdd(product)}
          className="btn-shimmer mt-3 w-full rounded-full py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            backgroundImage: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`,
            backgroundSize: '200% auto',
          }}
        >
          {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}
