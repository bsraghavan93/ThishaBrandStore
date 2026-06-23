import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { resend, ORDER_NOTIFICATION_EMAIL } from '@/lib/resend'
import { Order } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function authedClient(token: string) {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}

async function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !supabase) return null

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  const client = authedClient(token)
  if (!client) return null

  return { user, client }
}

function buildEmailHtml(order: Order) {
  const rows = order.items
    .map(
      item => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">×${item.qty}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₹${(item.price * item.qty).toFixed(2)}</td>
        </tr>`
    )
    .join('')

  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#3B5E1F;">🛍️ New Thisha Order</h2>
      <p><strong>From:</strong> ${order.customer_name}</p>
      <p><strong>Phone:</strong> ${order.customer_phone}</p>
      <p><strong>Email:</strong> ${order.customer_email || '—'}</p>
      <p><strong>Address:</strong> ${order.address}, ${order.city}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #3B5E1F;">Item</th>
            <th style="text-align:center;padding:8px 12px;border-bottom:2px solid #3B5E1F;">Qty</th>
            <th style="text-align:right;padding:8px 12px;border-bottom:2px solid #3B5E1F;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:16px;font-size:18px;"><strong>💰 Total: ₹${order.total.toFixed(2)}</strong></p>
      <p><strong>Notes:</strong> ${order.notes || '—'}</p>
    </div>
  `
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await auth.client
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ orders: data })
}

export async function POST(req: NextRequest) {
  try {
    const order: Order = await req.json()

    if (!order.customer_name || !order.customer_phone || !order.address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (supabase) {
      const { error } = await supabase
        .from('orders')
        .insert({
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_email: order.customer_email,
          address: order.address,
          city: order.city,
          notes: order.notes,
          items: order.items,
          total: order.total,
          order_id: order.order_id,
          brand: order.brand,
        })

      if (error) {
        console.error('Supabase order insert failed:', error.message)
      }
    }

    if (resend) {
      try {
        await resend.emails.send({
          from: 'Thisha Orders <orders@thisha.store>',
          to: ORDER_NOTIFICATION_EMAIL,
          subject: `New Thisha Order from ${order.customer_name}`,
          html: buildEmailHtml(order),
        })
      } catch (emailErr) {
        console.error('Resend email failed:', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Order submission failed:', err)
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 })

  const { data, error } = await auth.client
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ order: data })
}
