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
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <HeroSection onShopNow={scrollToCatalog} />

      <div ref={catalogRef} className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <FlashBanner />

        {offers.promoBannerEnabled && offers.promoBannerText.trim() && (
          <div className="rounded-card bg-gold/15 px-4 py-3 text-center text-sm font-semibold text-amber-900 ring-1 ring-gold/30">
            {offers.promoBannerText}
          </div>
        )}

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
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {gender === 'all' ? 'All Products' : gender === 'girls' ? 'Girls' : 'Boys'}
          </h2>
          <p className="text-sm text-gray-500">{filtered.length} items</p>
        </div>
        <ProductGrid products={filtered} loading={loading} />
      </div>

      <footer className="mt-8 border-t border-border bg-dark py-10 text-center text-white/70">
        <p className="text-lg font-bold text-white">
          Niza <span className="text-primary">Shop</span>
        </p>
        <p className="mt-2 text-sm">Pettah wholesale styles · Delivered to Kinniya</p>
        <p className="mt-1 text-xs">
          Delivery fee: Rs. {offers.deliveryFee.toLocaleString('en-LK')} · Orders via WhatsApp
        </p>
      </footer>
    </div>
  )
}
