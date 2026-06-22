import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { resend, ORDER_NOTIFICATION_EMAIL } from '@/lib/resend'
import { Order } from '@/lib/types'

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

export async function POST(req: NextRequest) {
  try {
    const order: Order = await req.json()

    if (!order.customer_name || !order.customer_phone || !order.address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let orderId: string | undefined

    if (supabase) {
      const { data, error } = await supabase
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
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase order insert failed:', error.message)
      } else {
        orderId = data?.id
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

    return NextResponse.json({ success: true, id: orderId })
  } catch (err) {
    console.error('Order submission failed:', err)
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
  }
}
