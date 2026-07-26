import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'

export default function Navbar() {
  const itemCount = useCartStore((s) => s.getItemCount())
  const openCart = useCartStore((s) => s.openCart)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-dark/95 backdrop-blur-md safe-pt">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between safe-px sm:h-16">
        <Link to="/" className="flex min-h-11 items-center gap-1.5 active:opacity-80">
          <span className="text-xl sm:text-2xl" aria-hidden>
            🛍️
          </span>
          <span className="text-lg font-bold tracking-tight text-white sm:text-2xl">
            Niza <span className="text-primary">Shop</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/admin"
            className="hidden min-h-11 items-center px-2 text-sm font-medium text-white/70 transition hover:text-white sm:inline-flex"
          >
            Admin
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition active:bg-white/25 sm:hover:bg-white/20"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
              <path d="M6 6L5 3H2" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
