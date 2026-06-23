'use client'

import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { useCart } from '@/hooks/useCart'
import CartSidebar from '@/components/CartSidebar'
import CartToast from '@/components/CartToast'
import { Product } from '@/lib/types'

interface ToastInfo {
  product: Product
  color?: string
  size?: string
  key: number
}

interface CartContextValue extends ReturnType<typeof useCart> {
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const cartApi = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState<ToastInfo | null>(null)

  const addToCartWithToast = useCallback((product: Product, color?: string, size?: string) => {
    cartApi.addToCart(product, color, size)
    setToast({ product, color, size, key: Date.now() })
  }, [cartApi])

  const clearToast = useCallback(() => setToast(null), [])

  const value: CartContextValue = {
    ...cartApi,
    addToCart: addToCartWithToast,
    cartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
  }

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cartApi.cart}
        total={cartApi.total}
        updateQty={cartApi.updateQty}
        removeFromCart={cartApi.removeFromCart}
      />
      {toast && (
        <CartToast
          key={toast.key}
          product={toast.product}
          color={toast.color}
          size={toast.size}
          onDone={clearToast}
        />
      )}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext must be used within CartProvider')
  return ctx
}
