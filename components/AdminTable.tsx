'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Product } from '@/lib/types'

interface AdminTableProps {
  products: Product[]
  onToggleStock: (product: Product) => void
  onRemove: (product: Product) => void
  onEdit: (product: Product) => void
  onSaveVariantStock: (productId: string, oosSizes: string[], oosColors: string[]) => Promise<void>
}

export default function AdminTable({ products, onToggleStock, onRemove, onEdit, onSaveVariantStock }: AdminTableProps) {
  const [stockProduct, setStockProduct] = useState<Product | null>(null)
  const [oosSizes, setOosSizes] = useState<string[]>([])
  const [oosColors, setOosColors] = useState<string[]>([])
  const [savingStock, setSavingStock] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const hasVariants = (p: Product) =>
    (Array.isArray(p.sizes) && p.sizes.length > 0) || (Array.isArray(p.colors) && p.colors.length > 0)

  const openStockPopup = (product: Product) => {
    setStockProduct(product)
    setOosSizes(product.oos_sizes || [])
    setOosColors(product.oos_colors || [])
  }

  const closeStockPopup = () => {
    setStockProduct(null)
    setOosSizes([])
    setOosColors([])
  }

  const toggleOosSize = (size: string) => {
    setOosSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  }

  const toggleOosColor = (name: string) => {
    setOosColors(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name])
  }

  const handleSave = async () => {
    if (!stockProduct) return
    setSavingStock(true)
    await onSaveVariantStock(stockProduct.id, oosSizes, oosColors)
    setSavingStock(false)
    closeStockPopup()
  }

  const oosCount = (p: Product) => {
    const s = Array.isArray(p.oos_sizes) ? p.oos_sizes.length : 0
    const c = Array.isArray(p.oos_colors) ? p.oos_colors.length : 0
    return s + c
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
              <th className="px-5 py-4 font-medium">Product</th>
              <th className="px-5 py-4 font-medium">Brand</th>
              <th className="px-5 py-4 font-medium">Category</th>
              <th className="px-5 py-4 font-medium">Price</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                  No products yet — add your first product above.
                </td>
              </tr>
            )}
            {products.map(product => (
              <tr key={product.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                      {product.images[0] && (
                        <Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover" />
                      )}
                    </div>
                    <span className="font-serif font-semibold text-gray-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
                    style={{ backgroundColor: product.brand === 'organics' ? '#3B5E1F' : '#8B1539' }}
                  >
                    {product.brand}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-600">{product.category}</td>
                <td className="px-5 py-4 font-semibold text-gray-900">₹{product.price.toFixed(2)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-block w-fit rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {product.in_stock && oosCount(product) > 0 && (
                      <span className="text-[10px] font-medium text-amber-600">
                        {oosCount(product)} variant{oosCount(product) > 1 ? 's' : ''} OOS
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openStockPopup(product)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 ${
                        product.in_stock ? 'bg-amber-500' : 'bg-green-600'
                      }`}
                    >
                      {product.in_stock ? 'Mark OOS' : 'Mark In Stock'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${product.name}"? This cannot be undone.`)) onRemove(product)
                      }}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Variant Stock Popup */}
      {stockProduct && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fadeIn"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === overlayRef.current) closeStockPopup() }}
        >
          <div className="animate-scaleIn w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-gray-900">Manage Stock</h3>
              <button onClick={closeStockPopup} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">✕</button>
            </div>
            <p className="mt-1 text-sm text-gray-500">{stockProduct.name}</p>

            {!hasVariants(stockProduct) && (
              <p className="mt-5 text-sm text-gray-400">No sizes or colors configured for this product. Edit the product to add variants, or use the button below to toggle the entire product.</p>
            )}

            {/* Sizes */}
            {Array.isArray(stockProduct.sizes) && stockProduct.sizes.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Sizes</p>
                <p className="mt-1 text-[11px] text-gray-400">Click to toggle out of stock</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stockProduct.sizes.map(size => {
                    const isOos = oosSizes.includes(size)
                    return (
                      <button
                        key={size}
                        onClick={() => toggleOosSize(size)}
                        className="relative rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: isOos ? '#fef2f2' : '#f0fdf4',
                          color: isOos ? '#991b1b' : '#166534',
                          borderColor: isOos ? '#fecaca' : '#bbf7d0',
                        }}
                      >
                        {size}
                        {isOos && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">✕</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {Array.isArray(stockProduct.colors) && stockProduct.colors.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Colors</p>
                <p className="mt-1 text-[11px] text-gray-400">Click to toggle out of stock</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stockProduct.colors.map(color => {
                    const isOos = oosColors.includes(color.name)
                    return (
                      <button
                        key={color.hex}
                        onClick={() => toggleOosColor(color.name)}
                        className="inline-flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3 text-xs font-semibold transition-all"
                        style={{
                          backgroundColor: isOos ? '#fef2f2' : '#fff',
                          color: isOos ? '#991b1b' : '#374151',
                          borderColor: isOos ? '#fecaca' : '#e5e7eb',
                          opacity: isOos ? 0.7 : 1,
                        }}
                      >
                        <span
                          className="inline-block h-5 w-5 rounded-full border border-gray-200"
                          style={{
                            backgroundColor: color.hex,
                            filter: isOos ? 'grayscale(100%)' : 'none',
                          }}
                        />
                        {color.name}
                        {isOos && <span className="ml-0.5 text-red-500">✕</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Whole product toggle */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <button
                onClick={() => {
                  onToggleStock(stockProduct)
                  closeStockPopup()
                }}
                className="w-full rounded-lg border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                {stockProduct.in_stock ? 'Mark Entire Product Out of Stock' : 'Mark Entire Product In Stock'}
              </button>
            </div>

            {/* Save */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={savingStock}
                className="flex-1 rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: stockProduct.brand === 'trends' ? '#8B1539' : '#3B5E1F' }}
              >
                {savingStock ? 'Saving…' : 'Save Variant Stock'}
              </button>
              <button onClick={closeStockPopup} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
