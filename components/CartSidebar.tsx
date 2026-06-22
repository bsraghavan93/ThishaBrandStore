'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CartItem } from '@/lib/types'

interface CartSidebarProps {
  open: boolean
  onClose: () => void
  cart: CartItem[]
  total: number
  updateQty: (id: string, qty: number) => void
  removeFromCart: (id: string) => void
}

export default function CartSidebar({ open, onClose, cart, total, updateQty, removeFromCart }: CartSidebarProps) {
  const router = useRouter()

  if (!open) return null

  const accent = cart[0]?.brand === 'trends' ? '#8B1539' : '#3B5E1F'

  const goToCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end animate-fadeIn"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="animate-slideLeft flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="font-serif text-2xl font-bold text-gray-900">Your Bag</h2>
            <p className="text-xs text-gray-400">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <span className="text-5xl">👜</span>
              <p className="mt-4 text-sm">Your bag is empty</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {cart.map(item => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-[78px] w-[78px] flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <Image src={item.images[0]} alt={item.name} fill unoptimized className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-serif text-sm font-bold leading-tight text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-400">₹{item.price.toFixed(2)} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 transition-colors hover:text-red-500"
                        aria-label={`Remove ${item.name}`}
                      >
                        🗑
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-sm hover:bg-gray-50"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-sm hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Subtotal</span>
              <span className="font-serif text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={goToCheckout}
              className="btn-shimmer w-full rounded-full py-3.5 text-sm font-semibold text-white"
              style={{
                backgroundImage: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`,
                backgroundSize: '200% auto',
              }}
            >
              Checkout
            </button>
            <p className="mt-3 text-center text-[11px] text-gray-400">No online payment — we'll call to confirm</p>
          </div>
        )}
      </div>
    </div>
  )
}
