'use client'

import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MarqueeBanner from '@/components/MarqueeBanner'
import Footer from '@/components/Footer'
import { useReveal } from '@/hooks/useReveal'
import { useCartContext } from '@/lib/CartContext'
import { trendsProducts } from '@/lib/seedData'

const ACCENT = '#8B1539'

const COLLECTIONS = [
  {
    name: 'Summer Bloom',
    emoji: '🌸',
    panelBg: '#FFF5F0',
    description: 'Light fabrics, floral prints, and breezy silhouettes built for golden-hour days and warm nights out.',
    image: trendsProducts[0].images[0],
  },
  {
    name: 'Power Dressing',
    emoji: '💼',
    panelBg: '#F5EDE0',
    description: 'Structured blazers and wide-leg trousers that command the room — confidence, tailored.',
    image: trendsProducts[3].images[0],
  },
  {
    name: 'Weekend Luxe',
    emoji: '✨',
    panelBg: '#FDF0F4',
    description: 'Cosy knits and elevated basics for slow mornings, brunch dates, and everything in between.',
    image: trendsProducts[5].images[0],
  },
]

function CollectionRow({ collection, index }: { collection: typeof COLLECTIONS[number]; index: number }) {
  const [ref, visible] = useReveal()
  const flipped = index % 2 === 1

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 overflow-hidden rounded-3xl md:grid-cols-2 ${visible ? 'animate-fadeUp' : 'opacity-0'}`}
      style={{ animationDelay: visible ? `${index * 0.12}s` : undefined, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
    >
      <div className={`relative h-72 md:h-auto ${flipped ? 'md:order-2' : ''}`}>
        <Image src={collection.image} alt={collection.name} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      <div
        className={`flex flex-col justify-center gap-4 px-10 py-14 ${flipped ? 'md:order-1' : ''}`}
        style={{ backgroundColor: collection.panelBg }}
      >
        <span className="text-4xl">{collection.emoji}</span>
        <h3 className="font-serif text-3xl font-semibold text-gray-900">{collection.name}</h3>
        <p className="max-w-md text-[15px] leading-relaxed text-gray-600">{collection.description}</p>
        <Link
          href="/trends/products"
          className="btn-shimmer mt-2 inline-block w-fit rounded-full px-7 py-3 text-sm font-semibold text-white"
          style={{ backgroundImage: `linear-gradient(90deg, ${ACCENT}, #C8963E, ${ACCENT})`, backgroundSize: '200% auto' }}
        >
          Shop This Edit →
        </Link>
      </div>
    </div>
  )
}

export default function TrendsCollectionsPage() {
  const { count, openCart } = useCartContext()

  return (
    <div className="bg-white">
      <Navbar brand="trends" cartCount={count} onCartOpen={openCart} />
      <MarqueeBanner brand="trends" />

      <section className="px-6 py-16" style={{ background: 'linear-gradient(120deg, #F5E6E0, #FFF5F0)' }}>
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: ACCENT }}>✦ Curated Edits ✦</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold text-gray-900">Collections</h1>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16">
        {COLLECTIONS.map((c, i) => (
          <CollectionRow key={c.name} collection={c} index={i} />
        ))}
      </section>

      <Footer brand="trends" />
    </div>
  )
}
