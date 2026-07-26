import type { Product, ShopOffers } from '../types'
import { SEED_CATEGORIES } from '../data/seed'
import { useCatalogStore } from '../store/catalogStore'

const CHANNEL = 'niza-shop-catalog-sync'
const LIVE_KEY = 'niza-shop-catalog-live'

let applyingRemote = false

function withCategory(product: Product): Product {
  return {
    ...product,
    category:
      product.category ??
      SEED_CATEGORIES.find((c) => c.id === product.category_id),
  }
}

function applyRemote(payload: { products: Product[]; offers: ShopOffers }) {
  if (!payload?.products || !payload?.offers) return
  applyingRemote = true
  useCatalogStore.setState({
    products: payload.products.map(withCategory),
    offers: payload.offers,
    hydrated: true,
    revision: Date.now(),
  })
  applyingRemote = false
}

/** Push current catalog to other tabs / windows immediately after admin saves. */
export function publishCatalogSnapshot() {
  if (applyingRemote || typeof window === 'undefined') return
  const { products, offers } = useCatalogStore.getState()
  const payload = { products, offers, at: Date.now() }
  try {
    localStorage.setItem(LIVE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota errors (large images)
  }
  try {
    const bc = new BroadcastChannel(CHANNEL)
    bc.postMessage(payload)
    bc.close()
  } catch {
    // BroadcastChannel unsupported
  }
}

/** Call once at app startup so customer pages update the instant admin saves. */
export function startCatalogLiveSync() {
  if (typeof window === 'undefined') return

  try {
    const bc = new BroadcastChannel(CHANNEL)
    bc.onmessage = (ev) => {
      if (ev.data?.products && ev.data?.offers) applyRemote(ev.data)
    }
  } catch {
    // ignore
  }

  window.addEventListener('storage', (e) => {
    if (e.key === LIVE_KEY && e.newValue) {
      try {
        applyRemote(JSON.parse(e.newValue))
      } catch {
        // ignore
      }
      return
    }
    if (e.key === 'niza-shop-catalog' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as {
          state?: { products: Product[]; offers: ShopOffers }
        }
        if (parsed.state?.products && parsed.state?.offers) {
          applyRemote(parsed.state)
        }
      } catch {
        // ignore
      }
    }
  })

  useCatalogStore.subscribe((state, prev) => {
    if (applyingRemote) return
    if (state.products === prev.products && state.offers === prev.offers) return
    publishCatalogSnapshot()
  })
}
