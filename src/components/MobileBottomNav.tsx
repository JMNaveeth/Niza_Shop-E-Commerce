import { Link, useLocation } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'

export default function MobileBottomNav() {
  const location = useLocation()
  const itemCount = useCartStore((s) => s.getItemCount())
  const openCart = useCartStore((s) => s.openCart)
  const isHome =
    location.pathname === '/' || location.pathname.startsWith('/phone-back-covers')
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) return null

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-3">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition ${
            isHome ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <span className="text-xl" aria-hidden>
            🏠
          </span>
          Shop
        </Link>

        <button
          type="button"
          onClick={openCart}
          className="relative flex flex-col items-center justify-center gap-0.5 text-xs font-semibold text-gray-500 transition active:text-primary"
        >
          <span className="relative text-xl" aria-hidden>
            🛒
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </span>
          Cart
        </button>

        <a
          href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '94XXXXXXXXX'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 text-xs font-semibold text-[#25D366] transition active:opacity-80"
        >
          <span className="text-xl" aria-hidden>
            💬
          </span>
          WhatsApp
        </a>
      </div>
    </nav>
  )
}
