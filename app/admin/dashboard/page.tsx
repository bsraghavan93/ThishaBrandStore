'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Brand, Product, ProductColor, CartItem } from '@/lib/types'
import AdminTable from '@/components/AdminTable'

type Tab = 'all' | Brand
type FormMode = 'add' | 'edit' | null
type AdminView = 'products' | 'orders'

interface ProductForm {
  name: string
  price: string
  category: string
  newCategory: string
  brand: Brand
  description: string
  material: string
  fit_type: string
  care_instructions: string
  ingredients: string
  volume: string
  skin_type: string
  usage_instructions: string
}

interface OrderRecord {
  id: string
  order_id?: string
  customer_name: string
  customer_phone: string
  customer_email: string
  address: string
  city: string
  notes: string
  items: CartItem[]
  total: number
  status: string
  created_at: string
}

const EMPTY_FORM: ProductForm = {
  name: '',
  price: '',
  category: '',
  newCategory: '',
  brand: 'organics',
  description: '',
  material: '',
  fit_type: '',
  care_instructions: '',
  ingredients: '',
  volume: '',
  skin_type: '',
  usage_instructions: '',
}

const INDIAN_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size']
const MATERIALS = [
  'Cotton', 'Pure Cotton', 'Silk', 'Banarasi Silk', 'Chanderi Silk', 'Chiffon',
  'Georgette', 'Crepe', 'Linen', 'Polyester', 'Rayon', 'Viscose', 'Net',
  'Velvet', 'Satin', 'Organza', 'Cotton Blend', 'Silk Blend', 'Khadi',
  'Muslin', 'Jacquard', 'Brocade', 'Tussar',
]
const FIT_TYPES = ['Regular Fit', 'Slim Fit', 'Relaxed Fit', 'Oversized', 'A-Line', 'Straight', 'Flared']
const SKIN_TYPES = ['All Skin Types', 'Normal', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Acne-Prone', 'Mature']
const VOLUMES = ['5ml', '10ml', '15ml', '30ml', '50ml', '100ml', '150ml', '200ml', '250ml', '500ml', '5g', '10g', '25g', '50g', '100g', '200g', '250g', '500g']
const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  confirmed: { bg: '#dbeafe', text: '#1e40af' },
  shipped: { bg: '#e0e7ff', text: '#3730a3' },
  delivered: { bg: '#d1fae5', text: '#065f46' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [adminView, setAdminView] = useState<AdminView>('products')

  // ── Products state ──
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

  const [colors, setColors] = useState<ProductColor[]>([])
  const [colorName, setColorName] = useState('')
  const [colorHex, setColorHex] = useState('#000000')
  const [sizes, setSizes] = useState<string[]>([])

  // ── Orders state ──
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [ordersLoaded, setOrdersLoaded] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [orderFilter, setOrderFilter] = useState<string>('all')

  // ── Auth ──
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

  const authHeaders = useCallback(async () => {
    const { data } = await supabase!.auth.getSession()
    const token = data.session?.access_token
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  }, [])

  // ── Load products ──
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

  // ── Load orders when switching to orders view ──
  const loadOrders = useCallback(async () => {
    setLoadingOrders(true)
    try {
      const headers = await authHeaders()
      const res = await fetch('/api/orders', { headers })
      const json = await res.json()
      setOrders(json.orders ?? [])
    } catch {
      setOrders([])
    } finally {
      setLoadingOrders(false)
      setOrdersLoaded(true)
    }
  }, [authHeaders])

  useEffect(() => {
    if (adminView === 'orders' && session && !ordersLoaded) {
      loadOrders()
    }
  }, [adminView, session, ordersLoaded, loadOrders])

  // ── Product helpers ──
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

  const resetForm = () => {
    setFormMode(null)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setImageFiles([])
    setExistingImages([])
    setRemovedImages([])
    setColors([])
    setSizes([])
    setColorName('')
    setColorHex('#000000')
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
      material: product.material || '',
      fit_type: product.fit_type || '',
      care_instructions: product.care_instructions || '',
      ingredients: product.ingredients || '',
      volume: product.volume || '',
      skin_type: product.skin_type || '',
      usage_instructions: product.usage_instructions || '',
    })
    setExistingImages([...product.images])
    setRemovedImages([])
    setImageFiles([])
    setColors(product.colors || [])
    setSizes(product.sizes || [])
    setFormError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!supabase || files.length === 0) return []
    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type })
      if (error) throw new Error(`Upload failed: ${error.message}`)
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
      urls.push(urlData.publicUrl)
    }
    return urls
  }

  const deleteStorageImages = async (urls: string[]) => {
    if (!supabase || urls.length === 0) return
    const paths = urls.map(url => { const m = url.match(/\/storage\/v1\/object\/public\/product-images\/(.+)/); return m ? m[1] : null }).filter((p): p is string => p !== null)
    if (paths.length) await supabase.storage.from('product-images').remove(paths)
  }

  const buildPayload = () => {
    const base: Record<string, unknown> = { name: form.name, price: parseFloat(form.price), category: resolvedCategory, brand: form.brand, description: form.description }
    if (form.brand === 'trends') {
      base.colors = colors; base.sizes = sizes; base.material = form.material || null; base.fit_type = form.fit_type || null; base.care_instructions = form.care_instructions || null
      base.ingredients = null; base.volume = null; base.skin_type = null; base.usage_instructions = null
    } else {
      base.ingredients = form.ingredients || null; base.volume = form.volume || null; base.skin_type = form.skin_type || null; base.usage_instructions = form.usage_instructions || null
      base.colors = []; base.sizes = []; base.material = null; base.fit_type = null; base.care_instructions = null
    }
    return base
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !resolvedCategory) { setFormError('Name, price, and category are required'); return }
    if (existingImages.length === 0 && imageFiles.length === 0) { setFormError('At least one image is required'); return }
    setSaving(true); setFormError('')
    try {
      const newUrls = await uploadImages(imageFiles)
      if (removedImages.length) await deleteStorageImages(removedImages)
      const allImages = [...existingImages, ...newUrls]
      const headers = await authHeaders()
      const payload = buildPayload()
      if (formMode === 'add') {
        const res = await fetch('/api/products', { method: 'POST', headers, body: JSON.stringify({ ...payload, images: allImages, in_stock: true }) })
        const json = await res.json()
        if (json.product) { setProducts(prev => [json.product, ...prev]); resetForm() } else setFormError(json.error || 'Failed to save product')
      } else if (formMode === 'edit' && editingId) {
        const res = await fetch('/api/products', { method: 'PATCH', headers, body: JSON.stringify({ ...payload, id: editingId, images: allImages }) })
        const json = await res.json()
        if (json.product) { setProducts(prev => prev.map(p => (p.id === editingId ? json.product : p))); resetForm() } else setFormError(json.error || 'Failed to update product')
      }
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Something went wrong') } finally { setSaving(false) }
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImageFiles(prev => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeNewImage = (index: number) => setImageFiles(prev => prev.filter((_, i) => i !== index))
  const removeExistingImage = (url: string) => { setExistingImages(prev => prev.filter(u => u !== url)); setRemovedImages(prev => [...prev, url]) }

  const addColor = () => {
    const name = colorName.trim()
    if (!name) return
    if (colors.some(c => c.name.toLowerCase() === name.toLowerCase())) return
    setColors(prev => [...prev, { name, hex: colorHex }]); setColorName(''); setColorHex('#000000')
  }
  const removeColor = (hex: string) => setColors(prev => prev.filter(c => c.hex !== hex))
  const toggleSize = (size: string) => setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])

  const handleSaveVariantStock = async (productId: string, oosSizes: string[], oosColors: string[]) => {
    const headers = await authHeaders()
    const res = await fetch('/api/products', { method: 'PATCH', headers, body: JSON.stringify({ id: productId, oos_sizes: oosSizes, oos_colors: oosColors }) })
    const json = await res.json()
    if (json.product) setProducts(prev => prev.map(p => (p.id === productId ? json.product : p)))
    else alert(json.error || 'Failed to update variant stock')
  }

  const handleToggleStock = async (product: Product) => {
    const headers = await authHeaders()
    const res = await fetch('/api/products', { method: 'PATCH', headers, body: JSON.stringify({ id: product.id, in_stock: !product.in_stock }) })
    const json = await res.json()
    if (json.product) setProducts(prev => prev.map(p => (p.id === product.id ? json.product : p)))
    else alert(json.error || 'Failed to update product')
  }

  const handleRemove = async (product: Product) => {
    const headers = await authHeaders()
    const res = await fetch(`/api/products?id=${product.id}`, { method: 'DELETE', headers })
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== product.id))
    else { const json = await res.json().catch(() => ({})); alert(json.error || 'Failed to remove product') }
  }

  // ── Order helpers ──
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const headers = await authHeaders()
    const res = await fetch('/api/orders', { method: 'PATCH', headers, body: JSON.stringify({ id: orderId, status }) })
    const json = await res.json()
    if (json.order) setOrders(prev => prev.map(o => (o.id === orderId ? json.order : o)))
    else alert(json.error || 'Failed to update order status')
  }

  const filteredOrders = useMemo(
    () => orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter),
    [orders, orderFilter]
  )

  const orderStats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter(o => o.status === 'pending').length
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
    return { total, pending, revenue }
  }, [orders])

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
          <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-white" style={{ background: 'linear-gradient(135deg, #3B5E1F, #8B1539)' }}>✦</span>
          <span className="font-serif text-xl font-semibold text-white">Thisha Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-full p-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setAdminView('products')}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
              style={{ backgroundColor: adminView === 'products' ? '#fff' : 'transparent', color: adminView === 'products' ? '#1a1a2e' : '#fff' }}
            >
              Products
            </button>
            <button
              onClick={() => setAdminView('orders')}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
              style={{ backgroundColor: adminView === 'orders' ? '#fff' : 'transparent', color: adminView === 'orders' ? '#1a1a2e' : '#fff' }}
            >
              Orders {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
          <button onClick={handleLogout} className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-white/50">Logout</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* ════════════════════ PRODUCTS VIEW ════════════════════ */}
        {adminView === 'products' && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {stats.map(stat => (
                <div key={stat.label} className="flex flex-col items-center gap-1 rounded-2xl bg-white py-7 text-center shadow-sm transition-transform duration-200 hover:-translate-y-1">
                  <span className="text-2xl">{stat.emoji}</span>
                  <span className="font-serif text-3xl font-bold text-gray-900">{stat.value}</span>
                  <span className="text-xs text-gray-400">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2 rounded-full bg-white p-1 shadow-sm">
                {(['all', 'organics', 'trends'] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)} className="rounded-full px-4 py-2 text-sm font-medium transition-colors" style={{ backgroundColor: tab === t ? '#1a1a2e' : 'transparent', color: tab === t ? '#fff' : '#666' }}>
                    {t === 'all' ? 'All' : t === 'organics' ? '🌿 Organics' : '🦋 Trends'}
                  </button>
                ))}
              </div>
              <button onClick={() => formMode ? resetForm() : openAddForm()} className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5" style={{ background: 'linear-gradient(90deg, #3B5E1F, #5a8a31)' }}>
                {formMode ? '✕ Close' : '+ Add Product'}
              </button>
            </div>

            {formMode && (
              <form onSubmit={handleSubmit} className="animate-fadeUp mt-6 rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-serif text-lg font-bold text-gray-900">{formMode === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Name</span><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="dash-input" /></label>
                  <label className="flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Price (₹)</span><input required type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="dash-input" /></label>
                  <label className="flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Brand</span>
                    <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value as Brand, category: '', newCategory: '' }))} className="dash-input">
                      <option value="organics">Organics</option><option value="trends">Trends</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Category</span>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, newCategory: '' }))} className="dash-input">
                      <option value="">Select category…</option>
                      {currentCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                      <option value="__new__">+ Create new category…</option>
                    </select>
                  </label>
                  {isNewCategory && (
                    <label className="flex flex-col gap-1.5 sm:col-span-2"><span className="text-xs font-medium text-gray-600">New Category Name</span>
                      <input required value={form.newCategory} onChange={e => setForm(f => ({ ...f, newCategory: e.target.value }))} className="dash-input" placeholder="e.g. Serums, Dresses, Eye Care…" autoFocus />
                    </label>
                  )}
                  <label className="flex flex-col gap-1.5 sm:col-span-2"><span className="text-xs font-medium text-gray-600">Description</span>
                    <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="dash-input resize-none" />
                  </label>
                </div>

                {form.brand === 'trends' ? (
                  <div className="mt-6 rounded-xl border border-pink-100 bg-pink-50/30 p-5">
                    <h4 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: '#8B1539' }}>Clothing Details</h4>
                    <div className="mb-4">
                      <span className="text-xs font-medium text-gray-600">Colors</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {colors.map(c => (
                          <span key={c.hex} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white py-1 pl-1.5 pr-2.5 text-xs font-medium text-gray-700">
                            <span className="inline-block h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />{c.name}
                            <button type="button" onClick={() => removeColor(c.hex)} className="ml-1 text-gray-400 hover:text-red-500">✕</button>
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input type="color" value={colorHex} onChange={e => setColorHex(e.target.value)} className="h-9 w-9 cursor-pointer rounded border-0 p-0" />
                        <input value={colorName} onChange={e => setColorName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addColor() } }} className="dash-input flex-1" placeholder="Color name, e.g. Blush Pink" />
                        <button type="button" onClick={addColor} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: '#8B1539' }}>Add</button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-xs font-medium text-gray-600">Sizes</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {INDIAN_SIZES.map(s => (
                          <button key={s} type="button" onClick={() => toggleSize(s)} className="rounded-lg border px-3 py-2 text-xs font-semibold transition-all" style={{ backgroundColor: sizes.includes(s) ? '#8B1539' : '#fff', color: sizes.includes(s) ? '#fff' : '#444', borderColor: sizes.includes(s) ? '#8B1539' : '#e5e5e5' }}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Material / Fabric</span>
                        <select value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} className="dash-input"><option value="">Select material…</option>{MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                      </label>
                      <label className="flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Fit Type</span>
                        <select value={form.fit_type} onChange={e => setForm(f => ({ ...f, fit_type: e.target.value }))} className="dash-input"><option value="">Select fit…</option>{FIT_TYPES.map(f => <option key={f} value={f}>{f}</option>)}</select>
                      </label>
                    </div>
                    <label className="mt-4 flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Care Instructions</span>
                      <input value={form.care_instructions} onChange={e => setForm(f => ({ ...f, care_instructions: e.target.value }))} className="dash-input" placeholder="e.g. Machine Wash Cold, Dry Clean Only" />
                    </label>
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-green-100 bg-green-50/30 p-5">
                    <h4 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: '#3B5E1F' }}>Product Details</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Volume / Size</span>
                        <select value={form.volume} onChange={e => setForm(f => ({ ...f, volume: e.target.value }))} className="dash-input"><option value="">Select volume…</option>{VOLUMES.map(v => <option key={v} value={v}>{v}</option>)}</select>
                      </label>
                      <label className="flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Skin Type</span>
                        <select value={form.skin_type} onChange={e => setForm(f => ({ ...f, skin_type: e.target.value }))} className="dash-input"><option value="">Select skin type…</option>{SKIN_TYPES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </label>
                    </div>
                    <label className="mt-4 flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Ingredients</span>
                      <textarea rows={3} value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))} className="dash-input resize-none" placeholder="e.g. Rosehip Oil, Vitamin C, Hyaluronic Acid…" />
                    </label>
                    <label className="mt-4 flex flex-col gap-1.5"><span className="text-xs font-medium text-gray-600">Usage Instructions</span>
                      <textarea rows={2} value={form.usage_instructions} onChange={e => setForm(f => ({ ...f, usage_instructions: e.target.value }))} className="dash-input resize-none" placeholder="e.g. Apply 2-3 drops to clean skin morning and night" />
                    </label>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  <span className="text-xs font-medium text-gray-600">Product Images</span>
                  {(existingImages.length > 0 || imageFiles.length > 0) && (
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((url, i) => (
                        <div key={`existing-${i}`} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200">
                          <Image src={url} alt={`Image ${i + 1}`} fill unoptimized className="object-cover" />
                          <button type="button" onClick={() => removeExistingImage(url)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">✕</button>
                        </div>
                      ))}
                      {imageFiles.map((file, i) => (
                        <div key={`new-${i}`} className="group relative h-24 w-24 overflow-hidden rounded-xl border-2 border-dashed border-green-300">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(file)} alt={`New ${i + 1}`} className="h-full w-full object-cover" />
                          <button type="button" onClick={() => removeNewImage(i)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">✕</button>
                          <span className="absolute bottom-1 left-1 rounded bg-green-600 px-1.5 py-0.5 text-[9px] font-bold text-white">NEW</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700">+ Add Images</label>
                  </div>
                </div>

                {formError && <p className="mt-4 text-sm text-red-500">{formError}</p>}
                <div className="mt-4 flex gap-3">
                  <button type="submit" disabled={saving} className="rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: '#3B5E1F' }}>
                    {saving ? (formMode === 'add' ? 'Adding…' : 'Updating…') : (formMode === 'add' ? 'Add Product' : 'Update Product')}
                  </button>
                  <button type="button" onClick={resetForm} className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
                </div>
              </form>
            )}

            <div className="mt-8">
              {loadingProducts ? (
                <div className="flex justify-center py-16"><span className="animate-spin-slow inline-block h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-700" /></div>
              ) : (
                <AdminTable products={filtered} onToggleStock={handleToggleStock} onRemove={handleRemove} onEdit={openEditForm} onSaveVariantStock={handleSaveVariantStock} />
              )}
            </div>
          </>
        )}

        {/* ════════════════════ ORDERS VIEW ════════════════════ */}
        {adminView === 'orders' && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-white py-7 text-center shadow-sm">
                <span className="text-2xl">🛒</span>
                <span className="font-serif text-3xl font-bold text-gray-900">{orderStats.total}</span>
                <span className="text-xs text-gray-400">Total Orders</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-white py-7 text-center shadow-sm">
                <span className="text-2xl">⏳</span>
                <span className="font-serif text-3xl font-bold text-amber-600">{orderStats.pending}</span>
                <span className="text-xs text-gray-400">Pending</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-white py-7 text-center shadow-sm">
                <span className="text-2xl">💰</span>
                <span className="font-serif text-3xl font-bold text-green-700">₹{orderStats.revenue.toFixed(0)}</span>
                <span className="text-xs text-gray-400">Revenue</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2 rounded-full bg-white p-1 shadow-sm">
                {['all', ...ORDER_STATUSES].map(s => (
                  <button key={s} onClick={() => setOrderFilter(s)} className="rounded-full px-3.5 py-2 text-xs font-medium capitalize transition-colors" style={{ backgroundColor: orderFilter === s ? '#1a1a2e' : 'transparent', color: orderFilter === s ? '#fff' : '#666' }}>
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={loadOrders} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
                Refresh
              </button>
            </div>

            <div className="mt-6">
              {loadingOrders ? (
                <div className="flex justify-center py-16"><span className="animate-spin-slow inline-block h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-700" /></div>
              ) : filteredOrders.length === 0 ? (
                <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
                  <span className="text-4xl">📋</span>
                  <p className="mt-3 text-sm text-gray-400">{orderFilter === 'all' ? 'No orders yet' : `No ${orderFilter} orders`}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredOrders.map(order => {
                    const expanded = expandedOrder === order.id
                    const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
                    const date = new Date(order.created_at)
                    const itemCount = order.items.reduce((s, i) => s + i.qty, 0)

                    return (
                      <div key={order.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
                        <button
                          onClick={() => setExpandedOrder(expanded ? null : order.id)}
                          className="flex w-full items-center gap-4 px-6 py-5 text-left"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-serif text-base font-bold text-gray-900">{order.customer_name}</h4>
                              {order.order_id && (
                                <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-gray-500">{order.order_id}</span>
                              )}
                              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: sc.bg, color: sc.text }}>
                                {order.status}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-400">
                              {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              {' · '}{itemCount} item{itemCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <span className="font-serif text-lg font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
                          <span className="text-gray-300 transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                        </button>

                        {expanded && (
                          <div className="animate-fadeUp border-t border-gray-100 px-6 py-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Contact</p>
                                <p className="mt-1 text-sm text-gray-700">{order.customer_name}</p>
                                <p className="text-sm text-gray-500">{order.customer_phone}</p>
                                {order.customer_email && <p className="text-sm text-gray-500">{order.customer_email}</p>}
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Delivery Address</p>
                                <p className="mt-1 text-sm text-gray-700">{order.address}</p>
                                {order.city && <p className="text-sm text-gray-500">{order.city}</p>}
                              </div>
                            </div>

                            {order.notes && (
                              <div className="mt-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Notes</p>
                                <p className="mt-1 text-sm text-gray-600">{order.notes}</p>
                              </div>
                            )}

                            <div className="mt-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Items</p>
                              <div className="mt-2 overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400">
                                      <th className="px-4 py-2.5 text-left font-medium">Product</th>
                                      <th className="px-4 py-2.5 text-left font-medium">Variant</th>
                                      <th className="px-4 py-2.5 text-center font-medium">Qty</th>
                                      <th className="px-4 py-2.5 text-right font-medium">Price</th>
                                      <th className="px-4 py-2.5 text-right font-medium">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, i) => (
                                      <tr key={i} className="border-b border-gray-50">
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            {item.images?.[0] && (
                                              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                <Image src={item.images[0]} alt={item.name} fill unoptimized className="object-cover" />
                                              </div>
                                            )}
                                            <span className="font-medium text-gray-900">{item.name}</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                          {[item.selectedColor, item.selectedSize].filter(Boolean).join(', ') || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700">{item.qty}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">₹{item.price.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-700">Total</td>
                                      <td className="px-4 py-3 text-right font-serif text-lg font-bold text-gray-900">₹{order.total.toFixed(2)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                              <span className="text-xs font-medium text-gray-500">Update Status:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {ORDER_STATUSES.map(s => {
                                  const c = STATUS_COLORS[s]
                                  const active = order.status === s
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => handleUpdateOrderStatus(order.id, s)}
                                      className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all"
                                      style={{
                                        backgroundColor: active ? c.text : c.bg,
                                        color: active ? '#fff' : c.text,
                                        opacity: active ? 1 : 0.7,
                                      }}
                                    >
                                      {s}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
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
