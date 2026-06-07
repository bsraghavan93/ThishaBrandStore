import { Product } from './types'

export const organicsProducts: Product[] = [
  { id: 'o1', brand: 'organics', name: 'Rose Hip Glow Serum', price: 28.99, category: 'Serums', in_stock: true,
    description: 'A lightweight, fast-absorbing serum packed with rosehip oil and vitamin C to brighten and even skin tone naturally.',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&q=85', 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=700&q=85', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&q=85'] },
  { id: 'o2', brand: 'organics', name: 'Turmeric Glow Mask', price: 18.50, category: 'Masks', in_stock: true,
    description: 'A golden turmeric clay mask that detoxifies pores, reduces inflammation, and leaves skin radiant.',
    images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=85', 'https://images.unsplash.com/photo-1631390941545-4ffeada6f07d?w=700&q=85', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=700&q=85'] },
  { id: 'o3', brand: 'organics', name: 'Neem & Tea Tree Toner', price: 14.99, category: 'Toners', in_stock: true,
    description: 'Oil-control toner with neem leaf extract and tea tree oil. Balances pH and clears blemishes.',
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700&q=85', 'https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=700&q=85', 'https://images.unsplash.com/photo-1570194065650-d99fb4de8b5a?w=700&q=85'] },
  { id: 'o4', brand: 'organics', name: 'Shea & Aloe Moisturiser', price: 22.00, category: 'Moisturisers', in_stock: false,
    description: 'Rich yet non-greasy daily moisturiser with shea butter and aloe vera for 24-hour hydration.',
    images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=700&q=85', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=700&q=85', 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=700&q=85'] },
  { id: 'o5', brand: 'organics', name: 'Coconut Cleansing Balm', price: 19.99, category: 'Cleansers', in_stock: true,
    description: 'Melts away makeup effortlessly. Coconut, jojoba, and lavender for a luxurious spa-like cleanse.',
    images: ['https://images.unsplash.com/photo-1590156562745-5462ed04a639?w=700&q=85', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=700&q=85', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&q=85'] },
  { id: 'o6', brand: 'organics', name: 'Vitamin E Eye Cream', price: 24.50, category: 'Eye Care', in_stock: true,
    description: 'Gentle under-eye cream with vitamin E and cucumber. Reduces puffiness and dark circles.',
    images: ['https://images.unsplash.com/photo-1617897903246-719242758050?w=700&q=85', 'https://images.unsplash.com/photo-1571781565036-d3f759be73e4?w=700&q=85', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=700&q=85'] },
]

export const trendsProducts: Product[] = [
  { id: 't1', brand: 'trends', name: 'Blossom Wrap Dress', price: 54.99, category: 'Dresses', in_stock: true,
    description: 'Flowy wrap dress in soft floral print. Perfect for brunches, dates, and golden evenings. S–XL.',
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=700&q=85', 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=700&q=85', 'https://images.unsplash.com/photo-1594938298603-c8148c4b4b31?w=700&q=85'] },
  { id: 't2', brand: 'trends', name: 'High-Rise Wide Leg Pants', price: 42.00, category: 'Bottoms', in_stock: true,
    description: 'Statement wide-leg trousers in premium stretch fabric. Chic from office to after-hours.',
    images: ['https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=700&q=85', 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=700&q=85', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=700&q=85'] },
  { id: 't3', brand: 'trends', name: 'Puff Sleeve Crop Top', price: 26.99, category: 'Tops', in_stock: true,
    description: 'Romantic puff sleeves meet modern crop length. Pairs with jeans, skirts, or wide-leg trousers.',
    images: ['https://images.unsplash.com/photo-1583744946564-b52d931eab73?w=700&q=85', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=700&q=85', 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=700&q=85'] },
  { id: 't4', brand: 'trends', name: 'Oversized Linen Blazer', price: 68.00, category: 'Outerwear', in_stock: false,
    description: 'Relaxed-fit linen blazer in natural beige. The ultimate power piece for a polished look.',
    images: ['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=700&q=85', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=700&q=85', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=85'] },
  { id: 't5', brand: 'trends', name: 'Ruched Mini Skirt', price: 32.50, category: 'Bottoms', in_stock: true,
    description: 'Figure-flattering ruched mini in soft jersey. Available in blush, black, and cobalt.',
    images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=700&q=85', 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=700&q=85', 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=700&q=85'] },
  { id: 't6', brand: 'trends', name: 'Pearl Knit Cardigan', price: 46.00, category: 'Tops', in_stock: true,
    description: 'Soft ribbed cardigan with pearl button detail. Cosy, elevated, and endlessly versatile.',
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=700&q=85', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&q=85', 'https://images.unsplash.com/photo-1590330297626-d7aff25a0431?w=700&q=85'] },
]

export const allProducts: Product[] = [...organicsProducts, ...trendsProducts]
