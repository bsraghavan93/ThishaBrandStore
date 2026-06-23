import { useState } from 'react'
import { CartItem, Product } from '@/lib/types'

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (product: Product, color?: string, size?: string, qty = 1) => {
    const cartKey = `${product.id}-${color || ''}-${size || ''}`
    setCart(prev => {
      const existing = prev.find(i => i.cartKey === cartKey)
      if (existing) return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...product, qty, selectedColor: color, selectedSize: size, cartKey }]
    })
  }

  const removeFromCart = (cartKey: string) => setCart(prev => prev.filter(i => i.cartKey !== cartKey))

  const updateQty = (cartKey: string, qty: number) => {
    if (qty <= 0) removeFromCart(cartKey)
    else setCart(prev => prev.map(i => i.cartKey === cartKey ? { ...i, qty } : i))
  }

  const clearCart = () => setCart([])

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return { cart, addToCart, removeFromCart, updateQty, clearCart, total, count }
}
