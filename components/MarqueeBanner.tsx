'use client'

import { Brand } from '@/lib/types'

const ORGANICS_ITEMS = ['🌿 100% NATURAL INGREDIENTS', 'CRUELTY FREE', 'FREE SHIPPING OVER $50', 'CLEAN BEAUTY, HONEST PRICES']
const TRENDS_ITEMS = ['🦋 NEW DROPS WEEKLY', 'FREE RETURNS', 'FAST SHIPPING', 'DRESS THE WOMAN YOU ARE']

export default function MarqueeBanner({ brand }: { brand: Brand }) {
  const items = brand === 'organics' ? ORGANICS_ITEMS : TRENDS_ITEMS
  const bg = brand === 'organics' ? '#3B5E1F' : '#C2185B'
  const color = brand === 'organics' ? '#c8e6b0' : '#ffc0d5'

  const repeated = Array(4).fill(items).flat().join(' ✦ ')

  return (
    <div
      className="w-full overflow-hidden whitespace-nowrap"
      style={{ backgroundColor: bg }}
    >
      <div
        className="inline-block animate-marquee py-2 text-[11px] font-bold uppercase"
        style={{ color, letterSpacing: '2px' }}
      >
        {repeated} ✦ {repeated}
      </div>
    </div>
  )
}
