import { useEffect, useMemo } from 'react'
import { useCatalogStore } from '../store/catalogStore'
import type { Product } from '../types'

export function useProducts(options?: { includeInactive?: boolean }) {
  const products = useCatalogStore((s) => s.products)
  const revision = useCatalogStore((s) => s.revision)
  const loading = useCatalogStore((s) => s.loading)
  const hydrated = useCatalogStore((s) => s.hydrated)
  const initCatalog = useCatalogStore((s) => s.initCatalog)

  useEffect(() => {
    void initCatalog()
  }, [initCatalog])

  const list = useMemo(() => {
    if (options?.includeInactive === false) {
      return products.filter((p) => p.is_active)
    }
    return products
    // revision forces refresh when admin saves
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, options?.includeInactive, revision])

  const byId = useMemo(() => {
    const map = new Map<string, Product>()
    list.forEach((p) => map.set(p.id, p))
    return map
  }, [list])

  return {
    products: list,
    loading: loading && !hydrated && list.length === 0,
    byId,
    revision,
  }
}

export function useShopOffers() {
  const offers = useCatalogStore((s) => s.offers)
  const updateOffers = useCatalogStore((s) => s.updateOffers)
  const resetOffers = useCatalogStore((s) => s.resetOffers)
  return { offers, updateOffers, resetOffers }
}
