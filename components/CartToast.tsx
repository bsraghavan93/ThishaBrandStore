'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Product } from '@/lib/types'

interface CartToastProps {
  product: Product | null
  color?: string
  size?: string
  onDone: () => void
}

export default function CartToast({ product, color, size, onDone }: CartToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!product) return
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [product, onDone])

  if (!product) return null

  const accent = product.brand === 'organics' ? '#3B5E1F' : '#8B1539'

  return (
    <div
      className="fixed right-4 top-20 z-[100] flex max-w-xs items-start gap-3 rounded-2xl bg-white p-3 shadow-2xl transition-all duration-300"
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        border: `1.5px solid ${accent}20`,
      }}
    >
      {product.images[0] && (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white"
            style={{ backgroundColor: accent }}
          >
            ✓
          </span>
          <span className="text-xs font-bold" style={{ color: accent }}>Added to cart</span>
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-gray-900">{product.name}</p>
        {(color || size) && (
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            {color && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                {product.colors?.find(c => c.name === color) && (
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full border border-gray-200"
                    style={{ backgroundColor: product.colors.find(c => c.name === color)?.hex }}
                  />
                )}
                {color}
              </span>
            )}
            {size && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                {size}
              </span>
            )}
          </div>
        )}
        <p className="mt-0.5 text-xs font-semibold text-gray-500">₹{product.price.toFixed(2)}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(onDone, 300) }}
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
      >
        ✕
      </button>
    </div>
  )
}
