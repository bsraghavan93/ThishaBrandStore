'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartContext } from '@/lib/CartContext'

const WHATSAPP_NUMBER = '919942384380'
const UPI_ID = 'adithyarajendran27@okaxis'

interface FormState {
  name: string
  phone: string
  email: string
  city: string
  address: string
  notes: string
}

const EMPTY_FORM: FormState = { name: '', phone: '', email: '', city: '', address: '', notes: '' }

type CheckoutStep = 'details' | 'payment' | 'done'

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCartContext()
  const router = useRouter()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<CheckoutStep>('details')
  const [orderId, setOrderId] = useState('')
  const [upiRef, setUpiRef] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | null>(null)

  const brand = cart[0]?.brand || 'organics'
  const accent = brand === 'trends' ? '#8B1539' : '#3B5E1F'

  const generateOrderId = () => {
    const now = new Date()
    const y = now.getUTCFullYear().toString().slice(2)
    const m = String(now.getUTCMonth() + 1).padStart(2, '0')
    const d = String(now.getUTCDate()).padStart(2, '0')
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    const prefix = brand === 'trends' ? 'TT' : 'TO'
    return `${prefix}-${y}${m}${d}-${rand}`
  }

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

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=Thisha Store&am=${total.toFixed(2)}&cu=INR&tn=Order ${orderId}`

  const brandLabel = brand === 'trends' ? 'Thisha Trends' : 'Thisha Organics'

  const buildWhatsAppMessage = (paid: boolean) => {
    const itemLines = cart
      .map(item => {
        let line = `• ${item.name} ×${item.qty}  ₹${(item.price * item.qty).toFixed(2)}`
        const details: string[] = []
        if (item.selectedColor) details.push(item.selectedColor)
        if (item.selectedSize) details.push(`Size: ${item.selectedSize}`)
        if (details.length) line += `\n  (${details.join(', ')})`
        return line
      })
      .join('\n')

    const paymentLine = paid
      ? `✅ Paid via UPI (Ref: ${upiRef})`
      : `⏳ Payment Pending — Will pay later`

    return `🛍️ New ${brandLabel} Order!
📋 Order ID: ${orderId}
💳 ${paymentLine}

From: ${form.name}
Phone: ${form.phone}
Email: ${form.email || '—'}
Address: ${form.address}, ${form.city}

Order:
${itemLines}

💰 Total: ₹${total.toFixed(2)}

