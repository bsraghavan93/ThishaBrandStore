'use client'

import { RefObject, useEffect, useState } from 'react'
import Image from 'next/image'
import { Product } from '@/lib/types'

interface CartToastProps {
  product: Product | null
  color?: string
  size?: string
  onDone: () => void
  anchorRef: RefObject<HTMLButtonElement | null>
}

export default function CartToast({ product, color, size, onDone, anchorRef }: CartToastProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; arrowLeft: number } | null>(null)

  useEffect(() => {
    if (!product || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const toastWidth = 260
    const centerX = rect.left + rect.width / 2
    let left = centerX - toastWidth / 2
    left = Math.max(8, Math.min(left, window.innerWidth - toastWidth - 8))
    const arrowLeft = centerX - left
    setPos({ top: rect.bottom + 10, left, arrowLeft })
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [product, onDone, anchorRef])

  if (!product || !pos) return null

  const accent = product.brand === 'organics' ? '#3B5E1F' : '#8B1539'

  return (
    <div
      className="fixed z-[100] transition-all duration-300"
      style={{
        top: pos.top,
        left: pos.left,
        width: 260,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transformOrigin: 'top center',
      }}
    >
      {/* Arrow pointing up toward cart */}
      <div
        className="absolute -top-[7px] h-3.5 w-3.5 rotate-45 bg-white"
        style={{ left: pos.arrowLeft - 7, boxShadow: '-2px -2px 4px rgba(0,0,0,0.06)' }}
      />

      <div
        className="relative flex items-start gap-3 rounded-2xl bg-white p-3"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}
      >
        {product.images[0] && (
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            <Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white"
              style={{ backgroundColor: accent }}
            >
              ✓
            </span>
            <span className="text-[11px] font-bold" style={{ color: accent }}>Added to cart</span>
          </div>
          <p className="mt-0.5 truncate text-[13px] font-semibold text-gray-900">{product.name}</p>
          {(color || size) && (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {color && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
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
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                  {size}
                </span>
              )}
            </div>
          )}
          <p className="mt-0.5 text-xs font-semibold text-gray-500">₹{product.price.toFixed(2)}</p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onDone, 300) }}
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
