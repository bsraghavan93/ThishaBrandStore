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
  const hasVariants = (product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0)

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl bg-white p-2 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] md:rounded-[20px] md:p-3 ${visible ? 'animate-fadeUp' : 'opacity-0'}`}
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

      <div className="px-1 pt-2 md:pt-3">
        <div className="text-[9px] font-bold uppercase md:text-[10px]" style={{ color: accent, letterSpacing: '2px' }}>
          {product.category}
        </div>
        <h3
          onClick={() => onView(product)}
          className="mt-0.5 cursor-pointer font-serif text-[13px] font-bold leading-tight text-gray-900 hover:underline md:mt-1 md:text-[15px]"
        >
          {product.name}
        </h3>
        <p className="mt-0.5 hidden text-[13px] leading-snug text-gray-500 md:block">{truncate(product.description)}</p>

        <div className="mt-1.5 flex items-center justify-between md:mt-2">
          <span className="font-serif text-[15px] font-bold text-gray-900 md:text-[19px]">₹{product.price.toFixed(2)}</span>
          {product.colors && product.colors.length > 0 && (
            <div className="flex -space-x-1">
              {product.colors.slice(0, 5).map(c => (
                <span
                  key={c.hex}
                  className="inline-block h-4 w-4 rounded-full border border-white"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white bg-gray-200 text-[8px] font-bold text-gray-500">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          disabled={!product.in_stock}
          onClick={() => hasVariants ? onView(product) : onAdd(product)}
          className="btn-shimmer mt-2 w-full rounded-full py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 md:mt-3 md:py-2.5 md:text-sm"
          style={{
            backgroundImage: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`,
            backgroundSize: '200% auto',
          }}
        >
          {!product.in_stock ? 'Out of Stock' : hasVariants ? 'Select Options' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
