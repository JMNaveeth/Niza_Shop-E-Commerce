import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ProductDetail from '../components/Products/ProductDetail'
import { useProducts } from '../hooks/useProducts'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { products, loading, byId } = useProducts()
  const product = id ? byId.get(id) : undefined

  const related = useMemo(() => {
    if (!product) return []
    return products.filter(
      (p) => p.id !== product.id && p.category_id === product.category_id,
    )
  }, [product, products])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-gray-500">
        Loading product…
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-4xl">😕</p>
        <p className="mt-3 font-semibold text-gray-800">Product not found</p>
        <a href="/" className="mt-4 inline-block text-primary hover:underline">
          Back to shop
        </a>
      </div>
    )
  }

  return (
    <div className="pb-mobile-nav md:pb-0">
      <ProductDetail product={product} related={related} />
    </div>
  )
}
