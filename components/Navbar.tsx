'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Brand } from '@/lib/types'
import { useCartContext } from '@/lib/CartContext'
import BrandSwitcher from './BrandSwitcher'

interface NavLink {
  label: string
  href: string
}

interface NavbarProps {
  brand: Brand
  cartCount: number
  onCartOpen: () => void
}

const ORGANICS_LINKS: NavLink[] = [
  { label: 'Home', href: '/organics' },
  { label: 'Shop', href: '/organics/products' },
]

const TRENDS_LINKS: NavLink[] = [
  { label: 'Home', href: '/trends' },
  { label: 'Shop', href: '/trends/products' },
  { label: 'Collections', href: '/trends/collections' },
]

export default function Navbar({ brand, cartCount, onCartOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { cartBtnRef } = useCartContext()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const accent = brand === 'organics' ? '#3B5E1F' : '#8B1539'
  const links = brand === 'organics' ? ORGANICS_LINKS : TRENDS_LINKS
  const brandName = brand === 'organics' ? 'Thisha Organics' : 'Thisha Trends'
  const tagline = brand === 'organics' ? 'pure · natural · honest' : 'bold · modern · you'
  const emoji = brand === 'organics' ? '🌿' : '🦋'

  return (
    <header
      className="sticky top-0 z-40 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.0)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.04)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Left: logo */}
        <Link href={`/${brand}`} className="flex items-center gap-3">
          {brand === 'trends' ? (
            <Image
              src="/thisha-trends-logo.png"
              alt="Thisha Trends"
              width={44}
              height={44}
              className="rounded-full object-cover"
            />
          ) : (
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: accent, color: '#fff' }}
            >
              {emoji}
            </span>
          )}
          <div className="leading-tight">
            <div className="font-serif text-xl font-semibold" style={{ color: scrolled ? '#111' : '#fff' }}>
              {brandName}
            </div>
            <div
              className="text-[10px] uppercase tracking-[2px]"
              style={{ color: scrolled ? '#888' : 'rgba(255,255,255,0.7)' }}
            >
              {tagline}
            </div>
          </div>
        </Link>

        {/* Middle: links */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-underline text-sm font-medium transition-colors"
              style={{ color: scrolled ? '#333' : '#fff', '--nav-accent': accent } as React.CSSProperties}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <BrandSwitcher active={brand} />
          </div>

          <Link
            href="/admin"
            className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:flex"
            style={{
              borderColor: scrolled ? '#ddd' : 'rgba(255,255,255,0.4)',
              color: scrolled ? '#555' : '#fff',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = accent
              e.currentTarget.style.color = accent
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = scrolled ? '#ddd' : 'rgba(255,255,255,0.4)'
              e.currentTarget.style.color = scrolled ? '#555' : '#fff'
            }}
          >
            🔒 Admin
          </Link>

          <button
            ref={cartBtnRef}
            onClick={onCartOpen}
            className="relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: accent }}
          >
            🛍️ Cart
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold" style={{ color: accent }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full md:hidden"
            style={{ color: scrolled ? '#111' : '#fff' }}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-black/5 bg-white px-6 py-4 md:hidden animate-fadeIn">
          <nav className="flex flex-col gap-3">
            {links.map(link => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/admin" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              🔒 Admin
            </Link>
            <div className="pt-2">
              <BrandSwitcher active={brand} />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
