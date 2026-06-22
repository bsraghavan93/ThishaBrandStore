'use client'

import { useRouter } from 'next/navigation'
import { Brand } from '@/lib/types'

export default function BrandSwitcher({ active }: { active: Brand }) {
  const router = useRouter()

  const brands: { key: Brand; label: string; color: string; href: string }[] = [
    { key: 'organics', label: '🌿 Organics', color: '#3B5E1F', href: '/organics' },
    { key: 'trends', label: '🦋 Trends', color: '#8B1539', href: '/trends' },
  ]

  return (
    <div
      className="flex items-center gap-1 rounded-full border p-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderColor: 'rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}
    >
      {brands.map(b => {
        const isActive = b.key === active
        return (
          <button
            key={b.key}
            onClick={() => router.push(b.href)}
            className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300"
            style={{
              backgroundColor: isActive ? b.color : 'transparent',
              color: isActive ? '#fff' : '#888',
            }}
          >
            {b.label}
          </button>
        )
      })}
    </div>
  )
}
