import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function authedClient(token: string) {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}

async function requireUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !supabase) return null

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  const client = authedClient(token)
  if (!client) return null

  return { user, client }
}

function extractStoragePaths(images: string[]): string[] {
  return images
    .map(url => {
      const match = url.match(/\/storage\/v1\/object\/public\/product-images\/(.+)/)
      return match ? match[1] : null
    })
    .filter((p): p is string => p !== null)
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ products: [], source: 'unconfigured' })
  }

  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ products: [], error: error.message })
  }

  return NextResponse.json({ products: data, source: 'supabase' })
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await auth.client.from('products').insert(body).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ product: data })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })

  const { data, error } = await auth.client.from('products').update(updates).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ product: data })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })

  const { data: product } = await auth.client.from('products').select('images').eq('id', id).single()

  if (product?.images?.length) {
    const paths = extractStoragePaths(product.images)
    if (paths.length) {
      await auth.client.storage.from('product-images').remove(paths)
    }
  }

  const { error } = await auth.client.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
