import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ reviews: [] })
  }

  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand')

  let query = supabase.from('reviews').select('*').order('created_at', { ascending: false })
  if (brand) query = query.eq('brand', brand)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ reviews: [], error: error.message })
  }

  return NextResponse.json({ reviews: data })
}

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const body = await req.json()
  const { product_id, brand, reviewer_name, rating, comment } = body

  if (!brand || !reviewer_name || !rating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
  }

  const { data, error } = await supabase.from('reviews').insert({
    product_id: product_id || null,
    brand,
    reviewer_name,
    rating,
    comment: comment || '',
    source: 'customer',
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ review: data })
}
