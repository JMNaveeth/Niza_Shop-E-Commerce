import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'

export default function Navbar() {
  const itemCount = useCartStore((s) => s.getItemCount())
  const openCart = useCartStore((s) => s.openCart)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-dark/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🛍️
          </span>
          <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Niza <span className="text-primary">Shop</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/admin"
            className="text-sm font-medium text-white/70 transition hover:text-white"
          >
            Admin
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
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
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
