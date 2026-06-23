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
    if (!product) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [product, onClose])

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
      className="fixed inset-0 z-[60] animate-fadeIn md:flex md:items-center md:justify-center md:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Mobile: full-screen sheet. Desktop: centered card */}
      <div className="relative flex h-full w-full flex-col bg-white md:animate-scaleIn md:h-auto md:max-h-[90vh] md:max-w-[860px] md:flex-row md:overflow-hidden md:rounded-[28px]">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg shadow hover:bg-white"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Image section — compact on mobile */}
        <div className="flex-shrink-0 bg-gray-50 p-3 md:w-1/2 md:p-6">
          <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '4 / 3' }}>
            <Image
              key={activeImage}
              src={product.images[activeImage]}
              alt={product.name}
              fill
              unoptimized
              className="animate-fadeIn object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-2 flex gap-2 md:mt-3 md:gap-3">
              {product.images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="relative h-12 w-12 overflow-hidden rounded-lg border-2 transition-transform md:h-16 md:w-16 md:rounded-xl"
                  style={{
                    borderColor: i === activeImage ? accent : 'transparent',
                    transform: i === activeImage ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details — scrollable, with room for sticky footer */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[140px] md:pb-0">
          <div className="px-4 py-3 md:p-8">
            <div className="text-[10px] font-bold uppercase md:text-[11px]" style={{ color: accent, letterSpacing: '2px' }}>
              {product.category}
            </div>
            <h2 className="mt-1 font-serif text-xl font-bold leading-tight text-gray-900 md:mt-2 md:text-[28px]">{product.name}</h2>
            <div className="mt-1 font-serif text-xl font-bold text-gray-900 md:mt-2 md:text-2xl">₹{product.price.toFixed(2)}</div>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-500 md:mt-3 md:text-[14px]">{product.description}</p>

            {/* Color selector */}
            {hasColors && (
              <div className="mt-4 md:mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Color {selectedColor && <span className="normal-case tracking-normal text-gray-600">— {selectedColor}</span>}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.colors!.map(c => {
                    const oos = isColorOos(c.name)
                    return (
                      <button
                        key={c.hex}
                        disabled={oos}
                        onClick={() => { if (!oos) { setSelectedColor(c.name); setVariantError('') } }}
                        className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform"
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
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {hasSizes && (
              <div className="mt-4 md:mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Size</p>
                <div className="mt-2 flex flex-wrap gap-1.5 md:gap-2">
                  {product.sizes!.map(s => {
                    const oos = isSizeOos(s)
                    const selected = selectedSize === s
                    return (
                      <button
                        key={s}
                        disabled={oos}
                        onClick={() => { if (!oos) { setSelectedSize(s); setVariantError('') } }}
                        className="rounded-lg border px-3 py-2 text-xs font-semibold transition-all md:px-3.5"
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
                    )
                  })}
                </div>
              </div>
            )}

            {/* Product details */}
            {isTrends ? (
              (product.material || product.fit_type || product.care_instructions) && (
                <div className="mt-4 space-y-1.5 rounded-xl bg-gray-50 px-3 py-2.5 md:mt-5 md:px-4 md:py-3">
                  {product.material && <DetailRow label="Material" value={product.material} />}
                  {product.fit_type && <DetailRow label="Fit" value={product.fit_type} />}
                  {product.care_instructions && <DetailRow label="Care" value={product.care_instructions} />}
                </div>
              )
            ) : (
              (product.volume || product.skin_type || product.ingredients || product.usage_instructions) && (
                <div className="mt-4 space-y-1.5 rounded-xl bg-gray-50 px-3 py-2.5 md:mt-5 md:px-4 md:py-3">
                  {product.volume && <DetailRow label="Size" value={product.volume} />}
                  {product.skin_type && <DetailRow label="Skin Type" value={product.skin_type} />}
                  {product.ingredients && <DetailRow label="Ingredients" value={product.ingredients} />}
                  {product.usage_instructions && <DetailRow label="How to Use" value={product.usage_instructions} />}
                </div>
              )
            )}

            {variantError && <p className="mt-3 text-xs font-medium text-red-500">{variantError}</p>}
          </div>

          {/* Desktop-only inline footer */}
          <div className="mt-auto hidden px-8 pb-8 md:block">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Qty</span>
              <div className="flex items-center rounded-full border border-gray-200">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-gray-500 hover:bg-gray-100">−</button>
                <span className="w-8 text-center text-sm font-bold text-gray-900">{qty}</span>
                <button onClick={() => setQty(q => Math.min(10, q + 1))} className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-gray-500 hover:bg-gray-100">+</button>
              </div>
              {qty > 1 && <span className="text-xs text-gray-400">₹{(product.price * qty).toFixed(2)}</span>}
            </div>
            <button
              disabled={!product.in_stock}
              onClick={handleAdd}
              className="btn-shimmer w-full rounded-full py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundImage: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`, backgroundSize: '200% auto' }}
            >
              {product.in_stock ? `Add to Cart${qty > 1 ? ` (${qty})` : ''}` : 'Out of Stock'}
            </button>
          </div>
        </div>

        {/* Mobile sticky footer */}
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-100 bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-gray-200">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-gray-500 active:bg-gray-100">−</button>
              <span className="w-7 text-center text-sm font-bold text-gray-900">{qty}</span>
              <button onClick={() => setQty(q => Math.min(10, q + 1))} className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-gray-500 active:bg-gray-100">+</button>
            </div>
            {qty > 1 && <span className="text-xs text-gray-400">₹{(product.price * qty).toFixed(2)}</span>}
            <button
              disabled={!product.in_stock}
              onClick={handleAdd}
              className="flex-1 rounded-full py-3 text-sm font-semibold text-white active:scale-[0.98] disabled:opacity-40"
              style={{ backgroundColor: accent }}
            >
              {product.in_stock ? `Add to Cart${qty > 1 ? ` (${qty})` : ''}` : 'Out of Stock'}
            </button>
          </div>
          <div className="h-safe-bottom" />
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[12px] md:text-[13px]">
      <span className="font-semibold text-gray-500">{label}:</span>
      <span className="text-gray-700">{value}</span>
    </div>
  )
}
