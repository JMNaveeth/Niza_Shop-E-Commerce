import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
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
  const [show3d, setShow3d] = useState(false)

  useEffect(() => {
    setColor(product.colors[0] ?? '#e91e8c')
    setSize(product.sizes?.[0] ?? '')
    setShow3d(false)
  }, [product.id, product.colors, product.sizes])

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
    <div className="mx-auto max-w-6xl px-3 pb-28 pt-4 sm:px-4 sm:py-8 sm:pb-8">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-primary active:opacity-70"
      >
        ← Back to shop
      </Link>

      <div className="mt-3 grid gap-5 sm:mt-6 sm:gap-8 lg:grid-cols-2">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 text-7xl ring-1 ring-border sm:rounded-card sm:text-9xl">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full rounded-2xl object-cover sm:rounded-card"
              />
            ) : (
              product.emoji
            )}
          </div>

          {!show3d ? (
            <button
              type="button"
              onClick={() => setShow3d(true)}
              className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-dark text-sm font-semibold text-white ring-1 ring-border active:opacity-90"
            >
              View 360° preview
            </button>
          ) : (
            <>
              <div className="h-48 overflow-hidden rounded-2xl bg-dark ring-1 ring-border sm:h-64 sm:rounded-card">
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center text-sm text-white/60">
                      Loading viewer…
                    </div>
                  }
                >
                  <ProductViewer3D color={color === 'transparent' ? '#e5e7eb' : color} />
                </Suspense>
              </div>
              <p className="text-center text-xs text-gray-500">
                Drag or swipe to rotate · 360° preview
              </p>
            </>
          )}
        </div>

        <div>
          {product.badge && (
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {product.badge}
            </span>
          )}
          <h1 className="mt-2 text-xl font-bold leading-snug text-gray-900 sm:text-3xl">
            {product.name}
          </h1>
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

          <div className="mt-3 flex flex-wrap items-baseline gap-2 sm:mt-4 sm:gap-3">
            <span className="text-2xl font-bold text-primary sm:text-3xl">
              {formatLkr(product.price)}
            </span>
            {product.original_price > product.price && (
              <>
                <span className="text-base text-gray-400 line-through sm:text-lg">
                  {formatLkr(product.original_price)}
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-semibold text-emerald-700">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <div className="mt-5 sm:mt-6">
            <p className="mb-2 text-sm font-semibold text-gray-800">Color</p>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-11 w-11 rounded-full ring-2 transition ${
                    color === c ? 'ring-primary ring-offset-2' : 'ring-black/10'
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
            <div className="mt-5 sm:mt-6">
              <p className="mb-2 text-sm font-semibold text-gray-800">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-h-11 rounded-xl px-4 text-sm font-semibold ring-1 transition ${
                      size === s
                        ? 'bg-dark text-white ring-dark'
                        : 'bg-white text-gray-700 ring-border active:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop CTA */}
          <button
            type="button"
            disabled={soldOut}
            onClick={handleAdd}
            className="mt-7 hidden min-h-12 w-full rounded-xl bg-primary text-base font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-[#d4157a] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none sm:mt-8 sm:block"
          >
            {soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>

          <div className="mt-6 sm:mt-8">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10 sm:mt-14">
          <h2 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl">
            Related Products
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky mobile Add to Cart — sits above bottom nav */}
      <div
        className="fixed inset-x-0 z-30 border-t border-border bg-white/95 px-3 py-2.5 backdrop-blur-md sm:hidden"
        style={{ bottom: 'calc(4rem + var(--safe-bottom))' }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
            <p className="text-base font-bold text-primary">{formatLkr(product.price)}</p>
          </div>
          <button
            type="button"
            disabled={soldOut}
            onClick={handleAdd}
            className="min-h-12 shrink-0 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:bg-gray-300"
          >
            {soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
