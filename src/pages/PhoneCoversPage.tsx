import { Link } from 'react-router-dom'
import PhoneCoversCatalog from '../components/Products/PhoneCoversCatalog'
import { useProducts } from '../hooks/useProducts'
import { PHONE_COVERS_CATEGORY_ID } from '../lib/phoneBrands'

export default function PhoneCoversPage() {
  const { products, loading } = useProducts()

  const covers = products.filter(
    (p) => p.category_id === PHONE_COVERS_CATEGORY_ID,
  )

  return (
    <div className="pb-mobile-nav md:pb-0">
      <div className="mx-auto max-w-6xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm ring-1 ring-border transition active:scale-95 active:bg-gray-50 sm:hover:bg-gray-50"
            aria-label="Back to shop"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
              Category
            </p>
            <h1 className="truncate text-lg font-extrabold text-gray-900 sm:text-2xl">
              Phone Back Covers
            </h1>
          </div>
        </div>

        <PhoneCoversCatalog products={covers} loading={loading} />
      </div>
    </div>
  )
}
