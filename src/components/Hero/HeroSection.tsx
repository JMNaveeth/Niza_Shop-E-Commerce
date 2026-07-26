import { Suspense, lazy, useEffect, useState } from 'react'

const ThreeHeroCanvas = lazy(() => import('./ThreeHeroCanvas'))

interface HeroSectionProps {
  onShopNow: () => void
}

export default function HeroSection({ onShopNow }: HeroSectionProps) {
  const [show3d, setShow3d] = useState(false)

  useEffect(() => {
    // Defer 3D on mobile for faster first paint; skip if user prefers reduced motion
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const delay = isMobile ? 800 : 100
    const t = window.setTimeout(() => setShow3d(true), delay)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-dark via-[#1a1028] to-[#2d0a24]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(233,30,140,0.28),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(124,58,237,0.22),_transparent_45%)]" />

      {show3d && (
        <Suspense fallback={null}>
          <ThreeHeroCanvas />
        </Suspense>
      )}

      <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-6xl flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[70vh] sm:py-20">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/95 sm:mb-3 sm:text-sm">
          From Pettah to Kinniya
        </p>
        <h1 className="max-w-3xl text-[1.85rem] font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
          Shop the Latest Styles
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:mt-4 sm:max-w-xl sm:text-lg">
          Fashion for Girls & Boys. Order on WhatsApp — delivered to Kinniya.
        </p>
        <button
          type="button"
          onClick={onShopNow}
          className="mt-6 min-h-12 w-full max-w-xs rounded-full bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/35 transition active:scale-[0.98] sm:mt-8 sm:w-auto sm:hover:scale-105 sm:hover:bg-[#d4157a]"
        >
          Shop Now
        </button>
      </div>
    </section>
  )
}
