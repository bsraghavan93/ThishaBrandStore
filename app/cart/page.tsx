'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartContext } from '@/lib/CartContext'

export default function CartPage() {
  const { cart, total, updateQty, removeFromCart } = useCartContext()
  const router = useRouter()

  const accent = cart[0]?.brand === 'trends' ? '#8B1539' : '#3B5E1F'

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => router.back()} className="mb-6 text-sm text-gray-500 hover:text-gray-800">← Back</button>
        <h1 className="font-serif text-4xl font-semibold text-gray-900">Your Bag</h1>

        {cart.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center text-gray-400">
            <span className="text-6xl">👜</span>
            <p className="mt-4">Your bag is empty</p>
            <Link href="/" className="mt-6 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <ul className="flex flex-col gap-4">
              {cart.map(item => (
                <li key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <Image src={item.images[0]} alt={item.name} fill unoptimized className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-400">₹{item.price.toFixed(2)} each</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500" aria-label={`Remove ${item.name}`}>🗑</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">−</button>
                        <span className="w-6 text-center font-medium">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">+</button>
                      </div>
                      <span className="font-semibold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-gray-900">Order Summary</h3>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">₹{total.toFixed(2)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-gray-400">
                <span>Shipping</span>
                <span>Calculated at confirmation</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-serif text-2xl font-bold" style={{ color: accent }}>₹{total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className="btn-shimmer mt-6 block rounded-full py-3.5 text-center text-sm font-semibold text-white"
                style={{ backgroundImage: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`, backgroundSize: '200% auto' }}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
