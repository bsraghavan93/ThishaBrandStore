'use client'

import { useState } from 'react'

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular'

interface ProductFiltersProps {
  accent: string
  search: string
  onSearchChange: (v: string) => void
  sort: SortOption
  onSortChange: (v: SortOption) => void
  priceRange: [number, number]
  maxPrice: number
  onPriceChange: (v: [number, number]) => void
  resultCount: number
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
]

export default function ProductFilters({
  accent,
  search,
  onSearchChange,
  sort,
  onSortChange,
  priceRange,
  maxPrice,
  onPriceChange,
  resultCount,
}: ProductFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <div className="mb-6 md:mb-8">
      {/* Search + filter toggle row */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-gray-400"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 md:px-4"
          style={filtersOpen ? { borderColor: accent, color: accent } : undefined}
        >
          <span>⚙️</span>
          <span className="hidden sm:inline">Filters</span>
        </button>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={e => onSortChange(e.target.value as SortOption)}
          className="rounded-full border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-600 outline-none md:px-4"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Expandable filters */}
      {filtersOpen && (
        <div className="animate-fadeUp mt-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex-1 min-w-[200px]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Price Range</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-gray-500">₹{priceRange[0]}</span>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={50}
                  value={priceRange[1]}
                  onChange={e => onPriceChange([priceRange[0], Number(e.target.value)])}
                  className="flex-1 accent-current"
                  style={{ color: accent }}
                />
                <span className="text-xs text-gray-500">₹{priceRange[1]}</span>
              </div>
            </div>
            <button
              onClick={() => { onPriceChange([0, maxPrice]); onSearchChange(''); onSortChange('newest') }}
              className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              Reset All
            </button>
          </div>
        </div>
      )}

      {/* Result count */}
      <p className="mt-3 text-xs text-gray-400">
        {resultCount} product{resultCount !== 1 ? 's' : ''}
        {search && <> matching &ldquo;{search}&rdquo;</>}
      </p>
    </div>
  )
}
