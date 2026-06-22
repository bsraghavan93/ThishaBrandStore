import { useEffect, useState } from 'react'
import { Brand, Product } from '@/lib/types'

export function useProducts(brand: Brand) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/api/products')
      .then(res => res.json())
      .then(json => {
        if (cancelled || !Array.isArray(json.products)) return
        setProducts(json.products.filter((p: Product) => p.brand === brand))
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [brand])

  return { products, loading }
}
