import type { Product } from '../types'

export const PHONE_COVERS_SLUG = 'phone-back-covers'
export const PHONE_COVERS_CATEGORY_ID = 'cat-phone-covers'

export interface PhoneBrand {
  id: string
  label: string
  /** Match against product name / sizes (case-insensitive) */
  patterns: RegExp[]
  accent: string
  accentSoft: string
  emoji: string
}

/** Ordered brands shown in the phone covers catalog */
export const PHONE_BRANDS: PhoneBrand[] = [
  {
    id: 'iphone',
    label: 'iPhone',
    patterns: [/\biphone\b/i, /\bapple\b/i],
    accent: '#111827',
    accentSoft: '#f3f4f6',
    emoji: '🍎',
  },
  {
    id: 'samsung',
    label: 'Samsung',
    patterns: [/\bsamsung\b/i, /\bgalaxy\b/i],
    accent: '#1428a0',
    accentSoft: '#e8ecff',
    emoji: '💙',
  },
  {
    id: 'honor',
    label: 'Honor',
    patterns: [/\bhonor\b/i],
    accent: '#000000',
    accentSoft: '#f4f4f5',
    emoji: '🖤',
  },
  {
    id: 'redmi',
    label: 'Redmi',
    patterns: [/\bredmi\b/i, /\bxiaomi\b/i, /\bpoco\b/i],
    accent: '#ff6900',
    accentSoft: '#fff3eb',
    emoji: '🧡',
  },
  {
    id: 'oppo',
    label: 'Oppo',
    patterns: [/\boppo\b/i],
    accent: '#1a9e4b',
    accentSoft: '#e8f8ee',
    emoji: '💚',
  },
  {
    id: 'vivo',
    label: 'Vivo',
    patterns: [/\bvivo\b/i],
    accent: '#415fff',
    accentSoft: '#eef1ff',
    emoji: '💜',
  },
  {
    id: 'realme',
    label: 'Realme',
    patterns: [/\brealme\b/i],
    accent: '#ffc200',
    accentSoft: '#fff8e0',
    emoji: '💛',
  },
  {
    id: 'oneplus',
    label: 'OnePlus',
    patterns: [/\boneplus\b/i, /\bone\s*plus\b/i],
    accent: '#f50514',
    accentSoft: '#ffe8ea',
    emoji: '❤️',
  },
]

export const OTHER_PHONE_BRAND: PhoneBrand = {
  id: 'other',
  label: 'Other',
  patterns: [],
  accent: '#6b7280',
  accentSoft: '#f3f4f6',
  emoji: '📱',
}

function productSearchText(product: Product): string {
  const sizes = product.sizes?.join(' ') ?? ''
  return `${product.name} ${sizes} ${product.description}`
}

export function detectPhoneBrand(product: Product): PhoneBrand {
  const text = productSearchText(product)
  for (const brand of PHONE_BRANDS) {
    if (brand.patterns.some((re) => re.test(text))) return brand
  }
  return OTHER_PHONE_BRAND
}

export function groupProductsByBrand(
  products: Product[],
): { brand: PhoneBrand; products: Product[] }[] {
  const buckets = new Map<string, { brand: PhoneBrand; products: Product[] }>()

  for (const product of products) {
    const brand = detectPhoneBrand(product)
    const existing = buckets.get(brand.id)
    if (existing) {
      existing.products.push(product)
    } else {
      buckets.set(brand.id, { brand, products: [product] })
    }
  }

  const ordered: { brand: PhoneBrand; products: Product[] }[] = []
  for (const brand of PHONE_BRANDS) {
    const group = buckets.get(brand.id)
    if (group) ordered.push(group)
  }
  const other = buckets.get(OTHER_PHONE_BRAND.id)
  if (other) ordered.push(other)
  return ordered
}

export function filterByPhoneBrand(
  products: Product[],
  brandId: string | null,
): Product[] {
  if (!brandId) return products
  return products.filter((p) => detectPhoneBrand(p).id === brandId)
}
