'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartContext } from '@/lib/CartContext'

const WHATSAPP_NUMBER = '14153738202'

interface FormState {
  name: string
  phone: string
  email: string
  city: string
  address: string
  notes: string
}

const EMPTY_FORM: FormState = { name: '', phone: '', email: '', city: '', address: '', notes: '' }

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCartContext()
  const router = useRouter()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<{ name: string; phone: string } | null>(null)

  const accent = cart[0]?.brand === 'trends' ? '#C2185B' : '#3B5E1F'

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
  }

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = 'Full name is required'
    if (!form.phone.trim()) next.phone = 'Phone number is required'
    if (!form.address.trim()) next.address = 'Address is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const buildWhatsAppMessage = () => {
    const itemLines = cart
      .map(item => `• ${item.name} ×${item.qty}  $${(item.price * item.qty).toFixed(2)}`)
      .join('\n')

    return `🛍️ New Thisha Order!

From: ${form.name}
Phone: ${form.phone}
Email: ${form.email || '—'}
Address: ${form.address}, ${form.city}

Order:
${itemLines}

💰 Total: $${total.toFixed(2)}

Notes: ${form.notes || '—'}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const orderPayload = {
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        address: form.address,
        city: form.city,
        notes: form.notes,
        items: cart,
        total,
      }

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      const message = encodeURIComponent(buildWhatsAppMessage())
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')

      setPlacedOrder({ name: form.name, phone: form.phone })
      clearCart()
    } catch (err) {
      console.error('Failed to place order', err)
    } finally {
      setLoading(false)
    }
  }

  if (placedOrder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div
          className="animate-checkPop flex h-24 w-24 items-center justify-center rounded-full text-5xl text-white"
          style={{ backgroundColor: accent }}
        >
          ✓
        </div>
        <h1 className="animate-fadeUp delay-100 mt-8 font-serif text-4xl font-semibold text-gray-900">Order Placed! 🎉</h1>
        <p className="animate-fadeUp delay-200 mt-3 text-gray-500">
          Thanks, <strong>{placedOrder.name}</strong> — we'll call <strong>{placedOrder.phone}</strong> shortly to confirm and arrange payment.
        </p>
        <Link
          href="/"
          className="animate-fadeUp delay-300 mt-8 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: accent }}
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800">← Back</button>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Checkout</h2>
        </div>

        <h1 className="mt-4 font-serif text-4xl font-semibold text-gray-900">Almost there</h1>
        <p className="mt-2 max-w-lg text-sm text-gray-500">
          Fill in your details — we'll call to confirm &amp; arrange payment. No card needed online.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl bg-white p-7 shadow-sm">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Full Name" required error={errors.name} accent={accent}>
                <input value={form.name} onChange={update('name')} className="checkout-input" style={{ '--accent': accent } as React.CSSProperties} />
              </Field>
              <Field label="Phone" required error={errors.phone} accent={accent}>
                <input value={form.phone} onChange={update('phone')} className="checkout-input" style={{ '--accent': accent } as React.CSSProperties} />
              </Field>
              <Field label="Email" accent={accent}>
                <input type="email" value={form.email} onChange={update('email')} className="checkout-input" style={{ '--accent': accent } as React.CSSProperties} />
              </Field>
              <Field label="City" accent={accent}>
                <input value={form.city} onChange={update('city')} className="checkout-input" style={{ '--accent': accent } as React.CSSProperties} />
              </Field>
            </div>

            <Field label="Address" required error={errors.address} accent={accent}>
              <input value={form.address} onChange={update('address')} className="checkout-input" style={{ '--accent': accent } as React.CSSProperties} />
            </Field>

            <Field label="Notes" accent={accent}>
              <textarea value={form.notes} onChange={update('notes')} rows={3} className="checkout-input resize-none" style={{ '--accent': accent } as React.CSSProperties} />
            </Field>

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="btn-shimmer mt-2 flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundImage: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`, backgroundSize: '200% auto' }}
            >
              {loading ? (
                <>
                  <span className="animate-spin-slow inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                  Placing Order…
                </>
              ) : (
                <>📲 Place Order via WhatsApp</>
              )}
            </button>
          </form>

          {/* Order summary */}
          <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-gray-900">Order Summary</h3>
            {cart.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">Your bag is empty.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {cart.map(item => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={item.images[0]} alt={item.name} fill unoptimized className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty {item.qty}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-serif text-2xl font-bold" style={{ color: accent }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .checkout-input {
          width: 100%;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .checkout-input:focus {
          border-color: var(--accent);
        }
      `}</style>
    </div>
  )
}

function Field({
  label,
  required,
  error,
  accent,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-600">
        {label}
        {required && <span style={{ color: accent }}> *</span>}
      </span>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  )
}
