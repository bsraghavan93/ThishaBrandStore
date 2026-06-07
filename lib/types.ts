export type Brand = 'organics' | 'trends'

export interface Product {
  id: string
  name: string
  brand: Brand
  category: string
  price: number
  description: string
  images: string[]
  in_stock: boolean
  created_at?: string
}

export interface CartItem extends Product {
  qty: number
}

export interface Order {
  id?: string
  customer_name: string
  customer_phone: string
  customer_email: string
  address: string
  city: string
  notes: string
  items: CartItem[]
  total: number
  status?: string
}
