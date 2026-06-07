import { useState } from 'react'
import { CartItem, Product } from '@/lib/types'

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id))

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) removeFromCart(id)
    else setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  const clearCart = () => setCart([])

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return { cart, addToCart, removeFromCart, updateQty, clearCart, total, count }
}
