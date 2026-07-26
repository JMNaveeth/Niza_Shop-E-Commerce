import { useMemo, useRef, useState } from 'react'
import HeroSection from '../components/Hero/HeroSection'
import GenderTabs from '../components/Categories/GenderTabs'
import CategoryChips from '../components/Categories/CategoryChips'
import FlashBanner from '../components/FlashSale/FlashBanner'
import ProductGrid from '../components/Products/ProductGrid'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useCatalogStore } from '../store/catalogStore'
import type { Gender } from '../types'

export default function Home() {
  const { products, loading } = useProducts()
  const { categories } = useCategories()
  const offers = useCatalogStore((s) => s.offers)
  const [gender, setGender] = useState<Gender>('all')
  const [categorySlug, setCategorySlug] = useState<string | null>(null)
  const catalogRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const cat = p.category ?? categories.find((c) => c.id === p.category_id)
      if (gender !== 'all' && cat && cat.gender !== gender && cat.gender !== 'unisex') {
        return false
      }
      if (categorySlug && cat?.slug !== categorySlug) return false
      return true
    })
  }, [products, categories, gender, categorySlug])

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pb-mobile-nav md:pb-0">
      <HeroSection onShopNow={scrollToCatalog} />

      <div
        ref={catalogRef}
        className="mx-auto max-w-6xl space-y-4 px-3 py-6 sm:space-y-6 sm:px-4 sm:py-10 scroll-mt-16"
      >
        <FlashBanner />

        {offers.promoBannerEnabled && offers.promoBannerText.trim() && (
          <div className="rounded-2xl bg-gold/15 px-3 py-3 text-center text-sm font-semibold leading-snug text-amber-900 ring-1 ring-gold/30 sm:rounded-card sm:px-4">
            {offers.promoBannerText}
          </div>
        )}

        <div className="sticky top-14 z-20 -mx-3 space-y-3 bg-[#f8f7fb]/95 px-3 py-2 backdrop-blur-md sm:top-16 sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          <GenderTabs
            value={gender}
            onChange={(g) => {
              setGender(g)
              setCategorySlug(null)
            }}
          />
          <CategoryChips
            categories={categories}
            gender={gender}
            selectedSlug={categorySlug}
            onSelect={setCategorySlug}
          />
        </div>

        <div className="flex items-end justify-between gap-3 pt-1">
          <h2 className="text-lg font-bold text-gray-900 sm:text-2xl">
            {gender === 'all' ? 'All Products' : gender === 'girls' ? 'Girls' : 'Boys'}
          </h2>
          <p className="shrink-0 text-sm text-gray-500">{filtered.length} items</p>
        </div>
        <ProductGrid products={filtered} loading={loading} />
      </div>

      <footer className="mt-6 border-t border-border bg-dark px-4 py-8 text-center text-white/70 sm:mt-8 sm:py-10">
        <p className="text-lg font-bold text-white">
          Niza <span className="text-primary">Shop</span>
        </p>
        <p className="mt-2 text-sm">Pettah wholesale styles · Island-wide delivery</p>
        <p className="mt-1 text-xs">
          Delivery fee: Rs. {offers.deliveryFee.toLocaleString('en-LK')} · Orders via WhatsApp
        </p>
      </footer>
    </div>
  )
}
