import { Suspense, lazy } from 'react'

const ThreeHeroCanvas = lazy(() => import('./ThreeHeroCanvas'))

interface HeroSectionProps {
  onShopNow: () => void
}

export default function HeroSection({ onShopNow }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-dark via-[#1a1028] to-[#2d0a24]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(233,30,140,0.25),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(124,58,237,0.2),_transparent_45%)]" />

      <Suspense fallback={<div className="absolute inset-0" />}>
        <ThreeHeroCanvas />
      </Suspense>

      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary/90">
          From Pettah to Kinniya
        </p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
          Shop the Latest Styles
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/75 sm:text-lg">
          Fashion finds for Girls & Boys — handbags, covers, watches & more. Order via WhatsApp.
        </p>
        <button
          type="button"
          onClick={onShopNow}
          className="mt-8 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:scale-105 hover:bg-[#d4157a] active:scale-100"
        >
          Shop Now
        </button>
      </div>
    </section>
  )
}
