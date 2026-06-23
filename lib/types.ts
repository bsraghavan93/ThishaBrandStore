export type Brand = 'organics' | 'trends'

export interface ProductColor {
  name: string
  hex: string
}

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
  colors?: ProductColor[]
  sizes?: string[]
  oos_sizes?: string[]
  oos_colors?: string[]
  material?: string
  fit_type?: string
  care_instructions?: string
  ingredients?: string
  volume?: string
  skin_type?: string
  usage_instructions?: string
}

export interface CartItem extends Product {
  qty: number
  selectedColor?: string
  selectedSize?: string
  cartKey: string
}

export interface Order {
  id?: string
  order_id?: string
  brand?: Brand
  customer_name: string
  customer_phone: string
  customer_email: string
  address: string
  city: string
  notes: string
  items: CartItem[]
  total: number
  status?: string
  payment_status?: string
  upi_ref?: string
}
