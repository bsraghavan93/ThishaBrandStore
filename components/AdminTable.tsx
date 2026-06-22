'use client'

import Image from 'next/image'
import { Product } from '@/lib/types'

interface AdminTableProps {
  products: Product[]
  onToggleStock: (product: Product) => void
  onRemove: (product: Product) => void
}

export default function AdminTable({ products, onToggleStock, onRemove }: AdminTableProps) {
  return (
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
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleStock(product)}
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
  )
}