Notes: ${form.notes || '—'}`
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const id = generateOrderId()
    setOrderId(id)
    setStep('payment')
  }

  const placeOrder = async (paid: boolean) => {
    setLoading(true)
    const status = paid ? 'paid' : 'unpaid'
    setPaymentStatus(status)

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
        order_id: orderId,
        brand,
        payment_status: status,
        upi_ref: paid ? upiRef : undefined,
      }

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      const message = encodeURIComponent(buildWhatsAppMessage(paid))
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')

      setStep('done')
      clearCart()
    } catch (err) {
      console.error('Failed to place order', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Done screen ──
  if (step === 'done') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div
          className="animate-checkPop flex h-24 w-24 items-center justify-center rounded-full text-5xl text-white"
          style={{ backgroundColor: accent }}
        >
          ✓
        </div>
        <h1 className="animate-fadeUp delay-100 mt-8 font-serif text-4xl font-semibold text-gray-900">Order Placed!</h1>
        <div
          className="animate-fadeUp delay-150 mt-4 inline-block rounded-xl px-5 py-2.5"
          style={{ backgroundColor: `${accent}10`, border: `1.5px solid ${accent}30` }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Order ID</p>
          <p className="mt-0.5 font-mono text-lg font-bold" style={{ color: accent }}>{orderId}</p>
        </div>
        <div className="animate-fadeUp delay-175 mt-3">
          {paymentStatus === 'paid' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
              ✅ Paid via UPI
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
              ⏳ Payment Pending
            </span>
          )}
        </div>
        <p className="animate-fadeUp delay-200 mt-4 text-gray-500">
          Thanks, <strong>{form.name}</strong> — we&apos;ll call <strong>{form.phone}</strong> shortly to confirm your order.
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

  // ── Payment step ──
  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <button onClick={() => setStep('details')} className="text-sm text-gray-500 hover:text-gray-800">← Back to details</button>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-gray-900">Payment</h1>
          <p className="mt-2 text-sm text-gray-500">
            Order <span className="font-mono font-semibold" style={{ color: accent }}>{orderId}</span> · ₹{total.toFixed(2)}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Pay Now */}
            <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: `1.5px solid ${accent}20` }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💳</span>
                <h3 className="font-serif text-xl font-bold text-gray-900">Pay Now (UPI)</h3>
              </div>
              <p className="mt-2 text-xs text-gray-400">Scan the QR or tap to open your UPI app. Enter the transaction ref after paying.</p>

              {/* QR Code via Google Charts API */}
              <div className="mt-4 flex justify-center">
                <div className="rounded-2xl bg-white p-3 shadow-inner" style={{ border: '1px solid #eee' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`}
                    alt="UPI QR Code"
                    width={200}
                    height={200}
                  />
                </div>
              </div>

              <div className="mt-3 text-center">
                <p className="text-[11px] text-gray-400">UPI ID</p>
                <p className="font-mono text-sm font-semibold text-gray-700">{UPI_ID}</p>
                <a
                  href={upiLink}
                  className="mt-2 inline-block rounded-full px-5 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: accent }}
                >
                  Open UPI App →
                </a>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-500">Amount to pay</p>
                <p className="font-serif text-2xl font-bold" style={{ color: accent }}>₹{total.toFixed(2)}</p>
              </div>

              <div className="mt-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-600">UPI Transaction/Ref ID <span style={{ color: accent }}>*</span></span>
                  <input
                    value={upiRef}
                    onChange={e => setUpiRef(e.target.value)}
                    placeholder="e.g., 412345678901"
                    className="checkout-input"
                    style={{ '--accent': accent } as React.CSSProperties}
                  />
                  <span className="text-[10px] text-gray-400">Find this in your UPI app under transaction details</span>
                </label>
              </div>

              <button
                onClick={() => {
                  if (!upiRef.trim()) { alert('Please enter the UPI transaction reference ID'); return }
                  placeOrder(true)
                }}
                disabled={loading}
                className="btn-shimmer mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundImage: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`, backgroundSize: '200% auto' }}
              >
                {loading ? (
                  <>
                    <span className="animate-spin-slow inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                    Placing Order…
                  </>
                ) : (
                  '✅ I\'ve Paid — Place Order'
                )}
              </button>
            </div>

            {/* Pay Later */}
            <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm" style={{ border: '1.5px solid #e5e7eb' }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <h3 className="font-serif text-xl font-bold text-gray-900">Pay Later</h3>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Place your order now and arrange payment later via WhatsApp.
              </p>

              <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-xl bg-amber-50 p-6 text-center">
                <span className="text-4xl">💬</span>
                <p className="mt-3 text-sm font-semibold text-amber-800">Pay via WhatsApp</p>
                <p className="mt-1 text-xs text-amber-600">We&apos;ll share payment details on WhatsApp after you place the order</p>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-500">Amount to be paid</p>
                <p className="font-serif text-2xl font-bold text-gray-900">₹{total.toFixed(2)}</p>
              </div>

              <button
                onClick={() => placeOrder(false)}
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 py-3.5 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50"
                style={{ borderColor: accent, color: accent }}
              >
                {loading ? (
                  <>
                    <span className="animate-spin-slow inline-block h-4 w-4 rounded-full border-2 border-current/40 border-t-current" />
                    Placing Order…
                  </>
                ) : (
                  '⏳ Pay Later — Place Order'
                )}
              </button>
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

  // ── Details step ──
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800">← Back</button>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Checkout</h2>
        </div>

        <h1 className="mt-4 font-serif text-4xl font-semibold text-gray-900">Almost there</h1>
        <p className="mt-2 max-w-lg text-sm text-gray-500">
          Fill in your details, then choose how you&apos;d like to pay.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-5 rounded-2xl bg-white p-7 shadow-sm">
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
              disabled={cart.length === 0}
              className="btn-shimmer mt-2 flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundImage: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`, backgroundSize: '200% auto' }}
            >
              Continue to Payment →
            </button>
          </form>

          <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-gray-900">Order Summary</h3>
            {cart.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">Your bag is empty.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {cart.map(item => (
                  <li key={item.cartKey} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={item.images[0]} alt={item.name} fill unoptimized className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        Qty {item.qty}
                        {item.selectedColor && <> · {item.selectedColor}</>}
                        {item.selectedSize && <> · {item.selectedSize}</>}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-serif text-2xl font-bold" style={{ color: accent }}>₹{total.toFixed(2)}</span>
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
