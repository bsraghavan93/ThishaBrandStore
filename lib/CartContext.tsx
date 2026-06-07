'use client'

import { createContext, useContext, ReactNode, useState } from 'react'
import { useCart } from '@/hooks/useCart'
import CartSidebar from '@/components/CartSidebar'

interface CartContextValue extends ReturnType<typeof useCart> {
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const cartApi = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  const value: CartContextValue = {
    ...cartApi,
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
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext must be used within CartProvider')
  return ctx
}
