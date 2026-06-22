'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isSupabaseConfigured || !supabase) {
      setError('Admin login requires Supabase to be configured (see .env.local.example).')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    router.push('/admin/dashboard')
  }

  return (
    <main
      className="dot-grid-bg relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      style={{ background: 'linear-gradient(160deg, #0a0a0a, #1a1a2e, #16213e)' }}
    >
      <div className="animate-orbFloat pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(59,94,31,0.22)' }} />
      <div className="animate-orbFloat pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full blur-[110px]" style={{ backgroundColor: 'rgba(139,21,57,0.2)', animationDelay: '5s' }} />

      <Link href="/" className="absolute left-6 top-6 z-10 text-sm text-gray-400 hover:text-white">← Back to Thisha</Link>

      <div
        className="animate-scaleIn relative z-10 w-full max-w-[380px] rounded-[28px] bg-white p-11"
        style={{ boxShadow: '0 30px 90px rgba(0,0,0,0.5)' }}
      >
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #3B5E1F, #8B1539)' }}
        >
          🔒
        </div>
        <h1 className="mt-5 text-center font-serif text-2xl font-bold text-gray-900">Admin Portal</h1>
        <p className="mt-1 text-center text-xs uppercase tracking-[2px] text-gray-400">Thisha Management System</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="admin-input"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="admin-input"
            />
          </label>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-shimmer mt-2 rounded-full py-3.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundImage: 'linear-gradient(90deg, #2c4717, #5a8a31, #2c4717)', backgroundSize: '200% auto' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .admin-input:focus {
          border-color: #3B5E1F;
          box-shadow: 0 0 0 3px rgba(59,94,31,0.12);
        }
      `}</style>
    </main>
  )
}
