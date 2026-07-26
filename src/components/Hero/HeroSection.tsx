import { Suspense, lazy, useEffect, useState } from 'react'

const ThreeHeroCanvas = lazy(() => import('./ThreeHeroCanvas'))

interface HeroSectionProps {
  onShopNow: () => void
}

export default function HeroSection({ onShopNow }: HeroSectionProps) {
  const [show3d, setShow3d] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const delay = isMobile ? 500 : 80
    const t = window.setTimeout(() => setShow3d(true), delay)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <section className="relative isolate overflow-hidden bg-[#0b0614]">
      {/* Full-bleed atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b28] via-[#12081f] to-[#2a0a22]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(233,30,140,0.45),transparent_55%),radial-gradient(ellipse_80%_60%_at_100%_100%,rgba(124,58,237,0.35),transparent_50%),radial-gradient(ellipse_70%_50%_at_0%_80%,rgba(245,158,11,0.18),transparent_45%)]" />

      {/* Soft mobile orbs (CSS fallback / accent under 3D) */}
      <div className="pointer-events-none absolute -left-16 top-24 h-44 w-44 rounded-full bg-primary/30 blur-3xl animate-soft-float sm:hidden" />
      <div
        className="pointer-events-none absolute -right-12 bottom-28 h-52 w-52 rounded-full bg-purple/35 blur-3xl animate-soft-float sm:hidden"
        style={{ animationDelay: '1.2s' }}
      />

      {show3d && (
        <Suspense fallback={null}>
          <ThreeHeroCanvas />
        </Suspense>
      )}

      {/* Readability veil — stronger on mobile so text pops */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/55 sm:from-black/20 sm:via-transparent sm:to-black/40" />

      <div className="relative z-10 mx-auto flex min-h-[min(92dvh,720px)] max-w-6xl flex-col items-center justify-center px-4 pb-16 pt-10 text-center sm:min-h-[70vh] sm:px-6 sm:pb-20 sm:pt-16">
        {/* Brand — hero-level on mobile */}
        <p className="mb-4 text-[2rem] font-black tracking-tight text-white drop-shadow-lg sm:mb-5 sm:text-4xl md:text-5xl">
          Niza <span className="bg-gradient-to-r from-primary via-[#ff4db8] to-gold bg-clip-text text-transparent">Shop</span>
        </p>

        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary shadow-lg shadow-primary/20 backdrop-blur-md sm:mb-4 sm:text-xs">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ade80]" />
          From Pettah to You
        </span>

        <h1 className="max-w-[18ch] text-[1.75rem] font-extrabold leading-[1.15] text-white drop-shadow-md sm:max-w-3xl sm:text-5xl md:text-6xl">
          Shop the Latest{' '}
          <span className="bg-gradient-to-r from-white via-[#fce7f3] to-[#f9a8d4] bg-clip-text text-transparent">
            Styles
          </span>
        </h1>

        <p className="mt-3 max-w-[22rem] text-[0.95rem] leading-relaxed text-white/85 sm:mt-4 sm:max-w-xl sm:text-lg">
          Fashion for Girls & Boys. Order on WhatsApp — we deliver island-wide.
        </p>

        {/* Thumb-friendly actions */}
        <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:mt-9 sm:max-w-md sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onShopNow}
            className="relative min-h-[52px] flex-1 overflow-hidden rounded-full bg-gradient-to-r from-primary via-[#ff2d9b] to-[#c026a0] px-8 text-base font-bold text-white shadow-[0_12px_40px_-8px_rgba(233,30,140,0.75)] transition active:scale-[0.98] sm:min-h-14 sm:hover:brightness-110"
          >
            <span className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer" />
            </span>
            <span className="relative">Shop Now</span>
          </button>
          <a
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '94XXXXXXXXX'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-md transition active:scale-[0.98] active:bg-white/15 sm:min-h-14 sm:hover:bg-white/15"
          >
            <span aria-hidden>💬</span>
            WhatsApp us
          </a>
        </div>

        {/* Scroll cue */}
        <button
          type="button"
          onClick={onShopNow}
          className="mt-10 flex flex-col items-center gap-1 text-white/50 transition active:text-white/80 sm:mt-12"
          aria-label="Scroll to products"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Browse</span>
          <span className="animate-bolt-bounce text-lg leading-none" aria-hidden>
            ↓
          </span>
        </button>
      </div>
    </section>
  )
}
