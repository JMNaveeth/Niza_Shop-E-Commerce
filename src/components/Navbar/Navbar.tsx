import { useRef } from 'react'
import type { MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import {
  AdminUnlockModal,
  useSecretAdminAccess,
} from '../SecretAdminAccess'

export default function Navbar() {
  const itemCount = useCartStore((s) => s.getItemCount())
  const openCart = useCartStore((s) => s.openCart)
  const location = useLocation()
  const { promptOpen, openPrompt, closePrompt, tryUnlock } = useSecretAdminAccess(
    !location.pathname.startsWith('/admin'),
  )

  const tapsRef = useRef<{ count: number; timer: number | null }>({
    count: 0,
    timer: null,
  })

  const onLogoClick = (e: MouseEvent) => {
    // Quintuple-tap logo opens hidden staff code prompt (mobile-friendly)
    tapsRef.current.count += 1
    if (tapsRef.current.timer) window.clearTimeout(tapsRef.current.timer)
    tapsRef.current.timer = window.setTimeout(() => {
      tapsRef.current.count = 0
    }, 900)

    if (tapsRef.current.count >= 5) {
      e.preventDefault()
      tapsRef.current.count = 0
      openPrompt()
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-dark/95 backdrop-blur-md safe-pt">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between safe-px sm:h-16">
          <Link
            to="/"
            onClick={onLogoClick}
            className="flex min-h-11 items-center gap-1.5 active:opacity-80"
            title="Niza Shop"
          >
            <span className="text-xl sm:text-2xl" aria-hidden>
              🛍️
            </span>
            <span className="text-lg font-bold tracking-tight text-white sm:text-2xl">
              Niza <span className="text-primary">Shop</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#c026a0] text-white shadow-lg shadow-primary/35 ring-2 ring-white/20 transition active:scale-95 sm:hover:scale-105 sm:hover:shadow-primary/50"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition group-active:opacity-100 sm:group-hover:opacity-100" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="relative h-[22px] w-[22px]"
              aria-hidden
            >
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.2 14h9.45c.75 0 1.41-.41 1.75-1.03l3.3-6.05A1 1 0 0 0 20.8 5H5.21l-.6-1.26A1 1 0 0 0 3.7 3H2v2h1.2l3.6 7.59-1.35 2.44A2 2 0 0 0 7.2 18H20v-2H7.42l.78-1.4z" />
            </svg>

            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-extrabold text-primary shadow-md ring-2 ring-dark">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <AdminUnlockModal
        open={promptOpen}
        onClose={closePrompt}
        onUnlock={tryUnlock}
      />
    </>
  )
}
