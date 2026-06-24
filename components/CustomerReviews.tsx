'use client'

import { useEffect, useState } from 'react'
import { Brand, Product } from '@/lib/types'
import { useReveal } from '@/hooks/useReveal'

interface Review {
  id: string
  product_id: string | null
  brand: Brand
  reviewer_name: string
  rating: number
  comment: string
  source: string
  created_at: string
}

function Stars({ rating, size = 'md', interactive, onChange }: { rating: number; size?: 'sm' | 'md' | 'lg'; interactive?: boolean; onChange?: (r: number) => void }) {
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-2xl' }
  return (
    <div className={`flex gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-125' : ''}
          onClick={() => interactive && onChange?.(i)}
          style={{ color: i <= rating ? '#f59e0b' : '#d1d5db' }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function CustomerReviews({ brand, accent, products }: { brand: Brand; accent: string; products: Product[] }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [productId, setProductId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [headerRef, headerVisible] = useReveal()

  useEffect(() => {
    fetch(`/api/reviews?brand=${brand}`)
      .then(r => r.json())
      .then(json => { if (Array.isArray(json.reviews)) setReviews(json.reviews) })
      .catch(() => {})
  }, [brand])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !rating) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, product_id: productId || null, reviewer_name: name.trim(), rating, comment: comment.trim() }),
      })
      const json = await res.json()
      if (json.review) {
        setReviews(prev => [json.review, ...prev])
        setName(''); setRating(0); setComment(''); setProductId('')
        setSubmitted(true)
        setTimeout(() => { setSubmitted(false); setShowForm(false) }, 2000)
      }
    } catch { /* ignore */ } finally {
      setSubmitting(false)
    }
  }

  const displayProducts = products.filter(p => p.category !== 'Customer Review')
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0

  return (
    <section className="px-4 py-12 md:px-6 md:py-20" style={{ backgroundColor: brand === 'organics' ? '#f6faf1' : '#FDF0F4' }}>
      <div ref={headerRef} className={`mx-auto max-w-7xl ${headerVisible ? 'animate-fadeUp' : 'opacity-0'}`}>
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[3px]" style={{ color: accent }}>✦ Customer Reviews ✦</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-gray-900">What Our Customers Say</h2>
          {reviews.length > 0 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <Stars rating={Math.round(avgRating)} size="md" />
              <span className="text-sm text-gray-500">{avgRating.toFixed(1)} average from {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {!showForm && !submitted && (
          <div className="mb-10 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: accent }}
            >
              Write a Review
            </button>
          </div>
        )}

        {submitted && (
          <div className="animate-fadeUp mb-10 rounded-2xl bg-white p-8 text-center shadow-sm">
            <span className="text-4xl">🎉</span>
            <p className="mt-3 font-serif text-xl font-semibold text-gray-900">Thank you for your review!</p>
          </div>
        )}

        {showForm && !submitted && (
          <form onSubmit={handleSubmit} className="animate-fadeUp mx-auto mb-10 max-w-lg rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-serif text-lg font-bold text-gray-900">Write a Review</h3>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-600">Your Name</span>
                <input required value={name} onChange={e => setName(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-400" placeholder="Enter your name" />
              </label>

              {displayProducts.length > 0 && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-600">Product <span className="text-gray-400">(optional)</span></span>
                  <select value={productId} onChange={e => setProductId(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-400">
                    <option value="">General review</option>
                    {displayProducts.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </label>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-600">Rating</span>
                <Stars rating={rating} size="lg" interactive onChange={setRating} />
                {rating === 0 && <span className="text-xs text-gray-400">Tap a star to rate</span>}
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-600">Your Review <span className="text-gray-400">(optional)</span></span>
                <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)} className="resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-400" placeholder="Tell us about your experience..." />
              </label>

              <div className="flex gap-3">
                <button type="submit" disabled={submitting || !rating || !name.trim()} className="rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: accent }}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              </div>
            </div>
          </form>
        )}

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map(review => {
              const product = products.find(p => p.id === review.product_id)
              return (
                <div key={review.id} className="rounded-2xl bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <Stars rating={review.rating} size="sm" />
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{
                      backgroundColor: review.source === 'owner' ? '#fef3c7' : '#dbeafe',
                      color: review.source === 'owner' ? '#92400e' : '#1e40af',
                    }}>
                      {review.source === 'owner' ? 'From Owner' : 'Customer'}
                    </span>
                  </div>
                  {review.comment && <p className="mt-3 text-sm leading-relaxed text-gray-600">{review.comment}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{review.reviewer_name}</p>
                      {product && <p className="text-xs text-gray-400">{product.name}</p>}
                    </div>
                    <span className="text-[10px] text-gray-300">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
