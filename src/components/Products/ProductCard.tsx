import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'
import { formatLkr } from '../Cart/WhatsAppOrder'

interface ProductCardProps {
  product: Product
}

const BADGE_STYLES: Record<string, string> = {
  New: 'bg-emerald-500',
  Hot: 'bg-orange-500',
  Sale: 'bg-primary',
  Trending: 'bg-purple',
  Premium: 'bg-gold text-gray-900',
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const soldOut = !product.is_active || product.stock_qty <= 0
  const discount =
    product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card bg-white shadow-sm ring-1 ring-border transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-square bg-gradient-to-br from-pink-50 to-purple-50"
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl sm:text-7xl">
            {product.emoji}
          </div>
        )}

        {product.badge && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${BADGE_STYLES[product.badge] ?? 'bg-gray-700'}`}
          >
            {product.badge}
          </span>
        )}

        {soldOut && (
          <span className="absolute right-2 top-2 rounded-full bg-gray-900/80 px-2.5 py-0.5 text-xs font-bold text-white">
            Sold Out
          </span>
        )}

        {product.is_flash_sale && !soldOut && (
          <span className="absolute bottom-2 left-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Flash
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-primary sm:text-lg">
            {formatLkr(product.price)}
          </span>
          {product.original_price > product.price && (
            <>
              <span className="text-xs text-gray-400 line-through sm:text-sm">
                {formatLkr(product.original_price)}
              </span>
              {discount > 0 && (
                <span className="text-xs font-semibold text-emerald-600">-{discount}%</span>
              )}
            </>
          )}
        </div>

        <div className="mt-2 flex gap-1.5">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
              style={{
                background:
                  color === 'transparent'
                    ? 'linear-gradient(45deg, #eee 40%, #ccc 40%, #ccc 60%, #eee 60%)'
                    : color,
              }}
              title={color}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={soldOut}
          onClick={() => addItem(product)}
          className="mt-auto w-full pt-3"
        >
          <span
            className={`block w-full rounded-xl py-2.5 text-sm font-semibold text-white transition ${
              soldOut
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-dark hover:bg-primary'
            }`}
          >
            {soldOut ? 'Sold Out' : 'Add to Cart'}
          </span>
        </button>
      </div>
    </article>
  )
}
