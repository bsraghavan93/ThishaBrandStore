import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/CartContext'

export const metadata: Metadata = {
  title: 'Thisha — Organics & Trends',
  description: 'Thisha Organics (skincare & wellness) and Thisha Trends (fashion) — two brands, one family, pure you.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
