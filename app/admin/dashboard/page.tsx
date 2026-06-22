'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { allProducts as seedProducts } from '@/lib/seedData'
import { Brand, Product } from '@/lib/types'
import AdminTable from '@/components/AdminTable'

type Tab = 'all' | Brand

const EMPTY_FORM = {
  name: '',
  price: '',
  category: '',
  brand: 'organics' as Brand,
  description: '',
  image_url: '',
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [tab, setTab] = useState<Tab>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Auth check
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      router.push('/admin')
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/admin')
      } else {
        setSession(data.session)
      }
      setCheckingAuth(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (!newSession) router.push('/admin')
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  // Load products
  useEffect(() => {
    if (!session) return
    let cancelled = false

    async function load() {
      setLoadingProducts(true)
      try {
        const res = await fetch('/api/products')
        const json = await res.json()
        if (!cancelled) setProducts(json.products ?? seedProducts)
      } catch {
        if (!cancelled) setProducts(seedProducts)
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [session])

  const stats = useMemo(() => {
    const total = products.length
    const inStock = products.filter(p => p.in_stock).length
    const outOfStock = total - inStock
    const organicsCount = products.filter(p => p.brand === 'organics').length
    const trendsCount = products.filter(p => p.brand === 'trends').length
    return [
      { emoji: '📦', label: 'Total Products', value: total },
      { emoji: '✅', label: 'In Stock', value: inStock },
      { emoji: '⛔', label: 'Out of Stock', value: outOfStock },
      { emoji: '🌿', label: 'Organics', value: organicsCount },
      { emoji: '🦋', label: 'Trends', value: trendsCount },
    ]
  }, [products])

  const filtered = useMemo(
    () => (tab === 'all' ? products : products.filter(p => p.brand === tab)),
    [products, tab]
  )

  const authHeaders = async () => {
    const { data } = await supabase!.auth.getSession()
    const token = data.session?.access_token
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category) return

    setSaving(true)
    setFormError('')
    try {
      const headers = await authHeaders()
      const res = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          category: form.category,
          brand: form.brand,
          description: form.description,
          images: form.image_url ? [form.image_url] : [],
          in_stock: true,
        }),
      })
      const json = await res.json()
      if (json.product) {
        setProducts(prev => [json.product, ...prev])
        setForm(EMPTY_FORM)
        setShowForm(false)
      } else {
        setFormError(json.error || 'Failed to save product')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStock = async (product: Product) => {
    const headers = await authHeaders()
    const res = await fetch('/api/products', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id: product.id, in_stock: !product.in_stock }),
    })
    const json = await res.json()
    if (json.product) {
      setProducts(prev => prev.map(p => (p.id === product.id ? json.product : p)))
    } else {
      alert(json.error || 'Failed to update product')
    }
  }

  const handleRemove = async (product: Product) => {
    const headers = await authHeaders()
    const res = await fetch(`/api/products?id=${product.id}`, { method: 'DELETE', headers })
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== product.id))
    } else {
      const json = await res.json().catch(() => ({}))
      alert(json.error || 'Failed to remove product')
    }
  }

  const handleLogout = async () => {
    await supabase?.auth.signOut()
    router.push('/admin')
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <span className="animate-spin-slow inline-block h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="flex items-center justify-between px-8 py-5" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-white"
            style={{ background: 'linear-gradient(135deg, #3B5E1F, #8B1539)' }}
          >
            ✦
          </span>
          <span className="font-serif text-xl font-semibold text-white">Thisha Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-white/50"
        >
          Logout
        </button>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(stat => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-2xl bg-white py-7 text-center shadow-sm transition-transform duration-200 hover:-translate-y-1"
            >
              <span className="text-2xl">{stat.emoji}</span>
              <span className="font-serif text-3xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs + Add button */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 rounded-full bg-white p-1 shadow-sm">
            {(['all', 'organics', 'trends'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: tab === t ? '#1a1a2e' : 'transparent',
                  color: tab === t ? '#fff' : '#666',
                }}
              >
                {t === 'all' ? 'All' : t === 'organics' ? '🌿 Organics' : '🦋 Trends'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(s => !s)}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(90deg, #3B5E1F, #5a8a31)' }}
          >
            {showForm ? '✕ Close' : '+ Add Product'}
          </button>
        </div>

        {/* Add product form */}
        {showForm && (
          <form onSubmit={handleAddProduct} className="animate-fadeUp mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-600">Name</span>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="dash-input" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-600">Price</span>
              <input required type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="dash-input" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-600">Category</span>
              <input required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="dash-input" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-600">Brand</span>
              <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value as Brand }))} className="dash-input">
                <option value="organics">Organics</option>
                <option value="trends">Trends</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-gray-600">Image URL</span>
              <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="dash-input" placeholder="https://..." />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-gray-600">Description</span>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="dash-input resize-none" />
            </label>
            {formError && <p className="text-sm text-red-500 sm:col-span-2">{formError}</p>}
            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" disabled={saving} className="rounded-full px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: '#3B5E1F' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Products table */}
        <div className="mt-8">
          {loadingProducts ? (
            <div className="flex justify-center py-16">
              <span className="animate-spin-slow inline-block h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-700" />
            </div>
          ) : (
            <AdminTable products={filtered} onToggleStock={handleToggleStock} onRemove={handleRemove} />
          )}
        </div>
      </div>

      <style jsx global>{`
        .dash-input {
          width: 100%;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .dash-input:focus {
          border-color: #3B5E1F;
        }
      `}</style>
    </div>
  )
}
