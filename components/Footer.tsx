import Link from 'next/link'
import { Brand } from '@/lib/types'

export default function Footer({ brand }: { brand: Brand }) {
  const accent = brand === 'organics' ? '#3B5E1F' : '#C2185B'
  const name = brand === 'organics' ? 'Thisha Organics' : 'Thisha Trends'

  return (
    <footer className="bg-[#0d0d0d] px-6 py-14 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-serif text-2xl font-semibold">{name}</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Part of the Thisha family — two brands, one promise of honest quality.
          </p>
          <div className="mt-4 flex gap-3 text-sm">
            <Link href="/organics" className="text-gray-400 hover:text-white">🌿 Organics</Link>
            <span className="text-gray-700">·</span>
            <Link href="/trends" className="text-gray-400 hover:text-white">🦋 Trends</Link>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          <p className="font-semibold uppercase tracking-widest text-gray-300" style={{ fontSize: '11px' }}>Get in touch</p>
          <p className="mt-3">Email: <a href="mailto:bsraghavan93@gmail.com" className="hover:text-white">bsraghavan93@gmail.com</a></p>
          <p className="mt-1">WhatsApp: <a href="https://wa.me/14153738202" className="hover:text-white" target="_blank" rel="noreferrer">+1 415 373 8202</a></p>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-gray-500 md:flex-row">
        <p>© {new Date().getFullYear()} Thisha. All rights reserved.</p>
        <p style={{ color: accent }}>Two brands · One family · Pure you</p>
      </div>
    </footer>
  )
}
