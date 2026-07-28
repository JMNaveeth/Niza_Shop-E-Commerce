import { useMemo, useState } from 'react'
import type { Product } from '../../types'
import ProductCard from './ProductCard'
import {
  filterByPhoneBrand,
  groupProductsByBrand,
  type PhoneBrand,
} from '../../lib/phoneBrands'

interface PhoneCoversCatalogProps {
  products: Product[]
  loading?: boolean
}

export default function PhoneCoversCatalog({
  products,
  loading,
}: PhoneCoversCatalogProps) {
  const [brandId, setBrandId] = useState<string | null>(null)

  const groups = useMemo(() => groupProductsByBrand(products), [products])

  const brandsWithCount = useMemo(
    () =>
      groups.map(({ brand, products: items }) => ({
        brand,
        count: items.length,
      })),
    [groups],
  )

  const visible = useMemo(
    () => filterByPhoneBrand(products, brandId),
    [products, brandId],
  )

  const visibleGroups = useMemo(() => {
    if (brandId) {
      return groupProductsByBrand(visible)
    }
    return groups
  }, [brandId, visible, groups])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-border" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 w-24 shrink-0 animate-pulse rounded-2xl bg-white ring-1 ring-border"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-white ring-1 ring-border"
            />
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl bg-white py-16 text-center ring-1 ring-border sm:rounded-card">
        <p className="text-4xl">📱</p>
        <p className="mt-3 font-semibold text-gray-800">No covers yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Phone back covers will show up here soon.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      {/* Hero strip */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f0f1a] via-[#1a1430] to-[#2a1040] px-4 py-5 text-white shadow-lg sm:rounded-card sm:px-6 sm:py-7">
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 left-1/4 h-36 w-36 rounded-full bg-purple/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
          aria-hidden
        />

        <div className="relative flex items-start gap-3 sm:items-center sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/15 backdrop-blur-sm sm:h-14 sm:w-14 sm:text-3xl">
            📱
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 sm:text-xs">
              Shop by brand
            </p>
            <h3 className="mt-0.5 text-lg font-extrabold leading-tight sm:text-2xl">
              Phone Back Covers
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-white/70 sm:text-sm">
              Pick your phone brand — find the perfect fit fast.
            </p>
          </div>
          <div className="hidden shrink-0 rounded-xl bg-white/10 px-3 py-2 text-center ring-1 ring-white/15 sm:block">
            <p className="text-lg font-black tabular-nums">{products.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
              covers
            </p>
          </div>
        </div>
      </div>

      {/* Brand selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
            Brands
          </p>
          <p className="text-xs font-medium text-gray-400 sm:hidden">
            {products.length} covers
          </p>
        </div>

        <div className="scrollbar-hide -mx-3 flex gap-2.5 overflow-x-auto overscroll-x-contain px-3 pb-1 snap-x-mandatory sm:-mx-0 sm:px-0">
          <BrandChip
            label="All"
            emoji="✨"
            count={products.length}
            active={brandId === null}
            accent="#0f0f1a"
            accentSoft="#f3f4f6"
            onClick={() => setBrandId(null)}
          />
          {brandsWithCount.map(({ brand, count }) => (
            <BrandChip
              key={brand.id}
              label={brand.label}
              emoji={brand.emoji}
              count={count}
              active={brandId === brand.id}
              accent={brand.accent}
              accentSoft={brand.accentSoft}
              onClick={() =>
                setBrandId(brandId === brand.id ? null : brand.id)
              }
            />
          ))}
        </div>
      </div>

      {/* Grouped product sections */}
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center ring-1 ring-border sm:rounded-card">
          <p className="text-3xl">🔍</p>
          <p className="mt-2 font-semibold text-gray-800">No covers for this brand</p>
          <button
            type="button"
            onClick={() => setBrandId(null)}
            className="mt-3 min-h-10 rounded-full bg-dark px-5 text-sm font-bold text-white"
          >
            View all brands
          </button>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {visibleGroups.map(({ brand, products: items }, index) => (
            <BrandGroup
              key={brand.id}
              brand={brand}
              products={items}
              showHeader={!brandId || visibleGroups.length > 1}
              stagger={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function BrandChip({
  label,
  emoji,
  count,
  active,
  accent,
  accentSoft,
  onClick,
}: {
  label: string
  emoji: string
  count: number
  active: boolean
  accent: string
  accentSoft: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="snap-start group relative flex min-w-[5.5rem] shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-3 transition duration-200 touch-target active:scale-[0.97] sm:min-w-[6.25rem] sm:px-4"
      style={
        active
          ? {
              backgroundColor: accentSoft,
              boxShadow: `0 8px 22px -10px ${accent}88, inset 0 0 0 2px ${accent}`,
            }
          : {
              backgroundColor: '#ffffff',
              boxShadow: 'inset 0 0 0 1px #e5e7eb',
            }
      }
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl text-lg transition group-active:scale-95 sm:h-10 sm:w-10 sm:text-xl"
        style={{
          backgroundColor: active ? `${accent}18` : accentSoft,
        }}
      >
        {emoji}
      </span>
      <span
        className={`text-[12px] font-bold leading-none sm:text-[13px] ${
          active ? 'text-gray-900' : 'text-gray-700'
        }`}
      >
        {label}
      </span>
      <span
        className="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
        style={{
          color: active ? accent : '#9ca3af',
          backgroundColor: active ? `${accent}14` : '#f3f4f6',
        }}
      >
        {count}
      </span>
    </button>
  )
}

function BrandGroup({
  brand,
  products,
  showHeader,
  stagger,
}: {
  brand: PhoneBrand
  products: Product[]
  showHeader: boolean
  stagger: number
}) {
  return (
    <section
      className="animate-fade-in scroll-mt-28"
      style={{ animationDelay: `${Math.min(stagger, 4) * 40}ms` }}
      aria-labelledby={`brand-${brand.id}`}
    >
      {showHeader && (
        <div className="mb-3 flex items-center gap-2.5 sm:mb-4">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base sm:h-10 sm:w-10 sm:text-lg"
            style={{ backgroundColor: brand.accentSoft }}
          >
            {brand.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h4
                id={`brand-${brand.id}`}
                className="text-base font-extrabold text-gray-900 sm:text-lg"
              >
                {brand.label}
              </h4>
              <span className="text-xs font-semibold text-gray-400">
                {products.length}{' '}
                {products.length === 1 ? 'model' : 'models'}
              </span>
            </div>
            <div
              className="mt-1.5 h-0.5 w-12 rounded-full sm:w-16"
              style={{ backgroundColor: brand.accent }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
