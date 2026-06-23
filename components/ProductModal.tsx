'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Product } from '@/lib/types'

interface ProductModalProps {
  product: Product | null
  accent: string
  onClose: () => void
  onAdd: (p: Product, color?: string, size?: string, qty?: number) => void
}

export default function ProductModal({ product, accent, onClose, onAdd }: ProductModalProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | undefined>()
  const [selectedSize, setSelectedSize] = useState<string | undefined>()
  const [qty, setQty] = useState(1)
  const [variantError, setVariantError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveImage(0)
    setSelectedColor(undefined)
    setSelectedSize(undefined)
    setQty(1)
    setVariantError('')
  }, [product])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!product) return null

  const hasColors = product.colors && product.colors.length > 0
  const hasSizes = product.sizes && product.sizes.length > 0
  const isTrends = product.brand === 'trends'
  const oosSizes = product.oos_sizes || []
  const oosColors = product.oos_colors || []

  const isSizeOos = (s: string) => oosSizes.includes(s)
  const isColorOos = (name: string) => oosColors.includes(name)

  const handleAdd = () => {
    if (hasColors && !selectedColor) {
      setVariantError('Please select a color')
      return
    }
    if (hasSizes && !selectedSize) {
      setVariantError('Please select a size')
      return
    }
    setVariantError('')
    onAdd(product, selectedColor, selectedSize, qty)
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="animate-scaleIn relative grid w-full max-w-[860px] grid-cols-1 overflow-hidden rounded-[28px] bg-white md:grid-cols-2"
        style={{ maxHeight: '90vh' }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg shadow hover:bg-white"
          aria-label="Close"
        >
          ✕
        </button>

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
              {product.images.slice(0, 4).map((img, i) => (
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

        <div className="flex flex-col overflow-y-auto p-8">
          <div className="text-[11px] font-bold uppercase" style={{ color: accent, letterSpacing: '2px' }}>
            {product.category}
          </div>
          <h2 className="mt-2 font-serif text-[28px] font-bold leading-tight text-gray-900">{product.name}</h2>
          <div className="mt-2 font-serif text-2xl font-bold text-gray-900">₹{product.price.toFixed(2)}</div>
          <p className="mt-3 text-[14px] leading-relaxed text-gray-500">{product.description}</p>

          {/* Color selector */}
          {hasColors && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Color {selectedColor && <span className="normal-case tracking-normal text-gray-600">— {selectedColor}</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors!.map(c => {
                  const oos = isColorOos(c.name)
                  return (
                    <div key={c.hex} className="group relative">
                      <button
                        disabled={oos}
                        onClick={() => { if (!oos) { setSelectedColor(c.name); setVariantError('') } }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform"
                        style={{
                          borderColor: selectedColor === c.name ? accent : '#e5e5e5',
                          boxShadow: selectedColor === c.name ? `0 0 0 2px ${accent}33` : 'none',
                          opacity: oos ? 0.35 : 1,
                          cursor: oos ? 'not-allowed' : 'pointer',
                          filter: oos ? 'grayscale(80%)' : 'none',
                        }}
                        title={oos ? `${c.name} — Out of Stock` : c.name}
                      >
                        <span className="h-6 w-6 rounded-full" style={{ backgroundColor: c.hex }} />
                        {oos && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="h-[2px] w-7 rotate-45 rounded bg-red-500/70" />
                          </span>
                        )}
                      </button>
                      {oos && (
                        <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Size selector */}
          {hasSizes && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes!.map(s => {
                  const oos = isSizeOos(s)
                  const selected = selectedSize === s
                  return (
                    <div key={s} className="group relative">
                      <button
                        disabled={oos}
                        onClick={() => { if (!oos) { setSelectedSize(s); setVariantError('') } }}
                        className="relative rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all"
                        style={{
                          backgroundColor: oos ? '#f9fafb' : selected ? accent : '#fff',
                          color: oos ? '#d1d5db' : selected ? '#fff' : '#444',
                          borderColor: oos ? '#e5e7eb' : selected ? accent : '#e5e5e5',
                          cursor: oos ? 'not-allowed' : 'pointer',
                          textDecoration: oos ? 'line-through' : 'none',
                        }}
                      >
                        {s}
                      </button>
                      {oos && (
                        <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Product details */}
          {isTrends ? (
            (product.material || product.fit_type || product.care_instructions) && (
              <div className="mt-5 space-y-1.5 rounded-xl bg-gray-50 px-4 py-3">
                {product.material && <DetailRow label="Material" value={product.material} />}
                {product.fit_type && <DetailRow label="Fit" value={product.fit_type} />}
                {product.care_instructions && <DetailRow label="Care" value={product.care_instructions} />}
              </div>
            )
          ) : (
            (product.volume || product.skin_type || product.ingredients || product.usage_instructions) && (
              <div className="mt-5 space-y-1.5 rounded-xl bg-gray-50 px-4 py-3">
                {product.volume && <DetailRow label="Size" value={product.volume} />}
                {product.skin_type && <DetailRow label="Skin Type" value={product.skin_type} />}
                {product.ingredients && <DetailRow label="Ingredients" value={product.ingredients} />}
                {product.usage_instructions && <DetailRow label="How to Use" value={product.usage_instructions} />}
              </div>
            )
          )}

          {variantError && <p className="mt-3 text-xs font-medium text-red-500">{variantError}</p>}

          <div className="mt-auto pt-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Qty</span>
              <div className="flex items-center rounded-full border border-gray-200">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-gray-500 transition-colors hover:bg-gray-100"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-900">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(10, q + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-gray-500 transition-colors hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              {qty > 1 && (
                <span className="text-xs text-gray-400">₹{(product.price * qty).toFixed(2)}</span>
              )}
            </div>
            <button
              disabled={!product.in_stock}
              onClick={handleAdd}
              className="btn-shimmer w-full rounded-full py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundImage: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`,
                backgroundSize: '200% auto',
              }}
            >
              {product.in_stock ? `Add to Cart${qty > 1 ? ` (${qty})` : ''}` : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[13px]">
      <span className="font-semibold text-gray-500">{label}:</span>
      <span className="text-gray-700">{value}</span>
    </div>
  )
}
