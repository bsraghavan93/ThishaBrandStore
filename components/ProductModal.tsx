'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Product } from '@/lib/types'

interface ProductModalProps {
  product: Product | null
  accent: string
  onClose: () => void
  onAdd: (p: Product) => void
}

export default function ProductModal({ product, accent, onClose, onAdd }: ProductModalProps) {
  const [activeImage, setActiveImage] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveImage(0)
  }, [product])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!product) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="animate-scaleIn relative grid w-full max-w-[820px] grid-cols-1 overflow-hidden rounded-[28px] bg-white md:grid-cols-2"
        style={{ maxHeight: '88vh' }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg shadow hover:bg-white"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Left: images */}
        <div className="bg-gray-50 p-6">
          <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '1 / 1' }}>
            <Image
              key={activeImage}
              src={product.images[activeImage]}
              alt={product.name}
              fill
              unoptimized
              className="animate-fadeIn object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.slice(0, 3).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-transform"
                  style={{
                    borderColor: i === activeImage ? accent : 'transparent',
                    transform: i === activeImage ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <Image src={img} alt={`${product.name} thumbnail ${i + 1}`} fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="flex flex-col overflow-y-auto p-8">
          <div className="text-[11px] font-bold uppercase" style={{ color: accent, letterSpacing: '2px' }}>
            {product.category}
          </div>
          <h2 className="mt-2 font-serif text-[32px] font-bold leading-tight text-gray-900">{product.name}</h2>
          <div className="mt-3 font-serif text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</div>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-500">{product.description}</p>

          <div className="mt-auto pt-6">
            <button
              disabled={!product.in_stock}
              onClick={() => { onAdd(product); onClose() }}
              className="btn-shimmer w-full rounded-full py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundImage: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`,
                backgroundSize: '200% auto',
              }}
            >
              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
