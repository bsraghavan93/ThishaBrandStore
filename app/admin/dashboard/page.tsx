'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Brand, Product } from '@/lib/types'
import AdminTable from '@/components/AdminTable'

type Tab = 'all' | Brand
type FormMode = 'add' | 'edit' | null

interface ProductForm {
  name: string
  price: string
  category: string
  newCategory: string
  brand: Brand
  description: string
}

const EMPTY_FORM: ProductForm = {
  name: '',
  price: '',
  category: '',
  newCategory: '',
  brand: 'organics',
  description: '',
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [tab, setTab] = useState<Tab>('all')

  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [removedImages, setRemovedImages] = useState<string[]>([])

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

  useEffect(() => {
    if (!session) return
    let cancelled = false

    async function load() {
      setLoadingProducts(true)
      try {
        const res = await fetch('/api/products')
        const json = await res.json()
        if (!cancelled) setProducts(json.products ?? [])
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [session])

  const categoriesByBrand = useMemo(() => {
    const map: Record<Brand, string[]> = { organics: [], trends: [] }
    products.forEach(p => {
      if (!map[p.brand].includes(p.category)) {
        map[p.brand].push(p.category)
      }
    })
    return map
  }, [products])

  const currentCategories = categoriesByBrand[form.brand]
  const isNewCategory = form.category === '__new__'
  const resolvedCategory = isNewCategory ? form.newCategory.trim() : form.category

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

  const resetForm = () => {
    setFormMode(null)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setImageFiles([])
    setExistingImages([])
    setRemovedImages([])
    setFormError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openAddForm = () => {
    resetForm()
    setFormMode('add')
  }

  const openEditForm = (product: Product) => {
    setFormMode('edit')
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      newCategory: '',
      brand: product.brand,
      description: product.description,
    })
    setExistingImages([...product.images])
    setRemovedImages([])
    setImageFiles([])
    setFormError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!supabase || files.length === 0) return []

    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { contentType: file.type })

      if (error) throw new Error(`Upload failed: ${error.message}`)

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      urls.push(urlData.publicUrl)
    }
    return urls
  }

  const deleteStorageImages = async (urls: string[]) => {
    if (!supabase || urls.length === 0) return

    const paths = urls
      .map(url => {
        const match = url.match(/\/storage\/v1\/object\/public\/product-images\/(.+)/)
        return match ? match[1] : null
      })
      .filter((p): p is string => p !== null)

    if (paths.length) {
      await supabase.storage.from('product-images').remove(paths)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !resolvedCategory) {
      setFormError('Name, price, and category are required')
      return
    }
    if (existingImages.length === 0 && imageFiles.length === 0) {
      setFormError('At least one image is required')
      return
    }

    setSaving(true)
    setFormError('')

    try {
      const newUrls = await uploadImages(imageFiles)

      if (removedImages.length) {
        await deleteStorageImages(removedImages)
      }

      const allImages = [...existingImages, ...newUrls]
      const headers = await authHeaders()

      if (formMode === 'add') {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: form.name,
            price: parseFloat(form.price),
            category: resolvedCategory,
            brand: form.brand,
            description: form.description,
            images: allImages,
            in_stock: true,
          }),
        })
        const json = await res.json()
        if (json.product) {
          setProducts(prev => [json.product, ...prev])
          resetForm()
        } else {
          setFormError(json.error || 'Failed to save product')
        }
      } else if (formMode === 'edit' && editingId) {
        const res = await fetch('/api/products', {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            id: editingId,
            name: form.name,
            price: parseFloat(form.price),
            category: resolvedCategory,
            brand: form.brand,
            description: form.description,
            images: allImages,
          }),
        })
        const json = await res.json()
        if (json.product) {
          setProducts(prev => prev.map(p => (p.id === editingId ? json.product : p)))
          resetForm()
        } else {
          setFormError(json.error || 'Failed to update product')
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImageFiles(prev => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(u => u !== url))
    setRemovedImages(prev => [...prev, url])
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
            onClick={() => formMode ? resetForm() : openAddForm()}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(90deg, #3B5E1F, #5a8a31)' }}
          >
            {formMode ? '✕ Close' : '+ Add Product'}
          </button>
        </div>

        {formMode && (
          <form onSubmit={handleSubmit} className="animate-fadeUp mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-serif text-lg font-bold text-gray-900">
              {formMode === 'add' ? 'Add New Product' : 'Edit Product'}
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-600">Name</span>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="dash-input" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-600">Price (₹)</span>
                <input required type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="dash-input" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-600">Brand</span>
                <select
                  value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value as Brand, category: '', newCategory: '' }))}
                  className="dash-input"
                >
                  <option value="organics">Organics</option>
                  <option value="trends">Trends</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-600">Category</span>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value, newCategory: '' }))}
                  className="dash-input"
                >
                  <option value="">Select category…</option>
                  {currentCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__new__">+ Create new category…</option>
                </select>
              </label>

              {isNewCategory && (
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-medium text-gray-600">New Category Name</span>
                  <input
                    required
                    value={form.newCategory}
                    onChange={e => setForm(f => ({ ...f, newCategory: e.target.value }))}
                    className="dash-input"
                    placeholder="e.g. Serums, Dresses, Eye Care…"
                    autoFocus
                  />
                </label>
              )}

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs font-medium text-gray-600">Description</span>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="dash-input resize-none" />
              </label>

              <div className="flex flex-col gap-3 sm:col-span-2">
                <span className="text-xs font-medium text-gray-600">Product Images</span>

                {(existingImages.length > 0 || imageFiles.length > 0) && (
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((url, i) => (
                      <div key={`existing-${i}`} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200">
                        <Image src={url} alt={`Image ${i + 1}`} fill unoptimized className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {imageFiles.map((file, i) => (
                      <div key={`new-${i}`} className="group relative h-24 w-24 overflow-hidden rounded-xl border-2 border-dashed border-green-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt={`New ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1 left-1 rounded bg-green-600 px-1.5 py-0.5 text-[9px] font-bold text-white">NEW</span>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
                  >
                    + Add Images
                  </label>
                </div>
              </div>
            </div>

            {formError && <p className="mt-4 text-sm text-red-500">{formError}</p>}

            <div className="mt-4 flex gap-3">
              <button type="submit" disabled={saving} className="rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: '#3B5E1F' }}>
                {saving ? (formMode === 'add' ? 'Adding…' : 'Updating…') : (formMode === 'add' ? 'Add Product' : 'Update Product')}
              </button>
              <button type="button" onClick={resetForm} className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8">
          {loadingProducts ? (
            <div className="flex justify-center py-16">
              <span className="animate-spin-slow inline-block h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-700" />
            </div>
          ) : (
            <AdminTable products={filtered} onToggleStock={handleToggleStock} onRemove={handleRemove} onEdit={openEditForm} />
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
