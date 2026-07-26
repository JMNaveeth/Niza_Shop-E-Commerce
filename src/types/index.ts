export type Gender = 'girls' | 'boys' | 'unisex' | 'all'
export type ProductBadge = 'New' | 'Hot' | 'Sale' | 'Trending' | 'Premium' | null
export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered'

export interface Category {
  id: string
  name: string
  gender: 'girls' | 'boys' | 'unisex'
  icon: string
  slug: string
  created_at?: string
}

export interface Product {
  id: string
  name: string
  category_id: string
  price: number
  original_price: number
  images: string[]
  emoji: string
  description: string
  colors: string[]
  sizes?: string[]
  stock_qty: number
  is_active: boolean
  is_featured: boolean
  is_flash_sale: boolean
  badge: ProductBadge
  created_at?: string
  category?: Category
}

export interface CartItem {
  product: Product
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

export interface OrderItem {
  product_id: string
  name: string
  emoji: string
  quantity: number
  price: number
  color?: string
  size?: string
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  grand_total: number
  status: OrderStatus
  whatsapp_sent_at?: string | null
  created_at?: string
}

export const DELIVERY_FEE = 450

export interface ShopOffers {
  flashSaleEnabled: boolean
  flashSaleTitle: string
  flashSaleSubtitle: string
  /** ISO timestamp when flash sale ends */
  flashSaleEndsAt: string
  /** Optional promo strip shown above the product grid */
  promoBannerEnabled: boolean
  promoBannerText: string
  deliveryFee: number
}
