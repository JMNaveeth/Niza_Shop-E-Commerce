import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'
import { useFlashSaleStatus } from '../../hooks/useFlashSale'
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
  const { getPrice, getCompareAt, getDiscount, live } = useFlashSaleStatus()
  const soldOut = !product.is_active || product.stock_qty <= 0
  const selling = getPrice(product)
  const compareAt = getCompareAt(product)
  const discount = getDiscount(product)
  const showFlashBadge = product.is_flash_sale && live && !soldOut

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border transition duration-300 sm:rounded-card sm:hover:-translate-y-1 sm:hover:shadow-lg">
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-square bg-gradient-to-br from-pink-50 to-purple-50 active:opacity-95"
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-300 sm:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl sm:text-7xl">
            {product.emoji}
          </div>
        )}

        {product.badge && (
          <span
            className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold text-white sm:left-2 sm:top-2 sm:px-2.5 sm:text-xs ${BADGE_STYLES[product.badge] ?? 'bg-gray-700'}`}
          >
            {product.badge}
          </span>
        )}

        {soldOut && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-gray-900/80 px-2 py-0.5 text-[10px] font-bold text-white sm:right-2 sm:top-2 sm:text-xs">
            Sold Out
          </span>
        )}

        {showFlashBadge && (
          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Flash
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <Link to={`/product/${product.id}`} className="active:opacity-80">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-gray-900 sm:min-h-0 sm:text-base">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-[15px] font-bold text-primary sm:text-lg">
            {formatLkr(selling)}
          </span>
          {compareAt != null && (
            <>
              <span className="text-[11px] text-gray-400 line-through sm:text-sm">
                {formatLkr(compareAt)}
              </span>
              {discount > 0 && (
                <span className="text-[11px] font-semibold text-emerald-600 sm:text-xs">
                  -{discount}%
                </span>
              )}
            </>
          )}
        </div>

        <div className="mt-1.5 hidden gap-1.5 sm:flex">
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
          onClick={(e) => {
            e.preventDefault()
            addItem(product)
          }}
          className={`mt-2.5 min-h-10 w-full rounded-xl text-[13px] font-bold text-white transition active:scale-[0.98] sm:mt-3 sm:min-h-11 sm:text-sm ${
            soldOut
              ? 'cursor-not-allowed bg-gray-300'
              : 'bg-dark active:bg-primary sm:hover:bg-primary'
          }`}
        >
          {soldOut ? 'Sold Out' : 'Add'}
          <span className="hidden sm:inline"> to Cart</span>
        </button>
      </div>
    </article>
  )
}
