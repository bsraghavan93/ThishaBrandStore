'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <main
      className="dot-grid-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20"
      style={{ backgroundColor: '#080808' }}
    >
      {/* Glowing orbs */}
      <div
        className="animate-orbFloat pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full blur-[100px]"
        style={{ backgroundColor: 'rgba(59,94,31,0.18)' }}
      />
      <div
        className="animate-orbFloat pointer-events-none absolute -bottom-40 -right-32 h-[460px] w-[460px] rounded-full blur-[110px]"
        style={{ backgroundColor: 'rgba(194,24,91,0.15)', animationDelay: '4s' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <h1
          className="font-serif text-white"
          style={{ fontSize: 'clamp(56px, 12vw, 100px)', letterSpacing: '-4px', lineHeight: 1 }}
        >
          THISHA
        </h1>
        <p className="mt-4 text-xs font-medium uppercase" style={{ color: '#444', letterSpacing: '3px' }}>
          Two Brands · One Family · Pure You
        </p>

        {/* Brand cards */}
        <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            href="/organics"
            className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-white/10 px-8 py-16 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(160deg, rgba(59,94,31,0.25), rgba(59,94,31,0.04))'
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(59,94,31,0.35)'
              e.currentTarget.style.borderColor = 'rgba(168,216,122,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            <span className="text-5xl transition-transform duration-300 group-hover:scale-110">🌿</span>
            <span className="font-serif text-3xl font-semibold text-white">Thisha Organics</span>
            <span className="text-xs uppercase tracking-[3px] text-gray-500">Skincare &amp; Wellness</span>
          </Link>

          <Link
            href="/trends"
            className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-white/10 px-8 py-16 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(160deg, rgba(194,24,91,0.25), rgba(194,24,91,0.04))'
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(194,24,91,0.35)'
              e.currentTarget.style.borderColor = 'rgba(255,192,213,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            <span className="text-5xl transition-transform duration-300 group-hover:scale-110">🦋</span>
            <span className="font-serif text-3xl font-semibold text-white">Thisha Trends</span>
            <span className="text-xs uppercase tracking-[3px] text-gray-500">Fashion &amp; Clothing</span>
          </Link>
        </div>
      </div>

      <Link
        href="/admin"
        className="group relative z-10 mt-20 flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-medium text-gray-500 transition-colors"
        style={{ borderColor: '#2a2a2a' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#ccc' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
      >
        🔒 Admin Portal
      </Link>
    </main>
  )
}
