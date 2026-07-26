import { Suspense, lazy, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'
import { formatLkr } from '../Cart/WhatsAppOrder'
import ProductCard from './ProductCard'

const ProductViewer3D = lazy(() => import('./ProductViewer3D'))

interface ProductDetailProps {
  product: Product
  related: Product[]
}

export default function ProductDetail({ product, related }: ProductDetailProps) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const [color, setColor] = useState(product.colors[0] ?? '#e91e8c')
  const [size, setSize] = useState(product.sizes?.[0] ?? '')

  const soldOut = !product.is_active || product.stock_qty <= 0
  const discount = useMemo(() => {
    if (product.original_price <= product.price) return 0
    return Math.round(
      ((product.original_price - product.price) / product.original_price) * 100,
    )
  }, [product])

  const handleAdd = () => {
    addItem(product, { color, size: size || undefined })
    openCart()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="text-sm font-medium text-primary hover:underline">
        ← Back to shop
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex aspect-square items-center justify-center rounded-card bg-gradient-to-br from-pink-50 to-purple-50 text-8xl ring-1 ring-border sm:text-9xl">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full rounded-card object-cover"
              />
            ) : (
              product.emoji
            )}
          </div>

          <div className="h-56 overflow-hidden rounded-card bg-dark ring-1 ring-border sm:h-64">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-white/60">
                  Loading 360° viewer…
                </div>
              }
            >
              <ProductViewer3D color={color === 'transparent' ? '#e5e7eb' : color} />
            </Suspense>
          </div>
          <p className="text-center text-xs text-gray-500">Drag to rotate · 360° preview</p>
        </div>

        <div>
          {product.badge && (
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {product.badge}
            </span>
          )}
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
          {product.category && (
            <p className="mt-1 text-sm text-gray-500">
              {product.category.icon} {product.category.name}
              {product.category.gender !== 'unisex' && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">
                  {product.category.gender}
                </span>
              )}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatLkr(product.price)}</span>
            {product.original_price > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatLkr(product.original_price)}
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-semibold text-emerald-700">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-gray-800">Color</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ring-2 transition ${
                    color === c ? 'ring-primary ring-offset-2' : 'ring-transparent'
                  }`}
                  style={{
                    background:
                      c === 'transparent'
                        ? 'linear-gradient(45deg, #eee 40%, #ccc 40%, #ccc 60%, #eee 60%)'
                        : c,
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-gray-800">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium ring-1 transition ${
                      size === s
                        ? 'bg-dark text-white ring-dark'
                        : 'bg-white text-gray-700 ring-border hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={soldOut}
            onClick={handleAdd}
            className="mt-8 w-full rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-[#d4157a] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            {soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Related Products</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
