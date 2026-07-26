import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'
import { useFlashSaleStatus } from '../../hooks/useFlashSale'
import { formatLkr } from '../Cart/WhatsAppOrder'

interface FlashSaleOffersProps {
  products: Product[]
}

export default function FlashSaleOffers({ products }: FlashSaleOffersProps) {
  const addItem = useCartStore((s) => s.addItem)
  const { getPrice, getCompareAt, getDiscount, live } = useFlashSaleStatus()

  // When timer ends, flash offers section is hidden by parent — keep null-safe
  if (!live || products.length === 0) {
    return null
  }

  return (
    <section aria-label="Flash sale offers">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">🔥 Flash Offers</h2>
          <p className="text-xs text-gray-500 sm:text-sm">
            Limited-time deals — when the timer ends, prices return to normal automatically
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
          {products.length} deal{products.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="scrollbar-hide -mx-3 flex gap-3 overflow-x-auto px-3 pb-1 snap-x-mandatory sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-4">
        {products.map((product) => {
          const soldOut = !product.is_active || product.stock_qty <= 0
          const selling = getPrice(product)
          const compareAt = getCompareAt(product)
          const discount = getDiscount(product)

          return (
            <article
              key={product.id}
              className="w-[68vw] max-w-[240px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border sm:w-auto sm:max-w-none"
            >
              <Link
                to={`/product/${product.id}`}
                className="relative block aspect-square bg-gradient-to-br from-pink-50 to-purple-50"
              >
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">
                    {product.emoji}
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Flash
                </span>
                {discount > 0 && (
                  <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    -{discount}%
                  </span>
                )}
                {soldOut && (
                  <span className="absolute inset-x-2 bottom-2 rounded-full bg-gray-900/80 py-1 text-center text-[10px] font-bold text-white">
                    Sold Out
                  </span>
                )}
              </Link>

              <div className="p-3">
                <Link to={`/product/${product.id}`}>
                  <h3 className="line-clamp-2 min-h-[2.4rem] text-sm font-semibold text-gray-900">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                  <span className="text-base font-bold text-primary">
                    {formatLkr(selling)}
                  </span>
                  {compareAt != null && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatLkr(compareAt)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() => addItem(product)}
                  className={`mt-2.5 flex h-10 w-full items-center justify-center rounded-xl text-sm font-bold text-white transition active:scale-[0.98] ${
                    soldOut ? 'bg-gray-300' : 'bg-primary active:bg-[#d4157a]'
                  }`}
                >
                  {soldOut ? 'Sold Out' : 'Add to Cart'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
