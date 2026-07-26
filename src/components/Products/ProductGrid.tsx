import type { Product } from '../../types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-2xl bg-white ring-1 ring-border sm:rounded-card"
          />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-card bg-white py-16 text-center ring-1 ring-border">
        <p className="text-4xl">🔍</p>
        <p className="mt-3 font-semibold text-gray-800">No products found</p>
        <p className="mt-1 text-sm text-gray-500">Try another category or gender filter.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
